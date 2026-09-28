import { AtomicFile } from './AtomicFile';
import { Journal } from './Journal';

export class Repository<T> {
  constructor(
    private readonly filePath: string,
    private readonly storage: AtomicFile,
    private readonly journal: Journal,
    private readonly entidade: string,
    private readonly idKey: (value: T) => string = (value: T) => (value as any).id
  ) {}

  all(): T[] { return this.storage.read<T[]>(this.filePath, []); }
  get(id: string): T | undefined { return this.all().find(x => this.idKey(x) === id); }

  save(value: T, usuario: string, operacao = 'SALVAR'): void {
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
    if (index >= 0) values[index] = value; else values.push(value);
    this.storage.write(this.filePath, values);
  }

  remove(id: string, usuario: string): void {
    const values = this.all();
    const antes = values.find(x => this.idKey(x) === id);
    if (!antes) return;
    this.journal.registrar({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      timestamp: new Date().toISOString(),
      operacao: 'REMOVER', entidade: this.entidade,
      dadosAntes: antes, dadosDepois: null, usuarioResponsavel: usuario
    });
    this.storage.write(this.filePath, values.filter(x => this.idKey(x) !== id));
  }
}
