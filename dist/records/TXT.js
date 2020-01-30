"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug_1 = __importDefault(require("debug"));
const Record_1 = __importDefault(require("./Record"));
const MDNSUtil_1 = require("../MDNSUtil");
const debugLog = debug_1.default("SpreadTheWord:TXT");
class TXT extends Record_1.default {
    constructor({ name, data, ttl }) {
        super("TXT");
        this.name = name;
        this.data = data;
        this.ttl = typeof ttl === "number" ? ttl : 4500;
    }
    static parse(record, options = {}) {
        debugLog("parse", record.data, options);
        const data = MDNSUtil_1.parseTXTData(record.data, options);
        debugLog("parse output", data, options);
        return new TXT(Object.assign(Object.assign({}, record), { data }));
    }
    static serialize(record, options = {}) {
        debugLog("serialize", record.data, options);
        const data = MDNSUtil_1.serializeTXTData(record.data, options);
        debugLog("serialize output", data, options);
        return new TXT(Object.assign(Object.assign({}, record), { data }));
    }
}
exports.default = TXT;
