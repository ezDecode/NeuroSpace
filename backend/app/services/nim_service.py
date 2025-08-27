import os
import requests
import requests.exceptions
import json
import time
from typing import List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class EmbeddingError(Exception):
    """Custom exception for embedding-related errors"""
    def __init__(self, message: str, error_code: str = None, status_code: int = None):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        super().__init__(self.message)

class NIMService:
    def __init__(self):
        self.api_key = os.getenv('NVIDIA_NIM_API_KEY')
        self.base_url = os.getenv('NVIDIA_NIM_BASE_URL', 'https://integrate.api.nvidia.com/v1')
        
        # Validate API key on initialization
        if not self.api_key:
            raise EmbeddingError(
                "NVIDIA_NIM_API_KEY environment variable is not set",
                error_code="MISSING_API_KEY"
            )
        
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        # Use direct HTTP requests instead of OpenAI client to avoid proxy issues
        self.client = None  # Will use direct requests
        logger.info("NIM Service initialized with direct HTTP client")

    async def generate_embedding(self, text: str, max_retries: int = 2) -> Optional[List[float]]:
        """
        Generate embedding for a text using Nvidia NIM API with detailed error handling
        """
        # Input validation
        if not text or not isinstance(text, str):
            raise EmbeddingError(
                "Input text is empty or not a string",
                error_code="INVALID_INPUT"
            )
            
        text = text.strip()
        if not text:
            raise EmbeddingError(
                "Input text is empty after stripping whitespace",
                error_code="EMPTY_INPUT"
            )
        
        # Check text length (NVIDIA models typically have limits)
        if len(text) > 8192:  # Conservative limit
            logger.warning(f"Input text is very long ({len(text)} chars), might cause issues")
        
        for attempt in range(max_retries + 1):
            try:
                # Use the correct embeddings endpoint
                url = f"{self.base_url}/embeddings"
                
                payload = {
                    "model": "nvidia/nv-embedqa-e5-v5",
                    "input": text,
                    "input_type": "query",
                    "encoding_format": "float"
                }

                logger.debug(f"Attempting embedding generation (attempt {attempt + 1}/{max_retries + 1})")
                
                response = requests.post(
                    url, 
                    headers=self.headers, 
                    json=payload,
                    timeout=(10, 30)  # 10s connect, 30s read timeout
                )
                
                if response.status_code == 200:
                    result = response.json()
                    # Extract embedding from response
                    if 'data' in result and len(result['data']) > 0:
                        embedding = result['data'][0].get('embedding')
                        if embedding and isinstance(embedding, list) and len(embedding) > 0:
                            logger.debug(f"Embedding generated successfully, dimension: {len(embedding)}")
                            return embedding
                        else:
                            raise EmbeddingError(
                                f"No valid embedding found in response. Data structure: {result['data'][0].keys() if result['data'] else 'empty'}",
                                error_code="INVALID_RESPONSE_FORMAT"
                            )
                    else:
                        raise EmbeddingError(
                            f"Unexpected response format from NIM API. Response keys: {list(result.keys())}",
                            error_code="INVALID_RESPONSE_FORMAT"
                        )
                
                elif response.status_code == 401:
                    raise EmbeddingError(
                        "Authentication failed - check your NVIDIA NIM API key",
                        error_code="AUTHENTICATION_FAILED",
                        status_code=401
                    )
                elif response.status_code == 403:
                    raise EmbeddingError(
                        "Access forbidden - your API key may not have embedding permissions",
                        error_code="ACCESS_FORBIDDEN",
                        status_code=403
                    )
                elif response.status_code == 429:
                    if attempt < max_retries:
                        wait_time = (attempt + 1) * 2  # Exponential backoff
                        logger.warning(f"Rate limited, retrying in {wait_time}s...")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise EmbeddingError(
                            "Rate limit exceeded and max retries reached",
                            error_code="RATE_LIMITED",
                            status_code=429
                        )
                elif response.status_code >= 500:
                    if attempt < max_retries:
                        wait_time = (attempt + 1) * 2
                        logger.warning(f"Server error {response.status_code}, retrying in {wait_time}s...")
                        time.sleep(wait_time)
                        continue
                    else:
                        raise EmbeddingError(
                            f"Server error: {response.status_code} - {response.text[:200]}",
                            error_code="SERVER_ERROR",
                            status_code=response.status_code
                        )
                else:
                    error_text = response.text[:500]  # Limit error text
                    raise EmbeddingError(
                        f"NIM API error: {response.status_code} - {error_text}",
                        error_code="API_ERROR",
                        status_code=response.status_code
                    )

            except requests.exceptions.Timeout:
                if attempt < max_retries:
                    logger.warning(f"Request timeout, retrying (attempt {attempt + 1})...")
                    continue
                else:
                    raise EmbeddingError(
                        "Request timed out after multiple attempts",
                        error_code="TIMEOUT"
                    )
            except requests.exceptions.ConnectionError as e:
                if attempt < max_retries:
                    logger.warning(f"Connection error, retrying (attempt {attempt + 1}): {str(e)[:100]}")
                    time.sleep(1)  # Brief pause before retry
                    continue
                else:
                    raise EmbeddingError(
                        f"Connection failed after multiple attempts: {str(e)[:100]}",
                        error_code="CONNECTION_ERROR"
                    )
            except EmbeddingError:
                # Re-raise our custom exceptions without retry
                raise
            except Exception as e:
                logger.error(f"Unexpected error in embedding generation: {e}")
                raise EmbeddingError(
                    f"Unexpected error: {str(e)[:100]}",
                    error_code="UNEXPECTED_ERROR"
                )

        # Should never reach here, but just in case
        raise EmbeddingError(
            "Max retries exceeded without successful response",
            error_code="MAX_RETRIES_EXCEEDED"
        )

    async def generate_embeddings_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """
        Generate embeddings for multiple texts
        """
        embeddings = []
        for text in texts:
            embedding = await self.generate_embedding(text)
            embeddings.append(embedding)
        return embeddings

    async def test_connection(self) -> bool:
        """
        Test connection to NIM API
        """
        try:
            test_text = "Hello, world!"
            embedding = await self.generate_embedding(test_text)
            return embedding is not None and len(embedding) > 0
        except Exception as e:
            print(f"NIM API connection test failed: {e}")
            return False

    async def generate_answer(self, question: str, context: str) -> Optional[str]:
        """
        Generate an answer using NIM chat completion given a question and context.
        """
        try:
            system_prompt = (
                "You are a helpful assistant that answers based strictly on the provided CONTEXT.\n"
                "If the answer isn't contained in the context, say you don't have enough information.\n"
                "Cite relevant filenames if provided in the context metadata."
            )
            
            payload = {
                "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"CONTEXT:\n{context}\n\nQUESTION: {question}"}
                ],
                "temperature": 0.6,
                "top_p": 0.95,
                "max_tokens": 65536,
                "frequency_penalty": 0,
                "presence_penalty": 0,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('choices') and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content'].strip()
            else:
                print(f"NIM API error: {response.status_code} - {response.text}")
            return None
            
        except Exception as e:
            print(f"Error generating answer with NIM API: {e}")
            return None

    async def generate_answer_stream(self, question: str, context: str):
        """
        Generate an answer using NIM chat completion with streaming response.
        """
        try:
            system_prompt = (
                "You are a helpful assistant that answers based strictly on the provided CONTEXT.\n"
                "If the answer isn't contained in the context, say you don't have enough information.\n"
                "Cite relevant filenames if provided in the context metadata."
            )
            
            payload = {
                "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"CONTEXT:\n{context}\n\nQUESTION: {question}"}
                ],
                "temperature": 0.6,
                "top_p": 0.95,
                "max_tokens": 65536,
                "frequency_penalty": 0,
                "presence_penalty": 0,
                "stream": True
            }
            
            try:
                with requests.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                    stream=True,
                    timeout=(10, 60)  # (connect timeout, read timeout)
                ) as response:
                    if response.status_code == 200:
                        for line in response.iter_lines():
                            if line:
                                line_str = line.decode('utf-8')
                                if line_str.startswith('data: '):
                                    data_str = line_str[6:]
                                    if data_str.strip() == '[DONE]':
                                        break
                                    try:
                                        data = json.loads(data_str)
                                        if data.get('choices') and len(data['choices']) > 0:
                                            delta = data['choices'][0].get('delta', {})
                                            content = delta.get('content')
                                            if content:
                                                yield content
                                    except json.JSONDecodeError:
                                        continue
                    else:
                        error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                        print(f"NIM API streaming error: {error_msg}")
                        yield f"Error: API request failed ({response.status_code})\n"
            except requests.exceptions.Timeout:
                print("NIM API timeout during streaming")
                yield "Error: Request timed out. Please try again.\n"
            except requests.exceptions.ConnectionError:
                print("NIM API connection error during streaming")
                yield "Error: Connection failed. Please check your internet connection.\n"
                    
        except Exception as e:
            print(f"Error generating streaming answer with NIM API: {e}")
            yield f"Error: {str(e)}\n"

    async def generate_general_answer(self, question: str) -> Optional[str]:
        """
        Generate a general answer using NIM chat completion without any external context.
        """
        try:
            system_prompt = (
                "You are a helpful general-purpose AI assistant. "
                "Answer clearly and concisely. Use markdown formatting for lists and code when helpful."
            )

            payload = {
                "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                "temperature": 0.6,
                "top_p": 0.95,
                "max_tokens": 65536,
                "frequency_penalty": 0,
                "presence_penalty": 0,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('choices') and len(result['choices']) > 0:
                    return result['choices'][0]['message']['content'].strip()
            else:
                print(f"NIM API error: {response.status_code} - {response.text}")
            return None
            
        except Exception as e:
            print(f"Error generating general answer with NIM API: {e}")
            return None

    async def generate_general_answer_stream(self, question: str):
        """
        Generate a general answer using NIM chat completion with streaming response.
        """
        try:
            system_prompt = (
                "You are a helpful general-purpose AI assistant. "
                "Answer clearly and concisely. Use markdown formatting for lists and code when helpful."
            )

            payload = {
                "model": "nvidia/llama-3.3-nemotron-super-49b-v1.5",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                "temperature": 0.6,
                "top_p": 0.95,
                "max_tokens": 65536,
                "frequency_penalty": 0,
                "presence_penalty": 0,
                "stream": True
            }
            
            try:
                with requests.post(
                    f"{self.base_url}/chat/completions",
                    headers=self.headers,
                    json=payload,
                    stream=True,
                    timeout=(10, 60)  # (connect timeout, read timeout)
                ) as response:
                    if response.status_code == 200:
                        for line in response.iter_lines():
                            if line:
                                line_str = line.decode('utf-8')
                                if line_str.startswith('data: '):
                                    data_str = line_str[6:]
                                    if data_str.strip() == '[DONE]':
                                        break
                                    try:
                                        data = json.loads(data_str)
                                        if data.get('choices') and len(data['choices']) > 0:
                                            delta = data['choices'][0].get('delta', {})
                                            content = delta.get('content')
                                            if content:
                                                yield content
                                    except json.JSONDecodeError:
                                        continue
                    else:
                        error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                        print(f"NIM API streaming error: {error_msg}")
                        yield f"Error: API request failed ({response.status_code})\n"
            except requests.exceptions.Timeout:
                print("NIM API timeout during streaming")
                yield "Error: Request timed out. Please try again.\n"
            except requests.exceptions.ConnectionError:
                print("NIM API connection error during streaming")
                yield "Error: Connection failed. Please check your internet connection.\n"
                    
        except Exception as e:
            print(f"Error generating streaming general answer with NIM API: {e}")
            yield f"Error: {str(e)}\n"