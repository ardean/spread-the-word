"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtil = require("./MDNSUtil");
class RemoteService {
    constructor(record, txtRecord, addressRecords = []) {
        const { name, type, subtypes, protocol, domain } = MDNSUtil.parseDNSName(record.name);
        this.name = name;
        this.type = type;
        this.subtypes = subtypes;
        this.protocol = protocol;
        this.domain = domain;
        this.hostname = record.data.target;
        this.port = record.data.port;
        this.addresses = addressRecords.map(x => x.data);
        this.txt = txtRecord.data;
    }
}
exports.default = RemoteService;
