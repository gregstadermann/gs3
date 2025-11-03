# Simplified Mapping Workflow

## TL;DR - Complete Workflow

```bash
# 1. Specify area once when parsing
cd mapping
./room_importer.py logs/my-log.txt wl-town -o output/my-area.json

# 2. Import (area auto-detected from JSON)
cd ..
node src/adapters/importers/import-rooms.js mapping/output/my-area.json
```

**That's it!** Area is specified once, auto-merge is automatic.

---

## Where Area is Specified

### Only ONE Place: When Parsing

```bash
./room_importer.py logs/my-log.txt AREA_ID -o output/rooms.json
                                   ^^^^^^^^
                                   Specify here
```

**What happens**:
- Parser validates `AREA_ID` against `src/data/areas.json`
- Every room in JSON gets `"areaId": "AREA_ID"`
- JSON file now contains complete area information

### Importer Auto-Detects

```bash
node src/adapters/importers/import-rooms.js output/rooms.json
                                            ^^^^^^^^^^^^^^^^^^
                                            No area needed!
```

**What happens**:
- Reads first room's `areaId` field
- Uses that for all rooms
- Validates all rooms have same `areaId`

**Optional**: You can still override:
```bash
node src/adapters/importers/import-rooms.js output/rooms.json wl-town
                                                              ^^^^^^^^
                                                              Override if needed
```

---

## Auto-Merge Behavior

### Smart Detection

**First Import** (area doesn't exist):
```bash
node src/adapters/importers/import-rooms.js output/rooms.json
```
```
✨ New area: Inserting rooms
✅ Import complete!
   Imported: 78 new rooms
```

**Second Import** (area has rooms):
```bash
node src/adapters/importers/import-rooms.js output/more-rooms.json
```
```
🔄 Auto-merge mode: Found 78 existing rooms in wl-town
   Will preserve existing exits and add new ones

  🔄 Merged town_square_central: 3 → 5 exits (+2)

✅ Import complete!
   Imported: 15 new rooms
   Merged: 12 rooms (exits added)
   Unchanged: 3 rooms (no new exits)
```

**Force Replace** (overwrite everything):
```bash
node src/adapters/importers/import-rooms.js output/rooms.json --replace
```
```
⚠️  Replace mode forced - will overwrite existing rooms

✅ Import complete!
   Imported: 0 new rooms
   Replaced: 78 existing rooms
```

---

## Complete Examples

### Example 1: First Time Mapping

```bash
cd mapping

# 1. Clean log (if needed)
./format_log.py logs/raw-log.txt logs/clean-log.txt

# 2. Parse & link (specify area HERE)
./room_importer.py logs/clean-log.txt wl-town -o output/wl-town.json

# 3. Import (area auto-detected)
cd ..
node src/adapters/importers/import-rooms.js mapping/output/wl-town.json
```

**Output**:
```
✨ Auto-detected area: wl-town
✨ New area: Inserting rooms
✅ Imported: 78 new rooms
```

### Example 2: Adding More Rooms

```bash
cd mapping

# Parse new exploration log (same area)
./room_importer.py logs/more-exploration.txt wl-town -o output/more-rooms.json

# Import (auto-merge kicks in)
cd ..
node src/adapters/importers/import-rooms.js mapping/output/more-rooms.json
```

**Output**:
```
✨ Auto-detected area: wl-town
🔄 Auto-merge mode: Found 78 existing rooms
  🔄 Merged town_square_central: 3 → 6 exits (+3)
  🔄 Merged north_ring_rd: 2 → 4 exits (+2)
✅ Imported: 25 new rooms
✅ Merged: 15 rooms (exits added)
```

---

## Key Points

### ✅ Specify Area Once
- When parsing: `./room_importer.py logs/log.txt AREA`
- Area embedded in JSON
- Importer reads it automatically

### ✅ Auto-Merge is Default
- New area → Insert mode
- Existing area → Merge mode
- Smart detection, no flags needed

### ✅ Override When Needed
```bash
# Force area (if JSON is wrong)
node src/adapters/importers/import-rooms.js rooms.json wl-override

# Force replace (start fresh)
node src/adapters/importers/import-rooms.js rooms.json --replace
```

---

## Workflow Comparison

### Old Way (Manual)
```bash
./room_importer.py logs/log.txt wl-town -o rooms.json     # ← Specify area
node import-rooms.js rooms.json wl-town                   # ← Specify AGAIN
node import-rooms.js rooms.json wl-town --merge           # ← Manual merge flag
```

### New Way (Auto)
```bash
./room_importer.py logs/log.txt wl-town -o rooms.json     # ← Specify area ONCE
node import-rooms.js rooms.json                           # ← Auto-detect everything!
```

**Benefits**:
- ✅ Less typing
- ✅ Less error-prone
- ✅ Automatic merge detection
- ✅ Still can override if needed

---

## Area Validation

The area you specify must exist in `src/data/areas.json`:

```json
{
  "wl-town": "Wehnimer's Landing Town",
  "wl-gates": "Wehnimer's Landing Outside Gates",
  ...
}
```

**Parser checks this** when you run:
```bash
./room_importer.py logs/log.txt INVALID_AREA
```

Error: `Area 'INVALID_AREA' not found in areas.json`

**To add new area**:
1. Edit `src/data/areas.json`
2. Add: `"new-area": "New Area Display Name"`
3. Now you can parse logs for that area

---

## Summary

### Simplified Workflow

1. **Parse once** (specify area)
2. **Import once** (everything auto)

### Smart Defaults

- ✅ Area auto-detected from JSON
- ✅ Merge auto-enabled for existing areas
- ✅ Insert auto-enabled for new areas

### When to Override

- Use explicit area: JSON is broken/mixed
- Use `--replace`: Want to start fresh

---

**The system now "just works" for 99% of use cases!** 🎯

