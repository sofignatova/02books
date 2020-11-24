import create_word_lists


def test_sorter_in_wordlists():
    sorter = create_word_lists.create_sorter_from_wordlists(
        [["a", "b", "c"], ["d", "e", "f"]]
    )
    assert sorter(["f", "c", "a", "e", "b", "d"]) == ["a", "b", "c", "d", "e", "f"]


def test_sorter_not_in_wordlists():
    sorter = create_word_lists.create_sorter_from_wordlists(
        [["a", "b", "c"], ["d", "e", "f"]]
    )

    assert sorter(["gb", "i", "ga", "Ga"]) == ["ga", "gb", "i", "Ga"]


def test_sorter_words_in_wordlists_before_others():
    sorter = create_word_lists.create_sorter_from_wordlists(
        [["a", "b", "c"], ["d", "e", "f"]]
    )
    assert sorter(["f", "c", "d", "a"]) == ["a", "c", "d", "f"]
