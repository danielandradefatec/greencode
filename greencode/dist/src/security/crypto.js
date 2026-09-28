"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarChaveMestra = gerarChaveMestra;
exports.criptografar = criptografar;
exports.descriptografar = descriptografar;
exports.gerarSalt = gerarSalt;
exports.hashSenha = hashSenha;
exports.senhaValida = senhaValida;
const node_crypto_1 = require("node:crypto");
const ALGORITHM = 'aes-256-gcm';
const IV_SIZE = 12;
function gerarChaveMestra() {
    return (0, node_crypto_1.randomBytes)(32).toString('base64');
}
function keyBuffer(chave) {
    const key = Buffer.from(chave, 'base64');
    if (key.length !== 32)
        throw new Error('Chave mestra inválida.');
    return key;
}
function criptografar(texto, chave) {
    const key = keyBuffer(chave);
    const iv = (0, node_crypto_1.randomBytes)(IV_SIZE);
    const cipher = (0, node_crypto_1.createCipheriv)(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
}
function descriptografar(payload, chave) {
    const key = keyBuffer(chave);
    const raw = Buffer.from(payload, 'base64');
    if (raw.length < IV_SIZE + 16)
        throw new Error('Payload criptografado inválido.');
    const iv = raw.subarray(0, IV_SIZE);
    const tag = raw.subarray(IV_SIZE, IV_SIZE + 16);
    const encrypted = raw.subarray(IV_SIZE + 16);
    const decipher = (0, node_crypto_1.createDecipheriv)(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
function gerarSalt() {
    return (0, node_crypto_1.randomBytes)(16).toString('hex');
}
function hashSenha(senha, salt) {
    return (0, node_crypto_1.scryptSync)(senha, salt, 32).toString('hex');
}
function senhaValida(senha, salt, hashEsperado) {
    const hash = hashSenha(senha, salt);
    return timingSafeEqualHex(hash, hashEsperado);
}
function timingSafeEqualHex(a, b) {
    if (a.length !== b.length)
        return false;
    return (0, node_crypto_1.createHash)('sha256').update(a).digest('hex') === (0, node_crypto_1.createHash)('sha256').update(b).digest('hex');
}
