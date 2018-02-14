import Record from "./Records/Record";
import SRV from "./Records/SRV";
export default class RecordRegistry {
    records: Record[];
    add(record: Record): Record;
    addAll(records: Record[]): any[];
    remove(record: Record): Record;
    removeAll(records?: Record[]): Record[];
    tracePTR(name: string): Record[];
    findSRVByName(name: string): SRV;
    findSRVsByType(type: string): SRV[];
    find(filter?: (record: Record, index: number) => any): Record[];
    findOne(filter: (record: Record, index: number) => any): Record;
    keepHouse(): void;
}
