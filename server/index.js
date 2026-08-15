import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "data", "db.json");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const CLIENT_DIST = path.join(__dirname, "..", "dist");

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "africanpride2026";
const VOTE_PRICE = 100; // FCFA

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/* ---------- tiny JSON "database" ----------
   NOTE: this stores data in a local file. On Railway, the filesystem is
   ephemeral across redeploys unless you attach a persistent Volume
   (Settings → Volumes) mounted at, e.g., /app/server/data and
   /app/server/uploads. For a production launch, swap this for a real
   database (Railway offers a one-click Postgres addon) — the read/write
   functions below are the only place you'd need to change. */
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `${nanoid(10)}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(UPLOADS_DIR));

function requireAdmin(req, res, next) {
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect." });
  }
  next();
}

/* ---------- Candidates ---------- */
app.get("/api/candidates", (req, res) => {
  const db = readDB();
  res.json(db.candidates);
});

app.post("/api/candidates", upload.single("photo"), (req, res) => {
  const { name, age, city, category, sector, title, description, beneficiaries, budget } = req.body;
  if (!name || !age || !city || !title || !description || !["miss", "master"].includes(category)) {
    return res.status(400).json({ error: "Champs obligatoires manquants." });
  }
  const db = readDB();
  const candidate = {
    id: nanoid(),
    category,
    name,
    age: Number(age),
    city,
    sector: sector || "Autre",
    title,
    description,
    beneficiaries: beneficiaries || "",
    budget: budget || "",
    photo: req.file ? `/uploads/${req.file.filename}` : null,
    votes: 0,
  };
  db.candidates.push(candidate);
  writeDB(db);
  res.status(201).json(candidate);
});

/* ---------- Votes ----------
   NOTE: this endpoint credits votes immediately after the client "confirms"
   payment — that confirmation is currently simulated (see PaymentModal in
   the React app). To take real money, integrate the Orange Money / MTN
   MoMo "Collections" APIs here: initiate a charge, then only increment
   `votes` once the provider's webhook / status callback confirms success,
   instead of trusting the client directly. */
app.post("/api/candidates/:id/vote", (req, res) => {
  const { qty, method, phone } = req.body;
  const n = Number(qty);
  if (!Number.isInteger(n) || n < 1 || n > 500) {
    return res.status(400).json({ error: "Nombre de votes invalide." });
  }
  if (!phone || !["orange", "mtn"].includes(method)) {
    return res.status(400).json({ error: "Informations de paiement invalides." });
  }
  const db = readDB();
  const candidate = db.candidates.find((c) => c.id === req.params.id);
  if (!candidate) return res.status(404).json({ error: "Candidat·e introuvable." });

  candidate.votes += n;
  writeDB(db);
  res.json(candidate);
  // total billed = n * VOTE_PRICE FCFA — log/record this alongside your real
  // payment gateway's transaction id once integrated.
});

/* ---------- Settings ---------- */
app.get("/api/settings", (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.post("/api/settings", requireAdmin, (req, res) => {
  const { start, end } = req.body;
  const db = readDB();
  db.settings = { start: start || null, end: end || null };
  writeDB(db);
  res.json(db.settings);
});

/* ---------- Serve the built React app ---------- */
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get("*", (req, res) => res.sendFile(path.join(CLIENT_DIST, "index.html")));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`African Pride server running on port ${PORT}`));
