import json
import os
import os.path
from typing import List, Optional

import flask
from flask import Flask, Response, jsonify, request

import api
import corpus
import correct_runs_suggestor
import filestorage
import firestore_storage
import storage
import word_suggestor

app = Flask(__name__)


if os.environ.get("GAE_APPLICATION"):
    app.config["STORAGE"] = firestore_storage.FirestoreStorage()
else:
    app.config["STORAGE"] = filestorage.FileStorage(os.path.join(app.root_path, "data"))
app.config["CORPORA"] = corpus.get_corpora()


def _get_storage() -> storage.Storage:
    return app.config["STORAGE"]


def _get_suggestor() -> word_suggestor.WordSuggestor:
    if "suggestor" in flask.g:
        return flask.g.suggestor

    suggestion_data = _get_storage().load_suggestion_data(
        correct_runs_suggestor.CorrectRunsSuggestor.NAME, _get_user_id()
    )
    flask.g.suggestor = (
        correct_runs_suggestor.CorrectRunsSuggestor.from_suggestion_data(
            suggestion_data
        )
    )
    return flask.g.suggestor


def _get_corpora() -> List[corpus.Corpus]:
    return app.config["CORPORA"]


def _get_user_id() -> str:
    user_id = request.args.get("user_id")
    if user_id is None:
        raise storage.UserDoesNotExist("user not specified")
    store = _get_storage()
    store.check_user_exists(user_id)
    return user_id


def _get_default_settings() -> storage.UserSettings:
    return storage.UserSettings(selected_corpus_id="curated")


def _get_settings() -> storage.UserSettings:
    if "settings" in flask.g:
        return flask.g.settings

    settings = _get_storage().load_user_settings(_get_user_id())
    if settings is None:
        settings = _get_default_settings()

    flask.g.settings = settings
    return settings


def _get_corpus() -> corpus.Corpus:
    selected_corpus_id = _get_settings().selected_corpus_id
    return corpus.get_corpus(selected_corpus_id)


def _string_to_word(raw_word: str, c: Optional[corpus.Corpus] = None) -> api.Word:
    settings = _get_settings()
    c = c or _get_corpus()
    suggestor = _get_suggestor()
    level_of_mastery = suggestor.get_mastery(raw_word)

    return api.Word(
        word=raw_word,
        level_of_mastery=level_of_mastery or 0.0,
        is_new=level_of_mastery is None,
        corpus_count=c.get_count(raw_word),
        removed=raw_word in settings.removed_words,
    )


@app.errorhandler(storage.UserDoesNotExist)
def handle_user_does_not_exist(e):
    data = {"errors": [{"detail": str(e)}]}
    return Response(json.dumps(data), status=400, content_type="application/json")


@app.route("/api/users", methods=["POST"])
def handle_users():
    store = _get_storage()
    user_id = store.create_user()
    store.save_user_settings(user_id, _get_default_settings())
    return jsonify(data={"id": user_id})


@app.route("/api/corpora", methods=["GET"])
def handle_corpora():
    return jsonify(
        data=[
            api.Corpus(
                id_=c.corpus_id,
                name=c.name,
                description=c.description,
                link=c.url,
                words=[_string_to_word(s, c) for s in c.ordered_word_list],
                source=api.Corpus.CorpusSource(c.source.value),
                reader_level=c.reader_level,
            ).to_dict()
            for c in _get_corpora()
        ],
    )


@app.route("/api/settings", methods=["GET", "PATCH"])
def handle_settings():
    user_settings = _get_settings()
    if request.method == "PATCH":
        if "removed_words" in request.json:
            removed_words = request.json["removed_words"]
        else:
            removed_words = user_settings.removed_words
        if "selected_corpus_id" in request.json:
            selected_corpus_id = request.json["selected_corpus_id"]
        else:
            selected_corpus_id = user_settings.selected_corpus_id
        user_settings = storage.UserSettings(
            selected_corpus_id=selected_corpus_id,
            removed_words=removed_words,
        )
        _get_storage().save_user_settings(_get_user_id(), user_settings)

    return jsonify(
        data=api.UserSettings(
            selected_corpus_id=user_settings.selected_corpus_id,
            removed_words=user_settings.removed_words,
        ).to_dict()
    )


@app.route("/api/trainings", methods=["POST"])
def handle_trainings():
    training = api.Training.from_dict(request.json)
    store = _get_storage()
    user_id = _get_user_id()

    suggestion_data = _get_suggestor().update_suggestion_data(
        training.sentence, [(wc.word, wc.correct) for wc in training.word_correctness]
    )
    store.save_suggestion_data(_get_suggestor().NAME, user_id, suggestion_data)

    store.record_result(
        user_id,
        storage.TrainingResult(
            training.sentence,
            word_results=[
                storage.WordResult(wc.word, wc.correct)
                for wc in training.word_correctness
            ],
        ),
    )
    return jsonify(data={})


@app.route("/api/words", methods=["GET"])
def handle_words():
    raw_words = []
    if "suggestions" in request.args:
        word_list = _get_corpus().ordered_word_list
        settings = _get_settings()
        raw_words.extend(
            _get_suggestor().suggest(
                word_list,
                frozenset(settings.removed_words),
                count=10,
            )
        )
    for word in request.args.getlist("word"):
        raw_words.append(word)

    return jsonify(data=[_string_to_word(raw_word) for raw_word in raw_words])
