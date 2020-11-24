import create_corpus


def test_find_words_apostrophe():
    assert create_corpus.find_words("I don't like this") == [
        "I",
        "don't",
        "like",
        "this",
    ]
    assert create_corpus.find_words("Can't") == ["Can't"]
    assert create_corpus.find_words("It don't") == ["It", "don't"]

    assert create_corpus.find_words("I can’t believe it!") == [
        "I",
        "can't",
        "believe",
        "it",
    ]


def test_find_words_split_puntuation():
    assert create_corpus.find_words("Things I like: cats") == [
        "Things",
        "I",
        "like",
        "cats",
    ]

    assert create_corpus.find_words("I love cats!") == [
        "I",
        "love",
        "cats",
    ]

    assert create_corpus.find_words("I love cats.") == [
        "I",
        "love",
        "cats",
    ]

    assert create_corpus.find_words('"I love cats."') == [
        "I",
        "love",
        "cats",
    ]

    assert create_corpus.find_words("Good, I think") == [
        "Good",
        "I",
        "think",
    ]
