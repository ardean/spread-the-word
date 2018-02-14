import * as os from "os";
import * as debug from "debug";
import { EventEmitter } from "events";
import Record from "./Records/Record";
import { A, AAAA, PTR, TXT, SRV } from "./Records";
import { TOP_LEVEL_DOMAIN, REANNOUNCE_FACTOR, REANNOUNCE_MAX_MS, WILDCARD } from "./Constants";
import * as MDNSUtils from "./MDNSUtils";
import Server from "./Server";
import Response from "./Response";
import Query from "./Query";

const debugLog = debug("SpreadTheWord:Service");

export interface ServiceOptions {
  name: string;
  type: string;
  port: number;
  protocol?: string;
  subtypes?: string[];
  txt?: string;
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
  txt: string;
  rawTxt: string;
  subtypes: string[] = [];
  spreaded: boolean = false;
  destroyed: boolean = false;

  constructor(server: Server, options: ServiceOptions) {
    super();

    this.server = server;
    this.name = options.name;
    this.type = options.type;
    this.protocol = options.protocol || "tcp";
    this.subtypes = options.subtypes || [];
    this.port = options.port;
    this.txt = options.txt;
    this.hostname = options.hostname || os.hostname() + "." + TOP_LEVEL_DOMAIN;
    this.dnsType = MDNSUtils.stringifyDNSName({
      subtypes: this.subtypes,
      type: this.type,
      protocol: this.protocol,
      domain: TOP_LEVEL_DOMAIN
    });
    this.dnsName = MDNSUtils.stringifyDNSName({
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

      const res = await this.server.queryAndListen(query);
      if (res && res.answers.length > 0) {
        throw new Error("service_exists");
      }
    }

    const answers = [
      new PTR({ name: WILDCARD, data: this.dnsType }),
    ].concat(this.getServiceRecords());

    const additionals = this.getAddressRecords();
    await this.broadcast(new Response({ answers, additionals }), 1000);
  }

  getServiceRecords(): Record[] {
    return [
      new PTR({ name: this.dnsType, data: this.dnsName }),
      new SRV({ name: this.dnsName, data: { target: this.hostname, port: this.port } }),
      new TXT({ name: this.dnsName, data: this.txt })
    ];
  }

  getAddressRecords(): Record[] {
    const records = [];
    for (const { address, family } of MDNSUtils.getExternalAddresses()) {
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

    await this.server.respond(res);

    this.spreaded = true;

    delay = Math.min(delay * REANNOUNCE_FACTOR, REANNOUNCE_MAX_MS);
    setTimeout(async () => await this.broadcast(res, delay), delay);
  }

  async hide() {
    await this.sendGoodbye();
    await new Promise(resolve => setTimeout(() => resolve(), 100));

    this.spreaded = false;
  }

  async sendGoodbye() {
    debugLog("goodbye");

    const records = this.getServiceRecords().concat(this.getAddressRecords());

    for (const record of records) {
      record.ttl = 0;
    }

    await this.server.respond(new Response({ answers: records }));
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