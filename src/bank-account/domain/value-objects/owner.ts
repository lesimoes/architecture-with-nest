export class Owner {
  constructor(
    public name: string,
    public document: string,
  ) {}

  equals(owner: Owner): boolean {
    return this.name === owner.name && this.document === owner.document;
  }
}
