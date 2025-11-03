#!/usr/bin/env python3
"""
GS3 Room Importer - Complete Pipeline
Parses, links, and prepares rooms from movement logs for MongoDB import.

Features:
- Canonical ID deduplication (hash of title + description)
- Bidirectional exit linking
- Self-loop detection and prevention
- Direction validation (only valid ordinals: n, s, e, w, ne, nw, se, sw, up, down, out)
- Runtime state exclusion ("You also see..." stripped from descriptions)
- Automatic feature extraction (gates, paths, towers, etc.)

Note: Non-ordinal exits (go gate, go door, climb ladder) will be added in future iteration.
      Current version only handles standard movement directions.
"""

import re
import json
import hashlib
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path

# Valid ordinal directions (SSOT)
VALID_ORDINALS = {
    'north', 'south', 'east', 'west',
    'northeast', 'southeast', 'northwest', 'southwest',
    'up', 'down', 'out'
}

# Direction abbreviations
DIRECTION_ABBREV = {
    'n': 'north', 's': 'south', 'e': 'east', 'w': 'west',
    'ne': 'northeast', 'se': 'southeast', 'nw': 'northwest', 'sw': 'southwest',
    'u': 'up', 'd': 'down'
}

REVERSE_DIRECTION = {
    'north': 'south', 'south': 'north',
    'east': 'west', 'west': 'east',
    'northeast': 'southwest', 'southwest': 'northeast',
    'northwest': 'southeast', 'southeast': 'northwest',
    'up': 'down', 'down': 'up',
    'out': 'out'
}

def is_valid_direction(direction: str) -> bool:
    """Check if direction is a valid ordinal direction"""
    normalized = DIRECTION_ABBREV.get(direction, direction)
    return normalized in VALID_ORDINALS

@dataclass
class Room:
    """Represents a room in the game world"""
    title: str
    description: str
    canonical_id: str
    exits: List[Dict[str, str]]  # [{'direction': 'north', 'roomId': 'unknown'}]
    features: List[str]
    items: List[str]
    area_id: str
    
    def to_dict(self) -> dict:
        """Convert to MongoDB-ready dictionary"""
        return {
            'id': self.canonical_id,
            'areaId': self.area_id,
            'title': self.title,
            'description': self.description,
            'canonical_id': self.canonical_id,
            'exits': self.exits,
            'features': self.features,
            'items': self.items,
            'metadata': {
                'importedAt': None,  # Set by importer
                'originalFormat': 'movement-log',
                'source': None  # Set by importer
            }
        }

