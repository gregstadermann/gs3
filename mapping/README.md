# GS3 Mapping Workspace

This directory contains tools and data for world-building and room mapping in the GS3 project.

## Purpose

The mapping workspace is where **content creators and designers** work to:
- Convert raw gameplay logs into structured room data
- Parse and link rooms with canonical IDs
- Generate JSON files ready for database import
- Document the world geography

**This is NOT runtime application code** - it's a content creation pipeline.

---

## Directory Structure

```
mapping/
├── room_importer.py          # NEW: All-in-one parser/linker tool
├── World_Mapping_Guide.md    # Documentation on mapping conventions
├── README.md                 # This file
│
├── logs/                     # Raw movement logs (input)
│   ├── small-wl-gates-log.txt
│   ├── wl-gates.txt
│   └── wl-town-lots-of-rooms.Txt
│
├── output/                   # Generated JSON files (ready for import)
│   ├── small-wl-gates-FINAL.json
│   ├── wl-gates.rooms_linked.json
│   └── wl-town-lots-of-rooms.rooms_linked.json
│
└── legacy/                   # Old/deprecated tools
    ├── gs3_room_parser_v4.py
    ├── link_rooms.py
    └── ...
```

---

## Quick Start

### Step 1: Capture a Movement Log

Play the game and record your movements:

```
[Wehnimer's, Outside Gate]
Citizens, merchants and assorted dregs...
Obvious paths: north, east, southwest, northwest
>sw
[Wehnimer's, Exterior]
You are standing at the northwest corner...
Obvious paths: northeast, south, west
>s
...
```

Save this as `logs/my-area.txt`

### Step 2: Parse & Link Rooms

```bash
./room_importer.py logs/my-area.txt wl-myarea -o output/my-area.json
```

**What this does**:
- Parses room titles, descriptions, exits
- Generates canonical IDs (hash of title + description)
- Creates bidirectional exit links
- Extracts features (gates, paths, etc.)
- Outputs MongoDB-ready JSON

### Step 3: Import to Database

```bash
cd ..
# First import (replace mode)
node src/adapters/importers/import-rooms.js mapping/output/my-area.json wl-myarea

# OR for incremental mapping (merge mode)
node src/adapters/importers/import-rooms.js mapping/output/my-area.json wl-myarea --merge
```

**What this does**:
- Validates rooms against schema
- Uses repository pattern for clean DB access
- Creates indexes
- Stores in MongoDB

**Modes**:
- **Default**: Replaces existing rooms completely
- **--merge**: Adds new exits to existing rooms (incremental mapping)

---

## The New System: `room_importer.py`

### Why a New System?

The old 2-step process (parse → link) had issues:
- ❌ Exits could get overwritten
- ❌ Bidirectional linking was buggy
- ❌ Two separate scripts to maintain

The new system:
- ✅ Parse and link in one pass
- ✅ Correct bidirectional linking
- ✅ Uses canonical IDs to prevent ambiguity
- ✅ Clean, understandable code
- ✅ One tool does everything

### How It Works

```python
# 1. Parse log file
room_parser = RoomParser('wl-gates')
room_parser.parse_log('logs/small-wl-gates-log.txt')

# 2. Link rooms (bidirectional)
room_parser.link_rooms()

# 3. Export to JSON
room_parser.export_json('output/rooms.json')
```

**Key Features**:

1. **Canonical IDs**: Hash of `title + description`
   - Same room always gets same ID
   - Prevents duplicate rooms
   - Example: `wehnimer_s_outside_gate_4e0949b5e6b69678`

2. **Bidirectional Linking**: 
   - Movement `>sw` creates:
     - Forward: `southwest → target`
     - Reverse: `northeast → origin`

3. **Feature Extraction**:
   - Automatically finds: gates, paths, towers, walls, etc.
   - Stored in `features` array

---

## Room Data Format

### Input (Movement Log)
```
[Wehnimer's, Outside Gate]
Citizens, merchants and assorted dregs...
Obvious paths: north, east, southwest, northwest
>sw
[Wehnimer's, Exterior]
...
```

### Output (JSON)
```json
{
  "id": "wehnimer_s_outside_gate_4e0949b5e6b69678",
  "areaId": "wl-gates",
  "title": "Wehnimer's, Outside Gate",
  "description": "Citizens, merchants...",
  "canonical_id": "wehnimer_s_outside_gate_4e0949b5e6b69678",
  "exits": [
    {"direction": "southwest", "roomId": "wehnimer_s_exterior_df3fc3961704110e"}
  ],
  "features": ["gate", "path", "wall", "sign"],
  "items": [],
  "metadata": {
    "originalFormat": "movement-log"
  }
}
```

---

## Canonical IDs Explained

**Purpose**: Ensure room identity remains stable across imports

**How it works**:
```python
canonical_id = sha1(title + "|" + cleaned_description)[:16]
slug = slugify(title)
room_id = f"{slug}_{canonical_id}"
```

**Example**:
- Title: `"Wehnimer's, Outside Gate"`
- Description: `"Citizens, merchants and..."`
- Hash: `4e0949b5e6b69678`
- ID: `wehnimer_s_outside_gate_4e0949b5e6b69678`

**Benefits**:
- Same room = same ID (even from different logs)
- Detects duplicate rooms
- Prevents ambiguity in linking

---

## Area IDs

Areas must be defined in `src/data/areas.json`:

```json
{
  "wl-gates": "Wehnimer's Landing Outside Gates",
  "wl-town": "Wehnimer's Landing Town",
  ...
}
```

