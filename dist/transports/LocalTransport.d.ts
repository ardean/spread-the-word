/// <reference types="node" />
import Query from "../Query";
import Response from "../Response";
import { EventEmitter } from "events";
import Referrer, { ReferrerOptions } from "../Referrer";
import Transport, { TransportOptions } from "./Transport";
export interface LocalTransportOptions extends TransportOptions {
    referrerOptions: ReferrerOptions;
    addresses: Array<{
        family: string;
        address: string;
    }>;
}
interface LocalTransport {
    on(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
    on(event: 'response', callback: (response: any, referrer: Referrer) => void): this;
    on(event: 'localQuery', callback: (packet: any, referrerObj: any) => void): this;
    on(event: 'localResponse', callback: (packet: any, referrerObj: any) => void): this;
    on(event: 'destroy', callback: () => void): this;
    once(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
    once(event: 'response', callback: (response: any, referrer: Referrer) => void): this;
    once(event: 'localQuery', callback: (packet: any, referrerObj: any) => void): this;
    once(event: 'localResponse', callback: (packet: any, referrerObj: any) => void): this;
    once(event: 'destroy', callback: () => void): this;
}
declare class LocalTransport extends EventEmitter implements Transport {
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
}
export default LocalTransport;
