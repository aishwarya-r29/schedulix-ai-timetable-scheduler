import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ObjectId } from 'mongodb';
import { USERS, SUBJECTS, CLASSROOMS, FACULTIES, STUDENTS, DEPARTMENTS } from './seedData.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'schedulix';
const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('Schedulix API Server is Running');
});

let db;
let usersCollection;
let timetablesCollection;
let subjectsCollection;
let classroomsCollection;
let facultiesCollection;
let studentsCollection;
let departmentsCollection;
let groupsCollection;

async function connectDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  usersCollection = db.collection('users');
  timetablesCollection = db.collection('timetables');
  subjectsCollection = db.collection('subjects');
  classroomsCollection = db.collection('classrooms');
  facultiesCollection = db.collection('faculties');
  studentsCollection = db.collection('students');
  departmentsCollection = db.collection('departments');
  groupsCollection = db.collection('groups');

  await seedCollections();
}

async function seedCollections() {
  const usersCount = await usersCollection.countDocuments();
  if (usersCount === 0) {
    await usersCollection.insertMany(USERS);
    console.log(`Seeded ${USERS.length} users`);
  }

  const facultiesCount = await facultiesCollection.countDocuments();
  if (facultiesCount === 0) {
    await facultiesCollection.insertMany(FACULTIES);
    console.log(`Seeded ${FACULTIES.length} faculties`);
  }

  const studentsCount = await studentsCollection.countDocuments();
  if (studentsCount === 0) {
    await studentsCollection.insertMany(STUDENTS);
    console.log(`Seeded ${STUDENTS.length} students`);
  }

  const subjectsCount = await subjectsCollection.countDocuments();
  if (subjectsCount === 0) {
    await subjectsCollection.insertMany(SUBJECTS);
    console.log(`Seeded ${SUBJECTS.length} subjects`);
  }

  const classroomsCount = await classroomsCollection.countDocuments();
  if (classroomsCount === 0) {
    await classroomsCollection.insertMany(CLASSROOMS);
    console.log(`Seeded ${CLASSROOMS.length} classrooms`);
  }

  const departmentsCount = await departmentsCollection.countDocuments();
  if (departmentsCount === 0) {
    await departmentsCollection.insertMany(DEPARTMENTS);
    console.log(`Seeded ${DEPARTMENTS.length} departments`);
  }

  const groupsCount = await groupsCollection.countDocuments();
  if (groupsCount === 0) {
    const { GROUPS } = await import('./seedData.js'); // Assuming GROUPS might be added to seedData
    if (GROUPS) {
      await groupsCollection.insertMany(GROUPS);
      console.log(`Seeded ${GROUPS.length} groups`);
    }
  }
}

// ─── Auth ──────────────────────────────────────────────────────────────────────

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const user = await usersCollection.findOne({ email, password });
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await usersCollection.findOne({ id });
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// ─── Timetables ────────────────────────────────────────────────────────────────

app.get('/api/timetables', async (req, res) => {
  const { department, section, facultyId } = req.query;
  if (facultyId) {
    const timetables = await timetablesCollection.find({ 'entries.facultyId': facultyId }).toArray();
    return res.json(timetables);
  }
  if (department && section) {
    const timetable = await timetablesCollection.findOne({ department, section });
    return res.json(timetable || null);
  }
  if (department) {
    const timetables = await timetablesCollection.find({ department }).toArray();
    return res.json(timetables);
  }
  const timetables = await timetablesCollection.find().toArray();
  res.json(timetables);
});

