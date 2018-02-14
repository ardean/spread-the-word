import Query from "./Query";
import Response from "./Response";
import Record from "./Records/Record";
import RecordRegistry from "./RecordRegistry";
import { EventEmitter } from "events";

export interface ServerOptions {
  recordRegistry?: RecordRegistry;
  socketOptions?: any;
}

export default interface Server extends EventEmitter {
  recordRegistry: RecordRegistry;

  query(query: Query): Promise<void>;
  queryAndListen(query: Query): Promise<Response | void>;
  respond(res: Response): Promise<void>;
  destroy(): Promise<void>;
}