"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Question_1 = __importDefault(require("./Question"));
class Query {
    constructor(options) {
        this.questions = (options.questions || []).map(x => new Question_1.default(x));
    }
}
exports.default = Query;
