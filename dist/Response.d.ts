import Record from "./records/Record";
export interface ResponseOptions {
    answers?: Record[];
    additionals?: Record[];
}
export default class Response {
    answers: Record[];
    additionals: Record[];
    constructor(options?: ResponseOptions);
    static parse(options: ResponseOptions, parseOptions?: any): Response;
    static serialize(options: ResponseOptions, serializeOptions?: any): Response;
}
