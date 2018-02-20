import * as MDNSUtils from "./MDNSUtils";
import RemoteService from "./RemoteService";
import { TOP_LEVEL_DOMAIN, WILDCARD } from "./Constants";
import { EventEmitter } from "events";
import * as debug from "debug";
import SRV from "./Records/SRV";
import Service from "./Service";
import Server from "./Server";
import Query from "./Query";
import Question from "./Question";
import AddressRecord from "./Records/AddressRecord";
import Response from "./Response";
import Referrer from "./Referrer";
import TXT from "./Records/TXT";

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

  constructor(server: Server, options: ListenerOptions = {}) {
    super();

    this.server = server;
    this.wildcard = !options.type;

    if (!this.wildcard) {
      this.typeName = MDNSUtils.serializeDNSName({
        name: options.name,
        subtypes: options.subtypes,
        type: options.type,
        protocol: options.protocol || "tcp",
        domain: TOP_LEVEL_DOMAIN
      });
      this.wildcard = false;
    }

    this.onResponse = this.onResponse.bind(this);
  }

  async listen() {
    this.server.on("response", this.onResponse);
    this.server.on("ownResponse", this.onResponse);

    const query = new Query({
      questions: [{
        name: this.typeName || WILDCARD,
        type: "PTR"
      }]
    });

    await this.server.transport.query(query);
  }

  onResponse(res: Response, referrer: Referrer) {
    const srvRecords = this.server.recordRegistry.findSRVsByType(this.typeName || WILDCARD);
    for (const srvRecord of srvRecords) {
      const name = MDNSUtils.parseDNSName(srvRecord.name).name;
      const remoteService = this.remoteServices.find(x => x.name === name);
      if (!remoteService) {
        const addressRecords = this.server.recordRegistry.findAddressRecordsByHostname(srvRecord.data.target);
        const txtRecord = this.server.recordRegistry.findOneTXTByName(srvRecord.name);
        this.addRemoteService(srvRecord, txtRecord, addressRecords, res, referrer);
      }
    }

    for (const remoteService of this.remoteServices) {
      const srvRecord = srvRecords.find(x => {
        return MDNSUtils.parseDNSName(x.name).name === remoteService.name;
      });
      if (!srvRecord) this.removeRemoteService(remoteService.name, res, referrer);
    }
  }

  destroy() {
    this.server.removeListener("response", this.onResponse);
    this.server.removeListener("ownResponse", this.onResponse);
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
}