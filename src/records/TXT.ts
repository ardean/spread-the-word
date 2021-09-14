import debug from "debug";
import Record from "./Record";
import { parseTXTData, serializeTXTData, TXTData } from "../MDNSUtil";

export type DataType = TXTData | Buffer | string;

const debugLog = debug("SpreadTheWord:TXT");

export default class TXT extends Record {
  name: string;
  data: DataType;

  constructor({ name, data, ttl }: { name: string, data: DataType, ttl?: number }) {
    super("TXT");

    this.name = name;
    this.data = data;
    this.ttl = typeof ttl === "number" ? ttl : 4500;
  }

  static parse(record, options: { binary?: boolean } = {}): TXT {
    debugLog("parse", record.data, options);
    const data = parseTXTData(record.data, options);
    debugLog("parse output", data, options);

    return new TXT({
      ...record,
      data
    });
  }

  static serialize(record, options: { binary?: boolean } = {}): TXT {
    debugLog("serialize", record.data, options);
    const data = serializeTXTData(record.data, options);
    debugLog("serialize output", data, options);

    return new TXT({
      ...record,
      data
    });
  }
}