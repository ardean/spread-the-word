/// <reference types="node" />
import Record from "./Records/Record";
import PTR from "./Records/PTR";
import TXT from "./Records/TXT";
import SRV from "./Records/SRV";
import AAAA from "./Records/AAAA";
import A from "./Records/A";
export interface MDNSNameOptions {
    name?: string;
    subtypes?: string[];
    type?: string;
    protocol?: string;
    domain?: string;
}
export declare function stringifyDNSName(options: MDNSNameOptions): string;
export declare function parseDNSName(dnsName: string): MDNSNameOptions;
export declare function sameRecord(a: Record, b: Record): boolean;
export declare function getExternalAddresses(): {
    family: string;
    address: string;
}[];
export declare function parseRecord(record: any, options?: {
    binaryTXT?: boolean;
}): PTR | TXT | SRV | AAAA | A;
export declare function serializeRecord(record: any, options?: {
    binaryTXT?: boolean;
}): PTR | TXT | SRV | AAAA | A;
export interface TXTData {
    [key: string]: string | Buffer;
}
export declare function parseTXTData(data: Buffer, options?: {
    binary?: boolean;
}): TXTData;
export declare function serializeTXTData(data: TXTData, options?: {
    binary?: boolean;
}): Buffer;
