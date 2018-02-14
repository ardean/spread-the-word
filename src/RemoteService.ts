import SRV from "./Records/SRV";
import * as MDNSUtils from "./MDNSUtils";

export default class RemoteService {
  name: string;
  hostname: string;
  port: number;

  constructor(record: SRV) {
    const { name } = MDNSUtils.parseDNSName(record.name);

    this.name = name;
    this.hostname = record.data.target;
    this.port = record.data.port;
  }
}