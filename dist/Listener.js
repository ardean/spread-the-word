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
const debug_1 = __importDefault(require("debug"));
const Query_1 = __importDefault(require("./Query"));
const events_1 = require("events");
const MDNSUtil = __importStar(require("./MDNSUtil"));
const RemoteService_1 = __importDefault(require("./RemoteService"));
const Constants_1 = require("./Constants");
const debugLog = (0, debug_1.default)("SpreadTheWord:Listener");
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
        this.emit("destroy");
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
