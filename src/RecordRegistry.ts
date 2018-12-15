import TXT from "./records/TXT";
import SRV from "./records/SRV";
import Record from "./records/Record";
import * as MDNSUtil from "./MDNSUtil";
import AddressRecord from "./records/AddressRecord";

export default class RecordRegistry {
  records: Record[] = [];

  add(record: Record): Record {
    const cached = this.findOne(x => MDNSUtil.sameRecord(x, record));
    if (!cached) {
      this.records.push(record);
      return record;
    }

    this.records.splice(this.records.indexOf(cached), 1, record);

    return record;
  }

  addAll(records: Record[]) {
    const addedRecords = [];

    for (const record of records) {
      const addedRecord = this.add(record);
      if (addedRecord) addedRecords.push(addedRecord);
    }

    return addedRecords;
  }

  remove(record: Record): Record {
    const cached = this.findOne(x => MDNSUtil.sameRecord(x, record));
    if (!cached) return;

    this.records.splice(this.records.indexOf(cached), 1);
    return cached;
  }

  removeAll(records?: Record[]): Record[] {
    records = records || this.records.concat();

    const removedRecords = [];
    for (const record of records) {
      const removedRecord = this.remove(record);
      if (removedRecord) removedRecords.push(removedRecord);
    }

    return removedRecords;
  }

  findUnresolved() {
    const pointerRecords = this.find(x => x.type === "PTR");
    return pointerRecords.filter(x => this.tracePTR(x.data).length === 0);
  }

  tracePTR(name: string): Record[] {
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

  findOneSRVByName(name: string): SRV {
    return this.tracePTR(name).find(x => x.type === "SRV");
  }

  findOneTXTByName(name: string): TXT {
    return this.tracePTR(name).find(x => x.type === "TXT");
  }

  findSRVsByType(type: string): SRV[] {
    const otherRecords = this.tracePTR(type);

    const srvRecords = [];
    for (const otherRecord of otherRecords) {
      if (otherRecord.type === "SRV") srvRecords.push(otherRecord);
    }

    return srvRecords;
  }

  findAddressRecordsByHostname(hostname: string): AddressRecord[] {
    return this.find(x => (x.type === "A" || x.type === "AAAA") && x.name === hostname);
  }

  find(filter?: (record: Record, index: number) => boolean) {
    this.keepHouse();

    return filter ?
      this.records.filter((record, index) => filter(record, index)) :
      this.records.concat();
  }

  findOne(filter: (record: Record, index: number) => boolean) {
    return this.find().find(filter);
  }

  keepHouse() {
    const now = new Date().valueOf();
    this.records = this.records.filter(x => (x.timestamp.valueOf() + (x.ttl * 1000)) > now);
  }
}