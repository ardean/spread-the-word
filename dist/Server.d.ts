/// <reference types="node" />
import { EventEmitter } from "events";
import RecordRegistry from "./RecordRegistry";
import Service from "./Service";
import Response from "./Response";
import Query from "./Query";
import { ServerOptions } from "./Server";
import Transport, { TransportOptions } from "./Transports/Transport";
import Referrer from "./Referrer";
export interface ServerOptions {
    transportOptions?: TransportOptions;
    transport?: Transport;
    recordRegistry?: RecordRegistry;
    socketOptions?: any;
}
export default class Server extends EventEmitter {
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
