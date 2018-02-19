"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const events_1 = require("events");
const RecordRegistry_1 = require("./RecordRegistry");
const Response_1 = require("./Response");
const MDNSTransport_1 = require("./Transports/MDNSTransport");
const Constants_1 = require("./Constants");
const debugLog = debug("SpreadTheWord:Server");
class Server extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.services = [];
        this.destroyed = false;
        this.transportOptions = options.transportOptions;
        this.transport = options.transport || new MDNSTransport_1.default(this.transportOptions);
        this.recordRegistry = options.recordRegistry || new RecordRegistry_1.default();
        this.transport.on("query", (query, referrer) => __awaiter(this, void 0, void 0, function* () {
            debugLog(`query from ${referrer.address}${referrer.ownAddress ? " (own address)" : ""}`);
            if (referrer.ownAddress)
                return this.emit("ownQuery", query, referrer);
            this.emit("query", query, referrer);
            yield this.answerQuery(query, referrer);
        }));
        this.transport.on("response", (res, referrer) => {
            debugLog(`response from ${referrer.address}${referrer.ownAddress ? " (own address)" : ""}`);
            if (referrer.ownAddress)
                return this.emit("ownResponse", res, referrer);
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
    queryAndListen(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let sent = false;
                let retries = 0;
                let timer;
                const sendQuery = () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield this.transport.query(query);
                    }
                    catch (err) {
                        // ignore
                    }
                    sent = true;
                    if (++retries >= 3)
                        return done(null);
                    timer = setTimeout(() => sendQuery(), 250);
                });
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
        });
    }
    answerQuery(query, referrer) {
        return __awaiter(this, void 0, void 0, function* () {
            debugLog("answerQuery");
            for (const question of query.questions) {
                debugLog("question:", question.name, question.type);
                let askedServices = [];
                if (question.type === "ANY" || question.name === Constants_1.WILDCARD) {
                    debugLog("answer all");
                    askedServices = this.services.concat();
                }
                else {
                    for (const service of this.services) {
                        if (question.name === service.dnsName ||
                            question.name === service.dnsType) {
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
                    yield this.transport.respond(new Response_1.default({
                        answers,
                        additionals
                    }));
                }
            }
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.transport.destroy();
        });
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
