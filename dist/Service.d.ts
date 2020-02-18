/// <reference types="node" />
import Server from "./Server";
import Response from "./Response";
import { EventEmitter } from "events";
import Record from "./records/Record";
import * as MDNSUtil from "./MDNSUtil";
export interface ServiceOptions {
    name: string;
    type: string;
    port: number;
    protocol?: string;
    subtypes?: string[];
    txt?: MDNSUtil.TXTData;
    hostname?: string;
}
interface Service {
    on(event: 'destroy', callback: () => void): this;
    once(event: 'destroy', callback: () => void): this;
}
declare class Service extends EventEmitter {
    type: string;
    name: string;
    server: Server;
    dnsName: string;
    dnsType: string;
    protocol: string;
    hostname: string;
    port: number;
    txt: MDNSUtil.TXTData;
    rawTxt: string;
    subtypes: string[];
    spreaded: boolean;
    destroyed: boolean;
    broadcastDelay: NodeJS.Timer;
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
export default Service;
