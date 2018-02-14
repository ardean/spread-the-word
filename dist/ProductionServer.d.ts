/// <reference types="node" />
import { EventEmitter } from "events";
import RecordRegistry from "./RecordRegistry";
import Response from "./Response";
import Query from "./Query";
import Server, { ServerOptions } from "./Server";
import Referrer from "./Referrer";
export default class ProductionServer extends EventEmitter implements Server {
    recordRegistry: RecordRegistry;
    destroyed: boolean;
    mdns: any;
    constructor(options?: ServerOptions);
    query(query: Query): Promise<void>;
    queryAndListen(query: Query): Promise<Response>;
    respond(res: Response): Promise<void>;
    answerQuery(query: Query, referrer: Referrer): Promise<void>;
    destroy(): Promise<void>;
}
