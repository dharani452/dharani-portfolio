/* ════════════════════════════════════════════
   THREATSHIELD SOC PORTFOLIO — SCRIPT.JS
   Dharani A // MCA // Cybersecurity
════════════════════════════════════════════ */
'use strict';

/* ─────────────────────────────────────────
   1. LIVE CLOCK
───────────────────────────────────────── */
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');
  document.getElementById('live-clock').textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateClock, 1000);
updateClock();

/* ─────────────────────────────────────────
   2. MATRIX RAIN BACKGROUND
───────────────────────────────────────── */
(function initMatrix() {
  const canvas = document.getElementById('matrix-bg');
  const ctx = canvas.getContext('2d');
  let cols, drops;
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*';

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const fontSize = 13;
    cols = Math.floor(canvas.width / fontSize);
    drops = new Array(cols).fill(1);
  }

  function draw() {
    ctx.fillStyle = 'rgba(1,4,8,0.06)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00d4ff';
    ctx.font = '13px Share Tech Mono, monospace';
    for (let i = 0; i < cols; i++) {
      const ch = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(ch, i * 13, drops[i] * 13);
      if (drops[i] * 13 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 50);
})();

/* ─────────────────────────────────────────
   3. HERO ROLE TYPEWRITER
───────────────────────────────────────── */
(function heroTypewriter() {
  const roles = [
    'Cybersecurity Analyst',
    'AI/ML Engineer',
    'Full Stack Developer',
    'Ethical Hacker',
    'Network Defense Specialist',
    'SOC Engineer'
  ];
  const el = document.getElementById('hero-role-text');
  let ri = 0, ci = 0, deleting = false;

  function tick() {
    const role = roles[ri];
    if (deleting) {
      ci--;
      el.textContent = role.slice(0, ci);
      if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
      setTimeout(tick, deleting ? 60 : 120);
    } else {
      ci++;
      el.textContent = role.slice(0, ci);
      if (ci === role.length) { deleting = true; setTimeout(tick, 2200); return; }
      setTimeout(tick, 80);
    }
  }
  tick();
})();

/* ─────────────────────────────────────────
   4. GLOBAL STATE & COUNTERS
───────────────────────────────────────── */
const state = {
  threats:  0,
  blocked:  0,
  ids:      0,
  packets:  0,
  ddos:     0,
  underAttack: false,
  health:   87
};

function animateCounter(el, target, duration = 800) {
  const start = parseInt(el.textContent) || 0;
  const diff  = target - start;
  const startTime = performance.now();
  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = Math.round(start + diff * progress);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function updateStats() {
  const { threats, blocked, ids, packets, ddos } = state;

  // hero panel
  animateCounter(document.getElementById('hs-threats'), threats, 600);
  animateCounter(document.getElementById('hs-blocked'), blocked, 600);
  animateCounter(document.getElementById('hs-ids'),     ids,     600);

  // stat cards
  animateCounter(document.getElementById('sc-threats-num'), threats, 700);
  animateCounter(document.getElementById('sc-blocked-num'), blocked, 700);
  animateCounter(document.getElementById('sc-ids-num'),     ids,     700);
  animateCounter(document.getElementById('sc-packets-num'), packets, 700);
  animateCounter(document.getElementById('sc-ddos-num'),    ddos,    700);

  // progress bars
  const cap = (n, max) => Math.min((n / max) * 100, 100) + '%';
  document.getElementById('sc-bar-threats').style.width  = cap(threats, 50);
  document.getElementById('sc-bar-blocked').style.width  = cap(blocked, 200);
  document.getElementById('sc-bar-ids').style.width      = cap(ids, 100);
  document.getElementById('sc-bar-packets').style.width  = cap(packets, 5000);
  document.getElementById('sc-bar-ddos').style.width     = cap(ddos, 50);

  // health bar
  const hb  = document.getElementById('health-bar');
  const hpt = document.getElementById('health-pct');
  hb.style.width = state.health + '%';
  hpt.textContent = state.health + '%';
  if (state.health < 60) {
    hb.classList.add('low');
    hpt.classList.add('low');
  } else {
    hb.classList.remove('low');
    hpt.classList.remove('low');
  }
}

/* ─────────────────────────────────────────
   5. ATTACK MAP CANVAS
───────────────────────────────────────── */
const ATTACK_CANVAS = document.getElementById('attack-canvas');
const ACtx = ATTACK_CANVAS.getContext('2d');

const ATTACK_TYPES = [
  { type:'DDoS',     color:'#ff2233', glow:'rgba(255,34,51,0.6)' },
  { type:'Malware',  color:'#cc44ff', glow:'rgba(204,68,255,0.6)' },
  { type:'Phishing', color:'#ffcc00', glow:'rgba(255,204,0,0.5)' },
  { type:'Probe',    color:'#00ccff', glow:'rgba(0,204,255,0.5)' },
  { type:'Normal',   color:'#00ff88', glow:'rgba(0,255,136,0.4)' }
];

const NODES = [
  { label:'RU', x:0.58, y:0.22 }, { label:'CN', x:0.73, y:0.30 },
  { label:'US', x:0.17, y:0.28 }, { label:'DE', x:0.50, y:0.19 },
  { label:'BR', x:0.26, y:0.58 }, { label:'IN', x:0.67, y:0.38 },
  { label:'UK', x:0.47, y:0.18 }, { label:'JP', x:0.82, y:0.28 },
  { label:'AU', x:0.78, y:0.65 }, { label:'ZA', x:0.54, y:0.60 },
  { label:'KP', x:0.79, y:0.25 }, { label:'IR', x:0.62, y:0.30 },
  { label:'CA', x:0.20, y:0.18 }, { label:'FR', x:0.49, y:0.22 },
  { label:'MY', x:0.75, y:0.45 }
];

const packets = [];
let   nodeList = [];

function resizeAttackCanvas() {
  ATTACK_CANVAS.width  = ATTACK_CANVAS.offsetWidth;
  ATTACK_CANVAS.height = ATTACK_CANVAS.offsetHeight;
  nodeList = NODES.map(n => ({
    ...n,
    px: n.x * ATTACK_CANVAS.width,
    py: n.y * ATTACK_CANVAS.height,
    pulse: Math.random() * Math.PI * 2
  }));
}
resizeAttackCanvas();
window.addEventListener('resize', () => { resizeAttackCanvas(); });

function spawnPacket() {
  if (nodeList.length < 2) return;
  let srcIdx = Math.floor(Math.random() * nodeList.length);
  let dstIdx;
  do { dstIdx = Math.floor(Math.random() * nodeList.length); } while (dstIdx === srcIdx);
  const atk = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  packets.push({
    src: nodeList[srcIdx], dst: nodeList[dstIdx],
    color: atk.color, glow: atk.glow, type: atk.type,
    t: 0, speed: 0.005 + Math.random() * 0.008,
    size: 3 + Math.random() * 3
  });
}

function drawGridLines() {
  const { width: W, height: H } = ATTACK_CANVAS;
  ACtx.strokeStyle = 'rgba(10,40,64,0.6)';
  ACtx.lineWidth   = 0.5;
  const stepX = W / 20, stepY = H / 12;
  for (let x = 0; x < W; x += stepX) {
    ACtx.beginPath(); ACtx.moveTo(x,0); ACtx.lineTo(x,H); ACtx.stroke();
  }
  for (let y = 0; y < H; y += stepY) {
    ACtx.beginPath(); ACtx.moveTo(0,y); ACtx.lineTo(W,y); ACtx.stroke();
  }
}

function drawNodes(t) {
  nodeList.forEach(n => {
    n.pulse += 0.04;
    const wave = Math.sin(n.pulse) * 0.5 + 0.5;

    // outer pulse ring
    ACtx.beginPath();
    ACtx.arc(n.px, n.py, 14 + wave * 6, 0, Math.PI * 2);
    ACtx.strokeStyle = `rgba(0,212,255,${0.06 + wave * 0.12})`;
    ACtx.lineWidth = 1;
    ACtx.stroke();

    // node circle
    ACtx.beginPath();
    ACtx.arc(n.px, n.py, 6, 0, Math.PI * 2);
    ACtx.fillStyle = '#0d2a40';
    ACtx.fill();
    ACtx.strokeStyle = '#00d4ff';
    ACtx.lineWidth = 1.5;
    ACtx.stroke();

    // glow
    const grad = ACtx.createRadialGradient(n.px, n.py, 0, n.px, n.py, 14);
    grad.addColorStop(0, `rgba(0,212,255,${0.3 * wave})`);
    grad.addColorStop(1, 'rgba(0,212,255,0)');
    ACtx.beginPath();
    ACtx.arc(n.px, n.py, 14, 0, Math.PI * 2);
    ACtx.fillStyle = grad;
    ACtx.fill();

    // label
    ACtx.fillStyle = '#a0c8e8';
    ACtx.font = '9px Orbitron, sans-serif';
    ACtx.textAlign = 'center';
    ACtx.fillText(n.label, n.px, n.py + 19);
  });
}

function lerp(a, b, t) { return a + (b - a) * t; }
function bezierPoint(p0, p1, cp, t) {
  return {
    x: (1-t)*(1-t)*p0.x + 2*(1-t)*t*cp.x + t*t*p1.x,
    y: (1-t)*(1-t)*p0.y + 2*(1-t)*t*cp.y + t*t*p1.y
  };
}
function getCP(src, dst) {
  const mx = (src.px + dst.px) / 2;
  const my = (src.py + dst.py) / 2;
  const dx = dst.px - src.px, dy = dst.py - src.py;
  const len = Math.sqrt(dx*dx+dy*dy);
  return { x: mx - dy / len * (len * 0.3), y: my + dx / len * (len * 0.3) };
}

function drawPackets() {
  for (let i = packets.length - 1; i >= 0; i--) {
    const p = packets[i];
    p.t += p.speed;
    if (p.t >= 1) { packets.splice(i, 1); continue; }

    const cp = getCP(p.src, p.dst);

    // draw trail (bezier curve up to t)
    ACtx.beginPath();
    ACtx.moveTo(p.src.px, p.src.py);
    for (let tt = 0; tt <= p.t; tt += 0.02) {
      const pt = bezierPoint(
        {x: p.src.px, y: p.src.py},
        {x: p.dst.px, y: p.dst.py},
        cp, Math.min(tt, p.t)
      );
      ACtx.lineTo(pt.x, pt.y);
    }
    ACtx.strokeStyle = p.color + '33';
    ACtx.lineWidth   = 1;
    ACtx.stroke();

    // draw packet dot
    const pos = bezierPoint(
      {x: p.src.px, y: p.src.py},
      {x: p.dst.px, y: p.dst.py},
      cp, p.t
    );
    ACtx.shadowBlur  = 12;
    ACtx.shadowColor = p.glow;
    ACtx.beginPath();
    ACtx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
    ACtx.fillStyle = p.color;
    ACtx.fill();
    ACtx.shadowBlur = 0;
  }
}

let frameCount = 0;
function animateMap() {
  const { width: W, height: H } = ATTACK_CANVAS;
  ACtx.clearRect(0, 0, W, H);

  // bg
  ACtx.fillStyle = '#010c18';
  ACtx.fillRect(0, 0, W, H);

  drawGridLines();
  drawNodes(frameCount);
  drawPackets();

  frameCount++;
  requestAnimationFrame(animateMap);
}
animateMap();

/* ─────────────────────────────────────────
   6. SOC LOG FEED
───────────────────────────────────────── */
const SOC_LOG = document.getElementById('soc-log');
const SOC_WRAP = document.getElementById('soc-log-wrap');

const LOG_TEMPLATES = [
  { tpl: 'ALERT: Brute-force SSH attempt detected — {node} node', cls:'soc-type-alert', atk:'DDoS' },
  { tpl: 'BLOCKED: DDoS flood mitigated at Layer 3 Firewall — {node}', cls:'soc-type-blocked', atk:'DDoS' },
  { tpl: 'WARN: Anomalous exfiltration pattern — {node} → {node2}', cls:'soc-type-warn', atk:'Malware' },
  { tpl: 'ALERT: Malware signature detected in payload — {node}', cls:'soc-type-alert', atk:'Malware' },
  { tpl: 'BLOCKED: Phishing domain spoofing attempt — {node}', cls:'soc-type-blocked', atk:'Phishing' },
  { tpl: 'INFO: IDS signature updated — ruleset v4.8.2', cls:'soc-type-info', atk:'Normal' },
  { tpl: 'ALERT: Privilege escalation attempt — {node} node user', cls:'soc-type-alert', atk:'Malware' },
  { tpl: 'BLOCKED: Port scan suppressed — {node} source', cls:'soc-type-blocked', atk:'Probe' },
  { tpl: 'INFO: Firewall rule auto-updated — IP block applied', cls:'soc-type-info', atk:'Normal' },
  { tpl: 'WARN: TLS certificate anomaly on {node} endpoint', cls:'soc-type-warn', atk:'Phishing' },
  { tpl: 'ALERT: C2 callback detected — {node} → external beacon', cls:'soc-type-alert', atk:'Malware' },
  { tpl: 'BLOCKED: SQL injection attempt — web layer dropped', cls:'soc-type-blocked', atk:'Probe' },
  { tpl: 'INFO: Honeypot triggered by {node} source', cls:'soc-type-info', atk:'Normal' },
  { tpl: 'ALERT: Zero-day exploit signature match — {node}', cls:'soc-type-alert', atk:'Malware' },
  { tpl: 'BLOCKED: Ransomware hash quarantined at endpoint', cls:'soc-type-blocked', atk:'Malware' },
  { tpl: 'WARN: Unusual data volume from {node} — monitoring', cls:'soc-type-warn', atk:'DDoS' },
  { tpl: 'INFO: SIEM correlation rule fired — incident #INC-{num}', cls:'soc-type-info', atk:'Normal' },
  { tpl: 'ALERT: Credential stuffing detected — {node}', cls:'soc-type-alert', atk:'Phishing' }
];

const LOCS = ['Russia','China','USA','Germany','Brazil','India','UK','Japan','Australia','South Africa','N.Korea','Iran'];

function nowTs() {
  const n = new Date();
  return [n.getHours(), n.getMinutes(), n.getSeconds()]
    .map(v => String(v).padStart(2,'0')).join(':');
}

function pushLog(msg, cls) {
  const div = document.createElement('div');
  div.className = `soc-entry`;
  div.innerHTML = `<span class="soc-ts">[${nowTs()}]</span> <span class="${cls}">${msg}</span>`;
  SOC_LOG.appendChild(div);
  if (SOC_LOG.children.length > 120) SOC_LOG.removeChild(SOC_LOG.firstChild);
  SOC_WRAP.scrollTop = SOC_WRAP.scrollHeight;
}

function generateLogEntry() {
  const tmpl = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
  let msg = tmpl.tpl
    .replace('{node}',  LOCS[Math.floor(Math.random() * LOCS.length)])
    .replace('{node2}', LOCS[Math.floor(Math.random() * LOCS.length)])
    .replace('{num}',   String(Math.floor(Math.random() * 9000) + 1000));
  pushLog(msg, tmpl.cls);

  // update counters
  if (tmpl.cls === 'soc-type-alert')   { state.threats++; state.packets += Math.floor(Math.random()*80)+20; }
  if (tmpl.cls === 'soc-type-blocked') {
    state.blocked++;
    if (tmpl.atk === 'DDoS') state.ddos++;
    state.packets += Math.floor(Math.random()*120)+40;
  }
  if (tmpl.cls === 'soc-type-warn')    { state.ids++; state.packets += Math.floor(Math.random()*40)+10; }
  if (tmpl.cls === 'soc-type-info')    { state.packets += Math.floor(Math.random()*30)+5; }

  updateStats();
  return tmpl.atk;
}

/* ─────────────────────────────────────────
   7. ATTACK SIMULATION ENGINE
───────────────────────────────────────── */
let attackInterval = null;
let normalInterval = null;

function launchPacketFromLog(atkType) {
  const at = ATTACK_TYPES.find(a => a.type === atkType) || ATTACK_TYPES[3];
  if (nodeList.length < 2) return;
  let s = Math.floor(Math.random() * nodeList.length);
  let d;
  do { d = Math.floor(Math.random() * nodeList.length); } while (d === s);
  packets.push({
    src: nodeList[s], dst: nodeList[d],
    color: at.color, glow: at.glow, type: at.type,
    t: 0, speed: 0.006 + Math.random() * 0.009,
    size: 3 + Math.random() * 4
  });
}

function normalTraffic() {
  spawnPacket();
  const atk = generateLogEntry();
  launchPacketFromLog(atk);
}

function heavyAttack() {
  for (let i = 0; i < 4; i++) spawnPacket();
  const atk = generateLogEntry();
  launchPacketFromLog(atk);
  launchPacketFromLog(atk);
  state.health = Math.max(30, state.health - (Math.random() > 0.7 ? 2 : 0));
  updateStats();
}

// Start normal mode
normalInterval = setInterval(normalTraffic, 2000);

/* ─────────────────────────────────────────
   8. ATTACK TOGGLE BUTTON
───────────────────────────────────────── */
const toggleBtn = document.getElementById('attack-toggle');
const statusEl  = document.getElementById('system-status');
const statusDot = document.getElementById('status-dot');

toggleBtn.addEventListener('click', () => {
  state.underAttack = !state.underAttack;

  if (state.underAttack) {
    clearInterval(normalInterval);
    attackInterval = setInterval(heavyAttack, 700);
    toggleBtn.textContent = '🛡 MITIGATE ATTACK';
    toggleBtn.classList.add('attacking');
    statusEl.textContent = 'UNDER ATTACK';
    statusEl.classList.add('under-attack');
    statusDot.classList.add('danger');
    pushLog('⚠ MASS INTRUSION EVENT TRIGGERED — ALL LAYERS UNDER SIEGE', 'soc-type-alert');
    document.body.style.animation = 'none';
  } else {
    clearInterval(attackInterval);
    normalInterval = setInterval(normalTraffic, 2000);
    toggleBtn.textContent = '⚡ SIMULATE ATTACK';
    toggleBtn.classList.remove('attacking');
    statusEl.textContent = 'SYSTEM ONLINE';
    statusEl.classList.remove('under-attack');
    statusDot.classList.remove('danger');
    state.health = Math.min(87, state.health + 10);
    pushLog('✔ ATTACK MITIGATED — SYSTEMS STABILIZING', 'soc-type-blocked');
    updateStats();
  }
});

/* ─────────────────────────────────────────
   9. TERMINAL ABOUT SECTION
───────────────────────────────────────── */
(function buildTerminal() {
  const termBody = document.getElementById('term-body');
  const lines = [
    { delay: 0,    html: `<span class="term-prompt">dharani@threatshield:~$</span> <span class="term-cmd">whoami</span>` },
    { delay: 400,  html: `<span class="term-out">dharani_a — MCA Student | Cybersecurity Enthusiast | Full-Stack Dev</span>` },
    { delay: 900,  html: `<span class="term-prompt">dharani@threatshield:~$</span> <span class="term-cmd">cat system_info.txt</span>` },
    { delay: 1300, html: `<span class="term-key">NAME</span>          <span class="term-val">Dharani A</span>` },
    { delay: 1450, html: `<span class="term-key">ROLE</span>          <span class="term-val">MCA Student → Cybersecurity / Full Stack</span>` },
    { delay: 1600, html: `<span class="term-key">UNIVERSITY</span>    <span class="term-val">PES University (ONGOING · CGPA 7.00)</span>` },
    { delay: 1750, html: `<span class="term-key">PREV DEGREE</span>   <span class="term-val">BCA · IFIM College · 2025 · CGPA 6.71</span>` },
    { delay: 1900, html: `<span class="term-key">LANGUAGES</span>     <span class="term-val">English, Kannada, Tamil, Hindi</span>` },
    { delay: 2050, html: `<span class="term-key">CERTIFICATIONS</span><span class="term-val">C++ Programming · Societe Generale Hackathon</span>` },
    { delay: 2200, html: `<span class="term-key">ACTIVITIES</span>    <span class="term-val">Scouts & Guides · SIP Yelagiri · Football</span>` },
    { delay: 2500, html: `<span class="term-prompt">dharani@threatshield:~$</span> <span class="term-cmd">netstat -tulpn | grep LISTEN</span>` },
    { delay: 2900, html: `<span class="term-out">tcp  0  0  0.0.0.0:8080   LISTEN  FastAPI/ThreatShield</span>` },
    { delay: 3050, html: `<span class="term-out">tcp  0  0  0.0.0.0:9092   LISTEN  Kafka Broker</span>` },
    { delay: 3200, html: `<span class="term-out">tcp  0  0  0.0.0.0:9200   LISTEN  Elasticsearch</span>` },
    { delay: 3350, html: `<span class="term-out">tcp  0  0  0.0.0.0:3000   LISTEN  React Dashboard</span>` },
    { delay: 3600, html: `<span class="term-prompt">dharani@threatshield:~$</span> <span class="term-cmd">skill --list --verbose</span>` },
    { delay: 4000, html: `<span class="term-comment"># ── Offensive/Defensive ──────────────────────</span>` },
    { delay: 4100, html: `<span class="term-hi">[██████████] Cybersecurity & Cryptography  85%</span>` },
    { delay: 4200, html: `<span class="term-hi">[████████░░] Network Security              78%</span>` },
    { delay: 4300, html: `<span class="term-comment"># ── AI/ML Engine ─────────────────────────────</span>` },
    { delay: 4400, html: `<span class="term-val">[█████████░] Python / Scikit-learn          88%</span>` },
    { delay: 4500, html: `<span class="term-val">[████████░░] ML Anomaly Detection          82%</span>` },
    { delay: 4600, html: `<span class="term-comment"># ── Full Stack ───────────────────────────────</span>` },
    { delay: 4700, html: `<span class="term-out">[████████░░] Flask / FastAPI               85%</span>` },
    { delay: 4800, html: `<span class="term-out">[███████░░░] React / JavaScript            76%</span>` },
    { delay: 5000, html: `<span class="term-prompt">dharani@threatshield:~$</span> <span class="term-cmd">status --mission</span>` },
    { delay: 5400, html: `<span class="term-val">&#9670; OBJECTIVE: Secure enterprise systems with AI-powered threat intelligence.</span>` },
    { delay: 5650, html: `<span class="term-val">&#9670; CURRENT: Building ThreatShield — lightweight SIEM with LLM alert engine.</span>` },
    { delay: 5900, html: `<span class="term-val">&#9670; STATUS: Open to cybersecurity / full-stack / ML opportunities.</span>` },
    { delay: 6200, html: `<span class="term-prompt">dharani@threatshield:~$</span> <span class="term-cmd">_</span>` }
  ];

  lines.forEach(({ delay, html }) => {
    setTimeout(() => {
      const span = document.createElement('span');
      span.className = 'term-line';
      span.innerHTML = html;
      termBody.appendChild(span);
      termBody.scrollTop = termBody.scrollHeight;
    }, delay);
  });
})();

/* ─────────────────────────────────────────
   10. SKILL BARS INTERSECTION OBSERVER
───────────────────────────────────────── */
(function animateSkillBars() {
  const fills = document.querySelectorAll('.sbi-fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        el.style.width = el.style.getPropertyValue('--pct');
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => observer.observe(f));
})();

/* ─────────────────────────────────────────
   11. PROJECT CARD GLITCH HOVER
───────────────────────────────────────── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.setProperty('--glitch', '1');
  });
  card.addEventListener('mouseleave', () => {
    card.style.setProperty('--glitch', '0');
  });
});

/* ─────────────────────────────────────────
   12. CONTACT FORM (TERMINAL STYLE)
───────────────────────────────────────── */
const cfSubmit = document.getElementById('cf-submit');
const cfStatus = document.getElementById('cf-status');

cfSubmit.addEventListener('click', () => {
  const name  = document.getElementById('cf-name').value.trim();
  const email = document.getElementById('cf-email').value.trim();
  const msg   = document.getElementById('cf-msg').value.trim();

  if (!name) { showCfStatus('⚠ ERROR: SENDER_ID field cannot be empty.', '#ff2233'); return; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showCfStatus('⚠ ERROR: ORIGIN_ADDR format invalid.', '#ff2233'); return;
  }
  if (!msg) { showCfStatus('⚠ ERROR: PAYLOAD cannot be empty.', '#ffcc00'); return; }

  const steps = [
    '> INITIALIZING SECURE CHANNEL...',
    '> ENCRYPTING PAYLOAD WITH AES-256...',
    '> AUTHENTICATING ORIGIN...',
    '> TRANSMITTING THROUGH TOR RELAY...',
    '✔ MESSAGE DELIVERED // ACCESS LOGGED'
  ];

  let i = 0;
  const colors = ['#00ccff','#cc44ff','#00ccff','#ffcc00','#00ff88'];
  cfSubmit.disabled = true;
  cfSubmit.textContent = 'TRANSMITTING...';

  function nextStep() {
    if (i >= steps.length) {
      document.getElementById('cf-name').value  = '';
      document.getElementById('cf-email').value = '';
      document.getElementById('cf-msg').value   = '';
      cfSubmit.disabled = false;
      cfSubmit.textContent = '&#9670; TRANSMIT ENCRYPTED';
      pushLog(`OUTBOUND: Encrypted contact message from ${name} <${email}>`, 'soc-type-info');
      return;
    }
    showCfStatus(steps[i], colors[i]);
    i++;
    setTimeout(nextStep, 600 + Math.random() * 400);
  }
  nextStep();
});

function showCfStatus(txt, color) {
  cfStatus.style.color = color;
  cfStatus.textContent = txt;
}

/* ─────────────────────────────────────────
   13. BOOT LOG — INITIAL SOC ENTRIES
───────────────────────────────────────── */
const bootLogs = [
  ['SYSTEM: ThreatShield SOC v2.4.1 initialized', 'soc-type-info'],
  ['SYSTEM: Matrix rain module loaded', 'soc-type-info'],
  ['SYSTEM: IDS signature database v4.8.2 loaded — 38,441 rules', 'soc-type-info'],
  ['SYSTEM: Firewall active — all ingress/egress policies enforced', 'soc-type-blocked'],
  ['SYSTEM: Attack simulation engine on standby', 'soc-type-info'],
  ['ALERT: 3 suspicious probes detected from external IPs', 'soc-type-alert'],
  ['BLOCKED: Port scan attempt dropped from 45.33.32.156', 'soc-type-blocked'],
];

bootLogs.forEach(([msg, cls], i) => {
  setTimeout(() => pushLog(msg, cls), 400 + i * 350);
});

/* ─────────────────────────────────────────
   14. INITIAL PACKET BURST ON LOAD
───────────────────────────────────────── */
setTimeout(() => {
  for (let i = 0; i < 6; i++) {
    setTimeout(spawnPacket, i * 200);
  }
}, 800);

/* ─────────────────────────────────────────
   15. SCROLL REVEAL FOR SECTIONS
───────────────────────────────────────── */
(function scrollReveal() {
  const sections = document.querySelectorAll('section');
  const style = document.createElement('style');
  style.textContent = `
    section { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
    section.revealed { opacity: 1; transform: translateY(0); }
    #hero { opacity: 1 !important; transform: none !important; }
  `;
  document.head.appendChild(style);

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });

  sections.forEach(s => obs.observe(s));
})();
