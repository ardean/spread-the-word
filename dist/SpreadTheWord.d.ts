/// <reference types="node" />
import { EventEmitter } from "events";
import Listener, { ListenerOptions } from "./Listener";
import Server, { ServerOptions } from "./Server";
import Service, { ServiceOptions } from "./Service";
export default class SpreadTheWord extends EventEmitter {
    server: Server;
    services: Service[];
    status: string;
    init(options?: ServerOptions): void;
    spread(options: ServiceOptions, serverOptions?: ServerOptions): Promise<Service>;
    listen(options?: ListenerOptions, serverOptions?: ServerOptions): Promise<Listener>;
    destroy(): Promise<void>;
}
