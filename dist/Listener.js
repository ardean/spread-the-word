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
const MDNSUtils = require("./MDNSUtils");
const RemoteService_1 = require("./RemoteService");
const Constants_1 = require("./Constants");
const events_1 = require("events");
const debug = require("debug");
const Query_1 = require("./Query");
const debugLog = debug("SpreadTheWord:Listener");
class Listener extends events_1.EventEmitter {
    constructor(server, options = {}) {
        super();
        this.remoteServices = [];
        this.server = server;
        this.wildcard = !options.type;
        if (!this.wildcard) {
            this.typeName = MDNSUtils.stringifyDNSName({
                name: options.name,
                subtypes: options.subtypes,
                type: options.type,
                protocol: options.protocol || "tcp",
                domain: Constants_1.TOP_LEVEL_DOMAIN
            });
            this.wildcard = false;
        }
        this.onResponse = this.onResponse.bind(this);
    }
    listen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.on("response", this.onResponse);
            this.server.on("ownResponse", this.onResponse);
            const query = new Query_1.default({
                questions: [{
                        name: this.typeName || Constants_1.WILDCARD,
                        type: "PTR"
                    }]
            });
            yield this.server.transport.query(query);
        });
    }
    onResponse(res, referrer) {
        const srvRecords = this.server.recordRegistry.findSRVsByType(this.typeName || Constants_1.WILDCARD);
        for (const srvRecord of srvRecords) {
            const name = MDNSUtils.parseDNSName(srvRecord.name).name;
            const remoteService = this.remoteServices.find(x => x.name === name);
            if (!remoteService) {
                const addressRecords = this.server.recordRegistry.findAddressRecordsByHostname(srvRecord.data.target);
                const txtRecord = this.server.recordRegistry.findOneTXTByName(srvRecord.name);
                this.addRemoteService(srvRecord, txtRecord, addressRecords, res, referrer);
            }
        }
        for (const remoteService of this.remoteServices) {
            const srvRecord = srvRecords.find(x => {
                return MDNSUtils.parseDNSName(x.name).name === remoteService.name;
            });
            if (!srvRecord)
                this.removeRemoteService(remoteService.name, res, referrer);
        }
    }
    destroy() {
        this.server.removeListener("response", this.onResponse);
        this.server.removeListener("ownResponse", this.onResponse);
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
}
exports.default = Listener;
