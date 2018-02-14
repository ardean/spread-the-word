export default class Question {
  name: string;
  type: string;

  constructor({ name, type }: { name?: string, type?: string } = {}) {
    this.name = name;
    this.type = type;
  }
}