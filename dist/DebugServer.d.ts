/// <reference types="node" />
import { EventEmitter } from "events";
import RecordRegistry from "./RecordRegistry";
import Server, { ServerOptions } from "./Server";
import Query from "./Query";
import { ReferrerOptions } from "./Referrer";
import Response from "./Response";
export interface DebugServerOptions {
    referrerOptions: ReferrerOptions;
}
export default class DebugServer extends EventEmitter implements Server {
    debugOptions: DebugServerOptions;
    recordRegistry: RecordRegistry;
    destroyed: boolean;
    constructor(options: ServerOptions, debugOptions: DebugServerOptions);
    query(query: Query): Promise<void>;
    queryAndListen(query: Query): Promise<Response>;
    respond(res: Response): Promise<void>;
    destroy(): Promise<void>;
}
