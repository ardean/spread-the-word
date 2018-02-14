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
const os = require("os");
const debug = require("debug");
const events_1 = require("events");
const Records_1 = require("./Records");
const Constants_1 = require("./Constants");
const MDNSUtils = require("./MDNSUtils");
const Response_1 = require("./Response");
const Query_1 = require("./Query");
const debugLog = debug("SpreadTheWord:Service");
class Service extends events_1.EventEmitter {
    constructor(server, options) {
        super();
        this.subtypes = [];
        this.spreaded = false;
        this.destroyed = false;
        this.server = server;
        this.name = options.name;
        this.type = options.type;
        this.protocol = options.protocol || "tcp";
        this.subtypes = options.subtypes || [];
        this.port = options.port;
        this.txt = options.txt;
        this.hostname = options.hostname || os.hostname() + "." + Constants_1.TOP_LEVEL_DOMAIN;
        this.dnsType = MDNSUtils.stringifyDNSName({
            subtypes: this.subtypes,
            type: this.type,
            protocol: this.protocol,
            domain: Constants_1.TOP_LEVEL_DOMAIN
        });
        this.dnsName = MDNSUtils.stringifyDNSName({
            name: this.name,
            subtypes: this.subtypes,
            type: this.type,
            protocol: this.protocol,
            domain: Constants_1.TOP_LEVEL_DOMAIN
        });
    }
    spread(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.probe !== false) {
                const query = new Query_1.default({
                    questions: [{
                            name: this.dnsName,
                            type: "ANY"
                        }]
                });
                const res = yield this.server.queryAndListen(query);
                if (res && res.answers.length > 0) {
                    throw new Error("service_exists");
                }
            }
            const answers = [
                new Records_1.PTR({ name: Constants_1.WILDCARD, data: this.dnsType }),
            ].concat(this.getServiceRecords());
            const additionals = this.getAddressRecords();
            yield this.broadcast(new Response_1.default({ answers, additionals }), 1000);
        });
    }
    getServiceRecords() {
        return [
            new Records_1.PTR({ name: this.dnsType, data: this.dnsName }),
            new Records_1.SRV({ name: this.dnsName, data: { target: this.hostname, port: this.port } }),
            new Records_1.TXT({ name: this.dnsName, data: this.txt })
        ];
    }
    getAddressRecords() {
        const records = [];
        for (const { address, family } of MDNSUtils.getExternalAddresses()) {
            if (family === "IPv4") {
                records.push(new Records_1.A({ name: this.hostname, data: address }));
            }
            else {
                records.push(new Records_1.AAAA({ name: this.hostname, data: address }));
            }
        }
        return records;
    }
    broadcast(res, delay) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed)
                return;
            debugLog("broadcast");
            yield this.server.respond(res);
            this.spreaded = true;
            delay = Math.min(delay * Constants_1.REANNOUNCE_FACTOR, Constants_1.REANNOUNCE_MAX_MS);
            setTimeout(() => __awaiter(this, void 0, void 0, function* () { return yield this.broadcast(res, delay); }), delay);
        });
    }
    hide() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.sendGoodbye();
            yield new Promise(resolve => setTimeout(() => resolve(), 100));
            this.spreaded = false;
        });
    }
    sendGoodbye() {
        return __awaiter(this, void 0, void 0, function* () {
            debugLog("goodbye");
            const records = this.getServiceRecords().concat(this.getAddressRecords());
            for (const record of records) {
                record.ttl = 0;
            }
            yield this.server.respond(new Response_1.default({ answers: records }));
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.destroyed)
                return;
            this.destroyed = true;
            debugLog("destroy");
            yield this.hide();
            debugLog("destroyed");
            this.emit("destroy");
        });
    }
}
exports.default = Service;
