"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtils = require("./MDNSUtils");
class Response {
    constructor(options = {}) {
        this.additionals = [];
        this.answers = options.answers || [];
        this.additionals = options.additionals || [];
    }
    static parse(options, parseOptions) {
        const answers = (options.answers || [])
            .map(x => MDNSUtils.parseRecord(x, parseOptions))
            .filter(x => x);
        const additionals = (options.additionals || [])
            .map(x => MDNSUtils.parseRecord(x, parseOptions))
            .filter(x => x);
        return new Response(Object.assign({}, options, { answers,
            additionals }));
    }
    static serialize(options, serializeOptions) {
        const answers = (options.answers || [])
            .map(x => MDNSUtils.serializeRecord(x, serializeOptions))
            .filter(x => x);
        const additionals = (options.additionals || [])
            .map(x => MDNSUtils.serializeRecord(x, serializeOptions))
            .filter(x => x);
        return new Response(Object.assign({}, options, { answers,
            additionals }));
    }
}
exports.default = Response;
