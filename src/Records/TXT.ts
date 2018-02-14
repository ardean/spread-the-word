import Record from "./Record";
import * as dnsTxt from "dns-txt";
const txt = dnsTxt();

export default class TXT extends Record {
  name: string;
  data: string;

  constructor({ name, data, ttl }: { name: string, data: string, ttl?: number }) {
    super("TXT");

    this.name = name;
    this.data = txt.encode(data);
    this.ttl = typeof ttl === "number" ? ttl : 4500;
  }
}