/// <reference types="node" />
import RemoteService from "./RemoteService";
import { EventEmitter } from "events";
import SRV from "./Records/SRV";
import Server from "./Server";
import AddressRecord from "./Records/AddressRecord";
import Response from "./Response";
import Referrer from "./Referrer";
import TXT from "./Records/TXT";
export interface ListenerOptions {
    name?: string;
    type?: string;
    protocol?: string;
    subtypes?: string[];
}
export default class Listener extends EventEmitter {
    server: Server;
    remoteServices: RemoteService[];
    typeName: string;
    wildcard: boolean;
    constructor(server: Server, options?: ListenerOptions);
    listen(): Promise<void>;
    onResponse(res: Response, referrer: Referrer): void;
    destroy(): void;
    addRemoteService(record: SRV, txtRecord: TXT, addressRecords: AddressRecord[], res: Response, referrer: Referrer): void;
    removeRemoteService(name: string, res: Response, referrer: Referrer): void;
}
