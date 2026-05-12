import os
import random
from pymongo import MongoClient
from faker import Faker
from dotenv import load_dotenv

# Load environment variables from server/.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', 'server', '.env'))

MONGO_URI = os.getenv("MONGODB_URI")
if not MONGO_URI:
    print("Error: MONGODB_URI not found in server/.env")
    exit(1)

client = MongoClient(MONGO_URI)
db = client.get_database("university_db")
fake = Faker()

def seed_data():
    print("Seeding university data...")
    # University Info
    db.university.delete_many({})
    db.university.insert_one({
        "name": "Global Tech University",
        "location": "New Delhi, India",
        "established": 1995,
        "contact": "info@gtu.edu.in",
        "website": "www.gtu.edu.in"
    })

    # Colleges
    print("Seeding colleges...")
    db.colleges.delete_many({})
    colleges = [
        {"name": "School of Engineering", "code": "SOE", "dean": "Dr. Ramesh Kumar"},
        {"name": "School of Management", "code": "SOM", "dean": "Dr. Anita Sharma"},
        {"name": "School of Arts", "code": "SOA", "dean": "Dr. Sanjay Gupta"}
    ]
    db.colleges.insert_many(colleges)

    # Departments
    departments = ["CSE", "ECE", "ME", "MBA", "BBA", "Psychology", "History"]

    # Faculty
    print("Seeding faculty...")
    db.faculty.delete_many({})
    faculty_list = []
    for _ in range(20):
        faculty_list.append({
            "name": fake.name(),
            "department": random.choice(departments),
            "designation": random.choice(["Professor", "Assistant Professor", "Associate Professor"]),
            "experience_yrs": random.randint(5, 25),
            "email": fake.email()
        })
    db.faculty.insert_many(faculty_list)

    # Students
    print("Seeding students...")
    db.students.delete_many({})
    students = []
    for i in range(100):
        students.append({
            "roll_no": f"GTU2024{i:03d}",
            "name": fake.name(),
            "department": random.choice(departments),
            "year": random.randint(1, 4),
            "semester": random.randint(1, 8),
            "cgpa": round(random.uniform(6.0, 9.8), 2),
            "status": "Active",
            "gender": random.choice(["Male", "Female", "Other"]),
            "email": fake.email()
        })
    db.students.insert_many(students)

    # Bus Services
    print("Seeding bus services...")
    db.bus.delete_many({})
    buses = [
        {"route_no": "R101", "driver": "Ram Singh", "contact": "9876543210", "route": "Main Campus to Sector 62", "timing": "8:00 AM"},
        {"route_no": "R202", "driver": "Mohan Lal", "contact": "9876543211", "route": "Hostel to Main Campus", "timing": "8:30 AM"},
        {"route_no": "R303", "driver": "Suresh", "contact": "9876543212", "route": "City Center to University", "timing": "7:45 AM"}
    ]
    db.bus.insert_many(buses)

    # Mess Menu
    print("Seeding mess menu...")
    db.mess.delete_many({})
    mess_data = [
        {"day": "Monday", "breakfast": "Poha, Tea", "lunch": "Dal Tadka, Rice, Roti, Salad", "dinner": "Paneer Butter Masala, Roti, Sweet"},
        {"day": "Tuesday", "breakfast": "Aloo Paratha, Curd", "lunch": "Rajma, Chawal, Mix Veg", "dinner": "Chicken Curry / Veg Kofta, Roti, Rice"},
        {"day": "Wednesday", "breakfast": "Idli, Sambhar", "lunch": "Chole Bhature, Lassi", "dinner": "Veg Biryani, Raita, Gulab Jamun"}
    ]
    db.mess.insert_many(mess_data)

    # Hostel Info
    print("Seeding hostel info...")
    db.hostel.delete_many({})
    hostels = [
        {"name": "Aryabhatta Hostel", "type": "Boys", "capacity": 500, "warden": "Mr. Vikram", "fee_per_sem": 45000},
        {"name": "Gargi Hostel", "type": "Girls", "capacity": 400, "warden": "Ms. Sunita", "fee_per_sem": 45000},
        {"name": "CV Raman Hostel", "type": "Boys", "capacity": 300, "warden": "Mr. Rajesh", "fee_per_sem": 55000}
    ]
    db.hostel.insert_many(hostels)

    # Admissions
    print("Seeding admissions...")
    db.admissions.delete_many({})
    admissions = [
        {"course": "B.Tech CSE", "intake": 120, "last_date": "2024-07-15", "eligibility": "12th Pass with PCM (Min 60%)", "fee_annual": 150000},
        {"course": "MBA", "intake": 60, "last_date": "2024-06-30", "eligibility": "Graduation with CAT/MAT score", "fee_annual": 200000},
        {"course": "BA Psychology", "intake": 40, "last_date": "2024-08-01", "eligibility": "12th Pass (Min 50%)", "fee_annual": 80000}
    ]
    db.admissions.insert_many(admissions)

    print("Data seeding completed successfully!")

if __name__ == "__main__":
    seed_data()
