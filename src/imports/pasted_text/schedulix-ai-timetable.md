Build a fully functional, production-level AI-powered university timetable scheduling web application titled “Schedulix – AI Timetable Scheduler”.

TECH STACK:

Frontend: HTML5, CSS3, Bootstrap 5, JavaScript
Backend: Node.js with Express.js
Database & Authentication: Supabase (PostgreSQL + Supabase Auth or JWT)
Export Features: jsPDF + SheetJS (Excel export)

GENERAL REQUIREMENTS:

Clean MVC architecture
Fully responsive modern UI
Production-level folder structure
Modular reusable components
RESTful APIs
Secure authentication & authorization
Use environment variables for secrets
Proper validation and error handling
Database consistency across all pages
Maintain scalable and clean codebase
Use async/await everywhere
Well-commented beginner-friendly code

🎨 UI / THEME:

Modern AI-inspired university ERP design
Theme colors:
Dark blue
Indigo
White
Soft gradients
Professional dashboard layouts
Glassmorphism + card-based UI
Smooth animations and transitions
Sidebar navigation for dashboards
Mobile responsive for all devices

🏫 APPLICATION TITLE:
“SCHEDULIX – AI TIMETABLE SCHEDULER”

👥 USER ROLES:

Admin
Faculty
Student

🏠 LANDING PAGE:
First page must contain:

Hero section
About Schedulix
Features section
AI Timetable explanation
Statistics section
Contact/Footer

Main center buttons:

Admin Login
Faculty Login
Student Login

Clicking each button redirects to separate login page.

IMPORTANT:

Do NOT display demo credentials anywhere in UI.
Credentials exist only in database/seed data.

🏛️ DEPARTMENTS & SECTIONS:

Departments:

CSE
IT

Sections:

CSE G1
CSE G2
IT G1
IT G2

Each section contains:

50 students
Semester: 4th Semester

👨‍💼 ADMIN SYSTEM:

Only 2 admins can login using predefined credentials.

Admin Credentials:
1.
Email: adminschedulix01@gmail.com

Password: adminsch123

Email: adminschedulix02@gmail.com

Password: adminsch456

Admin passwords must be hashed using bcrypt.

👨‍🏫 FACULTY SYSTEM:

Total Faculties: 20

10 CSE faculties
10 IT faculties

Each department also has:

1 HOD

Faculty login uses predefined credentials stored securely in database.

Faculty Credentials:

anu@gmail.com
 — anu_2016
arun@gmail.com
 — arun_2017
revathi@gmail.com
 — revathi_2018
kavi@gmail.com
 — kavi_2019
priya@gmail.com
 — priya_2020
ramesh@gmail.com
 — ramesh_2015
sneha@gmail.com
 — sneha_2016
vijay@gmail.com
 — vijay_2017
divya@gmail.com
 — divya_2018
karthik@gmail.com
 — karthik_2019
lakshmi@gmail.com
 — lakshmi_2020
mohan@gmail.com
 — mohan_2015
nithya@gmail.com
 — nithya_2016
prakash@gmail.com
 — prakash_2017
swetha@gmail.com
 — swetha_2018
deepak@gmail.com
 — deepak_2019
hari@gmail.com
 — hari_2020
meena@gmail.com
 — meena_2015
sanjay@gmail.com
 — sanjay_2016
shalini@gmail.com
 — shalini_2017

Passwords must be hashed before storing.

🎓 STUDENT SYSTEM:

Students login using predefined email and password.

Include all provided student credentials and store them securely in seed data.

Sections:

IT G1 → 24i201–24i250
IT G2 → 24i301–24i350
CSE G1 → 24z201–24z250
CSE G2 → 24z301–24z350

Each student record must contain:

Name
Roll number
Department
Semester
Section
Email
Password (hashed)

🔐 AUTHENTICATION REQUIREMENTS:

Email + Password authentication only
JWT authentication or Supabase Auth
Role-based access control
Middleware protection
Session persistence
Secure logout
Password hashing using bcrypt
Protected dashboard routes

🧑‍💼 ADMIN DASHBOARD MODULES:

A. FACULTY MANAGEMENT

Admin can:

Add faculty
Edit faculty
Delete faculty
Assign department
Assign subjects

Faculty Fields:

Faculty Name
Designation
Department
Subjects Handled (maximum 2)
Email
Password

Validation Rules:

One faculty can handle maximum 2 subjects
No duplicate email allowed

B. STUDENT MANAGEMENT

Admin can:

Add student
Delete student
Edit student details
Search/filter students

Student Fields:

Student Name
Roll Number
Department
Semester
Section
Email
Password

Semester:

Current semester = 4th Semester

C. SUBJECT MANAGEMENT

Admin can:

Add subjects
Remove subjects
Assign faculty to subjects

Subject Fields:

Subject Name
Subject Code
Credits
Assigned Faculties

Constraint:

One subject can be handled by maximum 3 faculties

