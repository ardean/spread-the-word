import SRV from "./records/SRV";
import TXT from "./records/TXT";
import * as MDNSUtils from "./MDNSUtils";
import AddressRecord from "./records/AddressRecord";
export default class RemoteService {
    name: string;
    type: string;
    subtypes: string[];
    protocol: string;
    domain: string;
    hostname: string;
    port: number;
    txt?: MDNSUtils.TXTData;
    addresses: string[];
    constructor(record: SRV, txtRecord: TXT, addressRecords?: AddressRecord[]);
}
