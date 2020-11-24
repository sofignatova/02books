import unittest

import firestore_storage
import storage_test


@unittest.skip("Need GCP project setup for testing.")
class FileStorageTest(unittest.TestCase, storage_test.StorageTest):
    def setUp(self):
        self._store = firestore_storage.FirestoreStorage()

    @property
    def store(self):
        return self._store
