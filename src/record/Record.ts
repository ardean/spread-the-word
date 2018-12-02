export default class Record {
  name: string;
  type: string;
  ttl: number;
  timestamp: Date;
  data: any;

  constructor(type: string) {
    this.type = type;
    this.timestamp = new Date();
  }
}