# GS3 Mapping System - Complete Guide

## Overview

The GS3 mapping system converts room data from various formats into a standardized format for MongoDB import. This is a **content creation pipeline**, not runtime application code.

**Last Updated**: November 4, 2025  
**Status**: Production Ready - 35,619 rooms imported across 16 areas

---

## Quick Reference

### Import Complete World Map
```bash
cd /home/greg/gs3/mapping

# Convert the master map file (35,927 rooms)
python3 convert_map_json.py logs/map-1762231737.json --all -o output/world-rooms.json

# Import to database
cd /home/greg/gs3
node src/adapters/importers/import-all-rooms.js mapping/output/world-rooms.json
```

### Import Custom Movement Logs
```bash
cd /home/greg/gs3/mapping

# Format log (if using combined format: >n[Room Title] (u1234))
python3 format_log.py logs/my-log.txt logs/my-log.formatted.txt

# Parse and link rooms
python3 room_importer.py logs/my-log.formatted.txt <area-id> -o output/my-rooms.json

# Import to database
cd /home/greg/gs3
node src/adapters/importers/import-rooms.js mapping/output/my-rooms.json <area-id> --merge
```

---

## Directory Structure

```
mapping/
├── convert_map_json.py          # Convert world map JSON → GS3 format
├── room_importer.py             # Parse movement logs → GS3 format  
├── format_log.py                # Format raw movement logs
├── MAPPING_SYSTEM_GUIDE.md      # This file
│
├── logs/
│   └── map-1762231737.json      # ⭐ MASTER: Complete world map (35,979 rooms)
│
├── output/
│   └── all-rooms-fixed.json     # Latest full import (35,927 rooms)
│
└── legacy/                      # Archived old tools (deprecated)
```

---

## Core Concepts

### Unique Room IDs

Every room has a **canonical ID** that uniquely identifies it:

**Format**: `u{UID}`

