#!/usr/bin/env python3
"""
Test script for the upload system
Run this after applying the database schema fix to verify everything works
"""

import asyncio
import os
import sys
from datetime import datetime

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

async def test_upload_system():
    """Test the complete upload system"""
    print("🧪 Testing NeuroSpace Upload System")
    print("=" * 50)
    
    try:
        # Test 1: Import the app
        print("\n1️⃣ Testing app imports...")
        from app import app
        print("✅ App imports successful")
        
        # Test 2: Test Supabase connection
        print("\n2️⃣ Testing Supabase connection...")
        from app.services.supabase_service import SupabaseService
        supabase_service = SupabaseService()
        connection_result = await supabase_service.test_connection()
        if connection_result:
            print("✅ Supabase connection successful")
        else:
            print("❌ Supabase connection failed")
            return False
        
        # Test 3: Test file creation (this should work after schema fix)
        print("\n3️⃣ Testing file creation...")
        test_file_data = {
            'file_key': f'test/test_{datetime.now().strftime("%Y%m%d_%H%M%S")}.txt',
            'file_name': 'test_file.txt',
            'user_id': 'test_user_123',
            'file_size': 1024,
            'content_type': 'text/plain',
            'status': 'uploaded'
        }
        
        print(f"   Creating test file: {test_file_data['file_name']}")
        file_id = await supabase_service.create_file_record(test_file_data)
        
        if file_id:
            print(f"✅ File created successfully with ID: {file_id}")
            
            # Test 4: Test file retrieval
            print("\n4️⃣ Testing file retrieval...")
            file_data = await supabase_service.get_file_by_id(file_id)
            if file_data:
                print(f"✅ File retrieved successfully: {file_data.get('file_name', 'unknown')}")
                print(f"   File details: {file_data}")
            else:
                print("❌ File retrieval failed")
                return False
                
            # Test 5: Test file deletion (cleanup)
            print("\n5️⃣ Testing file deletion...")
            delete_result = await supabase_service.delete_file(file_id, 'test_user_123')
            if delete_result:
                print("✅ Test file deleted successfully")
            else:
                print("❌ File deletion failed")
                
        else:
            print("❌ File creation failed")
            print("   This indicates the database schema fix is still needed")
            print("   Please run the fix_schema.sql script in Supabase SQL Editor")
            return False
        
        print("\n" + "=" * 50)
        print("🎉 All tests passed! Upload system is working correctly.")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        print(f"Error type: {type(e)}")
        print(f"Error details: {str(e)}")
        
        # Check if it's a schema issue
        if "embedding_count" in str(e) or "PGRST204" in str(e):
            print("\n🚨 DATABASE SCHEMA ISSUE DETECTED!")
            print("Please run the fix_schema.sql script in your Supabase SQL Editor")
            print("File location: backend/fix_schema.sql")
        
        return False

def main():
    """Main test function"""
    print("Starting upload system test...")
    
    # Check if we're in the right directory
    if not os.path.exists('app'):
        print("❌ Error: Please run this script from the backend directory")
        print("   Current directory:", os.getcwd())
        print("   Expected: backend/")
        return 1
    
    # Run the async test
    try:
        result = asyncio.run(test_upload_system())
        return 0 if result else 1
    except Exception as e:
        print(f"❌ Test runner failed: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
