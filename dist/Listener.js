"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Query_1 = require("./Query");
const debug = require("debug");
const events_1 = require("events");
const MDNSUtil = require("./MDNSUtil");
const RemoteService_1 = require("./RemoteService");
const Constants_1 = require("./Constants");
const debugLog = debug("SpreadTheWord:Listener");
class Listener extends events_1.EventEmitter {
    constructor(server, options = {}) {
        super();
        this.remoteServices = [];
        this.onResponse = async (res, referrer) => {
            const srvRecords = this.server.recordRegistry.findSRVsByType(this.typeName || Constants_1.WILDCARD);
            for (const srvRecord of srvRecords) {
                const port = srvRecord.data.port;
                const name = MDNSUtil.parseDNSName(srvRecord.name).name;
                const remoteService = this.remoteServices.find(x => x.name === name &&
                    x.port === port);
                if (!remoteService) {
                    const addressRecords = this.server.recordRegistry.findAddressRecordsByHostname(srvRecord.data.target);
                    const txtRecord = this.server.recordRegistry.findOneTXTByName(srvRecord.name);
                    this.addRemoteService(srvRecord, txtRecord, addressRecords, res, referrer);
                }
            }
            for (const remoteService of this.remoteServices) {
                const port = remoteService.port;
                const name = remoteService.name;
                const srvRecord = srvRecords.find(x => MDNSUtil.parseDNSName(x.name).name === name &&
                    x.data.port === port);
                if (!srvRecord)
                    this.removeRemoteService(remoteService.name, res, referrer);
            }
            await this.queryUnresolvedRecords();
        };
        this.server = server;
        this.wildcard = !options.type;
        if (!this.wildcard) {
            this.typeName = MDNSUtil.serializeDNSName({
                name: options.name,
                subtypes: options.subtypes,
                type: options.type,
                protocol: options.protocol || "tcp",
                domain: Constants_1.TOP_LEVEL_DOMAIN
            });
        }
    }
    async listen() {
        this.server.on("response", this.onResponse);
        await this.requery();
    }
    async query() {
        const query = new Query_1.default({
            questions: [{
                    name: this.typeName || Constants_1.WILDCARD,
                    type: "PTR"
                }]
        });
        await this.server.transport.query(query);
    }
    async requery(delay = 1000) {
        await this.query();
        delay = Math.min(delay * Constants_1.REQUERY_FACTOR, Constants_1.REQUERY_MAX_MS);
        this.requeryDelay = setTimeout(async () => await this.requery(delay), delay);
    }
    destroy() {
        clearTimeout(this.requeryDelay);
        this.server.removeListener("response", this.onResponse);
    }
    addRemoteService(record, txtRecord, addressRecords, res, referrer) {
        const remoteService = new RemoteService_1.default(record, txtRecord, addressRecords);
        this.remoteServices.push(remoteService);
        debugLog("up", remoteService.name, remoteService.hostname, remoteService.port);
        this.emit("up", remoteService, res, referrer);
    }
    removeRemoteService(name, res, referrer) {
        const remoteService = this.remoteServices.find(x => x.name === name);
        if (!remoteService)
            return;
        this.remoteServices.splice(this.remoteServices.indexOf(remoteService), 1);
        debugLog("down", remoteService.name, remoteService.hostname, remoteService.port);
        this.emit("down", remoteService, res, referrer);
    }
    async queryUnresolvedRecords() {
        const unresolvedRecords = this.server.recordRegistry.findUnresolved();
        const questions = [];
        for (const unresolvedRecord of unresolvedRecords) {
            debugLog("querying unresolved record", unresolvedRecord.data);
            questions.push({
                name: unresolvedRecord.data,
                type: "ANY"
            });
        }
        const query = new Query_1.default({ questions });
        await this.server.transport.query(query);
    }
}
exports.default = Listener;
