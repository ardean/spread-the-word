export declare type RecordType = "TXT" | "A" | "AAAA" | "PTR" | "SRV" | "ANY";
export default class Record {
    name: string;
    type: RecordType;
    ttl: number;
    timestamp: Date;
    data: any;
    constructor(type: RecordType);
}
