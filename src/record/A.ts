import Record from "./Record";

export default class A extends Record {
  name: string;
  data: string;

  constructor({ name, data, ttl }: { name: string, data: string, ttl?: number }) {
    super("A");

    this.name = name;
    this.data = data;
    this.ttl = typeof ttl === "number" ? ttl : 120;
  }
}