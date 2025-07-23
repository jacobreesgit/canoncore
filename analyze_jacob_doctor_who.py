#!/usr/bin/env python3
from supabase import create_client, Client
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv('.env.local')

# Using service role key to bypass RLS
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def main():
    # Service role bypasses RLS policies
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    print("=== JACOB'S DOCTOR WHO UNIVERSE - FULL ACCESS ===")
    
    # Find Doctor Who universe
    universes_response = supabase.table('universes').select('*').eq('slug', 'doctor-who').execute()
    
    if not universes_response.data:
        print("❌ Doctor Who universe not found")
        # Check all universes
        all_universes = supabase.table('universes').select('*').execute()
        if all_universes.data:
            print(f"📍 Found {len(all_universes.data)} universe(s):")
            for u in all_universes.data:
                print(f"   - {u['name']} (slug: {u['slug']})")
        return
    
    universe = universes_response.data[0]
    universe_id = universe['id']
    
    print(f"✅ UNIVERSE: {universe['name']}")
    print(f"   ID: {universe_id}")
    print(f"   User: {universe['user_id']}")
    print(f"   Created: {universe['created_at']}")
    print(f"   Description: {universe['description'] or 'None'}")
    print()
    
    # Get all content items
    content_response = supabase.table('content_items').select('*').eq('universe_id', universe_id).order('parent_id', desc=False).order('order_index', desc=False).execute()
    
    if content_response.data:
        print(f"📋 CONTENT STRUCTURE ({len(content_response.data)} items):")
        
        # Build hierarchy for tree display
        items_by_parent = {}
        all_items = {item['id']: item for item in content_response.data}
        
        for item in content_response.data:
            parent_id = item['parent_id'] or 'root'
            if parent_id not in items_by_parent:
                items_by_parent[parent_id] = []
            items_by_parent[parent_id].append(item)
        
        def print_tree(parent_id='root', level=0):
            if parent_id not in items_by_parent:
                return
            
            for item in items_by_parent[parent_id]:
                indent = "  " * level
                has_children = item['id'] in items_by_parent
                emoji = "📁" if has_children else "📄"
                
                print(f"{indent}{emoji} {item['title']} ({item['item_type']})")
                if item['description']:
                    desc = item['description'][:80] + "..." if len(item['description']) > 80 else item['description']
                    print(f"{indent}   └─ {desc}")
                
                # Recurse for children
                print_tree(item['id'], level + 1)
        
        print_tree()
        print()
        
        # Content type analysis
        type_counts = {}
        for item in content_response.data:
            item_type = item['item_type']
            type_counts[item_type] = type_counts.get(item_type, 0) + 1
        
        print("📊 CONTENT BY TYPE:")
        for item_type, count in sorted(type_counts.items()):
            print(f"   {item_type}: {count}")
        print()
        
    else:
        print("📋 No content items found.")
    
    # Check custom content types
    custom_types_response = supabase.table('custom_content_types').select('*').eq('universe_id', universe_id).execute()
    if custom_types_response.data:
        print(f"🎨 CUSTOM CONTENT TYPES ({len(custom_types_response.data)}):")
        for ct in custom_types_response.data:
            print(f"   {ct['emoji']} {ct['name']}")
        print()
    
    # Check disabled types
    disabled_types_response = supabase.table('disabled_content_types').select('*').eq('universe_id', universe_id).execute()
    if disabled_types_response.data:
        print(f"🚫 DISABLED BUILT-IN TYPES ({len(disabled_types_response.data)}):")
        for dt in disabled_types_response.data:
            print(f"   ❌ {dt['content_type']}")
        print()
    
    # Check versions
    versions_response = supabase.table('universe_versions').select('*').eq('universe_id', universe_id).order('version_number').execute()
    if versions_response.data:
        print(f"📚 UNIVERSE VERSIONS ({len(versions_response.data)}):")
        for v in versions_response.data:
            current = " (CURRENT)" if v['is_current'] else ""
            print(f"   v{v['version_number']}: {v['commit_message']}{current}")
        print()
    
    print("=== ANALYSIS COMPLETE ===")
    print(f"This universe has {len(content_response.data) if content_response.data else 0} content items")
    print("Ready for development discussions based on actual data structure!")

if __name__ == "__main__":
    main()