"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Referrer {
    constructor({ address, family, port, size } = {}) {
        this.address = address;
        this.family = family;
        this.port = port;
        this.size = size;
    }
}
exports.default = Referrer;
