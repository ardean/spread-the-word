import SRV from "./Records/SRV";
import AddressRecord from "./Records/AddressRecord";
export default class RemoteService {
    name: string;
    hostname: string;
    port: number;
    addresses: string[];
    constructor(record: SRV, addressRecords?: AddressRecord[]);
}
