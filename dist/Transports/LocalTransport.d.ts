/// <reference types="node" />
import Transport, { TransportOptions } from "./Transport";
import { EventEmitter } from "events";
import Query from "../Query";
import Response from "../Response";
import Referrer, { ReferrerOptions } from "../Referrer";
export interface LocalTransportOptions extends TransportOptions {
    referrerOptions: ReferrerOptions;
    addresses: Array<{
        family: string;
        address: string;
    }>;
}
export default class LocalTransport extends EventEmitter implements Transport {
    options: LocalTransportOptions;
    addresses: Array<{
        family: string;
        address: string;
    }>;
    destroyed: boolean;
    referrer: Referrer;
    constructor(options: LocalTransportOptions);
    query(query: Query): Promise<void>;
    respond(res: Response): Promise<void>;
    destroy(): Promise<void>;
    getAddresses(): Array<{
        family: string;
        address: string;
    }>;
    ownAddress(address: string): boolean;
}
