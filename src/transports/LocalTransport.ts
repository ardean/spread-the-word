import Query from "../Query";
import Response from "../Response";
import { EventEmitter } from "events";
import Referrer, { ReferrerOptions } from "../Referrer";
import Transport, { TransportOptions } from "./Transport";

export interface LocalTransportOptions extends TransportOptions {
  referrerOptions: ReferrerOptions;
  addresses: Array<{ family: string, address: string }>;
}

interface LocalTransport {
  on(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
  on(event: 'response', callback: (response, referrer: Referrer) => void): this;
  on(event: 'localQuery', callback: (packet, referrerObj: any) => void): this;
  on(event: 'localResponse', callback: (packet, referrerObj: any) => void): this;
  on(event: 'destroy', callback: () => void): this;
  once(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
  once(event: 'response', callback: (response, referrer: Referrer) => void): this;
  once(event: 'localQuery', callback: (packet, referrerObj: any) => void): this;
  once(event: 'localResponse', callback: (packet, referrerObj: any) => void): this;
  once(event: 'destroy', callback: () => void): this;
}

class LocalTransport extends EventEmitter implements Transport {
  options: LocalTransportOptions;
  addresses: Array<{ family: string, address: string }> = [];
  destroyed: boolean = false;
  referrer: Referrer;

  constructor(options: LocalTransportOptions) {
    super();

    this.options = options;
    this.referrer = new Referrer(options.referrerOptions);
    this.addresses = options.addresses;

    this.on("localQuery", (packet, referrerObj) => {
      const query = new Query(packet);
      const referrer = new Referrer(referrerObj);

      this.emit("query", query, referrer);
    });

    this.on("localResponse", (packet, referrerObj) => {
      const res = Response.parse(packet, { binaryTXT: this.options.binaryTXT });
      const referrer = new Referrer(referrerObj);

      this.emit("response", res, referrer);
    });
  }

  async query(query: Query) {
    await new Promise(resolve => setTimeout(() => resolve(), 50));

    this.emit("localQuery", toPlainObject(query), toPlainObject(this.referrer));
  }

  async respond(res: Response) {
    res = Response.serialize(res, { binaryTXT: this.options.binaryTXT });

    await new Promise(resolve => setTimeout(() => resolve(), 50));

    this.emit("localResponse", toPlainObject(res), toPlainObject(this.referrer));
  }

  async destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    await new Promise(resolve => setTimeout(() => resolve(), 50));

    this.emit("destroy");
  }

  getAddresses(): Array<{ family: string, address: string }> {
    return this.addresses;
  }
}

function toPlainObject(instance) {
  return JSON.parse(JSON.stringify(instance));
}

export default LocalTransport;