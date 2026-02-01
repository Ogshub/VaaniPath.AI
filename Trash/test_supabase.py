import sys
sys.path.insert(0, 'c:/ShubhamCollege/PDFtranslator/OK/HIN_EN_PDF_Translator')

from supabase import create_client

SUPABASE_URL = "https://yamsbobotytqyhzqfxzx.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhbXNib2JvdHl0cXloenFmeHp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyNDYxNTAsImV4cCI6MjA4NDgyMjE1MH0.yf6aRsE4Skk3GmhtVW0Cs5zb8h_h4hw0q61MCvAntGU"

print("Testing Supabase connection...")
try:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Client created successfully")
    
    # Test listing files
    print("\nTesting bucket access...")
    result = supabase.storage.from_("pdfs").list()
    print(f"✅ Bucket accessible. Files found: {len(result)}")
    
    # Test upload with a dummy file
    print("\nTesting upload...")
    test_content = b"Test PDF content"
    upload_result = supabase.storage.from_("pdfs").upload(
        path="test_file.pdf",
        file=test_content,
        file_options={"content-type": "application/pdf", "upsert": "true"}
    )
    print(f"✅ Upload successful: {upload_result}")
    
    # Get public URL
    public_url_data = supabase.storage.from_("pdfs").get_public_url("test_file.pdf")
    print(f"✅ Public URL: {public_url_data}")
    
    print("\n🎉 All tests passed! Supabase is working correctly.")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
