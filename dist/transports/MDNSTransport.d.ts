/// <reference types="node" />
import Query from "../Query";
import Referrer from "../Referrer";
import Response from "../Response";
import { EventEmitter } from "events";
import Transport, { TransportOptions } from "./Transport";
interface MDNSTransport {
    on(event: "query", callback: (query: Query, referrer: Referrer) => void): this;
    on(event: "response", callback: (response: any, referrer: Referrer) => void): this;
    once(event: "query", callback: (query: Query, referrer: Referrer) => void): this;
    once(event: "response", callback: (response: any, referrer: Referrer) => void): this;
}
declare class MDNSTransport extends EventEmitter implements Transport {
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
export default MDNSTransport;
