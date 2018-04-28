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

  constructor(record: SRV, txtRecord: TXT, addressRecords: AddressRecord[] = []) {
    const { name, type, subtypes, protocol, domain } = MDNSUtils.parseDNSName(record.name);

    this.name = name;
    this.type = type;
    this.subtypes = subtypes;
    this.protocol = protocol;
    this.domain = domain;
    this.hostname = record.data.target;
    this.port = record.data.port;
    this.addresses = addressRecords.map(x => x.data);
    this.txt = txtRecord.data as MDNSUtils.TXTData;
  }
}