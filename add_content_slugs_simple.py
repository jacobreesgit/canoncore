#!/usr/bin/env python3
from supabase import create_client, Client
import os
from dotenv import load_dotenv
import re

# Load environment variables from .env.local
load_dotenv('.env.local')

# Using service role key to bypass RLS
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def generate_slug(title, existing_slugs):
    """Generate a unique slug from title"""
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'\s+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    
    # Ensure slug is not empty
    if not slug:
        slug = 'content-item'
    
    # Make unique
    base_slug = slug
    counter = 0
    while slug in existing_slugs:
        counter += 1
        slug = f"{base_slug}-{counter}"
    
    existing_slugs.add(slug)
    return slug

def main():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("=== ADDING CONTENT SLUGS ===")
    
    try:
        # Step 1: Add slug column (if it doesn't exist)
        print("Step 1: Adding slug column...")
        try:
            # First check if column exists
            result = supabase.table('content_items').select('slug').limit(1).execute()
            print("✅ Slug column already exists")
        except:
            # Column doesn't exist, we need to add it via SQL
            print("Need to add slug column - this requires database admin access")
            print("Please run this SQL in your Supabase SQL editor:")
            print("ALTER TABLE content_items ADD COLUMN slug TEXT;")
            print("Then run this script again.")
            return False
        
        # Step 2: Get all content items without slugs
        print("Step 2: Getting content items...")
        result = supabase.table('content_items').select('id, title, universe_id, slug').execute()
        content_items = result.data
        
        print(f"Found {len(content_items)} content items")
        
        # Step 3: Generate and update slugs
        print("Step 3: Generating slugs...")
        
        # Group by universe to ensure uniqueness within each universe
        universes = {}
        for item in content_items:
            universe_id = item['universe_id']
            if universe_id not in universes:
                universes[universe_id] = {'items': [], 'existing_slugs': set()}
            universes[universe_id]['items'].append(item)
            if item['slug']:
                universes[universe_id]['existing_slugs'].add(item['slug'])
        
        # Update items that don't have slugs
        updates_made = 0
        for universe_id, universe_data in universes.items():
            for item in universe_data['items']:
                if not item['slug']:
                    new_slug = generate_slug(item['title'], universe_data['existing_slugs'])
                    
                    # Update the item
                    update_result = supabase.table('content_items').update({
                        'slug': new_slug
                    }).eq('id', item['id']).execute()
                    
                    print(f"✅ Updated '{item['title']}' → slug: '{new_slug}'")
                    updates_made += 1
        
        print(f"\n✅ Migration completed! Updated {updates_made} items with slugs.")
        
        # Step 4: Verify results
        print("\n=== VERIFICATION ===")
        result = supabase.table('content_items').select('title, slug').execute()
        for item in result.data:
            print(f"  - {item['title']} → {item['slug']}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    return True

if __name__ == "__main__":
    main()