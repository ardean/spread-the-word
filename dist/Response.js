"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtils = require("./MDNSUtils");
class Response {
    constructor(options = {}) {
        this.additionals = [];
        this.answers = (options.answers || []).map(x => MDNSUtils.parseRecord(x)).filter(x => x);
        this.additionals = (options.additionals || []).map(x => MDNSUtils.parseRecord(x)).filter(x => x);
    }
}
exports.default = Response;
