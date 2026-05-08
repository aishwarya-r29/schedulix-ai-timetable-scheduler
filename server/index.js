import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import { USERS, SUBJECTS, CLASSROOMS } from './seedData.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = process.env.DB_NAME || 'schedulix';
const PORT = process.env.PORT || 4000;

let db;
let usersCollection;
let timetablesCollection;
let subjectsCollection;
let classroomsCollection;

async function connectDatabase() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  usersCollection = db.collection('users');
  timetablesCollection = db.collection('timetables');
  subjectsCollection = db.collection('subjects');
  classroomsCollection = db.collection('classrooms');

  await seedCollections();
}

async function seedCollections() {
  const usersCount = await usersCollection.countDocuments();
  if (usersCount === 0) {
    await usersCollection.insertMany(USERS);
    console.log(`Seeded ${USERS.length} users`);
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
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await usersCollection.findOne({ email, password });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const user = await usersCollection.findOne({ id });
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

app.get('/api/timetables', async (req, res) => {
  const { department, section } = req.query;
  if (!department || !section) {
    return res.status(400).json({ error: 'Department and section are required.' });
  }

  const timetable = await timetablesCollection.findOne({ department, section });
  res.json(timetable || null);
});

app.post('/api/timetables', async (req, res) => {
  const timetable = req.body;

  if (!timetable || !timetable.department || !timetable.section) {
    return res.status(400).json({ error: 'Timetable data must include department and section.' });
  }

  await timetablesCollection.updateOne(
    { department: timetable.department, section: timetable.section },
    { $set: timetable },
    { upsert: true }
  );

  res.json({ success: true, timetable });
});

app.get('/api/subjects', async (_req, res) => {
  const subjects = await subjectsCollection.find().toArray();
  res.json(subjects);
});

app.get('/api/classrooms', async (_req, res) => {
  const classrooms = await classroomsCollection.find().toArray();
  res.json(classrooms);
});

connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Schedulix server listening at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
