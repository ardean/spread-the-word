"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Question_1 = require("./Question");
class Query {
    constructor(options) {
        this.questions = (options.questions || []).map(x => new Question_1.default(x));
    }
}
exports.default = Query;
