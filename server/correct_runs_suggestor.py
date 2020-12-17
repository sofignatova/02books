from __future__ import annotations

import collections
import itertools
from typing import AbstractSet, Counter, Iterable, Mapping, Optional, Sequence, Tuple

import word_suggestor


class CorrectRunsSuggestor(word_suggestor.WordSuggestor):
    NAME: str = "CORRECT_RUNS"

    _NUM_CORRECT_TO_MASTER = 10
    _NEW_WORD_THRESHOLD = 3
    _MAX_NEW_WORDS = 3

    def __init__(self, word_to_incorrect_run: Counter[str]):
        self._word_to_incorrect_run = word_to_incorrect_run

    @classmethod
    def from_suggestion_data(
        cls, suggestion_data: Optional[Mapping] = None
    ) -> CorrectRunsSuggestor:
        suggestion_data = suggestion_data or {}
        return cls(
            collections.Counter(suggestion_data.get("word_to_incorrect_run", {}))
        )

    def get_mastery(self, word: str) -> Optional[float]:
        if word not in self._word_to_incorrect_run:
            return None
        else:
            return min(
                1,
                max(
                    0, -self._word_to_incorrect_run[word] / self._NUM_CORRECT_TO_MASTER
                ),
            )

    def _pick_already_trained_words(
        self, removed_words: AbstractSet[str], count: Optional[int] = None
    ) -> Iterable[Tuple[str, int]]:
        trained = (
            (word, frequency)
            for (word, frequency) in self._word_to_incorrect_run.most_common()
            if word not in removed_words
        )
        return itertools.islice(trained, count)

    def _pick_new_words(
        self,
        word_list: Sequence[str],
        exclude_words: AbstractSet[str],
        count: Optional[int] = None,
    ) -> Iterable[Tuple[str, int]]:
        return (
            (
                word,
                -self._NEW_WORD_THRESHOLD
                if index < self._MAX_NEW_WORDS
                else -(2 ** 31),  # Lower than any other word.
            )
            for (index, word) in enumerate(
                word_suggestor.take_from_word_list(word_list, exclude_words, count)
            )
        )

    def suggest(
        self,
        word_list: Sequence[str],
        removed_words: AbstractSet[str] = frozenset(),
        count: Optional[int] = None,
    ) -> Iterable[str]:
        trained_words = self._pick_already_trained_words(removed_words, count)
        new_words = self._pick_new_words(
            word_list, frozenset(self._word_to_incorrect_run) | removed_words, count
        )
        suggestions = list(trained_words) + list(new_words)
        suggestions.sort(key=lambda l: l[1], reverse=True)
        return itertools.islice((word for (word, _) in suggestions), count)

    def update_suggestion_data(
        self, sentence: str, words: Sequence[Tuple[str, bool]]
    ) -> Mapping:
        word_to_incorrect_run: Counter[str] = collections.Counter(
            self._word_to_incorrect_run
        )
        for word, correct in words:
            if correct and word_to_incorrect_run[word] < 0:
                word_to_incorrect_run[word] -= 1
            elif not correct and word_to_incorrect_run[word] > 0:
                word_to_incorrect_run[word] += 1
            else:
                word_to_incorrect_run[word] = -1 if correct else 1
        return {
            "word_to_incorrect_run": word_to_incorrect_run,
        }
