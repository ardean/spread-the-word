import Record from "./Record";

export default class AAAA extends Record {
  name: string;
  data: string;

  constructor({ name, data, ttl }: { name: string, data: string, ttl?: number }) {
    super("AAAA");

    this.name = name;
    this.data = data;
    this.ttl = typeof ttl === "number" ? ttl : 120;
  }
}