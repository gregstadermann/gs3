#!/usr/bin/env python3
# gs3_room_parser_v4.py
"""
GS3 Room Parser – v4 (confirmation-based discovery, unified exits)

Key behaviors:
- Loads VALID_AREAS dynamically from ../src/constants/areas.json (relative to this file).
- Requires an 'area' argument; validates against VALID_AREAS keys.
- Generates both 'id' (incremental, human-friendly) and 'canonical_id' (hash of title+desc).
- Parses rooms from GS3-style logs. 'Obvious paths:' create ordinal exits with value "unknown".
- "You also see ..." items are *ignored by default* and stored only as unconfirmed candidates.
- An item is promoted to a *confirmed static item* (and a hidden exit is created in 'exits')
  only if the player uses '>go <target>' or '>enter <target>' while still in that room.
- Partial shorthand is supported: the <target> must be a prefix (>=3 letters) of a candidate.
  e.g., '>go walk' confirms "walkway"; '>go clear' confirms "clearing".
- Hidden exits live directly in the unified 'exits' dict as:  "exits": { "<name>": {"hidden": true} }
  (There is no separate 'hidden_exits' structure.)
- Optional '--debug' flag prints trace lines like:
    [debug L123] Confirmed hidden exit 'walkway' in room Outside the Inn
    [debug L127] Unmatched GO target 'gate' — recorded as hidden exit only

Silent by default (no debug prints).

Usage:
  python3 gs3_room_parser_v4.py "Session1.txt" "wl-town" --pretty
  python3 gs3_room_parser_v4.py "Session1.txt" "wl-town" --pretty --debug
"""
import re
import json
import argparse
import hashlib
from collections import OrderedDict
from typing import List, Dict, Any, Optional, Set
from pathlib import Path

# ---------------------------------------------
# Utility: Load VALID_AREAS from JS file
# ---------------------------------------------
def load_valid_areas(json_path: Path) -> Dict[str, str]:
    """Load VALID_AREAS from areas.json"""
    if not json_path.exists():
        raise FileNotFoundError(f"Cannot find areas.json at {json_path}")
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# ---------------------------------------------
# Canonical directions
# ---------------------------------------------
ORDINALS = [
    "north", "south", "east", "west",
    "northeast", "southeast", "northwest", "southwest",
    "up", "down", "out"
]

HEADER_RE = re.compile(r'^\[(?P<title>.+?)\]\s*$')
OBVIOUS_RE = re.compile(r'^\s*Obvious (?:paths|exits):\s*(?P<list>.+?)\s*$')
YOU_ALSO_SEE_RE = re.compile(r'^\s*You also see:\s*(?P<items>.+?)\s*$')
YOU_ALSO_SEE_INLINE_RE = re.compile(r'^\s*You also see\b(?P<rest>.*)$')
ALSO_HERE_RE = re.compile(r'^\s*Also here:\s*(?P<names>.+?)\s*$')
ALSO_HERE_INLINE_RE = re.compile(r'\s+Also here:\s+.+?$')
PROMPT_CMD_RE = re.compile(r'^\s*>')
GO_ENTER_RE = re.compile(r'^\s*>(?:\s*)?(?:go|enter)\s+([A-Za-z][\w\'-]*)', re.IGNORECASE)

NOISE_PREFIXES = (
    "You hear the Help thoughts of",
    "Roundtime:", "Cast Roundtime",
    "Please rephrase that command.",
    "You are now in a",
    "You can't go there.",
    "Where are you trying to go?",
    "You are wearing",
    "You have",
)

# Patterns to detect inventory/equipment blocks
INVENTORY_PATTERNS = [
    re.compile(r'You are wearing\b', re.IGNORECASE),
    re.compile(r'You have\b', re.IGNORECASE),
    re.compile(r'\b(?:a|an|some)\s+\w+\s+(?:vest|cloak|boots|gloves|satchel|backpack|tunic|trousers|bodice|tabard|quiver|bandana|buckler|shield|helm|hat)\b', re.IGNORECASE),
]

# Candidates that can plausibly be GO targets (used to extract from "You also see")
EXITABLE_NOUNS = [
    "inn", "gate", "arch", "tower", "walkway", "path", "trail", "clearing",
    "door", "tunnel", "ladder", "stair", "staircase", "alcove", "bridge",
    "portal", "passage", "pass", "hole", "gap", "archway", "road", "street",
    "hall", "hallway", "ledge"
]

def slugify(text: str) -> str:
    s = re.sub(r"[’']", "", text.lower())
    s = re.sub(r'[^a-z0-9]+', '_', s).strip('_')
    s = re.sub(r'_+', '_', s)
    return s[:80] or "room"

def hash_room_key(title: str, description: str) -> str:
    h = hashlib.sha1()
    h.update(title.strip().encode('utf-8'))
    dnorm = re.sub(r'\s+', ' ', description.strip())
    h.update(b"|")
    h.update(dnorm.encode('utf-8'))
    return h.hexdigest()[:16]

