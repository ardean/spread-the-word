/// <reference types="node" />
import Server from "./Server";
import SRV from "./record/SRV";
import TXT from "./record/TXT";
import Response from "./Response";
import Referrer from "./Referrer";
import { EventEmitter } from "events";
import RemoteService from "./RemoteService";
import AddressRecord from "./record/AddressRecord";
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
    onResponse: (res: Response, referrer: Referrer) => void;
    destroy(): void;
    addRemoteService(record: SRV, txtRecord: TXT, addressRecords: AddressRecord[], res: Response, referrer: Referrer): void;
    removeRemoteService(name: string, res: Response, referrer: Referrer): void;
}
