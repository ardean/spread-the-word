"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeTXTData = exports.parseTXTData = exports.serializeRecord = exports.parseRecord = exports.getExternalAddresses = exports.sameRecord = exports.parseDNSName = exports.serializeDNSName = void 0;
const os_1 = __importDefault(require("os"));
const A_1 = __importDefault(require("./records/A"));
const dns_txt_1 = __importDefault(require("dns-txt"));
const TXT_1 = __importDefault(require("./records/TXT"));
const SRV_1 = __importDefault(require("./records/SRV"));
const PTR_1 = __importDefault(require("./records/PTR"));
const AAAA_1 = __importDefault(require("./records/AAAA"));
function serializeDNSName(options) {
    const subtypes = (options.subtypes || [])
        .filter(x => x)
        .map(subtype => "_" + subtype)
        .join(".");
    return [
        options.name,
        subtypes,
        options.type ? "_" + options.type : "",
        options.protocol ? "_" + options.protocol : "",
        options.domain
    ]
        .filter(x => x)
        .join(".");
}
exports.serializeDNSName = serializeDNSName;
function parseDNSName(dnsName) {
    let name = "";
    let domain = "";
    const parts = dnsName.split(".");
    const prefixed = [];
    for (let index = 0; index < parts.length; index++) {
        const part = parts[index];
        if (part[0] === "_") {
            prefixed.push(part.substr(1));
            continue;
        }
        if (index === parts.length - 1) {
            domain = part;
            continue;
        }
        name += part;
    }
    const subtypes = prefixed.slice(0, prefixed.length - 2);
    return {
        name,
        subtypes,
        type: prefixed[prefixed.length - 2],
        protocol: prefixed[prefixed.length - 1],
        domain
    };
}
exports.parseDNSName = parseDNSName;
function sameRecord(a, b) {
    if (a.type !== b.type)
        return false;
    if (a.name !== b.name)
        return false;
    if (typeof a.data !== typeof b.data)
        return false;
    if (a.type === "SRV" && (a.data.target !== b.data.target || a.data.port !== b.data.port))
        return false;
    if (a.type !== "SRV" && a.type !== "TXT" && a.data !== b.data)
        return false;
    return true;
}
exports.sameRecord = sameRecord;
function getExternalAddresses() {
    const interfaceMap = os_1.default.networkInterfaces();
    const interfaceNames = Object.keys(interfaceMap);
    const addresses = [];
    for (const interfaceName of interfaceNames) {
        const interfaces = interfaceMap[interfaceName];
        for (const { internal, family, address } of interfaces) {
            if (internal)
                continue;
            addresses.push({
                family,
                address
            });
        }
    }
    return addresses;
}
exports.getExternalAddresses = getExternalAddresses;
function parseRecord(record, options = {}) {
    if (record.type === "PTR")
        return new PTR_1.default(record);
    if (record.type === "TXT")
        return TXT_1.default.parse(record, { binary: options.binaryTXT });
    if (record.type === "SRV")
        return new SRV_1.default(record);
    if (record.type === "AAAA")
        return new AAAA_1.default(record);
    if (record.type === "A")
        return new A_1.default(record);
    return null;
}
exports.parseRecord = parseRecord;
function serializeRecord(record, options = {}) {
    if (record.type === "PTR")
        return new PTR_1.default(record);
    if (record.type === "TXT")
        return TXT_1.default.serialize(record, { binary: options.binaryTXT });
    if (record.type === "SRV")
        return new SRV_1.default(record);
    if (record.type === "AAAA")
        return new AAAA_1.default(record);
    if (record.type === "A")
        return new A_1.default(record);
    return null;
}
exports.serializeRecord = serializeRecord;
function parseTXTData(data, options = { binary: false }) {
    const result = (0, dns_txt_1.default)({ binary: options.binary }).decode(data);
    return Object.keys(result).length > 0 ? result : null;
}
exports.parseTXTData = parseTXTData;
function serializeTXTData(data, options = { binary: false }) {
    return (0, dns_txt_1.default)({ binary: options.binary }).encode(data);
}
exports.serializeTXTData = serializeTXTData;
