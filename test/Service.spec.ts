import { assert } from "chai";
import Server from "../src/Server";
import Listener from "../src/Listener";
import Service from "../src/Service";
import * as MDNSUtils from "../src/MDNSUtils";
import Response from "../src/Response";
import Transport from "../src/Transports/Transport";
import LocalTransport from "../src/Transports/LocalTransport";
import { TOP_LEVEL_DOMAIN, WILDCARD } from "../src/Constants";

const type = "jsremote";
const name = "remote receiver";
const port = 4444;
const dnsType = MDNSUtils.serializeDNSName({ type, protocol: "tcp", domain: TOP_LEVEL_DOMAIN });
const dnsName = MDNSUtils.serializeDNSName({ name, type, protocol: "tcp", domain: TOP_LEVEL_DOMAIN });

describe("Service", () => {
  let transport: Transport;
  let server: Server;
  let service: Service;

  describe("new Service(server, { type, name, port }).spread()", () => {
    beforeEach(async () => {
      transport = new LocalTransport({
        referrerOptions: { address: "192.168.1.51" },
        addresses: [{ family: "IPv4", address: "192.168.1.55" }]
      });
      server = new Server({ transport });
      service = new Service(server, { type, name, port });
    });

    afterEach(async () => {
      await service.destroy();
      await server.destroy();
    });

    it("sends goodbye on hide", async () => {
      const goodbyeDetector = new Promise(resolve => {
        server.on("response", function onResponse(res: Response) {
          let goodbyeFound = false;
          for (const record of res.answers) {
            if (record.ttl === 0) {
              goodbyeFound = true;
            }
          }

          if (goodbyeFound) {
            server.removeListener("response", onResponse);
            resolve();
          }
        });
      });

      await service.spread();
      await service.hide();
      await goodbyeDetector;
    });

    it("responds multicast dns records", async () => {
      let wildcardFound = false;
      let dnsTypeFound = false;
      let serviceFound = false;
      let txtFound = false;

      const responseDetector = new Promise(resolve => {
        server.on("response", function onResponse(res: Response) {
          for (const record of res.answers) {
            if (record.type === "PTR" && record.name === WILDCARD && record.data === dnsType) wildcardFound = true;
            if (record.type === "PTR" && record.name === dnsType && record.data === dnsName) dnsTypeFound = true;
            if (record.type === "SRV" && record.name === dnsName) serviceFound = true;
            if (record.type === "TXT" && record.name === dnsName) txtFound = true;
          }

          if (wildcardFound && dnsTypeFound && serviceFound && txtFound) {
            server.removeListener("response", onResponse);
            resolve();
          }
        });
      });
      await service.spread();
      await responseDetector;

      assert.isTrue(wildcardFound, "wildcard found");
      assert.isTrue(dnsTypeFound, "dns type found");
      assert.isTrue(serviceFound, "service found");
      assert.isTrue(txtFound, "txt found");
    });

    describe("when service already exists", () => {
      it("should throw", async () => {
        await service.spread();

        let didThrow = false;

        try {
          await new Service(server, { type, name, port }).spread();
        } catch (err) {
          didThrow = true;
        }

        assert.isTrue(didThrow);
      });
    });
  });
});