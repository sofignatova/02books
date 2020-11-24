import argparse
import collections
import json
import os.path
import pathlib
import re
import sys
from typing import Any, Iterable, Mapping, Optional, Sequence, Union

PROJECT_ROOT = pathlib.Path(os.path.abspath(__file__)).parent.parent
CORPORA_PATH = PROJECT_ROOT / "server" / "corpora"


def find_words(text: str):
    return re.findall(r"\b\w+'?\w*\b", text.replace("’", "'"))


def count_words(text: Iterable[str]) -> collections.Counter:
    return collections.Counter(text)


def create_corpus(
    *,
    corpus_id: str,
    name: str,
    description: str,
    url: Optional[str] = None,
    words: Union[collections.Counter, Sequence],
    source: str,
    reader_level: Optional[Union[int, str]] = None,
) -> Mapping:
    if isinstance(words, collections.Counter):
        json_words: Union[Mapping[str, int], Sequence[str]] = dict(words.most_common())
    else:
        json_words = list(words)
    return {
        "id": corpus_id,
        "name": name,
        "description": description,
        "url": url,
        "source": source,
        "reader_level": reader_level,
        "words": json_words,
    }


def write_corpus(corpus: Mapping[str, Any]):
    with open((CORPORA_PATH / corpus["id"]).with_suffix(".json"), "w") as f:
        json.dump(corpus, f, indent=2)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--corpus_id", default="TODO: fill me in!")
    parser.add_argument("--name", default="TODO: fill me in!")
    parser.add_argument("--description", default="TODO: fill me in!")
    parser.add_argument("--url", default="TODO: fill me in!")
    parser.add_argument("--source", default="TODO: choose <book|wordlist>")
    parser.add_argument("--reader_level", default="TODO: fill me in or DELETE me")
    parser.add_argument(
        "--source", nargs="?", type=argparse.FileType("r"), default=sys.stdin
    )
    parser.add_argument(
        "--outfile", nargs="?", type=argparse.FileType("w"), default=sys.stdout
    )

    args = parser.parse_args()
    words = count_words(find_words(args.source.read()))
    corpus = create_corpus(
        corpus_id=args.corpus_id,
        name=args.name,
        description=args.description,
        url=args.url,
        source=args.source,
        reader_level=args.reader_level,
        words=words,
    )
    json.dump(corpus, args.outfile, indent=2)


if __name__ == "__main__":
    main()
