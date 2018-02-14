import { EventEmitter } from "events";
import Listener from "./Listener";
import Server from "./ProductionServer";
import Service from "./Service";
import { ServerOptions } from "./Server";

export default class SpreadTheWord extends EventEmitter {
  server: Server;
  services: Service[] = [];
  listener: Listener;
  status: string = "Stopped";

  init(options?: ServerOptions) {
    if (this.status !== "Stopped") return;
    this.status = "Started";
    this.server = new Server(options);
  }

  async spread(options) {
    this.init();

    const service = new Service(this.server, options);
    service.once("destroy", () => {
      this.services.splice(this.services.indexOf(service), 1);
    });
    await service.spread();

    this.services.push(service);
    return service;
  }

  async listen(options?) {
    this.init();
    this.listener = new Listener(this.server, options);
    this.listener
      .on("up", service => {
        this.emit("up", service);
      })
      .on("down", service => {
        this.emit("down", service);
      });
    await this.listener.listen();
  }
}
