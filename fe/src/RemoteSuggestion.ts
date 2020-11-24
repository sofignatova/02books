export default class RemoteSuggestion {
  readonly word: string;
  readonly levelOfMastery: number;
  readonly isNew: boolean;

  constructor(word: string, levelOfMastery: number, isNew: boolean) {
    this.word = word;
    this.levelOfMastery = levelOfMastery;
    this.isNew = isNew;
  }

  toString(): string {
    return (
      `[word="${this.word}" ` +
      `levelOfMastery=${this.levelOfMastery} ` +
      `isNew=${this.isNew}]`
    );
  }
}
