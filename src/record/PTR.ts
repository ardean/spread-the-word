import Record from "./Record";

export default class PTR extends Record {
  name: string;
  data: string;

  constructor({ name, data, ttl }: { name: string, data: string, ttl?: number }) {
    super("PTR");

    this.name = name;
    this.data = data;
    this.ttl = typeof ttl === "number" ? ttl : 28800;
  }
}