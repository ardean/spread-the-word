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
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtil = __importStar(require("./MDNSUtil"));
class RecordRegistry {
    constructor() {
        this.records = [];
    }
    add(record) {
        const cached = this.findOne(x => MDNSUtil.sameRecord(x, record));
        if (!cached) {
            this.records.push(record);
            return record;
        }
        this.records.splice(this.records.indexOf(cached), 1, record);
        return record;
    }
    addAll(records) {
        const addedRecords = [];
        for (const record of records) {
            const addedRecord = this.add(record);
            if (addedRecord)
                addedRecords.push(addedRecord);
        }
        return addedRecords;
    }
    remove(record) {
        const cached = this.findOne(x => MDNSUtil.sameRecord(x, record));
        if (!cached)
            return;
        this.records.splice(this.records.indexOf(cached), 1);
        return cached;
    }
    removeAll(records) {
        records = records || this.records.concat();
        const removedRecords = [];
        for (const record of records) {
            const removedRecord = this.remove(record);
            if (removedRecord)
                removedRecords.push(removedRecord);
        }
        return removedRecords;
    }
    findUnresolved() {
        const pointerRecords = this.find(x => x.type === "PTR");
        return pointerRecords.filter(x => this.tracePTR(x.data).length === 0);
    }
    tracePTR(name) {
        const records = this.records.filter(x => x.name === name);
        let otherRecords = [];
        for (const record of records) {
            if (record.type === "PTR") {
                otherRecords = otherRecords.concat(this.tracePTR(record.data));
                continue;
            }
            otherRecords.push(record);
        }
        return otherRecords;
    }
    findOneSRVByName(name) {
        return this.tracePTR(name).find(x => x.type === "SRV");
    }
    findOneTXTByName(name) {
        return this.tracePTR(name).find(x => x.type === "TXT");
    }
    findSRVsByType(type) {
        const otherRecords = this.tracePTR(type);
        const srvRecords = [];
        for (const otherRecord of otherRecords) {
            if (otherRecord.type === "SRV")
                srvRecords.push(otherRecord);
        }
        return srvRecords;
    }
    findAddressRecordsByHostname(hostname) {
        return this.find(x => (x.type === "A" || x.type === "AAAA") && x.name === hostname);
    }
    find(filter) {
        this.keepHouse();
        return filter ?
            this.records.filter((record, index) => filter(record, index)) :
            this.records.concat();
    }
    findOne(filter) {
        return this.find().find(filter);
    }
    keepHouse() {
        const now = new Date().valueOf();
        this.records = this.records.filter(x => (x.timestamp.valueOf() + (x.ttl * 1000)) > now);
    }
}
exports.default = RecordRegistry;