**Examples**:
- `u7003` - Original UID from game (Wehnimer's Landing)
- `u13104045` - Original UID from game (Ta'Illistim)
- `u900003880` - Generated UID (for rooms without original UIDs)

**Generated UIDs**:
- Formula: `900000000 + original_map_id`
- Used for rooms that don't have a UID in the source data
- Start with `u9` to clearly identify them as generated

### Room Structure

```json
{
  "id": "u7003",
  "canonical_id": "u7003",
  "areaId": "wl-town",
  "title": "Wehnimer's, West Ring Rd.",
  "description": "This cobbled road circles the town...",
  "exits": [
    {"direction": "south", "roomId": "u7004"},
    {"direction": "northeast", "roomId": "u7002"},
    {"direction": "shop", "roomId": "u8620"}
  ],
  "features": [],
  "items": [],
  "metadata": {
    "importedAt": "2025-11-04T14:51:30.254Z",
    "originalFormat": "map-json",
    "source": "Wehnimer's Landing",
    "original_id": 10
  }
}
```

### Exit Types

**Ordinal Exits** (auto-bidirectional):
- north ↔ south
- east ↔ west  
- northeast ↔ southwest
- up ↔ down

**Special Ordinal** (no auto-reverse):
- out → (one-way)

**Non-Ordinal Exits**:
- building, shop, gate, door
- entrance, inn, bank, house
- climb ladder, go archway, etc.

---

## Tools

### 1. convert_map_json.py - World Map Converter

Converts the master map JSON file (`map-1762231737.json`) to GS3 format.

**Features**:
- ✅ Extracts unique IDs (UIDs) from map data
- ✅ Generates synthetic UIDs for rooms without UIDs
- ✅ Auto-assigns rooms to areas based on location
- ✅ Converts all exit types (ordinal and non-ordinal)
- ✅ Resolves exit destinations using UID mapping

**Usage**:

```bash
# Import entire world with auto-detected areas
python3 convert_map_json.py logs/map-1762231737.json --all -o output/world.json

# Filter by location
python3 convert_map_json.py logs/map-1762231737.json -l "Wehnimer" -o output/wl.json

# Force specific area
python3 convert_map_json.py logs/map-1762231737.json -l "Icemule" -a imt-icemule -o output/ice.json
```

**Arguments**:
- `input_json` - Path to map JSON file (required)
- `-a, --area` - Force all rooms to specific area ID
- `-l, --location` - Filter by location string
- `-o, --output` - Output JSON file (required)
- `--all` - Import all rooms with auto-detected areas

**Auto-Area Mapping**:
```
"Wehnimer's Landing"     → wl-town
"Ta'Illistim"            → en-taillistim
"Solhaven"               → vo-solhaven
"Icemule Trace"          → imt-icemule
"River's Rest"           → rr-riversrest
... and more (see LOCATION_TO_AREA in script)
```

### 2. room_importer.py - Movement Log Parser

Parses movement logs from gameplay sessions and converts them to GS3 format.

**Features**:
- ✅ Extracts unique IDs from room headers: `[Room Title] (u7003)`
- ✅ Bidirectional exit linking (for ordinal directions)
- ✅ Non-ordinal exit support (go gate, climb ladder, etc.)
- ✅ Self-loop detection
- ✅ Runtime state exclusion ("You also see..." stripped)

**Usage**:

```bash
# Parse a formatted movement log
python3 room_importer.py logs/formatted-log.txt wl-town -o output/rooms.json
```

**Arguments**:
- `log_file` - Path to formatted movement log (required)
- `area_id` - Area ID (e.g., wl-town) (required)
- `-o, --output` - Output JSON file (required)

**Log Format Expected**:
```
>n
[Wehnimer's, West Ring Rd. - 294] (u7003)
This cobbled road circles the town...
Obvious paths: northeast, south
>ne
[Wehnimer's, North Ring Rd. - 225] (u7002)
...
```

### 3. format_log.py - Log Formatter

Formats raw movement logs by splitting combined lines.

**Usage**:

```bash
# Split combined movement+room lines
python3 format_log.py logs/raw-log.txt logs/formatted-log.txt
```

**Converts**:
```
>n[Room Title] (u7003)
```

**To**:
```
>n
[Room Title] (u7003)
```

---

## Import Process

### Option 1: Import Complete World Map (Recommended)

Use this to import all 35,927 rooms at once:

```bash
cd /home/greg/gs3/mapping

# Step 1: Convert world map
python3 convert_map_json.py logs/map-1762231737.json --all -o output/world-rooms.json

# Step 2: Import to database (handles multiple areas automatically)
cd /home/greg/gs3
node src/adapters/importers/import-all-rooms.js mapping/output/world-rooms.json
```

**Result**:
- 35,619 rooms imported
- 16 areas populated
- All exits correctly linked

### Option 2: Import Specific Area

```bash
cd /home/greg/gs3/mapping

# Convert specific location
python3 convert_map_json.py logs/map-1762231737.json -l "Wehnimer" -o output/wl-rooms.json

# Import single area
cd /home/greg/gs3
node src/adapters/importers/import-rooms.js mapping/output/wl-rooms.json wl-town
```

### Option 3: Import from Movement Log

For custom exploration logs:

```bash
cd /home/greg/gs3/mapping

# 1. Format log
python3 format_log.py logs/my-exploration.txt logs/formatted.txt

# 2. Parse and link
python3 room_importer.py logs/formatted.txt wl-town -o output/my-rooms.json

# 3. Import with merge (preserves existing exits)
cd /home/greg/gs3
node src/adapters/importers/import-rooms.js mapping/output/my-rooms.json wl-town --merge
```

---

## Import Modes

### Replace Mode (Default)
Overwrites existing rooms completely.

```bash
node src/adapters/importers/import-rooms.js rooms.json wl-town
```

### Merge Mode
Preserves existing exits, adds new ones.

```bash
node src/adapters/importers/import-rooms.js rooms.json wl-town --merge
```

**Use merge when**:
- Adding newly discovered exits
- Building map over multiple sessions
- Combining data from different sources

---

## Area IDs

All area IDs must be defined in `src/data/areas.json`:

```json
{
  "wl-town": "Wehnimer's Landing Town",
  "wl-graveyard": "Wehnimer's Landing Graveyard",
  "en-taillistim": "Elanith Taillistim",
  "vo-solhaven": "Solhaven",
  "imt-icemule": "Icemule Trace",
  "rr-riversrest": "River's Rest",
  "ti-teras": "Teras Isle",
  "global": "Global Map"
}
```

---

## Non-Ordinal Exits

Non-ordinal exits (like "go building", "climb ladder") are fully supported:

**In Map Data**:
```json
"wayto": {
  "644": "go building",
  "206": "northeast"
}
```

**Converted To**:
```json
"exits": [
  {"direction": "building", "roomId": "u13104045"},
  {"direction": "northeast", "roomId": "u13101031"}
]
```

**Common Non-Ordinal Exits**:
- building, shop, inn, bank, house
- gate, door, archway, entrance
- portcullis, dais, fountain
- climb ladder, climb stairs

**Auto-Skipped**:
- Scripted exits (`;e true`)
- Ruby commands (`;e scripts`)

---

## Troubleshooting

### Exit leads nowhere

**Symptom**: `go building` returns "That exit leads nowhere"

**Cause**: Exit points to room that doesn't exist in database

**Fix**: 
1. Check if destination room was imported: `db.rooms.findOne({id: 'u644'})`
2. Verify exit uses correct UID (not map ID)
3. Reimport with fixed converter if needed

### Rooms not linking properly

**Symptom**: Can go one direction but not back

**Cause**: 
- Non-ordinal exits don't auto-reverse (by design)
- "out" doesn't auto-reverse (by design)

**Fix**: This is normal behavior. Use merge mode to add missing exits from other logs.

### Duplicate rooms created

**Symptom**: Same room appears twice with different IDs

**Cause**: Description changed between imports

**Fix**: Use same source file. Unique IDs prevent duplicates when descriptions are stable.

---

## Database Verification

```bash
# Check room count
mongosh gs3 --eval "db.rooms.countDocuments({})"

# Check specific area
mongosh gs3 --eval "db.rooms.countDocuments({areaId: 'wl-town'})"

# View room details
mongosh gs3 --eval "printjson(db.rooms.findOne({id: 'u7003'}))"

# Check exit destinations
mongosh gs3 --eval "
  var room = db.rooms.findOne({id: 'u7003'});
  room.exits.forEach(e => {
    var dest = db.rooms.findOne({id: e.roomId});
    print(e.direction + ' -> ' + (dest ? dest.title : 'NOT FOUND'));
  });
"
```

---

## Current World Stats

**Last Import**: November 4, 2025

```
Total Rooms: 35,619

Area Distribution:
  global              : 21,725 rooms
  wl-town             :  3,608 rooms
  vo-solhaven         :  1,946 rooms
  imt-icemule         :  1,594 rooms
  en-taillistim       :  1,294 rooms
  en-tavaalor         :  1,104 rooms
  rr-riversrest       :    943 rooms
  ti-teras            :    812 rooms
  en-zul-logoth       :    616 rooms
  en-old-tafaendryl   :    357 rooms
  rr-citadel          :    333 rooms
  wl-trollfang        :    313 rooms
  en-whistlers-pass   :    302 rooms
  wl-graveyard        :    277 rooms
  wl-darkstone        :    259 rooms
  en-cysaegir         :    136 rooms
```

---

## Key Files

### Essential

- **`logs/map-1762231737.json`** - Master world map (DO NOT DELETE)
- **`convert_map_json.py`** - World map converter
- **`room_importer.py`** - Movement log parser
- **`format_log.py`** - Log formatter

### Latest Output

- **`output/all-rooms-fixed.json`** - Latest complete world import

### Reference

- **`legacy/`** - Archived old tools (for reference only)

---

## Migration Notes

### From Hash-Based IDs (Old System)

**Old Format**:
```json
{
  "id": "wehnimer_s_west_ring_rd_a3f2b9c1",
  "canonical_id": "wehnimer_s_west_ring_rd_a3f2b9c1"
}
```

**New Format**:
```json
{
  "id": "u7003",
  "canonical_id": "u7003"
}
```

**Why Changed**:
- Game provides unique IDs - no need to generate hashes
- Matches original game data
- Easier to debug and reference
- More stable across imports

### Converting Old Logs

If you have old logs without unique IDs in room headers, you'll need to:
1. Use the world map instead (recommended)
2. Or manually add UIDs to room headers

---

## Advanced Usage

### Custom Area Mapping

Edit `LOCATION_TO_AREA` in `convert_map_json.py`:

```python
LOCATION_TO_AREA = {
    "My Custom Location": "custom-area-id",
    "Wehnimer's Landing": "wl-town",
    # ... more mappings
}
```

### Filtering Rooms

```bash
# Import only specific location
python3 convert_map_json.py logs/map.json -l "Solhaven" -o output/sol.json

# Force all to one area (ignores auto-detection)
python3 convert_map_json.py logs/map.json --all -a global -o output/global.json
```

### Incremental Mapping

```bash
# First session
python3 room_importer.py logs/session1.txt wl-town -o output/s1.json
node ../src/adapters/importers/import-rooms.js output/s1.json wl-town

# Second session (merge mode preserves existing exits)
python3 room_importer.py logs/session2.txt wl-town -o output/s2.json
node ../src/adapters/importers/import-rooms.js output/s2.json wl-town --merge
```

---

## Best Practices

### DO ✅

- Keep `map-1762231737.json` as master reference
- Use `--merge` for incremental mapping
- Verify imports with database queries
- Test navigation after importing

### DON'T ❌

- Don't delete the master map file
- Don't mix data from incompatible sources
- Don't force replace mode unless intentional
- Don't manually edit room IDs

---

## Support

For issues or questions:
1. Check this guide first
2. Verify database state with mongosh
3. Check import logs for errors
4. Review exit destinations exist in database

---

**System Status**: ✅ Production Ready  
**Total Rooms Available**: 35,979  
**Successfully Imported**: 35,619 (99.0%)

