import asyncio
import os
from dotenv import load_dotenv
from app.services.nim_service import NIMService
import requests

async def test_embedding_debug():
    """Debug embedding issues"""
    # Load environment
    load_dotenv()
    
    print("=== NIM Embedding Debug Test ===")
    
    # Check environment variables
    api_key = os.getenv('NVIDIA_NIM_API_KEY')
    base_url = os.getenv('NVIDIA_NIM_BASE_URL', 'https://integrate.api.nvidia.com/v1')
    
    print(f"API Key exists: {bool(api_key)}")
    print(f"API Key length: {len(api_key) if api_key else 0}")
    print(f"Base URL: {base_url}")
    
    if not api_key:
        print("❌ NVIDIA_NIM_API_KEY is not set!")
        return
    
    # Test direct API call
    print("\n=== Testing Direct API Call ===")
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    
    payload = {
        "model": "nvidia/nv-embedqa-e5-v5",
        "input": "What is artificial intelligence?",
        "input_type": "query",
        "encoding_format": "float"
    }
    
    try:
        url = f"{base_url}/embeddings"
        print(f"Making request to: {url}")
        print(f"Payload: {payload}")
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Direct API call successful!")
            print(f"Response keys: {list(result.keys())}")
            
            if 'data' in result and len(result['data']) > 0:
                embedding = result['data'][0].get('embedding')
                if embedding:
                    print(f"✅ Embedding found! Length: {len(embedding)}")
                    print(f"First 5 values: {embedding[:5]}")
                else:
                    print("❌ No embedding in response data")
                    print(f"Data[0] keys: {list(result['data'][0].keys()) if result['data'] else 'No data'}")
            else:
                print("❌ No data array in response")
                print(f"Full response: {result}")
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"Error response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out")
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Connection error: {e}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
    
    # Test through service
    print("\n=== Testing Through NIM Service ===")
    try:
        service = NIMService()
        embedding = await service.generate_embedding("What is artificial intelligence?")
        
        if embedding:
            print(f"✅ Service embedding successful! Length: {len(embedding)}")
        else:
            print("❌ Service embedding failed - returned None")
            
    except Exception as e:
        print(f"❌ Service embedding failed with exception: {e}")

if __name__ == "__main__":
    asyncio.run(test_embedding_debug())
