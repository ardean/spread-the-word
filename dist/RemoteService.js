"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtil = __importStar(require("./MDNSUtil"));
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
        this.txt = txtRecord ? txtRecord.data : null;
    }
}
exports.default = RemoteService;
