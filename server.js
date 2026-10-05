// Pixel Vault server: pure Node.js, no npm install needed. Run: node server.js
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const GAMES = require('./games.js');
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const db = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE)) : { users: [], sessions: {} };
const save = () => fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
const hash = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');
const send = (res, code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); };
const readBody = req => new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch { r({}); } }); });
const publicUser = u => ({ id: u.id, name: u.name, email: u.email, wallet: u.wallet, library: u.library });
const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

async function api(req, res, url) {
  const route = req.method + ' ' + url.pathname;
  const user = db.users.find(u => u.id === db.sessions[(req.headers.authorization || '').slice(7)]);
  const need = () => { if (!user) { send(res, 401, { error: 'Please log in first.' }); return false; } return true; };

  if (route === 'GET /api/games') {
    const q = (url.searchParams.get('q') || '').toLowerCase(), genre = url.searchParams.get('genre');
    return send(res, 200, GAMES.filter(x => x.name.toLowerCase().includes(q) && (!genre || x.genre === genre)));
  }
  if (route === 'POST /api/register') {
    const { name, email, password } = await readBody(req);
    if (!name || !email || !password || password.length < 6) return send(res, 400, { error: 'Enter name, email and a password of 6+ characters.' });
    if (db.users.some(u => u.email === email.toLowerCase())) return send(res, 400, { error: 'This email is already registered.' });
    const salt = crypto.randomBytes(16).toString('hex');
    const u = { id: crypto.randomUUID(), name, email: email.toLowerCase(), salt, hash: hash(password, salt), wallet: 5000, library: [] };
    db.users.push(u);
    const token = crypto.randomBytes(24).toString('hex'); db.sessions[token] = u.id; save();
    return send(res, 200, { token, user: publicUser(u) });
  }
  if (route === 'POST /api/login') {
    const { email, password } = await readBody(req);
    const u = db.users.find(x => x.email === (email || '').toLowerCase());
    if (!u || hash(password || '', u.salt) !== u.hash) return send(res, 401, { error: 'Wrong email or password.' });
    const token = crypto.randomBytes(24).toString('hex'); db.sessions[token] = u.id; save();
    return send(res, 200, { token, user: publicUser(u) });
  }
  if (route === 'GET /api/me') { if (need()) send(res, 200, publicUser(user)); return; }
  if (route === 'POST /api/logout') { delete db.sessions[(req.headers.authorization || '').slice(7)]; save(); return send(res, 200, {}); }
  if (route === 'POST /api/checkout') {
    if (!need()) return;
    const { ids = [] } = await readBody(req);
    const items = GAMES.filter(x => ids.includes(x.id) && !user.library.includes(x.id));
    const total = items.reduce((s, x) => s + x.price, 0);
    if (!items.length) return send(res, 400, { error: 'Nothing new to buy.' });
    if (user.wallet < total) return send(res, 400, { error: 'Not enough wallet balance.' });
    user.wallet -= total; user.library.push(...items.map(x => x.id)); save();
    return send(res, 200, { user: publicUser(user), bought: items.length, total });
  }
  send(res, 404, { error: 'Not found' });
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) return api(req, res, url).catch(() => send(res, 500, { error: 'Server error' }));
  const file = path.join(__dirname, 'public', path.normalize(url.pathname === '/' ? 'index.html' : url.pathname));
  if (!file.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(file)) { res.writeHead(404); return res.end('Not found'); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' }); fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('Pixel Vault running at http://localhost:' + PORT));
