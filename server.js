const express = require('express');
const session = require('express-session');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app    = express();
const PORT   = process.env.PORT || 3000;
const DATA   = path.join(__dirname, 'data.json');
const PASS   = process.env.SITE_PASSWORD || 'ibf2025';
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 } // 8 horas
}));

// ===== ROTAS PÚBLICAS =====

app.get('/login.html', (req, res) => {
  if (req.session.authenticated) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  const a = Buffer.from(password || '');
  const b = Buffer.from(PASS);
  const match = a.length === b.length && crypto.timingSafeEqual(a, b);
  if (match) {
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    res.redirect('/login.html?error=1');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

// ===== AUTENTICAÇÃO =====

app.use((req, res, next) => {
  if (req.session.authenticated) return next();
  res.redirect('/login.html');
});

// ===== ROTAS PROTEGIDAS =====

app.use(express.static(__dirname));

app.post('/api/save', (req, res) => {
  try {
    fs.writeFileSync(DATA, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('IBF 100 Dias rodando em http://localhost:' + PORT);
});
