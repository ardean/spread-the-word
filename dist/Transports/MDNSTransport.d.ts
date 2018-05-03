/// <reference types="node" />
import Transport, { TransportOptions } from "./Transport";
import Query from "../Query";
import Response from "../Response";
import { EventEmitter } from "events";
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