def split_list_like(s: str) -> List[str]:
    s = s.strip().rstrip('.')
    s = re.sub(r'\s+(?:and|&)\s+', ', ', s)
    parts = [p.strip() for p in s.split(',') if p.strip()]
    return parts

def normalize_token(t: str) -> str:
    t = t.lower().strip()
    t = re.sub(r'^(?:a|an|the)\s+', '', t)
    t = re.sub(r'[^a-z0-9\s-]', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def key_from_phrase(phrase: str) -> Optional[str]:
    """Return a likely GO target keyword from a noun phrase."""
    p = normalize_token(phrase)
    # Prefer known exit nouns inside the phrase
    for noun in sorted(EXITABLE_NOUNS, key=len, reverse=True):
        if re.search(rf'\b{re.escape(noun)}\b', p):
            return noun
    # Fallback: last word
    words = p.split()
    if words:
        return words[-1]
    return None

def extract_you_also_see_candidates(line: str) -> List[str]:
    # Pull text after "You also see"
    m = YOU_ALSO_SEE_RE.match(line)
    text = m.group('items') if m else None
    if not text:
        m2 = YOU_ALSO_SEE_INLINE_RE.match(line)
        text = m2.group('rest') if m2 else None
    if not text:
        return []
    fragments = split_list_like(text)
    candidates: List[str] = []
    for frag in fragments:
        key = key_from_phrase(frag)
        if key and key not in candidates:
            candidates.append(key)
    return candidates

# ---------------------------------------------
# Main room builder class
# ---------------------------------------------
seen_titles: Dict[str, int] = {}

def generate_room_ids(title: str, description: str):
    slug = slugify(title)
    count = seen_titles.get(slug, 0)
    seen_titles[slug] = count + 1
    incremental = f"{slug}" if count == 0 else f"{slug}_{count:02d}"
    canonical = f"{slug}_{hash_room_key(title, description)}"
    return incremental, canonical

class RoomBuilder:
    def __init__(self, title: str, start_line: int, source: str, area: str, debug: bool = False):
        self.title = title
        self.description_lines: List[str] = []
        self.exits: OrderedDict[str, Any] = OrderedDict()
        self.static_items: List[str] = []
        self._unconfirmed: Set[str] = set()
        self.features: List[str] = []
        self.source = source
        self.start_line = start_line
        self.area = area
        self._saw_obvious = False
        self.debug = debug

    def log(self, msg: str):
        if self.debug:
            print(msg)

    def add_description_line(self, line: str, lineno: int):
        if not line:
            return
        if any(line.startswith(prefix) for prefix in NOISE_PREFIXES):
            return
        
        # Check for inventory/equipment lines
        for pattern in INVENTORY_PATTERNS:
            if pattern.search(line):
                if self.debug:
                    self.log(f"[debug L{lineno}] Skipping inventory/equipment line")
                return
        
        # Check if line starts with "You also see"
        if YOU_ALSO_SEE_INLINE_RE.match(line) or YOU_ALSO_SEE_RE.match(line):
            cands = extract_you_also_see_candidates(line)
            for c in cands:
                self._unconfirmed.add(c)
            if self.debug and cands:
                self.log(f"[debug L{lineno}] Unconfirmed candidates seen: {', '.join(cands)}")
            return
        
        # Check if line starts with "Also here:" (skip player/NPC names)
        if ALSO_HERE_RE.match(line):
            if self.debug:
                self.log(f"[debug L{lineno}] Skipping 'Also here:' line")
            return
        
        if PROMPT_CMD_RE.match(line):
            return
        
        # Check for inline "You also see" at the end of a description line
        # Strip it and extract candidates
        you_also_match = re.search(r'\.\s+You also see\s+(.+?)\.?\s*$', line, re.IGNORECASE)
        if you_also_match:
            # Strip the "You also see" part from the line
            line = line[:you_also_match.start()] + '.'
            # Extract candidates from the "You also see" part
            see_text = you_also_match.group(1)
            fragments = split_list_like(see_text)
            for frag in fragments:
                key = key_from_phrase(frag)
                if key:
                    self._unconfirmed.add(key)
            if self.debug and fragments:
                self.log(f"[debug L{lineno}] Inline 'You also see' stripped, candidates: {', '.join(fragments)}")
        
        # Check for inline "Also here:" at the end of a description line and strip it
        also_here_match = ALSO_HERE_INLINE_RE.search(line)
        if also_here_match:
            line = line[:also_here_match.start()]
            if self.debug:
                self.log(f"[debug L{lineno}] Stripped inline 'Also here:' from description")
        
        self.description_lines.append(line.strip())
        # Feature harvesting (optional)
        for kw in ("sign", "tower", "path", "arch", "trail", "clearing", "walkway", "gate", "ledge", "pond", "pillar"):
            if re.search(rf'\b{kw}\b', line, flags=re.IGNORECASE):
                if kw not in self.features:
                    self.features.append(kw)

    def set_obvious_exits(self, line: str, lineno: int):
        self._saw_obvious = True
        m = OBVIOUS_RE.match(line)
        if not m:
            return
        raw = m.group('list')
        tokens = split_list_like(raw)
        for tok in tokens:
            t = tok.strip().lower().rstrip('.')
            if t in ORDINALS and t not in self.exits:
                self.exits[t] = "unknown"
        if self.debug and tokens:
            self.log(f"[debug L{lineno}] Obvious exits: {', '.join(tokens)}")

    def _confirm_target(self, target: str, lineno: int) -> str:
        """Return the confirmed key (candidate match or normalized target)."""
        t = normalize_token(target)
        t = re.sub(r'\s+', '', t)  # compact for comparison
        # Only accept partials with >=3 letters
        if len(t) >= 3:
            # Find matching candidates by startswith
            matches = [c for c in self._unconfirmed if c.startswith(t)]
            if matches:
                # Prefer exact, else shortest candidate
                matches.sort(key=lambda x: (0 if x == t else 1, len(x)))
                confirmed = matches[0]
                # Promote to static item
                if confirmed not in self.static_items:
                    self.static_items.append(confirmed)
                if self.debug:
                    self.log(f"[debug L{lineno}] Confirmed hidden exit '{confirmed}' in room {self.title}")
                return confirmed
        # No candidate match; use normalized target (letters only)
        raw = re.sub(r'[^a-z0-9]+', '', normalize_token(target))
        if self.debug:
            self.log(f"[debug L{lineno}] Unmatched GO target '{raw}' — recorded as hidden exit only in room {self.title}")
        return raw

    def add_go_enter_command(self, line: str, lineno: int):
        m = GO_ENTER_RE.match(line)
        if not m:
            return
        target = m.group(1)
        key = self._confirm_target(target, lineno)
        # Create/ensure hidden exit in unified exits
        if key and key not in self.exits:
            self.exits[key] = {"hidden": True}
        elif key and isinstance(self.exits.get(key), str):
            # If somehow set to "unknown", upgrade to hidden exit meta
            self.exits[key] = {"hidden": True}

    def build(self) -> Dict[str, Any]:
        desc = ' '.join(self.description_lines).strip()
        incremental, canonical = generate_room_ids(self.title, desc)
        return {
            "id": incremental,
            "canonical_id": canonical,
            "title": self.title,
            "area": self.area,
            "description": desc,
            "exits": self.exits,
            "features": self.features,
            "static_items": self.static_items,
            "metadata": {
                "source": self.source,
                "start_line": self.start_line,
                "saw_obvious": self._saw_obvious
            }
        }

# ---------------------------------------------
# Parser core
# ---------------------------------------------
def parse_log_file(path: str, area: str, debug: bool) -> List[Dict[str, Any]]:
    rooms: List[Dict[str, Any]] = []
    current: Optional[RoomBuilder] = None
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for lineno, raw in enumerate(f, start=1):
            line = raw.rstrip('\n')
            h = HEADER_RE.match(line.strip())
            if h:
                if current:
                    rooms.append(current.build())
                current = RoomBuilder(title=h.group('title'), start_line=lineno, source=path, area=area, debug=debug)
                continue
            if current is None:
                continue
            if OBVIOUS_RE.match(line):
                current.set_obvious_exits(line, lineno)
                continue
            if PROMPT_CMD_RE.match(line):
                current.add_go_enter_command(line, lineno)
                continue
            if YOU_ALSO_SEE_INLINE_RE.match(line) or YOU_ALSO_SEE_RE.match(line):
                current.add_description_line(line, lineno)  # will capture unconfirmed
                continue
            if line.strip() and not any(line.startswith(p) for p in NOISE_PREFIXES):
                current.add_description_line(line, lineno)
        if current:
            rooms.append(current.build())
    return rooms

# ---------------------------------------------
# CLI entry
# ---------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="Parse GS3 logs into room JSON with confirmation-based hidden exits.")
    ap.add_argument("input", help="Path to the raw log file (txt).")
    ap.add_argument("area", help="Area key (must match VALID_AREAS key, e.g. wl-town).")
    ap.add_argument("-o", "--output", help="Output JSON path (default: <input>.rooms.json)")
    ap.add_argument("--pretty", action="store_true", help="Pretty-print JSON output.")
    ap.add_argument("--debug", action="store_true", help="Print debug tracing during parse.")
    args = ap.parse_args()

    # Load areas from ../src/constants/areas.json
    json_path = Path(__file__).resolve().parent.parent / "src" / "constants" / "areas.json"
    VALID_AREAS = load_valid_areas(json_path)

    if args.area not in VALID_AREAS:
        print(f"Error: '{args.area}' is not a valid area ID.\nValid options: {', '.join(sorted(VALID_AREAS.keys()))}")
        exit(1)

    rooms = parse_log_file(args.input, args.area, args.debug)
    out_path = args.output or (args.input.rsplit('.', 1)[0] + ".rooms.json")

    if args.pretty:
        text = json.dumps(rooms, indent=2, ensure_ascii=False)
    else:
        text = json.dumps(rooms, separators=(',', ':'), ensure_ascii=False)

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Parsed {len(rooms)} rooms in area '{args.area}' → {out_path}")

if __name__ == "__main__":
    main()
