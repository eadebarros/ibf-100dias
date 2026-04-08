const express = require('express');
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;
const DATA = path.join(__dirname, 'data.json');

app.use(express.json());
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
  console.log('Admin: http://localhost:' + PORT + '/admin.html');
});