D. CLASSROOM MANAGEMENT

Admin can:

Add classrooms
Update classroom status
Remove classrooms

Classroom Fields:

Classroom Number
Capacity
Availability Status

🤖 AI TIMETABLE GENERATION MODULE

Admin can automatically generate timetable.

Generation Steps:

Step 1:
Select Department

Step 2:
Select Semester

Step 3:
Select Section

Step 4:
System displays:

Subjects
Assigned Faculties

Step 5:
Admin selects faculties for each subject

Step 6:
AI engine generates timetable automatically.

📅 TIMETABLE RULES

Working Days:

Monday to Friday

Periods Per Day:

8 periods

Each Period:

40 minutes

Break Rules:

Two short breaks
One lunch break

📘 THEORY & LAB RULES

Daily Constraints:

5 theory classes
2 lab sessions

Lab Rules:

Labs must occupy 4 consecutive periods
Labs can be morning or evening only

Theory Rules:

Maximum 2 consecutive theory hours
Avoid repeated subjects in same day

🧠 AI GENERATION FEATURES

Implement intelligent timetable generation with:

Conflict resolution
Faculty clash prevention
Classroom clash prevention
Automatic room allocation
Even workload distribution
Balanced scheduling
No repeated timetable patterns
Dynamic slot allocation
Availability checking
HOD monitoring

Algorithm Requirements:

Constraint-based scheduling logic
Conflict-free allocation
Smart reshuffling when conflict occurs

📄 TIMETABLE FEATURES

Admin can:

Generate timetable
View timetable
Edit timetable manually
Print timetable
Download timetable
Export timetable as:
PDF
Excel

👨‍🏫 FACULTY MODULE

Faculty Dashboard Features:

A. VIEW OWN TIMETABLE

Faculty can view:

Subject
Section
Classroom
Time
Day

B. VIEW OTHER FACULTY TIMETABLE

Flow:

Select Department
Select Faculty
View timetable

C. VIEW CLASS TIMETABLE

Flow:

Select Department
Select Section
View class timetable

❌ CLASS CANCELLATION SYSTEM

Faculty can cancel class only if:

Minimum 1 hour prior notice

Effects:
Cancellation must reflect in:

Admin timetable
Faculty timetable
Student timetable
Other faculty views

Display:
Cancelled class cell must show:
“Cancelled”

Rules:

Cancellation valid for only one day
Next day timetable automatically restores

Export Condition:

Cancelled status should NOT appear in exported PDF/Excel

🎓 STUDENT MODULE

Student Features:

Login
View own timetable only
Download timetable
View cancelled classes dynamically

Restrictions:

Students cannot edit timetable
Students cannot cancel classes

📊 DASHBOARD ANALYTICS

Admin dashboard analytics:

Total students
Total faculty
Total classrooms
Total subjects
Total generated timetables
Faculty workload statistics
Classroom utilization charts

Use:

Chart.js or ApexCharts

🗄️ DATABASE DESIGN (SUPABASE)

Required Tables:

users
id (UUID)
name
email (unique)
password_hash
role (admin/faculty/student/hod)
department
created_at
students
id
user_id (FK)
roll_number
semester
section
faculties
id
user_id (FK)
designation
department
subjects
id
subject_name
subject_code
credits
department
semester
faculty_subjects
id
faculty_id
subject_id
classrooms
id
classroom_number
capacity
status
timetables
id
department
semester
section
generated_by
created_at
timetable_entries
id
timetable_id
day
period
subject_id
faculty_id
classroom_id
entry_type (theory/lab)
is_cancelled
cancellations
id
timetable_entry_id
cancelled_by
cancelled_date
reason

⚙️ BACKEND REQUIREMENTS

API Routes:

/auth
/admin
/faculty
/students
/subjects
/classrooms
/timetable
/cancellations

Middleware:

JWT authentication
Role authorization
Validation middleware
Error handling middleware

📁 PROJECT STRUCTURE

/public
/css
/js
/images

/routes
/controllers
/models
/middleware
/services
/utils
/config

/views

server.js

📥 EXPORT FEATURES

Allow exporting:

Timetable PDF
Timetable Excel
Faculty reports
Student reports

Libraries:

jsPDF
SheetJS

🧪 SEED DATA REQUIREMENTS

Provide:

All admin accounts
All faculty accounts
All student accounts
Sample classrooms
Sample subjects
Faculty-subject mappings

Seed database automatically.

🚨 IMPORTANT REQUIREMENTS

Provide FULL WORKING CODE
No partial implementation
Include:
Frontend
Backend
SQL schema
Seed scripts
API routes
Controllers
Middleware
Authentication
AI timetable algorithm
Export features
Setup instructions
.env example
Ensure:
No timetable conflicts
No duplicate allocations
Database consistency across all pages
Proper foreign key usage
Professional production-ready UI
Clean responsive dashboards
Fully functional login systems
Real-world deployment readiness