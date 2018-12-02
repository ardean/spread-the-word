import { assert } from "chai";
import Query from "../src/Query";
import Server from "../src/Server";
import PTR from "../src/records/PTR";
import Service from "../src/Service";
import Referrer from "../src/Referrer";
import Response from "../src/Response";
import * as MDNSUtils from "../src/MDNSUtils";
import Transport from "../src/transports/Transport";
import { TOP_LEVEL_DOMAIN } from "../src/Constants";
import LocalTransport from "../src/transports/LocalTransport";

const type = "jsremote";
const name = "remote receiver";
const port = 4444;
const ownAddress = "192.168.1.51";
const otherAddress = "192.168.1.55";
const dnsType = MDNSUtils.serializeDNSName({ type, protocol: "tcp", domain: TOP_LEVEL_DOMAIN });
const dnsName = MDNSUtils.serializeDNSName({ name, type, protocol: "tcp", domain: TOP_LEVEL_DOMAIN });

describe("Server", () => {
  describe(`server.on("respond", fn)`, () => {
    let transport: Transport;
    let server: Server;

    beforeEach(async () => {
      transport = new LocalTransport({
        referrerOptions: { address: ownAddress },
        addresses: [{ family: "IPv4", address: ownAddress }]
      });
      server = new Server({ transport });
    });

    afterEach(async () => {
      await server.destroy();
    });

    it("accepts responses", async () => {
      let foundResponse = false;

      function onResponse(res: Response, referrer: Referrer) {
        foundResponse = true;
      }

      server.on("response", onResponse);

      transport.respond(new Response({ answers: [new PTR({ name: dnsType, data: dnsName })] }));

      await new Promise(resolve => setTimeout(() => resolve(), 1000));

      server.removeListener("response", onResponse);

      assert.isTrue(foundResponse);
    });
  });

  describe(`server.on("query", fn)`, () => {
    let transport: Transport;
    let server: Server;

    beforeEach(async () => {
      transport = new LocalTransport({
        referrerOptions: { address: ownAddress },
        addresses: [{ family: "IPv4", address: ownAddress }]
      });
      server = new Server({ transport });
    });

    afterEach(async () => {
      await server.destroy();
    });

    it("accepts queries", async () => {
      let foundQuery = false;

      function onQuery(query: Query, referrer: Referrer) {
        foundQuery = true;
      }

      server.on("query", onQuery);

      transport.query(new Query({ questions: [{ name: "own", type: "jsremote" }] }));

      await new Promise(resolve => setTimeout(() => resolve(), 500));

      server.removeListener("query", onQuery);

      assert.isTrue(foundQuery);
    });
  });

  describe("server.answerQuery(query, referrer)", () => {
    let transport: Transport;
    let server: Server;

    beforeEach(async () => {
      transport = new LocalTransport({
        referrerOptions: { address: ownAddress },
        addresses: [{ family: "IPv4", address: otherAddress }]
      });
      server = new Server({ transport });
    });

    afterEach(async () => {
      await server.destroy();
    });

    it("answers regarding own services", async () => {
      let answered = false;

      const service = new Service(server, {
        name,
        type,
        port
      });

      await service.spread();

      function onResponse(res: Response, referrer: Referrer) {
        if (res.answers.find(x => x.name === dnsName)) answered = true;
      }

      server.on("response", onResponse);

      await server.answerQuery(
        new Query({ questions: [{ name: dnsName, type: "ANY" }] }),
        new Referrer({ address: otherAddress })
      );

      await new Promise(resolve => setTimeout(() => resolve(), 500));

      server.removeListener("response", onResponse);

      assert.isTrue(answered, "does answer");
    });

    it("does not answer regarding other services", async () => {
      let answered = false;

      const otherName = "other remote receiver";
      const otherDnsName = MDNSUtils.serializeDNSName({ name: otherName, type, protocol: "tcp", domain: TOP_LEVEL_DOMAIN });

      function onResponse(res: Response, referrer: Referrer) {
        if (res.answers.find(x => x.name === otherDnsName)) answered = true;
      }

      server.on("response", onResponse);

      await server.answerQuery(
        new Query({ questions: [{ name: otherDnsName, type: "ANY" }] }),
        new Referrer({ address: otherAddress })
      );

      await new Promise(resolve => setTimeout(() => resolve(), 500));

      server.removeListener("response", onResponse);

      assert.isFalse(answered, "does not answer");
    });
  });
});