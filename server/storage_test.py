import abc

import storage


class StorageTest(abc.ABC):
    @property
    @abc.abstractmethod
    def store(self) -> storage.Storage:
        pass

    def test_create_and_check_user(self):
        user = self.store.create_user()
        assert user is not None
        assert self.store.user_exists(user)
        assert not self.store.user_exists("this is not a real user")

    def test_record_and_load_results(self):
        t1 = storage.TrainingResult(
            "1Love you!",
            [storage.WordResult("1Love", True), storage.WordResult("you", True)],
        )
        t2 = storage.TrainingResult(
            "2Love you!",
            [storage.WordResult("1Love", True), storage.WordResult("you", False)],
        )
        t3 = storage.TrainingResult(
            "3Love you!",
            [storage.WordResult("1Love", False), storage.WordResult("you", True)],
        )
        t4 = storage.TrainingResult(
            "4Love you!",
            [storage.WordResult("1Love", True), storage.WordResult("you", True)],
        )
        user1 = self.store.create_user()
        user2 = self.store.create_user()
        self.store.record_result(user1, t1)
        self.store.record_result(user2, t2)
        self.store.record_result(user1, t3)
        self.store.record_result(user2, t4)
        assert set(self.store.load_results(user1)) == set([t1, t3])
        assert set(self.store.load_results(user2)) == set([t2, t4])

    def test_save_and_load_suggestion_data(self):
        data1 = {"name": "data1"}
        data2 = {"name": "data2"}
        data3 = {"name": "data3"}

        user1 = self.store.create_user()
        user2 = self.store.create_user()

        self.store.save_suggestion_data("strategy1", user1, data1)
        self.store.save_suggestion_data("strategy1", user2, data2)
        self.store.save_suggestion_data("strategy2", user1, data3)

        assert self.store.load_suggestion_data("strategy1", user1) == data1
        assert self.store.load_suggestion_data("strategy1", user2) == data2
        assert self.store.load_suggestion_data("strategy2", user1) == data3
        assert self.store.load_suggestion_data("strategy2", user2) == {}

    def test_save_and_load_settings(self):
        user1 = self.store.create_user()

        assert self.store.load_user_settings(user1) is None

        settings = storage.UserSettings(
            selected_corpus_id="book1", removed_words=["apple", "bat"]
        )
        self.store.save_user_settings(user1, settings)
        assert self.store.load_user_settings(user1) == settings

    def test_save_and_load_settings_invalid_user(self):
        assert self.store.load_user_settings("testinguser") is None
