import Record from "./Record";

export default class SRV extends Record {
  name: string;
  data: { target: string, port: number };

  constructor({ name, data: { target, port }, ttl }: { name: string, data: { target: string, port: number }, ttl?: number }) {
    super("SRV");

    this.name = name;
    this.data = {
      target,
      port
    };
    this.ttl = typeof ttl === "number" ? ttl : 120;
  }
}