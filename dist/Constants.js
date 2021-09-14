"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUERY_FACTOR = exports.REQUERY_MAX_MS = exports.REANNOUNCE_FACTOR = exports.REANNOUNCE_MAX_MS = exports.WILDCARD = exports.TOP_LEVEL_DOMAIN = void 0;
exports.TOP_LEVEL_DOMAIN = "local";
exports.WILDCARD = "_services._dns-sd._udp." + exports.TOP_LEVEL_DOMAIN;
exports.REANNOUNCE_MAX_MS = 60 * 60 * 1000;
exports.REANNOUNCE_FACTOR = 3;
exports.REQUERY_MAX_MS = 60 * 60 * 1000;
exports.REQUERY_FACTOR = 1.5;
