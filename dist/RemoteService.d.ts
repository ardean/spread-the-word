import SRV from "./Records/SRV";
import TXT from "./Records/TXT";
import * as MDNSUtils from "./MDNSUtils";
import AddressRecord from "./Records/AddressRecord";
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
