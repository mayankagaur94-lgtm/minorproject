const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env file');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Clear existing collections
    const collections = ['users', 'students', 'marks', 'placements', 'faculty', 'subjects', 'attendance'];
    for (const colName of collections) {
      try {
        await mongoose.connection.db.dropCollection(colName);
        console.log(`Dropped collection: ${colName}`);
      } catch (e) {
        // Collection might not exist, ignore
      }
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    const studentPassword = await bcrypt.hash('Student@123', 10);

    // 1. Users
    const users = [
      { name: 'Dr. Admin Singh', email: 'admin@university.edu', password_hash: hashedPassword, role: 'admin', department: 'Administration' },
      { name: 'Aarav Sharma', email: 'student@university.edu', password_hash: studentPassword, role: 'student', department: 'CSE' }
    ];
    await mongoose.connection.db.collection('users').insertMany(users);

    // 2. Students
    const students = [
      { roll_no: 'CSE2021001', name: 'Aarav Sharma', department: 'CSE', year: 3, semester: 5, cgpa: 8.5, status: 'active', gender: 'Male', email: 'student@university.edu' },
      { roll_no: 'CSE2021002', name: 'Priya Gupta', department: 'CSE', year: 3, semester: 5, cgpa: 7.2, status: 'active', gender: 'Female', email: 'priya@university.edu' },
      { roll_no: 'ME2021001', name: 'Rohit Verma', department: 'ME', year: 3, semester: 5, cgpa: 6.8, status: 'active', gender: 'Male', email: 'rohit@university.edu' }
    ];
    await mongoose.connection.db.collection('students').insertMany(students);

    // 3. Marks
    const marks = [
      { student_roll: 'CSE2021001', subject_code: 'CS301', exam_type: 'end_sem', marks_obtained: 85, max_marks: 100, grade: 'A' },
      { student_roll: 'CSE2021002', subject_code: 'CS301', exam_type: 'end_sem', marks_obtained: 25, max_marks: 100, grade: 'F' }
    ];
    await mongoose.connection.db.collection('marks').insertMany(marks);

    // 4. Placements
    const placements = [
      { student_roll: 'CSE2021001', company: 'Google', package_lpa: 32, role: 'SDE-1', status: 'confirmed' },
      { student_roll: 'ME2021001', company: 'TATA Motors', package_lpa: 12, role: 'Junior Engineer', status: 'confirmed' }
    ];
    await mongoose.connection.db.collection('placements').insertMany(placements);

    console.log('Seeding complete! Atlas is ready.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
