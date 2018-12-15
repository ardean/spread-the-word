"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const Query_1 = require("./Query");
const debug = require("debug");
const Response_1 = require("./Response");
const events_1 = require("events");
const MDNSUtil = require("./MDNSUtil");
const records_1 = require("./records");
const Constants_1 = require("./Constants");
const debugLog = debug("SpreadTheWord:Service");
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
        this.hostname = options.hostname || os.hostname() + "." + Constants_1.TOP_LEVEL_DOMAIN;
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
        setTimeout(async () => await this.broadcast(res, delay), delay);
    }
    async hide() {
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
