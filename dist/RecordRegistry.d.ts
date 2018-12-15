import TXT from "./records/TXT";
import SRV from "./records/SRV";
import Record from "./records/Record";
import AddressRecord from "./records/AddressRecord";
export default class RecordRegistry {
    records: Record[];
    add(record: Record): Record;
    addAll(records: Record[]): any[];
    remove(record: Record): Record;
    removeAll(records?: Record[]): Record[];
    findUnresolved(): Record[];
    tracePTR(name: string): Record[];
    findOneSRVByName(name: string): SRV;
    findOneTXTByName(name: string): TXT;
    findSRVsByType(type: string): SRV[];
    findAddressRecordsByHostname(hostname: string): AddressRecord[];
    find(filter?: (record: Record, index: number) => boolean): Record[];
    findOne(filter: (record: Record, index: number) => boolean): Record;
    keepHouse(): void;
}
