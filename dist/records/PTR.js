"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = require("./Record");
class PTR extends Record_1.default {
    constructor({ name, data, ttl }) {
        super("PTR");
        this.name = name;
        this.data = data;
        this.ttl = typeof ttl === "number" ? ttl : 28800;
    }
}
exports.default = PTR;
