/// <reference types="node" />
import A from "./record/A";
import TXT from "./record/TXT";
import SRV from "./record/SRV";
import PTR from "./record/PTR";
import AAAA from "./record/AAAA";
import Record from "./record/Record";
export interface MDNSNameOptions {
    name?: string;
    subtypes?: string[];
    type?: string;
    protocol?: string;
    domain?: string;
}
export declare function serializeDNSName(options: MDNSNameOptions): string;
export declare function parseDNSName(dnsName: string): MDNSNameOptions;
export declare function sameRecord(a: Record, b: Record): boolean;
export declare function getExternalAddresses(): {
    family: string;
    address: string;
}[];
export declare function parseRecord(record: any, options?: {
    binaryTXT?: boolean;
}): A | SRV | PTR | AAAA | TXT;
export declare function serializeRecord(record: any, options?: {
    binaryTXT?: boolean;
}): A | SRV | PTR | AAAA | TXT;
export interface TXTData {
    [key: string]: string | Buffer;
}
export declare function parseTXTData(data: Buffer, options?: {
    binary?: boolean;
}): TXTData;
export declare function serializeTXTData(data: TXTData, options?: {
    binary?: boolean;
}): Buffer;
