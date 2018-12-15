"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("../Query");
const Referrer_1 = require("../Referrer");
const Response_1 = require("../Response");
const events_1 = require("events");
const MDNSUtil = require("../MDNSUtil");
const multicastdns = require("multicast-dns");
class MDNSTransport extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.destroyed = false;
        this.options = options;
        this.mdns = multicastdns();
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
