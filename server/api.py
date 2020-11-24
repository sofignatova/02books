from __future__ import annotations

import dataclasses
import enum
from typing import List, Mapping, Optional


@dataclasses.dataclass
class Word:
    word: str
    level_of_mastery: float
    is_new: bool
    corpus_count: Optional[int]
    removed: bool

    def to_dict(self) -> Mapping:
        return {
            "word": self.word,
            "level_of_mastery": self.level_of_mastery,
            "is_new": self.is_new,
            "corpus_count": self.corpus_count,
            "removed": self.removed,
        }


@dataclasses.dataclass
class Corpus:
    class CorpusSource(enum.Enum):
        BOOK = "book"
        WORDLIST = "wordlist"

    id_: str
    name: str
    description: float
    link: Optional[str]
    words: List[Word]
    source: CorpusSource
    reader_level: Optional[int]

    def to_dict(self) -> Mapping:
        d = {
            "id": self.id_,
            "name": self.name,
            "description": self.description,
            "words": [word.to_dict() for word in self.words],
            "source": self.source.value,
        }
        if self.link is not None:
            d["link"] = self.link
        if self.reader_level is not None:
            d["reader_level"] = self.reader_level
        return d


@dataclasses.dataclass
class TrainingWord:
    word: str
    correct: bool

    @staticmethod
    def from_dict(d: Mapping) -> TrainingWord:
        return TrainingWord(word=d["word"], correct=d["correct"])


@dataclasses.dataclass(frozen=True, unsafe_hash=True)
class Training:
    sentence: str
    word_correctness: List[TrainingWord] = dataclasses.field(
        default_factory=list, hash=False
    )

    @staticmethod
    def from_dict(d: Mapping) -> Training:
        return Training(
            sentence=d["sentence"],
            word_correctness=[TrainingWord.from_dict(w) for w in d["word_correctness"]],
        )


@dataclasses.dataclass(frozen=True, unsafe_hash=True)
class UserSettings:
    selected_corpus_id: str
    removed_words: List[str] = dataclasses.field(default_factory=list, hash=False)

    def to_dict(self) -> Mapping:
        return {
            "selected_corpus_id": self.selected_corpus_id,
            "removed_words": self.removed_words,
        }
