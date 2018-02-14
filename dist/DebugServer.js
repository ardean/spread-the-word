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
const Query_1 = require("./Query");
const Referrer_1 = require("./Referrer");
const Response_1 = require("./Response");
const debugLog = debug("SpreadTheWord:DebugServer");
class DebugServer extends events_1.EventEmitter {
    constructor(options = {}, debugOptions) {
        super();
        this.destroyed = false;
        this.recordRegistry = options.recordRegistry || new RecordRegistry_1.default();
        this.debugOptions = debugOptions;
        this.on("mdnsQuery", (packet, referrerObj) => {
            const query = new Query_1.default(packet);
            const referrer = new Referrer_1.default(referrerObj);
            this.emit("query", query, referrer);
        });
        this.on("mdnsResponse", (packet, referrerObj) => {
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
            const referrer = new Referrer_1.default(this.debugOptions.referrerOptions);
            yield wait(100);
            this.emit("mdnsQuery", JSON.parse(JSON.stringify(query)), JSON.parse(JSON.stringify(referrer)));
        });
    }
    queryAndListen(query) {
        return __awaiter(this, void 0, void 0, function* () {
            debugLog("queryAndListen");
            yield this.query(query);
            let answers = [];
            for (const question of query.questions) {
                const records = this.recordRegistry.find(x => (question.type === "ANY" || x.type === question.type) && x.name === question.name);
                answers = answers.concat(records);
            }
            return new Response_1.default({ answers });
        });
    }
    respond(res) {
        return __awaiter(this, void 0, void 0, function* () {
            const referrer = new Referrer_1.default(this.debugOptions.referrerOptions || {});
            yield wait(100);
            this.emit("mdnsResponse", JSON.parse(JSON.stringify(res)), JSON.parse(JSON.stringify(referrer)));
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed)
                return;
            this.destroyed = true;
            yield wait(100);
            this.emit("destroy");
        });
    }
}
exports.default = DebugServer;
function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
}
