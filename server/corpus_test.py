import corpus


def test_get_corpora():
    assert corpus.get_corpora()
    assert corpus.get_corpora()  # Ensure that caching works.


def test_with_frequency():
    c = corpus.get_corpus("big-shark-little-shark")
    assert "the" in c
    assert c.get_count("the") > 0


def test_without_frequency():
    c = corpus.get_corpus("dolch")
    assert "the" in c
    assert c.get_count("the") is None
