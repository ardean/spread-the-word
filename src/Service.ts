import os from "os";
import debug from "debug";
import Query from "./Query";
import Server from "./Server";
import Response from "./Response";
import { EventEmitter } from "events";
import Record from "./records/Record";
import * as MDNSUtil from "./MDNSUtil";
import { A, AAAA, PTR, TXT, SRV } from "./records";
import { TOP_LEVEL_DOMAIN, REANNOUNCE_FACTOR, REANNOUNCE_MAX_MS, WILDCARD } from "./Constants";

const debugLog = debug("SpreadTheWord:Service");

export interface ServiceOptions {
  name: string;
  type: string;
  port: number;
  protocol?: string;
  subtypes?: string[];
  txt?: MDNSUtil.TXTData;
  hostname?: string;
}

export default class Service extends EventEmitter {
  type: string;
  name: string;
  server: Server;
  dnsName: string;
  dnsType: string;
  protocol: string;
  hostname: string;
  port: number;
  txt: MDNSUtil.TXTData;
  rawTxt: string;
  subtypes: string[] = [];
  spreaded: boolean = false;
  destroyed: boolean = false;
  broadcastDelay: NodeJS.Timer;

  constructor(server: Server, options: ServiceOptions) {
    super();

    debugLog("new");

    this.server = server;
    this.name = options.name;
    this.type = options.type;
    this.protocol = options.protocol || "tcp";
    this.subtypes = options.subtypes || [];
    this.port = options.port;
    this.txt = options.txt;
    this.hostname = options.hostname || os.hostname() + "." + TOP_LEVEL_DOMAIN;
    this.dnsType = MDNSUtil.serializeDNSName({
      subtypes: this.subtypes,
      type: this.type,
      protocol: this.protocol,
      domain: TOP_LEVEL_DOMAIN
    });
    this.dnsName = MDNSUtil.serializeDNSName({
      name: this.name,
      subtypes: this.subtypes,
      type: this.type,
      protocol: this.protocol,
      domain: TOP_LEVEL_DOMAIN
    });
  }

  async spread(options: { probe?: boolean } = {}) {
    if (options.probe !== false) {
      const query = new Query({
        questions: [{
          name: this.dnsName,
          type: "ANY"
        }]
      });

      const queryRes = await this.server.queryAndListen(query);
      if (queryRes && queryRes.answers.length > 0) {
        throw new Error("service_exists");
      }
    }

    const answers = this.getServiceRecords();
    const additionals = this.getAddressRecords();

    const res = Response.parse(
      Response.serialize({ answers, additionals }, this.server.transportOptions),
      this.server.transportOptions
    );

    await this.broadcast(res, 1000);

    this.server.addService(this);
  }

  getServiceRecords(): Record[] {
    return [
      new PTR({ name: WILDCARD, data: this.dnsType }),
      new PTR({ name: this.dnsType, data: this.dnsName }),
      new SRV({ name: this.dnsName, data: { target: this.hostname, port: this.port } }),
      new TXT({ name: this.dnsName, data: this.txt })
    ];
  }

  getAddressRecords(): Record[] {
    const records = [];
    for (const { address, family } of this.server.transport.getAddresses()) {
      if (family === "IPv4") {
        records.push(new A({ name: this.hostname, data: address }));
      } else {
        records.push(new AAAA({ name: this.hostname, data: address }));
      }
    }

    return records;
  }

  async broadcast(res: Response, delay: number) {
    if (this.destroyed) return;

    debugLog("broadcast");

    await this.server.transport.respond(res);

    const records = res.answers.concat(res.additionals);

    for (const record of records) {
      this.server.recordRegistry.add(record);
    }

    this.spreaded = true;

    delay = Math.min(delay * REANNOUNCE_FACTOR, REANNOUNCE_MAX_MS);
    this.broadcastDelay = setTimeout(async () => await this.broadcast(res, delay), delay);
  }

  async hide() {
    clearTimeout(this.broadcastDelay);
    await this.sendGoodbye();
    await new Promise(resolve => setTimeout(() => resolve(), 100));

    this.spreaded = false;
  }

  async sendGoodbye() {
    debugLog("goodbye");

    const records = [new PTR({ name: this.dnsType, data: this.dnsName })];

    for (const record of records) {
      record.ttl = 0;
    }

    const res = new Response({ answers: records });
    await this.server.transport.respond(res);

    for (const record of records) {
      this.server.recordRegistry.remove(record);
    }

    debugLog("goodbye sent");
  }

  async destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    debugLog("destroy");

    await this.hide();

    debugLog("destroyed");
    this.emit("destroy");
  }
}