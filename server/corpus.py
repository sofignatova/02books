import collections
import dataclasses
import enum
import json
import os
from typing import Iterable, List, Mapping, Optional, Tuple, cast


class CorpusSource(enum.Enum):
    BOOK = "book"
    WORDLIST = "wordlist"


@dataclasses.dataclass
class Corpus:
    corpus_id: str
    name: str
    description: str
    url: str
    source: CorpusSource
    reader_level: Optional[int]

    ordered_word_list: List[str]
    _word_to_frequency: Mapping[str, Optional[int]]

    def __contains__(self, word: str) -> bool:
        return word in self.ordered_word_list

    def get_count(self, word: str) -> Optional[int]:
        return self._word_to_frequency.get(word)

    @staticmethod
    def from_file(path: str):
        with open(path) as f:
            d = json.load(f)

        words = d["words"]
        if isinstance(words, list):
            ordered_word_list = words
            _word_to_frequency = {}
        else:
            ordered_word_list = [
                word
                for (word, _) in cast(
                    Iterable[Tuple[str, int]], collections.Counter(words).most_common()
                )
            ]
            _word_to_frequency = words

        return Corpus(
            d["id"],
            d["name"],
            d["description"],
            d.get("url"),
            CorpusSource(d["source"]),
            d.get("reader_level"),
            ordered_word_list,
            _word_to_frequency,
        )


_corpora: Optional[List[Corpus]] = None


def get_corpora() -> List[Corpus]:
    global _corpora

    if _corpora is not None:
        return _corpora

    corpus_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "corpora")
    _corpora = [
        Corpus.from_file(os.path.join(corpus_dir, path))
        for path in os.listdir(corpus_dir)
    ]
    return _corpora


def get_corpus(corpus_id: str) -> Corpus:
    for corpus in get_corpora():
        if corpus.corpus_id == corpus_id:
            return corpus
    raise ValueError(f"unknown corpus: {corpus_id}")
