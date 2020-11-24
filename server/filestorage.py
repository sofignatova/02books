import json
import os.path
import uuid
from typing import Iterable, Mapping, Optional

import storage


class FileStorage(storage.Storage):
    def __init__(self, base_dir: str):
        self._base_dir = base_dir

    def _user_path(self):
        return os.path.join(self._base_dir, "users.json")

    def create_user(self) -> str:
        file_path = self._user_path()
        if os.path.exists(file_path):
            with open(file_path) as f:
                users = json.load(f)
        else:
            users = []
        user_id = str(uuid.uuid4())
        users.append(user_id)
        with open(file_path, "w") as f:
            json.dump(users, f, sort_keys=True, indent=4)
        return user_id

    def user_exists(self, user_id: str) -> bool:
        file_path = self._user_path()
        if not os.path.exists(file_path):
            return False
        else:
            with open(file_path) as f:
                users = json.load(f)
        return user_id in users

    def _record_path(self, user):
        return os.path.join(self._base_dir, f"{user}-records.json")

    def record_result(self, user, result: storage.TrainingResult):
        self.check_user_exists(user)
        file_path = self._record_path(user)
        if os.path.exists(file_path):
            with open(file_path) as f:
                results = json.load(f)
        else:
            results = []
        results.append(result.to_dict())
        with open(file_path, "w") as f:
            json.dump(results, f, sort_keys=True, indent=4)

    def load_results(self, user) -> Iterable[storage.TrainingResult]:
        self.check_user_exists(user)
        file_path = self._record_path(user)
        if os.path.exists(file_path):
            with open(file_path) as f:
                results = json.load(f)
        else:
            results = []
        return (storage.TrainingResult.from_dict(result) for result in results)

    def _suggestion_path(self, strategy, user):
        return os.path.join(self._base_dir, f"{user}-{strategy}-suggestion.json")

    def load_suggestion_data(self, strategy, user):
        self.check_user_exists(user)
        file_path = self._suggestion_path(strategy, user)
        if os.path.exists(file_path):
            with open(file_path) as f:
                return json.load(f)
        else:
            return {}

    def save_suggestion_data(self, strategy, user, data: Mapping):
        self.check_user_exists(user)
        file_path = self._suggestion_path(strategy, user)
        with open(file_path, "w") as f:
            json.dump(data, f, sort_keys=True, indent=4)

    def _settings_path(self, user):
        return os.path.join(self._base_dir, f"{user}-settings.json")

    def load_user_settings(self, user: str) -> Optional[storage.UserSettings]:
        file_path = self._settings_path(user)
        if os.path.exists(file_path):
            with open(file_path) as f:
                return storage.UserSettings.from_dict(json.load(f))
        return None

    def save_user_settings(self, user: str, settings: storage.UserSettings):
        file_path = self._settings_path(user)
        with open(file_path, "w") as f:
            print(settings.to_dict())
            json.dump(settings.to_dict(), f, sort_keys=True, indent=4)
