import Record from "./Records/Record";
import * as MDNSUtils from "./MDNSUtils";

export interface ResponseOptions {
  answers?: Record[];
  additionals?: Record[];
}

export default class Response {
  answers: Record[];
  additionals: Record[] = [];

  constructor(options: ResponseOptions = {}) {
    this.answers = (options.answers || []).map(x => MDNSUtils.parseRecord(x)).filter(x => x);
    this.additionals = (options.additionals || []).map(x => MDNSUtils.parseRecord(x)).filter(x => x);
  }
}