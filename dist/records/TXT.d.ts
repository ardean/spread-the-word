/// <reference types="node" />
import Record from "./Record";
import { TXTData } from "../MDNSUtils";
declare type DataType = TXTData | Buffer | string;
export default class TXT extends Record {
    name: string;
    data: DataType;
    constructor({ name, data, ttl }: {
        name: string;
        data: DataType;
        ttl?: number;
    });
    static parse(record: any, options?: {
        binary?: boolean;
    }): TXT;
    static serialize(record: any, options?: {
        binary?: boolean;
    }): TXT;
}
export {};
