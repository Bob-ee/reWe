import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'properties.json');
const SEED_FILE = path.join(__dirname, '..', 'public', 'properties.json');

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
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(DB_FILE, 'utf8');
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
app.post('/api/properties', async (req, res) => {
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
app.put('/api/properties/:id', async (req, res) => {
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
app.delete('/api/properties/:id', async (req, res) => {
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
