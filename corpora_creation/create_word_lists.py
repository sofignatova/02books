import functools
import itertools
import os.path
import pathlib
from typing import Sequence

import create_corpus

THIS_DIRECTORY = pathlib.Path(os.path.abspath(__file__)).parent

FRY_WORDS_PATH = THIS_DIRECTORY / "fry.txt"
DOLCH_WORDS_PATH = THIS_DIRECTORY / "dolch.txt"
DOLCH_NOUNS_PATH = THIS_DIRECTORY / "dolch-nouns.txt"

GUTENBURG_TOP = THIS_DIRECTORY / "gutenburg-top-100.txt"
WIKIPEDIA_TOP = THIS_DIRECTORY / "wikipedia-top-1000.txt"


def _read_words(path):
    with open(path) as f:
        for line in f:
            if line.strip():
                yield line.strip().replace("’", "'")


def _read_levels(path):
    by_level = []
    with open(path) as f:
        for level in f:
            words = set()
            for word in level.split(","):
                if word.strip():
                    words.add(word.strip().replace("’", "'"))
            by_level.append(words)
    return by_level


def create_sorter_from_wordlists(wordlists: Sequence[Sequence[str]]):
    def key(word):
        # If the word is not in a wordlist, over alphabetically, prioritizing lowercase
        # words
        num = 0
        for wordlist in wordlists:
            try:
                return wordlist.index(word.strip().lower()) + num, word.swapcase()
            except ValueError:
                num += len(wordlist)
        return num, word.swapcase()

    return functools.partial(sorted, key=key)


def create_sorter():
    wordlists = [
        [word.lower() for word in _read_words(GUTENBURG_TOP)],
        [word.lower() for word in _read_words(WIKIPEDIA_TOP)],
    ]
    return create_sorter_from_wordlists(wordlists)


def create_dolch_nouns(sorter):
    words = sorter(_read_words(DOLCH_NOUNS_PATH))
    corpus = create_corpus.create_corpus(
        corpus_id="dolch-nouns",
        name="Dolch Noun List",
        description="The list of sight word nouns proposed by Edward William Dolch.",
        url="https://en.wikipedia.org/wiki/Dolch_word_list",
        source="wordlist",
        words=words,
    )
    create_corpus.write_corpus(corpus)


def create_dolch(sorter):
    words_by_level = _read_levels(DOLCH_WORDS_PATH)
    sorted_words = []
    for words in words_by_level:
        sorted_words.extend(sorter(words))
    corpus = create_corpus.create_corpus(
        corpus_id="dolch",
        name="Dolch Word List",
        description="The list of sight words proposed by Edward William Dolch.",
        url="https://en.wikipedia.org/wiki/Dolch_word_list",
        source="wordlist",
        words=sorted_words,
    )
    create_corpus.write_corpus(corpus)


def create_fry(sorter):
    words_by_level = _read_levels(FRY_WORDS_PATH)
    sorted_words = []
    for words in words_by_level:
        sorted_words.extend(sorter(words))
    corpus = create_corpus.create_corpus(
        corpus_id="fry",
        name="Fry Word List",
        description="The list of sight words proposed by Dr. Edward Fry.",
        url="https://sightwords.com/sight-words/fry/",
        source="wordlist",
        words=sorted_words,
    )
    create_corpus.write_corpus(corpus)


def create_curated(sorter):
    words = [
        "cat",
        "is",
        "red",
        "The",  # The cat is red.
        "blue",  # The cat is blue.
        "big",  # The cat is big.
        "little",  # The cat is little.
        "dog",  # The dog is big.
        "and",  # The dog is big and blue.
        "the",  # The dog is big and the cat is little.
        "a",  # A little cat is blue.
        "runs",  # The cat runs.
        "can",
        "run",  # The cat can run.
        "jump",  # The cat can jump.
        "I",  # I can run.
        "am",  # I am big.
        "jumps",  # The cat jumps.
        "likes",  # The cat likes the dog.
        "like",  # I like the dog.
        "to",  # I run to the dog.
        "want",  # I want to run.
        "wants",  # The cat wants to run.
        "bat",  # The bat is little.
        "fat",  # The cat is fat.
        "hat",  # The hat is red.
        "mat",  # The mat is blue.
        "rat",  # The rat is little.
        "sat",  # The rat sat on the hat.
        "go",  # I want to go.
        "park",  # I want to go to the park.
        "my",  # My cat is big.
        "nice",  # The cat is nice.
    ]

    def add_word(i):
        while True:
            word = next(i)
            if word not in words:
                words.append(word)
                return

    fry_by_level = _read_levels(FRY_WORDS_PATH)
    fry_sorted = []
    for fry_words in fry_by_level:
        fry_sorted.extend(sorter(fry_words))

    dolch_by_level = _read_levels(DOLCH_WORDS_PATH)
    dolch_sorted = []
    for dolch_words in dolch_by_level:
        dolch_sorted.extend(sorter(dolch_words))

    dolch_nouns_sorted = sorter(_read_words(DOLCH_NOUNS_PATH))
    fry_dolch_iter = itertools.chain(fry_sorted, dolch_sorted)
    dolch_nouns_iter = iter(dolch_nouns_sorted)
    while True:
        try:
            add_word(fry_dolch_iter)
            add_word(fry_dolch_iter)
            add_word(dolch_nouns_iter)
        except StopIteration:
            break
    words.extend(word for word in fry_dolch_iter if word not in words)
    words.extend(word for word in dolch_nouns_iter if word not in words)

    corpus = create_corpus.create_corpus(
        corpus_id="curated",
        name="Curated",
        description="A combination of words chosen make building sentences easy",
        source="wordlist",
        words=words,
    )
    create_corpus.write_corpus(corpus)


def main():
    sorter = create_sorter()
    create_dolch_nouns(sorter)
    create_dolch(sorter)
    create_fry(sorter)
    create_curated(sorter)


if __name__ == "__main__":
    main()
