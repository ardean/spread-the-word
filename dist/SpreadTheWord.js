"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const Server_1 = require("./Server");
const Service_1 = require("./Service");
const Listener_1 = require("./Listener");
class SpreadTheWord extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.servicesList = [];
        this.listenersList = [];
        this.status = "uninitialized";
    }
    init(options) {
        if (this.status !== "uninitialized")
            return;
        this.status = "spreaded";
        this.server = new Server_1.default(options);
    }
    async spread(options, serverOptions) {
        if (this.status === "destroyed")
            return;
        this.init(serverOptions);
        const service = new Service_1.default(this.server, options);
        service.once("destroy", () => {
            this.servicesList.splice(this.servicesList.indexOf(service), 1);
        });
        await service.spread();
        this.servicesList.push(service);
        return service;
    }
    async listen(options, serverOptions) {
        if (this.status === "destroyed")
            return;
        this.init(serverOptions);
        const listener = new Listener_1.default(this.server, options);
        listener
            .on("up", (remoteService, res, referrer) => this.emit("up", remoteService, res, referrer))
            .on("down", (remoteService, res, referrer) => this.emit("down", remoteService, res, referrer))
            .once("destroy", () => {
            this.listenersList.splice(this.listenersList.indexOf(listener), 1);
        });
        await listener.listen();
        this.listenersList.push(listener);
        return listener;
    }
    async destroy() {
        if (this.status === "destroyed")
            return;
        this.status = "destroyed";
        for (const service of this.servicesList) {
            await service.destroy();
        }
        for (const listener of this.listenersList) {
            await listener.destroy();
        }
        if (this.server)
            await this.server.destroy();
        this.emit("destroy");
    }
}
exports.default = SpreadTheWord;
