# Generates original cover art (SVG) for each game into public/images/
import json, subprocess, os
games = json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./games.js')))"]))
def motif(genre, c):
    if genre == 'Racing':
        lines = ''.join(f'<rect x="{40+i*30}" y="{120+i*28}" width="{150-i*12}" height="6" rx="3" fill="#fff" opacity=".35"/>' for i in range(5))
        return lines + f'<path d="M230 235 l25-45 h110 l40 45 h35 v35 H215 v-35z" fill="#fff"/><path d="M270 190 h90 l25 45 h-140z" fill="{c}" opacity=".6"/><circle cx="275" cy="272" r="22" fill="#111"/><circle cx="395" cy="272" r="22" fill="#111"/><circle cx="275" cy="272" r="9" fill="#ccc"/><circle cx="395" cy="272" r="9" fill="#ccc"/>'
    if genre == 'RPG':
        return f'<g transform="rotate(35 320 160)"><rect x="308" y="30" width="24" height="190" fill="#fff"/><path d="M308 30 L320 5 L332 30z" fill="#fff"/><rect x="265" y="215" width="110" height="16" rx="6" fill="#ffd166"/><rect x="311" y="231" width="18" height="60" fill="#8a5a2b"/><circle cx="320" cy="298" r="12" fill="#ffd166"/></g><circle cx="470" cy="110" r="6" fill="#fff" opacity=".7"/><circle cx="170" cy="90" r="4" fill="#fff" opacity=".7"/>'
    if genre == 'Action':
        return '<g fill="none" stroke="#fff" stroke-width="6"><circle cx="320" cy="150" r="85"/><circle cx="320" cy="150" r="30"/><path d="M320 40v50M320 210v50M210 150h50M380 150h50"/></g><circle cx="320" cy="150" r="6" fill="#fff"/>'
    if genre == 'Simulation':
        return f'<circle cx="480" cy="90" r="45" fill="#ffd166"/><path d="M0 260 Q160 170 320 250 T640 230 V360 H0z" fill="#fff" opacity=".25"/><path d="M0 300 Q200 230 400 290 T640 280 V360 H0z" fill="#fff" opacity=".35"/><rect x="220" y="190" width="110" height="80" fill="#fff"/><path d="M205 192 L275 140 L345 192z" fill="{c}"/><rect x="262" y="225" width="26" height="45" fill="{c}"/>'
    if genre == 'Strategy':
        hexes = ''
        for r in range(3):
            for k in range(5):
                x = 150 + k*85 + (r % 2)*42; y = 70 + r*72
                hexes += f'<polygon points="{x},{y-40} {x+36},{y-20} {x+36},{y+20} {x},{y+40} {x-36},{y+20} {x-36},{y-20}" fill="#fff" opacity="{0.15+0.12*((r+k)%3)}" stroke="#fff" stroke-width="2"/>'
        return hexes
    if genre == 'Puzzle':
        return ''.join(f'<rect x="{200+i%3*85}" y="{50+i//3*85}" width="75" height="75" rx="12" fill="#fff" opacity="{0.25+0.1*(i%4)}"/>' for i in range(9)) + f'<rect x="372" y="222" width="75" height="75" rx="12" fill="{c}" stroke="#fff" stroke-width="4"/>'
    if genre == 'Sports':
        return '<circle cx="320" cy="150" r="90" fill="#fff"/><polygon points="320,100 362,130 346,180 294,180 278,130" fill="#222"/><g stroke="#222" stroke-width="5"><path d="M320 100V62M362 130l36-12M346 180l24 32M294 180l-24 32M278 130l-36-12"/></g>'
    return ''
for g in games:
    h = g['id'] * 47 % 360
    c1, c2 = f'hsl({h},65%,42%)', f'hsl({(h+55)%360},65%,18%)'
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}"/></linearGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></linearGradient></defs><rect width="640" height="360" fill="url(#b)"/>{motif(g['genre'], c1)}<rect y="230" width="640" height="130" fill="url(#s)"/><text x="24" y="335" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="34" fill="#fff">{g['name'].replace('&','&amp;')}</text></svg>'''
    open(f"public/images/{g['id']}.svg", 'w').write(svg)
print(len(games), 'covers')
