import sqlite3
import os
import sys

def inspect_db():
    db_path = os.path.abspath('data/tnpsc_productivity.db')
    print("Database path:", db_path)
    print("Exists:", os.path.exists(db_path))
    if not os.path.exists(db_path):
        print("ERROR: Database file does not exist!")
        return 1

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Get tables
    tables = [row[0] for row in c.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;").fetchall()]
    print(f"\nFound {len(tables)} tables:")
    for t in tables:
        count = c.execute(f"SELECT count(*) FROM {t};").fetchone()[0]
        print(f"  - {t}: {count} rows")

    # Check foreign keys
    fk_errors = c.execute("PRAGMA foreign_key_check;").fetchall()
    print(f"\nForeign key integrity violations: {len(fk_errors)}")
    if fk_errors:
        for err in fk_errors[:5]:
            print("  Violation:", err)

    # Check quick integrity
    integrity = c.execute("PRAGMA integrity_check;").fetchall()
    print("Integrity check result:", integrity)

    conn.close()
    return 0

if __name__ == '__main__':
    sys.exit(inspect_db())
