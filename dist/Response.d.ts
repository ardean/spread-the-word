import Record from "./Records/Record";
export interface ResponseOptions {
    answers?: Record[];
    additionals?: Record[];
}
export default class Response {
    answers: Record[];
    additionals: Record[];
    constructor(options?: ResponseOptions);
}
