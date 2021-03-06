/// <reference types="node" />
import Server from "./Server";
import SRV from "./records/SRV";
import TXT from "./records/TXT";
import Response from "./Response";
import Referrer from "./Referrer";
import { EventEmitter } from "events";
import RemoteService from "./RemoteService";
import AddressRecord from "./records/AddressRecord";
export interface ListenerOptions {
    name?: string;
    type?: string;
    protocol?: string;
    subtypes?: string[];
}
interface Listener {
    on(event: "up", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    on(event: "down", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    on(event: "destroy", callback: () => void): this;
    once(event: "up", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    once(event: "down", callback: (remoteService: RemoteService, response: Response, referrer: Referrer) => void): this;
    once(event: "destroy", callback: () => void): this;
}
declare class Listener extends EventEmitter {
    server: Server;
    remoteServices: RemoteService[];
    typeName: string;
    wildcard: boolean;
    requeryDelay: NodeJS.Timer;
    constructor(server: Server, options?: ListenerOptions);
    listen(): Promise<void>;
    query(): Promise<void>;
    requery(delay?: number): Promise<void>;
    onResponse: (res: Response, referrer: Referrer) => Promise<void>;
    destroy(): void;
    addRemoteService(record: SRV, txtRecord: TXT, addressRecords: AddressRecord[], res: Response, referrer: Referrer): void;
    removeRemoteService(name: string, res: Response, referrer: Referrer): void;
    queryUnresolvedRecords(): Promise<void>;
}
export default Listener;
