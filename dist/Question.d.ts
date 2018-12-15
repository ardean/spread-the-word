import { RecordType } from "./records/Record";
export default class Question {
    name: string;
    type: RecordType;
    constructor({ name, type }?: {
        name?: string;
        type?: RecordType;
    });
}
