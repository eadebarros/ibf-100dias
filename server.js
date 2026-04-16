const express = require('express');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app  = express();
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ibf2026';

const DATA_DIR  = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// Fallback: copia data.json do repo para o Volume na primeira execução
if (process.env.DATA_DIR && !fs.existsSync(DATA_FILE)) {
  const localFile = path.join(__dirname, 'data.json');
  if (fs.existsSync(localFile)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.copyFileSync(localFile, DATA_FILE);
    console.log('data.json copiado para o Volume.');
  }
}

// Sessões em memória (sem dependência externa)
const sessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function isAuthenticated(req) {
  const token = req.cookies && req.cookies.session;
  return token && sessions.has(token);
}

// Parse de cookies manual
app.use((req, res, next) => {
  req.cookies = {};
  const header = req.headers.cookie;
  if (header) {
    header.split(';').forEach(function (cookie) {
      const parts = cookie.trim().split('=');
      const name  = parts.shift().trim();
      req.cookies[name] = parts.join('=').trim();
    });
  }
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

// ===== ROTAS DE AUTENTICAÇÃO =====

app.get('/login', (req, res) => {
  if (isAuthenticated(req)) return res.redirect('/admin');
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Compatibilidade com a rota antiga /login.html
app.get('/login.html', (req, res) => res.redirect('/login'));

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = generateToken();
    sessions.set(token, { created: Date.now() });
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; Path=/; Max-Age=86400`);
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Senha incorreta.' });
  }
});

app.post('/api/logout', (req, res) => {
  const token = req.cookies && req.cookies.session;
  if (token) sessions.delete(token);
  res.setHeader('Set-Cookie', 'session=; HttpOnly; Path=/; Max-Age=0');
  res.json({ ok: true });
});

// ===== API DE DADOS =====

app.get('/api/data', (req, res) => {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(raw));
  } catch (e) {
    res.status(500).json({ error: 'Erro ao ler dados.' });
  }
});

app.post('/api/save', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }
  try {
    const data = req.body;
    if (!data.plan || !data.phases || !data.updates) {
      return res.status(400).json({ error: 'Estrutura inválida.' });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar.' });
  }
});

// POST /api/seed — sobrescreve o Volume com o data.json do repo (protegido)
app.post('/api/seed', (req, res) => {
  if (!isAuthenticated(req)) {
    return res.status(401).json({ error: 'Não autorizado.' });
  }
  try {
    const localFile = path.join(__dirname, 'data.json');
    if (!fs.existsSync(localFile)) {
      return res.status(404).json({ error: 'data.json não encontrado no repo.' });
    }
    fs.copyFileSync(localFile, DATA_FILE);
    console.log('Seed executado: Volume sobrescrito com data.json do repo.');
    res.json({ ok: true, message: 'Volume atualizado com o data.json do repositório.' });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao executar seed: ' + e.message });
  }
});

// ===== ADMIN (protegido) =====

app.get('/admin', (req, res) => {
  if (!isAuthenticated(req)) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ===== ROTA RAIZ (antes do static, para proteger index.html) =====

app.get('/', (req, res) => {
  if (!isAuthenticated(req)) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== ESTÁTICOS =====

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`IBF 100 Dias rodando na porta ${PORT}`);
  console.log(`DATA_FILE: ${DATA_FILE}`);
});
