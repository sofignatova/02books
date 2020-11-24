import json
from typing import Iterable, Mapping, Optional

from google.cloud import firestore

import storage


class FirestoreStorage(storage.Storage):
    def __init__(self):
        self._db = firestore.Client()

    def create_user(self) -> str:
        user_ref = self._db.collection("users").document()
        user_ref.set({})
        return user_ref.id

    def user_exists(self, user_id: str) -> bool:
        user_ref = self._db.collection("users").document(user_id)
        return user_ref.get().exists

    def _get_results_collection(self, user: str) -> firestore.CollectionReference:
        return self._db.collection("training").document(user).collection("results")

    def record_result(self, user: str, result: storage.TrainingResult):
        results = self._get_results_collection(user)
        result_ref = results.document()
        result_ref.set(
            {
                "when": result.when,
                "sentence": result.sentence,
                "words": [word_result.word for word_result in result.word_results],
                "data": json.dumps(result.to_dict()),
            }
        )

    def load_results(self, user: str) -> Iterable[storage.TrainingResult]:
        results = self._get_results_collection(user)
        for r in results.order_by("when").stream():
            yield storage.TrainingResult.from_dict(json.loads(r.get("data")))

    def load_suggestion_data(self, strategy: str, user: str) -> Mapping:
        data_ref = self._db.collection(strategy).document(user)
        data = data_ref.get()
        if not data.exists:
            return {}
        else:
            return json.loads(data.get("data"))

    def save_suggestion_data(self, strategy: str, user: str, data: Mapping):
        serialized_data = json.dumps(data)
        data_ref = self._db.collection(strategy).document(user)
        data_ref.set({"data": serialized_data})

    def load_user_settings(self, user: str) -> Optional[storage.UserSettings]:
        data_ref = self._db.collection("settings").document(user)
        data = data_ref.get()
        if not data.exists:
            return None
        else:
            return storage.UserSettings.from_dict(json.loads(data.get("data")))

    def save_user_settings(self, user: str, settings: storage.UserSettings):
        serialized_data = json.dumps(settings.to_dict())
        data_ref = self._db.collection("settings").document(user)
        data_ref.set(
            {"selected_corpus_id": settings.selected_corpus_id, "data": serialized_data}
        )
