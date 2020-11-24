import tempfile
import unittest

import filestorage
import storage_test


class FileStorageTest(unittest.TestCase, storage_test.StorageTest):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self._store = filestorage.FileStorage(self.tempdir.name)

    @property
    def store(self):
        return self._store

    def tearDown(self):
        self.tempdir.cleanup()
