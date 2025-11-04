#!/usr/bin/env python3
"""
Fix Exit IDs - Convert exit roomIds from map ID to actual UID
Repairs the bug where exits used u{id} instead of u{uid}
"""

import json
import sys
from pymongo import MongoClient

def main():
    # Load original map JSON to build id->uid mapping
    print("Loading original map JSON...")
    with open('logs/map-1762231737.json', 'r') as f:
        map_data = json.load(f)
    
    # Build mapping: id -> uid
    id_to_uid = {}
    for room in map_data:
        room_id = room.get('id')
        uid_list = room.get('uid', [])
        
        if room_id is not None:
            if uid_list and len(uid_list) > 0:
                # Has real UID
                uid = uid_list[0]
                id_to_uid[str(room_id)] = f"u{uid}"
            else:
                # No UID - uses synthetic
                synthetic_uid = 900000000 + room_id
                id_to_uid[str(room_id)] = f"u{synthetic_uid}"
    
    print(f"Built mapping for {len(id_to_uid)} rooms")
    
    # Connect to MongoDB
    print("Connecting to MongoDB...")
    client = MongoClient('mongodb://localhost:27017/')
    db = client['gs3']
    
    # Get all rooms
    rooms = list(db.rooms.find({}))
    print(f"Found {len(rooms)} rooms in database")
    
    # Track changes
    rooms_updated = 0
    exits_fixed = 0
    
    # Fix each room's exits
    for room in rooms:
        room_id = room['id']
        exits = room.get('exits', [])
        
        changed = False
        new_exits = []
        
        for exit in exits:
            old_room_id = exit['roomId']
            
            # Extract the numeric part (could be u644 or u13104045)
            if old_room_id.startswith('u'):
                numeric_part = old_room_id[1:]
                
                # Check if this looks like a map ID (needs conversion)
                # Map IDs are typically < 40000, UIDs are typically > 100000
                try:
                    num = int(numeric_part)
                    
                    # If it's a small number, try to convert it
                    if num < 900000000 and numeric_part in id_to_uid:
                        new_room_id = id_to_uid[numeric_part]
                        if new_room_id != old_room_id:
                            print(f"  {room_id}: exit {exit['direction']} {old_room_id} -> {new_room_id}")
                            exit['roomId'] = new_room_id
                            changed = True
                            exits_fixed += 1
                except ValueError:
                    pass
            
            new_exits.append(exit)
        
        if changed:
            # Update room in database
            db.rooms.update_one(
                {'id': room_id},
                {'$set': {'exits': new_exits}}
            )
            rooms_updated += 1
    
    print(f"\n✅ Complete!")
    print(f"   Rooms updated: {rooms_updated}")
    print(f"   Exits fixed: {exits_fixed}")
    
    client.close()

if __name__ == '__main__':
    main()

