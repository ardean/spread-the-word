import * as multicastdns from "multicast-dns";
import * as MDNSUtils from "./MDNSUtils";
import * as debug from "debug";
import { EventEmitter } from "events";
import Record from "./Records/Record";
import RecordRegistry from "./RecordRegistry";
import Service from "./Service";
import Listener from "./Listener";
import Response from "./Response";
import Query from "./Query";
import Server, { ServerOptions } from "./Server";
import Referrer from "./Referrer";

const debugLog = debug("SpreadTheWord:ProductionServer");

export default class ProductionServer extends EventEmitter implements Server {
  recordRegistry: RecordRegistry;
  destroyed: boolean = false;
  mdns: any;

  constructor(options: ServerOptions = {}) {
    super();

    this.recordRegistry = options.recordRegistry || new RecordRegistry();

    this.mdns = multicastdns(options);
    this.mdns.setMaxListeners(0);
    this.mdns.on("query", async (packet, referrerObj) => {
      const query = new Query(packet);
      const referrer = new Referrer(referrerObj);

      this.emit("query", query, referrer);

      await this.answerQuery(query, referrer);
    });

    this.mdns.on("response", (packet, referrerObj) => {
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
    return new Promise<void>((resolve, reject) => {
      this.mdns.query(query, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async queryAndListen(query: Query) {
    return new Promise<Response>((resolve, reject) => {
      let sent = false;
      let retries = 0;
      let timer;

      const sendQuery = async () => {
        try {
          await this.query(query);
        } catch (err) {
          // ignore
        }

        sent = true;
        if (++retries >= 3) return done(null);
        timer = setTimeout(() => sendQuery(), 250);
      };

      const onResponse = (res: Response) => {
        if (!sent) return;

        const matchedRecords = [];
        for (const record of res.answers) {

          const question = query.questions.find(x =>
            record.name === x.name &&
            (x.type === "ANY" || record.type === x.type)
          );
          if (question) {
            matchedRecords.push(record);
          }
        }

        if (matchedRecords.length > 0) done(res);
      };

      const done = (res: Response) => {
        this.removeListener("response", onResponse);
        clearTimeout(timer);
        resolve(res);
      };

      this.on("response", onResponse);
      setTimeout(() => sendQuery(), 250);
    });
  }

  async respond(res: Response) {
    return await new Promise<void>((resolve, reject) => {
      this.mdns.respond(res, err => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async answerQuery(query: Query, referrer: Referrer) {
    let answers = [];
    for (const question of query.questions) {
      const records = this.recordRegistry.find(x => (question.type === "ANY" || x.type === question.type) && x.name === question.name);
      answers = answers.concat(records);
    }

    await this.respond(new Response({ answers }));
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
}