import Referrer from "./Referrer";
import Response from "./Response";
import { EventEmitter } from "events";
import RemoteService from "./RemoteService";
import Server, { ServerOptions } from "./Server";
import Service, { ServiceOptions } from "./Service";
import Listener, { ListenerOptions } from "./Listener";

export type StatusType = "uninitialized" | "spreaded" | "destroyed";

export default class SpreadTheWord extends EventEmitter {
  server: Server;
  services: Service[] = [];
  status: StatusType = "uninitialized";

  init(options?: ServerOptions) {
    if (this.status !== "uninitialized") return;

    this.status = "spreaded";
    this.server = new Server(options);
  }

  async spread(options: ServiceOptions, serverOptions?: ServerOptions) {
    if (this.status === "destroyed") return;

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
    if (this.status === "destroyed") return;

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
    if (this.status === "destroyed") return;
    this.status = "destroyed";

    for (const service of this.services) {
      await service.destroy();
    }

    if (this.server) await this.server.destroy();

    this.emit("destroy");
  }
}
