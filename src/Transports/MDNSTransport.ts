import * as multicastdns from "multicast-dns";
import Transport, { TransportOptions } from "./Transport";
import Query from "../Query";
import Referrer from "../Referrer";
import Response from "../Response";
import { EventEmitter } from "events";
import * as MDNSUtils from "../MDNSUtils";

export default class MDNSTransport extends EventEmitter implements Transport {
  options: TransportOptions;
  destroyed: boolean = false;
  // tslint:disable-next-line:no-any
  mdns: any;

  constructor(options: TransportOptions = {}) {
    super();

    this.options = options;
    this.mdns = multicastdns();
    this.mdns.setMaxListeners(0);
    this.mdns.on("query", async (packet, referrerObj) => {
      const query = new Query(packet);
      const referrer = new Referrer(referrerObj);
      referrer.ownAddress = this.ownAddress(referrer.address);

      this.emit("query", query, referrer);
    });

    this.mdns.on("response", (packet, referrerObj) => {
      const res = Response.parse(packet, { binaryTXT: this.options.binaryTXT });
      const referrer = new Referrer(referrerObj);
      referrer.ownAddress = this.ownAddress(referrer.address);

      this.emit("response", res, referrer);
    });
  }

  async query(query: Query) {
    return new Promise<void>((resolve, reject) => {
      this.mdns.query(query, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async respond(res: Response) {
    return await new Promise<void>((resolve, reject) => {
      this.mdns.respond(Response.serialize(res, { binaryTXT: this.options.binaryTXT }), err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async destroy() {
    if (this.destroyed) return;
    this.destroyed = true;

    await new Promise<void>((resolve, reject) => {
      this.mdns.destroy(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  getAddresses(): Array<{ family: string, address: string }> {
    return MDNSUtils.getExternalAddresses();
  }

  ownAddress(address: string) {
    return this.getAddresses().some(x => x.address === address);
  }
}