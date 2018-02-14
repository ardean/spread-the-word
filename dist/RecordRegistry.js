"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MDNSUtils = require("./MDNSUtils");
class RecordRegistry {
    constructor() {
        this.records = [];
    }
    add(record) {
        const cached = this.findOne(x => MDNSUtils.sameRecord(x, record));
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
        const cached = this.findOne(x => MDNSUtils.sameRecord(x, record));
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
    findSRVByName(name) {
        return this.tracePTR(name).find(x => x.type === "SRV");
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
