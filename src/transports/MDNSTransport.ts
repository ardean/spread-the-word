import Query from "../Query";
import Referrer from "../Referrer";
import Response from "../Response";
import { EventEmitter } from "events";
import * as MDNSUtil from "../MDNSUtil";
import multicastdns from "multicast-dns";
import Transport, { TransportOptions } from "./Transport";

interface MDNSTransport {
  on(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
  on(event: 'response', callback: (response, referrer: Referrer) => void): this;
  once(event: 'query', callback: (query: Query, referrer: Referrer) => void): this;
  once(event: 'response', callback: (response, referrer: Referrer) => void): this;
}

class MDNSTransport extends EventEmitter implements Transport {
  options: TransportOptions;
  destroyed: boolean = false;
  mdns: any;

  constructor(options: TransportOptions = {}) {
    super();

    this.options = options;
    this.mdns = multicastdns();
    this.mdns.setMaxListeners(0);
    this.mdns.on("query", async (packet, referrerObj) => {
      const query = new Query(packet);
      const referrer = new Referrer(referrerObj);

      this.emit("query", query, referrer);
    });

    this.mdns.on("response", (packet, referrerObj) => {
      const res = Response.parse(packet, { binaryTXT: this.options.binaryTXT });
      const referrer = new Referrer(referrerObj);

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
    return MDNSUtil.getExternalAddresses();
  }
}

export default MDNSTransport;