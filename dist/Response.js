"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtil = __importStar(require("./MDNSUtil"));
class Response {
    constructor(options = {}) {
        this.additionals = [];
        this.answers = options.answers || [];
        this.additionals = options.additionals || [];
    }
    static parse(options, parseOptions) {
        const answers = (options.answers || [])
            .map(x => MDNSUtil.parseRecord(x, parseOptions))
            .filter(x => x);
        const additionals = (options.additionals || [])
            .map(x => MDNSUtil.parseRecord(x, parseOptions))
            .filter(x => x);
        return new Response(Object.assign(Object.assign({}, options), { answers,
            additionals }));
    }
    static serialize(options, serializeOptions) {
        const answers = (options.answers || [])
            .map(x => MDNSUtil.serializeRecord(x, serializeOptions))
            .filter(x => x);
        const additionals = (options.additionals || [])
            .map(x => MDNSUtil.serializeRecord(x, serializeOptions))
            .filter(x => x);
        return new Response(Object.assign(Object.assign({}, options), { answers,
            additionals }));
    }
}
exports.default = Response;
