import { EventEmitter } from "events";
import Listener, { ListenerOptions } from "./Listener";
import Server, { ServerOptions } from "./Server";
import Service, { ServiceOptions } from "./Service";
import RemoteService from "./RemoteService";
import Response from "./Response";
import Referrer from "./Referrer";

export default class SpreadTheWord extends EventEmitter {
  server: Server;
  services: Service[] = [];
  status: string = "Uninitialized";

  init(options?: ServerOptions) {
    if (this.status !== "Uninitialized") return;

    this.status = "Spreaded";
    this.server = new Server(options);
  }

  async spread(options: ServiceOptions, serverOptions?: ServerOptions) {
    if (this.status === "Destroyed") return;

    this.init(serverOptions);

    const service = new Service(this.server, options);
    service.once("destroy", () => {
      this.services.splice(this.services.indexOf(service), 1);
    });
    await service.spread();

    this.services.push(service);

    return service;
  }

  async listen(options?: ListenerOptions, serverOptions?: ServerOptions) {
    if (this.status === "Destroyed") return;

    this.init(serverOptions);

    const listener = new Listener(this.server, options);
    listener
      .on("up", (remoteService: RemoteService, res: Response, referrer: Referrer) =>
        this.emit("up", remoteService, res, referrer)
      )
      .on("down", (remoteService: RemoteService, res: Response, referrer: Referrer) =>
        this.emit("down", remoteService, res, referrer)
      );

    await listener.listen();

    return listener;
  }

  async destroy() {
    if (this.status === "Destroyed") return;
    this.status = "Destroyed";

    for (const service of this.services) {
      await service.destroy();
    }

    if (this.server) await this.server.destroy();

    this.emit("destroy");
  }
}
