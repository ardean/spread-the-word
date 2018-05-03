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
const Query_1 = require("../Query");
const Referrer_1 = require("../Referrer");
const Response_1 = require("../Response");
const events_1 = require("events");
const MDNSUtils = require("../MDNSUtils");
class MDNSTransport extends events_1.EventEmitter {
    constructor(options = {}) {
        super();
        this.destroyed = false;
        this.options = options;
        this.mdns = multicastdns();
        this.mdns.setMaxListeners(0);
        this.mdns.on("query", (packet, referrerObj) => __awaiter(this, void 0, void 0, function* () {
            const query = new Query_1.default(packet);
            const referrer = new Referrer_1.default(referrerObj);
            this.emit("query", query, referrer);
        }));
        this.mdns.on("response", (packet, referrerObj) => {
            const res = Response_1.default.parse(packet, { binaryTXT: this.options.binaryTXT });
            const referrer = new Referrer_1.default(referrerObj);
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
    respond(res) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                this.mdns.respond(Response_1.default.serialize(res, { binaryTXT: this.options.binaryTXT }), err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
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
    getAddresses() {
        return MDNSUtils.getExternalAddresses();
    }
}
exports.default = MDNSTransport;
