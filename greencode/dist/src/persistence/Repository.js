"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
class Repository {
    filePath;
    storage;
    journal;
    entidade;
    idKey;
    constructor(filePath, storage, journal, entidade, idKey = (value) => value.id) {
        this.filePath = filePath;
        this.storage = storage;
        this.journal = journal;
        this.entidade = entidade;
        this.idKey = idKey;
    }
    all() { return this.storage.read(this.filePath, []); }
    get(id) { return this.all().find(x => this.idKey(x) === id); }
    save(value, usuario, operacao = 'SALVAR') {
        const values = this.all();
        const index = values.findIndex(x => this.idKey(x) === this.idKey(value));
        const antes = index >= 0 ? values[index] : null;
        this.journal.registrar({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            timestamp: new Date().toISOString(),
            operacao,
            entidade: this.entidade,
            dadosAntes: antes,
            dadosDepois: value,
            usuarioResponsavel: usuario
        });
        if (index >= 0)
            values[index] = value;
        else
            values.push(value);
        this.storage.write(this.filePath, values);
    }
    remove(id, usuario) {
        const values = this.all();
        const antes = values.find(x => this.idKey(x) === id);
        if (!antes)
            return;
        this.journal.registrar({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            timestamp: new Date().toISOString(),
            operacao: 'REMOVER', entidade: this.entidade,
            dadosAntes: antes, dadosDepois: null, usuarioResponsavel: usuario
        });
        this.storage.write(this.filePath, values.filter(x => this.idKey(x) !== id));
    }
}
exports.Repository = Repository;
