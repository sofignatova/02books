export class Training {
  readonly sentence: string;
  readonly when?: string; // As ISO-8601
  readonly word_correctness: Array<{ word: string; correct: boolean }>;

  constructor(
    sentence: string,
    word_correctness: Array<{ word: string; correct: boolean }>
  ) {
    this.sentence = sentence;
    this.word_correctness = word_correctness;
  }
}

export class Word {
  readonly word: string;
  readonly levelOfMastery: number;
  readonly isNew: boolean;
  readonly corpusCount?: number;
  readonly removed: boolean;

  constructor(
    word: string,
    levelOfMastery: number,
    isNew: boolean,
    removed: boolean,
    corpusCount: number | undefined
  ) {
    this.word = word;
    this.levelOfMastery = levelOfMastery;
    this.isNew = isNew;
    this.removed = removed;
    this.corpusCount = corpusCount;
  }

  static fromJSON(o: any): Word | Error {
    if (o["word"] === undefined) {
      return new Error("expected 'word', got undefined");
    }

    return new Word(
      o["word"],
      o["level_of_mastery"],
      o["is_new"],
      o["removed"],
      o["corpus_count"]
    );
  }

  static arrayFromJSON(o: any): Word[] | Error {
    if (!Array.isArray(o)) {
      return new Error("expected words to be an array");
    }

    const words = o.map((w: any) => Word.fromJSON(w));
    const error = words.find((w) => w instanceof Error);
    if (error !== undefined) {
      return error as Error;
    }
    return words as Array<Word>;
  }

  toString(): string {
    return (
      `[word="${this.word}" ` +
      `levelOfMastery=${this.levelOfMastery} ` +
      `isNew=${this.isNew} ` +
      `corpusCount=${this.corpusCount} ` +
      `removed=${this.removed}]`
    );
  }
}

export enum CorpusSource {
    Book = "book",
    WordList = "wordlist",
}

export class Corpus {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly link?: string;
  readonly words: Array<Word>;
  readonly source: CorpusSource;
  readonly readerLevel?: number;

  constructor(
    id: string,
    name: string,
    description: string,
    link: string | undefined,
    words: Array<Word>,
    source: CorpusSource,
    readerLevel?: number,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.link = link;
    this.words = words;
    this.source = source;
    this.readerLevel = readerLevel;
  }

  static fromJSON(o: any): Corpus | Error {
    let words = Word.arrayFromJSON(o["words"]);
    if (words instanceof Error) {
      return words;
    }

    let source : CorpusSource;
    switch (o["source"]) {
      case "book":
        source = CorpusSource.Book;
        break;
      case "wordlist":
        source = CorpusSource.WordList;
        break;
      default:
        return new Error(`unexpected corpus source type "${o["source"]}"`)
    }

    return new Corpus(o["id"], o["name"], o["description"], o["link"], words, source, o["reader_level"]);
  }

  toString(): string {
    return (
      `[id="${this.id}" ` +
      `name=${this.name} ` +
      `description=${this.description} ` +
      `link=${this.link} ` +
      `words=${this.words} ` +
      `source=${this.source} ` + 
      `readerLevel=${this.readerLevel}]`
    );
  }
}

export class User {
  readonly id: string;

  constructor(id: string) {
    this.id = id;
  }

  static fromJSON(o: any): User | Error {
    if (o === undefined) {
      return new Error("expected User, got undefined");
    }
    if (typeof o["id"] !== "string") {
      return new Error("expected user_id to be a string");
    }

    return new User(o["id"]);
  }
}

export type UserSettingsUpdate = {
  selected_corpus_id?: string;
  removed_words?: Array<string>;
};

export class UserSettings {
  readonly selectedCorpusId: string;
  readonly removedWords: Set<string>;

  constructor(selectedCorpusId: string, removedWords: Set<string>) {
    this.selectedCorpusId = selectedCorpusId;
    this.removedWords = removedWords;
  }

  update(u: {
    selectedCorpusId?: string;
    updatedWords?: Array<{ word: string; removed: boolean }>;
  }): [UserSettings, UserSettingsUpdate] {
    let update: UserSettingsUpdate = {};
    let selectedCorpusId = this.selectedCorpusId;
    let removedWords = new Set(this.removedWords);

    if (u.selectedCorpusId !== undefined) {
      selectedCorpusId = u.selectedCorpusId;
      update.selected_corpus_id = u.selectedCorpusId;
    }

    if (u.updatedWords !== undefined) {
      for (let update of u.updatedWords) {
        if (update.removed) {
          removedWords.add(update.word);
        } else {
          removedWords.delete(update.word);
        }
      }
      update.removed_words = Array.from(removedWords);
    }

    return [new UserSettings(selectedCorpusId, removedWords), update];
  }

  static fromJSON(o: any): UserSettings | Error {
    if (o === undefined) {
      return new Error("expected UserSettings, got undefined");
    }
    if (typeof o["selected_corpus_id"] !== "string") {
      return new Error("expected selected_corpus_id to be a string");
    }

    if (!Array.isArray(o["removed_words"])) {
      return new Error("expected removed_words to be an array");
    }

    return new UserSettings(
      o["selected_corpus_id"],
      new Set(o["removed_words"])
    );
  }

  toString(): string {
    return (
      `[selectedCorpusId="${this.selectedCorpusId}" ` +
      `removedWords=${this.removedWords}]`
    );
  }
}
