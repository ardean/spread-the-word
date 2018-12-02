import SRV from "./record/SRV";
import TXT from "./record/TXT";
import * as MDNSUtils from "./MDNSUtils";
import AddressRecord from "./record/AddressRecord";
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
