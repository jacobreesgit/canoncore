#!/usr/bin/env python3
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Using service role key to bypass RLS
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def main():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("=== ADDING CONTENT SLUGS ===")
    
    # Read the migration SQL
    with open('supabase/migrations/20250723200000_add_content_slugs.sql', 'r') as f:
        migration_sql = f.read()
    
    # Split into individual statements
    statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
    
    try:
        for i, statement in enumerate(statements):
            if statement:
                print(f"Executing statement {i+1}/{len(statements)}...")
                print(f"Statement: {statement[:100]}...")
                
                # Use rpc to execute raw SQL
                result = supabase.rpc('exec_sql', {'sql': statement}).execute()
                print(f"✅ Statement {i+1} executed successfully")
                
    except Exception as e:
        print(f"❌ Error executing migration: {e}")
        return False
    
    print("✅ Migration completed successfully!")
    
    # Verify the results
    print("\n=== VERIFICATION ===")
    try:
        result = supabase.table('content_items').select('id, title, slug').execute()
        print(f"Content items with slugs:")
        for item in result.data:
            print(f"  - {item['title']} → {item['slug']}")
    except Exception as e:
        print(f"Verification failed: {e}")
    
    return True

if __name__ == "__main__":
    main()