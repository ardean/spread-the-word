import SRV from "./Records/SRV";
import * as MDNSUtils from "./MDNSUtils";
import AddressRecord from "./Records/AddressRecord";

export default class RemoteService {
  name: string;
  hostname: string;
  port: number;
  addresses: string[];

  constructor(record: SRV, addressRecords: AddressRecord[] = []) {
    const { name } = MDNSUtils.parseDNSName(record.name);

    this.name = name;
    this.hostname = record.data.target;
    this.port = record.data.port;
    this.addresses = addressRecords.map(x => x.data);
  }
}