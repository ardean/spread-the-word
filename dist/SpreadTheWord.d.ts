/// <reference types="node" />
import { EventEmitter } from "events";
import Server, { ServerOptions } from "./Server";
import Service, { ServiceOptions } from "./Service";
import Listener, { ListenerOptions } from "./Listener";
export declare type StatusType = "uninitialized" | "spreaded" | "destroyed";
export default class SpreadTheWord extends EventEmitter {
    server: Server;
    services: Service[];
    status: StatusType;
    init(options?: ServerOptions): void;
    spread(options: ServiceOptions, serverOptions?: ServerOptions): Promise<Service>;
    listen(options?: ListenerOptions, serverOptions?: ServerOptions): Promise<Listener>;
    destroy(): Promise<void>;
}