app.post('/api/timetables', async (req, res) => {
  const timetable = req.body;
  if (!timetable || !timetable.department || !timetable.section)
    return res.status(400).json({ error: 'Timetable data must include department and section.' });
  const now = new Date();
  const { createdAt, _id, ...cleanTimetable } = timetable; // Remove existing createdAt and _id
  const timetableData = { ...cleanTimetable, lastUpdated: now };
  
  console.log(`[Timetable] Storing for ${timetable.department} ${timetable.section}...`);
  
  try {
    const result = await timetablesCollection.updateOne(
      { department: timetable.department, section: timetable.section },
      { 
        $set: timetableData,
        $setOnInsert: { createdAt: now }
      },
      { upsert: true }
    );
    console.log(`[Timetable] Successfully stored. Matched: ${result.matchedCount}, Upserted: ${result.upsertedCount}`);
    res.json({ success: true, timetable: { ...timetableData, createdAt: createdAt || now } });
  } catch (error) {
    console.error(`[Timetable] Error storing:`, error);
    res.status(500).json({ error: 'Failed to store timetable' });
  }
});
app.delete('/api/timetables', async (req, res) => {
  try {
    const { department, section } = req.query;
    if (!department || !section) return res.status(400).json({ error: 'Department and section are required.' });
    console.log(`[Timetable] Deleting for ${department} ${section}...`);
    const result = await timetablesCollection.deleteOne({ department, section });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Faculties ─────────────────────────────────────────────────────────────────

app.get('/api/faculties', async (req, res) => {
  const { department } = req.query;
  const filter = department ? { department } : {};
  const faculties = await facultiesCollection.find(filter).toArray();
  res.json(faculties);
});

app.post('/api/faculties', async (req, res) => {
  try {
    const faculty = req.body;
    if (!faculty.name || !faculty.email) return res.status(400).json({ error: 'Name and email are required.' });
    const exists = await facultiesCollection.findOne({ email: faculty.email });
    if (exists) return res.status(409).json({ error: 'A faculty member with this email already exists.' });
    const id = faculty.id || `f${Date.now()}`;
    const userId = faculty.userId || `u_${id}`;
    const newFaculty = { ...faculty, id, userId, createdAt: new Date() };
    await facultiesCollection.insertOne(newFaculty);
    
    // Sync to users collection
    await usersCollection.insertOne({
      id: userId,
      name: faculty.name,
      email: faculty.email,
      password: faculty.password || 'faculty123',
      role: faculty.isHOD ? 'hod' : 'faculty',
      department: faculty.department
    });

    res.status(201).json({ success: true, faculty: newFaculty });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/faculties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!updates.name || !updates.email) return res.status(400).json({ error: 'Name and email are required.' });
    const result = await facultiesCollection.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Faculty not found.' });

    // Sync to users collection
    await usersCollection.updateOne(
      { id: updates.userId || `u_${id}` },
      { $set: {
        name: updates.name,
        email: updates.email,
        role: updates.isHOD ? 'hod' : 'faculty',
        department: updates.department
      }}
    );

    res.json({ success: true, faculty: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/faculties/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Faculty] Deleting ID: ${id}`);
    const faculty = await facultiesCollection.findOne({ id });
    const result = await facultiesCollection.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Faculty not found.' });
    
    // Sync to users collection
    if (faculty && faculty.userId) {
      await usersCollection.deleteOne({ id: faculty.userId });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Students ──────────────────────────────────────────────────────────────────

app.get('/api/students', async (req, res) => {
  const { department, section } = req.query;
  const filter = {};
  if (department) filter.department = department;
  if (section) filter.section = section;
  const students = await studentsCollection.find(filter).toArray();
  res.json(students);
});

app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    if (!student.name || !student.rollNumber) return res.status(400).json({ error: 'Name and roll number are required.' });
    const exists = await studentsCollection.findOne({ rollNumber: student.rollNumber });
    if (exists) return res.status(409).json({ error: 'Roll number already exists.' });
    const emailExists = await studentsCollection.findOne({ email: student.email });
    if (emailExists) return res.status(409).json({ error: 'Email already exists.' });
    const id = `s_${student.rollNumber}`;
    const newStudent = { ...student, id, userId: student.rollNumber, createdAt: new Date() };
    await studentsCollection.insertOne(newStudent);
    
    // Sync to users collection
    await usersCollection.insertOne({
      id: student.rollNumber,
      name: student.name,
      email: student.email,
      password: student.password || 'student123',
      role: 'student',
      department: student.department,
      section: student.section,
      group: student.group
    });

    res.status(201).json({ success: true, student: newStudent });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (!updates.name || !updates.rollNumber) return res.status(400).json({ error: 'Name and roll number are required.' });
    const result = await studentsCollection.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Student not found.' });

    // Sync to users collection
    await usersCollection.updateOne(
      { id: updates.rollNumber || id.replace('s_', '') },
      { $set: {
        name: updates.name,
        email: updates.email,
        department: updates.department,
        section: updates.section,
        group: updates.group
      }}
    );

    res.json({ success: true, student: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Student] Deleting ID: ${id}`);
    const student = await studentsCollection.findOne({ id });
    const result = await studentsCollection.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Student not found.' });

    // Sync to users collection
    if (student && student.userId) {
      await usersCollection.deleteOne({ id: student.userId });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Subjects ──────────────────────────────────────────────────────────────────

app.get('/api/subjects', async (_req, res) => {
  const subjects = await subjectsCollection.find().toArray();
  res.json(subjects);
});

app.post('/api/subjects', async (req, res) => {
  try {
    const subject = req.body;
    if (!subject.subjectName || !subject.subjectCode) return res.status(400).json({ error: 'Name and code are required.' });
    const exists = await subjectsCollection.findOne({ subjectCode: subject.subjectCode });
    if (exists) return res.status(409).json({ error: 'Subject code already exists.' });
    const newSubject = { ...subject, id: subject.subjectCode, createdAt: new Date() };
    await subjectsCollection.insertOne(newSubject);
    res.status(201).json({ success: true, subject: newSubject });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await subjectsCollection.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ success: true, subject: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Subject] Deleting ID: ${id}`);
    const result = await subjectsCollection.deleteOne({ id });
    console.log(`[Subject] Delete result:`, result);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Subject not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Classrooms ────────────────────────────────────────────────────────────────

app.get('/api/classrooms', async (_req, res) => {
  const classrooms = await classroomsCollection.find().toArray();
  res.json(classrooms);
});

app.post('/api/classrooms', async (req, res) => {
  try {
    const classroom = req.body;
    if (!classroom.classroomNumber) return res.status(400).json({ error: 'Room number is required.' });
    const exists = await classroomsCollection.findOne({
      classroomNumber: { $regex: new RegExp(`^${classroom.classroomNumber}$`, 'i') }
    });
    if (exists) return res.status(409).json({ error: 'A classroom with this room number already exists.' });
    const id = `cr${Date.now()}`;
    const newClassroom = { ...classroom, id, createdAt: new Date() };
    await classroomsCollection.insertOne(newClassroom);
    res.status(201).json({ success: true, classroom: newClassroom });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const result = await classroomsCollection.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ error: 'Classroom not found.' });
    res.json({ success: true, classroom: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/classrooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Classroom] Deleting ID: ${id}`);
    const result = await classroomsCollection.deleteOne({ id });
    console.log(`[Classroom] Delete result:`, result);
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Classroom not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Departments ─────────────────────────────────────────────────────────────
app.get('/api/departments', async (req, res) => {
  try {
    const depts = await departmentsCollection.find({}).toArray();
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/departments', async (req, res) => {
  try {
    const dept = req.body;
    if (!dept.id || !dept.name) return res.status(400).json({ error: 'ID and Name are required.' });
    const exists = await departmentsCollection.findOne({ id: dept.id });
    if (exists) return res.status(409).json({ error: 'Department ID already exists.' });
    await departmentsCollection.insertOne(dept);
    res.status(201).json({ success: true, department: dept });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === 'CSE' || id === 'IT') return res.status(403).json({ error: 'Core departments cannot be deleted.' });
    const result = await departmentsCollection.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Department not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Groups ──────────────────────────────────────────────────────────────────

app.get('/api/groups', async (req, res) => {
  try {
    const groups = await groupsCollection.find({}).toArray();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const group = req.body;
    if (!group.id || !group.name) return res.status(400).json({ error: 'ID and Name are required.' });
    await groupsCollection.updateOne(
      { id: group.id },
      { $set: group },
      { upsert: true }
    );
    res.status(201).json({ success: true, group });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await groupsCollection.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Group not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ─────────────────────────────────────────────────────────────────────

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Schedulix server listening at http://localhost:${PORT}`);
      console.log(`MongoDB: ${MONGODB_URI}/${DB_NAME}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
