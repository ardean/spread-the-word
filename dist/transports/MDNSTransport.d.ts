/// <reference types="node" />
import Query from "../Query";
import Response from "../Response";
import { EventEmitter } from "events";
import Transport, { TransportOptions } from "./Transport";
export default class MDNSTransport extends EventEmitter implements Transport {
    options: TransportOptions;
    destroyed: boolean;
    mdns: any;
    constructor(options?: TransportOptions);
    query(query: Query): Promise<void>;
    respond(res: Response): Promise<void>;
    destroy(): Promise<void>;
    getAddresses(): Array<{
        family: string;
        address: string;
    }>;
}
