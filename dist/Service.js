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
const os_1 = __importDefault(require("os"));
const debug_1 = __importDefault(require("debug"));
const Query_1 = __importDefault(require("./Query"));
const Response_1 = __importDefault(require("./Response"));
const events_1 = require("events");
const MDNSUtil = __importStar(require("./MDNSUtil"));
const records_1 = require("./records");
const Constants_1 = require("./Constants");
const debugLog = (0, debug_1.default)("SpreadTheWord:Service");
class Service extends events_1.EventEmitter {
    constructor(server, options) {
        super();
        this.subtypes = [];
        this.spreaded = false;
        this.destroyed = false;
        debugLog("new");
        this.server = server;
        this.name = options.name;
        this.type = options.type;
        this.protocol = options.protocol || "tcp";
        this.subtypes = options.subtypes || [];
        this.port = options.port;
        this.txt = options.txt;
        this.hostname = options.hostname || os_1.default.hostname() + "." + Constants_1.TOP_LEVEL_DOMAIN;
        this.dnsType = MDNSUtil.serializeDNSName({
            subtypes: this.subtypes,
            type: this.type,
            protocol: this.protocol,
            domain: Constants_1.TOP_LEVEL_DOMAIN
        });
        this.dnsName = MDNSUtil.serializeDNSName({
            name: this.name,
            subtypes: this.subtypes,
            type: this.type,
            protocol: this.protocol,
            domain: Constants_1.TOP_LEVEL_DOMAIN
        });
    }
    async spread(options = {}) {
        if (options.probe !== false) {
            const query = new Query_1.default({
                questions: [{
                        name: this.dnsName,
                        type: "ANY"
                    }]
            });
            const queryRes = await this.server.queryAndListen(query);
            if (queryRes && queryRes.answers.length > 0) {
                throw new Error("service_exists");
            }
        }
        const answers = this.getServiceRecords();
        const additionals = this.getAddressRecords();
        const res = Response_1.default.parse(Response_1.default.serialize({ answers, additionals }, this.server.transportOptions), this.server.transportOptions);
        await this.broadcast(res, 1000);
        this.server.addService(this);
    }
    getServiceRecords() {
        return [
            new records_1.PTR({ name: Constants_1.WILDCARD, data: this.dnsType }),
            new records_1.PTR({ name: this.dnsType, data: this.dnsName }),
            new records_1.SRV({ name: this.dnsName, data: { target: this.hostname, port: this.port } }),
            new records_1.TXT({ name: this.dnsName, data: this.txt })
        ];
    }
    getAddressRecords() {
        const records = [];
        for (const { address, family } of this.server.transport.getAddresses()) {
            if (family === "IPv4") {
                records.push(new records_1.A({ name: this.hostname, data: address }));
            }
            else {
                records.push(new records_1.AAAA({ name: this.hostname, data: address }));
            }
        }
        return records;
    }
    async broadcast(res, delay) {
        if (this.destroyed)
            return;
        debugLog("broadcast");
        await this.server.transport.respond(res);
        const records = res.answers.concat(res.additionals);
        for (const record of records) {
            this.server.recordRegistry.add(record);
        }
        this.spreaded = true;
        delay = Math.min(delay * Constants_1.REANNOUNCE_FACTOR, Constants_1.REANNOUNCE_MAX_MS);
        this.broadcastDelay = setTimeout(async () => await this.broadcast(res, delay), delay);
    }
    async hide() {
        clearTimeout(this.broadcastDelay);
        await this.sendGoodbye();
        await new Promise(resolve => setTimeout(() => resolve(), 100));
        this.spreaded = false;
    }
    async sendGoodbye() {
        debugLog("goodbye");
        const records = [new records_1.PTR({ name: this.dnsType, data: this.dnsName })];
        for (const record of records) {
            record.ttl = 0;
        }
        const res = new Response_1.default({ answers: records });
        await this.server.transport.respond(res);
        for (const record of records) {
            this.server.recordRegistry.remove(record);
        }
        debugLog("goodbye sent");
    }
    async destroy() {
        if (this.destroyed)
            return;
        this.destroyed = true;
        debugLog("destroy");
        await this.hide();
        debugLog("destroyed");
        this.emit("destroy");
    }
}
exports.default = Service;
