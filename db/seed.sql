-- Seed Data for University Management System

-- Departments
INSERT INTO departments (name, head_of_dept) VALUES ('Computer Science', 'Dr. Sharma');
INSERT INTO departments (name, head_of_dept) VALUES ('Mechanical Engineering', 'Dr. Verma');
INSERT INTO departments (name, head_of_dept) VALUES ('Electronics', 'Dr. Gupta');

-- Students (CSE)
INSERT INTO students (name, email, dept_id, year, semester, roll_no) VALUES ('Rahul Kumar', 'rahul@example.com', 1, 3, 6, 'CSE001');
INSERT INTO students (name, email, dept_id, year, semester, roll_no) VALUES ('Priya Singh', 'priya@example.com', 1, 3, 6, 'CSE002');
INSERT INTO students (name, email, dept_id, year, semester, roll_no) VALUES ('Amit Patel', 'amit@example.com', 1, 4, 8, 'CSE003');
INSERT INTO students (name, email, dept_id, year, semester, roll_no) VALUES ('Sneha Sharma', 'sneha@example.com', 1, 2, 4, 'CSE004');

-- Students (Mechanical)
INSERT INTO students (name, email, dept_id, year, semester, roll_no) VALUES ('Vikram Rao', 'vikram@example.com', 2, 3, 6, 'ME001');

-- Attendance
INSERT INTO attendance (student_id, subject, percentage) VALUES (1, 'DBMS', 85.5);
INSERT INTO attendance (student_id, subject, percentage) VALUES (1, 'OS', 72.0);
INSERT INTO attendance (student_id, subject, percentage) VALUES (2, 'DBMS', 90.0);
INSERT INTO attendance (student_id, subject, percentage) VALUES (2, 'OS', 78.5);
INSERT INTO attendance (student_id, subject, percentage) VALUES (3, 'AI', 65.0);
INSERT INTO attendance (student_id, subject, percentage) VALUES (4, 'DS', 92.0);

-- Marks
INSERT INTO marks (student_id, subject, marks_obtained, total_marks, semester) VALUES (1, 'DBMS', 78, 100, 6);
INSERT INTO marks (student_id, subject, marks_obtained, total_marks, semester) VALUES (1, 'OS', 45, 100, 6);
INSERT INTO marks (student_id, subject, marks_obtained, total_marks, semester) VALUES (2, 'DBMS', 88, 100, 6);
INSERT INTO marks (student_id, subject, marks_obtained, total_marks, semester) VALUES (3, 'AI', 32, 100, 8);
INSERT INTO marks (student_id, subject, marks_obtained, total_marks, semester) VALUES (4, 'DS', 95, 100, 4);

-- Placements
INSERT INTO placements (student_id, company, package_lpa) VALUES (3, 'Google', 45.5);
INSERT INTO placements (student_id, company, package_lpa) VALUES (1, 'TCS', 7.5);
INSERT INTO placements (student_id, company, package_lpa) VALUES (2, 'Microsoft', 38.0);

-- Users
-- Password is 'password' hashed (simplified for seed)
INSERT INTO users (name, email, password, role) VALUES ('Admin User', 'admin@university.com', 'admin123', 'admin');
INSERT INTO users (name, email, password, role) VALUES ('Prof. Sharma', 'sharma@university.com', 'prof123', 'faculty');
INSERT INTO users (name, email, password, role) VALUES ('Rahul Kumar', 'rahul@example.com', 'rahul123', 'student');
