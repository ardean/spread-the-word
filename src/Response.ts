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
    this.answers = options.answers || [];
    this.additionals = options.additionals || [];
  }

  static parse(options: ResponseOptions, parseOptions?) {
    const answers = (options.answers || [])
      .map(x => MDNSUtils.parseRecord(x, parseOptions))
      .filter(x => x);
    const additionals = (options.additionals || [])
      .map(x => MDNSUtils.parseRecord(x, parseOptions))
      .filter(x => x);

    return new Response({
      ...options,
      answers,
      additionals
    });
  }

  static serialize(options: ResponseOptions, serializeOptions?) {
    const answers = (options.answers || [])
      .map(x => MDNSUtils.serializeRecord(x, serializeOptions))
      .filter(x => x);
    const additionals = (options.additionals || [])
      .map(x => MDNSUtils.serializeRecord(x, serializeOptions))
      .filter(x => x);

    return new Response({
      ...options,
      answers,
      additionals
    });
  }
}