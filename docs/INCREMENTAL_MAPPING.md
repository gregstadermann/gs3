# Incremental Mapping Guide

## The Problem

When mapping large areas, you often:
1. Visit a room and explore in one direction
2. Later, revisit the same room and explore different directions
3. Need to **combine** all discovered exits into one complete room

**Example**:
- **Visit 1**: Town Square Central → go `>ne` and `>sw`
- **Visit 2**: Town Square Central → go `>e` and `>w`
- **Goal**: Final room should have **all 4 exits**

---

## The Solution: Merge Mode

### Default Mode (Replace)
```bash
node src/adapters/importers/import-rooms.js rooms.json wl-town
```

**Behavior**:
- New rooms → **Inserted**
- Existing rooms → **Completely replaced**
- Old exits → **Lost!** ❌

### Merge Mode (Recommended for Incremental)
```bash
node src/adapters/importers/import-rooms.js rooms.json wl-town --merge
```

**Behavior**:
- New rooms → **Inserted**
- Existing rooms → **Exits merged**
- Old exits → **Preserved** ✅
- New exits → **Added** ✅

---

## How It Works

### Merge Logic

```javascript
// For each room in the import:
if (room exists in database) {
  existing_exits = fetch from database
  new_exits = from import file
  
  // Merge: add new directions only
  for (new_exit in new_exits) {
    if (new_exit.direction NOT in existing_exits) {
      existing_exits.push(new_exit)  // Add
    }
    // If direction exists, keep existing (don't overwrite)
  }
  
  room.exits = existing_exits
  update database
}
```

### Key Points

✅ **Exits are merged by direction**
- If you already have `north → room_a`
- And import `north → room_b`
- Result: Keeps `north → room_a` (existing wins)

✅ **New directions are added**
- If you have `north, south`
- And import `east, west`
- Result: `north, south, east, west`

✅ **Canonical IDs prevent duplicates**
- Same room visited multiple times = same canonical_id
- Merge consolidates all discoveries

---

## Workflow Examples

### Scenario 1: First Time Mapping

```bash
# 1. Capture movement log (explore north/south)
./room_importer.py logs/town-visit-1.txt wl-town -o output/town-v1.json

# 2. Import (default mode is fine)
node src/adapters/importers/import-rooms.js output/town-v1.json wl-town
```

**Result**: Town Square Central has 2 exits (north, south)

### Scenario 2: Additional Exploration

```bash
# 1. Revisit area, explore east/west
# (Capture new log: town-visit-2.txt)

# 2. Parse new log
./room_importer.py logs/town-visit-2.txt wl-town -o output/town-v2.json

# 3. Import with --merge
node src/adapters/importers/import-rooms.js output/town-v2.json wl-town --merge
```

**Result**: Town Square Central now has 4 exits (north, south, east, west) ✅

### Scenario 3: Multiple Mapping Sessions

```bash
# Session 1: North side
./room_importer.py logs/session1.txt wl-town -o output/session1.json
node src/adapters/importers/import-rooms.js output/session1.json wl-town

# Session 2: East side (merge)
./room_importer.py logs/session2.txt wl-town -o output/session2.json
node src/adapters/importers/import-rooms.js output/session2.json wl-town --merge

# Session 3: West side (merge)
./room_importer.py logs/session3.txt wl-town -o output/session3.json
node src/adapters/importers/import-rooms.js output/session3.json wl-town --merge

# Session 4: South side (merge)
./room_importer.py logs/session4.txt wl-town -o output/session4.json
node src/adapters/importers/import-rooms.js output/session4.json wl-town --merge
```

**Result**: Complete map with all discovered exits!

---

## Example Output

### First Import (Default Mode)

```bash
$ node src/adapters/importers/import-rooms.js output/town-v1.json wl-town

✅ Import complete!
   Imported: 50 new rooms
   Updated: 0 existing rooms
   Total rooms in wl-town: 50
```

### Second Import (Merge Mode)

```bash
$ node src/adapters/importers/import-rooms.js output/town-v2.json wl-town --merge

🔄 Merge mode enabled - will combine exits with existing rooms

  🔄 Merged town_square_central_7d908936: 2 → 4 exits (added 2)
  🔄 Merged wehnimers_north_ring_rd_abc123: 3 → 5 exits (added 2)
  🔄 Merged town_square_east_78372ba5: 1 → 3 exits (added 2)

✅ Import complete!
   Imported: 15 new rooms
   Updated: 35 existing rooms
   Total rooms in wl-town: 65
```

---

## When to Use Each Mode

