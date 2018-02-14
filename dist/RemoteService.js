"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtils = require("./MDNSUtils");
class RemoteService {
    constructor(record, addressRecords = []) {
        const { name } = MDNSUtils.parseDNSName(record.name);
        this.name = name;
        this.hostname = record.data.target;
        this.port = record.data.port;
        this.addresses = addressRecords.map(x => x.data);
    }
}
exports.default = RemoteService;
