import Transport, { TransportOptions } from "./Transport";
import { EventEmitter } from "events";
import Query from "../Query";
import Response from "../Response";
import Referrer, { ReferrerOptions } from "../Referrer";

export interface LocalTransportOptions extends TransportOptions {
  referrerOptions: ReferrerOptions;
  addresses: Array<{ family: string, address: string }>;
}

export default class LocalTransport extends EventEmitter implements Transport {
  options: LocalTransportOptions;
  addresses: Array<{ family: string, address: string }> = [];
  destroyed: boolean = false;
  referrer: Referrer;

  constructor(options: LocalTransportOptions) {
    super();

    this.options = options;
    this.referrer = new Referrer(options.referrerOptions);
    this.referrer.ownAddress = this.ownAddress(this.referrer.address);
    this.addresses = options.addresses;

    this.on("localQuery", (packet, referrerObj) => {
      const query = new Query(packet);
      const referrer = new Referrer(referrerObj);
      referrer.ownAddress = this.ownAddress(referrer.address);

      this.emit("query", query, referrer);
    });

    this.on("localResponse", (packet, referrerObj) => {
      const res = Response.parse(packet, { binaryTXT: this.options.binaryTXT });
      const referrer = new Referrer(referrerObj);
      referrer.ownAddress = this.ownAddress(referrer.address);

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

  ownAddress(address: string) {
    return this.getAddresses().some(x => x.address === address);
  }
}

function toPlainObject(instance) {
  return JSON.parse(JSON.stringify(instance));
}