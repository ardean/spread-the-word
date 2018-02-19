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
const events_1 = require("events");
const Query_1 = require("../Query");
const Response_1 = require("../Response");
const Referrer_1 = require("../Referrer");
class LocalTransport extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.addresses = [];
        this.destroyed = false;
        this.options = options;
        this.referrer = new Referrer_1.default(options.referrerOptions);
        this.referrer.ownAddress = this.ownAddress(this.referrer.address);
        this.addresses = options.addresses;
        this.on("localQuery", (packet, referrerObj) => {
            const query = new Query_1.default(packet);
            const referrer = new Referrer_1.default(referrerObj);
            referrer.ownAddress = this.ownAddress(referrer.address);
            this.emit("query", query, referrer);
        });
        this.on("localResponse", (packet, referrerObj) => {
            const res = Response_1.default.parse(packet, { binaryTXT: this.options.binaryTXT });
            const referrer = new Referrer_1.default(referrerObj);
            referrer.ownAddress = this.ownAddress(referrer.address);
            this.emit("response", res, referrer);
        });
    }
    query(query) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise(resolve => setTimeout(() => resolve(), 50));
            this.emit("localQuery", JSON.parse(JSON.stringify(query)), JSON.parse(JSON.stringify(this.referrer)));
        });
    }
    respond(res) {
        return __awaiter(this, void 0, void 0, function* () {
            res = Response_1.default.serialize(res, { binaryTXT: this.options.binaryTXT });
            yield new Promise(resolve => setTimeout(() => resolve(), 50));
            this.emit("localResponse", JSON.parse(JSON.stringify(res)), JSON.parse(JSON.stringify(this.referrer)));
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed)
                return;
            this.destroyed = true;
            yield new Promise(resolve => setTimeout(() => resolve(), 50));
            this.emit("destroy");
        });
    }
    getAddresses() {
        return this.addresses;
    }
    ownAddress(address) {
        return this.getAddresses().some(x => x.address === address);
    }
}
exports.default = LocalTransport;
