#!/usr/bin/env python3
"""
Convert map JSON format to GS3 room format
Takes a JSON file with room data and converts to our MongoDB-ready format
"""

import json
import sys
import re
from typing import Dict, List, Optional

# Location to Area ID mapping
# Maps the "location" field from map JSON to our area IDs
LOCATION_TO_AREA = {
    # Wehnimer's Landing
    "Wehnimer's Landing": "wl-town",
    "the town of Wehnimer's Landing": "wl-town",
    "the Graveyard": "wl-graveyard",
    "Darkstone Castle": "wl-darkstone",
    "the Upper Trollfang": "wl-trollfang",
    
    # River's Rest
    "River's Rest": "rr-riversrest",
    "the Citadel": "rr-citadel",
    "the Maelstrom": "rr-maelstrom",
    
    # Solhaven
    "Solhaven": "vo-solhaven",
    "the free port of Solhaven": "vo-solhaven",
    
    # Icemule Trace
    "Icemule Trace": "imt-icemule",
    
    # Teras Isle
    "Teras Isle": "ti-teras",
    "Kharam-Dzu": "ti-teras",
    "the town of Kharam-Dzu": "ti-teras",
    
    # Elven Nations
    "Ta'Illistim": "en-taillistim",
    "Ta'Vaalor": "en-tavaalor",
    "Cysaegir": "en-cysaegir",
    "Old Ta'Faendryl": "en-old-tafaendryl",
    "Zul Logoth": "en-zul-logoth",
    "Whistler's Pass": "en-whistlers-pass",
    
    # Other locations
    "Mist Harbor": "global",
    "Kraken's Fall": "global",
    "Caligos Isle": "global",
    "Bloodriven Village": "global",
    "Rumor Woods": "global",
    
    # Default fallback
    "": "global"
}

def guess_area_from_location(location: str) -> str:
    """
    Guess area ID from location field.
    Returns the matched area ID or 'global' as fallback.
    """
    if not isinstance(location, str):
        return "global"
    
    # Direct match
    if location in LOCATION_TO_AREA:
        return LOCATION_TO_AREA[location]
    
    # Fuzzy match - check if location contains key phrases
    location_lower = location.lower()
    
    if "wehnimer" in location_lower:
        if "graveyard" in location_lower:
            return "wl-graveyard"
        if "darkstone" in location_lower:
            return "wl-darkstone"
        return "wl-town"
    
    if "river" in location_lower and "rest" in location_lower:
        return "rr-riversrest"
    
    if "solhaven" in location_lower:
        return "vo-solhaven"
    
    if "icemule" in location_lower:
        return "imt-icemule"
    
    if "teras" in location_lower or "kharam" in location_lower:
        return "ti-teras"
    
    if "illistim" in location_lower:
        return "en-taillistim"
    
    if "vaalor" in location_lower:
        return "en-tavaalor"
    
    # Default fallback
    return "global"

def extract_direction(command: str) -> Optional[str]:
    """
    Extract direction from wayto command.
    Examples:
      "north" -> "north"
      "go door" -> "door"
      ";e complicated script" -> None (skip scripted exits for now)
    """
    # Skip scripted exits (starting with ;e or other complex commands)
    if command.startswith(';'):
        return None
    
    # Handle "go <target>" format
    go_match = re.match(r'^go\s+(.+)$', command, re.IGNORECASE)
    if go_match:
        return go_match.group(1).strip()
    
    # Direct cardinal/ordinal directions
    valid_directions = {
        'north', 'south', 'east', 'west',
        'northeast', 'southeast', 'northwest', 'southwest',
        'up', 'down', 'out', 'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw', 'u', 'd'
    }
    
    if command.lower() in valid_directions:
        return command.lower()
    
    # Otherwise return as-is (might be "door", "gate", etc.)
    return command

