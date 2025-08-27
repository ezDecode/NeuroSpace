import os
import requests
import json
from typing import List, Optional
import httpx

class NIMService:
    def __init__(self):
        self.api_key = os.getenv('NVIDIA_NIM_API_KEY')
        self.base_url = os.getenv('NVIDIA_NIM_BASE_URL', 'https://integrate.api.nvidia.com/v1')
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        # Use direct HTTP requests instead of OpenAI client to avoid proxy issues
        self.client = None  # Will use direct requests
        print("NIM Service initialized with direct HTTP client")

    async def generate_embedding(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding for a text using Nvidia NIM API
        """
        try:
            # Using the nvidia-embed-qa-v1 model for embeddings
            url = f"{self.base_url}/v1/chat/completions"
            
            payload = {
                "model": "nvidia-embed-qa-v1",
                "messages": [
                    {
                        "role": "user",
                        "content": text
                    }
                ],
                "temperature": 0.0,
                "max_tokens": 1024
            }

            response = requests.post(url, headers=self.headers, json=payload)
            
            if response.status_code == 200:
                result = response.json()
                # Extract embedding from response
                # Note: The actual response structure may vary based on the model
                if 'choices' in result and len(result['choices']) > 0:
                    content = result['choices'][0].get('message', {}).get('content', '')
                    # Parse the embedding from the response
                    # This is a placeholder - actual implementation depends on NIM API response format
                    return self._parse_embedding_response(content)
                else:
                    print("Unexpected response format from NIM API")
                    return None
            else:
                print(f"NIM API error: {response.status_code} - {response.text}")
                return None

        except Exception as e:
            print(f"Error generating embedding with NIM API: {e}")
            return None

    async def generate_embeddings_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """
        Generate embeddings for multiple texts
        """
        embeddings = []
        for text in texts:
            embedding = await self.generate_embedding(text)
            embeddings.append(embedding)
        return embeddings

    def _parse_embedding_response(self, content: str) -> Optional[List[float]]:
        """
        Parse embedding from NIM API response
        This is a placeholder - actual implementation depends on response format
        """
        try:
            # This is a simplified parser - adjust based on actual NIM API response
            if content.startswith('[') and content.endswith(']'):
                # Assume it's a JSON array of floats
                return json.loads(content)
            else:
                # Try to extract numbers from the response
                import re
                numbers = re.findall(r'-?\d+\.?\d*', content)
                if numbers:
                    return [float(num) for num in numbers]
                return None
        except Exception as e:
            print(f"Error parsing embedding response: {e}")
            return None

    async def test_connection(self) -> bool:
        """
        Test connection to NIM API
        """
        try:
            test_text = "Hello, world!"
            embedding = await self.generate_embedding(test_text)
            return embedding is not None
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
            
            with requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                stream=True,
                timeout=60
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
                    yield f"Error: HTTP {response.status_code}"
                    
        except Exception as e:
            print(f"Error generating streaming answer with NIM API: {e}")
            yield f"Error: {str(e)}"

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
            
            with requests.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                stream=True,
                timeout=60
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
                    yield f"Error: HTTP {response.status_code}"
                    
        except Exception as e:
            print(f"Error generating streaming general answer with NIM API: {e}")
            yield f"Error: {str(e)}"