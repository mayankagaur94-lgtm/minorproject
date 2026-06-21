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
fake = Faker('en_IN')

DEPARTMENTS = {
    "B.Tech CSE": {"years": 4, "semesters": 8, "lateral_entry": True},
    "B.Tech Civil": {"years": 4, "semesters": 8, "lateral_entry": True},
    "BCA": {"years": 3, "semesters": 6, "lateral_entry": False},
    "B.Sc Nursing": {"years": 4, "semesters": 8, "lateral_entry": False},
    "BHM": {"years": 4, "semesters": 8, "lateral_entry": False},
    "Biotech": {"years": 4, "semesters": 8, "lateral_entry": False},
    "Microbiology": {"years": 3, "semesters": 6, "lateral_entry": False},
    "B.Com": {"years": 3, "semesters": 6, "lateral_entry": False},
    "M.Com": {"years": 2, "semesters": 4, "lateral_entry": False},
    "BMLT": {"years": 3, "semesters": 6, "lateral_entry": False},
    "B.Sc Agriculture": {"years": 4, "semesters": 8, "lateral_entry": False},
    "MBA": {"years": 2, "semesters": 4, "lateral_entry": False}
}

SUBJECTS_BY_DEPT = {
    "B.Tech CSE": ["CS101-Data Structures", "CS102-DBMS", "CS103-OS", "CS104-Networks", "CS105-AI", "MAT201-Maths III"],
    "B.Tech Civil": ["CE101-Surveying", "CE102-Structures", "CE103-Concrete", "CE104-Geotech", "MAT201-Maths III"],
    "BCA": ["BCA101-C Programming", "BCA102-Web Dev", "BCA103-Java", "BCA104-DBMS"],
    "B.Sc Nursing": ["NUR101-Anatomy", "NUR102-Physiology", "NUR103-Microbiology", "NUR104-Community Health"],
    "BHM": ["BHM101-Food Production", "BHM102-Housekeeping", "BHM103-Front Office", "BHM104-F&B Service"],
    "Biotech": ["BT101-Biochemistry", "BT102-Genetics", "BT103-Cell Biology", "BT104-Immunology"],
    "Microbiology": ["MB101-Bacteriology", "MB102-Virology", "MB103-Mycology", "MB104-Parasitology"],
    "B.Com": ["BCOM101-Accounting", "BCOM102-Business Law", "BCOM103-Economics", "BCOM104-Statistics"],
    "M.Com": ["MCOM101-Adv Accounting", "MCOM102-Taxation", "MCOM103-Auditing", "MCOM104-Finance"],
    "BMLT": ["BMLT101-Hematology", "BMLT102-Pathology", "BMLT103-Biochemistry Lab", "BMLT104-Microbiology Lab"],
    "B.Sc Agriculture": ["AGR101-Agronomy", "AGR102-Soil Science", "AGR103-Entomology", "AGR104-Plant Pathology"],
    "MBA": ["MBA101-Marketing", "MBA102-HR Management", "MBA103-Business Analytics", "MBA104-Finance"]
}

