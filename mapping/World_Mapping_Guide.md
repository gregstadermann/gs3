# 🧭 Resonance Forge Room Mapping Guide

This guide explains how to build a **complete, connected world map** from GemStone III-style logs using three Python scripts:

1. **`gs3_room_parser_v2.py`** – parses raw log files into structured room JSON.
2. **`link_rooms.py`** – analyzes movement commands (`>north`, `>east`, etc.) and links rooms bidirectionally.
3. **`merge_worlds.py`** – merges multiple linked JSONs from different sessions into one master world file.

---

## ⚙️ Requirements

- Python 3.8 or higher
- Your GemStone-style text logs (e.g., `Gemstone Log 10-30-2025 (1).txt`)

To verify Python is installed:
```bash
python3 --version
```

If it prints a version (e.g., `Python 3.10.4`), you’re good to go.

---

## 🧩 Step 1 — Parse Logs into Room JSON

**Script:** `gs3_room_parser_v2.py`

### Command:
```bash
python3 gs3_room_parser_v2.py "Gemstone Log 10-30-2025 (1).txt" --pretty
```

### Output:
- Creates: `Gemstone Log 10-30-2025 (1).rooms.json`
- Extracts rooms, descriptions, exits, and static items.
- Adds two IDs per room:
  - `id`: human-readable (incremental)
  - `canonical_id`: stable hash (used for merges)

---

## 🔗 Step 2 — Link Rooms by Movement

**Script:** `link_rooms.py`

### Command:
```bash
python3 link_rooms.py "Gemstone Log 10-30-2025 (1).txt" "Gemstone Log 10-30-2025 (1).rooms.json"
```

### Output:
- Creates: `Gemstone Log 10-30-2025 (1).rooms_linked.json`
- Fills in bidirectional exits using movement commands found in the log.

---

## 🌍 Step 3 — Merge Multiple Sessions into One World

**Script:** `merge_worlds.py`

### Command:
```bash
python3 merge_worlds.py world_master.json "Session2.rooms_linked.json"
```

### Output:
- Creates: `world_master_merged.json`
- Merges new rooms and fills missing exits from previous sessions.
- Deduplicates rooms using `canonical_id`.

---

## ✅ Example Workflow Summary

```bash
# 1. Parse new log
python3 gs3_room_parser_v2.py "Session1.txt" --pretty

# 2. Link rooms from movement commands
python3 link_rooms.py "Session1.txt" "Session1.rooms.json"

# 3. Merge into master world map
python3 merge_worlds.py world_master.json "Session1.rooms_linked.json"
```

After each new play session, repeat these three steps — your master file (`world_master.json`) will evolve into a complete world map.
