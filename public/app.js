const $ = s => document.querySelector(s);
let token = localStorage.getItem('token'), user = null, games = [], view = 'store', genre = '';
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
const money = n => '₹' + n.toLocaleString('en-IN');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

async function api(path, opts = {}) {
  const res = await fetch('/api' + path, { method: opts.body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: opts.body && JSON.stringify(opts.body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }
const owns = id => user && user.library.includes(id);
const coverHtml = g => g.image ? `<img class="cover" src="${g.image}" alt="${esc(g.name)} cover">` : `<div class="cover" style="background:linear-gradient(135deg,hsl(${g.id * 47 % 360},60%,38%),hsl(${(g.id * 47 + 60) % 360},60%,22%))">${esc(g.name[0])}</div>`;

function renderHeader() {
  $('#count').textContent = cart.length;
  $('#account').innerHTML = user
    ? `${esc(user.name)} &bull; ${money(user.wallet)} <button class="ghost" id="logout">Log out</button>`
    : `<button id="loginBtn">Log in</button>`;
  $('#logout')?.addEventListener('click', async () => { await api('/logout', { body: {} }).catch(() => {}); token = null; user = null; localStorage.removeItem('token'); go('store'); });
  $('#loginBtn')?.addEventListener('click', () => go('login'));
}

async function loadGames() {
  games = await api('/games?q=' + encodeURIComponent($('#search').value) + '&genre=' + encodeURIComponent(genre));
}
function gameCard(g) {
  return `<article class="card" data-id="${g.id}">${coverHtml(g)}<div class="body"><strong>${esc(g.name)}</strong>
  <span class="meta">${esc(g.genre)} &bull; ★ ${g.rating}</span>
  <div class="row">${owns(g.id) ? '<span class="owned">In library</span>' : `<span class="price">${money(g.price)}</span><button data-add="${g.id}">Add</button>`}</div></div></article>`;
}
async function go(v) {
  view = v; const el = $('#view');
  if (v === 'login') {
    el.innerHTML = `<form id="auth"><h2>Log in or create account</h2><input name="name" placeholder="Name (new accounts only)"><input name="email" type="email" placeholder="Email" required><input name="password" type="password" placeholder="Password (6+ characters)" required><button value="login">Log in</button><button class="ghost" value="register">Create account</button></form>`;
    $('#auth').onsubmit = e => e.preventDefault();
    el.querySelectorAll('#auth button').forEach(b => b.onclick = async () => {
      const f = new FormData($('#auth'));
      try { const r = await api('/' + b.value, { body: Object.fromEntries(f) }); token = r.token; user = r.user; localStorage.setItem('token', token); toast('Welcome, ' + user.name); renderHeader(); go('store'); }
      catch (e) { toast(e.message); }
    });
  } else if (v === 'library') {
    if (!user) return go('login');
    await loadGames(); const mine = games.filter(g => owns(g.id));
    el.innerHTML = `<h2>Your library</h2><br>` + (mine.length ? `<div class="grid">${mine.map(gameCard).join('')}</div>` : '<p class="meta">No games yet. Buy one from the store.</p>');
  } else {
    await loadGames();
    const genres = ['', 'Action', 'RPG', 'Racing', 'Strategy', 'Simulation', 'Puzzle', 'Sports'];
    el.innerHTML = `<div class="bar">${genres.map(x => `<button class="${x === genre ? '' : 'ghost'}" data-genre="${x}">${x || 'All'}</button>`).join('')}</div>` +
      (games.length ? `<div class="grid">${games.map(gameCard).join('')}</div>` : '<p class="meta">No games match your search.</p>');
  }
  renderHeader();
}
function showGame(id) {
  const g = games.find(x => x.id == id); if (!g) return;
  $('#modal').hidden = false;
  $('#modal').innerHTML = `<div class="dialog">${coverHtml(g)}<div class="body"><h2>${esc(g.name)}</h2><span class="meta">${esc(g.genre)} &bull; ★ ${g.rating}</span><p>${esc(g.desc)}</p>
  <div class="row">${owns(g.id) ? '<span class="owned">In your library</span>' : `<span class="price">${money(g.price)}</span><button data-add="${g.id}">Add to cart</button>`}<button class="ghost" id="closeModal">Close</button></div></div></div>`;
}
function renderCart() {
  const items = cart.map(id => games.find(g => g.id === id)).filter(Boolean);
  const total = items.reduce((s, g) => s + g.price, 0);
  $('#cart').innerHTML = `<div class="row"><h2>Your cart</h2><button class="ghost" id="closeCart">Close</button></div>
  <ul>${items.map(g => `<li><span>${esc(g.name)}</span><span>${money(g.price)} <button class="ghost" data-remove="${g.id}">x</button></span></li>`).join('') || '<li class="meta">Cart is empty</li>'}</ul>
  <p>Total: <strong>${money(total)}</strong></p><button id="checkout">Buy now</button>`;
}
const saveCart = () => { localStorage.setItem('cart', JSON.stringify(cart)); renderHeader(); renderCart(); };

document.addEventListener('click', async e => {
  const t = e.target;
  if (t.dataset.view) return go(t.dataset.view);
  if (t.dataset.genre !== undefined) { genre = t.dataset.genre; return go('store'); }
  if (t.dataset.add) { const id = +t.dataset.add; if (!cart.includes(id)) cart.push(id); saveCart(); $('#cart').classList.add('open'); return; }
  if (t.dataset.remove) { cart = cart.filter(id => id !== +t.dataset.remove); return saveCart(); }
  if (t.id === 'cartBtn') { renderCart(); return $('#cart').classList.toggle('open'); }
  if (t.id === 'closeCart') return $('#cart').classList.remove('open');
  if (t.id === 'closeModal' || t.id === 'modal') return $('#modal').hidden = true;
  if (t.id === 'checkout') {
    if (!user) { $('#cart').classList.remove('open'); toast('Log in to buy games'); return go('login'); }
    try { const r = await api('/checkout', { body: { ids: cart } }); user = r.user; cart = []; saveCart(); $('#cart').classList.remove('open'); toast(`Bought ${r.bought} game(s) for ${money(r.total)}`); go('library'); }
    catch (err) { toast(err.message); }
    return;
  }
  const card = t.closest('.card'); if (card) showGame(card.dataset.id);
});
let timer; $('#search').oninput = () => { clearTimeout(timer); timer = setTimeout(() => go('store'), 300); };

(async () => {
  if (token) { try { user = await api('/me'); } catch { token = null; localStorage.removeItem('token'); } }
  await go('store'); renderCart();
})();
