# GS3 Mapping System

This directory contains tools for converting room data into GS3 format for MongoDB import.

## 📖 Complete Documentation

**See [MAPPING_SYSTEM_GUIDE.md](MAPPING_SYSTEM_GUIDE.md) for the complete guide.**

---

## ⚡ Quick Start

### Import Complete World (35,619 rooms)

```bash
# 1. Convert master map
python3 convert_map_json.py logs/map-1762231737.json --all -o output/world-rooms.json

# 2. Import to database
cd /home/greg/gs3
node src/adapters/importers/import-all-rooms.js mapping/output/world-rooms.json
```

### Import Custom Movement Log

```bash
# 1. Format log
python3 format_log.py logs/my-log.txt logs/formatted.txt

# 2. Parse and link
python3 room_importer.py logs/formatted.txt <area-id> -o output/rooms.json

# 3. Import
cd /home/greg/gs3
node src/adapters/importers/import-rooms.js mapping/output/rooms.json <area-id> --merge
```

---

## 📁 Directory Structure

```
mapping/
├── README.md                     # This file
├── MAPPING_SYSTEM_GUIDE.md       # Complete documentation
│
├── convert_map_json.py           # Convert world map JSON → GS3
├── room_importer.py              # Parse movement logs → GS3
├── format_log.py                 # Format raw logs
│
├── logs/
│   └── map-1762231737.json       # ⭐ Master world map (35,979 rooms)
│
├── output/
│   └── all-rooms-fixed.json      # Latest full import
│
└── legacy/                       # Archived tools (deprecated)
```

---

## 🎯 Key Files

- **`logs/map-1762231737.json`** - Master world map (DO NOT DELETE)
- **`MAPPING_SYSTEM_GUIDE.md`** - Complete documentation
- **`convert_map_json.py`** - Primary conversion tool
- **`room_importer.py`** - Movement log parser

---

## 📊 Current Stats

- **Total Rooms**: 35,619 imported across 16 areas
- **All exit types supported**: ordinal + non-ordinal (building, gate, door, etc.)
- **Unique ID system**: Uses game's native UIDs (u7003, u13104045, etc.)

---

**For full documentation, troubleshooting, and advanced usage:**  
👉 **[MAPPING_SYSTEM_GUIDE.md](MAPPING_SYSTEM_GUIDE.md)**

