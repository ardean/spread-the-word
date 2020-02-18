/// <reference types="node" />
import Query from "./Query";
import Service from "./Service";
import Referrer from "./Referrer";
import Response from "./Response";
import { EventEmitter } from "events";
import RecordRegistry from "./RecordRegistry";
import Transport, { TransportOptions } from "./transports/Transport";
export interface ServerOptions {
    transportOptions?: TransportOptions;
    transport?: Transport;
    recordRegistry?: RecordRegistry;
    socketOptions?: any;
}
interface Server {
    on(event: 'response', callback: (response: Response, referrer: Referrer) => void): this;
    on(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
    on(event: 'destroy', callback: () => void): this;
    once(event: 'response', callback: (response: Response, referrer: Referrer) => void): this;
    once(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
    once(event: 'destroy', callback: () => void): this;
}
declare class Server extends EventEmitter {
    transportOptions: TransportOptions;
    services: Service[];
    transport: Transport;
    recordRegistry: RecordRegistry;
    destroyed: boolean;
    constructor(options?: ServerOptions);
    queryAndListen(query: Query): Promise<Response>;
    answerQuery(query: Query, referrer: Referrer): Promise<void>;
    destroy(): Promise<void>;
    addService(service: Service): void;
    removeService(service: Service): void;
}
export default Server;
