import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'properties.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SEED_FILE = path.join(__dirname, '..', 'public', 'properties.json');

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Detroit2026!';

async function ensureDb() {
  await fs.ensureDir(DATA_DIR);
  const exists = await fs.pathExists(DB_FILE);
  if (!exists) {
    // If there's a seed file (the public/properties.json), copy it
    if (await fs.pathExists(SEED_FILE)) {
      const seed = await fs.readFile(SEED_FILE, 'utf8');
      await fs.writeFile(DB_FILE, seed, 'utf8');
      console.log('Database initialized from seed');
    } else {
      await fs.writeFile(DB_FILE, '[]', 'utf8');
      console.log('Empty database created');
    }
  }
  // Ensure users file exists (create default admin user if absent)
  const usersExists = await fs.pathExists(USERS_FILE);
  if (!usersExists) {
    const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
    const users = [ { username: ADMIN_USER, passwordHash } ];
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
    console.log('Created default admin user');
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

async function readUsers() {
  await ensureDb();
  const raw = await fs.readFile(USERS_FILE, 'utf8');
  return JSON.parse(raw || '[]');
}

async function writeDb(data) {
  await fs.ensureDir(DATA_DIR);
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET all properties
app.get('/api/properties', async (req, res) => {
  try {
    const data = await readDb();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read properties' });
  }
});

// GET one property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const data = await readDb();
    const item = data.find(p => p.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read properties' });
  }
});

// POST create
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
    const users = await readUsers();
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ token, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/properties', requireAuth, async (req, res) => {
  try {
    const data = await readDb();
    const incoming = req.body || {};
    const id = nanoid();
    const created = { ...incoming, id };
    data.push(created);
    await writeDb(data);
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create property' });
  }
});

// PUT update
app.put('/api/properties/:id', requireAuth, async (req, res) => {
  try {
    const data = await readDb();
    const idx = data.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const updated = { ...data[idx], ...req.body, id: req.params.id };
    data[idx] = updated;
    await writeDb(data);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE
app.delete('/api/properties/:id', requireAuth, async (req, res) => {
  try {
    const data = await readDb();
    const filtered = data.filter(p => p.id !== req.params.id);
    await writeDb(filtered);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
