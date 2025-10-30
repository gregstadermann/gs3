## GS3 Database Operations

This document captures where MongoDB stores data for GS3, how to back it up and restore it, and how to enable single-node replication for resilience. Keep this file updated when procedures change.

### Active MongoDB Settings
- dbPath: `/var/lib/mongodb` (Linux filesystem; do not use `/mnt/*`)
- Service: `mongod` managed by systemd
- Connection string (local dev): `mongodb://localhost:27017/gs3`

Verify settings:
```
sudo grep -A2 dbPath /etc/mongod.conf
ps aux | grep -E "[m]ongod"
```

### Backups (Daily Dumps)
Use `mongodump` to create daily dumps with retention. Example user-level script:
```
#!/usr/bin/env bash
set -euo pipefail
OUT_BASE=/home/greg/mongo-dumps
STAMP=$(date +%F)
OUT="$OUT_BASE/$STAMP"
mkdir -p "$OUT_BASE"
mongodump --db gs3 --out "$OUT"
[ -d "$OUT/gs3" ] || { echo "ERROR: dump missing at $OUT/gs3"; exit 1; }
find "$OUT_BASE" -maxdepth 1 -mindepth 1 -type d -mtime +14 -print -exec rm -rf {} + || true
echo "Backup complete to $OUT"
```

Install to `/home/greg/bin/gs3-backup.sh` and make executable. Add a cron entry for 3am:
```
crontab -e
0 3 * * * /home/greg/bin/gs3-backup.sh >> /home/greg/mongo-dumps/backup.log 2>&1
```

Restore from a dump:
```
mongorestore --db gs3 --drop /home/greg/mongo-dumps/YYYY-MM-DD/gs3
```

### Single-Node Replication (Resilience)
Enabling a one-node replica set provides an oplog for point‑in‑time recovery and makes it easy to add a second node later.

1) Edit `/etc/mongod.conf` and add:
```
replication:
  replSetName: rs0
```
2) Restart MongoDB:
```
sudo systemctl restart mongod
```
3) Initialize the replica set:
```
mongosh --eval 'rs.initiate({ _id: "rs0", members: [ { _id: 0, host: "127.0.0.1:27017" } ] })'
```
4) Verify:
```
mongosh --eval 'rs.status()'
```

Notes:
- Keep `dbPath` on the Linux filesystem (`/var/lib/mongodb`). Do not place data under `/mnt/*` (Windows mounts) due to permission/ACL and performance issues.
- Do not change `dbPath` casually. Document any changes and back up `/etc/mongod.conf`.
- When moving data directories, always stop MongoDB first and preserve ownerships:
```
sudo systemctl stop mongod
sudo chown -R mongodb:mongodb /var/lib/mongodb && sudo chmod 700 /var/lib/mongodb
sudo systemctl start mongod
```

### Permissions & Auth
- The `dbPath` directory should be owned by `mongodb:mongodb` with mode `700`.
- Consider enabling auth and using a dedicated app user. Store credentials outside the repo.

### Recovery Checklist
1) Confirm `dbPath` and service logs (`journalctl -u mongod -n 200`).
2) If data missing, check for dumps under `/home/greg/mongo-dumps/`.
3) If replication enabled, oplog can support point-in-time recovery (advanced).
4) If no dumps, reseed idempotent game tables using project seed scripts.