### Use Default Mode (Replace) When:
- ✅ First time importing an area
- ✅ You want to completely replace room data
- ✅ You've fixed errors and want clean data
- ✅ Starting fresh with a complete log

### Use Merge Mode When:
- ✅ Adding exits to existing rooms
- ✅ Incremental mapping (multiple sessions)
- ✅ Combining data from different logs
- ✅ Exploring unmapped directions

---

## Merge Conflicts

### What Gets Merged?
- ✅ **Exits** - By direction (new added, existing kept)

### What Gets Replaced?
- **Title** - New overwrites old
- **Description** - New overwrites old
- **Features** - New overwrites old
- **Items** - New overwrites old

### Direction Conflicts

If existing has `north → room_a` and import has `north → room_b`:
- **Existing wins** (keeps room_a)
- No overwrite of existing exits
- Assumption: First mapping is correct

To fix conflicts:
```bash
# Delete the room and reimport
mongosh gs3 --eval "db.rooms.deleteOne({id: 'room_id'})"
node src/adapters/importers/import-rooms.js rooms.json wl-town
```

---

## Best Practices

### 1. Map Systematically
```
Session 1: Main square (all directions)
Session 2: North district (--merge)
Session 3: East district (--merge)
Session 4: Connect unmapped exits (--merge)
```

### 2. Verify After Each Import
```bash
# Check room exits
mongosh gs3 --eval "db.rooms.findOne({id: 'town_square_central_abc'})"

# Count rooms
mongosh gs3 --eval "db.rooms.countDocuments({areaId: 'wl-town'})"
```

### 3. Use Canonical IDs

Canonical IDs ensure:
- Same room = same ID (even from different logs)
- Merge works correctly
- No accidental duplicates

### 4. Keep Logs Organized

```
logs/
  wl-town-session1-north.txt
  wl-town-session2-east.txt
  wl-town-session3-west.txt
  wl-town-session4-south.txt
```

---

## Troubleshooting

### Problem: Merge not adding new exits

**Cause**: Room has different canonical_id (description changed)

**Solution**: Check canonical_id matches
```bash
# In new JSON
grep "canonical_id" output/new.json

# In database
mongosh gs3 --eval "db.rooms.find({}, {id:1, canonical_id:1})"
```

### Problem: Wrong exit direction

**Cause**: Existing exit is incorrect

**Solution**: Delete and reimport
```bash
mongosh gs3 --eval "db.rooms.deleteOne({id: 'room_id'})"
node src/adapters/importers/import-rooms.js rooms.json wl-town
```

### Problem: Self-loop created

**Cause**: Log captured movement that didn't actually move

**Fix**: Room importer now **automatically skips** self-loops ✅

---

## Complete Workflow Example

```bash
# Week 1: Map north side of town
./room_importer.py logs/week1-north.formatted.txt wl-town -o output/week1.json
node src/adapters/importers/import-rooms.js output/week1.json wl-town
# Result: 30 rooms

# Week 2: Map east side, some overlap
./room_importer.py logs/week2-east.formatted.txt wl-town -o output/week2.json
node src/adapters/importers/import-rooms.js output/week2.json wl-town --merge
# Result: 25 new rooms, 15 updated (exits added)
# Total: 55 rooms

# Week 3: Map west side
./room_importer.py logs/week3-west.formatted.txt wl-town -o output/week3.json
node src/adapters/importers/import-rooms.js output/week3.json wl-town --merge
# Result: 20 new rooms, 10 updated
# Total: 75 rooms

# Week 4: Fill in gaps
./room_importer.py logs/week4-gaps.formatted.txt wl-town -o output/week4.json
node src/adapters/importers/import-rooms.js output/week4.json wl-town --merge
# Result: 5 new rooms, 30 updated (many exits added)
# Total: 80 rooms - complete!
```

---

## Summary

### Merge Mode Features

✅ **Incremental mapping** - Build map over multiple sessions  
✅ **Exit preservation** - Never lose discovered exits  
✅ **Automatic deduplication** - Canonical IDs prevent duplicates  
✅ **Self-loop prevention** - Invalid exits automatically skipped  
✅ **Progress tracking** - See which rooms got new exits  

### Command Reference

```bash
# First import (replace mode)
node src/adapters/importers/import-rooms.js output/rooms.json area-id

# Incremental import (merge mode)
node src/adapters/importers/import-rooms.js output/rooms.json area-id --merge
```

---

## Related Documentation

- `mapping/README.md` - Mapping workflow
- `mapping/CHANGELOG.md` - System changes
- `ARCHITECTURE.md` - Complete architecture
- `DATA_VS_DATABASE.md` - When to use database vs data files