def seed_data():
    print("=" * 60)
    print("  EXTENDED DATABASE SEEDING - University AI Assistant")
    print("=" * 60)

    # 1. University Info
    print("\n[1/8] Seeding university info...")
    db.university.delete_many({})
    db.university.insert_one({
        "name": "Global Tech University",
        "location": "New Delhi, India",
        "established": 1995,
        "contact": "info@gtu.edu.in",
        "website": "www.gtu.edu.in"
    })

    # 2. Colleges
    print("[2/8] Seeding colleges...")
    db.colleges.delete_many({})
    db.colleges.insert_many([
        {"name": "School of Engineering & Technology", "code": "SOET", "dean": "Dr. Ramesh Kumar"},
        {"name": "School of Medical Sciences", "code": "SOMS", "dean": "Dr. Anita Sharma"},
        {"name": "School of Commerce & Management", "code": "SCM", "dean": "Dr. Sanjay Gupta"},
        {"name": "School of Agriculture", "code": "SOA", "dean": "Dr. Pradeep Singh"},
        {"name": "School of Hospitality", "code": "SOH", "dean": "Dr. Meena Verma"},
        {"name": "School of Life Sciences", "code": "SLS", "dean": "Dr. Arvind Patel"}
    ])

    # 3. Students
    print("[3/8] Seeding students (with lateral entry + backlogs)...")
    db.students.delete_many({})
    students = []
    student_meta = []

    for dept_name, info in DEPARTMENTS.items():
        num_students = random.randint(20, 35)
        for i in range(num_students):
            year = random.randint(1, info["years"])
            sem = (year * 2) - random.randint(0, 1)

            is_lateral = False
            if info["lateral_entry"] and year >= 2 and random.random() < 0.2:
                is_lateral = True

            has_backlog = random.random() < 0.15

            roll_prefix = dept_name.replace(".", "").replace(" ", "").upper()[:4]
            roll_no = f"GTU{roll_prefix}2024{i:03d}"

            student = {
                "roll_no": roll_no,
                "name": fake.name(),
                "department": dept_name,
                "year": year,
                "semester": sem,
                "cgpa": round(random.uniform(5.0, 9.8), 2) if not has_backlog else round(random.uniform(3.5, 5.5), 2),
                "status": "Active",
                "gender": random.choice(["Male", "Female"]),
                "email": fake.email(),
                "is_lateral_entry": is_lateral,
                "academic_status": "Backlog" if has_backlog else "Regular"
            }
            students.append(student)
            student_meta.append({"roll": roll_no, "dept": dept_name, "year": year, "backlog": has_backlog})

    db.students.insert_many(students)
    print(f"    -> {len(students)} students across {len(DEPARTMENTS)} departments")

    # 4. Marks
    print("[4/8] Seeding marks (including failures for backlogs)...")
    db.marks.delete_many({})
    marks_list = []

    for s in student_meta:
        subjects = SUBJECTS_BY_DEPT.get(s["dept"], ["GEN101-General"])
        for sub in random.sample(subjects, min(3, len(subjects))):
            sub_code = sub.split("-")[0]
            if s["backlog"]:
                score = random.randint(10, 32)
                grade = "F"
            else:
                score = random.randint(40, 98)
                grade = "A+" if score >= 90 else "A" if score >= 80 else "B+" if score >= 70 else "B" if score >= 60 else "C"
            marks_list.append({
                "student_roll": s["roll"],
                "subject_code": sub_code,
                "subject_name": sub.split("-")[1],
                "exam_type": random.choice(["Mid-Term", "End-Term"]),
                "marks_obtained": score,
                "max_marks": 100,
                "grade": grade,
                "semester": random.randint(1, 8)
            })

    db.marks.insert_many(marks_list)
    print(f"    -> {len(marks_list)} mark entries")

    # 5. Placements
    print("[5/8] Seeding placements...")
    db.placements.delete_many({})
    placements = []
    companies = [
        {"name": "Google", "min_pkg": 25, "max_pkg": 45},
        {"name": "Microsoft", "min_pkg": 20, "max_pkg": 40},
        {"name": "TCS", "min_pkg": 3.5, "max_pkg": 8},
        {"name": "Infosys", "min_pkg": 3.5, "max_pkg": 7},
        {"name": "Wipro", "min_pkg": 3.5, "max_pkg": 6},
        {"name": "Apollo Hospital", "min_pkg": 4, "max_pkg": 10},
        {"name": "ITC Hotels", "min_pkg": 3, "max_pkg": 8},
        {"name": "Taj Hotels", "min_pkg": 3.5, "max_pkg": 9},
        {"name": "Deloitte", "min_pkg": 8, "max_pkg": 18},
        {"name": "HDFC Bank", "min_pkg": 4, "max_pkg": 10}
    ]
    roles = ["Software Engineer", "Data Analyst", "Business Analyst", "Staff Nurse",
             "Hotel Manager", "Lab Technician", "Research Associate", "Agronomist", "Accountant"]

    final_year = [s for s in student_meta if s["year"] >= 3 and not s["backlog"]]
    for s in final_year:
        if random.random() < 0.55:
            comp = random.choice(companies)
            placements.append({
                "student_roll": s["roll"],
                "company": comp["name"],
                "package_lpa": round(random.uniform(comp["min_pkg"], comp["max_pkg"]), 1),
                "role": random.choice(roles),
                "status": random.choice(["Placed", "Placed", "Placed", "Offer Received"])
            })
    if placements:
        db.placements.insert_many(placements)
    print(f"    -> {len(placements)} placement records")

    # 6. Faculty
    print("[6/8] Seeding faculty...")
    db.faculty.delete_many({})
    faculty_list = []
    for dept in DEPARTMENTS.keys():
        for _ in range(random.randint(3, 6)):
            faculty_list.append({
                "name": fake.name(),
                "department": dept,
                "designation": random.choice(["Professor", "Assistant Professor", "Associate Professor", "HOD"]),
                "experience_yrs": random.randint(2, 30),
                "email": fake.email()
            })
    db.faculty.insert_many(faculty_list)
    print(f"    -> {len(faculty_list)} faculty members")

    # 7. Admissions
    print("[7/8] Seeding admissions...")
    db.admissions.delete_many({})
    adm_list = []
    for dept, info in DEPARTMENTS.items():
        adm_list.append({
            "course": dept,
            "intake": random.choice([40, 60, 90, 120]),
            "last_date": "2024-08-30",
            "eligibility": "As per university norms",
            "fee_annual": random.randint(50000, 200000),
            "duration_years": info["years"],
            "total_semesters": info["semesters"],
            "lateral_entry_available": info["lateral_entry"]
        })
    db.admissions.insert_many(adm_list)

    # 8. Bus, Mess, Hostel
    print("[8/8] Seeding bus, mess, hostel...")
    db.bus.delete_many({})
    db.bus.insert_many([
        {"route_no": "R101", "driver": "Ram Singh", "contact": "9876543210", "route": "Main Campus to Sector 62", "timing": "8:00 AM"},
        {"route_no": "R202", "driver": "Mohan Lal", "contact": "9876543211", "route": "Hostel to Main Campus", "timing": "8:30 AM"},
        {"route_no": "R303", "driver": "Suresh", "contact": "9876543212", "route": "City Center to University", "timing": "7:45 AM"}
    ])

    db.mess.delete_many({})
    db.mess.insert_many([
        {"day": "Monday", "breakfast": "Poha, Tea", "lunch": "Dal Tadka, Rice, Roti, Salad", "dinner": "Paneer Butter Masala, Roti, Sweet"},
        {"day": "Tuesday", "breakfast": "Aloo Paratha, Curd", "lunch": "Rajma, Chawal, Mix Veg", "dinner": "Chicken Curry / Veg Kofta, Roti, Rice"},
        {"day": "Wednesday", "breakfast": "Idli, Sambhar", "lunch": "Chole Bhature, Lassi", "dinner": "Veg Biryani, Raita, Gulab Jamun"},
        {"day": "Thursday", "breakfast": "Bread, Butter, Omelette", "lunch": "Kadhi Chawal, Aloo Gobi", "dinner": "Malai Kofta, Naan, Kheer"},
        {"day": "Friday", "breakfast": "Upma, Chutney", "lunch": "Fish Curry / Soya Chunk, Rice", "dinner": "Butter Chicken / Paneer Tikka, Roti"},
        {"day": "Saturday", "breakfast": "Chole Bhature", "lunch": "Veg Pulao, Raita, Papad", "dinner": "Egg Curry / Matar Paneer, Roti, Halwa"},
        {"day": "Sunday", "breakfast": "Puri Sabzi, Lassi", "lunch": "Special Thali - Biryani, Raita, Sweet", "dinner": "Light Dinner - Soup, Sandwich, Fruits"}
    ])

    db.hostel.delete_many({})
    db.hostel.insert_many([
        {"name": "Aryabhatta Hostel", "type": "Boys", "capacity": 500, "warden": "Mr. Vikram", "fee_per_sem": 45000},
        {"name": "Gargi Hostel", "type": "Girls", "capacity": 400, "warden": "Ms. Sunita", "fee_per_sem": 45000},
        {"name": "CV Raman Hostel", "type": "Boys", "capacity": 300, "warden": "Mr. Rajesh", "fee_per_sem": 55000},
        {"name": "Savitribai Phule Hostel", "type": "Girls", "capacity": 350, "warden": "Ms. Kavita", "fee_per_sem": 50000}
    ])

    # Summary
    backlog_count = sum(1 for s in student_meta if s["backlog"])
    lateral_count = sum(1 for s in students if s.get("is_lateral_entry"))
    print("\n" + "=" * 60)
    print("  SEEDING COMPLETE!")
    print("=" * 60)
    print(f"  Students:        {len(students)}")
    print(f"  Departments:     {len(DEPARTMENTS)}")
    print(f"  Lateral Entry:   {lateral_count}")
    print(f"  With Backlogs:   {backlog_count}")
    print(f"  Marks:           {len(marks_list)}")
    print(f"  Placements:      {len(placements)}")
    print(f"  Faculty:         {len(faculty_list)}")
    print(f"  Mess (7 days):   7")
    print(f"  Hostels:         4")
    print("=" * 60)

if __name__ == "__main__":
    seed_data()
