import TXT from "./record/TXT";
import SRV from "./record/SRV";
import Record from "./record/Record";
import AddressRecord from "./record/AddressRecord";
export default class RecordRegistry {
    records: Record[];
    add(record: Record): Record;
    addAll(records: Record[]): any[];
    remove(record: Record): Record;
    removeAll(records?: Record[]): Record[];
    tracePTR(name: string): Record[];
    findOneSRVByName(name: string): SRV;
    findOneTXTByName(name: string): TXT;
    findSRVsByType(type: string): SRV[];
    findAddressRecordsByHostname(hostname: string): AddressRecord[];
    find(filter?: (record: Record, index: number) => boolean): Record[];
    findOne(filter: (record: Record, index: number) => boolean): Record;
    keepHouse(): void;
}
