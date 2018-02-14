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
const ProductionServer_1 = require("./ProductionServer");
const Service_1 = require("./Service");
class SpreadTheWord extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.services = [];
        this.status = "Stopped";
    }
    init(options) {
        if (this.status !== "Stopped")
            return;
        this.status = "Started";
        this.server = new ProductionServer_1.default(options);
    }
    spread(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            const service = new Service_1.default(this.server, options);
            service.once("destroy", () => {
                this.services.splice(this.services.indexOf(service), 1);
            });
            yield service.spread();
            this.services.push(service);
            return service;
        });
    }
    listen(options) {
        return __awaiter(this, void 0, void 0, function* () {
            this.init();
            this.listener = new Listener_1.default(this.server, options);
            this.listener
                .on("up", service => {
                this.emit("up", service);
            })
                .on("down", service => {
                this.emit("down", service);
            });
            yield this.listener.listen();
            return this.listener;
        });
    }
}
exports.default = SpreadTheWord;
