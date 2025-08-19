import os
import tempfile
import pytest
from app.services.text_extractor import TextExtractor


def test_chunk_text_basic():
	text = "This is a sentence. Another sentence! And a third one?" * 50
	chunks = TextExtractor.chunk_text(text, chunk_size=100, overlap=20)
	assert len(chunks) > 1
	assert all(len(c) <= 120 for c in chunks)


def test_extract_text_from_txt():
	with tempfile.NamedTemporaryFile(delete=False, suffix='.txt', mode='w', encoding='utf-8') as f:
		f.write('hello world')
		path = f.name
	try:
		content = TextExtractor.extract_text_from_txt(path)
		assert content == 'hello world'
	finally:
		os.unlink(path)