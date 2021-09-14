"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MDNSUtil = exports.transports = exports.records = exports.SpreadTheWord = exports.Listener = exports.Service = exports.RemoteService = exports.Referrer = exports.Response = exports.Question = exports.Query = exports.Server = void 0;
var Server_1 = require("./Server");
Object.defineProperty(exports, "Server", { enumerable: true, get: function () { return __importDefault(Server_1).default; } });
var Query_1 = require("./Query");
Object.defineProperty(exports, "Query", { enumerable: true, get: function () { return __importDefault(Query_1).default; } });
var Question_1 = require("./Question");
Object.defineProperty(exports, "Question", { enumerable: true, get: function () { return __importDefault(Question_1).default; } });
var Response_1 = require("./Response");
Object.defineProperty(exports, "Response", { enumerable: true, get: function () { return __importDefault(Response_1).default; } });
var Referrer_1 = require("./Referrer");
Object.defineProperty(exports, "Referrer", { enumerable: true, get: function () { return __importDefault(Referrer_1).default; } });
var RemoteService_1 = require("./RemoteService");
Object.defineProperty(exports, "RemoteService", { enumerable: true, get: function () { return __importDefault(RemoteService_1).default; } });
var Service_1 = require("./Service");
Object.defineProperty(exports, "Service", { enumerable: true, get: function () { return __importDefault(Service_1).default; } });
var Listener_1 = require("./Listener");
Object.defineProperty(exports, "Listener", { enumerable: true, get: function () { return __importDefault(Listener_1).default; } });
var SpreadTheWord_1 = require("./SpreadTheWord");
Object.defineProperty(exports, "SpreadTheWord", { enumerable: true, get: function () { return __importDefault(SpreadTheWord_1).default; } });
const records = __importStar(require("./records"));
exports.records = records;
const transports = __importStar(require("./transports"));
exports.transports = transports;
const MDNSUtil = __importStar(require("./MDNSUtil"));
exports.MDNSUtil = MDNSUtil;
const SpreadTheWord_2 = __importDefault(require("./SpreadTheWord"));
exports.default = new SpreadTheWord_2.default();
