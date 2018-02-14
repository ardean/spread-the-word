"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("./Record");
const dnsTxt = require("dns-txt");
const txt = dnsTxt();
class TXT extends Record_1.default {
    constructor({ name, data, ttl }) {
        super("TXT");
        this.name = name;
        this.data = txt.encode(data);
        this.ttl = typeof ttl === "number" ? ttl : 4500;
    }
}
exports.default = TXT;
