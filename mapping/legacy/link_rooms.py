#!/usr/bin/env python3
# link_rooms.py
# Links parsed room JSONs by movement commands in a GemStone-style log.

import re
import json
import hashlib
import argparse

ORDINALS = [
    "north", "south", "east", "west",
    "northeast", "southeast", "northwest", "southwest",
    "up", "down", "out",
    # Abbreviations
    "n", "s", "e", "w", "ne", "se", "nw", "sw", "u", "d"
]

# Map abbreviations to full directions for reverse lookup
ABBREVIATIONS = {
    "n": "north", "s": "south", "e": "east", "w": "west",
    "ne": "northeast", "se": "southeast", "nw": "northwest", "sw": "southwest",
    "u": "up", "d": "down"
}

REVERSE = {
    "north": "south", "south": "north",
    "east": "west", "west": "east",
    "northeast": "southwest", "southwest": "northeast",
    "northwest": "southeast", "southeast": "northwest",
    "up": "down", "down": "up", "out": "out",
    # Abbreviations
    "n": "south", "s": "north", "e": "west", "w": "east",
    "ne": "southwest", "se": "northwest", "nw": "southeast", "sw": "northeast",
    "u": "down", "d": "up"
}

HEADER_RE = re.compile(r'^\[(?P<title>.+?)\]\s*$')

def link_rooms(log_path, rooms_json_path, output_path=None):
    with open(rooms_json_path, 'r', encoding='utf-8') as f:
        rooms = json.load(f)

    # Index by canonical_id (unique hash of title+desc)
    rooms_by_canonical = {r['canonical_id']: r for r in rooms}
    rooms_by_id = {r['id']: r for r in rooms}

    last_room_id = None  # ID of the previous room we finalized
    pending_move = None  # The movement command between last room and current room
    linked_pairs = set()
    
    # Track current room to build canonical_id
    current_title = None
    current_desc = []

    def compute_canonical_id(title, desc_lines):
        """Compute canonical_id for a room"""
        desc_text = ' '.join(desc_lines) if desc_lines else ''
        
        # Strip "You also see..." from description to match parser behavior
        desc_text = re.sub(r'\.\s+You also see\s+.+?\.?\s*$', '.', desc_text, flags=re.IGNORECASE)
        
        # Match the canonical_id generation from parser (sha1, title|desc)
        h = hashlib.sha1()
        h.update(title.strip().encode('utf-8'))
        dnorm = re.sub(r'\s+', ' ', desc_text.strip())
        h.update(b"|")
        h.update(dnorm.encode('utf-8'))
        canonical_hash = h.hexdigest()[:16]
        # Build slug from title
        slug = title.lower().replace(' ', '_').replace(',', '').replace('.', '').replace("'", '')
        return f"{slug}_{canonical_hash}"

    def finalize_and_link_room():
        """Finalize current room and link it to the previous room if there was a movement"""
        nonlocal last_room_id, pending_move, current_title, current_desc
        
        if not current_title:
            return None
        
        # Compute this room's canonical_id
        canonical_id = compute_canonical_id(current_title, current_desc)
        current_room = rooms_by_canonical.get(canonical_id)
        
        if not current_room:
            # Room not in our parsed data, skip
            current_title = None
            current_desc = []
            return None
        
        # If there was a previous room and a movement between them, link them
        if last_room_id and pending_move:
            prev_room = rooms_by_id.get(last_room_id)
            if prev_room:
                rev = REVERSE.get(pending_move)
                
                # Forward link: prev_room -[direction]-> current_room
                prev_room['exits'][pending_move] = current_room['id']
                
                # Backward link: current_room -[reverse]-> prev_room  
                if rev:
                    current_room['exits'][rev] = prev_room['id']
                
                linked_pairs.add((prev_room['id'], current_room['id'], pending_move))
                
            # Clear pending_move since we've used it for linking
            pending_move = None
        
        # This room becomes the "last room" for the next iteration
        last_room_id = current_room['id']
        
        # Reset current room state
        current_title = None
        current_desc = []
        
        return current_room['id']

    with open(log_path, 'r', encoding='utf-8', errors='ignore') as f:
        for raw in f:
            line = raw.strip()
            
            if not line:
                continue

            # Detect new room header - finalize previous room and link
            h = HEADER_RE.match(line)
            if h:
                # Finalize and link the previous room if we have one
                if current_title:
                    finalize_and_link_room()
                
                # Start collecting the new room
                current_title = h.group('title')
                current_desc = []
                continue

            # Detect movement command
            m = re.match(r'^>\s*([a-z]+)', line.lower())
            if m:
                direction = m.group(1)
                if direction in ORDINALS:
                    # Normalize abbreviations to full direction names
                    direction = ABBREVIATIONS.get(direction, direction)
                    pending_move = direction
                    continue
            
            # Collect description lines (skip "Also here:" and "Obvious" lines)
            if current_title:
                if line.startswith('Also here:') or line.startswith('Obvious'):
                    continue
                if not line.startswith('>'):
                    current_desc.append(line)
    
    # Finalize the last room in the file
    if current_title:
        finalize_and_link_room()

    out_path = output_path or rooms_json_path.replace(".json", "_linked.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(rooms, f, indent=2, ensure_ascii=False)
    print(f"Linked {len(linked_pairs)} room transitions → {out_path}")

def main():
    ap = argparse.ArgumentParser(description="Link room JSONs by movement commands in log.")
    ap.add_argument("log", help="Path to the original log file (txt)")
    ap.add_argument("rooms_json", help="Path to the parsed rooms JSON")
    ap.add_argument("-o", "--output", help="Output path (default: *_linked.json)")
    args = ap.parse_args()
    link_rooms(args.log, args.rooms_json, args.output)

if __name__ == "__main__":
    main()
