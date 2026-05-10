-- Schema for University Management System

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    head_of_dept TEXT
);

-- Students
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    dept_id INTEGER,
    year INTEGER,
    semester INTEGER,
    roll_no TEXT UNIQUE,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- Faculty
CREATE TABLE IF NOT EXISTS faculty (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    dept_id INTEGER,
    designation TEXT,
    FOREIGN KEY (dept_id) REFERENCES departments(id)
);

-- Marks
CREATE TABLE IF NOT EXISTS marks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject TEXT,
    marks_obtained INTEGER,
    total_marks INTEGER DEFAULT 100,
    semester INTEGER,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    subject TEXT,
    percentage REAL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Placements
CREATE TABLE IF NOT EXISTS placements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    company TEXT,
    package_lpa REAL,
    status TEXT DEFAULT 'Placed',
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Users (for Auth)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'faculty', 'student')) DEFAULT 'student'
);

-- Chats
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT,
    role TEXT CHECK(role IN ('user', 'assistant')),
    content TEXT,
    sql_query TEXT,
    results TEXT, -- JSON string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_id) REFERENCES chats(id)
);
