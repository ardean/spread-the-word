export default class Record {
  name: string;
  type: string;
  ttl: number;
  timestamp: Date;
  // tslint:disable-next-line:no-any
  data: any;

  constructor(type: string) {
    this.type = type;
    this.timestamp = new Date();
  }
}