# Mapping System Changelog

## 2025-11-03 - Complete Reorganization

### New System: room_importer.py ✅

**Single-file parser/linker that does it all**:
- ✅ Parses movement logs
- ✅ Creates canonical IDs (hash-based)
- ✅ Bidirectional exit linking
- ✅ **Excludes "You also see..." (runtime state)**
- ✅ Extracts features automatically
- ✅ Clean, maintainable code

### Directory Structure ✅

```
mapping/
├── room_importer.py       # New all-in-one tool
├── README.md              # Complete documentation
├── World_Mapping_Guide.md # Mapping conventions
│
├── logs/                  # Raw movement logs
│   ├── small-wl-gates-log.txt
│   ├── wl-gates.txt
│   └── wl-town-lots-of-rooms.Txt
│
├── output/                # Generated JSON files
│   └── *.json
│
└── legacy/                # Old scripts (deprecated)
    ├── gs3_room_parser_v4.py
    ├── link_rooms.py
    └── ...
```

### Key Improvements

#### 1. Runtime State Excluded ✅
**Problem**: Movement logs contain snapshots with dynamic content
```
You also see a rolton, a town guard, a tower...
```

**Solution**: Strip from description (game engine generates this at runtime)
```python
description = re.sub(r'\.\s+You also see\s+.+?\.?\s*$', '.', description)
```

#### 2. Correct Bidirectional Linking ✅
**Problem**: Old linker had bugs with exit direction tracking

**Solution**: Track movement sequence properly
```
>sw from Outside Gate to Exterior
  Creates: southwest → exterior
  Creates: northeast → outside_gate  ✅ Correct reverse!
```

#### 3. No Redundant fullId ✅
**Problem**: Storing `fullId` when it's derivable

**Solution**: Removed field, compute as `${areaId}:${id}` when needed
- Cleaner data model
- Less storage
- Single source of truth (areaId + id)

### Breaking Changes

⚠️ **Schema Change**: Removed `fullId` field from rooms
- **Impact**: RoomRepository updated to derive fullId on queries
- **Migration**: Rooms collection dropped and reimported
- **Benefit**: Cleaner data model

### Usage

**Old way** (deprecated):
```bash
python gs3_room_parser_v4.py log.txt area
python link_rooms.py log.txt rooms.json
node import-rooms.js linked.json area
```

**New way**:
```bash
./room_importer.py logs/log.txt area -o output/rooms.json
node ../src/adapters/importers/import-rooms.js output/rooms.json area
```

### Testing Results

**File**: `small-wl-gates-log.txt`
- ✅ 5 rooms parsed
- ✅ Bidirectional linking correct (sw ↔ ne)
- ✅ Descriptions clean (no "You also see")
- ✅ Features extracted (gate, path, wall, sign, tower)
- ✅ Imported to MongoDB successfully

### Architecture Alignment

This reorganization follows the principle:
- **mapping/** = Content creation workspace (not runtime)
- **src/** = Application code (runtime)

Clear separation between tools and application! 🎯
