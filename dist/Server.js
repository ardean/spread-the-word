"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const Response_1 = __importDefault(require("./Response"));
const events_1 = require("events");
const Constants_1 = require("./Constants");
const RecordRegistry_1 = __importDefault(require("./RecordRegistry"));
const MDNSTransport_1 = __importDefault(require("./transports/MDNSTransport"));
const debugLog = (0, debug_1.default)("SpreadTheWord:Server");
class Server extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.services = [];
        this.destroyed = false;
        this.transportOptions = options.transportOptions;
        this.transport = options.transport || new MDNSTransport_1.default(this.transportOptions);
        this.recordRegistry = options.recordRegistry || new RecordRegistry_1.default();
        this.transport.on("query", async (query, referrer) => {
            debugLog(`query from ${referrer.address}`);
            this.emit("query", query, referrer);
            await this.answerQuery(query, referrer);
        });
        this.transport.on("response", (res, referrer) => {
            debugLog(`response from ${referrer.address}`);
            const addedRecords = [];
            const removedRecords = [];
            const records = res.answers.concat(res.additionals);
            for (const record of records) {
                if (record.ttl === 0) {
                    removedRecords.push(this.recordRegistry.remove(record));
                }
                else {
                    addedRecords.push(this.recordRegistry.add(record));
                }
            }
            if (addedRecords.length > 0)
                debugLog(`added ${addedRecords.length} records`);
            if (removedRecords.length > 0)
                debugLog(`removed ${removedRecords.length} records`);
            this.emit("response", res, referrer);
        });
    }
    async queryAndListen(query) {
        return new Promise((resolve, reject) => {
            let sent = false;
            let retries = 0;
            let timer;
            const sendQuery = async () => {
                try {
                    await this.transport.query(query);
                }
                catch (err) {
                    // ignore
                }
                sent = true;
                if (++retries >= 3)
                    return done(null);
                timer = setTimeout(() => sendQuery(), 250);
            };
            const onResponse = (res) => {
                if (!sent)
                    return;
                const matchedRecords = [];
                for (const record of res.answers) {
                    const question = query.questions.find(x => record.name === x.name &&
                        (x.type === "ANY" || record.type === x.type));
                    if (question) {
                        matchedRecords.push(record);
                    }
                }
                if (matchedRecords.length > 0)
                    done(res);
            };
            const done = (res) => {
                this.removeListener("response", onResponse);
                clearTimeout(timer);
                resolve(res);
            };
            this.on("response", onResponse);
            setTimeout(() => sendQuery(), 250);
        });
    }
    async answerQuery(query, referrer) {
        for (const question of query.questions) {
            debugLog("question:", question.name, question.type);
            let queriedServices = [];
            if (question.type === "ANY" || question.name === Constants_1.WILDCARD) {
                debugLog("answer all");
                queriedServices = this.services.concat();
            }
            else {
                for (const service of this.services) {
                    if (question.name === service.dnsName ||
                        question.name === service.dnsType) {
                        if (queriedServices.indexOf(service) === -1) {
                            debugLog("found queried service", service.dnsName);
                            queriedServices.push(service);
                        }
                    }
                }
            }
            let answers = [];
            let additionals = [];
            for (const service of queriedServices) {
                answers = answers.concat(service.getServiceRecords());
                additionals = additionals.concat(service.getAddressRecords());
            }
            if (answers.length !== 0 || additionals.length !== 0) {
                debugLog("answer");
                await this.transport.respond(new Response_1.default({
                    answers,
                    additionals
                }));
            }
        }
    }
    async destroy() {
        await this.transport.destroy();
    }
    addService(service) {
        service.once("destroy", () => {
            this.removeService(service);
        });
        this.services.push(service);
    }
    removeService(service) {
        const index = this.services.indexOf(service);
        if (index > -1)
            this.services.splice(index, 1);
    }
}
exports.default = Server;
