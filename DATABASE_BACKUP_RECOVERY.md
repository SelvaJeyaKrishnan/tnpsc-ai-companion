# TNPSC AI Study Companion – Database Backup & Disaster Recovery Guide

This guide outlines database backup strategies, disaster recovery procedures, and integrity verification protocols for SQLite and PostgreSQL.

---

## 1. SQLite Backup Strategy (Single-Instance Deployment)

When running the application with the default SQLite database (`backend/data/tnpsc_productivity.db`), direct file copying while the application is actively writing can result in partial snapshots.

### Safe Online Backup via SQLite CLI
Execute an atomic snapshot using the SQLite `.backup` command:

```bash
# Create safe atomic backup with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
sqlite3 /opt/tnpsc-companion/backend/data/tnpsc_productivity.db ".backup '/opt/backups/tnpsc_backup_${TIMESTAMP}.sqlite'"

# Compress snapshot
gzip "/opt/backups/tnpsc_backup_${TIMESTAMP}.sqlite"
```

### Automated Backup Script (`scripts/backup_sqlite.sh`)
```bash
#!/bin/bash
set -euo pipefail

BACKUP_DIR="/var/backups/tnpsc"
SOURCE_DB="/opt/tnpsc-companion/backend/data/tnpsc_productivity.db"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_FILE="${BACKUP_DIR}/tnpsc_${TIMESTAMP}.db"

mkdir -p "$BACKUP_DIR"

# Perform online snapshot
sqlite3 "$SOURCE_DB" ".backup '${TARGET_FILE}'"

# Verify integrity of the backup file
sqlite3 "$TARGET_FILE" "PRAGMA integrity_check;" | grep -q "ok"

# Compress and restrict permissions
gzip "$TARGET_FILE"
chmod 600 "${TARGET_FILE}.gz"

# Retain backups for 30 days
find "$BACKUP_DIR" -type f -name "tnpsc_*.db.gz" -mtime +30 -delete

echo "[$(date)] Backup completed: ${TARGET_FILE}.gz"
```

Configure via cron (`crontab -e`):
```cron
# Run daily backup at 02:00 AM IST
0 2 * * * /opt/tnpsc-companion/scripts/backup_sqlite.sh >> /var/log/tnpsc_backup.log 2>&1
```

---

## 2. PostgreSQL Backup Strategy (Multi-Instance Deployment)

If using a managed PostgreSQL instance (e.g. Google Cloud SQL, AWS RDS, Supabase):

### Daily Logical Dump
```bash
pg_dump -h <host> -U <user> -d <dbname> -F c -b -v -f "/var/backups/tnpsc_pg_$(date +%Y%m%d).dump"
```

### Restore Procedure
```bash
pg_restore -h <host> -U <user> -d <dbname> -v --clean --if-exists "/var/backups/tnpsc_pg_<date>.dump"
```

---

## 3. SQLite Disaster Recovery Protocol

In the event of database corruption or accidental damage:

1. **Stop the backend service**:
   ```bash
   docker compose stop backend
   ```
2. **Move corrupted database aside**:
   ```bash
   mv /opt/tnpsc-companion/backend/data/tnpsc_productivity.db /opt/tnpsc-companion/backend/data/corrupted_$(date +%s).db
   ```
3. **Decompress and restore the latest backup**:
   ```bash
   gunzip -c /var/backups/tnpsc/tnpsc_latest.db.gz > /opt/tnpsc-companion/backend/data/tnpsc_productivity.db
   chmod 664 /opt/tnpsc-companion/backend/data/tnpsc_productivity.db
   ```
4. **Verify integrity and foreign keys**:
   ```bash
   sqlite3 /opt/tnpsc-companion/backend/data/tnpsc_productivity.db "PRAGMA integrity_check;"
   sqlite3 /opt/tnpsc-companion/backend/data/tnpsc_productivity.db "PRAGMA foreign_key_check;"
   ```
5. **Restart the backend service**:
   ```bash
   docker compose start backend
   curl -f http://localhost:8000/health
   ```

---

## 4. Alembic Migration Rollback Procedures

If an Alembic migration fails during a staging or production rollout:

### Check Current Migration Revision
```bash
cd backend
alembic current
```

### Rollback One Revision
```bash
alembic downgrade -1
```

### Rollback to a Specific Revision
```bash
alembic downgrade <revision_id>
```

Always verify application health and run the Pytest verification suite after any schema downgrade.
