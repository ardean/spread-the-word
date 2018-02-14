import { assert } from "chai";
import DebugServer from "../src/DebugServer";
import Service from "../src/Service";
import Listener from "../src/Listener";

const type = "jsremote";
const name = "my test remote receiver";
const port = 4444;

describe("Listener", () => {
  let server: DebugServer;
  let service: Service;
  let listener: Listener;

  describe("new Listener({ type }).listen()", () => {
    beforeEach(async () => {
      server = new DebugServer({}, { referrerOptions: { address: "192.168.1.51" } });
      service = new Service(server, { type, name, port });
      listener = new Listener(server, { type });

      await listener.listen();
    });

    afterEach(async () => {
      await service.destroy();
      await listener.destroy();
      await server.destroy();
    });

    it("emits up event for matching service type", async () => {
      const upDetector = new Promise(resolve => {
        listener.on("up", function onUp(remoteService) {
          if (remoteService.name !== name) return;
          listener.removeListener("up", onUp);
          setTimeout(() => resolve(), 200);
        });
      });
      await service.spread();
      await upDetector;
    });

    it("emits down event for matching service type", async () => {
      const downDetector = new Promise(resolve => {
        listener.on("down", function onDown(remoteService) {
          if (remoteService.name !== name) return;
          listener.removeListener("down", onDown);
          setTimeout(() => resolve(), 200);
        });
      });
      await service.spread();
      await service.destroy();
      await downDetector;
    });

    it("removes SRV record", async () => {
      const upDetector = new Promise(resolve => {
        listener.on("up", function onUp(remoteService) {
          if (remoteService.name !== name) return;
          listener.removeListener("up", onUp);
          setTimeout(() => resolve(), 200);
        });
      });

      const downDetector = new Promise(resolve => {
        listener.on("down", function onDown(remoteService) {
          if (remoteService.name !== name) return;
          listener.removeListener("down", onDown);
          setTimeout(() => resolve(), 200);
        });
      });

      await service.spread();
      await upDetector;

      await service.destroy();
      await downDetector;
    });
  });
});