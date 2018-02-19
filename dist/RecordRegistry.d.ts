import Record from "./Records/Record";
import SRV from "./Records/SRV";
import TXT from "./Records/TXT";
import AddressRecord from "./Records/AddressRecord";
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
    find(filter?: (record: Record, index: number) => any): Record[];
    findOne(filter: (record: Record, index: number) => any): Record;
    keepHouse(): void;
}
