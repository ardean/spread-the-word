import Server from "../src/Server";
import Service from "../src/Service";
import Listener from "../src/Listener";
import Transport from "../src/transports/Transport";
import LocalTransport from "../src/transports/LocalTransport";

const type = "jsremote";
const name = "remote receiver";
const port = 4444;

describe("Listener", () => {
  let transport: Transport;
  let server: Server;
  let service: Service;
  let listener: Listener;

  describe("new Listener({ type }).listen()", () => {
    beforeEach(async () => {
      transport = new LocalTransport({
        referrerOptions: { address: "192.168.1.51" },
        addresses: [{ family: "IPv4", address: "192.168.1.55" }]
      });
      server = new Server({ transport });
      service = new Service(server, { type, name, port });
      listener = new Listener(server, { type });
    });

    afterEach(async () => {
      await service.destroy();
      await listener.destroy();
      await server.destroy();
    });

    it("emits up event for matching service type", async () => {
      const upDetector = new Promise<void>(resolve => {
        listener.on("up", function onUp(remoteService) {
          if (remoteService.name === name) {
            listener.removeListener("up", onUp);
            resolve();
          }
        });
      });
      await listener.listen();
      await service.spread();
      await upDetector;
    });

    it("emits down event for matching service type", async () => {
      const downDetector = new Promise<void>(resolve => {
        listener.on("down", function onDown(remoteService) {
          if (remoteService.name === name) {
            listener.removeListener("down", onDown);
            resolve();
          }
        });
      });
      await listener.listen();
      await service.spread();
      await service.destroy();
      await downDetector;
    });

    it("removes SRV record", async () => {
      const upDetector = new Promise<void>(resolve => {
        listener.on("up", function onUp(remoteService) {
          if (remoteService.name !== name) return;
          listener.removeListener("up", onUp);
          setTimeout(() => resolve(), 200);
        });
      });

      const downDetector = new Promise<void>(resolve => {
        listener.on("down", function onDown(remoteService) {
          if (remoteService.name !== name) return;
          listener.removeListener("down", onDown);
          setTimeout(() => resolve(), 200);
        });
      });

      await listener.listen();

      await service.spread();
      await upDetector;

      await service.destroy();
      await downDetector;
    });
  });
});