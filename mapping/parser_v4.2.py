#!/usr/bin/env python3
# parser_v4_2.py
# Resonance Forge / GS3 Clone Log Parser
# v4.2 — apostrophe-safe refer() + normalized room ID generation

import re
import hashlib
from typing import Optional, Dict, Any

refer_table: Dict[str, Any] = {}

def _normalize_key(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r"[‘’`']", "", s)
    s = s.replace('"', "").strip().lower()
    s = re.sub(r"\s+", " ", s)
    return s

def compute_room_id(title: str, description: str) -> str:
    base = f"{_normalize_key(title)}::{description.strip().lower()}"
    base = re.sub(r"\s+", " ", base)
    return hashlib.md5(base.encode("utf-8")).hexdigest()[:12]

def refer(name: str):
    key = _normalize_key(name)
    return refer_table.get(key)

def register_room(room: Any):
    key = _normalize_key(getattr(room, "title", ""))
    refer_table[key] = room
    return key

class ParsedRoom:
    def __init__(self, title: str, description: str, line_no: int, source_log: str):
        self.title = title.strip()
        self.description = description.strip()
        self.id = compute_room_id(self.title, self.description)
        self.source_log = source_log
        self.first_seen_line = line_no
        self.last_seen_line = line_no
        self.exits = {}
        self.hidden_exits = []
        self.raw_exits_text = ""
        self.seen_items = []
        self.parser_flags = {
            "dynamic_content_removed": True,
            "incomplete": False,
            "multi_instance": False,
        }

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "exits": self.exits,
            "hidden_exits": self.hidden_exits,
            "raw_exits_text": self.raw_exits_text,
            "seen_items": self.seen_items,
            "parser_flags": self.parser_flags,
            "source_log": self.source_log,
            "first_seen_line": self.first_seen_line,
            "last_seen_line": self.last_seen_line,
        }

def parse_room_from_lines(lines: list[str], line_no: int, log_name: str) -> Optional[ParsedRoom]:
    if not lines:
        return None
    title = lines[0].strip()
    desc = " ".join(l.strip() for l in lines[1:] if not l.startswith("Obvious paths:"))
    room = ParsedRoom(title, desc, line_no, log_name)
    for l in lines:
        if l.lower().startswith("obvious paths:"):
            room.raw_exits_text = l.strip()
            exits = [e.strip("., ") for e in l.split(":")[1].split(",")]
            for ex in exits:
                if ex:
                    room.exits[ex] = None
    register_room(room)
    return room

if __name__ == "__main__":
    sample_lines = [
        "The Giant's Causeway",
        "You stand among basalt columns rising from the sea.",
        "Obvious paths: north, south, west."
    ]
    room = parse_room_from_lines(sample_lines, 42, "example_log.txt")
    print("Room parsed:")
    print(room.to_dict())
    print("\nRefer test:")
    print("Refer('The Giant's Causeway') ->", refer("The Giant's Causeway"))
    print("Refer('The Giants Causeway') ->", refer("The Giants Causeway"))
    print("Refer('THE GIANT’S CAUSEWAY') ->", refer("THE GIANT’S CAUSEWAY"))
