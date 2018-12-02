"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Record {
    constructor(type) {
        this.type = type;
        this.timestamp = new Date();
    }
}
exports.default = Record;
