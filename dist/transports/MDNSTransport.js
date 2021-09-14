"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = __importDefault(require("../Query"));
const Referrer_1 = __importDefault(require("../Referrer"));
const Response_1 = __importDefault(require("../Response"));
const events_1 = require("events");
const MDNSUtil = __importStar(require("../MDNSUtil"));
const multicast_dns_1 = __importDefault(require("multicast-dns"));
class MDNSTransport extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.destroyed = false;
        this.options = options;
        this.mdns = (0, multicast_dns_1.default)();
        this.mdns.setMaxListeners(0);
        this.mdns.on("query", async (packet, referrerObj) => {
            const query = new Query_1.default(packet);
            const referrer = new Referrer_1.default(referrerObj);
            this.emit("query", query, referrer);
        });
        this.mdns.on("response", (packet, referrerObj) => {
            const res = Response_1.default.parse(packet, { binaryTXT: this.options.binaryTXT });
            const referrer = new Referrer_1.default(referrerObj);
            this.emit("response", res, referrer);
        });
    }
    async query(query) {
        return new Promise((resolve, reject) => {
            this.mdns.query(query, err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    async respond(res) {
        return await new Promise((resolve, reject) => {
            this.mdns.respond(Response_1.default.serialize(res, { binaryTXT: this.options.binaryTXT }), err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    async destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        await new Promise((resolve, reject) => {
            this.mdns.destroy(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
    getAddresses() {
        return MDNSUtil.getExternalAddresses();
    }
}
exports.default = MDNSTransport;
