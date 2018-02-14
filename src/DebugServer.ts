import * as debug from "debug";
import { EventEmitter } from "events";
import Record from "./Records/Record";
import RecordRegistry from "./RecordRegistry";
import Server, { ServerOptions } from "./Server";
import Query from "./Query";
import Referrer, { ReferrerOptions } from "./Referrer";
import Response from "./Response";

const debugLog = debug("SpreadTheWord:DebugServer");

export interface DebugServerOptions {
  referrerOptions: ReferrerOptions;
}

export default class DebugServer extends EventEmitter implements Server {
  debugOptions: DebugServerOptions;
  recordRegistry: RecordRegistry;
  destroyed: boolean = false;

  constructor(options: ServerOptions = {}, debugOptions: DebugServerOptions) {
    super();

    this.recordRegistry = options.recordRegistry || new RecordRegistry();

    this.debugOptions = debugOptions;

    this.on("mdnsQuery", (packet, referrerObj) => {
      const query = new Query(packet);
      const referrer = new Referrer(referrerObj);

      this.emit("query", query, referrer);
    });

    this.on("mdnsResponse", (packet, referrerObj) => {
      const res = new Response(packet);
      const referrer = new Referrer(referrerObj);

      debugLog(`response from ${referrer.address}`);

      const addedRecords = [];
      const removedRecords = [];
      const records = res.answers.concat(res.additionals);
      for (const record of records) {
        if (record.ttl === 0) {
          removedRecords.push(this.recordRegistry.remove(record));
        } else {
          addedRecords.push(this.recordRegistry.add(record));
        }
      }

      if (addedRecords.length > 0) debugLog(`added ${addedRecords.length} records`);
      if (removedRecords.length > 0) debugLog(`removed ${removedRecords.length} records`);

      this.emit("response", res, referrer);
    });
  }

  async query(query: Query) {
    const referrer = new Referrer(this.debugOptions.referrerOptions);

    await wait(100);

    this.emit("mdnsQuery", JSON.parse(JSON.stringify(query)), JSON.parse(JSON.stringify(referrer)));
  }

  async queryAndListen(query: Query) {
    debugLog("queryAndListen");

    await this.query(query);

    let answers = [];
    for (const question of query.questions) {
      const records = this.recordRegistry.find(x => (question.type === "ANY" || x.type === question.type) && x.name === question.name);
      answers = answers.concat(records);
    }

    return new Response({ answers });
  }

  async respond(res: Response) {
    const referrer = new Referrer(this.debugOptions.referrerOptions || {});

    await wait(100);

    this.emit("mdnsResponse", JSON.parse(JSON.stringify(res)), JSON.parse(JSON.stringify(referrer)));
  }

  async destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    await wait(100);
    this.emit("destroy");
  }
}

function wait(ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}