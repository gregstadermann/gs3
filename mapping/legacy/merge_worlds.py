#!/usr/bin/env python3
# merge_worlds.py
# Merge multiple linked room JSON files into a unified master world map.

import json
import argparse

def merge_world(master_path, new_path, output_path=None):
    with open(master_path, 'r', encoding='utf-8') as f:
        master = {r['canonical_id']: r for r in json.load(f)}

    with open(new_path, 'r', encoding='utf-8') as f:
        new_rooms = json.load(f)

    added, updated = 0, 0

    for room in new_rooms:
        cid = room['canonical_id']
        if cid in master:
            m = master[cid]
            # Merge exits (fill unknowns only)
            for k, v in room.get('exits', {}).items():
                if k not in m['exits'] or m['exits'][k] == "unknown":
                    m['exits'][k] = v
            # Merge features and static_items
            for field in ["features", "static_items"]:
                existing = set(m.get(field, []))
                incoming = set(room.get(field, []))
                m[field] = sorted(existing | incoming)
            updated += 1
        else:
            master[cid] = room
            added += 1

    out = list(master.values())
    out_path = output_path or master_path.replace(".json", "_merged.json")

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    print(f"Merged {added} new rooms, updated {updated} → {out_path}")

def main():
    ap = argparse.ArgumentParser(description="Merge linked room JSON files into a master world map.")
    ap.add_argument("master", help="Existing world JSON file")
    ap.add_argument("new", help="New linked rooms JSON file")
    ap.add_argument("-o", "--output", help="Output path (default: *_merged.json)")
    args = ap.parse_args()
    merge_world(args.master, args.new, args.output)

if __name__ == "__main__":
    main()
