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
const multicastdns = require("multicast-dns");
const debug = require("debug");
const events_1 = require("events");
const RecordRegistry_1 = require("./RecordRegistry");
const Response_1 = require("./Response");
const Query_1 = require("./Query");
const Referrer_1 = require("./Referrer");
const debugLog = debug("SpreadTheWord:ProductionServer");
class ProductionServer extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.destroyed = false;
        this.recordRegistry = options.recordRegistry || new RecordRegistry_1.default();
        this.mdns = multicastdns(options);
        this.mdns.setMaxListeners(0);
        this.mdns.on("query", (packet, referrerObj) => __awaiter(this, void 0, void 0, function* () {
            const query = new Query_1.default(packet);
            const referrer = new Referrer_1.default(referrerObj);
            this.emit("query", query, referrer);
            yield this.answerQuery(query, referrer);
        }));
        this.mdns.on("response", (packet, referrerObj) => {
            const res = new Response_1.default(packet);
            const referrer = new Referrer_1.default(referrerObj);
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
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this.mdns.query(query, err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
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
                        yield this.query(query);
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
                        const question = query.questions.find(x => record.name === name &&
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
    respond(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                this.mdns.respond(res, err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        });
    }
    answerQuery(query, referrer) {
        return __awaiter(this, void 0, void 0, function* () {
            let answers = [];
            for (const question of query.questions) {
                const records = this.recordRegistry.find(x => (question.type === "ANY" || x.type === question.type) && x.name === question.name);
                answers = answers.concat(records);
            }
            yield this.respond(new Response_1.default({ answers }));
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed)
                return;
            this.destroyed = true;
            yield new Promise((resolve, reject) => {
                this.mdns.destroy(err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        });
    }
}
exports.default = ProductionServer;
