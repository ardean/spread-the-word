"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TXT = exports.PTR = exports.SRV = exports.AAAA = exports.A = exports.default = exports.Record = void 0;
var Record_1 = require("./Record");
Object.defineProperty(exports, "Record", { enumerable: true, get: function () { return __importDefault(Record_1).default; } });
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(Record_1).default; } });
var A_1 = require("./A");
Object.defineProperty(exports, "A", { enumerable: true, get: function () { return __importDefault(A_1).default; } });
var AAAA_1 = require("./AAAA");
Object.defineProperty(exports, "AAAA", { enumerable: true, get: function () { return __importDefault(AAAA_1).default; } });
var SRV_1 = require("./SRV");
Object.defineProperty(exports, "SRV", { enumerable: true, get: function () { return __importDefault(SRV_1).default; } });
var PTR_1 = require("./PTR");
Object.defineProperty(exports, "PTR", { enumerable: true, get: function () { return __importDefault(PTR_1).default; } });
var TXT_1 = require("./TXT");
Object.defineProperty(exports, "TXT", { enumerable: true, get: function () { return __importDefault(TXT_1).default; } });
