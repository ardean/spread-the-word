"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("./Record");
const debug = require("debug");
const MDNSUtils_1 = require("../MDNSUtils");
const debugLog = debug("SpreadTheWord:TXT");
class TXT extends Record_1.default {
    constructor({ name, data, ttl }) {
        super("TXT");
        this.name = name;
        this.data = data;
        this.ttl = typeof ttl === "number" ? ttl : 4500;
    }
    static parse(record, options = {}) {
        debugLog("parse", record.data, options);
        const data = MDNSUtils_1.parseTXTData(record.data, options);
        debugLog("parse output", data, options);
        return new TXT(Object.assign({}, record, { data }));
    }
    static serialize(record, options = {}) {
        debugLog("serialize", record.data, options);
        const data = MDNSUtils_1.serializeTXTData(record.data, options);
        debugLog("serialize output", data, options);
        return new TXT(Object.assign({}, record, { data }));
    }
}
exports.default = TXT;
