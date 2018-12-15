/// <reference types="node" />
import A from "./records/A";
import TXT from "./records/TXT";
import SRV from "./records/SRV";
import PTR from "./records/PTR";
import AAAA from "./records/AAAA";
import Record from "./records/Record";
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
}): A | TXT | SRV | PTR | AAAA;
export declare function serializeRecord(record: any, options?: {
    binaryTXT?: boolean;
}): A | TXT | SRV | PTR | AAAA;
export interface TXTData {
    [key: string]: string | Buffer;
}
export declare function parseTXTData(data: Buffer, options?: {
    binary?: boolean;
}): TXTData;
export declare function serializeTXTData(data: TXTData, options?: {
    binary?: boolean;
}): Buffer;
