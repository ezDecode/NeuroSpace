import os
import types
import pytest
from app.services.s3_service import S3Service

class DummyClient:
	def __init__(self, meta: dict):
		self._meta = meta
	def head_object(self, Bucket, Key):
		return { 'Metadata': self._meta }


def test_get_file_metadata(monkeypatch):
	service = S3Service()
	service.s3_client = DummyClient({ 'userId': 'abc', 'originalName': 'file.pdf' })
	meta = pytest.run(async_lambda(service.get_file_metadata, 'uploads/u/123'))
	assert meta['userId'] == 'abc'

# Helper to run async function in pytest without event loop boilerplate
class pytest:
	@staticmethod
	def run(coro_factory):
		import asyncio
		return asyncio.get_event_loop().run_until_complete(coro_factory)