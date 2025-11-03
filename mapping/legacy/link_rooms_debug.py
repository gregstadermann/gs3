#!/usr/bin/env python3
# link_rooms_debug.py - Debug version with print statements

import re
import json
import hashlib

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
}

HEADER_RE = re.compile(r'^\[(?P<title>.+?)\]\s*$')

with open('small-wl-gates-log.rooms.json', 'r') as f:
    rooms = json.load(f)

rooms_by_canonical = {r['canonical_id']: r for r in rooms}

last_canonical_id = None
last_move = None
linked_pairs = set()

current_title = None
current_desc = []

def finalize_room():
    global last_canonical_id, last_move, current_title, current_desc
    
    if not current_title:
        return None
        
    desc_text = ' '.join(current_desc) if current_desc else ''
    
    # Strip "You also see..." from description to match parser behavior
    desc_text = re.sub(r'\.\s+You also see\s+.+?\.?\s*$', '.', desc_text, flags=re.IGNORECASE)
    
    # Match the canonical_id generation from parser (sha1, title|desc)
    h = hashlib.sha1()
    h.update(current_title.strip().encode('utf-8'))
    dnorm = re.sub(r'\s+', ' ', desc_text.strip())
    h.update(b"|")
    h.update(dnorm.encode('utf-8'))
    canonical_hash = h.hexdigest()[:16]
    slug = current_title.lower().replace(' ', '_').replace(',', '').replace('.', '').replace("'", '')
    canonical_id = f"{slug}_{canonical_hash}"
    
    current_room = rooms_by_canonical.get(canonical_id)
    
    print(f'[finalize_room] title="{current_title}"')
    print(f'  canonical_id: {canonical_id}')
    print(f'  found in dict: {current_room is not None}')
    
    if current_room and last_canonical_id and last_move:
        cur_id = current_room['id']
        prev = rooms_by_canonical.get(last_canonical_id)
        print(f'  LINKING: prev_canonical={last_canonical_id}')
        print(f'  last_move: {last_move}')
        if prev:
            rev = REVERSE.get(last_move)
            print(f'  reverse direction: {rev}')
            print(f'  Setting prev[{prev["id"]}].exits[{last_move}] = {cur_id}')
            print(f'  Setting curr[{cur_id}].exits[{rev}] = {prev["id"]}')

            # forward link
            prev['exits'][last_move] = cur_id
            # backward link
            if rev:
                current_room['exits'][rev] = prev['id']

            linked_pairs.add((prev['id'], cur_id, last_move))

    # Reset room state (but keep last_move for linking next room)
    current_title = None
    current_desc = []
    
    return canonical_id if current_room else None

with open('small-wl-gates-log.txt', 'r', encoding='utf-8', errors='ignore') as f:
    for line_no, raw in enumerate(f, 1):
        line = raw.strip()
        
        if not line:
            continue

        # Detect new room header
        h = HEADER_RE.match(line)
        if h:
            # Finalize the previous room if we have one
            if current_title:
                canonical = finalize_room()
                if canonical:
                    last_canonical_id = canonical
            
            # Start the new room
            current_title = h.group('title')
            current_desc = []
            print(f'\n[Line {line_no}] NEW ROOM: "{current_title}"')
            continue

        # Detect movement command
        m = re.match(r'^>\s*([a-z]+)', line.lower())
        if m:
            direction = m.group(1)
            if direction in ORDINALS:
                # Normalize abbreviations to full direction names
                normalized = ABBREVIATIONS.get(direction, direction)
                print(f'[Line {line_no}] MOVEMENT: >{direction} -> normalized to: {normalized}')
                last_move = normalized
                continue
        
        # Collect description lines
        if current_title:
            if line.startswith('Also here:') or line.startswith('Obvious'):
                continue
            if not line.startswith('>'):
                current_desc.append(line)

# Finalize last room
if current_title:
    finalize_room()

print(f'\n\nLinked {len(linked_pairs)} room transitions')

