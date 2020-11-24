from __future__ import annotations

import abc
import dataclasses
import datetime
from typing import Iterable, List, Mapping, Optional


class UserDoesNotExist(Exception):
    pass


@dataclasses.dataclass
class WordResult:
    word: str
    correct: bool

    def to_dict(self) -> Mapping:
        return {"word": self.word, "correct": self.correct}

    @staticmethod
    def from_dict(d: Mapping) -> WordResult:
        return WordResult(word=d["word"], correct=d["correct"])


@dataclasses.dataclass(frozen=True, unsafe_hash=True)
class TrainingResult:
    sentence: str
    word_results: List[WordResult] = dataclasses.field(hash=False)
    when: datetime.datetime = dataclasses.field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc)
    )

    def to_dict(self) -> Mapping:
        return {
            "sentence": self.sentence,
            "word_results": [
                word_result.to_dict() for word_result in self.word_results
            ],
            "when": self.when.isoformat(),
        }

    @staticmethod
    def from_dict(d: Mapping) -> TrainingResult:
        when = datetime.datetime.fromisoformat(d["when"])

        return TrainingResult(
            sentence=d["sentence"],
            word_results=[WordResult.from_dict(x) for x in d["word_results"]],
            when=when,
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

    @staticmethod
    def from_dict(d: Mapping) -> UserSettings:
        return UserSettings(
            selected_corpus_id=d["selected_corpus_id"], removed_words=d["removed_words"]
        )


class Storage(abc.ABC):
    @abc.abstractmethod
    def create_user(self) -> str:
        pass

    @abc.abstractmethod
    def user_exists(self, user_id: str) -> bool:
        pass

    def check_user_exists(self, user_id: str):
        if not self.user_exists(user_id):
            raise UserDoesNotExist(f"user {user_id} does not exist")

    @abc.abstractmethod
    def record_result(self, user: str, result: TrainingResult):
        pass

    @abc.abstractmethod
    def load_results(self, user: str) -> Iterable[TrainingResult]:
        pass

    @abc.abstractmethod
    def load_suggestion_data(self, strategy: str, user: str) -> Mapping:
        pass

    @abc.abstractmethod
    def save_suggestion_data(self, strategy: str, user: str, data: Mapping):
        pass

    @abc.abstractmethod
    def load_user_settings(self, user: str) -> Optional[UserSettings]:
        pass

    @abc.abstractmethod
    def save_user_settings(self, user: str, settings: UserSettings):
        pass
