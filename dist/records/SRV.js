"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Record_1 = __importDefault(require("./Record"));
class SRV extends Record_1.default {
    constructor({ name, data: { target, port }, ttl }) {
        super("SRV");
        this.name = name;
        this.data = {
            target,
            port
        };
        this.ttl = typeof ttl === "number" ? ttl : 120;
    }
}
exports.default = SRV;
