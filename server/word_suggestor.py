from __future__ import annotations

import abc
import itertools
from typing import AbstractSet, Iterable, Mapping, Optional, Sequence, Tuple


def take_from_word_list(
    word_list: Sequence[str],
    exclude_words: AbstractSet[str],
    count: Optional[int] = None,
) -> Iterable[str]:
    new_words = (word for word in word_list if word not in exclude_words)
    if count is None:
        yield from new_words
    else:
        yield from itertools.islice(new_words, count)


class WordSuggestor(abc.ABC):
    NAME: str = ""

    @classmethod
    @abc.abstractmethod
    def from_suggestion_data(
        cls, suggestion_data: Optional[Mapping] = None
    ) -> WordSuggestor:
        pass

    @abc.abstractmethod
    def get_mastery(self, word: str) -> Optional[float]:
        pass

    @abc.abstractmethod
    def suggest(
        self,
        word_list: Sequence[str],
        removed_words: AbstractSet[str] = frozenset(),
        count: Optional[int] = None,
    ) -> Iterable[str]:
        pass

    @abc.abstractmethod
    def update_suggestion_data(
        self, sentence: str, words: Sequence[Tuple[str, bool]]
    ) -> Mapping:
        pass
