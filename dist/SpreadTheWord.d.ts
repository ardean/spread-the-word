/// <reference types="node" />
import Referrer from "./Referrer";
import Response from "./Response";
import { EventEmitter } from "events";
import RemoteService from "./RemoteService";
import Server, { ServerOptions } from "./Server";
import Service, { ServiceOptions } from "./Service";
import Listener, { ListenerOptions } from "./Listener";
export declare type StatusType = "uninitialized" | "spreaded" | "destroyed";
interface SpreadTheWord {
    on(event: 'up', callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    on(event: 'down', callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    on(event: 'destroy', callback: () => void): this;
    once(event: 'up', callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    once(event: 'down', callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    once(event: 'destroy', callback: () => void): this;
}
declare class SpreadTheWord extends EventEmitter {
    server: Server;
    servicesList: Service[];
    listenersList: Listener[];
    status: StatusType;
    init(options?: ServerOptions): void;
    spread(options: ServiceOptions, serverOptions?: ServerOptions): Promise<Service>;
    listen(options?: ListenerOptions, serverOptions?: ServerOptions): Promise<Listener>;
    destroy(): Promise<void>;
}
export default SpreadTheWord;
