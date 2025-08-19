import pytest
from app.services.nim_service import NIMService

@pytest.mark.asyncio
async def test_parse_embedding_response_numeric_list(monkeypatch):
	service = NIMService()
	content = "[0.1, 0.2, 0.3]"
	vec = service._parse_embedding_response(content)
	assert isinstance(vec, list)
	assert len(vec) == 3