class RoomParser:
    """Parses GS3 movement logs into linked room data"""
    
    def __init__(self, area_id: str):
        self.area_id = area_id
        self.rooms: Dict[str, Room] = {}  # canonical_id -> Room
        self.room_sequence: List[Tuple[str, Optional[str]]] = []  # [(canonical_id, direction_used)]
        
    def compute_canonical_id(self, title: str, description: str) -> str:
        """Generate canonical ID from title and description"""
        # Clean description (remove "You also see..." part)
        desc_clean = re.sub(r'\.\s+You also see\s+.+?\.?\s*$', '.', description, flags=re.IGNORECASE)
        desc_clean = re.sub(r'\s+', ' ', desc_clean.strip())
        
        # Create hash
        h = hashlib.sha1()
        h.update(title.strip().encode('utf-8'))
        h.update(b"|")
        h.update(desc_clean.encode('utf-8'))
        hash_suffix = h.hexdigest()[:16]
        
        # Create slug from title
        slug = title.lower()
        slug = re.sub(r"[^a-z0-9]+", "_", slug)
        slug = slug.strip('_')
        
        return f"{slug}_{hash_suffix}"
    
    def extract_features(self, description: str) -> List[str]:
        """Extract notable features from description"""
        features = []
        
        # Common feature patterns
        patterns = [
            r'\b(sign|gate|door|window|path|trail|tower|wall|bridge)\b',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, description, re.IGNORECASE)
            features.extend([m.lower() for m in matches])
        
        return list(set(features))  # Remove duplicates
    
    def parse_log(self, log_path: str) -> None:
        """Parse movement log and build room graph"""
        
        with open(log_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        i = 0
        last_direction = None
        
        while i < len(lines):
            line = lines[i].strip()
            
            # Skip empty lines
            if not line:
                i += 1
                continue
            
            # Check for movement command (>direction)
            move_match = re.match(r'^>([a-z]+)$', line, re.IGNORECASE)
            if move_match:
                direction = move_match.group(1).lower()
                
                # Validate direction
                if not is_valid_direction(direction):
                    print(f"  ⚠️  Skipping invalid direction: '{direction}' (typo or non-ordinal)")
                    i += 1
                    continue
                
                # Normalize abbreviations
                last_direction = DIRECTION_ABBREV.get(direction, direction)
                i += 1
                continue
            
            # Check for room header [Room Title]
            header_match = re.match(r'^\[(.+?)\]$', line)
            if header_match:
                title = header_match.group(1)
                
                # Collect description (until "Obvious paths:" or next room/command)
                description_lines = []
                i += 1
                
                while i < len(lines):
                    desc_line = lines[i].strip()
                    
                    if not desc_line:
                        i += 1
                        continue
                    
                    # Stop at obvious paths
                    if desc_line.startswith('Obvious paths:') or desc_line.startswith('Obvious exits:'):
                        # Extract obvious directions
                        obvious_match = re.search(r'Obvious (?:paths|exits):\s*(.+)$', desc_line, re.IGNORECASE)
                        if obvious_match:
                            obvious_dirs = obvious_match.group(1)
                        i += 1
                        break
                    
                    # Stop at next room header or command
                    if desc_line.startswith('[') or desc_line.startswith('>'):
                        break
                    
                    # Skip "Also here:" lines (dynamic players/NPCs)
                    if desc_line.startswith('Also here:'):
                        i += 1
                        continue
                    
                    # Skip "You also see:" lines (dynamic items/NPCs/players)
                    # These are generated at runtime by the game engine
                    if desc_line.startswith('You also see'):
                        i += 1
                        continue
                    
                    description_lines.append(desc_line)
                    i += 1
                
                # Build full description
                description = ' '.join(description_lines)
                
                # Strip "You also see..." (runtime state, not permanent description)
                description = re.sub(r'\.\s+You also see\s+.+?\.?\s*$', '.', description, flags=re.IGNORECASE)
                description = description.strip()
                
                # Compute canonical ID
                canonical_id = self.compute_canonical_id(title, description)
                
                # Create or update room
                if canonical_id not in self.rooms:
                    features = self.extract_features(description)
                    
                    self.rooms[canonical_id] = Room(
                        title=title,
                        description=description,
                        canonical_id=canonical_id,
                        exits=[],
                        features=features,
                        items=[],
                        area_id=self.area_id
                    )
                
                # Track this room in sequence with the direction that brought us here
                self.room_sequence.append((canonical_id, last_direction))
                last_direction = None  # Reset for next movement
                
                continue
            
            i += 1
    
    def link_rooms(self) -> None:
        """Link rooms based on movement sequence"""
        
        print(f"Linking {len(self.room_sequence)} rooms...")
        
        for i in range(1, len(self.room_sequence)):
            prev_canonical_id, direction_used = self.room_sequence[i]
            current_canonical_id = self.room_sequence[i - 1][0]
            
            if not direction_used:
                continue
            
            # Skip self-referencing exits (room linking to itself)
            if prev_canonical_id == current_canonical_id:
                print(f"  ⚠️  Skipping self-loop: {self.rooms[current_canonical_id].title} --[{direction_used}]--> (self)")
                continue
            
            prev_room = self.rooms[prev_canonical_id]
            current_room = self.rooms[current_canonical_id]
            reverse_dir = REVERSE_DIRECTION.get(direction_used)
            
            # Validate direction before linking
            if not is_valid_direction(direction_used):
                print(f"  ⚠️  Skipping invalid exit: {current_room.title} --[{direction_used}]--> (invalid)")
                continue
            
            print(f"  {current_room.title} --[{direction_used}]--> {prev_room.title}")
            
            # Forward link: current_room -> prev_room (using direction_used)
            # Check if exit already exists
            exit_exists = any(e['direction'] == direction_used for e in current_room.exits)
            if not exit_exists:
                current_room.exits.append({
                    'direction': direction_used,
                    'roomId': prev_room.canonical_id
                })
            
            # Reverse link: prev_room -> current_room (using reverse direction)
            if reverse_dir and is_valid_direction(reverse_dir):
                exit_exists = any(e['direction'] == reverse_dir for e in prev_room.exits)
                if not exit_exists:
                    print(f"  {prev_room.title} --[{reverse_dir}]--> {current_room.title}")
                    prev_room.exits.append({
                        'direction': reverse_dir,
                        'roomId': current_room.canonical_id
                    })
    
    def export_json(self, output_path: str) -> None:
        """Export rooms to JSON for MongoDB import"""
        rooms_list = [room.to_dict() for room in self.rooms.values()]
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(rooms_list, f, indent=2, ensure_ascii=False)
        
        print(f"\nExported {len(rooms_list)} rooms to {output_path}")
        
        # Print summary
        print(f"\nRooms:")
        for room in self.rooms.values():
            print(f"  {room.canonical_id}: {room.title}")
            print(f"    Exits: {len(room.exits)}")
            for exit in room.exits:
                target = self.rooms.get(exit['roomId'])
                target_title = target.title if target else exit['roomId']
                print(f"      {exit['direction']} -> {target_title}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Parse and link GS3 rooms from movement log')
    parser.add_argument('log_file', help='Path to movement log file')
    parser.add_argument('area_id', help='Area ID (e.g., wl-gates)')
    parser.add_argument('-o', '--output', help='Output JSON file', default='rooms_linked.json')
    
    args = parser.parse_args()
    
    print(f"Parsing {args.log_file} for area '{args.area_id}'...")
    
    room_parser = RoomParser(args.area_id)
    room_parser.parse_log(args.log_file)
    
    print(f"\nFound {len(room_parser.rooms)} unique rooms")
    print(f"Movement sequence: {len(room_parser.room_sequence)} steps")
    
    room_parser.link_rooms()
    room_parser.export_json(args.output)
    
    print(f"\n✅ Done! Import with:")
    print(f"   node src/adapters/importers/import-rooms.js {args.output} {args.area_id}")

if __name__ == '__main__':
    main()

