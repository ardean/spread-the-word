import Referrer from "./Referrer";
import Response from "./Response";
import { EventEmitter } from "events";
import RemoteService from "./RemoteService";
import Server, { ServerOptions } from "./Server";
import Service, { ServiceOptions } from "./Service";
import Listener, { ListenerOptions } from "./Listener";

export type StatusType = "uninitialized" | "spreaded" | "destroyed";

interface SpreadTheWord {
  on(event: "up", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
  on(event: "down", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
  on(event: "destroy", callback: () => void): this;
  once(event: "up", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
  once(event: "down", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
  once(event: "destroy", callback: () => void): this;
}

class SpreadTheWord extends EventEmitter {
  server: Server;
  servicesList: Service[] = [];
  listenersList: Listener[] = [];
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
      this.servicesList.splice(this.servicesList.indexOf(service), 1);
    });
    await service.spread();

    this.servicesList.push(service);

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
      )
      .once("destroy", () => {
        this.listenersList.splice(this.listenersList.indexOf(listener), 1);
      });

    await listener.listen();

    this.listenersList.push(listener);

    return listener;
  }

  async destroy() {
    if (this.status === "destroyed") return;
    this.status = "destroyed";

    for (const service of this.servicesList) {
      await service.destroy();
    }

    for (const listener of this.listenersList) {
      await listener.destroy();
    }

    if (this.server) await this.server.destroy();

    this.emit("destroy");
  }
}

export default SpreadTheWord;