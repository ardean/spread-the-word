"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = __importDefault(require("../Query"));
const Response_1 = __importDefault(require("../Response"));
const events_1 = require("events");
const Referrer_1 = __importDefault(require("../Referrer"));
class LocalTransport extends events_1.EventEmitter {
    constructor(options) {
        super();
        this.addresses = [];
        this.destroyed = false;
        this.options = options;
        this.referrer = new Referrer_1.default(options.referrerOptions);
        this.addresses = options.addresses;
        this.on("localQuery", (packet, referrerObj) => {
            const query = new Query_1.default(packet);
            const referrer = new Referrer_1.default(referrerObj);
            this.emit("query", query, referrer);
        });
        this.on("localResponse", (packet, referrerObj) => {
            const res = Response_1.default.parse(packet, { binaryTXT: this.options.binaryTXT });
            const referrer = new Referrer_1.default(referrerObj);
            this.emit("response", res, referrer);
        });
    }
    async query(query) {
        await new Promise(resolve => setTimeout(() => resolve(), 50));
        this.emit("localQuery", toPlainObject(query), toPlainObject(this.referrer));
    }
    async respond(res) {
        res = Response_1.default.serialize(res, { binaryTXT: this.options.binaryTXT });
        await new Promise(resolve => setTimeout(() => resolve(), 50));
        this.emit("localResponse", toPlainObject(res), toPlainObject(this.referrer));
    }
    async destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        await new Promise(resolve => setTimeout(() => resolve(), 50));
        this.emit("destroy");
    }
    getAddresses() {
        return this.addresses;
    }
}
function toPlainObject(instance) {
    return JSON.parse(JSON.stringify(instance));
}
exports.default = LocalTransport;
