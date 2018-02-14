import Record from "./Record";
export default class TXT extends Record {
    name: string;
    data: string;
    constructor({name, data, ttl}: {
        name: string;
        data: string;
        ttl?: number;
    });
}
