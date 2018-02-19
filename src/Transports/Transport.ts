import { EventEmitter } from "events";
import Response from "../Response";
import Query from "../Query";

export interface TransportOptions {
  binaryTXT?: boolean;
}

export default interface Transport extends EventEmitter {
  query(query: Query): Promise<void>;
  respond(res: Response): Promise<void>;
  destroy(): Promise<void>;
  getAddresses();
  ownAddress(address: string): boolean;
}