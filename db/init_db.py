import sqlite3
import os

db_path = 'university.db'

def init_db():
    if os.path.exists(db_path):
        os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Read and execute schema
    with open('schema.sql', 'r') as f:
        schema = f.read()
        cursor.executescript(schema)
    
    # Read and execute seed data
    with open('seed.sql', 'r') as f:
        seed = f.read()
        cursor.executescript(seed)
    
    conn.commit()
    conn.close()
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_db()
