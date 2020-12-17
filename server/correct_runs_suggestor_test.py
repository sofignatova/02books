import correct_runs_suggestor


def test_get_mastery_no_trained_words():
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data()

    assert suggestor.get_mastery("apple") is None


def test_get_mastery_many_correct():
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data()
    for _ in range(10):
        suggestion_data = suggestor.update_suggestion_data("Run!", [("Run", True)])
        suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
            suggestion_data
        )

    assert suggestor.get_mastery("Run") == 1.0


def test_get_mastery_many_incorrect():
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data()
    for _ in range(10):
        suggestion_data = suggestor.update_suggestion_data("Run!", [("Run", False)])
        suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
            suggestion_data
        )
    assert suggestor.get_mastery("Run") == 0.0


def test_suggest_no_trained_words():
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data()

    assert list(suggestor.suggest(["apple", "bat", "cat"], count=1)) == ["apple"]
    assert list(suggestor.suggest(["apple", "bat", "cat"], count=2)) == ["apple", "bat"]
    assert list(suggestor.suggest(["apple", "bat", "cat"], count=3)) == [
        "apple",
        "bat",
        "cat",
    ]
    assert list(suggestor.suggest(["apple", "bat", "cat"], count=4)) == [
        "apple",
        "bat",
        "cat",
    ]
    assert list(suggestor.suggest(["apple", "bat", "cat"], count=None)) == [
        "apple",
        "bat",
        "cat",
    ]


def test_suggest_remove_word_list_no_trained_words():
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data()

    assert list(
        suggestor.suggest(["apple", "bat", "cat"], removed_words={"bat"}, count=1)
    ) == ["apple"]
    assert list(
        suggestor.suggest(["apple", "bat", "cat"], removed_words={"bat"}, count=2)
    ) == ["apple", "cat"]
    assert list(
        suggestor.suggest(["apple", "bat", "cat"], removed_words={"bat"}, count=3)
    ) == [
        "apple",
        "cat",
    ]
    assert list(
        suggestor.suggest(["apple", "bat", "cat"], removed_words={"bat"}, count=None)
    ) == [
        "apple",
        "cat",
    ]


def test_suggest_trained_word():
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data()

    suggestion_data = suggestor.update_suggestion_data(
        "I run!", [("I", True), ("run", False)]
    )
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
        suggestion_data
    )

    assert list(suggestor.suggest(["apple", "bat", "cat"])) == [
        "run",
        "I",
        "apple",
        "bat",
        "cat",
    ]


def test_suggest_trained_words():
    suggestion_data = None
    for i in range(6):
        suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
            suggestion_data
        )
        suggestion_data = suggestor.update_suggestion_data(
            "I like to run and jump outside.",
            [
                ("I", True),
                ("like", i > 0),
                ("to", i > 1),
                ("run", i > 2),
                ("and", i > 3),
                ("jump", i > 4),
                ("outside", False),
            ],
        )

    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
        suggestion_data
    )
    assert list(suggestor.suggest([])) == [
        "outside",  # Incorrect 6 times
        "jump",  # Correct 1 time.
        "and",  # Correct 2 times
        "run",  # Correct 3 times
        "to",  # Correct 4 times
        "like",  # Correct 5 times
        "I",  # Correct 6 times
    ]


def test_suggest_remove_trained_word():
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data()

    suggestion_data = suggestor.update_suggestion_data(
        "I run!", [("I", True), ("run", False)]
    )
    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
        suggestion_data
    )

    assert list(suggestor.suggest(["apple", "bat", "cat"], {"run"})) == [
        "I",
        "apple",
        "bat",
        "cat",
    ]


def test_suggest_trained_words_and_new_words():
    suggestion_data = None
    words_and_correct_count = [
        ("None", -1),
        ("one", 1),
        ("two", 2),
        ("three", 3),
        ("four", 4),
        ("five", 5),
        ("six", 6),
        ("seven", 7),
    ]

    WORD_LIST = ["apple", "bat", "cat", "dog", "egg"]
    CORRECT_ORDER = [
        "None",
        "one",
        "two",
        "three",
        "apple",
        "bat",
        "cat",
        "four",
        "five",
        "six",
        "seven",
        "dog",
        "egg",
    ]
    for word, count in words_and_correct_count:
        for _ in range(abs(count)):
            suggestor = (
                correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
                    suggestion_data
                )
            )
            suggestion_data = suggestor.update_suggestion_data(
                word,
                [
                    (word, count > 0),
                ],
            )

    suggestor = correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
        suggestion_data
    )
    for i in range(len(CORRECT_ORDER) + 1):
        assert list(suggestor.suggest(WORD_LIST))[:i] == CORRECT_ORDER[:i]
