/// <reference types="node" />
import { EventEmitter } from "events";
import Listener from "./Listener";
import Server from "./ProductionServer";
import Service from "./Service";
import { ServerOptions } from "./Server";
export default class SpreadTheWord extends EventEmitter {
    server: Server;
    services: Service[];
    listener: Listener;
    status: string;
    init(options?: ServerOptions): void;
    spread(options: any): Promise<Service>;
    listen(options?: any): Promise<Listener>;
}
