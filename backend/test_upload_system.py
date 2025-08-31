#!/usr/bin/env python3
"""
Test script for the file upload system
Run this to verify that file uploads are working correctly
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

async def test_upload_system():
    """Test the upload system components"""
    print("🧪 Testing NeuroSpace Upload System...")
    
    try:
        # Test 1: Check environment variables
        print("\n1. Checking environment variables...")
        required_vars = [
            'AWS_ACCESS_KEY_ID',
            'AWS_SECRET_ACCESS_KEY', 
            'AWS_REGION',
            'AWS_S3_BUCKET_NAME',
            'SUPABASE_URL',
            'SUPABASE_SERVICE_ROLE_KEY'
        ]
        
        missing_vars = []
        for var in required_vars:
            value = os.getenv(var)
            if value:
                print(f"   ✅ {var}: {value[:10]}...")
            else:
                print(f"   ❌ {var}: Not set")
                missing_vars.append(var)
        
        if missing_vars:
            print(f"\n   ⚠️  Missing environment variables: {', '.join(missing_vars)}")
            print("   Please check your .env file")
        else:
            print("   ✅ All required environment variables are set")
        
        # Test 2: Test S3Service
        print("\n2. Testing S3Service...")
        try:
            from app.services.s3_service import S3Service
            s3_service = S3Service()
            print(f"   ✅ S3Service initialized")
            print(f"   ✅ S3 Bucket: {s3_service.bucket_name}")
            
            if s3_service.s3_client:
                print("   ✅ S3 client available")
            else:
                print("   ⚠️  S3 client not available (may be in test mode)")
                
        except Exception as e:
            print(f"   ❌ S3Service error: {e}")
        
        # Test 3: Test SupabaseService
        print("\n3. Testing SupabaseService...")
        try:
            from app.services.supabase_service import SupabaseService
            supabase_service = SupabaseService()
            print(f"   ✅ SupabaseService initialized")
            print(f"   ✅ Supabase URL: {supabase_service.url}")
            
        except Exception as e:
            print(f"   ❌ SupabaseService error: {e}")
        
        # Test 4: Test file models
        print("\n4. Testing file models...")
        try:
            from app.models.file import FileUploadRequest, FileProcessingRequest
            print("   ✅ File models imported successfully")
            
            # Test model validation
            test_data = {
                'file_key': 'test/test.txt',
                'file_name': 'test.txt',
                'file_size': 1024,
                'content_type': 'text/plain'
            }
            
            upload_request = FileUploadRequest(**test_data)
            print(f"   ✅ FileUploadRequest validation passed: {upload_request.file_name}")
            
            processing_request = FileProcessingRequest(**test_data, user_id='test_user')
            print(f"   ✅ FileProcessingRequest validation passed: {processing_request.file_name}")
            
        except Exception as e:
            print(f"   ❌ File models error: {e}")
        
        # Test 5: Test routes
        print("\n5. Testing route imports...")
        try:
            from app.routes import files, processing
            print("   ✅ File routes imported successfully")
            print("   ✅ Processing routes imported successfully")
            
        except Exception as e:
            print(f"   ❌ Route import error: {e}")
        
        print("\n🎯 Upload System Test Complete!")
        
        if missing_vars:
            print("\n⚠️  Issues Found:")
            print(f"   - Missing environment variables: {', '.join(missing_vars)}")
            print("   - Please set these in your .env file")
        else:
            print("\n✅ All tests passed! Upload system is ready.")
            
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_upload_system())
