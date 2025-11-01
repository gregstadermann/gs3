#!/usr/bin/env python3
# gs3_room_parser_v2.py
# Hybrid ID room parser for GemStone III-style logs.

import re
import json
import argparse
import hashlib
from collections import OrderedDict
from typing import List, Dict, Any, Optional

ORDINALS = [
    "north", "south", "east", "west",
    "northeast", "southeast", "northwest", "southwest",
    "up", "down", "out"
]

HEADER_RE = re.compile(r'^\[(?P<title>.+?)\]\s*$')
OBVIOUS_RE = re.compile(r'^\s*Obvious (?:paths|exits):\s*(?P<list>.+?)\s*$')
YOU_ALSO_SEE_RE = re.compile(r'^\s*You also see:\s*(?P<items>.+?)\s*$')
YOU_ALSO_SEE_INLINE_RE = re.compile(r'^\s*You also see\b(?P<rest>.*)$')
PROMPT_CMD_RE = re.compile(r'^\s*>')
GO_ENTER_RE = re.compile(r'^\s*>(?:\s*)?(?:go|enter)\s+([A-Za-z][\w\'-]*)', re.IGNORECASE)

NOISE_PREFIXES = (
    "You hear the Help thoughts of",
    "Roundtime:", "Cast Roundtime",
    "Please rephrase that command.",
    "You are now in a",
    "You can't go there.",
    "Where are you trying to go?",
)

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

def normalize_exit_token(tok: str) -> Optional[str]:
    t = tok.strip().lower().rstrip('.')
    if t in ORDINALS:
        return t
    return None

def extract_static_items(line: str) -> List[str]:
    m1 = YOU_ALSO_SEE_RE.match(line)
    text = None
    if m1:
        text = m1.group('items')
    else:
        m2 = YOU_ALSO_SEE_INLINE_RE.match(line)
        if m2:
            text = m2.group('rest')
    if not text:
        return []
    items = split_list_like(text)
    cleaned = []
    for it in items:
        it = it.strip().strip('.')
        it = re.sub(r'^(?:a|an|the)\s+', '', it, flags=re.IGNORECASE)
        if it:
            cleaned.append(it)
    return cleaned

seen_titles = {}

def generate_room_ids(title: str, description: str):
    slug = slugify(title)
    count = seen_titles.get(slug, 0)
    seen_titles[slug] = count + 1
    incremental = f"{slug}" if count == 0 else f"{slug}_{count:02d}"
    canonical = f"{slug}_{hash_room_key(title, description)}"
    return incremental, canonical

class RoomBuilder:
    def __init__(self, title: str, start_line: int, source: str):
        self.title = title
        self.description_lines: List[str] = []
        self.exits: OrderedDict[str, Any] = OrderedDict()
        self.hidden_exits: Dict[str, Dict[str, Any]] = {}
        self.static_items: List[str] = []
        self.features: List[str] = []
        self.source = source
        self.start_line = start_line
        self._saw_obvious = False

    def add_description_line(self, line: str):
        if not line:
            return
        if any(line.startswith(prefix) for prefix in NOISE_PREFIXES):
            return
        if YOU_ALSO_SEE_INLINE_RE.match(line):
            self.static_items.extend(extract_static_items(line))
            return
        if PROMPT_CMD_RE.match(line):
            return
        self.description_lines.append(line.strip())
        for kw in ("sign", "tower", "path", "arch", "trail", "clearing", "walkway", "gate", "ledge", "pond", "pillar"):
            if re.search(rf'\b{kw}\b', line, flags=re.IGNORECASE):
                if kw not in self.features:
                    self.features.append(kw)

    def set_obvious_exits(self, line: str):
        self._saw_obvious = True
        m = OBVIOUS_RE.match(line)
        if not m:
            return
        raw = m.group('list')
        tokens = split_list_like(raw)
        for tok in tokens:
            norm = normalize_exit_token(tok)
            if norm and norm not in self.exits:
                self.exits[norm] = "unknown"

    def add_hidden_exit_from_command(self, line: str):
        m = GO_ENTER_RE.match(line)
        if not m:
            return
        name = m.group(1).lower()
        name = re.sub(r'[^a-z0-9_\'-]+', '', name)
        if not name:
            return
        self.hidden_exits[name] = {"hidden": True}

    def build(self) -> Dict[str, Any]:
        desc = ' '.join(self.description_lines).strip()
        seen = set()
        statics = []
        for it in self.static_items:
            if it not in seen:
                seen.add(it)
                statics.append(it)
        exits: Dict[str, Any] = OrderedDict(self.exits)
        for name, meta in self.hidden_exits.items():
            if name not in exits:
                exits[name] = meta
            else:
                if isinstance(exits[name], str):
                    exits[f"{name}_hidden"] = meta
        incremental, canonical = generate_room_ids(self.title, desc)
        return {
            "id": incremental,
            "canonical_id": canonical,
            "title": self.title,
            "description": desc,
            "exits": exits,
            "features": self.features,
            "static_items": statics,
            "metadata": {
                "source": self.source,
                "start_line": self.start_line,
                "saw_obvious": self._saw_obvious
            }
        }

def parse_log_file(path: str) -> List[Dict[str, Any]]:
    rooms: List[Dict[str, Any]] = []
    current: Optional[RoomBuilder] = None
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        for lineno, raw in enumerate(f, start=1):
            line = raw.rstrip('\n')
            h = HEADER_RE.match(line.strip())
            if h:
                if current:
                    rooms.append(current.build())
                current = RoomBuilder(title=h.group('title'), start_line=lineno, source=path)
                continue
            if current is None:
                continue
            if OBVIOUS_RE.match(line):
                current.set_obvious_exits(line)
                continue
            if PROMPT_CMD_RE.match(line):
                current.add_hidden_exit_from_command(line)
                continue
            if YOU_ALSO_SEE_INLINE_RE.match(line) or YOU_ALSO_SEE_RE.match(line):
                current.static_items.extend(extract_static_items(line))
                continue
            if line.strip() and not any(line.startswith(p) for p in NOISE_PREFIXES):
                current.add_description_line(line)
        if current:
            rooms.append(current.build())
    return rooms

def main():
    ap = argparse.ArgumentParser(description="Parse GS3-style logs into hybrid-ID room JSON.")
    ap.add_argument("input", help="Path to the raw log file (txt).")
    ap.add_argument("-o", "--output", help="Output JSON path (default: <input>.rooms.json)")
    ap.add_argument("--pretty", action="store_true", help="Pretty-print JSON.")
    args = ap.parse_args()
    rooms = parse_log_file(args.input)
    out_path = args.output or (args.input.rsplit('.', 1)[0] + ".rooms.json")
    with open(out_path, "w", encoding="utf-8") as f:
        if args.pretty:
            json.dump(rooms, f, indent=2, ensure_ascii=False)
        else:
            json.dump(rooms, f, separators=(',', ':'), ensure_ascii=False)
    print(f"Wrote {len(rooms)} rooms → {out_path}")

if __name__ == "__main__":
    main()
