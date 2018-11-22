"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Listener_1 = require("./Listener");
const Server_1 = require("./Server");
const Service_1 = require("./Service");
class SpreadTheWord extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.services = [];
        this.status = "Uninitialized";
    }
    init(options) {
        if (this.status !== "Uninitialized")
            return;
        this.status = "Spreaded";
        this.server = new Server_1.default(options);
    }
    spread(options, serverOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status === "Destroyed")
                return;
            this.init(serverOptions);
            const service = new Service_1.default(this.server, options);
            service.once("destroy", () => {
                this.services.splice(this.services.indexOf(service), 1);
            });
            yield service.spread();
            this.services.push(service);
            return service;
        });
    }
    listen(options, serverOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status === "Destroyed")
                return;
            this.init(serverOptions);
            const listener = new Listener_1.default(this.server, options);
            listener
                .on("up", (remoteService, res, referrer) => this.emit("up", remoteService, res, referrer))
                .on("down", (remoteService, res, referrer) => this.emit("down", remoteService, res, referrer));
            yield listener.listen();
            return listener;
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.status === "Destroyed")
                return;
            this.status = "Destroyed";
            for (const service of this.services) {
                yield service.destroy();
            }
            if (this.server)
                yield this.server.destroy();
            this.emit("destroy");
        });
    }
}
exports.default = SpreadTheWord;
