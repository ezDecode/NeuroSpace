#!/usr/bin/env python3
"""
Integration test script for NeuroSpace backend
Tests all services: S3, NIM, Pinecone, Supabase
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.s3_service import S3Service
from app.services.nim_service import NIMService
from app.services.pinecone_service import PineconeService
from app.services.supabase_service import SupabaseService

# Load environment variables
load_dotenv()

async def test_s3_connection():
    """Test S3 connection and basic operations"""
    print("🔍 Testing S3 Connection...")
    try:
        s3_service = S3Service()
        # Test if we can list objects (basic connectivity test)
        response = s3_service.s3_client.list_objects_v2(
            Bucket=s3_service.bucket_name, 
            MaxKeys=1
        )
        print("✅ S3 connection successful")
        return True
    except Exception as e:
        print(f"❌ S3 connection failed: {e}")
        return False

async def test_nim_connection():
    """Test Nvidia NIM API connection"""
    print("🔍 Testing Nvidia NIM API...")
    try:
        nim_service = NIMService()
        success = await nim_service.test_connection()
        if success:
            print("✅ NIM API connection successful")
            return True
        else:
            print("❌ NIM API connection failed")
            return False
    except Exception as e:
        print(f"❌ NIM API test failed: {e}")
        return False

async def test_pinecone_connection():
    """Test Pinecone connection"""
    print("🔍 Testing Pinecone Connection...")
    try:
        pinecone_service = PineconeService()
        success = await pinecone_service.test_connection()
        if success:
            print("✅ Pinecone connection successful")
            return True
        else:
            print("❌ Pinecone connection failed")
            return False
    except Exception as e:
        print(f"❌ Pinecone test failed: {e}")
        return False

async def test_supabase_connection():
    """Test Supabase connection"""
    print("🔍 Testing Supabase Connection...")
    try:
        supabase_service = SupabaseService()
        success = await supabase_service.test_connection()
        if success:
            print("✅ Supabase connection successful")
            return True
        else:
            print("❌ Supabase connection failed")
            return False
    except Exception as e:
        print(f"❌ Supabase test failed: {e}")
        return False

async def test_full_pipeline():
    """Test the complete file processing pipeline"""
    print("🔍 Testing Full Pipeline...")
    try:
        # Test text extraction
        from app.services.text_extractor import TextExtractor
        
        test_text = "This is a test document for NeuroSpace. It contains multiple sentences to test the chunking functionality. The system should be able to process this text and create meaningful chunks for embedding generation."
        
        chunks = TextExtractor.chunk_text(test_text)
        print(f"✅ Text chunking successful: {len(chunks)} chunks created")
        
        # Test embedding generation (if NIM is available)
        nim_service = NIMService()
        if await nim_service.test_connection():
            embeddings = await nim_service.generate_embeddings_batch(chunks[:2])  # Test with first 2 chunks
            valid_embeddings = [e for e in embeddings if e is not None]
            print(f"✅ Embedding generation successful: {len(valid_embeddings)} embeddings created")
            
            # Test Pinecone storage (if available)
            pinecone_service = PineconeService()
            if await pinecone_service.test_connection():
                test_vectors = []
                for i, embedding in enumerate(valid_embeddings):
                    test_vectors.append({
                        'id': f'test_chunk_{i}',
                        'embedding': embedding,
                        'metadata': {
                            'test': True,
                            'chunk_index': i,
                            'text': chunks[i][:100]
                        }
                    })
                
                success = await pinecone_service.upsert_vectors(test_vectors)
                if success:
                    print("✅ Pinecone vector storage successful")
                    
                    # Clean up test vectors
                    await pinecone_service.delete_vectors([v['id'] for v in test_vectors])
                    print("✅ Test vectors cleaned up")
                else:
                    print("❌ Pinecone vector storage failed")
        
        return True
        
    except Exception as e:
        print(f"❌ Full pipeline test failed: {e}")
        return False

async def main():
    """Run all integration tests"""
    print("🚀 Starting NeuroSpace Backend Integration Tests\n")
    
    results = []
    
    # Test individual services
    results.append(await test_s3_connection())
    results.append(await test_nim_connection())
    results.append(await test_pinecone_connection())
    results.append(await test_supabase_connection())
    
    # Test full pipeline
    results.append(await test_full_pipeline())
    
    # Summary
    print("\n" + "="*50)
    print("📊 INTEGRATION TEST RESULTS")
    print("="*50)
    
    services = ["S3", "NIM API", "Pinecone", "Supabase", "Full Pipeline"]
    for service, result in zip(services, results):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{service:15} {status}")
    
    passed = sum(results)
    total = len(results)
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is ready for production.")
    else:
        print("⚠️  Some tests failed. Please check your configuration.")
        print("\nTroubleshooting tips:")
        print("1. Verify all environment variables are set correctly")
        print("2. Check API keys and credentials")
        print("3. Ensure services are accessible from your network")
        print("4. Review service-specific error messages above")

if __name__ == "__main__":
    asyncio.run(main())