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
import { ServerOptions } from "./Server";
import Transport, { TransportOptions } from "./Transports/Transport";
import MDNSTransport from "./Transports/MDNSTransport";
import Referrer from "./Referrer";
import { WILDCARD } from "./Constants";

const debugLog = debug("SpreadTheWord:Server");

export interface ServerOptions {
  transportOptions?: TransportOptions;
  transport?: Transport;
  recordRegistry?: RecordRegistry;
  // tslint:disable-next-line:no-any
  socketOptions?: any;
}

export default class Server extends EventEmitter {
  transportOptions: TransportOptions;
  services: Service[] = [];
  transport: Transport;
  recordRegistry: RecordRegistry;
  destroyed: boolean = false;

  constructor(options: ServerOptions = {}) {
    super();

    this.transportOptions = options.transportOptions;
    this.transport = options.transport || new MDNSTransport(this.transportOptions);
    this.recordRegistry = options.recordRegistry || new RecordRegistry();

    this.transport.on("query", async (query: Query, referrer: Referrer) => {
      debugLog(`query from ${referrer.address}`);

      this.emit("query", query, referrer);

      await this.answerQuery(query, referrer);
    });

    this.transport.on("response", (res: Response, referrer: Referrer) => {
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

  async queryAndListen(query: Query) {
    return new Promise<Response>((resolve, reject) => {
      let sent = false;
      let retries = 0;
      let timer;

      const sendQuery = async () => {
        try {
          await this.transport.query(query);
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

  async answerQuery(query: Query, referrer: Referrer) {
    debugLog("answerQuery");

    for (const question of query.questions) {
      debugLog("question:", question.name, question.type);

      let askedServices: Service[] = [];
      if (question.type === "ANY" || question.name === WILDCARD) {
        debugLog("answer all");
        askedServices = this.services.concat();
      } else {
        for (const service of this.services) {
          if (
            question.name === service.dnsName ||
            question.name === service.dnsType
          ) {
            if (askedServices.indexOf(service) === -1) {
              debugLog("found asked service", service.dnsName);
              askedServices.push(service);
            }
          }
        }
      }

      let answers = [];
      let additionals = [];
      for (const service of askedServices) {
        answers = answers.concat(service.getServiceRecords());
        additionals = additionals.concat(service.getAddressRecords());
      }

      if (answers.length !== 0 || additionals.length !== 0) {
        debugLog("answer");
        await this.transport.respond(
          new Response({
            answers,
            additionals
          })
        );
      }
    }
  }

  async destroy() {
    await this.transport.destroy();
  }

  addService(service: Service) {
    service.once("destroy", () => {
      this.removeService(service);
    });
    this.services.push(service);
  }

  removeService(service: Service) {
    const index = this.services.indexOf(service);
    if (index > -1) this.services.splice(index, 1);
  }
}