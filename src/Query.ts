import * as MDNSUtils from "./MDNSUtils";
import Question from "./Question";

export interface QueryOptions {
  questions: Question[];
}

export default class Query {
  questions: Question[];

  constructor(options: QueryOptions) {
    this.questions = (options.questions || []).map(x => new Question(x));
  }
}