**When adding a new area**:
1. Add to `src/data/areas.json`
2. Use that area ID with room_importer.py

---

## Workflow Comparison

### Old System (Deprecated)
```bash
# Step 1: Parse
python gs3_room_parser_v4.py log.txt wl-gates -o rooms.json

# Step 2: Link (could have bugs)
python link_rooms.py log.txt rooms.json -o linked.json

# Step 3: Import
node ../src/adapters/importers/import-rooms.js linked.json wl-gates
```

### New System (Use This!)
```bash
# Step 1: Parse & Link (correct!)
./room_importer.py logs/log.txt wl-gates -o output/rooms.json

# Step 2: Import
cd .. && node src/adapters/importers/import-rooms.js mapping/output/rooms.json wl-gates
```

---

## Architecture: Content vs Runtime

```
┌─────────────────────────────────────────────────────────┐
│                  CONTENT PIPELINE                        │
│  (Designers/Builders use these tools)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Player Session                                          │
│       ↓                                                  │
│  Movement Log (.txt)  ← logs/                            │
│       ↓                                                  │
│  room_importer.py     ← Content tool                     │
│       ↓                                                  │
│  Structured JSON      ← output/                          │
│       ↓                                                  │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                        │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│               APPLICATION RUNTIME                        │
│  (Node.js application code)                              │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  src/adapters/importers/import-rooms.js                  │
│       ↓ (validates, transforms)                          │
│  src/models/roomModel.js                                 │
│       ↓ (ensures indexes)                                │
│  src/adapters/db/repositories/roomRepository.js          │
│       ↓ (persists)                                       │
│  MongoDB                                                 │
│       ↓ (runtime queries)                                │
│  Game Systems                                            │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Key Insight**: 
- `mapping/` = **Content creation tools** (Python, scripts, whatever works)
- `src/` = **Application code** (Node.js, follows architecture)

**Important**: "You also see..." is **runtime state**, not permanent description
- Movement logs capture a **snapshot** of the room at that moment
- Items, NPCs, and players are **dynamic** (spawned/despawned at runtime)
- Room descriptions should only contain **permanent** features
- Game engine generates "You also see..." dynamically based on room contents

---

## Tips & Best Practices

### Cleaning Logs

The parser automatically handles:
- ✅ **"You also see..." lines** - Excluded from description (runtime state)
- ✅ **"Also here:" lines** - Skipped (dynamic players/NPCs)
- ✅ **"Obvious paths:"** - Used to detect exits

Manually remove before parsing:
- Player chat messages
- Combat output (unless mapping combat areas)
- Item manipulation messages

**Keep only**: 
- Room headers: `[Room Title]`
- Room descriptions
- Obvious paths/exits
- Movement commands: `>direction`

### Incremental Mapping (Multiple Sessions)

For areas explored over multiple sessions:

```bash
# First session - explore north side
./room_importer.py logs/session1.txt wl-town -o output/session1.json
node ../src/adapters/importers/import-rooms.js output/session1.json wl-town

# Second session - explore east side (overlaps with session 1)
./room_importer.py logs/session2.txt wl-town -o output/session2.json
node ../src/adapters/importers/import-rooms.js output/session2.json wl-town --merge

# Third session - explore west side
./room_importer.py logs/session3.txt wl-town -o output/session3.json
node ../src/adapters/importers/import-rooms.js output/session3.json wl-town --merge
```

**Benefits of Merge Mode**:
- ✅ Preserves existing exits
- ✅ Adds newly discovered exits
- ✅ Builds complete map over time
- ✅ No data loss

See `../docs/INCREMENTAL_MAPPING.md` for detailed guide.

### Handling Large Areas

For areas with 100+ rooms:
1. Break into logical sections (north, east, south, west)
2. Parse each section separately
3. Import with `--merge` flag (except first import)
4. Gradually build complete map

### Verifying Imports

```bash
# Check room count
mongosh gs3 --eval "db.rooms.countDocuments({areaId: 'wl-gates'})"

# View room structure
mongosh gs3 --eval "db.rooms.findOne({areaId: 'wl-gates'})"

# Check bidirectional linking
# (should see southwest from A to B, northeast from B to A)
```

---

## Troubleshooting

### Problem: Exits not linking

**Cause**: Movement command not detected
**Fix**: Ensure format is `>direction` on its own line

### Problem: Duplicate rooms created

**Cause**: Description changed between logs
**Fix**: Canonical IDs handle this! Same description = same ID

### Problem: Wrong direction linked

**Cause**: Movement command between rooms was captured wrong
**Fix**: Clean the log file, ensure `>sw` appears BETWEEN room headers

---

## Related Documentation

- `World_Mapping_Guide.md` - Detailed mapping conventions
- `../docs/DATA_VS_DATABASE.md` - When to use data files vs database
- `../docs/ARCHITECTURE.md` - Complete system architecture
- `../src/models/roomModel.js` - Room schema definition

---

## For Developers

### Adding New Features to room_importer.py

The code is structured as:
1. **Room dataclass** - Defines room structure
2. **RoomParser class** - Main parsing logic
3. **parse_log()** - Reads movement log
4. **link_rooms()** - Creates bidirectional links
5. **export_json()** - Writes MongoDB-ready JSON

### Testing Changes

```bash
# Parse a small test file
./room_importer.py logs/small-wl-gates-log.txt wl-gates -o output/test.json

# Check the output
cat output/test.json | python3 -m json.tool | head -50

# Import to test database
node ../src/adapters/importers/import-rooms.js output/test.json wl-gates
```

---

**Last Updated**: 2025-11-03  
**Maintainer**: GS3 Development Team

