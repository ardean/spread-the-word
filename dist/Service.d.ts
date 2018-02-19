/// <reference types="node" />
import { EventEmitter } from "events";
import Record from "./Records/Record";
import * as MDNSUtils from "./MDNSUtils";
import Server from "./Server";
import Response from "./Response";
export interface ServiceOptions {
    name: string;
    type: string;
    port: number;
    protocol?: string;
    subtypes?: string[];
    txt?: MDNSUtils.TXTData;
    hostname?: string;
}
export default class Service extends EventEmitter {
    type: string;
    name: string;
    server: Server;
    dnsName: string;
    dnsType: string;
    protocol: string;
    hostname: string;
    port: number;
    txt: MDNSUtils.TXTData;
    rawTxt: string;
    subtypes: string[];
    spreaded: boolean;
    destroyed: boolean;
    constructor(server: Server, options: ServiceOptions);
    spread(options?: {
        probe?: boolean;
    }): Promise<void>;
    getServiceRecords(): Record[];
    getAddressRecords(): Record[];
    broadcast(res: Response, delay: number): Promise<void>;
    hide(): Promise<void>;
    sendGoodbye(): Promise<void>;
    destroy(): Promise<void>;
}
