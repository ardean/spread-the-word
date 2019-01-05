import Query from "./Query";
import Server from "./Server";
import * as debug from "debug";
import SRV from "./records/SRV";
import TXT from "./records/TXT";
import Response from "./Response";
import Referrer from "./Referrer";
import Question from "./Question";
import { EventEmitter } from "events";
import * as MDNSUtil from "./MDNSUtil";
import RemoteService from "./RemoteService";
import AddressRecord from "./records/AddressRecord";
import { TOP_LEVEL_DOMAIN, WILDCARD, REQUERY_FACTOR, REQUERY_MAX_MS } from "./Constants";

const debugLog = debug("SpreadTheWord:Listener");

export interface ListenerOptions {
  name?: string;
  type?: string;
  protocol?: string;
  subtypes?: string[];
}

export default class Listener extends EventEmitter {
  server: Server;
  remoteServices: RemoteService[] = [];
  typeName: string;
  wildcard: boolean;
  requeryDelay: NodeJS.Timer;

  constructor(server: Server, options: ListenerOptions = {}) {
    super();

    this.server = server;
    this.wildcard = !options.type;

    if (!this.wildcard) {
      this.typeName = MDNSUtil.serializeDNSName({
        name: options.name,
        subtypes: options.subtypes,
        type: options.type,
        protocol: options.protocol || "tcp",
        domain: TOP_LEVEL_DOMAIN
      });
    }
  }

  async listen() {
    this.server.on("response", this.onResponse);

    await this.requery();
  }

  async query() {
    const query = new Query({
      questions: [{
        name: this.typeName || WILDCARD,
        type: "PTR"
      }]
    });

    await this.server.transport.query(query);
  }

  async requery(delay: number = 1000) {
    await this.query();

    delay = Math.min(delay * REQUERY_FACTOR, REQUERY_MAX_MS);
    this.requeryDelay = setTimeout(async () => await this.requery(delay), delay);
  }

  onResponse = async (res: Response, referrer: Referrer) => {
    const srvRecords = this.server.recordRegistry.findSRVsByType(this.typeName || WILDCARD);
    for (const srvRecord of srvRecords) {
      const port = srvRecord.data.port;
      const name = MDNSUtil.parseDNSName(srvRecord.name).name;
      const remoteService = this.remoteServices.find(x =>
        x.name === name &&
        x.port === port
      );
      if (!remoteService) {
        const addressRecords = this.server.recordRegistry.findAddressRecordsByHostname(srvRecord.data.target);
        const txtRecord = this.server.recordRegistry.findOneTXTByName(srvRecord.name);
        this.addRemoteService(srvRecord, txtRecord, addressRecords, res, referrer);
      }
    }

    for (const remoteService of this.remoteServices) {
      const port = remoteService.port;
      const name = remoteService.name;
      const srvRecord = srvRecords.find(x =>
        MDNSUtil.parseDNSName(x.name).name === name &&
        x.data.port === port
      );
      if (!srvRecord) this.removeRemoteService(remoteService.name, res, referrer);
    }

    await this.queryUnresolvedRecords();
  }

  destroy() {
    clearTimeout(this.requeryDelay);
    this.server.removeListener("response", this.onResponse);
  }

  addRemoteService(record: SRV, txtRecord: TXT, addressRecords: AddressRecord[], res: Response, referrer: Referrer) {
    const remoteService = new RemoteService(record, txtRecord, addressRecords);
    this.remoteServices.push(remoteService);

    debugLog("up", remoteService.name, remoteService.hostname, remoteService.port);
    this.emit("up", remoteService, res, referrer);
  }

  removeRemoteService(name: string, res: Response, referrer: Referrer) {
    const remoteService = this.remoteServices.find(x => x.name === name);
    if (!remoteService) return;

    this.remoteServices.splice(this.remoteServices.indexOf(remoteService), 1);

    debugLog("down", remoteService.name, remoteService.hostname, remoteService.port);
    this.emit("down", remoteService, res, referrer);
  }

  async queryUnresolvedRecords() {
    const unresolvedRecords = this.server.recordRegistry.findUnresolved();
    const questions: Question[] = [];

    for (const unresolvedRecord of unresolvedRecords) {
      debugLog("querying unresolved record", unresolvedRecord.data);

      questions.push({
        name: unresolvedRecord.data,
        type: "ANY"
      });
    }

    const query = new Query({ questions });
    await this.server.transport.query(query);
  }
}