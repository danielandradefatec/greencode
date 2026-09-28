"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.novoId = void 0;
const node_crypto_1 = require("node:crypto");
const novoId = (prefixo) => `${prefixo}-${(0, node_crypto_1.randomUUID)().slice(0, 8).toUpperCase()}`;
exports.novoId = novoId;
