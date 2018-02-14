/// <reference types="node" />
import RemoteService from "./RemoteService";
import { EventEmitter } from "events";
import SRV from "./Records/SRV";
import Server from "./Server";
import AddressRecord from "./Records/AddressRecord";
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
    onResponse(): void;
    destroy(): void;
    addRemoteService(record: SRV, addressRecords: AddressRecord[]): void;
    removeRemoteService(name: string): void;
}
