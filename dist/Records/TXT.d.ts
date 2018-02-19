/// <reference types="node" />
import Record from "./Record";
import { TXTData } from "../MDNSUtils";
export default class TXT extends Record {
    name: string;
    data: TXTData | Buffer;
    constructor({name, data, ttl}: {
        name: string;
        data: TXTData | Buffer;
        ttl?: number;
    });
    static parse(record: any, options?: {
        binary?: boolean;
    }): default;
    static serialize(record: any, options?: {
        binary?: boolean;
    }): default;
}