def convert_room(room_data: Dict, area_id: Optional[str] = None, id_to_uid_map: Optional[Dict[str, str]] = None) -> Optional[Dict]:
    """Convert a single room from map JSON format to GS3 format"""
    
    # Extract UID (our canonical ID)
    uid_list = room_data.get('uid', [])
    
    if uid_list and len(uid_list) > 0:
        # Use existing UID
        uid = uid_list[0]
        canonical_id = f"u{uid}"
    else:
        # Generate synthetic UID from the room's ID
        # Use a high number prefix to avoid conflicts (900000000 + id)
        # This makes it clear these are generated IDs
        room_id = room_data.get('id')
        if room_id is None:
            return None
        synthetic_uid = 900000000 + room_id
        canonical_id = f"u{synthetic_uid}"
    
    # Extract title (remove brackets)
    title_list = room_data.get('title', [])
    if not title_list:
        return None
    
    title = title_list[0]
    # Remove brackets: "[Town Square]" -> "Town Square"
    title = re.sub(r'^\[(.+?)\]$', r'\1', title)
    
    # Extract description
    desc_list = room_data.get('description', [])
    description = desc_list[0] if desc_list else ""
    
    # Convert wayto to exits
    # wayto format: {"destination_id": "direction_command"}
    # our format: [{"direction": "north", "roomId": "u1234"}]
    wayto = room_data.get('wayto', {})
    exits = []
    
    for dest_id, command in wayto.items():
        direction = extract_direction(command)
        if direction:
            # Look up the actual UID for this destination
            # dest_id is the map JSON id, we need to convert to UID
            if id_to_uid_map and dest_id in id_to_uid_map:
                actual_room_id = id_to_uid_map[dest_id]
            else:
                # Fallback: assume dest_id is already a UID
                actual_room_id = f"u{dest_id}"
            
            exits.append({
                "direction": direction,
                "roomId": actual_room_id
            })
    
    # Extract location and determine area
    location = room_data.get('location', '')
    
    # If area_id not provided, guess from location
    if not area_id:
        area_id = guess_area_from_location(location)
    
    # Build room object
    return {
        "id": canonical_id,
        "areaId": area_id,
        "title": title,
        "description": description,
        "canonical_id": canonical_id,
        "exits": exits,
        "features": [],
        "items": [],
        "metadata": {
            "importedAt": None,
            "originalFormat": "map-json",
            "source": location,
            "original_id": room_data.get('id')
        }
    }

def filter_by_location(rooms: List[Dict], location_filter: Optional[str]) -> List[Dict]:
    """Filter rooms by location field"""
    if not location_filter:
        return rooms
    
    filtered = []
    for room in rooms:
        location = room.get('location', '')
        # Convert to string in case it's not a string
        if not isinstance(location, str):
            continue
        if location_filter.lower() in location.lower():
            filtered.append(room)
    
    return filtered

def build_id_to_uid_mapping(map_data: List[Dict]) -> Dict[str, str]:
    """Build mapping from map JSON id to actual UID"""
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
    
    return id_to_uid

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Convert map JSON to GS3 room format')
    parser.add_argument('input_json', help='Input map JSON file')
    parser.add_argument('-a', '--area', help='Force all rooms to specific area ID (e.g., wl-town)', default=None)
    parser.add_argument('-o', '--output', help='Output JSON file', required=True)
    parser.add_argument('-l', '--location', help='Filter by location (e.g., "Wehnimer")', default=None)
    parser.add_argument('--all', action='store_true', help='Import all rooms with auto-detected areas')
    
    args = parser.parse_args()
    
    print(f"Reading map JSON from {args.input_json}...")
    with open(args.input_json, 'r', encoding='utf-8') as f:
        map_data = json.load(f)
    
    print(f"Found {len(map_data)} total rooms")
    
    # Build ID to UID mapping for exit resolution
    print("Building ID to UID mapping...")
    id_to_uid_map = build_id_to_uid_mapping(map_data)
    print(f"Mapped {len(id_to_uid_map)} room IDs to UIDs")
    
    # Determine mode
    if args.all:
        print("Mode: Importing ALL rooms with auto-detected areas")
    elif args.location:
        map_data = filter_by_location(map_data, args.location)
        print(f"Filtered to {len(map_data)} rooms matching location: {args.location}")
        if args.area:
            print(f"Forcing all rooms to area: {args.area}")
    elif args.area:
        print(f"Forcing all rooms to area: {args.area}")
    
    # Convert rooms
    converted_rooms = []
    skipped = 0
    rooms_with_real_uid = 0
    rooms_with_synthetic_uid = 0
    area_counts = {}
    
    for room in map_data:
        # Pass area_id only if explicitly specified, and the ID mapping
        converted = convert_room(room, args.area, id_to_uid_map)
        if converted:
            converted_rooms.append(converted)
            # Track area distribution
            area_id = converted['areaId']
            area_counts[area_id] = area_counts.get(area_id, 0) + 1
            
            # Check if this was a synthetic or real UID
            if converted['canonical_id'].startswith('u9'):
                rooms_with_synthetic_uid += 1
            else:
                rooms_with_real_uid += 1
        else:
            skipped += 1
    
    print(f"\nConverted {len(converted_rooms)} rooms:")
    print(f"  - {rooms_with_real_uid} with original UIDs")
    print(f"  - {rooms_with_synthetic_uid} with generated UIDs (u9xxxxxxxx)")
    if skipped > 0:
        print(f"Skipped {skipped} rooms (no ID or title)")
    
    # Show area distribution
    print(f"\nArea distribution:")
    for area_id, count in sorted(area_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {area_id:30s}: {count:5d} rooms")
    
    # Write output
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(converted_rooms, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Exported to {args.output}")
    print(f"\nImport with:")
    print(f"   cd /home/greg/gs3")
    if args.all:
        print(f"   node src/adapters/importers/import-rooms.js {args.output} --merge")
        print(f"\nNote: Rooms were auto-assigned to areas. Review and correct using admin commands.")
    else:
        print(f"   node src/adapters/importers/import-rooms.js {args.output} --merge")

if __name__ == '__main__':
    main()

