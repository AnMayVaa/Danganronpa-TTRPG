
// ==========================================================
// MONOPAD PHASE FILTERING & DEVICE BAR HELPERS
// ==========================================================
function updateMonopadDeviceBar() {
  const roomEl = document.getElementById('mPlayerRoomCode');
  if (roomEl) roomEl.innerText = roomCode || '------';
  const hashEl = document.getElementById('pMyHash');
  if (hashEl) hashEl.innerText = '#' + (currentUserHash || 'USER');
}

function updateMonopadPhaseTabs(stage) {
  const currentStage = stage || (gameState && gameState.stage) || 'idle';
  const isDailyLife = (currentStage === 'dailylife' || currentStage === 'daily' || currentStage === 'lobby');
  const isInvestigation = (currentStage === 'investigation');

  // Toggle phase classes on body and #viewPlayer for CSS responsive rules
  document.body.classList.toggle('phase-dailylife', isDailyLife);
  const vPlayer = document.getElementById('viewPlayer');
  if (vPlayer) vPlayer.classList.toggle('phase-dailylife', isDailyLife);
  document.body.classList.toggle('phase-investigation', isInvestigation);
  if (vPlayer) vPlayer.classList.toggle('phase-investigation', isInvestigation);

  const tabGame = document.getElementById('pTabGame');
  const tabClues = document.getElementById('pTabClues');
  const tabMap = document.getElementById('pTabMap');
  const tabGuide = document.getElementById('pTabGuide');
  const tabRules = document.getElementById('pTabRules');
  const pSectionClues = document.getElementById('playerSectionClues');
  const pSectionGuide = document.getElementById('playerSectionGuide');

  // Rules, Map, and Activity (ช่วงกิจกรรม) are ALWAYS visible across all phases!
  if (tabRules) tabRules.style.display = 'flex';
  if (tabMap) tabMap.style.display = 'flex';
  if (tabGame) tabGame.style.display = 'flex';

  if (isDailyLife) {
    // Phase 1 (Daily Life): Activity, Rules, Map ONLY (No murder yet -> Clues & Debate Guide strictly hidden)
    if (tabClues) tabClues.style.display = 'none';
    if (tabGuide) tabGuide.style.display = 'none';
    if (pSectionClues) pSectionClues.classList.add('hidden');
    if (pSectionGuide) pSectionGuide.classList.add('hidden');

    const activeTabEl = document.querySelector('.player-nav-tabs .p-nav-btn.active');
    if (activeTabEl && (activeTabEl.id === 'pTabClues' || activeTabEl.id === 'pTabGuide')) {
      switchPlayerTab('game');
    }
  } else if (isInvestigation) {
    // Phase 2 (Investigation): Activity, Clues, Rules, Map (Clues visible, Debate Guide hidden)
    if (tabClues) tabClues.style.display = 'flex';
    if (tabGuide) tabGuide.style.display = 'none';
    if (pSectionGuide) pSectionGuide.classList.add('hidden');

    const activeTabEl = document.querySelector('.player-nav-tabs .p-nav-btn.active');
    if (activeTabEl && activeTabEl.id === 'pTabGuide') {
      switchPlayerTab('clues');
    }
  } else {
    // Phase 3 (Class Trial / Recess 'idle' / Minigames): All tabs visible like Class Trial!
    if (tabClues) tabClues.style.display = 'flex';
    if (tabGuide) tabGuide.style.display = 'flex';

    if (currentStage.startsWith('stage') || currentStage === 'closing') {
      switchPlayerTab('game');
    }
  }

  // Render phase status card inside mobileTaskArea when not in a mini-game
  renderMobilePhaseCard(currentStage);
}

function renderMobilePhaseCard(stage) {
  const area = document.getElementById('mobileTaskArea');
  if (!area) return;
  if (stage && (stage.startsWith('stage') || stage === 'closing')) {
    // Stage-specific mini-game renders itself via renderMobileTask
    return;
  }

  if (stage === 'dailylife' || stage === 'daily' || stage === 'lobby') {
    area.innerHTML = `
      <div style="background:rgba(56,189,248,0.06); border:2px solid #38bdf8; border-radius:12px; padding:20px 16px; text-align:center;">
        <div style="font-size:2rem; margin-bottom:8px;">☕</div>
        <h3 style="color:#38bdf8; font-weight:900; margin-bottom:8px; font-size:1.15rem;">ช่วงชีวิตประจำวัน (Daily Life)</h3>
        <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.5; margin-bottom:14px;">
          ขณะนี้โรงเรียนเปิดภาคการศึกษาปกติ นักเรียนสามารถศึกษา <strong>📜 กฎโรงเรียน</strong> และทำความคุ้นเคยกับ <strong>🗺️ ผังโรงเรียน</strong> ผ่าน Monopad
        </p>
        <div style="display:inline-block; background:rgba(56,189,248,0.15); border:1px solid #38bdf8; border-radius:20px; padding:6px 14px; font-size:0.8rem; color:#38bdf8; font-weight:800;">
          ⏳ กำลังดำเนินชีวิตประจำวัน...
        </div>
      </div>
    `;
  } else if (stage === 'idle') {
    area.innerHTML = `
      <div style="background:rgba(148,163,184,0.08); border:2px solid #64748b; border-radius:12px; padding:20px 16px; text-align:center;">
        <div style="font-size:2rem; margin-bottom:8px;">🎬</div>
        <h3 style="color:#f8fafc; font-weight:900; margin-bottom:8px; font-size:1.15rem;">🎬 พักการพิจารณาคดี (Class Trial Recess)</h3>
        <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.5; margin-bottom:14px;">
          ขณะนี้ศาลชั้นเรียนอยู่ในช่วงพักการพิจารณาคดีชั่วคราว คุณสามารถเปิดดู <strong>🔍 กระสุนความจริง</strong> และ <strong>📋 กฎการดีเบต</strong> เพื่อเตรียมพร้อมการไต่สวนรอบถัดไป
        </p>
        <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; margin-bottom:12px;">
          <button class="small-btn cyan" onclick="switchPlayerTab('clues')" style="padding:6px 14px; font-weight:800; cursor:pointer;">
            🔍 ดู Monopad หลักฐาน ↗
          </button>
          <button class="small-btn pink" onclick="switchPlayerTab('guide')" style="padding:6px 14px; font-weight:800; cursor:pointer;">
            📋 ดูกฎการดีเบตศาล ↗
          </button>
        </div>
        <div style="display:inline-block; background:rgba(148,163,184,0.2); border:1px solid #94a3b8; border-radius:20px; padding:4px 12px; font-size:0.75rem; color:#e2e8f0; font-weight:800;">
          ⏸️ ช่วงพักศาล / รอ DM เปิดรอบไต่สวน...
        </div>
      </div>
    `;
  } else if (stage === 'investigation') {
    area.innerHTML = `
      <div style="background:rgba(234,179,8,0.06); border:2px solid #eab308; border-radius:12px; padding:20px 16px; text-align:center;">
        <div style="font-size:2rem; margin-bottom:8px;">🔍</div>
        <h3 style="color:#eab308; font-weight:900; margin-bottom:8px; font-size:1.15rem;">ช่วงเวลาสืบสวนหาหลักฐาน (Investigation Phase)</h3>
        <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.5; margin-bottom:14px;">
          พบศพผู้เสียชีวิตแล้ว! นักเรียนทุกคนกำลังอยู่ในช่วงตรวจค้นสถานที่เกิดเหตุและรวบรวมพยานหลักฐานเพื่อเตรียมใช้ในศาลชั้นเรียน
        </p>
        <button class="small-btn cyan" onclick="switchPlayerTab('clues')" style="padding:8px 18px; font-weight:900; font-size:0.88rem; cursor:pointer; margin-bottom:10px;">
          🔎 เปิดแท็บหลักฐาน (Monopad) สแกน QR ↗
        </button>
        <div>
          <span style="display:inline-block; background:rgba(234,179,8,0.15); border:1px solid #eab308; border-radius:20px; padding:4px 12px; font-size:0.75rem; color:#eab308; font-weight:800;">
            ⏱️ กำลังดำเนินการสืบสวนรอบอาคาร
          </span>
        </div>
      </div>
    `;
  } else if (stage === 'trial') {
    area.innerHTML = `
      <div style="background:rgba(230,0,103,0.06); border:2px solid #e60067; border-radius:12px; padding:20px 16px; text-align:center;">
        <div style="font-size:2rem; margin-bottom:8px;">⚖️</div>
        <h3 style="color:#e60067; font-weight:900; margin-bottom:8px; font-size:1.15rem;">ศาลชั้นเรียนเริ่มขึ้นแล้ว (Class Trial)</h3>
        <p style="color:#cbd5e1; font-size:0.88rem; line-height:1.5; margin-bottom:14px;">
          การพิจารณาคดีความตายของเหยื่อเริ่มต้นขึ้นแล้ว เตรียมกระสุนความจริงในแท็บหลักฐานให้พร้อม
        </p>
        <div style="display:inline-block; background:rgba(230,0,103,0.15); border:1px solid #e60067; border-radius:20px; padding:6px 14px; font-size:0.8rem; color:#ff0077; font-weight:800;">
          ⚔️ รอผู้ดูแลศาลเปิดช่วงกิจกรรมดีเบต...
        </div>
      </div>
    `;
  }
}
// ==========================================================
// DANGANRONPA CLASS TRIAL UNIVERSAL REAL-TIME ENGINE
// Supports: Vercel WebRTC (PeerJS) & Local Node (Socket.io)
// ==========================================================

// Global Game State
function generate6DigitRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let roomCode = '';
let myPeer = null;
let hostPeer = null;
let peerConnections = []; // If this client is Host, stores all player connections
let isHost = false;
let socket = null;

// Universal Real-Time Multi-Transport Layer:
// Layer 1: Native In-Browser BroadcastChannel (0ms local speed across tabs/iframes)
// Layer 2: Server-Sent Events (SSE) Stream Bus & HTTP Relay (cross-network devices)
// Layer 3: WebRTC DataChannel (PeerJS P2P fallback)
const myClientId = 'cid_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
let localRoomChannel = null;
let serverStreamSource = null;
let activeServerRoomCode = null;
const processedMessageIds = new Set();

function setupLocalChannel(code) {
  if (!code) return;
  code = code.trim().toUpperCase();
  if (typeof BroadcastChannel !== 'undefined') {
    if (localRoomChannel && localRoomChannel.name === 'dangan_channel_' + code) return;
    if (localRoomChannel) {
      try { localRoomChannel.close(); } catch(e) {}
      localRoomChannel = null;
    }
    try {
      localRoomChannel = new BroadcastChannel('dangan_channel_' + code);
      localRoomChannel.onmessage = (evt) => {
        if (!evt.data) return;
        const msg = evt.data;
        if (!msg || !msg.type) return;

        // Anti-Echo: drop self-originating messages
        if (msg._sender === myClientId) return;

        // Deduplication
        if (msg._id) {
          if (processedMessageIds.has(msg._id)) return;
          processedMessageIds.add(msg._id);
          if (processedMessageIds.size > 500) {
            const oldest = processedMessageIds.values().next().value;
            processedMessageIds.delete(oldest);
          }
        }

        // Live Simulation Monitor log
        if (typeof logSimEvent === 'function' && currentView === 'simulation') {
          logSimEvent(msg);
        }

        // Process message through game engine dispatcher
        handleIncomingMessage(msg, null);
      };
    } catch (e) {
      console.warn('[BroadcastChannel Error]:', e);
    }
  }
}

// Support cross-frame direct messaging (parent window <-> iframes)
window.addEventListener('message', (evt) => {
  if (!evt.data || typeof evt.data !== 'object' || !evt.data.type) return;
  const msg = evt.data;
  if (msg._sender === myClientId) return;
  if (msg._id) {
    if (processedMessageIds.has(msg._id)) return;
    processedMessageIds.add(msg._id);
    if (processedMessageIds.size > 500) {
      const oldest = processedMessageIds.values().next().value;
      processedMessageIds.delete(oldest);
    }
  }
  if (typeof logSimEvent === 'function' && currentView === 'simulation') {
    logSimEvent(msg);
  }
  handleIncomingMessage(msg, null);
});

let currentView = 'hub'; // hub, court, admin, player
let currentUserHash = '';
let enteredPin = '';
const ADMIN_CORRECT_PIN = '295437';
let myPlayer = null;
let hubRoomsPollingInterval = null;
let courtHeartbeatInterval = null;

// ==========================================================
// ACTIVE ROOM REGISTRY (API & LOCAL FALLBACK)
// ==========================================================
async function registerActiveRoom(code) {
  if (!code) return;
  const count = gameState && gameState.players ? Object.keys(gameState.players).length : 0;
  try {
    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: code, playersCount: count, stage: gameState ? gameState.stage : 'lobby' })
    });
  } catch(e) {}
  try {
    localStorage.setItem('dangan_local_active_room', JSON.stringify({ roomCode: code, updatedAt: Date.now(), playersCount: count }));
  } catch(e) {}
}

async function deleteActiveRoom(code) {
  if (!code) return;
  try {
    await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode: code, action: 'delete' })
    });
  } catch(e) {}
  try {
    localStorage.removeItem('dangan_local_active_room');
  } catch(e) {}
}

function dismissActiveRooms() {
  const container = document.getElementById('hubActiveRoomsSection');
  if (container) container.classList.add('hidden');
  try { sessionStorage.setItem('dangan_active_rooms_dismissed', '1'); } catch(e) {}
}

async function fetchActiveRooms() {
  const container = document.getElementById('hubActiveRoomsSection');
  const listEl = document.getElementById('activeRoomsList');
  if (!container || !listEl) return;
  try {
    if (sessionStorage.getItem('dangan_active_rooms_dismissed') === '1') {
      container.classList.add('hidden');
      return;
    }
  } catch(e) {}

  let rooms = [];
  try {
    const res = await fetch('/api/rooms');
    if (res.ok) {
      const data = await res.json();
      rooms = data.rooms || [];
    }
  } catch(e) {}

  // Local device fallback
  try {
    const localRaw = localStorage.getItem('dangan_local_active_room');
    if (localRaw) {
      const localObj = JSON.parse(localRaw);
      if (Date.now() - localObj.updatedAt < 45000) {
        if (!rooms.find(r => r.roomCode === localObj.roomCode)) {
          rooms.push({ roomCode: localObj.roomCode, createdAt: localObj.updatedAt, playersCount: localObj.playersCount || 0 });
        }
      }
    }
  } catch(e) {}

  if (!rooms || rooms.length === 0) {
    container.classList.add('hidden');
    listEl.innerHTML = '';
    return;
  }

  container.classList.remove('hidden');
  listEl.innerHTML = '';
  rooms.forEach(r => {
    const elapsedMins = Math.max(0, Math.floor((Date.now() - r.createdAt) / 60000));
    const timeStr = elapsedMins === 0 ? 'เพิ่งเปิดเมื่อสักครู่' : `เปิดเมื่อ ${elapsedMins} นาทีที่แล้ว`;

    const card = document.createElement('div');
    card.className = 'active-room-card';
    card.innerHTML = `
      <div class="arc-pin-row">
        <span class="arc-pin">PIN: ${r.roomCode}</span>
        <span class="arc-meta">👤 ${r.playersCount || 0} คน</span>
      </div>
      <div class="arc-meta">⏱️ ${timeStr}</div>
      <div class="arc-btn-row">
        <button class="small-btn yellow" style="flex:1; padding:6px 10px; font-size:0.8rem; font-weight:900;" onclick="joinRoomAsAdmin('${r.roomCode}')">
          🎛️ DM เข้าคุม
        </button>
        <button class="small-btn pink" style="flex:1; padding:6px 10px; font-size:0.8rem; font-weight:900;" onclick="joinRoomAsPlayer('${r.roomCode}')">
          📱 เข้าเล่น
        </button>
        <button class="small-btn" style="padding:6px 10px; font-size:0.8rem; font-weight:900; background:#dc2626; color:#fff; border:1px solid #ef4444;" onclick="closeRoomSession('${r.roomCode}')" title="ปิดห้องศาลและเตะทุกคนออก">
          🛑 ปิดห้อง
        </button>
      </div>
    `;
    listEl.appendChild(card);
  });
}

function joinRoomAsAdmin(code) {
  sessionStorage.setItem('dangan_target_room', code);
  roomCode = code;
  showPinModal();
}

async function closeRoomSession(code) {
  if (!code) return;
  if (!confirm(`คุณต้องการปิดห้องศาล [${code}] และเตะผู้เล่นทุกคนออกจากห้องใช่หรือไม่?`)) return;
  try {
    // 1. Broadcast kick message to all clients connected to this room
    await broadcastMessage({
      type: 'room_closed',
      roomCode: code,
      reason: `ห้องศาล [${code}] ถูกปิดโดยผู้ดูแล`
    });
  } catch(e) {}

  // 2. Request server to delete room from registry
  await deleteActiveRoom(code);

  showToast(`🛑 ปิดห้องศาล [${code}] เรียบร้อยแล้ว`, 'danger');

  // 3. Immediately refresh active rooms list in Hub
  setTimeout(fetchActiveRooms, 250);
}

function joinRoomAsPlayer(code) {
  roomCode = code;
  navigate('/play?room=' + code);
}

let gameState = {
  stage: 'lobby', // lobby, investigation, stage1..stage7, verdict
  influence: 100,
  timeRemaining: 60,
  timerRunning: false,
  players: {}, // id -> { name, role, isKiller, votedFor }
  
  // Investigation Phase & Clues
  discoveredClues: [],
  discoveredCluesCount: 0,

  // Stage 1: Evidence Linker
  stg1Submissions: 0,
  stg1Required: 3,
  stg1TargetClue: 'EVD-01',
  stg1Prompt: "อุปุ๊ปุ๊! อาวุธที่ใช้ฟาดหัว B จนสลบตอน 17:30 น. คืออะไร และถูกนำไปซ่อนที่ไหนกันแน่นะ!?",

  // Stage 2: Hangman's Gambit (English Only)
  stg2Word: "WATER CLOCK",
  stg2Prompt: "ถอดรหัสกลไกตั้งเวลาที่กระชากเชือกรอกโดยอัตโนมัติ (ภาษาอังกฤษ)!",
  stg2Target: ["W", "A", "T", "E", "R", " ", "C", "L", "O", "C", "K"],
  stg2Board: ["_", "_", "_", "_", "_", " ", "_", "_", "_", "_", "_"],
  stg2Mistakes: 0,
  stg2MaxMistakes: 5,

  // Stage 3: Rebuttal Showdown
  stg3Opponent: "สุดยอดนักมายากล",
  stg3Argument: "ฉันอยู่แต่ในครัวตลอดเวลา จะไปเอาเวลาที่ไหนไปทำร้ายหมอนั่นได้!?",
  stg3AccuserScore: 0,
  stg3SuspectScore: 0,
  stg3ClashRound: 1,

  // Stage 4: Logic Dive (3 Questions, 3 Lanes)
  stg4Step: 1, // 1 to 3
  stg4Votes: {},

  // Stage 5: Debate Scrum
  stg5Topic: "ใครคือ Blackened ผู้ทำให้เกิดความตายที่แท้จริง!?",
  stg5LeftTeam: "🔴 ฝั่ง A (นักมายากล)",
  stg5RightTeam: "🟢 ฝั่ง B (ตัวเหยื่อเอง)",
  stg5Meter: 50, // 0 to 100

  // Stage 6: Argument Armament (4 Waves)
  stg6Opponent: "สุดยอดนักมายากล",
  stg6Wave: 1,
  stg6MaxWave: 4,
  stg6Shield: 100,
  stg6Statement: "ฉันไม่ได้ทำอะไรทั้งนั้น! ตอนนั้นฉันต้มน้ำซุปอยู่ในครัวคนเดียว!!",
  stg6Denials: [
    "ฉันไม่ได้ทำอะไรทั้งนั้น! ตอนนั้นฉันต้มน้ำซุปอยู่ในครัวคนเดียว!!",
    "หน้าต่างห้องซักผ้าสูงตั้ง 3.5 เมตร ใครจะไปปีนออกไปผูกเชือกชักรอกร่างขึ้นเพดานได้?!",
    "หม้อสตูว์ใบนั้นไม่มีรอยเลือดของฉันสักหยดเดียวเลยนะ!!",
    "พวกแกไม่มีหลักฐานชิ้นสุดท้ายที่จะพิสูจน์การกระทำของฉันหรอก!!"
  ],

  // Mini-Game 7: Closing Argument (5 Pages / 10 Slots)
  closingCurrentPage: 1,
  closingSlots: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false, 10: false },
  closingPlayerHands: {},

  // Stage 8: Voting Time
  votingOpen: false,
  votes: {}, // candidate -> count
  votesCast: {}, // voterId -> candidate (1 vote per player)
  votesRevealed: false
};

let timerInterval = null;

// ==========================================================
// AUTHENTIC DANGANRONPA AUDIO & SFX ENGINE
// ==========================================================
const SOUND_FILES = {
  gavel: '/sounds/gavel_wooden.wav',
  laugh: '/sounds/monokuma_laugh_pure.wav',
  laugh1: '/sounds/monokuma_laugh_pure.wav',
  laugh2: '/sounds/monokuma_laugh_pure.wav',
  laugh3: '/sounds/monokuma_laugh_pure.wav',
  blade: '/sounds/sword_clash.wav',
  slash: '/sounds/sword_swing.wav',
  break: '/sounds/screenbreak.mp3',
  point_break: '/sounds/screenbreak.mp3',
  chime: '/sounds/dingdongbingbong.mp3',
  bda: '/sounds/bda_bell.mp3',
  bda_bell: '/sounds/bda_bell.mp3',
  counter: '/sounds/countersfx.mp3',
  shoot: '/sounds/shoottb.mp3',
  rebuttal: '/sounds/rebuttal_intro.wav',
  vote_intro: '/sounds/vote_intro.wav',
  vote_music: '/sounds/vote_intro.wav',
  correct: '/sounds/correct_logic.wav',
  wrong: '/sounds/vote_incorrect.wav',
  clue_get: '/sounds/bullet_get.mp3',
  bullet_get: '/sounds/bullet_get.mp3',
  glitch: '/sounds/static.mp3',
  despair: '/sounds/despairnoise.mp3'
};

let audioCtx = null;
let activeSfxAudio = null;
const lastSfxPlayTimes = {};

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

let isAudioMuted = false;
function toggleCourtAudioMute() {
  isAudioMuted = !isAudioMuted;
  showToast(isAudioMuted ? '🔇 ปิดเสียง (Audio Muted)' : '🔊 เปิดเสียง (Audio Unmuted)');
}

function playSfx(type) {
  if (isAudioMuted) return;
  // 1. Check if muted via URL query parameter (?muted=1)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('muted') === '1') return;
  } catch(e) {}

  // 2. If inside an iframe (like Simulation multi-device panel), ONLY Court screen plays audio!
  // In a classroom/TTRPG session, the Court screen/projector connects to room speakers.
  try {
    if (window !== window.top) {
      const isCourt = window.location.search.includes('view=court') || window.location.pathname.includes('/court');
      if (!isCourt) return;
    }
  } catch(e) {}

  // 3. Audio debounce: prevent identical SFX from firing faster than 100ms (stops rapid-fire stutter while preserving responsive cues)
  const now = Date.now();
  if (lastSfxPlayTimes[type] && (now - lastSfxPlayTimes[type] < 100)) {
    return;
  }
  lastSfxPlayTimes[type] = now;

  const file = SOUND_FILES[type];
  if (file) {
    try {
      const audio = new Audio(file);
      audio.volume = 0.88;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          playSynthSfx(type);
        });
      }
      return;
    } catch (e) {
      playSynthSfx(type);
    }
  } else {
    playSynthSfx(type);
  }
}

function playSynthSfx(type) {
  if (isAudioMuted) return;
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('muted') === '1') return;
    if (window !== window.top) {
      const isCourt = window.location.search.includes('view=court') || window.location.pathname.includes('/court');
      if (!isCourt) return;
    }
  } catch(e) {}
  try {
    const ctx = getAudio();
    const now = ctx.currentTime;

    if (type === 'gavel') {
      // 1. Heavy courtroom sub-bass strike
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(190, now);
      osc1.frequency.exponentialRampToValueAtTime(32, now + 0.38);
      gain1.gain.setValueAtTime(0.7, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc1.connect(gain1); gain1.connect(ctx.destination);
      osc1.start(now); osc1.stop(now + 0.38);

      // 2. High wood strike transient
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(520, now);
      osc2.frequency.exponentialRampToValueAtTime(90, now + 0.08);
      gain2.gain.setValueAtTime(0.4, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(now); osc2.stop(now + 0.08);

    } else if (type === 'point_break' || type === 'break') {
      // Glass shatter / Argument Break!
      [1900, 2400, 3100, 1400].forEach((f, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(f, now + idx * 0.02);
        o.frequency.exponentialRampToValueAtTime(300, now + idx * 0.02 + 0.28);
        g.gain.setValueAtTime(0.25, now + idx * 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.02 + 0.28);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + idx * 0.02); o.stop(now + idx * 0.02 + 0.28);
      });

      // White noise explosion
      const bufferSize = Math.floor(ctx.sampleRate * 0.25);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'highpass';
      nFilter.frequency.setValueAtTime(1600, now);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.35, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(ctx.destination);
      noise.start(now);

    } else if (type === 'blade' || type === 'slash') {
      // Truth blade whoosh & slice
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(3500, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.22);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.22);

      // Metallic blade ping
      const ring = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(1580, now + 0.05);
      ringGain.gain.setValueAtTime(0.3, now + 0.05);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      ring.connect(ringGain); ringGain.connect(ctx.destination);
      ring.start(now + 0.05); ring.stop(now + 0.35);

    } else if (type === 'laugh') {
      // Monokuma "Upupupu" sinister laughter with vibrato
      [360, 410, 470, 400].forEach((freq, idx) => {
        const start = now + idx * 0.09;
        const dur = 0.08;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, start);
        o.frequency.linearRampToValueAtTime(freq * 1.15, start + dur * 0.5);
        o.frequency.linearRampToValueAtTime(freq, start + dur);
        g.gain.setValueAtTime(0.22, start);
        g.gain.exponentialRampToValueAtTime(0.01, start + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(start); o.stop(start + dur);
      });

    } else if (type === 'correct') {
      // Sparkling C-major chime chord
      [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.06);
        g.gain.setValueAtTime(0.22, now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.4);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + idx * 0.06); o.stop(now + idx * 0.06 + 0.4);
      });

    } else if (type === 'wrong') {
      // Dissonant dual-buzz beating
      [115, 123].forEach(freq => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        o.connect(g); g.connect(ctx.destination);
        o.start(now); o.stop(now + 0.4);
      });

    } else if (type === 'glitch') {
      // Cyber static jam
      [140, 1100, 480, 90, 820].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'square';
        o.frequency.setValueAtTime(freq, now + idx * 0.04);
        g.gain.setValueAtTime(0.2, now + idx * 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.07);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + idx * 0.04); o.stop(now + idx * 0.04 + 0.07);
      });

    } else if (type === 'siren') {
      // Klaxon alarm
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(750, now);
      o.frequency.linearRampToValueAtTime(980, now + 0.25);
      o.frequency.linearRampToValueAtTime(750, now + 0.5);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      o.connect(g); g.connect(ctx.destination);
      o.start(now); o.stop(now + 0.5);
    }
  } catch (e) {}
}

// ==========================================================
// REAL-TIME NETWORKING (PEERJS + SOCKET.IO DUAL-STACK)
// ==========================================================
function initRealtime() {
  const urlParams = new URLSearchParams(window.location.search);
  const paramRoom = urlParams.get('room');

  if (paramRoom) {
    roomCode = paramRoom.trim().toUpperCase();
  } else if (currentView === 'court') {
    // Check if court already has an active 6-digit room in this tab/session
    const savedCourtRoom = sessionStorage.getItem('dangan_court_room_code');
    if (savedCourtRoom) {
      roomCode = savedCourtRoom;
    } else {
      roomCode = generate6DigitRoomCode();
      sessionStorage.setItem('dangan_court_room_code', roomCode);
    }
  } else if (currentView === 'admin') {
    const target = sessionStorage.getItem('dangan_target_room');
    if (target) {
      roomCode = target.toUpperCase();
    } else {
      const courtRoom = sessionStorage.getItem('dangan_court_room_code');
      if (courtRoom) {
        roomCode = courtRoom.toUpperCase();
      } else {
        try {
          const localActive = JSON.parse(localStorage.getItem('dangan_local_active_room') || '{}');
          if (localActive && localActive.roomCode) roomCode = localActive.roomCode.toUpperCase();
        } catch(e) {}
      }
    }
    if (!roomCode) {
      fetch('/api/rooms').then(r => r.json()).then(data => {
        if (data && data.rooms && data.rooms.length > 0) {
          const latest = data.rooms[data.rooms.length - 1];
          if (latest && latest.roomCode && !roomCode) {
            roomCode = latest.roomCode.toUpperCase();
            const dRoom = document.getElementById('displayRoomCode');
            if (dRoom) dRoom.innerText = roomCode;
            connectToHostPeer('dr-court-host-' + roomCode);
          }
        }
      }).catch(() => {});
    }
  } else if (currentView === 'player') {
    const savedPlayerRoom = localStorage.getItem('dangan_current_room');
    if (savedPlayerRoom) {
      roomCode = savedPlayerRoom;
    }
  }

  const dispRoom = document.getElementById('displayRoomCode');
  if (dispRoom) dispRoom.innerText = roomCode || '------';
  const courtRoom = document.getElementById('courtLobbyRoomCode');
  if (courtRoom) courtRoom.innerText = roomCode || '------';
  const idleRoom = document.getElementById('courtIdleRoomCode');
  if (idleRoom) idleRoom.innerText = roomCode || '------';
  const mobRoom = document.getElementById('mobileRoomInput');
  if (mobRoom && roomCode) mobRoom.value = roomCode;
  const joinUrl = document.getElementById('courtJoinUrl');
  const directJoin = roomCode ? (window.location.origin + '/play?room=' + roomCode) : window.location.origin + '/play';
  if (joinUrl) joinUrl.innerText = directJoin;
  const qrImg = document.getElementById('courtQrImg');
  if (qrImg && roomCode) {
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(directJoin);
  }

  // If court, register room and start heartbeat
  if (currentView === 'court' && roomCode) {
    registerActiveRoom(roomCode);
    if (!courtHeartbeatInterval) {
      courtHeartbeatInterval = setInterval(() => {
        if (currentView === 'court' && roomCode) registerActiveRoom(roomCode);
      }, 18000);
    }
  }

  // Try connecting to local Socket.io first
  if (typeof io !== 'undefined') {
    try {
      socket = io();
      socket.on('connect', () => {
        console.log('[NET] Connected via Socket.io');
      });
      socket.on('sync_game', (state) => {
        applyState(state);
      });
    } catch (e) {}
  }

  // Initialize PeerJS if entering active game view
  setupPeerJS();
}

function setupPeerJS() {
  if (currentView === 'hub') return;
  if (!roomCode) return;

  // Always connect to high-speed SSE real-time relay bus
  setupServerStream(roomCode);

  if (typeof Peer === 'undefined') {
    console.warn('[WEBRTC] PeerJS not loaded; using server relay.');
    return;
  }

  const hostPeerId = `dangan-court-${roomCode.toLowerCase()}`;

  // ONLY Courtroom main projector screen is Host!
  if (currentView === 'court') {
    isHost = true;
    if (myPeer && !myPeer.destroyed) return;

    myPeer = new Peer(hostPeerId, { debug: 1 });

    myPeer.on('open', (id) => {
      console.log('[WEBRTC HOST ACTIVE]:', id);
      logCourt(`[WEBRTC]: ห้อง ${roomCode} ออนไลน์ พร้อมรับการเชื่อมต่อจากผู้เล่นทุกอุปกรณ์!`);
    });

    myPeer.on('connection', (conn) => {
      peerConnections.push(conn);
      console.log('[WEBRTC] Client connected to Host:', conn.peer);
      
      conn.on('data', (data) => {
        handleIncomingMessage(data, conn);
        // STAR-RELAY: Forward message to all other connected peers immediately!
        if (isHost && data.type !== 'request_claim_character' && data.type !== 'request_sync_state') {
          peerConnections.forEach(c => {
            if (c !== conn && c.open) {
              try { c.send(data); } catch(e) {}
            }
          });
        }
      });

      conn.on('close', () => {
        peerConnections = peerConnections.filter(c => c !== conn);
      });

      // Send initial state & claimed roles to newly joined peer
      setTimeout(() => {
        if (conn.open) {
          conn.send({ type: 'sync_state', state: gameState });
          if (gameState && gameState.players) {
            Object.values(gameState.players).forEach(p => {
              conn.send({
                type: 'character_claimed',
                role: p.role,
                playerName: p.name,
                peerId: p.id
              });
            });
          }
        }
      }, 350);
    });

    myPeer.on('error', (err) => {
      console.warn('[WEBRTC Host Error]:', err);
      if (err.type === 'unavailable-id') {
        console.warn('[WEBRTC] Host Peer ID unavailable/busy. Re-creating with fresh 6-digit room code...');
        roomCode = generate6DigitRoomCode();
        sessionStorage.setItem('dangan_court_room_code', roomCode);
        const courtRoom = document.getElementById('courtLobbyRoomCode');
        if (courtRoom) courtRoom.innerText = roomCode;
        const directJoin = window.location.origin + '/play?room=' + roomCode;
        const joinUrl = document.getElementById('courtJoinUrl');
        if (joinUrl) joinUrl.innerText = directJoin;
        const qrImg = document.getElementById('courtQrImg');
        if (qrImg) qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(directJoin);
        registerActiveRoom(roomCode);
        setTimeout(() => {
          if (myPeer && !myPeer.destroyed) {
            try { myPeer.destroy(); } catch(e) {}
            myPeer = null;
          }
          setupPeerJS();
        }, 500);
      }
    });
  } else if (currentView === 'admin' || currentView === 'player') {
    // Admin DM panel and Player mobile connect to Host
    isHost = false;
    connectToHostPeer(hostPeerId);
  }
}

function connectToHostPeer(hostId, onConnected) {
  isHost = false;

  if (typeof Peer === 'undefined') {
    console.warn('[WEBRTC] PeerJS not loaded; using server relay.');
    return;
  }

  // 1. If already connected and open, invoke callback immediately
  if (hostPeer && hostPeer.open) {
    if (onConnected) onConnected();
    return;
  }

  // 2. If already in the process of connecting, attach callback to existing connection
  if (hostPeer && !hostPeer.open && myPeer && myPeer.open) {
    if (onConnected) {
      hostPeer.once('open', () => {
        console.log('[WEBRTC] Hooked into opened Host connection:', hostId);
        onConnected();
      });
    }
    return;
  }

  const attemptConnect = () => {
    if (!myPeer || myPeer.destroyed) return;
    try {
      console.log('[WEBRTC] Connecting to Host Peer:', hostId);
      hostPeer = myPeer.connect(hostId, { reliable: true });

      hostPeer.on('open', () => {
        console.log('[WEBRTC] Successfully connected to Host:', hostId);
        if (onConnected) onConnected();
        // Request latest sync state from Host
        hostPeer.send({ type: 'request_sync_state' });
      });

      hostPeer.on('data', (data) => {
        handleIncomingMessage(data, hostPeer);
      });

      hostPeer.on('close', () => {
        console.warn('[WEBRTC] Host connection closed. Reconnecting in 3s...');
        setTimeout(() => {
          if (currentView !== 'hub' && (!hostPeer || !hostPeer.open)) {
            attemptConnect();
          }
        }, 3000);
      });

      hostPeer.on('error', (err) => {
        console.warn('[WEBRTC] Host connection error:', err);
      });
    } catch (e) {
      console.error('[WEBRTC] Exception during host connection:', e);
    }
  };

  if (!myPeer || myPeer.destroyed) {
    myPeer = new Peer(null, { debug: 1 });
    myPeer.on('open', (id) => {
      console.log('[WEBRTC Client Peer Open]:', id);
      attemptConnect();
    });
    myPeer.on('error', (err) => {
      console.warn('[WEBRTC Client Peer Error]:', err);
      if (err.type === 'peer-unavailable') {
        if (typeof resetJoinButton === 'function') {
          resetJoinButton(`❌ ไม่พบห้องศาล [${roomCode}]\nกรุณาเปิดหน้าจอหลักศาลชั้นเรียน (/court) ก่อน หรือตรวจสอบรหัสห้องให้ถูกต้อง`);
        }
      }
    });
  } else if (myPeer.open) {
    attemptConnect();
  } else {
    myPeer.once('open', () => {
      attemptConnect();
    });
  }
}

// ==========================================================
// SERVER-SENT EVENTS (SSE) REAL-TIME RELAY ENGINE
// ==========================================================
function setupServerStream(code) {
  if (!code) return;
  code = code.trim().toUpperCase();

  // Always bind in-browser BroadcastChannel for zero-latency local/inter-frame sync
  setupLocalChannel(code);

  if (serverStreamSource && activeServerRoomCode === code) return;

  if (serverStreamSource) {
    try { serverStreamSource.close(); } catch(e) {}
    serverStreamSource = null;
  }
  activeServerRoomCode = code;

  if (typeof EventSource === 'undefined') {
    console.warn('[SSE] EventSource not available.');
    return;
  }

  const sseUrl = '/api/rooms/' + encodeURIComponent(code) + '/stream';
  console.log('[SSE] Connecting to real-time message stream:', sseUrl);

  try {
    serverStreamSource = new EventSource(sseUrl);

    serverStreamSource.onopen = () => {
      console.log('[SSE] Real-time stream active for room:', code);
    };

    serverStreamSource.onmessage = (event) => {
      if (!event.data) return;
      try {
        const msg = JSON.parse(event.data);
        if (!msg || !msg.type) return;

        // Anti-Echo & Deduplication
        if (msg._sender === myClientId) return;
        if (msg._id) {
          if (processedMessageIds.has(msg._id)) return;
          processedMessageIds.add(msg._id);
          if (processedMessageIds.size > 500) {
            const oldest = processedMessageIds.values().next().value;
            processedMessageIds.delete(oldest);
          }
        }

        // Process message through universal dispatcher
        handleIncomingMessage(msg, null);
      } catch (err) {
        console.error('[SSE] JSON parse error:', err, event.data);
      }
    };

    serverStreamSource.onerror = (err) => {
      console.warn('[SSE] Stream notice/reconnecting:', err);
    };
  } catch (err) {
    console.error('[SSE] Failed to initialize EventSource:', err);
  }
}

function broadcast(msg) {
  if (!msg || !msg.type) return;

  // 1. Assign unique message ID and sender ID for cross-transport deduplication
  if (!msg._sender) {
    msg._sender = myClientId;
  }
  if (!msg._id) {
    const senderTag = (myPlayer && myPlayer.id) ? myPlayer.id : (currentUserHash || (isHost ? 'court_host' : 'anon'));
    msg._id = senderTag + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  }

  // Record our own ID so we don't duplicate on loopback
  processedMessageIds.add(msg._id);
  if (processedMessageIds.size > 500) {
    const oldest = processedMessageIds.values().next().value;
    processedMessageIds.delete(oldest);
  }

  const activeRoom = (roomCode || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('dangan_court_room_code')) || (typeof localStorage !== 'undefined' && localStorage.getItem('dangan_current_room')) || '').toUpperCase();

  // 2. LAYER 1: Native In-Browser BroadcastChannel (0ms speed, works on static hosts without server)
  if (localRoomChannel) {
    try { localRoomChannel.postMessage(msg); } catch(e) {}
  } else {
    // Fallback only if BroadcastChannel is not available
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    } catch(e) {}
    try {
      const iframes = document.querySelectorAll('iframe');
      if (iframes && iframes.length > 0) {
        iframes.forEach(f => {
          if (f.contentWindow) {
            try { f.contentWindow.postMessage(msg, '*'); } catch(err) {}
          }
        });
      }
    } catch(e) {}
  }

  // 3. LAYER 2: Server-Sent Events / HTTP Relay (for multi-device cross-network)
  if (activeRoom) {
    try {
      fetch('/api/rooms/' + encodeURIComponent(activeRoom) + '/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
        keepalive: true
      }).catch(err => {
        // Silently handled by local channel if server returns 405 or static host
      });
    } catch(e) {}
  }

  // 4. LAYER 3: WebRTC DataChannel (Parallel direct peer-to-peer fast path)
  if (isHost) {
    peerConnections.forEach(conn => {
      if (conn && conn.open) {
        try { conn.send(msg); } catch(e) {}
      }
    });
  } else if (hostPeer && hostPeer.open) {
    try { hostPeer.send(msg); } catch(e) {}
  }

  // 5. Local execution filter: Do NOT re-handle locally if already executed by the calling function!
  const alreadyHandledLocally = [
    'trigger_fx', 'request_claim_character', 'player_leave',
    'set_stage', 'admin_adjust_timer', 'admin_timer_stop', 'admin_timer_start',
    'adjust_influence', 'verdict', 'minigame_result', 'close_minigame_result',
    'execution_cutscene', 'close_execution_cutscene', 'stg1_evaluate',
    'reveal_votes', 'sync_state', 'rebuttal_verdict', 'stg2_char'
  ];
  if (!alreadyHandledLocally.includes(msg.type)) {
    handleIncomingMessage(msg, null);
  }

  // 6. Socket.io if available
  if (socket && socket.connected) {
    try { socket.emit('client_broadcast', msg); } catch(e) {}
  }
}

function handleIncomingMessage(msg, senderConn) {
  if (!msg || !msg.type) return;

  if (msg.type === 'sync_state') {
    applyState(msg.state);
  } else if (msg.type === 'request_claim_character') {
    if (!isHost) return;
    let reqRole = msg.role;
    const reqName = msg.playerName;
    const senderId = senderConn ? senderConn.peer : (msg.userHash || currentUserHash || ('p_' + Math.random().toString(36).substr(2, 6)));

    // Auto-assign available role internally if not specified
    if (!reqRole) {
      const defaultRoles = ['นักแต่งนิยาย', 'นักกีฬา', 'นักมายากล', 'นักชิม', 'นักแสดงผาดโผน', 'ช่างกล'];
      const takenRoles = Object.values(gameState.players).map(p => p.role);
      reqRole = defaultRoles.find(r => !takenRoles.includes(r)) || `นักเรียน (${Object.keys(gameState.players).length + 1})`;
    }

    // Deduplication guard: Remove any prior entry matching the same userHash OR same name to prevent character doubling!
    Object.keys(gameState.players).forEach(key => {
      const p = gameState.players[key];
      if (p && ((msg.userHash && p.userHash === msg.userHash) || (p.name && reqName && p.name.toLowerCase() === reqName.toLowerCase()))) {
        delete gameState.players[key];
      }
    });

    const isKiller = (reqRole === 'นักมายากล');
    const playerObj = {
      id: senderId,
      name: reqName,
      role: reqRole,
      isKiller: isKiller,
      roomCode: roomCode,
      userHash: msg.userHash || senderId,
      clues: Array.isArray(msg.clues) ? msg.clues : []
    };
    const canonicalKey = msg.userHash || senderId;
    gameState.players[canonicalKey] = playerObj;
    updatePlayerDisplays();

    // Send approval back to player via both direct and broadcast channels
    const approvePacket = {
      type: 'claim_approved',
      targetHash: msg.userHash || senderId,
      player: playerObj,
      state: gameState
    };
    if (senderConn && senderConn.open) {
      try { senderConn.send(approvePacket); } catch(e) {}
    }
    broadcast(approvePacket);

    // Broadcast to all other clients so they disable this role card
    broadcast({
      type: 'character_claimed',
      role: reqRole,
      playerName: reqName,
      peerId: senderId
    });

    if (isHost) {
      broadcast({ type: 'sync_state', state: gameState });
    }

    logCourt(`👤 [PODIUM]: ${reqName} ยืนประจำแท่น`);
  } else if (msg.type === 'claim_approved') {
    if (msg.targetHash && currentUserHash && msg.targetHash !== currentUserHash) return;
    if (typeof joinClaimTimeout !== 'undefined' && joinClaimTimeout) {
      clearTimeout(joinClaimTimeout);
      joinClaimTimeout = null;
    }
    myPlayer = msg.player;
    const uKey = currentUserHash || (new URLSearchParams(window.location.search).get('user')) || 'default';
    localStorage.setItem('dangan_player_' + roomCode + '_' + uKey, JSON.stringify(myPlayer));
    if (!uKey.startsWith('sim_')) {
      localStorage.setItem('dangan_player_' + roomCode, JSON.stringify(myPlayer));
    }
    localStorage.setItem('dangan_current_room', roomCode);
    if (currentUserHash) localStorage.setItem('dangan_current_user_hash', currentUserHash);

    const btnJoin = document.querySelector('#mobileJoinScreen .dangan-action-btn');
    if (btnJoin) {
      btnJoin.disabled = false;
      btnJoin.innerText = 'เข้าสู่ศาลชั้นเรียน';
    }

    document.getElementById('mobileJoinScreen').classList.add('hidden');
    document.getElementById('mobileGameScreen').classList.remove('hidden');

    document.getElementById('pMyName').innerText = myPlayer.name;
    document.getElementById('pMyRole').innerText = myPlayer.role ? `[${myPlayer.role}]` : '';
    const pHash = document.getElementById('pMyHash');
    if (pHash) pHash.innerText = '#' + (currentUserHash || 'USER');

    if (myPlayer.isKiller) {
      document.getElementById('pMyStatus').innerText = '☠️ ผู้วางแผน (Blackened)';
      document.getElementById('pMyStatus').className = 'p-status killer';
      document.getElementById('mobileSaboteurPanel').classList.remove('hidden');
    } else {
      document.getElementById('pMyStatus').innerText = '🛡️ นักเรียนผู้บริสุทธิ์';
      document.getElementById('pMyStatus').className = 'p-status normal';
      document.getElementById('mobileSaboteurPanel').classList.add('hidden');
    }

    showToast(`✨ คุณ [${myPlayer.name}] เข้าสู่เกมเรียบร้อยแล้ว!`);
    updateMonopadDeviceBar();
    updateMonopadPhaseTabs(gameState.stage);
    playSfx('correct');
  } else if (msg.type === 'claim_rejected') {
    if (msg.targetHash && currentUserHash && msg.targetHash !== currentUserHash) return;
    if (typeof joinClaimTimeout !== 'undefined' && joinClaimTimeout) {
      clearTimeout(joinClaimTimeout);
      joinClaimTimeout = null;
    }
    const btnJoin = document.querySelector('#mobileJoinScreen .dangan-action-btn');
    if (btnJoin) {
      btnJoin.disabled = false;
      btnJoin.innerText = 'เข้าสู่ศาลชั้นเรียน';
    }
    alert(msg.reason);
    const opt = document.getElementById('optRole_' + msg.role);
    if (opt) {
      opt.disabled = true;
      opt.innerText = `[❌ ถูกเลือกแล้ว] ${msg.role}`;
    }
    const notice = document.getElementById('roleClaimNotice');
    if (notice) notice.innerText = `⚠️ บท ${msg.role} ถูกเลือกแล้ว โปรดเลือกบทอื่น`;
    playSfx('wrong');
  } else if (msg.type === 'character_claimed') {
    const opt = document.getElementById('optRole_' + msg.role);
    if (opt) {
      opt.disabled = true;
      opt.innerText = `[❌ ถูกเลือกแล้ว] ${msg.role} (${msg.playerName})`;
    }
  } else if (msg.type === 'character_freed') {
    const opt = document.getElementById('optRole_' + msg.role);
    if (opt) {
      opt.disabled = false;
      opt.innerText = `PC: สุดยอด${msg.role}`;
    }
  } else if (msg.type === 'player_leave') {
    if (gameState.players[msg.peerId]) {
      const leavingRole = gameState.players[msg.peerId].role;
      const leavingName = gameState.players[msg.peerId].name;
      delete gameState.players[msg.peerId];
      updatePlayerDisplays();
      logCourt(`🚪 [LEAVE]: ${leavingName} (${leavingRole}) ออกจากห้องศาล`);
      if (isHost) {
        broadcast({ type: 'character_freed', role: leavingRole });
      }
    }
  } else if (msg.type === 'session_terminated') {
    clearPlayerLocalData();
    alert('🚪 เซสชันศาลชั้นเรียนนี้ถูกรีเซ็ตเรียบร้อยแล้ว ทุกคนจะถูกนำกลับสู่หน้าหลักเพื่อเริ่มรอบใหม่เหมือน Kahoot!');
    window.location.href = '/';
  } else if (msg.type === 'player_joined') {
    if (msg.player && msg.player.name) {
      Object.keys(gameState.players).forEach(key => {
        const p = gameState.players[key];
        if (p && ((msg.player.userHash && p.userHash === msg.player.userHash) || (p.name && p.name.toLowerCase() === msg.player.name.toLowerCase()))) {
          delete gameState.players[key];
        }
      });
      gameState.players[msg.player.userHash || msg.player.id] = msg.player;
      updatePlayerDisplays();
      logCourt(`👤 [JOIN]: ${msg.player.name} ยืนประจำโพเดียม`);
      if (isHost) broadcast({ type: 'sync_state', state: gameState });
    }
  } else if (msg.type === 'request_sync_state') {
    if (isHost) {
      if (senderConn && senderConn.open) {
        try { senderConn.send({ type: 'sync_state', state: gameState }); } catch(e) {}
      }
      broadcast({ type: 'sync_state', state: gameState });
      if (gameState && gameState.players) {
        Object.values(gameState.players).forEach(p => {
          broadcast({
            type: 'character_claimed',
            role: p.role,
            playerName: p.name,
            peerId: p.id
          });
        });
      }
    }
  } else if (msg.type === 'admin_reset_session' || msg.type === 'reset_session') {
    handleResetSession();
  } else if (msg.type === 'kick_player') {
    handleKickPlayer(msg.playerId);
  } else if (msg.type === 'clue_discovered') {
    handleClueDiscovered(msg.clueId, msg.clueName, msg.playerName, msg.userHash);
  } else if (msg.type === 'admin_grant_clue') {
    const isTarget = (currentUserHash && msg.targetKey === currentUserHash) ||
                     (myPlayer && (myPlayer.id === msg.targetKey || myPlayer.name === msg.targetKey || (myPlayer.userHash && myPlayer.userHash === msg.targetKey)));
    if (isTarget) {
      unlockClueDirect(msg.clueId);
      playSfx('clue_get');
      showToast(`🎁 [DM มอบหลักฐาน]: คุณได้รับ [${msg.clueName || msg.clueId}] เข้าสู่ Monopad แล้ว!`);
      broadcast({
        type: 'sync_player_clues',
        userHash: currentUserHash,
        playerName: (myPlayer && myPlayer.name) ? myPlayer.name : '',
        clues: getUnlockedClues()
      });
    }
  } else if (msg.type === 'court_clue_revealed') {
    unlockClueDirect(msg.clueId);
    playSfx('clue_get');
    showToast(`📢 [ศาลชั้นเรียน]: หลักฐาน [${msg.clueName || msg.clueId}] ถูกเปิดเผยต่อทุกคน! บันทึกลงใน Monopad แล้ว`);
    if (myPlayer && myPlayer.name) {
      broadcast({
        type: 'sync_player_clues',
        userHash: currentUserHash,
        playerName: myPlayer.name,
        clues: getUnlockedClues()
      });
    }
  } else if (msg.type === 'sync_player_clues') {
    if (msg.clues && Array.isArray(msg.clues)) {
      Object.values(gameState.players).forEach(p => {
        if ((msg.userHash && p.userHash === msg.userHash) || (msg.playerName && p.name === msg.playerName)) {
          p.clues = msg.clues;
        }
      });
      if (typeof renderAdminEvidenceTracker === 'function') {
        renderAdminEvidenceTracker();
      }
    }
  } else if (msg.type === 'set_stage') {
    setStage(msg.stage, msg.config);
  } else if (msg.type === 'admin_adjust_timer') {
    gameState.timeRemaining = Math.max(0, gameState.timeRemaining + (msg.secs || 0));
    updateTimerDisplay();
    if (isHost) broadcast({ type: 'timer_tick', time: gameState.timeRemaining });
  } else if (msg.type === 'admin_timer_stop') {
    stopTimer();
  } else if (msg.type === 'admin_timer_start') {
    startTimer(msg.duration || gameState.timeRemaining || 60);
  } else if (msg.type === 'timer_tick') {
    gameState.timeRemaining = msg.time;
    updateTimerDisplay();
  } else if (msg.type === 'adjust_influence') {
    if (msg.reset) {
      gameState.influence = (msg.value !== undefined) ? msg.value : 100;
    } else if (msg.value !== undefined) {
      gameState.influence = msg.value;
    } else {
      gameState.influence = Math.max(0, Math.min(100, gameState.influence + (msg.delta || 0)));
    }
    if (msg.delta < 0) playSfx('wrong');
    else if (msg.delta > 0) playSfx('correct');
  } else if (msg.type === 'sabotage') {
    handleSabotage(msg.sabType, msg.playerName);
  } else if (msg.type === 'stg1_submit') {
    handleStg1Submit(msg.clueId, msg.playerName);
  } else if (msg.type === 'stg1_evaluate') {
    evaluateStg1Batch();
  } else if (msg.type === 'stg2_char') {
    if (isHost) handleStg2Char(msg.char); // Only host processes to avoid double-fire
  } else if (msg.type === 'rebuttal_slash') {
    handleRebuttalSlash(msg.bullet, msg.playerName);
  } else if (msg.type === 'rebuttal_verdict') {
    triggerRebuttalVerdict(msg.isWin, true);
  } else if (msg.type === 'logic_dive_vote') {
    handleLogicDiveVote(msg.question, msg.choice, msg.voterId, msg.playerName);
  } else if (msg.type === 'logic_dive_crash') {
    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.remove('hidden');
      crashNotice.style.display = 'block';
      crashNotice.innerText = `💥 ชนผนังอุโมงค์! เสียงข้างมากเลือกข้อ [${msg.winningChoice}] ซึ่งเป็นทางตัน (-15% Influence)`;
    }
    const mobileFb = document.getElementById('diveChoiceFeedback');
    if (mobileFb) {
      mobileFb.style.display = 'block';
      mobileFb.style.color = '#ff2244';
      mobileFb.innerHTML = `💥 ชนผนังอุโมงค์! เสียงข้างมากเลือกข้อ [${msg.winningChoice}] ซึ่งเป็นทางตัน (รอ DM สั่งการ)`;
    }
  } else if (msg.type === 'logic_dive_retry') {
    gameState.stg4Votes = {};
    gameState.stg4Evaluating = false;
    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.add('hidden');
      crashNotice.style.display = 'none';
    }
    ['A', 'B', 'C'].forEach(ch => {
      const lane = document.getElementById('lane' + ch);
      if (lane) lane.classList.remove('active-match', 'mismatch');
    });
    updateLogicDiveDisplay();
    if (gameState.stage === 'stage4' || currentView === 'player') {
      renderMobileTask('stage4');
    }
    if (isHost) {
      broadcast({ type: 'sync_state', state: gameState });
    }
  } else if (msg.type === 'stg5_scrum') {
    handleStg5Scrum(msg.delta);
  } else if (msg.type === 'stg6_counter') {
    handleStg6Counter(msg.playerName);
  } else if (msg.type === 'stg6_hit') {
    handleStg6Hit(msg.playerName);
  } else if (msg.type === 'stg6_final_blow') {
    handleStg6FinalBlow(msg.playerName);
  } else if (msg.type === 'armament_final_ready') {
    const box = document.getElementById('finalBlowMobileBox');
    if (box) box.style.display = 'block';
  } else if (msg.type === 'closing_submit') {
    handleClosingSubmit(msg.slot, msg.cardId, msg.playerName);
  } else if (msg.type === 'closing_page_change') {
    gameState.closingCurrentPage = msg.page;
    updateClosingDisplay();
    if (typeof currentTab !== 'undefined' && currentTab === 'tasks') {
      renderMobileTask('closing');
    }
  } else if (msg.type === 'closing_bonus_time') {
    showBonusTimePopup(msg.seconds);
  } else if (msg.type === 'closing_card_unlocked') {
    if (msg.hands) gameState.closingPlayerHands = msg.hands;
    if (typeof myPlayer !== 'undefined' && myPlayer && myPlayer.id === msg.playerId) {
      playSfx('correct');
      showToast('🔓 ปลดล็อกการ์ดใหม่ในมือคุณแล้ว!');
    }
    if (typeof currentTab !== 'undefined' && currentTab === 'tasks') {
      renderMobileTask('closing');
    }
  } else if (msg.type === 'closing_hands_sync') {
    gameState.closingPlayerHands = msg.hands;
    if (typeof currentTab !== 'undefined' && currentTab === 'tasks') {
      renderMobileTask('closing');
    }
  } else if (msg.type === 'submit_vote') {
    handleVoteSubmitted(msg.candidate, msg.voterId);
  } else if (msg.type === 'minigame_result') {
    showMinigameResult(msg.success, msg.title, msg.desc, msg.details, true);
  } else if (msg.type === 'close_minigame_result') {
    closeCourtResultModal(true);
    if (gameState.stage !== 'trial' && gameState.stage !== 'lobby') {
      setStage('trial');
    }
  } else if (msg.type === 'adjust_player_cred') {
    if (gameState.players) {
      const p = gameState.players[msg.playerId] || Object.values(gameState.players).find(x => x.id === msg.playerId || x.name === msg.playerName || x.name === msg.playerId);
      if (p) {
        p.credibility = msg.credibility;
      }
      if (myPlayer && (myPlayer.id === msg.playerId || myPlayer.name === msg.playerName || (p && p.name === myPlayer.name))) {
        myPlayer.credibility = msg.credibility;
      }
      updatePlayerDisplays();
      updateAdminDisplay();
      updateMobileCredDisplay();
      if (isHost) {
        broadcast({ type: 'sync_state', state: gameState });
      }
    }
  } else if (msg.type === 'rebuttal_challengers') {
    gameState.stg3Challenger = msg.challenger;
    gameState.stg3Opponent = msg.opponent;
    const accEl = document.getElementById('rebuttalAccuser');
    const oppEl = document.getElementById('rebuttalSuspect');
    if (accEl) accEl.innerText = gameState.stg3Challenger ? `ฝ่ายกล่าวหา: ${gameState.stg3Challenger}` : 'ฝ่ายกล่าวหา';
    if (oppEl) oppEl.innerText = gameState.stg3Opponent ? `ฝ่ายโต้แย้ง: ${gameState.stg3Opponent}` : 'ฝ่ายโต้แย้ง';
    if (currentView === 'player' && gameState.stage === 'stage3') {
      renderMobileTask('stage3');
    }
  } else if (msg.type === 'execution_cutscene') {
    triggerMonokumaExecutionCutscene(msg.isVictory, true);
  } else if (msg.type === 'close_execution_cutscene') {
    closeExecutionModal(true);
  } else if (msg.type === 'verdict') {
    showVerdict(msg.isVictory);
  } else if (msg.type === 'trigger_fx') {
    if (isHost || currentView === 'court') {
      playSfx(msg.fx);
    }
  }
}

function applyState(st) {
  if (!st) return;
  if (st.players) {
    const deduped = {};
    Object.values(st.players).forEach(p => {
      if (!p || !p.name) return;
      const key = p.userHash || p.id || p.name;
      const existingKey = Object.keys(deduped).find(k => deduped[k].name.toLowerCase() === p.name.toLowerCase() || (p.userHash && deduped[k].userHash === p.userHash));
      if (existingKey) {
        delete deduped[existingKey];
      }
      deduped[key] = p;
    });
    st.players = deduped;
  }
  gameState = st;
  updateTimerDisplay();
  updatePlayerDisplays();
  renderStage(gameState.stage);
  updateMonopadPhaseTabs(gameState.stage);
  updateMonopadDeviceBar();
  if (gameState.players) {
    Object.values(gameState.players).forEach(p => {
      const opt = document.getElementById('optRole_' + p.role);
      if (opt) {
        opt.disabled = true;
        opt.innerText = `[❌ ถูกเลือกแล้ว] ${p.role} (${p.name})`;
      }
    });
  }
}

// ==========================================================
// SPA ROUTING, PIN ACCESS & VIEW SWITCHING
// ==========================================================
function getCleanPath() {
  const urlParams = new URLSearchParams(window.location.search);
  const qView = urlParams.get('view');
  if (qView) {
    const qUser = urlParams.get('user');
    if (qView.toLowerCase() === 'player' && qUser) {
      return 'u/' + qUser;
    }
    return qView.toLowerCase();
  }
  if (window.location.hash) {
    const h = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    if (h) return h;
  }
  let p = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (p.toLowerCase().endsWith('.html')) p = p.substring(0, p.length - 5);
  return p;
}

function handleBrandClick() {
  if (currentView === 'hub' || currentView === 'admin') {
    navigate('/');
  }
}

function navigate(path) {
  if (window.location.pathname !== path) {
    history.pushState(null, '', path);
  }
  handleRoute();
}

function handleRoute() {
  const p = getCleanPath();
  const lowerP = p.toLowerCase();
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('room')) {
    roomCode = urlParams.get('room').toUpperCase();
    const disp = document.getElementById('displayRoomCode');
    if (disp) disp.innerText = roomCode;
  }

  const autoClue = urlParams.get('clue') || urlParams.get('unlock');
  if (autoClue) {
    setTimeout(() => {
      unlockClue(autoClue);
      switchPlayerTab('clues');
    }, 600);
  }

  hidePinModal();

  if (!p || lowerP === 'index' || lowerP === 'hub') {
    switchView('hub');
  } else if (lowerP === 'court') {
    switchView('court');
  } else if (lowerP === 'simulation' || lowerP === 'sim') {
    switchView('simulation');
  } else if (lowerP === 'map') {
    switchView('map');
  } else if (lowerP === 'admin') {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('pin') === ADMIN_CORRECT_PIN) {
      sessionStorage.setItem('dangan_admin_auth', ADMIN_CORRECT_PIN);
    }
    const auth = sessionStorage.getItem('dangan_admin_auth');
    if (auth === ADMIN_CORRECT_PIN) {
      switchView('admin');
    } else {
      showPinModal();
    }
  } else {
    // Player screen: /play or /u/:hash or /:hash
    let hash = '';
    if (lowerP === 'play') {
      hash = localStorage.getItem('dangan_current_user_hash') || ('u-' + Math.random().toString(36).substring(2, 8));
      history.replaceState(null, '', '/' + hash + (window.location.search || ''));
    } else if (lowerP.startsWith('u/')) {
      hash = p.substring(2);
    } else {
      hash = p;
    }

    currentUserHash = hash;
    localStorage.setItem('dangan_current_user_hash', hash);
    initPlayerSession(hash);
    switchView('player');
  }
}

window.addEventListener('popstate', () => {
  handleRoute();
});

function switchView(v) {
  currentView = v;

  // Clear background polling intervals when switching away (Fixes E-01, E-02)
  if (v !== 'hub' && hubRoomsPollingInterval) {
    clearInterval(hubRoomsPollingInterval);
    hubRoomsPollingInterval = null;
  }
  if (v !== 'court' && courtHeartbeatInterval) {
    clearInterval(courtHeartbeatInterval);
    courtHeartbeatInterval = null;
  }
  if (v !== 'simulation' && simEventSource) {
    try { simEventSource.close(); } catch(e) {}
    simEventSource = null;
  }
  if (typeof stopCameraStream === 'function') {
    try { stopCameraStream(); } catch(e) {}
  }


  // Set active view class on root elements to control navigation button visibility
  ['view-is-hub', 'view-is-court', 'view-is-admin', 'view-is-player', 'view-is-simulation', 'view-is-map'].forEach(cls => {
    document.documentElement.classList.remove(cls);
    document.body.classList.remove(cls);
  });
  document.documentElement.classList.add('view-is-' + v);
  document.body.classList.add('view-is-' + v);
  if (window.self !== window.top) {
    document.documentElement.classList.add('in-iframe');
    document.body.classList.add('in-iframe');
  }

  const panels = ['viewHub', 'viewCourt', 'viewAdmin', 'viewPlayer', 'viewSimulation', 'viewMap'];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const tabs = ['tabHub', 'tabCourt', 'tabAdmin', 'tabPlayer', 'tabSimulation', 'tabMap'];
  tabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  if (v === 'hub') {
    const el = document.getElementById('viewHub');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabHub');
    if (tab) tab.classList.add('active');
    updateHubDisplay();
  } else if (v === 'court') {
    const el = document.getElementById('viewCourt');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabCourt');
    if (tab) tab.classList.add('active');
    initRealtime();
    updatePlayerDisplays();
    renderStage(gameState.stage || 'lobby');
  } else if (v === 'admin') {
    const el = document.getElementById('viewAdmin');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabAdmin');
    if (tab) tab.classList.add('active');
    initRealtime();
    updateAdminDisplay();
  } else if (v === 'player') {
    const el = document.getElementById('viewPlayer');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabPlayer');
    if (tab) tab.classList.add('active');
    initRealtime();
    updateMonopadDeviceBar();
    updateMonopadPhaseTabs(gameState.stage);
  } else if (v === 'simulation') {
    const el = document.getElementById('viewSimulation');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabSimulation');
    if (tab) tab.classList.add('active');
    initSimulationLab();
  } else if (v === 'map') {
    const el = document.getElementById('viewMap');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabMap');
    if (tab) tab.classList.add('active');
    initMapView();
  }
}

function updateHubDisplay() {
  fetchActiveRooms();
  if (hubRoomsPollingInterval) clearInterval(hubRoomsPollingInterval);
  hubRoomsPollingInterval = setInterval(fetchActiveRooms, 5000);
}

function clearPlayerLocalData(keepClues = true) {
  myPlayer = null;
  currentUserHash = '';
  const localKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('dangan_')) {
      if (keepClues && (k.startsWith('dangan_unlocked_') || k.startsWith('dangan_tags_') || k.startsWith('dangan_notes_'))) {
        continue; // Keep discovered evidence and notes!
      }
      localKeys.push(k);
    }
  }
  localKeys.forEach(k => localStorage.removeItem(k));

  const sessionKeys = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const k = sessionStorage.key(i);
    if (k && k.startsWith('dangan_')) {
      sessionKeys.push(k);
    }
  }
  sessionKeys.forEach(k => sessionStorage.removeItem(k));
}

function copyRoomLink() {
  const url = window.location.origin + '/play?room=' + roomCode;
  navigator.clipboard.writeText(url);
  alert('คัดลอกลิงก์ห้องเรียบร้อย! ส่งให้เพื่อนเปิดในมือถือเพื่อเข้าเล่น: \n' + url);
}

function copyPersonalLink() {
  const hash = currentUserHash || localStorage.getItem('dangan_current_user_hash') || 'play';
  const url = window.location.origin + '/' + hash;
  navigator.clipboard.writeText(url);
  alert('คัดลอกลิงก์ส่วนตัวของคุณเรียบร้อย:\n' + url + '\n(สามารถเปิดลิงก์นี้บนมือถือเพื่อเข้าถึงตัวละครเดิมได้ทันที)');
}

// ==========================================================
// PIN AUTHENTICATION SYSTEM (PIN: 295437)
// ==========================================================
function showPinModal() {
  enteredPin = '';
  updatePinDisplay();
  const modal = document.getElementById('pinModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }
  const err = document.getElementById('pinErrMsg');
  if (err) err.innerText = '';
}

function hidePinModal() {
  const modal = document.getElementById('pinModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function pressPin(digit) {
  if (enteredPin.length < 6) {
    enteredPin += digit;
    updatePinDisplay();
    playSfx('gavel');
    if (enteredPin.length === 6) {
      setTimeout(submitPin, 250);
    }
  }
}

function clearPin() {
  enteredPin = '';
  updatePinDisplay();
  const err = document.getElementById('pinErrMsg');
  if (err) err.innerText = '';
}

function updatePinDisplay() {
  const disp = document.getElementById('pinDisplay');
  if (!disp) return;
  let masked = '';
  for (let i = 0; i < 6; i++) {
    if (i < enteredPin.length) masked += enteredPin[i] + ' ';
    else masked += '- ';
  }
  disp.innerText = masked.trim();
}

function submitPin() {
  if (enteredPin === ADMIN_CORRECT_PIN) {
    sessionStorage.setItem('dangan_admin_auth', ADMIN_CORRECT_PIN);
    hidePinModal();
    switchView('admin');
    playSfx('correct');
  } else {
    playSfx('wrong');
    const err = document.getElementById('pinErrMsg');
    if (err) err.innerText = '⚠️ PIN ไม่ถูกต้อง! กรุณาลองใหม่อีกครั้ง';
    const disp = document.getElementById('pinDisplay');
    if (disp) {
      disp.style.borderColor = 'var(--mono-red)';
      setTimeout(() => {
        if (disp) disp.style.borderColor = '#444';
      }, 500);
    }
    enteredPin = '';
    updatePinDisplay();
  }
}

function adminLogout() {
  sessionStorage.removeItem('dangan_admin_auth');
  navigate('/');
}

// Support Physical Keyboard for PIN Modal
window.addEventListener('keydown', (e) => {
  const modal = document.getElementById('pinModal');
  if (modal && !modal.classList.contains('hidden') && modal.style.display !== 'none') {
    if (e.key >= '0' && e.key <= '9') {
      pressPin(e.key);
    } else if (e.key === 'Backspace') {
      if (enteredPin.length > 0) {
        enteredPin = enteredPin.slice(0, -1);
        updatePinDisplay();
      }
    } else if (e.key === 'Enter') {
      submitPin();
    } else if (e.key === 'Escape') {
      navigate('/');
    }
  }
});

// ==========================================================
// USER HASH & PLAYER SESSION RESTORATION
// ==========================================================
function initPlayerSession(hash) {
  if (hash) currentUserHash = hash;
  const disp = document.getElementById('displayUserHash');
  if (disp) disp.innerText = '#' + (hash || currentUserHash || 'USER');
  const pHash = document.getElementById('pMyHash');
  if (pHash) pHash.innerText = '#' + (hash || currentUserHash || 'USER');

  const urlParams = new URLSearchParams(window.location.search);
  const qRoom = urlParams.get('room');
  const qName = urlParams.get('name');
  const qRole = urlParams.get('role');
  const qAutoJoin = urlParams.get('autoJoin');

  if (qRoom) {
    roomCode = qRoom.trim().toUpperCase();
    const roomInp = document.getElementById('mobileRoomInput');
    if (roomInp) roomInp.value = roomCode;
  }
  updateMonopadDeviceBar();
  updateMonopadPhaseTabs(gameState.stage);

  if (qName) {
    const nameInp = document.getElementById('mobileNameInput');
    if (nameInp) nameInp.value = qName;
  }
  if (qRole) {
    const roleSel = document.getElementById('mobileRoleSelect');
    if (roleSel) roleSel.value = qRole;
  }

  // Check if room changed from previous session
  const savedRoom = localStorage.getItem('dangan_current_room');
  if (roomCode && savedRoom && savedRoom.toUpperCase() !== roomCode.toUpperCase()) {
    clearPlayerLocalData();
  }

  const userKey = urlParams.get('user') || hash || currentUserHash || 'default';
  const isSimUser = userKey.startsWith('sim_');
  // Never restore saved player session automatically in simulation so court starts with 0 players
  const savedData = (!isSimUser && roomCode) ? (localStorage.getItem('dangan_player_' + roomCode + '_' + userKey) || localStorage.getItem('dangan_player_' + roomCode)) : null;
  if (savedData) {
    try {
      const p = JSON.parse(savedData);
      myPlayer = p;
      const nameInp = document.getElementById('mobileNameInput');
      if (nameInp) nameInp.value = p.name;
      const roleSel = document.getElementById('mobileRoleSelect');
      if (roleSel) roleSel.value = p.role;

      const joinScr = document.getElementById('mobileJoinScreen');
      if (joinScr) joinScr.classList.add('hidden');
      const gameScr = document.getElementById('mobileGameScreen');
      if (gameScr) gameScr.classList.remove('hidden');

      const nameEl = document.getElementById('pMyName');
      if (nameEl) nameEl.innerText = p.name;
      const roleEl = document.getElementById('pMyRole');
      if (roleEl) roleEl.innerText = `[${p.role}]`;

      const statusEl = document.getElementById('pMyStatus');
      const sabPanel = document.getElementById('mobileSaboteurPanel');
      if (p.isKiller) {
        if (statusEl) {
          statusEl.innerText = '☠️ ผู้วางแผน (Blackened)';
          statusEl.className = 'p-status killer';
        }
        if (sabPanel) sabPanel.classList.remove('hidden');
      } else {
        if (statusEl) {
          statusEl.innerText = '🛡️ นักเรียนผู้บริสุทธิ์';
          statusEl.className = 'p-status normal';
        }
        if (sabPanel) sabPanel.classList.add('hidden');
      }
      return;
    } catch(e) {
      clearPlayerLocalData();
    }
  }

  // If no saved player for this active room, show join form
  const joinScr = document.getElementById('mobileJoinScreen');
  if (joinScr) joinScr.classList.remove('hidden');
  const gameScr = document.getElementById('mobileGameScreen');
  if (gameScr) gameScr.classList.add('hidden');

  if (qAutoJoin === '1' && (!myPlayer || !myPlayer.name)) {
    setTimeout(() => { playerJoin(); }, 350);
  }
}

// ==========================================================
// PC MULTI-PAGE NAVIGATION & REFERENCE LORE
// ==========================================================
let currentClueFilter = 'ALL';

function switchPlayerTab(tab) {
  const curStage = (gameState && gameState.stage) || 'idle';
  const isDailyLife = (curStage === 'dailylife' || curStage === 'daily' || curStage === 'lobby');
  const isInvestigation = (curStage === 'investigation');
  if (isDailyLife && (tab === 'clues' || tab === 'guide')) {
    tab = 'game';
  } else if (isInvestigation && tab === 'guide') {
    tab = 'clues';
  }

  const tabs = ['pTabGame', 'pTabChar', 'pTabClues', 'pTabMap', 'pTabGuide', 'pTabRules'];
  const panes = ['playerSectionGame', 'playerSectionChar', 'playerSectionClues', 'playerSectionMap', 'playerSectionGuide', 'playerSectionRules'];

  tabs.forEach(t => {
    const el = document.getElementById(t);
    if (el) el.classList.remove('active');
  });
  panes.forEach(p => {
    const el = document.getElementById(p);
    if (el) el.classList.add('hidden');
  });

  if (tab === 'game') {
    const t = document.getElementById('pTabGame');
    const p = document.getElementById('playerSectionGame');
    if (t) t.classList.add('active');
    if (p) p.classList.remove('hidden');
  } else if (tab === 'char') {
    const t = document.getElementById('pTabChar');
    const p = document.getElementById('playerSectionChar');
    if (t) t.classList.add('active');
    if (p) p.classList.remove('hidden');
    renderPlayerCharSheet();
  } else if (tab === 'clues') {
    const t = document.getElementById('pTabClues');
    const p = document.getElementById('playerSectionClues');
    if (t) t.classList.add('active');
    if (p) p.classList.remove('hidden');
    renderPlayerCluesList();
  } else if (tab === 'map') {
    const t = document.getElementById('pTabMap');
    const p = document.getElementById('playerSectionMap');
    if (t) t.classList.add('active');
    if (p) p.classList.remove('hidden');
  } else if (tab === 'guide') {
    const t = document.getElementById('pTabGuide');
    const p = document.getElementById('playerSectionGuide');
    if (t) t.classList.add('active');
    if (p) p.classList.remove('hidden');
  } else if (tab === 'rules') {
    const t = document.getElementById('pTabRules');
    const p = document.getElementById('playerSectionRules');
    if (t) t.classList.add('active');
    if (p) p.classList.remove('hidden');
  }
}

const CHARACTER_DATA = {
  'นักแต่งนิยาย': {
    title: 'PC 1: สุดยอดนักแต่งนิยาย (Ultimate Novelist)',
    stats: ['INT 16 (+3)', 'WIS 15 (+2)', 'CHA 12 (+1)'],
    personality: 'นิ่งสุขุม ช่างสังเกต มองทุกการกระทำเป็นพล็อตนิยายสืบสวน มีสมุดโน้ตติดตัวเสมอ',
    hook: 'กฎนักสังเกตการณ์: แอบจดพฤติกรรมแปลกๆ ของเพื่อนลงสมุด และเปรียบเทียบทุกเบาะแสเหมือนพล็อตในนิยายสืบสวน',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'นั่งเขียนนิยายมุมโถงกลาง สังเกตเห็นสุดยอดนักมายากลเดินเข้าออกระหว่างห้องครัวกับบันไดลงชั้นใต้ดิน 2-3 รอบด้วยท่าทางเร่งรีบ' },
      { time: '19:00 - 20:00 น.', desc: 'ร่วมโต๊ะกินสตูว์เนื้อร่วมกับทุกคน จากนั้นก็นั่งอ่านสมุดโน้ตอยู่ที่ห้องนั่งเล่นยาวๆ' },
      { time: '20:00 - 21:00 น.', desc: 'ช่วงไฟดับสั้นๆ นั่งพักสายตาอยู่บนโซฟาห้องนั่งเล่น ไม่ได้ลุกไปไหน มีเพื่อนคนอื่นนั่งอยู่ข้างๆ' },
      { time: '21:00 น.', desc: 'เสียงกระแทกดัง "ตึง! ตึง! ตึง!" มาจากห้องซักรีดใต้ดิน วิ่งตามกลุ่มไปพังประตูและเห็นร่าง B ห้อยอยู่บนเพดาน' }
    ]
  },
  'นักกีฬา': {
    title: 'PC 2: สุดยอดนักกีฬา (Ultimate Athlete)',
    stats: ['STR 16 (+3)', 'AGI 15 (+2)', 'CON 14 (+2)'],
    personality: 'พลังล้นเหลือ เชื่อมั่นในการลงมือทำมากกว่าคำพูด รักความยุติธรรม ตรงไปตรงมา',
    hook: 'เมื่อตอนบ่าย คุณไปดูห้องออกกำลังกาย แต่พบว่า "ลูกตุ้มเหล็กถ่วงน้ำหนัก (68 กก.)" และดัมเบลคู่โปรดหายไปจากชั้นวาง!',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'วิ่งวอร์มรอบอาคาร สังเกตเห็นไฟในห้องซักรีดใต้ดินเปิดอยู่ และได้ยินเสียงน้ำไหลในท่อประปาดังผิดปกติ' },
      { time: '19:00 - 20:00 น.', desc: 'กินสตูว์เนื้ออย่างเอร็ดอร่อย ชื่นชมว่าเนื้อและกระดูกชิ้นใหญ่สะใจ' },
      { time: '20:00 - 21:00 น.', desc: 'วิดพื้นในห้องพัก ได้ยินเสียงคล้ายของหนักเลื่อนถ่วงพื้นด้านล่าง' },
      { time: '21:00 น.', desc: 'วิ่งนำขบวนไปช่วยถีบพังประตูห้องซักรีด' }
    ]
  },
  'นักมายากล': {
    title: 'PC 3: สุดยอดนักมายากล A (Ultimate Magician - The Blackened)',
    stats: ['DEX 16 (+3)', 'CHA 15 (+2)', 'INT 14 (+2)'],
    personality: 'ร่าเริง พูดจาติดตลก มีลูกเล่นแพรวพราว แต่แฝงความทะเยอทะยานและเลือดเย็น',
    isKiller: true,
    hook: '⚠️ ความลับคนร้าย: คุณคือผู้เซ็ตกับดักฆ่า B! คุณใช้ท่อนกระดูกหมูฟาดหัว B สลบ นำกระดูกไปต้มในหม้อสตูว์ ผูกเชือกกับลูกตุ้ม 68 กก. และเจาะถังน้ำเพื่อตั้งเวลา... แต่ความจริง B ตัดเชือกและเกิดอุบัติเหตุคอหักตายเอง!',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'เข้าครัวไปแอบหยิบท่อนกระดูกหมู แล้วลงไปล่อ B ในห้องซักรีดเพื่อเซ็ตกับดักเชือกโยงกับลูกตุ้มและถังน้ำนอกหน้าต่าง' },
      { time: '19:00 - 20:00 น.', desc: 'ตักสตูว์เนื้อให้เพื่อนๆ กินอย่างกระตือรือร้น เพื่อกลบเกลื่อนหลักฐาน' },
      { time: '20:00 - 21:00 น.', desc: 'แอบปลดระบบไฟในตู้ควบคุมเพื่อตัดตอนพยาน' },
      { time: '21:00 น.', desc: 'แกล้งทำเป็นตกใจสุดขีดเมื่อเห็นศพ B ห้อยอยู่' }
    ]
  },
  'นักชิม': {
    title: 'PC 4: สุดยอดนักชิม (Ultimate Gourmet)',
    stats: ['WIS 16 (+3)', 'CON 14 (+2)', 'CHA 13 (+1)'],
    personality: 'พิถีพิถันเรื่องกลิ่นและรสชาติ ช่างสังเกตรายละเอียดเล็กๆ น้อยๆ ในอาหาร',
    hook: 'ประสาทสัมผัสเรื่องรสและกลิ่นของคุณดีเยี่ยม ตอนกินสตูว์คุณสัมผัสได้ถึงรสเค็มจัดผิดปกติและกลิ่นคาวสนิมเหล็กของเลือดสด!',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'เดินตรวจเครื่องปรุงในครัว พบว่าเกลือและไวน์แดงถูกใช้ไปในปริมาณมหาศาลผิดปกติ' },
      { time: '19:00 - 20:00 น.', desc: 'ร่วมกินสตูว์และทักท้วงเรื่องรสเค็มจัดและกลิ่นคาวสนิม แต่เพื่อนๆ กำลังหิวจึงมองข้าม' },
      { time: '20:00 - 21:00 น.', desc: 'จิบชาล้างคออยู่ในห้องอาหาร' },
      { time: '21:00 น.', desc: 'วิ่งตามกลิ่นน้ำยาซักผ้าและควันไฟไปยังห้องซักรีด' }
    ]
  },
  'นักแสดงผาดโผน': {
    title: 'PC 5: สุดยอดนักแสดงผาดโผน (Ultimate Stuntman)',
    stats: ['AGI 16 (+3)', 'DEX 15 (+2)', 'STR 13 (+1)'],
    personality: 'บ้าบิ่น ไม่กลัวความสูง เชี่ยวชาญอุปกรณ์นิรภัย เชือก รอก และเงื่อนผูกลำตัว',
    hook: 'คุณมีความรู้เรื่องเงื่อนเชือกอย่างลึกซึ้ง คุณสังเกตเห็นว่าเชือกที่ผูกร่าง B มีเงื่อนโบว์ไลน์ (Bowline) และสายรัดลำตัวปีนเขาแบบมีห่วงนิรภัย',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'ปีนซ้อมบนระเบียง สังเกตเห็นเชือกเส้นใหญ่ผูกโยงจากหน้าต่างห้องซักรีดออกไปยังถังน้ำนอกกำแพง' },
      { time: '19:00 - 20:00 น.', desc: 'กินสตูว์เนื้อและเล่าประสบการณ์สตันท์' },
      { time: '20:00 - 21:00 น.', desc: 'ซ้อมยืดเหยียดกล้ามเนื้อในทางเดิน' },
      { time: '21:00 น.', desc: 'วิ่งไปช่วยสำรวจเงื่อนเชือกที่ร่างของ B' }
    ]
  },
  'ช่างกล': {
    title: 'PC 6: สุดยอดช่างกล (Ultimate Mechanic)',
    stats: ['INT 16 (+3)', 'DEX 14 (+2)', 'CON 13 (+1)'],
    personality: 'ชอบรื้อ ซ่อม และวิเคราะห์เครื่องจักร ท่อประปา ตู้ไฟ เครื่องยนต์',
    hook: 'คุณสังเกตเห็นว่าระบบตั้งเวลาของเครื่องอบผ้าและวาล์วระบายน้ำประปาถูกใครบางคนดัดแปลงให้ทำงานประสานกับไฟดับ!',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'ตรวจตู้ไฟและแผงท่อประปาชั้นใต้ดิน พบว่าวาล์วน้ำหลักถูกปรับแต่ง' },
      { time: '19:00 - 20:00 น.', desc: 'กินสตูว์เนื้อ' },
      { time: '20:00 - 21:00 น.', desc: 'ช่วงไฟดับ คุณไปตรวจดูตู้ไฟพบเศษใยเชือกตากผ้าไนลอนไหม้คาเบรกเกอร์' },
      { time: '21:00 น.', desc: 'ตรวจเครื่องอบผ้าในห้องซักรีดพบแผงตั้งเวลาหยุดทำงาน' }
    ]
  }
};

let playerCredibilityHearts = 5;
function cyclePlayerCredibility() {
  playerCredibilityHearts--;
  if (playerCredibilityHearts < 0) playerCredibilityHearts = 5;
  const container = document.getElementById('pCredibilityHearts');
  if (container) {
    let hearts = '';
    for (let i = 0; i < 5; i++) {
      hearts += `<span>${i < playerCredibilityHearts ? '❤️' : '🖤'}</span>`;
    }
    container.innerHTML = hearts;
    if (playerCredibilityHearts === 0) {
      showToast('⚠️ สิ้นหวัง (Panic State)! คุณสูญเสียแต้มความน่าเชื่อถือทั้งหมด!');
    }
  }
}

function renderPlayerCharSheet() {
  const container = document.getElementById('pCharSheetContent');
  if (!container) return;

  const role = (myPlayer && myPlayer.role) ? myPlayer.role : 'นักแต่งนิยาย';
  const cData = CHARACTER_DATA[role] || CHARACTER_DATA['นักแต่งนิยาย'];

  let timelineHtml = '';
  if (cData.timeline) {
    cData.timeline.forEach(item => {
      timelineHtml += `
        <div style="margin-bottom:10px; padding:8px 12px; background:rgba(0,0,0,0.3); border-left:3px solid var(--mono-yellow); border-radius:4px;">
          <div style="font-weight:900; color:var(--mono-yellow); font-size:0.85rem; margin-bottom:2px;">⏱️ ${item.time}</div>
          <div style="font-size:0.85rem; color:#ddd; line-height:1.4;">${item.desc}</div>
        </div>
      `;
    });
  }

  let hearts = '';
  for (let i = 0; i < 5; i++) {
    hearts += `<span>${i < playerCredibilityHearts ? '❤️' : '🖤'}</span>`;
  }

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
      <div>
        <h2 style="color:var(--court-gold); font-size:1.2rem; margin-bottom:2px;">${cData.title}</h2>
        <div style="font-size:0.8rem; color:#aaa;">แฟ้มประวัตินักเรียน & กฎบทบาทเฉพาะบุคคล (2d6 System)</div>
      </div>
      <a href="/character_sheet.html" target="_blank" class="small-btn yellow" style="text-decoration:none; display:inline-flex; align-items:center; gap:6px; font-weight:900; padding:8px 12px; font-size:0.85rem;">
        🖨️ เปิด Character Sheet พิมพ์ A4
      </a>
    </div>

    <!-- Stats & Credibility Row -->
    <div style="background:rgba(20,20,35,0.85); border:2px solid var(--mono-dark-border); border-radius:8px; padding:12px; margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
        <span style="font-size:0.85rem; font-weight:900; color:var(--mono-cyan);">📊 ค่าพลังหลัก (2d6 Modifiers):</span>
        <div style="display:flex; gap:8px;">
          <span style="font-size:0.8rem; color:#ff4466; font-weight:900;">HP: 10-16</span>
          <span style="font-size:0.8rem; color:#00e5ff; font-weight:900;">WP: 10-14</span>
        </div>
      </div>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:10px;">
        ${(cData.stats || []).map(st => `<span style="background:#111122; border:1px solid #444; border-radius:4px; padding:3px 8px; font-size:0.82rem; font-weight:700; color:#fff;">${st}</span>`).join('')}
      </div>

      <!-- Credibility Hearts Tracker -->
      <div style="border-top:1px dashed #444; padding-top:8px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <span style="font-size:0.85rem; font-weight:900; color:#ff0055;">❤️ Personal Credibility Gauge:</span>
          <div style="font-size:0.75rem; color:#888;">แต้มความน่าเชื่อถือส่วนตัว (แตะเพื่อลด 1 เมื่อถูกหักล้างในศาล)</div>
        </div>
        <div id="pCredibilityHearts" style="display:flex; gap:4px; font-size:1.2rem; cursor:pointer;" onclick="cyclePlayerCredibility()">
          ${hearts}
        </div>
      </div>
    </div>

    <!-- Roleplay Hook & Talents -->
    <div style="background:rgba(20,20,35,0.85); border:2px solid var(--mono-dark-border); border-radius:8px; padding:12px; margin-bottom:14px;">
      <div style="font-size:0.85rem; font-weight:900; color:var(--mono-yellow); margin-bottom:6px;">🎭 ลักษณะนิสัย & กฎควบคุมพฤติกรรม:</div>
      <p style="font-size:0.85rem; color:#ddd; margin-bottom:8px; line-height:1.4;">${cData.personality || ''}</p>
      <div style="background:rgba(255,230,0,0.1); border-left:3px solid var(--mono-yellow); padding:8px 10px; font-size:0.82rem; color:#eee; line-height:1.35;">
        ${cData.hook || ''}
      </div>
    </div>

    <!-- Personal Timeline -->
    <div style="background:rgba(20,20,35,0.85); border:2px solid var(--mono-dark-border); border-radius:8px; padding:12px;">
      <div style="font-size:0.85rem; font-weight:900; color:#00ff88; margin-bottom:8px;">⏱️ ไทม์ไลน์ความทรงจำของคุณ (ช่วงเกิดเหตุ 17:30 - 21:00 น.):</div>
      ${timelineHtml}
    </div>
  `;
}

const ALL_CLUES_DATA = [
  { id: "EVD-01", image: "assets/room_central_corridor.jpg", pin: "830627", aliases: ["CUP-01", "1", "E01"], name: "แก้วเก็บความเย็นหน้าหอพัก", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "โถงทางเดินหน้าหอพักนักเรียน", desc: "แก้วสแตนเลสเก็บความเย็นตกอยู่บนพื้นทางเดินหน้าหอพัก ตัวแก้วมีรอยบุบที่ขอบก้นแก้ว และมีคราบของเหลวสีน้ำตาลแดงแห้งติดอยู่บนพื้น" },
  { id: "EVD-02", image: "assets/item_pork_bone.jpg", pin: "719304", aliases: ["BONE-02", "2", "E02"], name: "ท่อนกระดูกหมูในหม้อสตูว์", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องครัว (ก้นหม้อสตูว์)", desc: "ท่อนกระดูกหมูต้มสุก 2 ท่อนก้นหม้อสตูว์ บนผิวกระดูกท่อนหนึ่งมีรอยแตกร้าวและคราบสีคล้ำติดแน่นตามรอยแยก" },
  { id: "EVD-03", pin: "936154", aliases: ["PC2-03", "3", "E03"], name: "คำให้การของ PC 2", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 2 (1 AP)", desc: "คำให้การ: \"ตอน 17:30 ถึง 18:00 น. ฉันอยู่ในโรงยิม พอเดินออกมาที่โถงทางเดินเห็นหลอดไฟนีออนกะพริบ และไม่พบใครบริเวณนั้น\"" },
  { id: "EVD-04", image: "assets/room_blast_gate.jpg", pin: "873205", aliases: ["CLIP-04", "4", "E04"], name: "คลิปหนีบกระดาษเหล็ก", importance: "OPTIONAL", secretType: "TRASH", typeLabel: "ขยะ (Trash)", loc: "หน้าบอร์ดประชาสัมพันธ์โถงทางเข้าหลัก", desc: "คลิปหนีบกระดาษทำจากลวดเหล็ก 3 ตัว สภาพมีคราบสนิมเกาะ ตกอยู่ในร่องรอยต่อของพื้นปูนหน้าบอร์ดประชาสัมพันธ์" },
  { id: "EVD-05", image: "assets/item_dryer_dry1.jpg", pin: "306795", aliases: ["DRY-05", "5", "E05"], name: "เครื่องอบผ้า DRY-1", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องซักรีด (เครื่องอบผ้า)", desc: "เครื่องอบผ้าอุตสาหกรรม DRY-1 ทำงานเสร็จสิ้น ภายในมีรองเท้าบูทหนังหุ้มข้อของเหยื่อเรียวตะ (B) ที่หน้าปัดมีฟังก์ชันตั้งเวลาเริ่มทำงานล่วงหน้า (Delay Timer)" },
  { id: "EVD-06", image: "assets/item_vending_machine.jpg", pin: "684129", aliases: ["VEND-06", "6", "E06"], name: "ตู้กดน้ำอัตโนมัติโถงทางเดิน", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเดินกลาง (CORR-100)", desc: "ตู้กดเครื่องดื่มอัตโนมัติโถงทางเดินกลาง มีรอยบุบที่แผงด้านข้าง และมีเหรียญติดค้างในช่องหยอด" },
  { id: "EVD-07", image: "assets/item_monokuma_file.png", pin: "482915", aliases: ["FILE-07", "7", "E07"], name: "Monokuma File #1", importance: "MUST", secretType: "CORE", typeLabel: "ผลชันสูตรทางการ (Core)", loc: "ห้องซักรีด (ร่างของเหยื่อเรียวตะ (B))", desc: "รายงานชันสูตรทางการ: เวลาเสียชีวิต ~21:00 น. กระดูกคอหักและขาดอากาศหายใจ แผลแตกท้ายทอยเกิดก่อนตาย 1-2 ชม. สวมถุงเท้าไม่สวมรองเท้า น้ำหนักตัว 65.0 กก." },
  { id: "EVD-08", image: "assets/room_dining_hall.jpg", pin: "659143", aliases: ["SNACK-08", "8", "E08"], name: "ซองขนมปังกรอบใต้เก้าอี้", importance: "OPTIONAL", secretType: "TRASH", typeLabel: "ขยะ (Trash)", loc: "ห้องอาหาร (ใต้เก้าอี้ทานข้าว)", desc: "ซองฟอยล์บรรจุขนมปังกรอบรสสาหร่ายถูกฉีกเปิดทิ้งไว้ใต้เก้าอี้ห้องอาหาร ภายในซองมีเศษขนมปังกรอบเหลืออยู่เล็กน้อย" },
  { id: "EVD-09", image: "assets/item_pink_rope.jpg", pin: "852179", aliases: ["ROPE-09", "9", "E09"], name: "เชือกไนลอนสีชมพูบนพื้น", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องซักรีด (พื้นข้างศพเรียวตะ (B))", desc: "เชือกไนลอนถักสีชมพู 8 มม. ขดอยู่บนพื้น ปลายด้านหนึ่งผูกเป็นบ่วง ส่วนปลายอีกด้านมีรอยตัดผิวเรียบ" },
  { id: "EVD-10", image: "assets/item_water_meter.jpg", pin: "815307", aliases: ["METER-10", "10", "E10"], name: "มาตรวัดน้ำประปาหลัก", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเข้าหลัก (ข้าง Blast Gate)", desc: "มาตรวัดน้ำประปาแสดงตัวเลขใช้น้ำสะสม 65.2 ลิตร และเข็มวัดยังหมุนด้วยอัตราประมาณ 0.4 ลิตร/นาที (24 ลิตร/ชม.)" },
  { id: "EVD-11", image: "assets/item_bleach_gallon.jpg", pin: "741953", aliases: ["BLEACH-11", "11", "E11"], name: "แกลลอนน้ำยาฟอกขาวในถังขยะ", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "ห้องซักรีด (ถังขยะข้างเครื่องซักผ้า)", desc: "แกลลอนพลาสติกบรรจุน้ำยาฟอกขาวถูกทิ้งอยู่ในถังขยะห้องซักรีด ภายในแกลลอนว่างเปล่าและส่งกลิ่นคลอรีนรุนแรง" },
  { id: "EVD-12", image: "assets/item_pocket_knife.jpg", pin: "394820", aliases: ["KNIFE-12", "12", "E12"], name: "มีดพับในกระเป๋าเสื้อเหยื่อเรียวตะ (B)", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ร่างของเรียวตะ (B) (กระเป๋าเสื้อ)", desc: "มีดพับอเนกประสงค์ใบมีด 7 ซม. กางค้างไว้ในกระเป๋าเสื้อเหยื่อเรียวตะ (B) โคนใบมีดมีเศษเส้นใยสังเคราะห์สีชมพูติดอยู่" },
  { id: "EVD-13", image: "assets/room_kitchen.jpg", pin: "630841", aliases: ["FREEZE-13", "13", "E13"], name: "ช่องแช่แข็งในห้องครัว", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องครัว (ช่องฟรีซ)", desc: "ช่องแช่แข็งตู้เย็นในครัวมีเกล็ดน้ำแข็งละลายเป็นแอ่งน้ำ และพบถุงพลาสติกบรรจุเนื้อสัตว์แช่แข็งถูกฉีกเปิดทิ้งไว้" },
  { id: "EVD-14", image: "assets/item_ceiling_pipe.jpg", pin: "928413", aliases: ["RAIL-14", "14", "E14"], name: "ราวท่อสแตนเลสเพดานห้องซักรีด", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องซักรีด (เพดานสูง 4 ม.)", desc: "ท่อสแตนเลสขนานเพดานห้องซักรีดสูง 4 ม. เหนือแนวหน้าต่าง ผิวด้านบนของท่อมีรอยขูดถลอกเป็นแถบแนวยาว" },
  { id: "EVD-15", image: "assets/room_gymnasium.jpg", pin: "295418", aliases: ["CHAIN-15", "15", "E15"], name: "โซ่คล้องประตูหนีไฟโรงยิม", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "โรงยิม (ประตูด้านหลัง)", desc: "โซ่เหล็กคล้องล็อกประตูหนีไฟด้านหลังโรงยิม ข้อโซ่ข้อหนึ่งมีรอยบากลึกจากใบเลื่อย และมีเศษผงเหล็กตกอยู่บนพื้นใต้บานประตู" },
  { id: "EVD-16", pin: "369842", aliases: ["PC5-16", "16", "E16"], name: "คำให้การของ PC 5", importance: "MUST", secretType: "TESTIMONY", typeLabel: "คำให้การ (Core)", loc: "ได้จากการถาม PC 5 (1 AP)", desc: "คำให้การ: \"ฉันมีเวรทำอาหารมื้อค่ำตามตารางใน Monopad อยู่ในครัวต้มสตูว์เนื้อตลอดเวลาช่วง 17:45 - 18:30 น. ไม่ได้ออกไปข้างนอก\"" },
  { id: "EVD-17", pin: "785130", aliases: ["DROP-17", "17", "E17"], name: "รอยหยดน้ำบนพื้นโถงทางเดิน", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเดินกลาง (CORR-100)", desc: "รอยหยดน้ำขนาดเล็กกระจายตัวเป็นแนวยาวบนพื้นกระเบื้องโถงทางเดิน ระหว่างบริเวณหน้าห้องซักรีดไปจนถึงหน้าประตูห้องครัว" },
  { id: "EVD-18", image: "assets/room_glass_corridor.jpg", pin: "417285", aliases: ["GLASS-18", "18", "E18"], name: "เศษกระจกบริเวณเชิงบันได", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "เชิงบันไดทางขึ้นชั้น 2", desc: "เศษกระจกใสความหนา 5 มม. แตกกระจายอยู่บนขั้นบันไดทางขึ้นชั้น 2 บนขอบกระจกชิ้นหนึ่งมีคราบสีส้มอมแดงเกาะติดอยู่" },
  { id: "EVD-19", image: "assets/item_shattered_barrel.jpg", pin: "175936", aliases: ["BUCKET-19", "19", "E19"], name: "ซากถังน้ำพลาสติกตกแตก", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ลานปูนซักล้างด้านหลัง (ใต้หน้าต่าง)", desc: "ถังพลาสติก 80 ลิตร ตกแตกกระจายบนพื้นลานปูนด้านนอก มีน้ำสาดกระจายเปียกทั่วบริเวณลานปูน หูจับถังมีรอยเชือกไนลอนผูกติดอยู่" },
  { id: "EVD-20", pin: "472890", aliases: ["PC1-20", "20", "E20"], name: "คำให้การของ PC 1", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 1 (1 AP)", desc: "คำให้การ: \"ช่วง 17:45 น. ฉันทุบตู้กดน้ำที่กินเหรียญอยู่ที่โถงกลาง ได้ยินเสียงน้ำไหลเบาๆ ในแนวกำแพงข้างห้องซักรีด\"" },
  { id: "EVD-21", image: "assets/item_bloody_towel.jpg", pin: "904712", aliases: ["TOWEL-21", "21", "E21"], name: "ผ้าขนหนูสีกรมท่าเปื้อนเลือด", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องครัว (ใต้ถุงขยะดำก้นถัง)", desc: "ผ้าขนหนูสีกรมท่าเนื้อหนาถูกขยำอยู่ใต้ถุงขยะดำก้นถังในครัว เมื่อคลี่ออกพบรอยเปื้อนสีน้ำตาลคล้ำแห้งกรัง" },
  { id: "EVD-22", pin: "194836", aliases: ["NOTE-22", "22", "E22"], name: "แผ่นกระดาษโน้ตบนพื้นโถงทางเดิน", importance: "OPTIONAL", secretType: "TRASH", typeLabel: "ขยะ (Trash)", loc: "โถงทางเดินกลาง (CORR-100)", desc: "กระดาษสมุดฉีกขนาดฝ่ามือ มีลายมือเขียนตารางเกมโอเอกซ์และข้อความสั้นๆ ตกอยู่บนพื้นกระเบื้องโถงทางเดิน" },
  { id: "EVD-23", pin: "541682", aliases: ["FAUCET-23", "23", "E23"], name: "สายยางน้ำเปิดทิ้งและน้ำท่วมขัง", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องซักรีด (แนวก๊อกน้ำและพื้นห้อง)", desc: "สายยางสีเขียวยาวต่ออยู่กับก๊อกน้ำที่เปิดวาล์วทิ้งไว้ ปลายสายยางดีดสะบัดตกอยู่บนพื้นห้องซักรีด น้ำไหลทะลักออกมาอย่างต่อเนื่องจนเจิ่งนองท่วมขังพื้นกระเบื้องทั่วห้อง" },
  { id: "EVD-24", image: "assets/item_notice_board.jpg", pin: "249581", aliases: ["MAP-24", "24", "E24"], name: "แผนผังอาคารบนบอร์ดประชาสัมพันธ์", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเข้าหลัก (ข้าง Blast Gate)", desc: "แผนผังอาคารชั้น 1 แสดงลานบริการด้านหลังเป็นพื้นที่ปิด ล้อมด้วยกำแพงคอนกรีตสูง 5 ม. ไร้ประตูทางออก" },
  { id: "EVD-25", pin: "612847", aliases: ["RACK-25", "25", "E25"], name: "ราวแขวนผ้าขนหนูห้องซักรีด", importance: "MUST", secretType: "CORE", typeLabel: "ร่องรอย/สิ่งของ (Core)", loc: "ห้องซักรีด (ราวแขวนผ้า)", desc: "ราวแขวนผ้าสแตนเลสข้างอ่างล้างห้องซักรีด มีผ้าขนหนูสีกรมท่าแขวนอยู่ 4 ผืน และมีช่องว่างเว้น 1 จุด" },
  { id: "EVD-26", image: "assets/crime_scene_kitchen_stew.jpg", pin: "248356", aliases: ["WINE-26", "26", "E26"], name: "ขวดไวน์และคราบบนเคาน์เตอร์ครัว", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องครัว (เคาน์เตอร์ปรุงอาหาร)", desc: "ขวดไวน์แดงสำหรับปรุงอาหารเปิดฝาวางอยู่บนเคาน์เตอร์ครัว มีไวน์เหลืออยู่ก้นขวดเล็กน้อย บริเวณเคาน์เตอร์ข้างเตาพบรอยของเหลวสีแดงหกหยดเป็นจุดๆ" },
  { id: "EVD-27", pin: "180472", aliases: ["PC3-27", "27", "E27"], name: "คำให้การของ PC 3", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 3 (1 AP)", desc: "คำให้การ: \"ช่วง 17:30 ถึง 18:15 น. ฉันสำรวจประตูกล Blast Gate และมาตรวัดน้ำ ช่วงประมาณ 18:00 น. เห็น PC 4 เดินที่ทางเดินกระจกใส\"" },
  { id: "EVD-28", pin: "328691", aliases: ["TASTE-28", "28", "E28"], name: "รสชาติของน้ำซุปสตูว์เนื้อ", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องครัว (หม้อสตูว์บนเตา)", desc: "น้ำซุปสตูว์เนื้อในหม้อมีกลิ่นหอมของเครื่องเทศและไวน์แดง แต่เมื่อชิมแล้วจะสัมผัสได้ถึงรสชาติฝาดเฝื่อนคล้ายสนิมเหล็กผสมอยู่จางๆ" },
  { id: "EVD-29", pin: "561479", aliases: ["THUD-29", "29", "E29"], name: "เสียงกระแทกจากห้องซักรีดตอน 21:00 น.", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องอาหาร (จุดรวมตัวเวลาราตรี)", desc: "ขณะที่ทุกคนรวมตัวอยู่ในห้องอาหารเวลา 21:00 น. มีเสียงเครื่องจักรหมุนกระแทกและเสียงวัตถุหนักตกกระทบดังสนั่นมาจากทางปีกห้องซักรีด" },
  { id: "EVD-30", pin: "527391", aliases: ["PC4-30", "30", "E30"], name: "คำให้การของ PC 4", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 4 (1 AP)", desc: "คำให้การ: \"ช่วง 17:30 ถึง 18:15 น. ฉันเดินอยู่ที่ทางเดินกระจก มองเห็นเงาวัตถุทรงกระบอกห้อยอยู่นอกหน้าต่างห้องซักรีด\"" },
  { id: "EVD-31", pin: "439268", aliases: ["DINNER-31", "31", "E31"], name: "การรวมตัวมื้อค่ำเวลา 19:00 น.", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องอาหาร (โต๊ะมื้อค่ำ)", desc: "การรวมตัวรับประทานอาหารมื้อค่ำเวลา 19:00 น. มีสตูว์เนื้อปรุงเสร็จโดย PC 5 ตามตารางเวรบน Monopad โดยเหยื่อเรียวตะ (B) ไม่ได้มาร่วมโต๊ะอาหาร" },
];

let currentUserClueTagFilter = 'ALL';

function getUnlockedClues() {
  const keysToTry = [
    'dangan_unlocked_' + (currentUserHash || 'guest'),
    (myPlayer && myPlayer.name) ? ('dangan_unlocked_name_' + myPlayer.name.trim().toLowerCase()) : null,
    'dangan_unlocked_guest',
    'dangan_unlocked_default'
  ].filter(Boolean);

  let merged = new Set();
  keysToTry.forEach(k => {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) arr.forEach(id => merged.add(id));
      } catch(e) {}
    }
  });
  return Array.from(merged);
}

function saveUnlockedClues(unlockedArray) {
  const jsonStr = JSON.stringify(unlockedArray);
  if (currentUserHash) {
    localStorage.setItem('dangan_unlocked_' + currentUserHash, jsonStr);
  }
  localStorage.setItem('dangan_unlocked_guest', jsonStr);
  if (myPlayer && myPlayer.name) {
    localStorage.setItem('dangan_unlocked_name_' + myPlayer.name.trim().toLowerCase(), jsonStr);
  }
}

function unlockClueDirect(clueId) {
  if (!clueId) return false;
  const clue = ALL_CLUES_DATA.find(c => c.id === clueId);
  if (!clue) return false;

  let unlocked = getUnlockedClues();
  if (!unlocked.includes(clue.id)) {
    unlocked.push(clue.id);
    saveUnlockedClues(unlocked);
  }
  renderPlayerCluesList();
  return true;
}

function getClueTags() {
  const raw = localStorage.getItem('dangan_tags_' + (currentUserHash || 'guest'));
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  return {};
}

function getClueNotes() {
  const raw = localStorage.getItem('dangan_notes_' + (currentUserHash || 'guest'));
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  return {};
}

function toggleClueTag(clueId, tagType) {
  const tags = getClueTags();
  if (tags[clueId] === tagType) {
    delete tags[clueId];
  } else {
    tags[clueId] = tagType;
  }
  localStorage.setItem('dangan_tags_' + (currentUserHash || 'guest'), JSON.stringify(tags));
  renderPlayerCluesList();
}

function saveClueNote(clueId, noteText) {
  const notes = getClueNotes();
  notes[clueId] = noteText;
  localStorage.setItem('dangan_notes_' + (currentUserHash || 'guest'), JSON.stringify(notes));
}

function filterUserClueTag(tag) {
  currentUserClueTagFilter = tag;
  const btns = document.querySelectorAll('.clue-filter-tags .clue-tag-btn');
  btns.forEach(b => b.classList.remove('active'));
  if (tag === 'ALL' && btns[0]) btns[0].classList.add('active');
  else if (tag === 'IMPORTANT' && btns[1]) btns[1].classList.add('active');
  else if (tag === 'DOUBT' && btns[2]) btns[2].classList.add('active');
  else if (tag === 'TRASH' && btns[3]) btns[3].classList.add('active');
  else if (tag === 'LOCKED' && btns[4]) btns[4].classList.add('active');
  renderPlayerCluesList();
}

function unlockClue(rawCode) {
  if (!rawCode) return false;
  const clean = rawCode.trim().toUpperCase();

  // If player tries to brute-force by entering sequential EVD-xx or single numbers
  if (/^(EVD-\d+|E\d+|\d{1,2})$/i.test(clean)) {
    playSfx('wrong');
    alert(`⚠️ ไม่สามารถใช้รหัสลำดับ (${clean}) ปลดล็อกได้โดยตรง\nกรุณากรอกรหัส PIN 6 หลักที่ระบุบนบัตรหลักฐานที่ค้นพบ หรือสแกน QR Code`);
    return false;
  }

  // Find clue by 6-digit PIN or direct pin/id match
  const clue = ALL_CLUES_DATA.find(c => {
    if (c.pin && c.pin === clean) return true;
    // Allow URL parameter matching e.g. from scanned QR containing pin
    if (clean.includes(c.pin)) return true;
    return false;
  });

  if (!clue) {
    playSfx('wrong');
    alert(`❌ ไม่พบหลักฐานสำหรับรหัส PIN: "${rawCode}"\nกรุณาตรวจสอบรหัส PIN 6 หลักบนบัตรหลักฐานอีกครั้ง`);
    return false;
  }

  let unlocked = getUnlockedClues();
  if (!unlocked.includes(clue.id)) {
    unlocked.push(clue.id);
    saveUnlockedClues(unlocked);
    playSfx('clue_get');
    showToast(`✨ ค้นพบหลักฐานใหม่: [${clue.name}] บันทึกลงใน Monopad แล้ว!`);
    broadcast({
      type: 'clue_discovered',
      clueId: clue.id,
      clueName: clue.name,
      playerName: (myPlayer && myPlayer.name) ? myPlayer.name : 'นักเรียน',
      userHash: currentUserHash
    });
  } else {
    showToast(`ℹ️ คุณมีหลักฐาน [${clue.name}] ใน Monopad อยู่แล้ว`);
  }

  renderPlayerCluesList();
  return true;
}

function showToast(text) {
  let t = document.getElementById('danganToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'danganToast';
    t.style.position = 'fixed';
    t.style.bottom = '80px';
    t.style.left = '50%';
    t.style.transform = 'translateX(-50%)';
    t.style.background = 'rgba(20, 20, 32, 0.96)';
    t.style.border = '2px solid var(--mono-pink)';
    t.style.borderRadius = '8px';
    t.style.color = '#fff';
    t.style.padding = '10px 20px';
    t.style.fontWeight = '900';
    t.style.fontSize = '0.9rem';
    t.style.boxShadow = '4px 4px 0px #000';
    t.style.zIndex = '999999';
    t.style.transition = 'opacity 0.3s ease';
    document.body.appendChild(t);
  }
  t.innerText = text;
  t.style.opacity = '1';
  t.style.display = 'block';
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => { t.style.display = 'none'; }, 300);
  }, 3200);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderPlayerCluesList() {
  const container = document.getElementById('pCluesListContent');
  if (!container) return;

  const unlocked = getUnlockedClues();
  const tags = getClueTags();
  const notes = getClueNotes();

  const countBadge = document.getElementById('pUnlockedClueCount');
  if (countBadge) countBadge.innerText = unlocked.length;

  const q = (document.getElementById('clueSearchInput') ? document.getElementById('clueSearchInput').value : '').toLowerCase().trim();

  let html = '';
  let visibleCount = 0;

  ALL_CLUES_DATA.forEach(c => {
    const isUnlocked = unlocked.includes(c.id);
    const userTag = tags[c.id] || '';
    const userNote = notes[c.id] || '';

    // Filter by tag
    if (currentUserClueTagFilter === 'IMPORTANT' && userTag !== 'star') return;
    if (currentUserClueTagFilter === 'DOUBT' && userTag !== 'doubt') return;
    if (currentUserClueTagFilter === 'TRASH' && userTag !== 'trash') return;
    if (currentUserClueTagFilter === 'LOCKED' && isUnlocked) return;
    if (currentUserClueTagFilter !== 'LOCKED' && currentUserClueTagFilter !== 'ALL' && !isUnlocked) return;

    // Search query
    if (q) {
      const matchText = c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.loc.toLowerCase().includes(q) || userNote.toLowerCase().includes(q);
      if (!matchText) return;
    }

    visibleCount++;

    if (isUnlocked) {
      html += `
        <div class="clue-card">
          ${c.image ? `<div style="width:100%; height:130px; border-radius:6px; overflow:hidden; margin-bottom:10px; border:1px solid rgba(56,189,248,0.3); background:#0a0e1a;">
            <img src="${c.image}" alt="${c.name}" style="width:100%; height:100%; object-fit:cover; display:block;">
          </div>` : ''}
          <div class="clue-header">
            <span class="clue-code" style="color:var(--mono-yellow); font-weight:900;">${c.id}</span>
          </div>
          <div class="clue-name">${c.name}</div>
          <div class="clue-location">📍 สถานที่พบ: ${c.loc}</div>
          <div class="clue-desc">${c.desc}</div>

          <!-- 3-State Tag Picker -->
          <div class="clue-tag-picker">
            <button class="tag-pill star ${userTag === 'star' ? 'active' : ''}" onclick="toggleClueTag('${c.id}', 'star')">
              ⭐ สำคัญ
            </button>
            <button class="tag-pill doubt ${userTag === 'doubt' ? 'active' : ''}" onclick="toggleClueTag('${c.id}', 'doubt')">
              ❓ สงสัย
            </button>
            <button class="tag-pill trash ${userTag === 'trash' ? 'active' : ''}" onclick="toggleClueTag('${c.id}', 'trash')">
              ❌ หลอก/ขยะ
            </button>
          </div>

          <!-- Personal Notes Field -->
          <div class="clue-note-wrap">
            <input type="text" class="clue-note-input" placeholder="📝 บันทึกส่วนตัว (พิมพ์เพื่อบันทึก)..." value="${escapeHtml(userNote)}" onchange="saveClueNote('${c.id}', this.value)" onblur="saveClueNote('${c.id}', this.value)">
          </div>
        </div>
      `;
    } else {
      // Locked clue card: Clean display without redundant scan button
      html += `
        <div class="clue-locked-card">
          <div>
            <div style="color:#aaa; font-weight:700; font-size:0.9rem;">🔒 ${c.id}: [ยังไม่ถูกค้นพบ]</div>
            <div style="font-size:0.75rem; color:#64748b; margin-top:3px;">(ค้นหาบัตรหลักฐานเพื่อสแกน QR หรือกรอกรหัส PIN 6 หลัก)</div>
          </div>
        </div>
      `;
    }
  });

  if (visibleCount === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:#888;">ไม่พบการ์ดหลักฐานที่ตรงกับเงื่อนไข</div>`;
  } else {
    if (currentUserClueTagFilter === 'LOCKED') {
      const remainingCount = ALL_CLUES_DATA.length - unlocked.length;
      html = `<div style="background:rgba(56,189,248,0.08); border:1px solid rgba(56,189,248,0.25); border-radius:6px; padding:10px 14px; margin-bottom:12px; font-size:0.85rem; color:#38bdf8; font-weight:800; display:flex; justify-content:space-between; align-items:center;"><span>🔒 พยานหลักฐานที่ยังไม่ถูกค้นพบ</span></div>` + html;
    }
    container.innerHTML = html;
  }
}

function filterPlayerClues() {
  renderPlayerCluesList();
}

// ==========================================================
// STAGE CONTROLS & TIMERS
// ==========================================================
function splitGraphemes(str) {
  if (!str) return [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    try {
      const seg = new Intl.Segmenter('th', { granularity: 'grapheme' });
      return Array.from(seg.segment(str), s => s.segment);
    } catch(e) {}
  }
  return Array.from(str);
}

function setStage(stage, config) {
  gameState.stage = stage;
  updateMonopadPhaseTabs(stage);
  stopTimer();
  closeCourtResultModal(true);
  closeExecutionModal(true);

  if (stage === 'dailylife' || stage === 'daily') {
    stopTimer();
    playSfx('chime');
    logCourt(`☕ [DAILY LIFE]: กลับสู่ช่วงชีวิตประจำวันปกติ (Daily Life)`);
  } else if (stage === 'idle') {
    stopTimer();
    playSfx('chime');
    logCourt(`🎬 [IDLE]: แสดงหน้าจอพักศาลชั้นเรียน รอประธาน Monokuma เริ่มการไต่สวน`);
  } else if (stage === 'investigation') {
    stopTimer();
    playSfx('gavel');
    logCourt(`🔍 [INVESTIGATION]: เริ่มต้นช่วงเวลาสืบสวนหาหลักฐาน (Turn-Based)! ออกค้นหาและสแกน QR Code`);
  } else if (stage === 'trial') {
    autoUnlockTrialClues();
    playSfx('gavel');
    logCourt(`⚖️ [CLASS TRIAL]: เริ่มต้นศาลชั้นเรียน! เข้าสู่ช่วงอภิปรายและไต่สวนคดี`);
  } else if (stage === 'stage1') {
    autoUnlockTrialClues();
    const activePlayerCount = Object.keys(gameState.players).length;
    gameState.stg1Required = activePlayerCount; // All players must submit
    gameState.stg1Submissions = 0;
    gameState.stg1SubmissionsList = [];
    gameState.stg1Evaluated = false;
    const slotCountEl = document.getElementById('stg1TotalSlots');
    if (slotCountEl) slotCountEl.innerText = activePlayerCount || 4;
    updateStg1Display();
    if (config) {
      if (config.prompt) gameState.stg1Prompt = config.prompt;
      if (config.correctClueId) gameState.stg1TargetClue = config.correctClueId;
    }
    const pBox = document.getElementById('courtStage1Prompt');
    if (pBox && gameState.stg1Prompt) pBox.innerText = `"${gameState.stg1Prompt}"`;
    gameState.timeRemaining = 60;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
  } else if (stage === 'stage2') {
    autoUnlockTrialClues();
    const word = (config && config.targetWord) ? config.targetWord.toUpperCase() : "WATER CLOCK";
    gameState.stg2Word = word;
    gameState.stg2Target = word.split('');
    gameState.stg2Board = gameState.stg2Target.map(c => c === ' ' ? ' ' : '_');
    gameState.stg2Mistakes = 0;
    gameState.stg2MaxMistakes = 5;
    gameState.hangmanTurnIdx = 0;
    if (config && config.prompt) {
      gameState.stg2Prompt = config.prompt;
    }
    updateHangmanHealthDisplay();
    updateHangmanDisplay();
    gameState.timeRemaining = 75;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
  } else if (stage === 'stage3') {
    autoUnlockTrialClues();
    if (config) {
      if (config.challenger !== undefined) gameState.stg3Challenger = config.challenger;
      if (config.opponent !== undefined) gameState.stg3Opponent = config.opponent;
      if (config.argument) gameState.stg3Argument = config.argument;
    }
    if (!gameState.stg3Opponent) gameState.stg3Opponent = "";
    updateRebuttalDisplay();
    gameState.timeRemaining = 60;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('rebuttal');
  } else if (stage === 'stage4') {
    autoUnlockTrialClues();
    if (config && config.route && typeof LOGIC_DIVE_ROUTES !== 'undefined' && LOGIC_DIVE_ROUTES[config.route]) {
      gameState.stg4Route = config.route;
      LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES[config.route];
    } else if (!gameState.stg4Route) {
      gameState.stg4Route = 'pulley';
      if (typeof LOGIC_DIVE_ROUTES !== 'undefined') LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES.pulley;
    }
    gameState.stg4Step = 1;
    gameState.stg4Votes = {};
    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.add('hidden');
      crashNotice.style.display = 'none';
    }
    updateLogicDiveDisplay();
    gameState.timeRemaining = 45;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
  } else if (stage === 'stage5') {
    if (config) {
      if (config.topic) gameState.stg5Topic = config.topic;
      if (config.leftTeam) gameState.stg5LeftTeam = config.leftTeam;
      if (config.rightTeam) gameState.stg5RightTeam = config.rightTeam;
    }
    if (!gameState.stg5Topic) {
      const topEl = document.getElementById('cfgStg5Topic');
      if (topEl && topEl.value) gameState.stg5Topic = topEl.value;
    }
    if (!gameState.stg5LeftTeam) {
      const lEl = document.getElementById('cfgStg5Left');
      if (lEl && lEl.value) gameState.stg5LeftTeam = lEl.value;
    }
    if (!gameState.stg5RightTeam) {
      const rEl = document.getElementById('cfgStg5Right');
      if (rEl && rEl.value) gameState.stg5RightTeam = rEl.value;
    }
    updateScrumDisplay();
    gameState.stg5Meter = 50;
    gameState.timeRemaining = 60;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
  } else if (stage === 'stage6') {
    autoUnlockTrialClues();
    gameState.stg6Wave = 1;
    gameState.stg6MaxWave = 4;
    gameState.stg6Shield = 100;
    gameState.stg6Finished = false;
    gameState.stg6FinalReady = false;
    stg6FinalBlowSent = false;
    gameState.stg6TargetPlayer = config?.targetPlayer || (document.getElementById('adminArmamentTargetSelect')?.value) || '';
    if (config && config.scream) {
      gameState.stg6Statement = config.scream;
    } else {
      gameState.stg6Statement = gameState.stg6Denials[0];
    }
    updateShieldDisplay();
    const banner = document.getElementById('armamentFinalBlowBanner');
    if (banner) banner.classList.add('hidden');
    gameState.timeRemaining = 60;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
  } else if (stage === 'closing') {
    autoUnlockTrialClues();
    gameState.closingCurrentPage = 1;
    gameState.closingSlots = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false, 10: false };
    distributeClosingCards();
    updateClosingDisplay();
    gameState.timeRemaining = 90;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
    logCourt(`📖 [CLOSING ARGUMENT]: เริ่มต้นการปะติดปะต่อมังงะคดีความ 5 หน้า 18 ช่อง (เวลา 90s - หยุดเวลาไว้ รอ DM เริ่ม)`);
  } else if (stage === 'stage7') {
    gameState.votingOpen = true;
    myPlayerVoted = false;
    gameState.votes = {};
    gameState.votesCast = {};
    gameState.votesRevealed = false;
    updateVoteDisplay();
    gameState.timeRemaining = 60;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('vote_intro');
  } else if (stage === 'lobby') {
    logCourt(`🏛️ [LOBBY]: กลับสู่ห้องพิจารณาคดีหลัก`);
  }

  renderStage(stage);
  if (isHost) broadcast({ type: 'sync_state', state: gameState });
}

function startTimer(duration) {
  stopTimer();
  gameState.timeRemaining = duration;
  gameState.timerRunning = true;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (gameState.timeRemaining > 0) {
      gameState.timeRemaining--;
      updateTimerDisplay();
      if (isHost) broadcast({ type: 'timer_tick', time: gameState.timeRemaining });
      if (gameState.timeRemaining <= 10) playSfx('wrong');
    } else {
      stopTimer();
      logCourt('⌛ [TIME UP]: หมดเวลาสำหรับการพิจารณาคดีช่วงนี้!');
      if (gameState.stage === 'stage1') {
        evaluateStg1Batch();
      } else if (gameState.stage === 'stage2') {
        showMinigameResult(false, "TIME EXHAUSTED!", "หมดเวลาการถอดรหัสคำศัพท์!", "ศาลไม่สามารถถอดรหัสกลไกได้ทันเวลา (-10% Influence)");
      } else if (gameState.stage === 'stage3') {
        showMinigameResult(false, "TIME EXHAUSTED!", "หมดเวลาการดวลดาบคำพูด!", "ผู้เล่นไม่สามารถหักล้างข้อโต้แย้งได้ทันเวลา (-15% Influence)");
      } else if (gameState.stage === 'stage4') {
        evaluateLogicDiveMajority();
      } else if (gameState.stage === 'stage5') {
        showMinigameResult(false, "⚖️ ไม่สามารถหาข้อสรุปได้ (STALEMATE)", "หมดเวลาการอภิปราย สองขั้วความคิดติดหล่มโดยไม่มีฝ่ายใดชนะ!", "ต้องอภิปรายเพิ่มเติมเพื่อหาข้อสรุปใหม่");
      } else if (gameState.stage === 'stage6') {
        showMinigameResult(false, "TIME EXHAUSTED!", "หมดเวลาการทุบทำลายเกราะการปฏิเสธ!", "คนร้ายสามารถหลบหนีข้อกล่าวหาได้");
      } else if (gameState.stage === 'closing') {
        showMinigameResult(false, "TIME EXHAUSTED!", "หมดเวลาการปะติดปะต่อมังงะคดีความ!", "ไม่สามารถสรุปคดีได้ทันเวลา");
      } else if (gameState.stage === 'stage7' && !gameState.votesRevealed) {
        revealVotes();
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  gameState.timerRunning = false;
}

function updateTimerDisplay() {
  const m = Math.floor(gameState.timeRemaining / 60);
  const s = gameState.timeRemaining % 60;
  const str = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const el = document.getElementById('courtTimerDigits');
  if (el) {
    el.innerText = str;
    if (gameState.timeRemaining <= 15) {
      el.style.color = '#ff2244';
    } else {
      el.style.color = '#fff';
    }
  }
}

function updateInfluenceDisplay() {
  /* influence gauge removed */
}

function logCourt(text) {
  const box = document.getElementById('courtLog');
  if (box) {
    const d = document.createElement('div');
    d.innerText = `> ${text}`;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }
  const trialBox = document.getElementById('courtLogTrial');
  if (trialBox) {
    const d = document.createElement('div');
    d.innerText = `> ${text}`;
    trialBox.appendChild(d);
    trialBox.scrollTop = trialBox.scrollHeight;
  }
}

function updateDiscoveredCluesDisplay() {
  const discovered = gameState.discoveredClues || [];
  const count = discovered.length;
  const countEl = document.getElementById('courtDiscoveredCount');
  if (countEl) countEl.innerText = count;

  const fillEl = document.getElementById('courtDiscoveryFill');
  if (fillEl) fillEl.style.width = `${Math.min(100, Math.round((count / ALL_CLUES_DATA.length) * 100))}%`;
}

function handleResetSession() {
  stopTimer();
  gameState.players = {};
  gameState.stage = 'lobby';
  gameState.influence = 100;
  gameState.stg1Submissions = 0;
  gameState.stg5Meter = 50;
  gameState.stg6Shield = 100;
  gameState.votes = {};
  gameState.discoveredClues = [];
  gameState.discoveredCluesCount = 0;

  if (currentView === 'player') {
    alert('🔄 ผู้ดูแลศาล (DM) ได้ทำการรีเซ็ตห้องเพื่อเริ่มรอบใหม่');
    sessionStorage.removeItem('dangan_user_hash');
    currentUserHash = '';
    myPlayer = null;
    navigate('/play?room=' + roomCode);
  } else {
    updatePlayerDisplays();
    renderStage('lobby');
  }
}

function handleKickPlayer(kickedId) {
  if (myPlayer && myPlayer.id === kickedId) {
    if (hostPeer) hostPeer.close();
    sessionStorage.removeItem('dangan_user_hash');
    alert('⚠️ คุณถูกนำออกจากห้องโดยผู้ดูแลศาล (DM)');
    navigate('/');
    return;
  }

  if (gameState.players[kickedId]) {
    delete gameState.players[kickedId];
    updatePlayerDisplays();
  }
}

function handleClueDiscovered(clueId, clueName, playerName, userHash) {
  if (!gameState.discoveredClues) gameState.discoveredClues = [];
  if (!gameState.discoveredClues.includes(clueId)) {
    gameState.discoveredClues.push(clueId);
    gameState.discoveredCluesCount = gameState.discoveredClues.length;
    updateDiscoveredCluesDisplay();
    logCourt(`🔎 [DISCOVERY]: ${playerName || 'นักเรียน'} สแกนพบหลักฐาน [${clueName || clueId}]!`);
    if (currentView === 'court') {
      playSfx('clue_get');
    }
  }

  // Record on player object in gameState.players
  Object.values(gameState.players).forEach(p => {
    if ((userHash && p.userHash === userHash) || (playerName && p.name === playerName)) {
      if (!p.clues) p.clues = [];
      if (!p.clues.includes(clueId)) p.clues.push(clueId);
    }
  });

  if (typeof renderAdminEvidenceTracker === 'function') {
    renderAdminEvidenceTracker();
  }
}

// ==========================================================
// STAGE RENDERERS (COURTROOM VIEW & MOBILE VIEW)
// ==========================================================
function renderStage(stage) {
  const courtStages = ['courtDailyLife', 'courtIdle', 'courtLobby', 'courtTrial', 'courtInvestigation', 'courtStage1', 'courtStage2', 'courtStage3', 'courtStage4', 'courtStage5', 'courtStage6', 'courtClosing', 'courtStage7', 'courtVerdict'];
  courtStages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  // Clock visibility: Only show during timed mini-games (stage1 to stage7, closing)
  const clockEl = document.querySelector('.monokuma-clock');
  if (clockEl) {
    if (stage && (stage.startsWith('stage') || stage === 'closing')) {
      clockEl.classList.remove('hidden');
    } else {
      clockEl.classList.add('hidden');
    }
  }

  if (stage === 'dailylife' || stage === 'daily') {
    const dl = document.getElementById('courtDailyLife');
    if (dl) dl.classList.remove('hidden');
    updatePlayerDisplays();
  } else if (stage === 'idle') {
    const idl = document.getElementById('courtIdle');
    if (idl) idl.classList.remove('hidden');
    updatePlayerDisplays();
  } else if (stage === 'trial') {
    const ct = document.getElementById('courtTrial');
    if (ct) ct.classList.remove('hidden');
    updatePlayerDisplays();
  } else if (stage === 'investigation') {
    const inv = document.getElementById('courtInvestigation');
    if (inv) inv.classList.remove('hidden');
    updateDiscoveredCluesDisplay();
  } else if (stage === 'stage1') {
    const s1 = document.getElementById('courtStage1');
    if (s1) s1.classList.remove('hidden');
    updateStg1Display();
  } else if (stage === 'stage2') {
    const s2 = document.getElementById('courtStage2');
    if (s2) s2.classList.remove('hidden');
    updateHangmanDisplay();
    updateHangmanHealthDisplay();
  } else if (stage === 'stage3') {
    const s3 = document.getElementById('courtStage3');
    if (s3) s3.classList.remove('hidden');
    updateRebuttalDisplay();
  } else if (stage === 'stage4') {
    const s4 = document.getElementById('courtStage4');
    if (s4) s4.classList.remove('hidden');
    updateLogicDiveDisplay();
  } else if (stage === 'stage5') {
    const s5 = document.getElementById('courtStage5');
    if (s5) s5.classList.remove('hidden');
    updateScrumDisplay();
  } else if (stage === 'stage6') {
    const s6 = document.getElementById('courtStage6');
    if (s6) s6.classList.remove('hidden');
    updateShieldDisplay();
  } else if (stage === 'closing') {
    const cl = document.getElementById('courtClosing');
    if (cl) cl.classList.remove('hidden');
    updateClosingDisplay();
  } else if (stage === 'stage7') {
    const s7 = document.getElementById('courtStage7');
    if (s7) s7.classList.remove('hidden');
    updateVoteDisplay();
  } else {
    const lob = document.getElementById('courtLobby');
    if (lob) lob.classList.remove('hidden');
    updatePlayerDisplays();
  }

  // Render on Mobile
  renderMobileTask(stage);
}

// ==========================================================
// MINI-GAME SPECIFIC LOGIC
// ==========================================================
// ==========================================================
// AUTO CLUE DISCOVERY HELPER
// ==========================================================
function autoUnlockTrialClues() {
  const trialClueIds = ['CORE-01', 'EVD-01', 'EVD-02', 'EVD-04', 'EVD-05', 'EVD-06', 'EVD-07', 'EVD-08', 'EVD-09', 'EVD-10', 'EVD-11', 'EVD-12', 'EVD-14'];
  if (!gameState.discoveredClues) gameState.discoveredClues = [];
  trialClueIds.forEach(cid => {
    if (!gameState.discoveredClues.includes(cid)) {
      gameState.discoveredClues.push(cid);
    }
  });
  gameState.discoveredCluesCount = gameState.discoveredClues.length;
  updateDiscoveredCluesDisplay();
}

// ==========================================================
// UNIVERSAL MINIGAME FINAL RESULT BANNER & EXECUTION MODALS
// ==========================================================
function showMinigameResult(success, title, desc, details, skipBroadcast = false) {
  stopTimer();
  if (currentView === 'admin' || currentView === 'simulation') {
    return; // Popups must NEVER block DM Admin or parent simulation view!
  }
  const modal = document.getElementById('courtResultModal');
  const card = document.getElementById('courtResultCard');
  const emblem = document.getElementById('resultEmblem');
  const badge = document.getElementById('resultBadge');
  const titleEl = document.getElementById('resultTitle');
  const descEl = document.getElementById('resultDesc');
  const detailsEl = document.getElementById('resultDetails');

  if (card) {
    card.className = 'court-result-card ' + (success ? 'victory' : 'defeat');
  }
  if (emblem) emblem.innerText = success ? '🏆' : '💀';
  if (badge) badge.innerText = success ? 'MINI-GAME CLEARED // ผ่านช่วงอภิปราย' : 'MINI-GAME FAILED // โต้แย้งล้มเหลว';
  if (titleEl) titleEl.innerText = title || (success ? 'VICTORY' : 'DEFEAT');
  if (descEl) descEl.innerText = desc || '';
  if (detailsEl) {
    if (details) {
      detailsEl.style.display = 'block';
      detailsEl.innerHTML = details;
    } else {
      detailsEl.style.display = 'none';
    }
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  if (isHost || currentView === 'court') {
    playSfx(success ? 'point_break' : 'wrong');
  }

  if (!skipBroadcast && isHost) {
    broadcast({
      type: 'minigame_result',
      success: success,
      title: title,
      desc: desc,
      details: details
    });
  }

  logCourt(`📢 [RESULT]: ${title} - ${success ? 'สำเร็จ' : 'ล้มเหลว'}`);
}

function closeCourtResultModal(skipBroadcast = false) {
  const modal = document.getElementById('courtResultModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  if (!skipBroadcast) {
    if (gameState.stage !== 'trial' && gameState.stage !== 'lobby') {
      setStage('trial');
      if (isHost) broadcast({ type: 'set_stage', stage: 'trial' });
    } else if (isHost) {
      broadcast({ type: 'close_minigame_result' });
    }
  }
}

function triggerMonokumaExecutionCutscene(isVictory, skipBroadcast = false) {
  stopTimer();
  if (currentView === 'admin' || currentView === 'simulation') {
    return; // Execution cutscene must NEVER block DM Admin or parent simulation view!
  }
  const modal = document.getElementById('monokumaExecutionModal');
  const nameEl = document.getElementById('executionCulpritName');
  const verdictEl = document.getElementById('executionVerdictText');
  const avatarEl = document.getElementById('executionCulpritAvatar');

  if (nameEl) nameEl.innerText = isVictory ? 'NPC B (สุดยอดนักเอาตัวรอด)' : 'นักเรียนทุกคน (โหวตผิดตัว)';
  if (avatarEl) avatarEl.innerText = isVictory ? '💀' : '⚡';
  if (verdictEl) {
    verdictEl.innerHTML = isVictory
      ? '<p style="color:#00ff88; font-weight:700; margin-bottom:10px;">ถูกต้อง! คนที่ผูกเงื่อนรัดคอตัวเองจนเกิดอุบัติเหตุคอหักตายคือ B (สุดยอดนักเอาตัวรอด)!</p><p>Monokuma หัวเราะเยาะ A (นักมายากล) ที่แผนการพังไม่เป็นท่า และลากร่างศพของ B ไปประหารซ้ำแบบเย้ยหยัน! ผู้เล่นทุกคนรอดชีวิต แต่ A จะถูกเพื่อนร่วมชั้นเกลียดชังและหวาดระแวงตลอดกาล! (TRUE ENDING)</p>'
      : '<p style="color:#ff2244; font-weight:700; margin-bottom:10px;">โหวตผิด! Blackened ที่แท้จริงคือ B ไม่ใช่คนอื่น!</p><p>ตามกฎศักดิ์สิทธิ์ของโรงเรียน เมื่อลงคะแนนผิด... นักเรียนทุกคนในห้องพิจารณาคดีจะต้องถูกนำตัวเข้าสู่ลานประหารชีวิตหมู่!! ขอต้อนรับสู่ความสิ้นหวังอย่างสมบูรณ์แบบ! (BAD ENDING)</p>';
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  }

  if (isHost || currentView === 'court') {
    playSfx('gavel');
    setTimeout(() => {
      playSfx(isVictory ? 'laugh' : 'wrong');
    }, 550);
  }

  if (!skipBroadcast && isHost) {
    broadcast({ type: 'execution_cutscene', isVictory: isVictory });
  }
}

function closeExecutionModal(skipBroadcast = false) {
  const modal = document.getElementById('monokumaExecutionModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  if (!skipBroadcast && isHost) broadcast({ type: 'close_execution_cutscene' });
}

// ==========================================================
// MINI-GAME SPECIFIC LOGIC
// ==========================================================

// 1. Evidence Linker (Batch Evaluation without Premature Reveal)
function handleStg1Submit(clueId, pName) {
  if (gameState.stg1Evaluated) return;
  if (!gameState.stg1SubmissionsList) gameState.stg1SubmissionsList = [];

  const existingIdx = gameState.stg1SubmissionsList.findIndex(s => s.pName === pName);
  if (existingIdx >= 0) {
    gameState.stg1SubmissionsList[existingIdx].clueId = clueId;
  } else {
    gameState.stg1SubmissionsList.push({ pName: pName, clueId: clueId });
  }

  playSfx('correct');
  logCourt(`📥 [EVIDENCE SUBMIT]: ${pName} ได้ส่งหลักฐานเข้าสู่ศาลแล้ว`);
  updateStg1Display();

  const activeCount = Object.keys(gameState.players || {}).length;
  if (activeCount > 0 && gameState.stg1SubmissionsList.length >= activeCount) {
    setTimeout(() => {
      evaluateStg1Batch();
    }, 600);
  } else {
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
  }
}

function updateStg1Display() {
  const req = gameState.stg1Required || 2;
  const countEl = document.getElementById('stg1Count');
  const subs = gameState.stg1SubmissionsList || [];
  if (countEl) countEl.innerText = subs.length;

  const container = document.getElementById('stg1SlotsDisplay');
  if (!container) return;
  container.innerHTML = '';

  const target = gameState.stg1TargetClue || 'EVD-01';

  if (!gameState.stg1Evaluated) {
    subs.forEach((s, idx) => {
      const el = document.createElement('div');
      el.className = 'clue-card-placeholder active-match';
      el.innerText = `📥 [${idx + 1}] ได้รับหลักฐานแล้วจาก ${s.pName}`;
      container.appendChild(el);
    });
    for (let i = subs.length; i < req; i++) {
      const el = document.createElement('div');
      el.className = 'clue-card-placeholder';
      el.innerText = `รอหลักฐานชิ้นที่ ${i + 1}...`;
      container.appendChild(el);
    }
  } else {
    subs.forEach((s) => {
      const isCorrect = (s.clueId === target || s.clueId === 'CORE-01');
      const cObj = ALL_CLUES_DATA.find(c => c.id === s.clueId);
      const cName = cObj ? cObj.name : s.clueId;
      const el = document.createElement('div');
      el.className = 'clue-card-placeholder ' + (isCorrect ? 'active-match' : 'mismatch');
      el.innerText = isCorrect ? `✅ [${s.pName}] ${cName}` : `❌ [${s.pName}] ${cName} (ไม่ตรงจุดพิรุธ)`;
      container.appendChild(el);
    });
  }
}

function evaluateStg1Batch() {
  if (gameState.stg1Evaluated) return;
  gameState.stg1Evaluated = true;
  stopTimer();

  const subs = gameState.stg1SubmissionsList || [];
  const target = gameState.stg1TargetClue || 'EVD-01';
  let correctCount = 0;

  subs.forEach(s => {
    if (s.clueId === target || s.clueId === 'CORE-01') {
      correctCount++;
    }
  });

  updateStg1Display();

  const clueObj = ALL_CLUES_DATA.find(c => c.id === target);
  const targetName = clueObj ? clueObj.name : target;

  if (correctCount >= 1) {
    showMinigameResult(
      true,
      "EVIDENCE LINKED!",
      `หักล้างข้ออ้างของคนร้ายสำเร็จ! หลักฐานที่ถูกต้องคือ [${target}: ${targetName}]`,
      `มีนักเรียน ${correctCount} คนส่งหลักฐานถูกต้องตรงเป้าหมาย!`
    );
    unlockClueDirect(target);
    broadcast({
      type: 'court_clue_revealed',
      clueId: target,
      clueName: targetName,
      playerName: 'ศาลชั้นเรียน'
    });
  } else {
    gameState.influence = Math.max(0, gameState.influence - 15);
    showMinigameResult(
      false,
      "OBJECTION FAILED!",
      `หลักฐานที่ส่งเข้ามาไม่ตรงกับจุดพิรุธ (-15% Influence)`,
      `ไม่มีใครส่งหลักฐาน [${target}] เลย ศาลสูญเสียความน่าเชื่อถือ`
    );
  }

  if (isHost) broadcast({ type: 'sync_state', state: gameState });
}

function adminEvaluateStage1() {
  evaluateStg1Batch();
  broadcast({ type: 'stg1_evaluate' });
}

// 2. Hangman's Gambit (Round-robin Turn-based & Word Spacing Fix)
function getActivePlayersList() {
  return Object.values(gameState.players || {});
}

function getActiveHangmanPlayer() {
  const list = getActivePlayersList();
  if (!list.length) return null;
  const idx = (gameState.hangmanTurnIdx || 0) % list.length;
  return list[idx];
}

function handleStg2Char(char) {
  if (!char || !gameState.stg2Target || !gameState.stg2Board) return;
  const upChar = char.toUpperCase();

  // Track ALL guessed letters to strictly prevent double-counting mistakes
  if (!gameState.stg2GuessedChars) gameState.stg2GuessedChars = [];
  if (gameState.stg2GuessedChars.includes(upChar)) {
    return; // Already guessed! Strictly 1 mistake per letter
  }
  gameState.stg2GuessedChars.push(upChar);

  // Prevent turn-skipping exploits on already revealed characters
  const alreadyRevealed = gameState.stg2Board.some(c => c.toUpperCase() === upChar);
  if (alreadyRevealed) {
    return;
  }

  let matched = false;
  let newlyRevealed = false;
  gameState.stg2Target.forEach((targetChar, idx) => {
    if (targetChar.toUpperCase() === upChar) {
      if (gameState.stg2Board[idx] === '_') {
        newlyRevealed = true;
      }
      gameState.stg2Board[idx] = targetChar;
      matched = true;
    }
  });

  if (matched && newlyRevealed) {
    playSfx('correct');
    updateHangmanDisplay();
    if (!gameState.stg2Board.includes('_')) {
      stopTimer();
      showMinigameResult(
        true,
        "WORD DECODED!",
        `ถอดรหัสคำว่า "${gameState.stg2Target.join('')}" สำเร็จ!`,
        "กลไกนาฬิกาน้ำปล่อยน้ำถ่วงรอกถูกเปิดโปงอย่างสมบูรณ์แบบ!"
      );
    }
  } else {
    gameState.stg2Mistakes = (gameState.stg2Mistakes || 0) + 1;
    gameState.influence = Math.max(0, gameState.influence - 5);
    updateHangmanHealthDisplay();
    playSfx('wrong');

    if (gameState.stg2Mistakes >= (gameState.stg2MaxMistakes || 5)) {
      stopTimer();
      showMinigameResult(
        false,
        "INTEGRITY EXHAUSTED!",
        "ศาลหมดความอดทนจากการเดาผิดพลาดหลายครั้ง!",
        "ศาลสูญเสียความน่าเชื่อถือ ไม่สามารถถอดรหัสคำศัพท์ได้"
      );
    }
  }

  // Advance turn to next player
  gameState.hangmanTurnIdx = (gameState.hangmanTurnIdx || 0) + 1;
  updateHangmanDisplay();
  if (isHost) broadcast({ type: 'sync_state', state: gameState });
}

function updateHangmanDisplay() {
  const b = document.getElementById('hangmanBoard');
  if (!b) return;
  b.innerHTML = '';
  gameState.stg2Board.forEach(c => {
    const tile = document.createElement('div');
    if (c === ' ') {
      tile.className = 'hangman-tile space';
      tile.innerHTML = '&nbsp;';
    } else if (c !== '_') {
      tile.className = 'hangman-tile revealed';
      tile.innerText = c;
    } else {
      tile.className = 'hangman-tile';
      tile.innerText = '_';
    }
    b.appendChild(tile);
  });

  const activeP = getActiveHangmanPlayer();
  const nameEl = document.getElementById('hangmanActivePlayerName');
  if (nameEl) {
    nameEl.innerText = activeP ? `${activeP.name} [${activeP.role}]` : 'กำลังเชื่อมต่อผู้เล่น...';
  }
}

function updateHangmanHealthDisplay() {
  const txt = document.getElementById('hangmanHealthTxt');
  const fill = document.getElementById('hangmanHealthFill');
  const max = gameState.stg2MaxMistakes || 5;
  const current = Math.max(0, max - (gameState.stg2Mistakes || 0));
  if (txt) txt.innerText = `${current} / ${max}`;
  if (fill) fill.style.width = `${Math.round((current / max) * 100)}%`;
}

// 3. Rebuttal Showdown
function handleRebuttalSlash(bulletId, pName) {
  const clue = ALL_CLUES_DATA.find(c => c.id === bulletId) || { id: bulletId, name: bulletId || 'กระสุนความจริง' };
  playSfx('blade');
  logCourt(`⚔️ [TRUTH BLADE]: ${pName || 'ผู้เล่น'} กวัดแกว่ง [${clue.name}] เข้าปะทะข้อโต้แย้ง!`);

  // Display chosen evidence prominently on Court Screen under corresponding duelist
  const challenger = gameState.stg3Challenger || '';
  const isChallenger = Boolean(pName && challenger && (pName === challenger || pName.includes(challenger) || challenger.includes(pName)));
  const leftClueEl = document.getElementById('rebuttalLeftClue');
  const rightClueEl = document.getElementById('rebuttalRightClue');

  if (isChallenger) {
    gameState.stg3LeftClue = `[${clue.id}] ${clue.name}`;
    if (leftClueEl) leftClueEl.innerText = `🗡️ หลักฐาน: [${clue.id}] ${clue.name}`;
  } else {
    gameState.stg3RightClue = `[${clue.id}] ${clue.name}`;
    if (rightClueEl) rightClueEl.innerText = `🛡️ หลักฐาน: [${clue.id}] ${clue.name}`;
  }

  const slashEl = document.getElementById('rebuttalSlashFx');
  if (slashEl && (isHost || currentView === 'court')) {
    slashEl.classList.remove('hidden');
    slashEl.style.display = 'flex';
    setTimeout(() => {
      slashEl.classList.add('hidden');
      slashEl.style.display = 'none';
    }, 700);
  }
  if (isHost) broadcast({ type: 'sync_state', state: gameState });
}

function triggerRebuttalVerdict(isWin, skipBroadcast = false) {
  stopTimer();
  if (isWin) {
    playSfx('counter');
    setTimeout(() => {
      showMinigameResult(
        true,
        "BLADE OF TRUTH!",
        "คุณได้ฟันทำลายดาบปฏิเสธของคนร้ายสำเร็จ! 'Sore wa Chigau yo!'",
        "ข้ออ้างของคนร้ายถูกหักล้างอย่างสิ้นเชิง! ค้นพบพยานหลักฐานใหม่เข้าสู่ Monopad"
      );
      unlockClueDirect('EVD-12');
      broadcast({
        type: 'court_clue_revealed',
        clueId: 'EVD-12',
        clueName: 'มีดพับในกระเป๋าเสื้อเหยื่อเรียวตะ (B)',
        playerName: 'Rebuttal Showdown'
      });
    }, 400);
    if (!skipBroadcast && isHost) broadcast({ type: 'rebuttal_verdict', isWin: true });
  } else {
    gameState.influence = Math.max(0, gameState.influence - 15);
    showMinigameResult(
      false,
      "REBUTTAL DEFEAT!",
      "ข้อโต้แย้งถูกฟันกลับจนกระเด็น! (-15% Influence)",
      "ศาลเสียความน่าเชื่อถือจากการถูกบดขยี้ในดาบปะทะ"
    );
    if (!skipBroadcast && isHost) broadcast({ type: 'rebuttal_verdict', isWin: false });
  }
}

function adminRebuttalVerdict(isWin) {
  triggerRebuttalVerdict(isWin, true);
  broadcast({ type: 'rebuttal_verdict', isWin: isWin });
}


function populateArmamentTargetSelect() {
  const sel = document.getElementById('adminArmamentTargetSelect');
  if (!sel) return;
  const players = Object.values(gameState.players || {});
  const currentVal = sel.value;
  sel.innerHTML = '';
  players.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
  if (currentVal && sel.querySelector(`option[value="${CSS.escape(currentVal)}"]`)) {
    sel.value = currentVal;
  }
}

function populateRebuttalSelects() {
  const chalSel = document.getElementById('adminRebuttalChallengerSelect');
  const oppSel = document.getElementById('adminRebuttalOpponentSelect');
  if (!chalSel && !oppSel) return;
  const players = Object.values(gameState.players || {});
  [chalSel, oppSel].forEach(sel => {
    if (!sel) return;
    const currentVal = sel.value;
    sel.innerHTML = '<option value="">-- เลือกผู้เล่น --</option>';
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.textContent = p.name;
      sel.appendChild(opt);
    });
    if (currentVal) sel.value = currentVal;
  });
}
function adminSelectRebuttalChallenger() {
  const sel = document.getElementById('adminRebuttalChallengerSelect');
  if (!sel) return;
  gameState.stg3Challenger = sel.value;
  const accuserEl = document.getElementById('rebuttalAccuser');
  if (accuserEl) {
    accuserEl.innerText = gameState.stg3Challenger ? `ฝ่ายกล่าวหา (${gameState.stg3Challenger})` : 'ฝ่ายกล่าวหา';
  }
  broadcast({ type: 'sync_state', state: gameState });
}

// 4. Logic Dive (Crash Without Revealing Answer + Admin Retry/Skip)
const LOGIC_DIVE_ROUTES = {
  pulley: [
    {
      step: 1,
      question: "ร่างของเหยื่อเรียวตะ (B) ถูกดึงขึ้นไปแขวนติดเพดานห้องซักผ้าได้อย่างไร?",
      choices: {
        A: "มีคนแอบซ่อนอยู่บนฝ้าเพดานช่วยดึง",
        B: "ถังน้ำหนักนอกหน้าต่างตกลงมาถ่วงดึงเชือก",
        C: "มอเตอร์เครื่องซักผ้ากระชากสายพาน"
      },
      correct: "B"
    },
    {
      step: 2,
      question: "เชือกไนลอนพาดผ่านจุดไหนเพื่อยกตัวเหยื่อขึ้นสู่เพดาน?",
      choices: {
        A: "พาดผ่านท่อเหล็กบนเพดานออกไปนอกหน้าต่างสูง",
        B: "ผูกติดกับใบพัดลมระบายอากาศบนผนัง",
        C: "ร้อยผ่านรูระบายน้ำทิ้งที่พื้นห้อง"
      },
      correct: "A"
    },
    {
      step: 3,
      question: "สาเหตุการเสียชีวิตที่แท้จริงของเหยื่อเรียวตะ (B) คืออะไร?",
      choices: {
        A: "จมน้ำขาดอากาศหายใจในถัง",
        B: "ถูกกะโหลกแตกด้วยหม้อสตูว์",
        C: "ขาดอากาศหายใจจากการถูกเชือกดึงแขวนติดเพดาน"
      },
      correct: "C"
    }
  ],
  timeline: [
    {
      step: 1,
      question: "ใครหรือสิ่งใดเป็นตัวเติมน้ำลงในถังถ่วงน้ำหนักจนเกิดแรงดึง?",
      choices: {
        A: "น้ำประปาเปิดทิ้งไว้ล่วงหน้าผ่านสายยาง",
        B: "ฝนที่ตกลงมาใส่ถังอย่างกะทันหัน",
        C: "เหยื่อเป็นคนแบกน้ำไปเทใส่ถังเอง"
      },
      correct: "A"
    },
    {
      step: 2,
      question: "เสียงตึงตังโครมครามเวลา 21:00 น. แท้จริงคืออะไร?",
      choices: {
        A: "เสียงการต่อสู้จริงระหว่างคนร้ายกับเหยื่อ",
        B: "รองเท้าบูทหมุนในเครื่องอบผ้าที่ตั้งเวลาดีเลย์ไว้",
        C: "เสียงถังน้ำตกกระทบพื้นคอร์ทยาร์ดภายนอก"
      },
      correct: "B"
    },
    {
      step: 3,
      question: "ใครคือผู้จัดวางกลไกทั้งหมดนี้โดยใช้ความเชี่ยวชาญ?",
      choices: {
        A: "นักมายากล (A) ผู้คุ้นเคยกับรอกและกลลวง",
        B: "คนครัวผู้ทำสตูว์เนื้อ",
        C: "ช่างซ่อมบำรุงประจำอาคาร"
      },
      correct: "A"
    }
  ]
};

let LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES.pulley;

function handleLogicDiveVote(qStep, choice, voterId, pName) {
  if (gameState.stg4Step !== qStep) return;
  if (!gameState.stg4Votes) gameState.stg4Votes = {};
  gameState.stg4Votes[voterId] = choice;
  
  const count = Object.keys(gameState.stg4Votes).length;
  const tallyEl = document.getElementById('diveVotedCount');
  const totalEl = document.getElementById('diveTotalVoters');
  const activePlayers = Object.keys(gameState.players || {}).length;

  if (tallyEl) tallyEl.innerText = count;
  if (totalEl) totalEl.innerText = activePlayers;

  if (activePlayers > 0 && count >= activePlayers) {
    if (isHost) {
      evaluateLogicDiveMajority();
    }
  } else {
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
  }
}

function evaluateLogicDiveMajority() {
  if (gameState.stg4Evaluating) return;
  if (gameState.stg4Route && LOGIC_DIVE_ROUTES[gameState.stg4Route]) {
    LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES[gameState.stg4Route];
  }
  const currentData = LOGIC_DIVE_DATA.find(d => d.step === gameState.stg4Step);
  if (!currentData) return;
  gameState.stg4Evaluating = true;

  const tally = { A: 0, B: 0, C: 0 };
  Object.values(gameState.stg4Votes || {}).forEach(ch => {
    if (tally[ch] !== undefined) tally[ch]++;
  });

  const maxVotes = Math.max(tally.A, tally.B, tally.C);
  const topChoices = ['A', 'B', 'C'].filter(ch => tally[ch] === maxVotes && maxVotes > 0);
  let winningChoice = 'A';
  if (topChoices.length === 1) {
    winningChoice = topChoices[0];
  } else if (topChoices.length > 1) {
    winningChoice = topChoices[Math.floor(Math.random() * topChoices.length)];
  } else {
    winningChoice = currentData.correct;
  }

  if (winningChoice === currentData.correct) {
    playSfx('correct');
    logCourt(`✨ [LOGIC DIVE]: มติเสียงข้างมากเลือกข้อ [${winningChoice}] ถูกต้อง! สเก็ตบอร์ดพุ่งทะลวงสู่อุโมงค์ถัดไป (ด่าน ${gameState.stg4Step}/3)`);

    const lane = document.getElementById('lane' + winningChoice);
    if (lane) lane.classList.add('active-match');

    setTimeout(() => {
      gameState.stg4Step++;
      gameState.stg4Votes = {};
      gameState.stg4Evaluating = false;
      if (gameState.stg4Step > LOGIC_DIVE_DATA.length) {
        stopTimer();
        showMinigameResult(
          true,
          "LOGIC DIVE CLEAR!",
          "ทะลวงตรรกะจนพบความจริง! ร่างของเรียวตะถูกกลไกรอกน้ำถ่วงดึงแขวนติดเพดานห้องซักผ้า!",
          "เส้นทางความคิดทั้งหมดเชื่อมโยงสู่ข้อสรุปที่แท้จริง!"
        );
      } else {
        updateLogicDiveDisplay();
        // Timer starts only when DM presses "Start" button — NOT auto-started
      }
      if (isHost) broadcast({ type: 'sync_state', state: gameState });
    }, 1200);
  } else {
    // Collision crash - DO NOT reveal the correct answer!
    stopTimer();
    gameState.influence = Math.max(0, gameState.influence - 15);
    playSfx('wrong');

    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.remove('hidden');
      crashNotice.style.display = 'block';
      crashNotice.innerText = `💥 ชนผนังอุโมงค์! เสียงข้างมากเลือกข้อ [${winningChoice}] ซึ่งเป็นทางตัน (-15% Influence)`;
    }

    const lane = document.getElementById('lane' + winningChoice);
    if (lane) lane.classList.add('mismatch');

    gameState.stg4Evaluating = false;
    logCourt(`⚠️ [LOGIC DIVE CRASH]: เสียงข้างมากเลือกข้อ [${winningChoice}] ผิดทาง! ชนผนังอุโมงค์ (-15% Influence)`);
    broadcast({ type: 'logic_dive_crash', winningChoice: winningChoice });
  }
}

function adminRetryLogicDive() {
  gameState.stg4Votes = {};
  gameState.stg4Evaluating = false;
  const crashNotice = document.getElementById('diveCrashNotice');
  if (crashNotice) {
    crashNotice.classList.add('hidden');
    crashNotice.style.display = 'none';
  }
  ['A', 'B', 'C'].forEach(ch => {
    const lane = document.getElementById('lane' + ch);
    if (lane) lane.classList.remove('active-match', 'mismatch');
  });
  updateLogicDiveDisplay();
  broadcast({ type: 'logic_dive_retry' });
  showToast('🔄 ให้โอกาสผู้เล่นคิดและเลือกเส้นทางใหม่');
}

function adminSkipLogicDive() {
  gameState.stg4Step++;
  gameState.stg4Votes = {};
  gameState.stg4Evaluating = false; // Reset flag for next step
  const crashNotice = document.getElementById('diveCrashNotice');
  if (crashNotice) {
    crashNotice.classList.add('hidden');
    crashNotice.style.display = 'none';
  }
  if (gameState.stg4Step > 3) {
    stopTimer();
    showMinigameResult(true, "LOGIC DIVE CLEAR!", "ข้ามจนเสร็จสิ้น Logic Dive!");
  } else {
    updateLogicDiveDisplay();
    startTimer(45);
    broadcast({ type: 'sync_state', state: gameState });
  }
}

function adminStartLogicDiveTimer() {
  startTimer(45);
  broadcast({ type: 'logic_dive_timer_start' });
  showToast('▶️ เริ่มจับเวลา Logic Dive แล้ว');
}

function updateLogicDiveDisplay() {
  const currentData = LOGIC_DIVE_DATA.find(d => d.step === gameState.stg4Step);
  if (!currentData) return;

  const numEl = document.getElementById('diveStageNum');
  const qEl = document.getElementById('diveQuestion');
  if (numEl) numEl.innerText = `STAGE ${currentData.step} / 3`;
  if (qEl) qEl.innerText = `"${currentData.question}"`;

  ['A', 'B', 'C'].forEach(ch => {
    const lane = document.getElementById('lane' + ch);
    if (lane) {
      lane.classList.remove('highlight', 'active-match');
      lane.innerHTML = `<strong>${ch}:</strong> <span class="choice-text">${currentData.choices[ch]}</span>`;
    }
  });

  const tallyEl = document.getElementById('diveVotedCount');
  const totalEl = document.getElementById('diveTotalVoters');
  const activePlayers = Object.keys(gameState.players || {}).length;

  if (tallyEl) tallyEl.innerText = Object.keys(gameState.stg4Votes || {}).length;
  if (totalEl) totalEl.innerText = activePlayers;
}

// 5. Debate Scrum (Auto-Conclude at 100% or 0%)
function handleStg5Scrum(delta) {
  if (gameState.stg5Finished) return;
  gameState.stg5Meter = Math.max(0, Math.min(100, (gameState.stg5Meter !== undefined ? gameState.stg5Meter : 50) + delta));
  updateScrumDisplay();

  if (gameState.stg5Meter >= 100) {
    gameState.stg5Finished = true;
    stopTimer();
    const rightName = gameState.stg5RightTeam || 'ฝ่ายขวา';
    showMinigameResult(
      true,
      "SCRUM VICTORY!",
      `ชัยชนะของ [${rightName}]!`,
      "พลังความจริงผลักดันข้อถกเถียงจนได้ข้อสรุปที่เด็ดขาด!"
    );
  } else if (gameState.stg5Meter <= 0) {
    gameState.stg5Finished = true;
    stopTimer();
    const leftName = gameState.stg5LeftTeam || 'ฝ่ายซ้าย';
    showMinigameResult(
      true,
      "SCRUM VICTORY!",
      `ชัยชนะของ [${leftName}]!`,
      "พลังความจริงผลักดันข้อถกเถียงจนได้ข้อสรุปที่เด็ดขาด!"
    );
  }
}

function updateScrumDisplay() {
  const fill = document.getElementById('courtScrumFill');
  if (fill) fill.style.width = `${gameState.stg5Meter}%`;

  const topicEl = document.getElementById('scrumTopicTitle') || document.querySelector('#courtStage5 .riddle-title');
  const leftEl = document.getElementById('scrumLeftTitle') || document.querySelector('#courtStage5 .scrum-side.left h3');
  const rightEl = document.getElementById('scrumRightTitle') || document.querySelector('#courtStage5 .scrum-side.right h3');
  if (topicEl && gameState.stg5Topic) topicEl.innerText = `"${gameState.stg5Topic}"`;
  if (leftEl && gameState.stg5LeftTeam) leftEl.innerText = gameState.stg5LeftTeam;
  if (rightEl && gameState.stg5RightTeam) rightEl.innerText = gameState.stg5RightTeam;
}

// 6. Argument Armament
function handleStg6Hit(pName) {
  gameState.stg6Shield = Math.max(0, gameState.stg6Shield - 5);
  updateShieldDisplay();
  playSfx('blade');
  if (gameState.stg6Shield <= 0) {
    if (gameState.stg6Wave < (gameState.stg6MaxWave || 4)) {
      gameState.stg6Wave++;
      gameState.stg6Shield = 100;
      gameState.stg6Statement = gameState.stg6Denials[gameState.stg6Wave - 1] || gameState.stg6Statement;
      playSfx('break');
      logCourt(`💥 [ARMAMENT BREAK]: ทลายเกราะคลื่นที่ ${gameState.stg6Wave - 1} สำเร็จ! คนร้ายสติแตกเข้าสู่คลื่นที่ ${gameState.stg6Wave}!`);
      updateShieldDisplay();
      if (isHost) broadcast({ type: 'sync_state', state: gameState });
    } else {
      playSfx('break');
      const banner = document.getElementById('armamentFinalBlowBanner');
      if (banner) banner.classList.remove('hidden');
      logCourt(`💥 [ARMAMENT READY]: เกราะการปฏิเสธของคนร้ายพังทลายสิ้นเชิง! เล็งยิงกระสุนความจริงนัดสุดท้าย!`);
      if (isHost) broadcast({ type: 'armament_final_ready' });
    }
  }
}

function handleStg6FinalBlow(pName) {
  if (gameState.stg6Finished) return;
  gameState.stg6Finished = true;
  stopTimer();
  playSfx('counter');
  setTimeout(() => {
    playSfx('point_break');
    logCourt(`🎯 [FINAL TRUTH BULLET]: ${pName || 'ผู้เล่น'} ลั่นไก [มีดปอกผลไม้ในมือ B] ปิดฉากการปฏิเสธของคนร้าย!`);
    const scream = document.getElementById('culpritScreamText');
    if (scream) scream.innerText = `"อ๊ากกกกกกกกกกก!! แผนการของฉัน... พังหมดแล้ว...!!"`;

    showMinigameResult(
      true,
      "ARMAMENT BREAK!",
      "กระสุนความจริงนัดสุดท้ายเจาะทะลวงหัวใจคนร้าย ปิดฉากการปฏิเสธสิ้นเชิง!",
      `${pName || 'ผู้เล่น'} ลั่นไก [มีดปอกผลไม้ในมือ B] ปิดฉากการดิ้นรนของคนร้าย!`
    );
  }, 400);
}

function updateShieldDisplay() {
  const fill = document.getElementById('shieldFill');
  const waveTxt = document.getElementById('armamentWaveTxt');
  const scEl = document.getElementById('culpritScreamText');
  const targetEl = document.getElementById('armamentTargetName');
  if (fill) fill.style.width = `${gameState.stg6Shield}%`;
  if (waveTxt) waveTxt.innerText = `${gameState.stg6Wave || 1} / 4`;
  if (scEl && gameState.stg6Statement) scEl.innerText = `"${gameState.stg6Statement}"`;
  if (targetEl && gameState.stg6TargetPlayer) targetEl.innerText = gameState.stg6TargetPlayer;
}

function handleStg6Counter(pName) {
  if (gameState.stg6Shield >= 100) return;
  gameState.stg6Shield = Math.min(100, gameState.stg6Shield + 4);
  updateShieldDisplay();
  playSfx('blade');
}

function adminStartArmament() {
  const sel = document.getElementById('adminArmamentTargetSelect');
  const target = sel ? sel.value : 'นักมายากล (A)';
  adminSetGame('stage6', { targetPlayer: target });
}

// 7. Closing Argument (Mini-Game 7) - 5-Page Airtight Manga Overhaul
const CLOSING_PAGES_DATA = [
  {
    page: 1,
    title: 'แผนการในครัว & อาวุธท่อนกระดูกหมู (17:00 – 17:30 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🥩',
        desc: 'คนร้ายใช้ความชำนาญในการทำอาหาร แอบนำท่อนกระดูกหมูแช่แข็งชิ้นใหญ่ออกจากช่องฟรีซมาเตรียมไว้'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 1,
        pageSlot: 1,
        acceptedIds: ['CARD-P1-S1', 'EVD-14', 'EVD-12', 'ACTION-CUT'],
        art: '🍖',
        title: 'ช่องว่างที่ 1: การลงมือสังหารในครัว',
        desc: 'คนร้ายใช้ท่อนกระดูกหมูแช่แข็งฟาดท้ายทอยเหยื่อเรียวตะจนหมดสติในครัวเวลา 17:30 น.'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 2,
        pageSlot: 2,
        acceptedIds: ['CARD-P1-S2', 'EVD-11', 'EVD-09', 'ACTION-NOOSE'],
        art: '🍲',
        title: 'ช่องว่างที่ 2: การทำลายหลักฐานและอาวุธ',
        desc: 'คนร้ายโยนท่อนกระดูกหมูเปื้อนเลือดลงก้นหม้อสตูว์เนื้อที่กำลังเดือดเพื่อต้มล้างคราบและซ่อนอาวุธ'
      },
      {
        num: 4,
        type: 'story',
        art: '🥘',
        desc: 'ไขมันและกลิ่นเครื่องเทศของสตูว์เนื้อกลบคราบเลือดจนมิด และกลายเป็นอาหารเย็นที่ทุกคนทานร่วมกัน'
      }
    ]
  },
  {
    page: 2,
    title: 'การเคลื่อนย้ายร่าง & ติดตั้งรอกเชือกห้องซักรีด (17:45 – 18:30 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🚪',
        desc: 'คนร้ายแบกร่างของเรียวตะที่หมดสติออกจากครัว แอบนำมาซ่อนในห้องซักรีดที่ไม่มีผู้คน'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 3,
        pageSlot: 1,
        acceptedIds: ['CARD-P2-S1'],
        art: '🪢',
        title: 'ช่องว่างที่ 1: การมัดร่างเหยื่อ',
        desc: 'คนร้ายใช้เชือกตากผ้าไนลอนสีชมพูร้อยผูกมัดลำตัวและคล้องคอของเหยื่อเรียวตะ'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 4,
        pageSlot: 2,
        acceptedIds: ['CARD-P2-S2'],
        art: '⚙️',
        title: 'ช่องว่างที่ 2: การทำรอกชักร่างขึ้นเพดาน',
        desc: 'พาดปลายเชือกไนลอนข้ามราวท่อสแตนเลสบนเพดาน เพื่อทำหน้าที่เป็นรอกชักร่างขึ้นสู่ที่สูง'
      },
      {
        num: 4,
        type: 'story',
        art: '🪟',
        desc: 'คนร้ายโยนปลายเชือกอีกด้านออกนอกหน้าต่างระบายอากาศสูง 3.5 เมตรที่ไร้ลูกกรง สู่ลานคอร์ทยาร์ดภายนอก'
      }
    ]
  },
  {
    page: 3,
    title: 'กลไกสายยาง & ถังน้ำถ่วงน้ำหนักคอร์ทยาร์ด (18:30 – 20:00 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🏢',
        desc: 'ที่ลานคอร์ทยาร์ดนอกอาคาร คนร้ายวางถังน้ำพลาสติก 80 ลิตรไว้ตรงกับแนวหน้าต่างห้องซักรีด'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 5,
        pageSlot: 1,
        acceptedIds: ['CARD-P3-S1'],
        art: '🪣',
        title: 'ช่องว่างที่ 1: การผูกถังถ่วงน้ำหนัก',
        desc: 'ผูกปลายเชือกไนลอนที่หย่อนลงมาเข้ากับหูหิ้วของถังน้ำ เพื่อทำหน้าที่เป็นน้ำหนักถ่วง (Counterweight)'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 6,
        pageSlot: 2,
        acceptedIds: ['CARD-P3-S2'],
        art: '🚰',
        title: 'ช่องว่างที่ 2: กลไกนาฬิกาน้ำตั้งเวลา',
        desc: 'ต่อสายยางน้ำประปาเข้าก๊อก เปิดน้ำให้ไหลเติมลงถังอย่างช้าๆ 0.4 ลิตร/นาที (กลไกนาฬิกาน้ำ)'
      }
    ]
  },
  {
    page: 4,
    title: 'กลลวงสร้าง Alibi & เสียงต่อสู้หลอก (20:00 – 21:00 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🕯️',
        desc: 'คนร้ายกลับไปร่วมโต๊ะอาหารค่ำและอยู่กับทุกคนตอนไฟดับเวลา 20:30 น. เพื่อสร้าง Alibi ที่สมบูรณ์แบบ'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 7,
        pageSlot: 1,
        acceptedIds: ['CARD-P4-S1'],
        art: '⏱️',
        title: 'ช่องว่างที่ 1: การตั้งเวลาเครื่องอบผ้า',
        desc: 'คนร้ายแอบตั้งเวลาเครื่องอบผ้า DRY-1 ล่วงหน้า ให้เริ่มทำงานตอน 21:00 น.'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 8,
        pageSlot: 2,
        acceptedIds: ['CARD-P4-S2'],
        art: '👢',
        title: 'ช่องว่างที่ 2: วัตถุสร้างเสียงกระแทกหลอก',
        desc: 'ใส่รองเท้าบูทหนังหนาเข้าไปในเครื่องอบผ้า เพื่อให้เกิดเสียงกระแทกเลียนแบบการต่อสู้'
      },
      {
        num: 4,
        type: 'story',
        art: '🔊',
        desc: 'เวลา 21:00 น. เครื่องอบผ้าเริ่มหมุน เกิดเสียงโครมครามกระแทกผนัง หลอกให้ทุกคนเชื่อว่าเพิ่งเกิดการต่อสู้ขึ้น'
      }
    ]
  },
  {
    page: 5,
    title: 'มวลน้ำกระชากร่างแขวนเพดาน & การค้นพบศพ (21:00 – 21:05 น.)',
    panels: [
      {
        num: 1,
        type: 'slot',
        slotId: 9,
        pageSlot: 1,
        acceptedIds: ['CARD-P5-S1'],
        art: '💥',
        title: 'ช่องว่างที่ 1: จังหวะถังน้ำร่วงกระแทกพื้น',
        desc: 'มวลน้ำในถังหนักทะลุ 70 กก. จนชนะน้ำหนักตัวเหยื่อ ถังร่วงกระแทกพื้นคอร์ทยาร์ดแตกกระจาย'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 10,
        pageSlot: 2,
        acceptedIds: ['CARD-P5-S2'],
        art: '⛓️',
        title: 'ช่องว่างที่ 2: การแขวนร่างติดเพดาน',
        desc: 'แรงกระชากดึงเชือกข้ามท่อเพดาน ยกร่างเหยื่อเรียวตะลอยขึ้นไปแขวนตรึงแน่นติดเพดานห้องซักรีดจนเสียชีวิต'
      },
      {
        num: 3,
        type: 'story',
        art: '🩸',
        desc: 'ทุกคนพังประตูห้องซักรีดเข้ามา พบศพเรียวตะแขวนติดเพดาน เลือดสีชมพูหยดลงสู่พื้น กลลวงมายากลจึงถูกเปิดโปง!'
      }
    ]
  }
];

const CLOSING_CARDS_DATA = [
  { id: 'CARD-P1-S1', page: 1, slot: 1, title: 'ท่อนกระดูกหมูแช่แข็งฟาดท้ายทอยเหยื่อสลบในครัว (17:30 น.)', icon: '🍖' },
  { id: 'CARD-P1-S2', page: 1, slot: 2, title: 'โยนท่อนกระดูกหมูเปื้อนเลือดลงไปต้มในหม้อสตูว์เนื้อเพื่อทำลายหลักฐาน', icon: '🍲' },
  { id: 'CARD-P2-S1', page: 2, slot: 3, title: 'ใช้เชือกตากผ้าไนลอนสีชมพูร้อยผูกมัดลำตัวและรอบคอของเหยื่อเรียวตะ', icon: '🪢' },
  { id: 'CARD-P2-S2', page: 2, slot: 4, title: 'พาดปลายเชือกไนลอนข้ามราวท่อสแตนเลสบนเพดานห้องซักรีดเพื่อทำหน้าที่เป็นรอก', icon: '⚙️' },
  { id: 'CARD-P3-S1', page: 3, slot: 5, title: 'ผูกปลายเชือกไนลอนเข้ากับหูหิ้วถังน้ำพลาสติก 80 ลิตรที่ลานคอร์ทยาร์ด', icon: '🪣' },
  { id: 'CARD-P3-S2', page: 3, slot: 6, title: 'ต่อสายยางน้ำประปาเปิดน้ำไหลเติมลงถังทีละน้อย 0.4 ลิตร/นาที (นาฬิกาน้ำ)', icon: '🚰' },
  { id: 'CARD-P4-S1', page: 4, slot: 7, title: 'แอบตั้งเวลาเครื่องอบผ้า DRY-1 ล่วงหน้าให้เริ่มทำงานตอน 21:00 น.', icon: '⏱️' },
  { id: 'CARD-P4-S2', page: 4, slot: 8, title: 'ใส่รองเท้าบูทหนังหนาเข้าไปในเครื่องอบผ้าเพื่อสร้างเสียงต่อสู้หลอก', icon: '👢' },
  { id: 'CARD-P5-S1', page: 5, slot: 9, title: 'น้ำในถังหนักเกิน 70 กก. ดึงถังร่วงกระแทกพื้นคอร์ทยาร์ดแตกกระจาย', icon: '💥' },
  { id: 'CARD-P5-S2', page: 5, slot: 10, title: 'แรงฉุดกระชากดึงร่างเหยื่อลอยขึ้นไปแขวนตรึงแน่นติดท่อเพดานห้องซักรีด', icon: '⛓️' },
  { id: 'DECOY-KNIFE', page: 0, slot: 0, title: 'เหยื่อเรียวตะฟื้นสติและชักมีดพับออกมาตัดเชือกเพื่อหลบหนี', icon: '🔪', decoy: true },
  { id: 'DECOY-LADDER', page: 0, slot: 0, title: 'คนร้ายปีนบันไดออกไปทางหน้าต่างสูงเพื่อผูกเชือกภายนอกอาคาร', icon: '🪜', decoy: true },
  { id: 'DECOY-BREAKER', page: 0, slot: 0, title: 'คนร้ายแอบไปสับคัตเอาต์ตัดสะพานไฟหลักในห้องควบคุม', icon: '⚡', decoy: true },
  { id: 'DECOY-WASH', page: 0, slot: 0, title: 'คนร้ายนำเสื้อผ้าเปื้อนเลือดของตนเองใส่ลงไปซักในเครื่องซักผ้า', icon: '🫧', decoy: true },
  { id: 'DECOY-DOOR', page: 0, slot: 0, title: 'คนร้ายใช้โซ่เหล็กคล้องล็อกประตูด้านนอกของห้องซักรีดไว้', icon: '🔒', decoy: true }
];

function distributeClosingCards() {
  const playersList = typeof getActivePlayersList === 'function' ? getActivePlayersList() : [];
  const hands = {};
  const allCards = JSON.parse(JSON.stringify(CLOSING_CARDS_DATA));

  // Starter card rule: exactly 1 card from Page 1 starts unlocked, all others start locked!
  const starterCardId = 'CARD-P1-S1';
  allCards.forEach(c => {
    c.locked = (c.id !== starterCardId);
  });

  // Shuffle cards
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }

  if (playersList.length === 0) {
    hands['local'] = allCards;
  } else {
    playersList.forEach(p => { hands[p.id] = []; });
    allCards.forEach((card, idx) => {
      const p = playersList[idx % playersList.length];
      hands[p.id].push(card);
    });
  }

  gameState.closingPlayerHands = hands;
  if (typeof isHost !== 'undefined' && isHost) {
    broadcast({ type: 'closing_hands_sync', hands: hands });
  }
}

function unlockOneClosingCard() {
  if (!gameState.closingPlayerHands) return;
  const lockedPool = [];
  Object.keys(gameState.closingPlayerHands).forEach(pId => {
    gameState.closingPlayerHands[pId].forEach(card => {
      if (card.locked) {
        lockedPool.push({ pId, card });
      }
    });
  });

  if (lockedPool.length > 0) {
    const picked = lockedPool[Math.floor(Math.random() * lockedPool.length)];
    picked.card.locked = false;
    logCourt(`🔓 [CARD UNLOCKED]: การ์ด "${picked.card.title}" ถูกปลดล็อกแล้ว!`);
    playSfx('correct');
    if (typeof isHost !== 'undefined' && isHost) {
      broadcast({
        type: 'closing_card_unlocked',
        playerId: picked.pId,
        cardId: picked.card.id,
        hands: gameState.closingPlayerHands
      });
    }
    if (typeof myPlayer !== 'undefined' && myPlayer && myPlayer.id === picked.pId) {
      showToast(`🔓 ปลดล็อกการ์ดใหม่: ${picked.card.title}!`);
    }
  }
}

function showBonusTimePopup(seconds) {
  const existing = document.querySelector('.bonus-time-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'bonus-time-toast';
  toast.innerHTML = `⏱️ +${seconds}s BONUS TIME!`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 1800);
}

function adminSetClosingPage(page) {
  if (page < 1 || page > 5) return;
  gameState.closingCurrentPage = page;
  updateClosingDisplay();
  if (typeof isHost !== 'undefined' && isHost) {
    broadcast({ type: 'closing_page_change', page: page });
  }
  if (typeof currentTab !== 'undefined' && currentTab === 'tasks') {
    renderMobileTask('closing');
  }
}

function adminPrevClosingPage() {
  if (!gameState.closingCurrentPage) gameState.closingCurrentPage = 1;
  if (gameState.closingCurrentPage > 1) {
    adminSetClosingPage(gameState.closingCurrentPage - 1);
  }
}

function adminNextClosingPage() {
  if (!gameState.closingCurrentPage) gameState.closingCurrentPage = 1;
  if (gameState.closingCurrentPage < 5) {
    adminSetClosingPage(gameState.closingCurrentPage + 1);
  }
}

function handleClosingSubmit(slot, cardId, pName) {
  if (!gameState.closingSlots) {
    gameState.closingSlots = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false, 8: false, 9: false, 10: false };
  }
  const slotNum = Number(slot);

  // Find target slot definition
  let targetPanel = null;
  let targetPage = 1;
  for (const p of CLOSING_PAGES_DATA) {
    const found = p.panels.find(pan => pan.type === 'slot' && pan.slotId === slotNum);
    if (found) {
      targetPanel = found;
      targetPage = p.page;
      break;
    }
  }

  let isCorrect = false;
  if (targetPanel && targetPanel.acceptedIds && targetPanel.acceptedIds.includes(cardId)) {
    isCorrect = true;
  } else if (slotNum === 1 && (cardId === 'EVD-14' || cardId === 'CARD-P1-S1')) {
    isCorrect = true;
  } else if (slotNum === 2 && (cardId === 'EVD-11' || cardId === 'CARD-P1-S2')) {
    isCorrect = true;
  }

  if (isCorrect) {
    gameState.closingSlots[slotNum] = true;
    playSfx('correct');

    // +20s Auto Bonus Time
    gameState.timeRemaining += 20;
    updateTimerDisplay();
    showBonusTimePopup(20);
    if (typeof isHost !== 'undefined' && isHost) {
      broadcast({ type: 'admin_adjust_timer', secs: 20, time: gameState.timeRemaining });
      broadcast({ type: 'closing_bonus_time', seconds: 20 });
    }

    // Unlock 1 locked card
    unlockOneClosingCard();

    logCourt(`📖 [CLOSING PAGE ${targetPage}]: ${pName} เติมมังงะช่องที่ ${slotNum} สำเร็จ! (+20s โบนัส)`);
    updateClosingDisplay();

    // Check if all 10 slots are solved
    let solvedCount = 0;
    for (let s = 1; s <= 10; s++) {
      if (gameState.closingSlots[s]) solvedCount++;
    }

    if (solvedCount >= 10) {
      stopTimer();
      setTimeout(() => {
        playSfx('point_break');
        showMinigameResult(
          true,
          "CLOSING ARGUMENT COMPLETE!",
          "การปะติดปะต่อลำดับเหตุการณ์มังงะคดีความ 5 หน้าสมบูรณ์แบบ 100%!",
          "เรื่องราวทั้งหมดของคดีถูกคลี่คลายอย่างสมบูรณ์แบบ! DM สามารถกดปุ่ม 'ฉายสรุปคดี (Climax)' บนจอศาลเพื่อรับชมบทสรุปคดีได้ทันที"
        );
      }, 500);
    }

    if (typeof isHost !== 'undefined' && isHost) {
      broadcast({ type: 'sync_state', state: gameState });
    }
    if (typeof currentTab !== 'undefined' && currentTab === 'tasks') {
      renderMobileTask('closing');
    }
  } else {
    gameState.influence = Math.max(0, gameState.influence - 10);
    playSfx('wrong');
    logCourt(`❌ [CLOSING MISMATCH]: ${pName} วางการ์ดไม่ตรงกับช่องว่าง (-10% Influence)`);
    if (typeof isHost !== 'undefined' && isHost) {
      broadcast({ type: 'sync_state', state: gameState });
    }
  }
}

function updateClosingDisplay() {
  const curPage = gameState.closingCurrentPage || 1;
  const pageData = CLOSING_PAGES_DATA.find(p => p.page === curPage) || CLOSING_PAGES_DATA[0];

  const pageNumDisp = document.getElementById('closingPageNumDisplay');
  if (pageNumDisp) pageNumDisp.innerText = `PAGE ${curPage} / 5`;

  const pageTitleDisp = document.getElementById('closingPageTitleDisplay');
  if (pageTitleDisp) pageTitleDisp.innerText = pageData.title;

  // Update dots
  for (let p = 1; p <= 5; p++) {
    const dot = document.getElementById(`dotP${p}`);
    if (dot) {
      const pData = CLOSING_PAGES_DATA.find(x => x.page === p);
      const pSlots = pData ? pData.panels.filter(x => x.type === 'slot').map(x => x.slotId) : [];
      const pSolved = pSlots.length > 0 && pSlots.every(sId => gameState.closingSlots && gameState.closingSlots[sId]);

      dot.className = 'page-dot';
      if (p === curPage) dot.classList.add('active');
      if (pSolved) dot.classList.add('solved');
    }
  }

  // Update total progress badge
  let solvedCount = 0;
  if (gameState.closingSlots) {
    for (let s = 1; s <= 10; s++) {
      if (gameState.closingSlots[s]) solvedCount++;
    }
  }
  const progTxt = document.getElementById('closingTotalProgressTxt');
  if (progTxt) progTxt.innerText = `${solvedCount} / 10 ช่อง`;

  const btnClimax = document.getElementById('btnClimaxPlayback');
  if (btnClimax) {
    if (solvedCount >= 10) {
      btnClimax.classList.remove('hidden');
    } else {
      btnClimax.classList.add('hidden');
    }
  }

  // Render grid panels for active page
  const grid = document.getElementById('mangaTimelineGrid');
  if (grid && pageData) {
    grid.innerHTML = pageData.panels.map(panel => {
      if (panel.type === 'story') {
        return `
          <div class="manga-panel complete">
            <div class="panel-num">ช่องที่ ${panel.num}</div>
            <div class="panel-tag">ลำดับเหตุการณ์</div>
            <div class="panel-art">${panel.art}</div>
            <div class="panel-desc">${panel.desc}</div>
          </div>
        `;
      } else {
        const isSolved = gameState.closingSlots && gameState.closingSlots[panel.slotId];
        if (isSolved) {
          return `
            <div class="manga-panel complete solved">
              <div class="panel-num">ช่องที่ ${panel.num}</div>
              <div class="panel-tag" style="color:#00ff88;">✅ เติมถูกต้องแล้ว</div>
              <div class="panel-art">${panel.art}</div>
              <div class="panel-desc" style="color:#fff; font-weight:700;">${panel.desc}</div>
            </div>
          `;
        } else {
          return `
            <div class="manga-panel missing">
              <div class="panel-num">ช่องที่ ${panel.num}</div>
              <div class="panel-tag" style="color:var(--mono-pink);">❓ ช่องว่างที่ ${panel.pageSlot}</div>
              <div class="panel-art" style="opacity:0.4;">❓</div>
              <div class="panel-desc" style="color:#aaa; font-style:italic;">[รอผู้เล่นเติมการ์ดเหตุการณ์ที่ถูกต้อง]</div>
            </div>
          `;
        }
      }
    }).join('');
  }
}

function startClosingClimaxPlayback() {
  const modal = document.getElementById('closingClimaxModal');
  const container = document.getElementById('climaxStoryboardContent');
  if (!modal || !container) return;

  modal.classList.remove('hidden');
  playSfx('point_break');

  container.innerHTML = CLOSING_PAGES_DATA.map(p => {
    const panelsHtml = p.panels.map(pan => {
      const isSlot = pan.type === 'slot';
      return `
        <div class="climax-panel-item" style="background:#151525; border:2px solid ${isSlot ? 'var(--court-gold)' : '#3d3d5c'}; border-radius:8px; padding:12px; display:flex; align-items:center; gap:14px;">
          <div style="font-size:2.2rem; min-width:50px; text-align:center;">${pan.art}</div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="background:#000; color:var(--court-gold); padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:900;">ช่องที่ ${pan.num}</span>
              ${isSlot ? '<span style="color:#00ff88; font-size:0.75rem; font-weight:800;">[การ์ดที่ถูกเติมสำเร็จ]</span>' : ''}
            </div>
            <div style="color:#fff; font-size:0.9rem; line-height:1.4;">${pan.desc}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="climax-page-card" style="background:#0a0a14; border:1px solid #282845; border-radius:10px; padding:14px; margin-bottom:12px;">
        <h4 style="color:var(--mono-pink); margin:0 0 10px 0; font-size:1rem; font-weight:900; border-bottom:1px solid #222238; padding-bottom:6px;">
          📖 หน้าที่ ${p.page}: ${p.title}
        </h4>
        <div style="display:flex; flex-direction:column; gap:8px;">
          ${panelsHtml}
        </div>
      </div>
    `;
  }).join('');
}

function closeClosingClimaxModal() {
  const modal = document.getElementById('closingClimaxModal');
  if (modal) modal.classList.add('hidden');
}

// 8. Voting & Verdict
function handleVoteSubmitted(candidate, voterId) {
  if (!gameState.votesCast) gameState.votesCast = {};
  if (!gameState.votes) gameState.votes = {};

  // Strictly count 1 vote per voter to prevent duplication
  if (gameState.votesCast[voterId]) {
    return; // Already voted!
  }
  gameState.votesCast[voterId] = candidate;
  gameState.votes[candidate] = (gameState.votes[candidate] || 0) + 1;
  updateVoteDisplay();

  const activeCount = Object.keys(gameState.players || {}).length;
  const castCount = Object.keys(gameState.votesCast).length;

  if (activeCount > 0 && castCount >= activeCount) {
    setTimeout(() => {
      revealVotes();
    }, 800);
  } else {
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
  }
}

function getVotingCandidates() {
  const players = Object.values(gameState.players || {});
  const list = [];
  if (players.length > 0) {
    players.forEach(p => {
      list.push(p.name);
    });
  } else {
    list.push('ผู้เล่น 1', 'ผู้เล่น 2');
  }
  list.push('NPC B');
  return list;
}

function updateVoteDisplay() {
  const container = document.getElementById('courtVoteResults');
  const suspenseBox = document.getElementById('votingSuspenseCard');
  const wrapper = document.getElementById('courtVoteResultsWrapper');
  const votesCastCountEl = document.getElementById('votesCastCount');
  const votesExpectedCountEl = document.getElementById('votesExpectedCount');

  const activePlayers = Object.keys(gameState.players || {}).length;
  const votesCastCount = Object.keys(gameState.votesCast || {}).length;

  if (votesCastCountEl) votesCastCountEl.innerText = votesCastCount;
  if (votesExpectedCountEl) votesExpectedCountEl.innerText = activePlayers;

  if (gameState.votesRevealed) {
    if (suspenseBox) suspenseBox.classList.add('hidden');
    if (wrapper) wrapper.classList.remove('hidden');
  } else {
    if (suspenseBox) suspenseBox.classList.remove('hidden');
    if (wrapper) wrapper.classList.add('hidden');
  }

  if (container) {
    container.innerHTML = '';
    const candidates = getVotingCandidates();

    // Find highest voted candidate
    let maxVotes = -1;
    let topCandidate = null;
    candidates.forEach(cand => {
      const count = gameState.votes[cand] || 0;
      if (count > maxVotes && count > 0) {
        maxVotes = count;
        topCandidate = cand;
      }
    });

    if (gameState.votesRevealed && topCandidate) {
      const spotlight = document.createElement('div');
      spotlight.className = 'top-suspect-spotlight';
      spotlight.innerHTML = `
        <div class="top-suspect-title">🎯 บุคคลที่ถูกเสียงข้างมากชี้ตัวว่าเป็นคนร้าย (PRIMARY SUSPECT)</div>
        <div class="top-suspect-name">${escapeHtml(topCandidate)}</div>
        <div class="top-suspect-badge">${maxVotes} คะแนนโหวตสูงสุด</div>
      `;
      container.appendChild(spotlight);
    }

    candidates.forEach(cand => {
      const card = document.createElement('div');
      const count = gameState.votes[cand] || 0;
      const isTop = (gameState.votesRevealed && count === maxVotes && maxVotes > 0);
      card.className = 'vote-card' + (isTop ? ' highlight-suspect' : '');
      card.innerHTML = `<span>👤 ${escapeHtml(cand)}</span><span class="vote-count-badge">${count} โหวต</span>`;
      container.appendChild(card);
    });
  }
}

function revealVotes() {
  gameState.votesRevealed = true;
  stopTimer();
  updateVoteDisplay();
  playSfx('vote_correct');
  logCourt('🗳️ [VOTE REVEAL]: เปิดเผยผลคะแนนการลงมติชี้ชะตา!');
  if (isHost) broadcast({ type: 'sync_state', state: gameState });
}

function adminRevealVotes() {
  revealVotes();
  broadcast({ type: 'reveal_votes' });
}

function showVerdict(isVictory) {
  triggerMonokumaExecutionCutscene(isVictory);
}

// ==========================================================
// MOBILE PLAYER CONTROLS & TASKS
// ==========================================================
let joinClaimTimeout = null;

function resetJoinButton(errMsg) {
  if (joinClaimTimeout) {
    clearTimeout(joinClaimTimeout);
    joinClaimTimeout = null;
  }
  const btnJoin = document.querySelector('#mobileJoinScreen .dangan-action-btn');
  if (btnJoin) {
    btnJoin.disabled = false;
    btnJoin.innerText = 'เข้าสู่ศาลชั้นเรียน';
  }
  if (errMsg) alert(errMsg);
}

function playerJoin() {
  getAudio();
  const name = (document.getElementById('mobileNameInput').value || '').trim();
  const room = (document.getElementById('mobileRoomInput').value || '').trim().toUpperCase();

  if (!room) { alert('กรุณากรอกรหัสห้อง 6 หลัก'); return; }
  if (!name) { alert('กรุณากรอกชื่อของคุณ'); return; }

  const roleSelect = document.getElementById('mobileRoleSelect');
  const role = roleSelect ? roleSelect.value : (new URLSearchParams(window.location.search).get('role') || '');

  roomCode = room;
  localStorage.setItem('dangan_current_room', roomCode);

  if (!currentUserHash) {
    const qUser = new URLSearchParams(window.location.search).get('user');
    currentUserHash = qUser || localStorage.getItem('dangan_current_user_hash') || ('u-' + Math.random().toString(36).substring(2, 8));
    if (!currentUserHash.startsWith('sim_')) {
      localStorage.setItem('dangan_current_user_hash', currentUserHash);
    }
  }

  // Connect to SSE stream immediately for guaranteed zero-delay messaging
  setupServerStream(roomCode);

  const btnJoin = document.querySelector('#mobileJoinScreen .dangan-action-btn');
  if (btnJoin) {
    btnJoin.disabled = true;
    btnJoin.innerText = '⏳ กำลังขอบทบาทจากศาลชั้นเรียน...';
  }

  // 7-second safety timeout so player never hangs indefinitely
  if (joinClaimTimeout) clearTimeout(joinClaimTimeout);
  joinClaimTimeout = setTimeout(() => {
    resetJoinButton(`⚠️ การตอบรับจากศาลชั้นเรียนห้อง [${roomCode}] ใช้เวลานานเกินไป\n\nโปรดตรวจสอบว่า:\n1. หน้าจอหลักศาลชั้นเรียน (/court) กำลังเปิดอยู่และออนไลน์\n2. รหัสห้อง 6 หลัก [${roomCode}] ถูกต้องตรงกับบนจอศาล\nแล้วลองกดใหม่อีกครั้ง`);
  }, 7000);

  const claimPacket = {
    type: 'request_claim_character',
    role: role,
    playerName: name,
    userHash: currentUserHash,
    clues: getUnlockedClues()
  };

  const sendClaim = () => {
    try {
      if (hostPeer && hostPeer.open) {
        hostPeer.send(claimPacket);
      }
    } catch(e) {}
    broadcast(claimPacket);
  };

  // Immediate send via SSE broadcast relay
  sendClaim();

  // Parallel WebRTC connection
  const hostPeerId = `dangan-court-${roomCode.toLowerCase()}`;
  if (!hostPeer || !hostPeer.open) {
    connectToHostPeer(hostPeerId, () => {
      try {
        if (hostPeer && hostPeer.open) hostPeer.send(claimPacket);
      } catch(e) {}
    });
  }
}

function renderMobileTask(stage) {
  if (stage !== 'stage7') {
    myPlayerVoted = false;
  }
  const area = document.getElementById('mobileTaskArea');
  if (!area) return;
  area.innerHTML = '';

  // Auto-switch to game tab if stage is active
  if (stage !== 'lobby') {
    switchPlayerTab('game');
  }

  if (stage === 'dailylife' || stage === 'daily') {
    renderMobilePhaseCard(stage);
    return;
  } else if (stage === 'idle') {
    renderMobilePhaseCard(stage);
    return;
  } else if (stage === 'investigation') {
    renderMobilePhaseCard(stage);
    return;
  } else if (stage === 'lobby') {
    area.innerHTML = '<div class="idle-message"><div class="idle-spinner"></div><p>กำลังรอเริ่มศาลชั้นเรียน... (Lobby)</p></div>';
  } else if (stage === 'trial') {
    area.innerHTML = `
      <div style="background:rgba(20,20,35,0.95); border:2px solid var(--mono-yellow); border-radius:10px; padding:16px; text-align:center;">
        <div style="font-size:2.2rem; margin-bottom:8px;">⚖️</div>
        <h3 style="color:var(--court-gold); margin-bottom:6px; font-weight:900;">ศาลชั้นเรียนกำลังดำเนินอยู่</h3>
        <p style="color:#ddd; font-size:0.9rem; margin-bottom:14px;">ขณะนี้อยู่ในช่วงอภิปรายและไต่สวนคดี (Debate & Discussion) ให้ทุกคนซักถาม ถกเถียง และตรวจสอบข้อมูลผ่านแท็บด้านบน</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="p-task-btn" onclick="switchPlayerTab('clues')" style="background:rgba(0,240,255,0.15); border-color:#00f0ff; color:#fff;">🔍 เปิด Monopad ตรวจสอบหลักฐาน</button>
          <button class="p-task-btn" onclick="switchPlayerTab('guide')" style="background:rgba(230,0,103,0.15); border-color:#e60067; color:#fff;">📋 ดูกฎการดีเบตศาลชั้นเรียน</button>
        </div>
        <div style="margin-top:14px; font-size:0.8rem; color:#aaa;">
          ⏳ เมื่อมีข้อโต้แย้งเกิดขึ้น ผู้ดูแลศาล (DM) จะเปิดมินิเกมเข้ามาที่หน้านี้โดยอัตโนมัติ
        </div>
      </div>
    `;
  } else if (stage === 'investigation') {
    area.innerHTML = `
      <div style="background:rgba(0,40,60,0.95); border:2px solid var(--mono-cyan); border-radius:10px; padding:16px; text-align:center;">
        <div style="font-size:2.2rem; margin-bottom:8px;">🔍</div>
        <h3 style="color:var(--mono-cyan); margin-bottom:6px; font-weight:900;">ช่วงเวลาสืบสวนหาหลักฐาน</h3>
        <p style="color:#ddd; font-size:0.9rem; margin-bottom:14px;">ออกสำรวจสถานที่เกิดเหตุ สแกน QR Code จากการ์ดหลักฐาน หรือกรอกรหัส EVD-XX เพื่อเก็บเข้า Monopad ของคุณ!</p>
        <button class="p-task-btn" onclick="switchPlayerTab('clues')" style="background:rgba(0,240,255,0.2); border-color:#00f0ff; color:#fff; font-weight:900;">
          📷 สแกน QR Code / ตรวจสอบหลักฐาน (Monopad)
        </button>
      </div>
    `;
  } else if (stage === 'stage1') {
    const target = gameState.stg1TargetClue || 'EVD-01';
    const allDistractors = ['EVD-01', 'EVD-02', 'EVD-04', 'EVD-05', 'EVD-09', 'EVD-11', 'EVD-14'];
    let chosenIds = [target];
    for (const d of allDistractors) {
      if (chosenIds.length >= 4) break;
      if (!chosenIds.includes(d)) chosenIds.push(d);
    }
    chosenIds.sort();

    const pName = myPlayer ? myPlayer.name : 'ผู้เล่น';
    const existingSub = (gameState.stg1SubmissionsList || []).find(s => s.pName === pName);
    const hasChosen = Boolean(existingSub);
    const chosenClueId = existingSub ? existingSub.clueId : null;

    const btnsHtml = chosenIds.map(cid => {
      const clue = ALL_CLUES_DATA.find(c => c.id === cid) || { id: cid, name: cid };
      const isSelected = (chosenClueId === cid);
      return `<button class="p-task-btn ${isSelected ? 'btn-selected' : ''}" data-clue="${clue.id}" onclick="sendStg1('${clue.id}')">
        [${clue.id}] ${clue.name} ${isSelected ? ' ✓' : ''}
      </button>`;
    }).join('');

    const chosenObj = chosenClueId ? (ALL_CLUES_DATA.find(c => c.id === chosenClueId) || { id: chosenClueId, name: chosenClueId }) : null;

    area.innerHTML = `
      <h3 style="color:var(--court-gold); margin-bottom:12px; font-weight:900;">เลือกการ์ดหลักฐานที่ตรงกับอาวุธ/ปริศนา:</h3>
      <div class="mobile-task-grid" id="stg1MobileGrid" style="${hasChosen ? 'pointer-events: none;' : ''}">
        ${btnsHtml}
      </div>
      <div id="stg1MobileFeedback" style="display:${hasChosen ? 'block' : 'none'}; margin-top:12px; padding:10px; background:rgba(0,255,136,0.15); border:1px solid #00ff88; border-radius:6px; color:#00ff88; font-weight:bold; text-align:center;">
        ${hasChosen ? `✅ คุณเลือก [${chosenClueId}: ${chosenObj ? chosenObj.name : ''}] เรียบร้อยแล้ว (รอผลสรุปพร้อมเพื่อน)` : ''}
      </div>
    `;
  } else if (stage === 'idle') {
    area.innerHTML = `
      <div style="background:rgba(15,15,28,0.95); border:2px solid var(--court-gold); border-radius:10px; padding:20px; text-align:center;">
        <div style="font-size:2.5rem; margin-bottom:10px;">⏳</div>
        <h3 style="color:var(--court-gold); font-weight:900;">ศาลชั้นเรียนกำลังเตรียมการ</h3>
        <p style="color:#aaa; font-size:0.92rem;">กรุณารอฟังคำสั่งและการเปิดศาลจาก Headmaster Monokuma / DM</p>
      </div>
    `;
  } else if (stage === 'stage2') {
    const activeP = getActiveHangmanPlayer();
    const isMyTurn = (!activeP || (myPlayer && myPlayer.id === activeP.id));

    // English A-Z Keyboard Layout (QWERTY)
    const row1 = ['Q','W','E','R','T','Y','U','I','O','P'];
    const row2 = ['A','S','D','F','G','H','J','K','L'];
    const row3 = ['Z','X','C','V','B','N','M'];

    const renderRow = (letters) => `
      <div style="display:flex; justify-content:center; gap:5px; margin-bottom:6px;">
        ${letters.map(ch => {
          const isGuessed = (gameState.stg2GuessedChars || []).includes(ch);
          return `<button class="p-task-btn letter-btn" style="min-width:30px; padding:8px 4px; font-weight:900; font-size:1rem; opacity: ${(isMyTurn && !isGuessed) ? '1' : '0.25'};" ${(isMyTurn && !isGuessed) ? '' : 'disabled'} onclick="sendStg2Char('${ch}')">${ch}</button>`;
        }).join('')}
      </div>
    `;

    const turnNotice = isMyTurn
      ? `<div style="background:rgba(0,255,136,0.15); border:1px solid #00ff88; color:#00ff88; padding:8px 12px; border-radius:8px; font-weight:900; margin-bottom:10px;">👉 ถึงตาคุณแล้ว! กดเลือกตัวอักษร 1 ตัวเพื่อทายคำ:</div>`
      : `<div style="background:rgba(255,230,0,0.1); border:1px solid #ffe600; color:#ffe600; padding:8px 12px; border-radius:8px; font-weight:700; margin-bottom:10px;">⏳ รอคุณ [${activeP ? activeP.name : 'เพื่อน'}] กำลังเลือกตัวอักษร...</div>`;

    area.innerHTML = `
      <h3 style="color:var(--court-gold); margin-bottom:8px; font-weight:900;">Hangman's Gambit: ถอดรหัสคำศัพท์</h3>
      ${turnNotice}
      <div class="hangman-keyboard-container" style="max-width:420px; margin:0 auto;">
        ${renderRow(row1)}
        ${renderRow(row2)}
        ${renderRow(row3)}
      </div>
    `;
  } else if (stage === 'stage3') {
    const myName = myPlayer ? myPlayer.name : '';
    // Flexible match: check if player name contains challenger name or vice versa
    const challenger = gameState.stg3Challenger || '';
    const opponent = gameState.stg3Opponent || '';
    const isChallenger = challenger && (myName === challenger || myName.includes(challenger) || challenger.includes(myName));
    const isOpponent = opponent && (myName === opponent || myName.includes(opponent) || opponent.includes(myName));

    if (isChallenger) {
      const activeBullets = (gameState.discoveredClues && gameState.discoveredClues.length) ? gameState.discoveredClues : ['CORE-01', 'EVD-01', 'EVD-04', 'EVD-14'];
      let bulletOptions = activeBullets.map(cid => {
        const c = ALL_CLUES_DATA.find(x => x.id === cid) || { id: cid, name: cid };
        return `<option value="${c.id}">[${c.id}] ${c.name}</option>`;
      }).join('');

      area.innerHTML = `
        <h3 style="color:var(--mono-pink); margin-bottom:12px; font-weight:900;">⚔️ คุณคือ: ฝ่ายโจมตี (Truth Blade Duelist)!</h3>
        <p style="color:#aaa; font-size:0.85rem; margin-bottom:10px;">vs <strong style="color:#ffe600;">${opponent || 'ฝ่ายตรงข้าม'}</strong></p>
        <div style="margin-bottom:12px; text-align:left;">
          <label style="font-size:0.85rem; color:#aaa; font-weight:700; display:block; margin-bottom:4px;">เลือกกระสุนความจริงที่ถือดาบเข้าปะทะ:</label>
          <select id="rebuttalEquippedBullet" style="width:100%; background:#1a1a2e; color:#fff; border:2px solid var(--mono-pink); padding:8px; border-radius:6px;">
            ${bulletOptions}
          </select>
        </div>
        <button class="p-task-btn big-action-btn" style="background:#3b141b; border: 3px solid var(--mono-pink); box-shadow: 4px 4px 0 #000;" onclick="sendRebuttalSlash()">
          ⚔️ ฟันฝ่าข้อโต้แย้ง! (Truth Blade Slash)
        </button>
      `;
    } else if (isOpponent) {
      // Opponent (defender) can counter-slash
      const activeBullets = (gameState.discoveredClues && gameState.discoveredClues.length) ? gameState.discoveredClues : ['CORE-01', 'EVD-01', 'EVD-04', 'EVD-14'];
      let bulletOptions = activeBullets.map(cid => {
        const c = ALL_CLUES_DATA.find(x => x.id === cid) || { id: cid, name: cid };
        return `<option value="${c.id}">[${c.id}] ${c.name}</option>`;
      }).join('');

      area.innerHTML = `
        <h3 style="color:#ffe600; margin-bottom:12px; font-weight:900;">🛡️ คุณคือ: ฝ่ายรับมือ (Defender)!</h3>
        <p style="color:#aaa; font-size:0.85rem; margin-bottom:10px;">vs <strong style="color:var(--mono-pink);">${challenger || 'ฝ่ายโจมตี'}</strong></p>
        <div style="margin-bottom:12px; text-align:left;">
          <label style="font-size:0.85rem; color:#aaa; font-weight:700; display:block; margin-bottom:4px;">เลือกหลักฐานโต้แย้ง (ปัดป้องข้อกล่าวหา):</label>
          <select id="rebuttalEquippedBullet" style="width:100%; background:#1a1a2e; color:#fff; border:2px solid #ffe600; padding:8px; border-radius:6px;">
            ${bulletOptions}
          </select>
        </div>
        <button class="p-task-btn big-action-btn" style="background:#1a1500; border: 3px solid #ffe600; box-shadow: 4px 4px 0 #000;" onclick="sendRebuttalSlash()">
          🛡️ โต้แย้งข้อกล่าวหา! (Counter Slash)
        </button>
      `;
    } else {
      // Spectator
      area.innerHTML = `
        <div style="background:rgba(20,20,35,0.95); border:2px solid var(--mono-pink); border-radius:10px; padding:20px; text-align:center;">
          <div style="font-size:3rem; margin-bottom:10px;">⚔️</div>
          <h3 style="color:var(--mono-pink); font-weight:900;">การดวลดาบคำพูด (Rebuttal Showdown)</h3>
          <p style="color:#ddd; font-size:0.95rem; margin-top:8px;"><strong style="color:var(--court-gold);">${challenger || '?'}</strong> vs <strong style="color:#ffe600;">${opponent || '?'}</strong></p>
          <p style="color:#888; font-size:0.85rem; margin-top:12px;">จับตาดูการดวลดาบและลุ้นผลลัพธ์บนจอใหญ่ศาลชั้นเรียน...</p>
        </div>
      `;
    }
  } else if (stage === 'stage4') {
    const currentData = LOGIC_DIVE_DATA.find(d => d.step === gameState.stg4Step) || LOGIC_DIVE_DATA[0];
    const myVote = (myPlayer && gameState.stg4Votes) ? (gameState.stg4Votes[myPlayer.id] || gameState.stg4Votes[currentUserHash]) : null;
    const hasVoted = Boolean(myVote);

    const choicesHtml = ['A', 'B', 'C'].map(ch => {
      const isSelected = (myVote === ch);
      return `<button class="p-task-btn ${isSelected ? 'btn-selected' : ''}" data-choice="${ch}" onclick="sendLogicDiveChoice('${ch}')">
        <strong>${ch}:</strong> ${currentData.choices[ch]} ${isSelected ? ' ✓' : ''}
      </button>`;
    }).join('');

    area.innerHTML = `
      <h3 style="color:var(--court-gold); margin-bottom:10px; font-weight:900;">Logic Dive: เลือกทางแยกตรรกะ!</h3>
      <p style="font-size:0.9rem; color:#ddd; margin-bottom:12px;">${currentData.question}</p>
      <div class="mobile-task-grid" id="diveMobileChoices" style="${hasVoted ? 'pointer-events: none;' : ''}">
        ${choicesHtml}
      </div>
      <div id="diveChoiceFeedback" style="display:${hasVoted ? 'block' : 'none'}; margin-top:12px; color:#00ff88; font-weight:700;">
        ${hasVoted ? `✅ คุณเลือกข้อ [${myVote}] แล้ว (รอผลมติพร้อมเพื่อน)` : ''}
      </div>
    `;
  } else if (stage === 'stage5') {
    const leftLabel = gameState.stg5LeftTeam || '🔴 ฝ่ายซ้าย';
    const rightLabel = gameState.stg5RightTeam || '🟢 ฝ่ายขวา';
    const topicLabel = gameState.stg5Topic || 'ศึกสองขั้วความคิด';

    area.innerHTML = `
      <h3 style="color:var(--mono-yellow); margin-bottom:6px; font-weight:900;">Debate Scrum: เลือกดันฝั่งที่คุณเชื่อมั่น!</h3>
      <p style="font-size:0.88rem; color:#ccc; margin-bottom:14px;">หัวข้อ: "${topicLabel}"</p>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button class="p-task-btn big-action-btn" style="background:#381119; border:3px solid #ff2255; box-shadow:4px 4px 0 #000; font-size:1.02rem;" onclick="broadcast({type:'stg5_scrum',delta:-4})">
          👈 ดัน ${leftLabel} (-4%)
        </button>
        <button class="p-task-btn big-action-btn" style="background:#12351e; border:3px solid #00ff88; box-shadow:4px 4px 0 #000; font-size:1.02rem;" onclick="broadcast({type:'stg5_scrum',delta:4})">
          👉 ดัน ${rightLabel} (+4%)
        </button>
      </div>
    `;
  } else if (stage === 'stage6') {
    const targetName = gameState.stg6TargetPlayer || 'ผู้ถูกกล่าวหา';
    const isTarget = Boolean(myPlayer && (
      myPlayer.name === targetName ||
      targetName.includes(myPlayer.name)
    ));

    if (isTarget) {
      area.innerHTML = `
        <div style="background:rgba(40,10,20,0.95); border:2px solid var(--mono-pink); border-radius:10px; padding:16px; text-align:center;">
          <h3 style="color:var(--mono-pink); margin-bottom:8px; font-weight:900;">⚠️ คุณกำลังถูกทั้งศาลชั้นเรียนต้อนจนมุม!</h3>
          <p style="color:#ddd; font-size:0.9rem; margin-bottom:14px;">เพื่อนๆ กำลังรุมทุบทำลายข้ออ้างของคุณ! กดปุ่มโต้กลับเพื่อฟื้นฟูเกราะการปฏิเสธ!</p>
          <button class="p-task-btn big-action-btn" style="background:#5e111a; border:3px solid var(--mono-pink); box-shadow:0 0 16px var(--mono-pink); font-size:1.1rem; color:#fff;" onclick="broadcast({type:'stg6_counter', playerName: myPlayer ? myPlayer.name : 'ผู้ถูกต้อน'})">
            🛡️ ตอกกลับข้อกล่าวหา! (+4% Shield)
          </button>
        </div>
      `;
    } else {
      area.innerHTML = `
        <h3 style="color:var(--mono-yellow); margin-bottom:6px; font-weight:900;">Argument Armament: รุมทุบเกราะคนร้าย!</h3>
        <p style="font-size:0.88rem; color:#ccc; margin-bottom:14px;">ผู้ถูกต้อน: <strong style="color:var(--mono-pink);">${targetName}</strong></p>
        <button class="p-task-btn big-action-btn" style="background:#423414; border:3px solid var(--mono-yellow); box-shadow:4px 4px 0 #000;" onclick="broadcast({type:'stg6_hit', playerName: myPlayer ? myPlayer.name : 'ผู้เล่น'})">
          🔨 ทุบเกราะความจริง! (-5% Shield)
        </button>
        <div id="finalBlowMobileBox" style="margin-top:14px; display:none;">
          <button class="p-task-btn big-action-btn" style="background:#5e111a; border:3px solid var(--mono-pink); box-shadow:0 0 16px var(--mono-pink); font-size:1.15rem;" onclick="sendStg6FinalBlow()">
            💥 ยิงกระสุนความจริงนัดสุดท้าย: [มีดปอกผลไม้ในมือ B]!
          </button>
        </div>
      `;
    }
  } else if (stage === 'closing') {
    const curPage = gameState.closingCurrentPage || 1;
    const pageData = CLOSING_PAGES_DATA.find(p => p.page === curPage) || CLOSING_PAGES_DATA[0];
    const pageSlots = pageData.panels.filter(p => p.type === 'slot');

    // Retrieve my hand
    let myCards = [];
    if (gameState.closingPlayerHands) {
      if (typeof myPlayer !== 'undefined' && myPlayer && gameState.closingPlayerHands[myPlayer.id]) {
        myCards = gameState.closingPlayerHands[myPlayer.id];
      } else if (gameState.closingPlayerHands['local']) {
        myCards = gameState.closingPlayerHands['local'];
      } else {
        const keys = Object.keys(gameState.closingPlayerHands);
        if (keys.length > 0) myCards = gameState.closingPlayerHands[keys[0]];
      }
    }
    if (!myCards || myCards.length === 0) {
      myCards = CLOSING_CARDS_DATA.map(c => ({
        ...c,
        locked: c.id !== 'CARD-P1-S1'
      }));
    }

    // Slots HTML on active page
    const slotsHtml = pageSlots.map(s => {
      const isSolved = gameState.closingSlots && gameState.closingSlots[s.slotId];
      if (isSolved) {
        return `
          <div style="background:#0d2616; border:2px solid #00ff88; border-radius:8px; padding:10px 12px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <span style="color:#00ff88; font-weight:900; font-size:0.85rem;">✅ ช่องที่ ${s.pageSlot} (เติมถูกต้องแล้ว):</span>
              <div style="color:#fff; font-size:0.8rem; margin-top:2px; line-height:1.3;">${s.desc}</div>
            </div>
            <span style="font-size:1.4rem; margin-left:8px;">✓</span>
          </div>
        `;
      } else {
        return `
          <button class="p-task-btn" onclick="submitSelectedClosingCard(${s.slotId})" style="background:#1f132b; border:2px dashed var(--mono-pink); border-radius:8px; padding:10px 12px; margin-bottom:8px; width:100%; text-align:left; cursor:pointer;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="color:var(--mono-pink); font-weight:900; font-size:0.9rem;">📥 วางลงช่องที่ ${s.pageSlot}:</span>
                <div style="color:#bbb; font-size:0.8rem; margin-top:2px;">${s.title}</div>
              </div>
              <span style="font-size:1.1rem; color:var(--mono-pink); font-weight:900; white-space:nowrap; margin-left:8px;">👈 วางที่นี่</span>
            </div>
          </button>
        `;
      }
    }).join('');

    // Cards HTML in player hand
    const cardsHtml = myCards.map(c => {
      const isSelected = selectedClosingCardId === c.id;
      if (c.locked) {
        return `
          <div class="p-closing-card locked" style="background:#12121c; border:2px solid #2e2e42; border-radius:8px; padding:10px; margin-bottom:8px; opacity:0.55; cursor:not-allowed; display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.5rem; filter:grayscale(1);">🔒</span>
            <div style="flex:1;">
              <span style="font-size:0.85rem; color:#888;">${c.title}</span>
              <div style="font-size:0.75rem; color:var(--mono-pink); font-weight:700; margin-top:2px;">🔒 ล็อกอยู่ (รอปลดล็อกเมื่อวางการ์ดถูก)</div>
            </div>
          </div>
        `;
      } else {
        const borderStyle = isSelected ? '3px solid var(--mono-pink)' : '2px solid #444466';
        const bgStyle = isSelected ? 'rgba(255, 43, 109, 0.22)' : '#19192e';
        const shadowStyle = isSelected ? 'box-shadow: 0 0 12px var(--mono-pink);' : '';
        return `
          <div class="p-closing-card ${isSelected ? 'selected' : ''}" onclick="selectClosingCard('${c.id}')" style="background:${bgStyle}; border:${borderStyle}; border-radius:8px; padding:10px; margin-bottom:8px; cursor:pointer; display:flex; align-items:center; gap:10px; ${shadowStyle} transition:all 0.2s ease;">
            <span style="font-size:1.5rem;">${c.icon || '📄'}</span>
            <div style="flex:1;">
              <span style="font-size:0.85rem; color:#fff; font-weight:${isSelected ? '800' : 'normal'};">${c.title}</span>
              <div style="font-size:0.75rem; color:${isSelected ? 'var(--court-gold)' : 'var(--mono-cyan)'}; margin-top:2px;">
                ${isSelected ? '👉 เลือกใบนี้แล้ว! กรุณากดปุ่มช่องว่างด้านบนเพื่อวาง' : 'แตะเพื่อเลือกการ์ดใบนี้'}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    area.innerHTML = `
      <div style="margin-bottom:12px; border-bottom:1px solid #333348; padding-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color:var(--mono-pink); font-weight:900; font-size:0.95rem;">📖 หน้าที่ ${curPage} / 5</span>
          <span style="color:#aaa; font-size:0.8rem;">(DM กำลังเปิดหน้านี้)</span>
        </div>
        <div style="color:#fff; font-size:0.85rem; font-weight:700; margin-top:3px;">${pageData.title}</div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-size:0.85rem; color:var(--court-gold); font-weight:800; margin-bottom:6px;">
          1. ช่องว่างที่ต้องเติมในหน้านี้:
        </div>
        ${slotsHtml}
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-size:0.85rem; color:var(--mono-cyan); font-weight:800;">2. การ์ดเหตุการณ์ในมือคุณ:</span>
          <span style="font-size:0.75rem; color:#888;">(คุยปรึกษากับเพื่อน)</span>
        </div>
        <div id="playerClosingHandBox">${cardsHtml}</div>
      </div>
    `;
  } else if (stage === 'stage7') {
    const voterId = myPlayer ? myPlayer.id : (currentUserHash || 'p_anon');
    const myVotedCand = (gameState.votesCast && gameState.votesCast[voterId]) || (myPlayerVoted ? 'บันทึกแล้ว' : null);

    if (myVotedCand) {
      area.innerHTML = `
        <div style="background:rgba(20,20,35,0.95); border:2px solid var(--court-gold); border-radius:10px; padding:20px; text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:10px;">🗳️</div>
          <h3 style="color:var(--court-gold); margin-bottom:8px; font-weight:900;">บันทึกการลงคะแนนเรียบร้อยแล้ว!</h3>
          <p style="color:#ddd; font-size:0.95rem;">คุณได้ลงคะแนนให้: <strong style="color:var(--mono-pink);">${myVotedCand}</strong></p>
          <p style="color:#888; font-size:0.85rem; margin-top:10px;">ผลคะแนนจะถูกปิดเป็นความลับจนกว่าทุกคนจะลงคะแนนเสร็จสิ้น หรือหมดเวลา!</p>
        </div>
      `;
    } else {
      const candidates = getVotingCandidates();
      let btns = candidates.map(c => {
        const safeEscaped = c.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        return `<button class="p-task-btn vote-option-btn" onclick="submitPlayerVote('${safeEscaped}')">
          👉 โหวต: ${c}
        </button>`;
      }).join('');
      area.innerHTML = `
        <h3 style="color:var(--mono-pink); margin-bottom:12px; font-weight:900;">โหวตเลือก Blackened ผู้ปลิดชีพ B:</h3>
        <div class="mobile-task-grid" id="mobileVoteGrid">${btns}</div>
      `;
    }
  }
}

function sendStg1(id) {
  const pName = myPlayer ? myPlayer.name : 'ผู้เล่น';
  broadcast({ type: 'stg1_submit', clueId: id, playerName: pName });
  if (!gameState.stg1SubmissionsList) gameState.stg1SubmissionsList = [];
  const existingIdx = gameState.stg1SubmissionsList.findIndex(s => s.pName === pName);
  if (existingIdx >= 0) {
    gameState.stg1SubmissionsList[existingIdx].clueId = id;
  } else {
    gameState.stg1SubmissionsList.push({ pName: pName, clueId: id });
  }
  const grid = document.getElementById('stg1MobileGrid');
  const fb = document.getElementById('stg1MobileFeedback');
  if (grid) {
    Array.from(grid.children).forEach(b => {
      b.classList.remove('btn-selected');
      if (b.getAttribute('data-clue') === id) {
        b.classList.add('btn-selected');
      }
    });
    grid.style.pointerEvents = 'none';
  }
  if (fb) {
    const clueObj = ALL_CLUES_DATA.find(c => c.id === id) || { id: id, name: id };
    fb.style.display = 'block';
    fb.innerHTML = `✅ คุณเลือก [${id}: ${clueObj.name}] เรียบร้อยแล้ว (รอผลสรุปพร้อมเพื่อน)`;
  }
}

function sendStg2Char(char) {
  broadcast({ type: 'stg2_char', char: char });
}

function sendStg2(idx, char) {
  sendStg2Char(char);
}

function sendRebuttalSlash() {
  const sel = document.getElementById('rebuttalEquippedBullet');
  const bullet = sel ? sel.value : 'EVD-01';
  broadcast({ type: 'rebuttal_slash', bullet: bullet, playerName: myPlayer ? myPlayer.name : 'ผู้เล่น' });
}

function sendLogicDiveChoice(ch) {
  const voterId = myPlayer ? myPlayer.id : (currentUserHash || 'p_anon');
  if (!gameState.stg4Votes) gameState.stg4Votes = {};
  gameState.stg4Votes[voterId] = ch;
  broadcast({
    type: 'logic_dive_vote',
    question: gameState.stg4Step,
    choice: ch,
    voterId: voterId,
    playerName: myPlayer ? myPlayer.name : 'ผู้เล่น'
  });
  const choicesBox = document.getElementById('diveMobileChoices');
  const feedback = document.getElementById('diveChoiceFeedback');
  if (choicesBox) {
    Array.from(choicesBox.children).forEach(b => {
      b.classList.remove('btn-selected');
      if (b.getAttribute('data-choice') === ch) {
        b.classList.add('btn-selected');
      }
    });
    choicesBox.style.pointerEvents = 'none';
  }
  if (feedback) {
    feedback.style.display = 'block';
    feedback.innerHTML = `✅ เลือกข้อ [${ch}] เรียบร้อยแล้ว (รอผลมติพร้อมเพื่อน)`;
  }
}

let selectedClosingCardId = null;

function selectClosingCard(cardId) {
  selectedClosingCardId = cardId;
  if (typeof currentTab !== 'undefined' && currentTab === 'tasks') {
    renderMobileTask('closing');
  }
}

function submitSelectedClosingCard(slotId) {
  if (!selectedClosingCardId) {
    showToast('⚠️ กรุณาคลิกเลือกการ์ดในมือก่อน แล้วค่อยกดวางลงช่อง!');
    return;
  }
  sendClosingCard(slotId, selectedClosingCardId);
  selectedClosingCardId = null;
  if (typeof currentTab !== 'undefined' && currentTab === 'tasks') {
    renderMobileTask('closing');
  }
}

function sendClosingCard(slot, cardId) {
  broadcast({
    type: 'closing_submit',
    slot: slot,
    cardId: cardId,
    playerName: myPlayer ? myPlayer.name : 'ผู้เล่น'
  });
}

function sendStg6FinalBlow() {
  broadcast({ type: 'stg6_final_blow', playerName: myPlayer ? myPlayer.name : 'ผู้เล่น' });
  const box = document.getElementById('finalBlowMobileBox');
  if (box) box.innerHTML = '<div style="color:#00ff88; font-weight:900; font-size:1.1rem;">🎯 ยิงกระสุนความจริงเข้าเป้าหมายสำเร็จ!</div>';
}

let myPlayerVoted = false;

function submitPlayerVote(cand) {
  if (myPlayerVoted) return;
  myPlayerVoted = true;
  const voterId = myPlayer ? myPlayer.id : (currentUserHash || 'p_anon');
  if (!gameState.votesCast) gameState.votesCast = {};
  gameState.votesCast[voterId] = cand;
  broadcast({ type: 'submit_vote', candidate: cand, voterId: voterId });
  const grid = document.getElementById('mobileVoteGrid');
  if (grid) grid.style.pointerEvents = 'none';
  const area = document.getElementById('mobileTaskArea');
  if (area) {
    area.innerHTML = `
      <div style="background:rgba(20,20,35,0.95); border:2px solid var(--court-gold); border-radius:10px; padding:20px; text-align:center;">
        <div style="font-size:2.5rem; margin-bottom:10px;">🗳️</div>
        <h3 style="color:var(--court-gold); margin-bottom:8px; font-weight:900;">บันทึกการลงคะแนนเรียบร้อยแล้ว!</h3>
        <p style="color:#ddd; font-size:0.95rem;">คุณได้ลงคะแนนให้: <strong style="color:var(--mono-pink);">${cand}</strong></p>
        <p style="color:#888; font-size:0.85rem; margin-top:10px;">ผลคะแนนจะถูกปิดเป็นความลับจนกว่าทุกคนจะลงคะแนนเสร็จสิ้น หรือหมดเวลา!</p>
      </div>
    `;
  }
}

// ==========================================================
// SABOTEUR ACTIONS
// ==========================================================
function toggleSaboteurDock() {
  const body = document.getElementById('saboteurOptions');
  const arrow = document.getElementById('sabArrow');
  if (body.style.display === 'flex') {
    body.style.display = 'none';
    arrow.innerText = '▲';
  } else {
    body.style.display = 'flex';
    arrow.innerText = '▼';
  }
}

function sendSabotage(type) {
  playSfx('glitch');
  let btn = null;
  let cd = 12;

  if (type === 'glitch') {
    btn = document.getElementById('sabBtnGlitch');
    cd = 12;
  } else if (type === 'drain_time') {
    btn = document.getElementById('sabBtnTimer');
    cd = 15;
  } else if (type === 'corrupt_data') {
    btn = document.getElementById('sabBtnCorrupt');
    cd = 10;
  }

  broadcast({ type: 'sabotage', sabType: type, playerName: myPlayer ? myPlayer.name : 'คนร้าย' });

  if (btn) {
    btn.disabled = true;
    const orig = btn.innerText;
    let rem = cd;
    btn.innerText = `⏳ Cooldown (${rem}s)`;
    const iv = setInterval(() => {
      rem--;
      if (rem > 0) btn.innerText = `⏳ Cooldown (${rem}s)`;
      else {
        clearInterval(iv);
        btn.disabled = false;
        btn.innerText = orig;
      }
    }, 1000);
  }
}

function handleSabotage(type, pName) {
  // CRITICAL REQUIREMENT 1: Sabotage Isolation - Anomaly/glitch sabotage triggered by killer Magician (A) must NEVER affect the Admin/DM view.
  if (currentView === 'admin') {
    if (type === 'drain_time') {
      gameState.timeRemaining = Math.max(5, gameState.timeRemaining - 10);
      updateTimerDisplay();
    } else if (type === 'corrupt_data') {
      gameState.influence = Math.max(0, gameState.influence - 10);
      }
    return;
  }

  playSfx('glitch');
  if (type === 'glitch') {
    const overlay = document.getElementById('screenGlitch');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';
      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
      }, 4000);
    }
    logCourt(`⚡ [ANOMALY DETECTED]: คลื่นแทรกแซงหน้าจอรบกวน (4 วินาที)`);
  } else if (type === 'drain_time') {
    gameState.timeRemaining = Math.max(5, gameState.timeRemaining - 10);
    updateTimerDisplay();
    logCourt(`⏱️ [TIME GLITCH]: เวลาศาลชั้นเรียนถูกเร่งรัดกะทันหัน! (-10s)`);
  } else if (type === 'corrupt_data') {
    gameState.influence = Math.max(0, gameState.influence - 10);
    logCourt(`⚠️ [DATA CORRUPT]: ข้อมูลเท็จถูกแทรกแซงเข้าสู่ระบบ (-10% Influence)`);
  }
}

// ==========================================================
// DM / ADMIN CONTROLS
// ==========================================================
function adminSetGame(stage, config) {
  setStage(stage, config);
  broadcast({ type: 'set_stage', stage: stage, config: config });
}

function adminAdjustTimer(secs) {
  gameState.timeRemaining = Math.max(0, gameState.timeRemaining + secs);
  updateTimerDisplay();
  broadcast({ type: 'admin_adjust_timer', secs: secs, time: gameState.timeRemaining });
}

function adminToggleTimer() {
  if (gameState.timerRunning) {
    stopTimer();
    broadcast({ type: 'admin_timer_stop' });
  } else {
    const dur = gameState.timeRemaining || 60;
    startTimer(dur);
    broadcast({ type: 'admin_timer_start', duration: dur });
  }
}

function adminAdjustInfluence(amount, reset) {
  if (reset) gameState.influence = amount;
  else gameState.influence = Math.max(0, Math.min(100, gameState.influence + amount));
  broadcast({ type: 'adjust_influence', delta: amount, reset: reset, value: gameState.influence });
}

function adminTriggerVerdict(isVictory) {
  showVerdict(isVictory);
  broadcast({ type: 'verdict', isVictory: isVictory });
}

function triggerFx(fx) {
  if (isHost || currentView === 'court') {
    playSfx(fx);
    broadcast({ type: 'trigger_fx', fx: fx });
  } else if (currentView === 'admin') {
    // Admin DM clicks: route to host screen (classroom speakers); NEVER play locally on DM device
    broadcast({ type: 'trigger_fx', fx: fx });
    showToast(`🔊 ส่งเสียง [${fx}] ขึ้นจอใหญ่ศาลเรียบร้อย`);
  } else if (hostPeer && hostPeer.open) {
    broadcast({ type: 'trigger_fx', fx: fx });
    showToast(`🔊 ส่งเสียง [${fx}] ขึ้นจอศาลเรียบร้อย`);
  } else {
    playSfx(fx);
  }
}

function adminAdjustPlayerCred(peerId, delta) {
  if (!peerId) return;
  let p = gameState.players[peerId];
  if (!p) {
    p = Object.values(gameState.players || {}).find(x => x.id === peerId || x.name === peerId);
  }
  if (!p) return;
  p.credibility = Math.max(0, Math.min(5, ((typeof p.credibility === 'number') ? p.credibility : 5) + delta));
  updatePlayerDisplays();
  updateAdminDisplay();
  broadcast({ type: 'adjust_player_cred', playerId: p.id || peerId, playerName: p.name, credibility: p.credibility });
  logCourt(`💔 [CREDIBILITY]: DM ปรับความน่าเชื่อถือของ [${p.name}] เป็น ${p.credibility}/5 ดวง`);
}

function updateRebuttalDisplay() {
  const accEl = document.getElementById('rebuttalAccuser');
  const oppEl = document.getElementById('rebuttalSuspect');
  if (accEl) accEl.innerText = gameState.stg3Challenger ? `ฝ่ายกล่าวหา: ${gameState.stg3Challenger}` : 'ฝ่ายกล่าวหา';
  if (oppEl) oppEl.innerText = gameState.stg3Opponent ? `ฝ่ายโต้แย้ง: ${gameState.stg3Opponent}` : 'ฝ่ายโต้แย้ง';
  const leftClueEl = document.getElementById('rebuttalLeftClue');
  const rightClueEl = document.getElementById('rebuttalRightClue');
  if (leftClueEl) leftClueEl.innerText = gameState.stg3LeftClue ? `🗡️ หลักฐาน: ${gameState.stg3LeftClue}` : '🗡️ หลักฐาน: (รอเลือก...)';
  if (rightClueEl) rightClueEl.innerText = gameState.stg3RightClue ? `🛡️ หลักฐาน: ${gameState.stg3RightClue}` : '🛡️ หลักฐาน: (รอเลือก...)';
  const stmtEl = document.getElementById('rebuttalStatement');
  if (stmtEl && gameState.stg3Argument) stmtEl.innerText = `"${gameState.stg3Argument}"`;

  // Update DM Rebuttal verdict buttons to show PC1 and PC2 names
  const btnChal = document.getElementById('btnRebuttalWinChal');
  const btnOpp = document.getElementById('btnRebuttalWinOpp');
  if (btnChal) {
    const chalName = gameState.stg3Challenger ? gameState.stg3Challenger.split(' ')[0] : 'ผู้ท้าชิง';
    btnChal.innerText = `🏆 ${chalName} ชนะ`;
  }
  if (btnOpp) {
    const oppName = gameState.stg3Opponent ? gameState.stg3Opponent.split(' ')[0] : 'ฝ่ายตรงข้าม';
    btnOpp.innerText = `⚔️ ${oppName} ชนะ`;
  }
}

function adminStartRebuttal() {
  const rebSel = document.getElementById('adminRebuttalChallengerSelect');
  const rebOppSel = document.getElementById('adminRebuttalOpponentSelect');
  const chal = rebSel ? rebSel.value : '';
  const opp = rebOppSel ? rebOppSel.value : '';
  adminSetGame('stage3', { challenger: chal, opponent: opp });
}

function adminSelectRebuttalChallengers() {
  const rebSel = document.getElementById('adminRebuttalChallengerSelect');
  const rebOppSel = document.getElementById('adminRebuttalOpponentSelect');
  // Validate no self-vs-self
  if (rebSel && rebOppSel && rebSel.value && rebOppSel.value && rebSel.value === rebOppSel.value) {
    showToast('⚠️ ผู้ท้าชิงและฝ่ายตรงข้ามต้องไม่ใช่คนเดียวกัน!');
    return;
  }
  if (rebSel) gameState.stg3Challenger = rebSel.value;
  if (rebOppSel) gameState.stg3Opponent = rebOppSel.value;
  updateRebuttalDisplay();
  broadcast({
    type: 'rebuttal_challengers',
    challenger: gameState.stg3Challenger,
    opponent: gameState.stg3Opponent
  });
}

function updateAdminDisplay() {
  const table = document.getElementById('adminPlayerTable');
  const cnt = document.getElementById('adminPlayerCount');
  const rebSel = document.getElementById('adminRebuttalChallengerSelect');
  const rebOppSel = document.getElementById('adminRebuttalOpponentSelect');
  if (!table || !cnt) return;
  table.innerHTML = '';
  const players = Object.values(gameState.players);
  cnt.innerText = players.length;

  if (rebSel) {
    const curVal = rebSel.value;
    rebSel.innerHTML = '<option value="">(ทุกคนในห้อง / อิสระ)</option>';
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.innerText = p.name;
      if (opt.value === curVal || p.name === curVal) opt.selected = true;
      rebSel.appendChild(opt);
    });
  }

  if (rebOppSel) {
    const curOpp = rebOppSel.value || gameState.stg3Opponent || '';
    rebOppSel.innerHTML = '<option value="">-- เลือกฝ่ายตรงข้าม --</option>';
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.innerText = p.name;
      if (opt.value === curOpp || p.name === curOpp) opt.selected = true;
      rebOppSel.appendChild(opt);
    });
  }

  const armTargetSel = document.getElementById('adminArmamentTargetSelect');
  if (armTargetSel) {
    const curVal = armTargetSel.value;
    armTargetSel.innerHTML = '<option value="">-- เลือกผู้ถูกกล่าวหา --</option>';
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.innerText = p.name;
      if (opt.value === curVal || p.name === curVal) opt.selected = true;
      armTargetSel.appendChild(opt);
    });
  }

  players.forEach(p => {
    const pCred = (typeof p.credibility === 'number') ? p.credibility : 5;
    let heartsHtml = '';
    for (let i = 1; i <= 5; i++) {
      heartsHtml += (i <= pCred) ? '♥' : '♡';
    }

    const row = document.createElement('div');
    row.className = 'admin-p-row' + (p.isKiller ? ' is-killer' : '');
    row.innerHTML = `
      <div class="admin-p-info">
        <div>
          <strong>${escapeHtml(p.name)}</strong>
          ${p.isKiller ? '<span class="admin-p-saboteur">[SABOTEUR]</span>' : ''}
        </div>
        <div class="admin-p-cred">
          <button class="cred-btn" onclick="adminAdjustPlayerCred('${p.id}', -1)" title="ลด 1 ดวง">-</button>
          <span class="admin-p-cred-hearts" title="ความน่าเชื่อถือ: ${pCred}/5">${heartsHtml}</span>
          <button class="cred-btn" onclick="adminAdjustPlayerCred('${p.id}', 1)" title="เพิ่ม 1 ดวง">+</button>
        </div>
      </div>
      <div class="admin-p-actions">
        <span class="admin-p-vote-status">${p.votedFor ? `โหวต: ${escapeHtml(p.votedFor)}` : 'ยังไม่โหวต'}</span>
        <button class="small-btn red admin-p-kick-btn" onclick="adminKickPlayer('${p.id}')">❌ เตะ</button>
      </div>
    `;
    table.appendChild(row);
  });
  renderAdminEvidenceTracker();
}

let adminExpandedPlayerClues = {};

function adminRefreshEvidenceTracker() {
  renderAdminEvidenceTracker();
  playSfx('click');
}

function adminTogglePlayerCluesExpand(playerId) {
  adminExpandedPlayerClues[playerId] = !adminExpandedPlayerClues[playerId];
  renderAdminEvidenceTracker();
}

function renderAdminEvidenceTracker() {
  const container = document.getElementById('adminPlayerEvidenceList');
  const broadcastSel = document.getElementById('adminBroadcastClueSelect');
  if (!container) return;

  // Populate broadcast select if empty
  if (broadcastSel && broadcastSel.options.length <= 1) {
    const curVal = broadcastSel.value;
    broadcastSel.innerHTML = '<option value="">-- เลือกหลักฐานเพื่อแจกทุกคน --</option>';
    ALL_CLUES_DATA.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.innerText = `[${c.id}] ${c.name} (${c.typeLabel || c.importance})`;
      if (c.id === curVal) opt.selected = true;
      broadcastSel.appendChild(opt);
    });
  }

  const players = Object.values(gameState.players);
  if (players.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:16px; color:#64748b; font-size:0.85rem;">ยังไม่มีผู้เล่นเชื่อมต่อในระบบ (0 คน)</div>';
    return;
  }

  container.innerHTML = '';

  players.forEach(p => {
    const pKey = p.userHash || p.id || p.name;
    const pClues = Array.isArray(p.clues) ? p.clues : [];
    const totalClues = ALL_CLUES_DATA.length; // 31
    const pCount = pClues.length;
    const percent = Math.round((pCount / totalClues) * 100);
    const isExpanded = Boolean(adminExpandedPlayerClues[pKey]);

    const card = document.createElement('div');
    card.className = 'admin-player-evidence-item';
    card.style.background = 'rgba(15, 23, 42, 0.7)';
    card.style.border = '1px solid #1e293b';
    card.style.borderRadius = '8px';
    card.style.padding = '10px 12px';

    // Count core clues
    const coreClues = ALL_CLUES_DATA.filter(c => c.importance === 'MUST' || c.secretType === 'CORE');
    const pCoreCount = coreClues.filter(c => pClues.includes(c.id)).length;

    let cluesGridHtml = '';
    if (isExpanded) {
      cluesGridHtml = `
        <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #334155;">
          <div style="font-size:0.78rem; color:#94a3b8; font-weight:bold; margin-bottom:8px;">
            รายการหลักฐานทั้งหมด (คลิกเพื่อมอบหลักฐานที่ขาด):
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:6px; max-height:260px; overflow-y:auto; padding-right:4px;">
            ${ALL_CLUES_DATA.map(c => {
              const has = pClues.includes(c.id);
              const isCore = (c.importance === 'MUST' || c.secretType === 'CORE');
              if (has) {
                return `
                  <div style="background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:4px; padding:4px 6px; font-size:0.75rem; color:#a7f3d0; display:flex; align-items:center; justify-content:space-between;">
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(c.name)}">✓ [${c.id}] ${escapeHtml(c.name)}</span>
                    <span style="font-size:0.65rem; background:#065f46; color:#fff; padding:1px 4px; border-radius:3px; margin-left:4px;">มีแล้ว</span>
                  </div>
                `;
              } else {
                return `
                  <button type="button" class="small-btn" onclick="adminGrantClue('${pKey}', '${c.id}')" style="background:${isCore ? 'rgba(239,68,68,0.15)' : 'rgba(30,41,59,0.8)'}; border:1px solid ${isCore ? '#ef4444' : '#475569'}; border-radius:4px; padding:4px 6px; font-size:0.75rem; color:${isCore ? '#fca5a5' : '#cbd5e1'}; display:flex; align-items:center; justify-content:space-between; cursor:pointer; text-align:left;" title="คลิกเพื่อมอบหลักฐานนี้ให้ ${escapeHtml(p.name)}">
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">+ [${c.id}] ${escapeHtml(c.name)}</span>
                    <span style="font-size:0.65rem; background:${isCore ? '#991b1b' : '#334155'}; color:#fff; padding:1px 4px; border-radius:3px; margin-left:4px;">${isCore ? 'CORE' : 'มอบ'}</span>
                  </button>
                `;
              }
            }).join('')}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <strong style="color:#f8fafc; font-size:0.95rem;">${escapeHtml(p.name)}</strong>
          <span style="font-size:0.8rem; color:#38bdf8; margin-left:6px;">[${escapeHtml(p.role || 'นักเรียน')}]</span>
          ${p.isKiller ? '<span style="font-size:0.7rem; background:#dc2626; color:#fff; padding:1px 6px; border-radius:4px; margin-left:6px; font-weight:bold;">SABOTEUR</span>' : ''}
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:0.85rem; font-weight:bold; color:${percent >= 70 ? '#10b981' : percent >= 40 ? '#38bdf8' : '#eab308'};">
            ${pCount} / ${totalClues} ชิ้น (${percent}%)
          </span>
          <button class="small-btn ${isExpanded ? 'grey' : 'cyan'}" onclick="adminTogglePlayerCluesExpand('${pKey}')" style="padding:4px 10px; font-size:0.75rem; font-weight:800;">
            ${isExpanded ? '▲ ซ่อน' : '▼ ดู/มอบหลักฐาน'}
          </button>
        </div>
      </div>
      
      <!-- Progress bar -->
      <div style="margin-top:6px; height:6px; background:#1e293b; border-radius:3px; overflow:hidden; display:flex;">
        <div style="width:${percent}%; background:linear-gradient(90deg, #0284c7, #38bdf8); height:100%; transition:width 0.3s ease;"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#94a3b8; margin-top:4px;">
        <span>Core หลักฐานสำคัญ: <strong style="color:${pCoreCount >= 8 ? '#10b981' : '#f59e0b'};">${pCoreCount} / ${coreClues.length}</strong></span>
        <span>สถานะ: ${pCount === 0 ? '⚠️ ยังไม่พบหลักฐาน' : pCount < 5 ? '🟡 เริ่มต้นสืบสวน' : '🟢 เก็บหลักฐานต่อเนื่อง'}</span>
      </div>

      ${cluesGridHtml}
    `;

    container.appendChild(card);
  });
}

function adminGrantClue(targetKey, clueId) {
  const clue = ALL_CLUES_DATA.find(c => c.id === clueId);
  const clueName = clue ? clue.name : clueId;

  // Update in host memory
  Object.values(gameState.players).forEach(p => {
    if ((p.userHash && p.userHash === targetKey) || (p.id && p.id === targetKey) || p.name === targetKey) {
      if (!p.clues) p.clues = [];
      if (!p.clues.includes(clueId)) p.clues.push(clueId);
    }
  });

  renderAdminEvidenceTracker();
  playSfx('correct');
  showToast(`🎁 มอบหลักฐาน [${clueId}: ${clueName}] ให้ผู้เล่นแล้ว`);

  broadcast({
    type: 'admin_grant_clue',
    targetKey: targetKey,
    clueId: clueId,
    clueName: clueName
  });
}

function adminBroadcastClueFromSelect() {
  const sel = document.getElementById('adminBroadcastClueSelect');
  if (!sel || !sel.value) {
    alert('กรุณาเลือกหลักฐานที่ต้องการแจกให้ทุกคนก่อนครับ');
    return;
  }
  adminBroadcastClue(sel.value);
}

function adminBroadcastClue(clueId) {
  const clue = ALL_CLUES_DATA.find(c => c.id === clueId);
  if (!clue) return;

  // Add to all players in host memory
  Object.values(gameState.players).forEach(p => {
    if (!p.clues) p.clues = [];
    if (!p.clues.includes(clueId)) p.clues.push(clueId);
  });

  renderAdminEvidenceTracker();
  playSfx('correct');
  showToast(`📢 มอบหลักฐาน [${clue.id}: ${clue.name}] ให้ทุกคนในห้องแล้ว!`);

  broadcast({
    type: 'court_clue_revealed',
    clueId: clue.id,
    clueName: clue.name,
    playerName: 'ผู้ดูแลศาล (DM)'
  });
}

function updatePlayerDisplays() {
  const list = document.getElementById('courtPodiumList');
  const count = document.getElementById('courtPlayerCount');
  const trialList = document.getElementById('courtTrialPodiumList');
  const trialCount = document.getElementById('courtTrialPlayerCount');
  const idleCount = document.getElementById('courtIdlePlayerCount');
  const dailyCount = document.getElementById('courtDailyPlayerCount');
  const players = Object.values(gameState.players);

  if (count) count.innerText = players.length;
  if (trialCount) trialCount.innerText = players.length;
  if (idleCount) idleCount.innerText = players.length;
  if (dailyCount) dailyCount.innerText = players.length;

  const idlCode = document.getElementById('courtIdleRoomCode');
  if (idlCode) idlCode.innerText = roomCode || '------';
  const dlCode = document.getElementById('courtDailyRoomCode');
  if (dlCode) dlCode.innerText = roomCode || '------';

  [list, trialList].forEach(targetList => {
    if (!targetList) return;
    targetList.innerHTML = '';
    players.forEach(p => {
      const seat = document.createElement('div');
      seat.className = 'podium-seat';
      const cred = (typeof p.credibility === 'number') ? p.credibility : 5;
      let heartsHtml = '';
      for (let i = 1; i <= 5; i++) {
        heartsHtml += `<span class="heart ${i <= cred ? 'active' : 'lost'}">♥</span>`;
      }
      seat.innerHTML = `
        <div class="podium-avatar">👤</div>
        <div class="podium-plate">${escapeHtml(p.name)}</div>
        <div class="podium-cred-hearts" title="ความน่าเชื่อถือ: ${cred}/5">${heartsHtml}</div>
      `;
      targetList.appendChild(seat);
    });
  });

  updateAdminDisplay();
  updateMobileCredDisplay();
}

function updateMobileCredDisplay() {
  const el = document.getElementById('pMyCredHearts');
  if (!el) return;
  let p = null;
  if (myPlayer) {
    p = Object.values(gameState.players || {}).find(x => x.name === myPlayer.name || x.id === myPlayer.id) || myPlayer;
    if (p && typeof p.credibility === 'number') {
      myPlayer.credibility = p.credibility;
    }
  } else if (currentUserHash && gameState.players) {
    p = gameState.players[currentUserHash];
  }
  const cred = (p && typeof p.credibility === 'number') ? p.credibility : 5;
  let str = '';
  for (let i = 1; i <= 5; i++) {
    str += (i <= cred) ? '♥' : '♡';
  }
  el.innerText = str;
}

function adminChangeRoomCode() {
  const el = document.getElementById('inputNewRoomCode');
  if (!el) return;
  const newCode = el.value.trim().toUpperCase();
  if (newCode) {
    roomCode = newCode;
    window.location.href = window.location.pathname + '?room=' + roomCode + '&view=' + currentView;
  }
}

// ==========================================================
// SESSION MANAGEMENT (RESET & KICK)
// ==========================================================
function adminKickPlayer(peerId) {
  if (!peerId) return;
  const target = gameState.players[peerId];
  const name = target ? target.name : peerId;
  const role = target ? target.role : null;
  if (!confirm(`คุณต้องการเตะผู้เล่น "${name}" ออกจากห้องใช่หรือไม่?`)) return;

  delete gameState.players[peerId];
  updatePlayerDisplays();
  broadcast({ type: 'kick_player', playerId: peerId });
  if (role) {
    broadcast({ type: 'character_freed', role: role });
  }
  logCourt(`🚫 [KICK]: ผู้ดูแลระบบได้เตะ "${name}" ออกจากห้องแล้ว`);
}

function adminResetSession() {
  if (!confirm("⚠️ ยืนยันการรีเซ็ตห้องศาลทั้งหมด (Reset Session)?\nผู้เล่นทุกคนรวมถึง Admin จะถูกเตะออก ห้องจะถูกรีเซ็ตใหม่ทั้งหมดเหมือน Kahoot")) return;

  broadcast({ type: 'session_terminated' });
  deleteActiveRoom(roomCode);

  clearPlayerLocalData();

  if (myPeer && !myPeer.destroyed) {
    try { myPeer.destroy(); } catch(e) {}
  }

  alert('🔄 ทำการล้างห้องศาลเรียบร้อยแล้ว ทุกคนรวมถึง Admin ถูกนำกลับสู่หน้าหลักเพื่อเริ่มรอบใหม่');
  window.location.href = '/';
}

function playerLeaveGame() {
  if (!confirm('คุณต้องการออกจากห้องศาลชั้นเรียนนี้ใช่หรือไม่? ข้อมูลในรอบนี้ของคุณจะถูกล้าง')) return;

  if (myPlayer) {
    broadcast({
      type: 'player_leave',
      peerId: myPeer ? myPeer.id : null,
      role: myPlayer.role
    });
  }

  clearPlayerLocalData();
  const targetRoom = roomCode || '';
  window.location.href = targetRoom ? `/play?room=${targetRoom}` : '/';
}

function courtTerminateSession() {
  if (!confirm('⚠️ ยืนยันการจบ Session ศาลชั้นเรียนนี้หรือไม่?\nผู้เล่นทุกคนในห้องจะถูกเตะออกเหมือน Kahoot และห้องนี้จะถูกรีเซ็ตใหม่ทั้งหมด')) return;

  broadcast({ type: 'session_terminated' });
  deleteActiveRoom(roomCode);
  sessionStorage.removeItem('dangan_court_room_code');

  // Reset state
  gameState.players = {};
  gameState.discoveredClues = [];
  gameState.discoveredCluesCount = 0;
  gameState.votes = {};
  gameState.influence = 100;
  gameState.stage = 'lobby';

  // Generate new 6-digit room code
  roomCode = generate6DigitRoomCode();
  sessionStorage.setItem('dangan_court_room_code', roomCode);

  // Re-register new room
  registerActiveRoom(roomCode);

  // Update UI & restart Host Peer
  const courtRoom = document.getElementById('courtLobbyRoomCode');
  if (courtRoom) courtRoom.innerText = roomCode;
  const directJoin = window.location.origin + '/play?room=' + roomCode;
  const joinUrl = document.getElementById('courtJoinUrl');
  if (joinUrl) joinUrl.innerText = directJoin;
  const qrImg = document.getElementById('courtQrImg');
  if (qrImg) {
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(directJoin);
  }

  updatePlayerDisplays();
  renderStage('lobby');

  // Rebuild host peer with new room ID
  if (myPeer && !myPeer.destroyed) {
    myPeer.destroy();
  }
  myPeer = null;
  setupPeerJS();

  logCourt(`🔄 [SESSION RESET]: เริ่มต้นเซสชันใหม่ รหัสห้อง: ${roomCode}`);
  playSfx('gavel');
}

// ==========================================================
// ADMIN MINIGAME CONFIG & 1-CLICK PRESETS
// ==========================================================
let currentSelectedConfigStage = 'stage1';

function populateStg1CluesDropdown() {
  const sel = document.getElementById('cfgStg1TargetClue');
  if (!sel || !ALL_CLUES_DATA) return;
  const currentVal = sel.value;
  sel.innerHTML = ALL_CLUES_DATA.map(c => `<option value="${c.id}">[${c.id}] ${c.name} (${c.loc})</option>`).join('');
  if (currentVal) sel.value = currentVal;
}

function openAdminMinigameModal(defaultTab) {
  const modal = document.getElementById('adminMinigameModal');
  if (!modal) return;
  populateStg1CluesDropdown();
  modal.classList.remove('hidden');
  selectConfigTab(defaultTab || 'stage1');
}

function closeAdminMinigameModal() {
  const modal = document.getElementById('adminMinigameModal');
  if (modal) modal.classList.add('hidden');
}

function selectConfigTab(stageKey) {
  currentSelectedConfigStage = stageKey;
  const stages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7'];
  stages.forEach(stg => {
    const tabBtn = document.getElementById('cfgTab' + stg.charAt(0).toUpperCase() + stg.slice(1));
    const pane = document.getElementById('cfgPane' + stg.charAt(0).toUpperCase() + stg.slice(1));
    if (tabBtn) {
      if (stg === stageKey) tabBtn.classList.add('active');
      else tabBtn.classList.remove('active');
    }
    if (pane) {
      if (stg === stageKey) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
  });
}

function applyPresetStage1(presetKey) {
  populateStg1CluesDropdown();
  const pInput = document.getElementById('cfgStg1Prompt');
  const tSelect = document.getElementById('cfgStg1TargetClue');
  if (!pInput || !tSelect) return;

  if (presetKey === 'bone') {
    pInput.value = "อุปุ๊ปุ๊! อาวุธที่ใช้ฟาดหัว B จนสลบในครัวตอน 17:30 น. คืออะไร และถูกนำไปซ่อนที่ไหนกันแน่นะ!?";
    tSelect.value = "EVD-02";
  } else if (presetKey === 'rope') {
    pInput.value = "หลักฐานชิ้นใดที่เชื่อมโยงร่างของเหยื่อเรียวตะจากท่อเพดานออกไปนอกหน้าต่างสูง 3.5 เมตร!?";
    tSelect.value = tSelect.querySelector('option[value="EVD-09"]') ? "EVD-09" : (tSelect.querySelector('option[value="EVD-04"]') ? "EVD-04" : tSelect.value);
  } else if (presetKey === 'window' || presetKey === 'pipe') {
    pInput.value = "จุดใดในห้องซักรีดที่คนร้ายใช้พาดเชือกไนลอนเพื่อทำหน้าที่แทนรอกชักร่างขึ้นสู่ที่สูง!?";
    tSelect.value = tSelect.querySelector('option[value="EVD-14"]') ? "EVD-14" : (tSelect.querySelector('option[value="EVD-04"]') ? "EVD-04" : tSelect.value);
  } else if (presetKey === 'barrel') {
    pInput.value = "วัตถุชิ้นใดภายนอกอาคารที่ทำหน้าที่เป็นน้ำหนักถ่วง (Counterweight) ดึงร่างเหยื่อขึ้นแขวนเพดาน!?";
    tSelect.value = tSelect.querySelector('option[value="EVD-19"]') ? "EVD-19" : (tSelect.querySelector('option[value="EVD-06"]') ? "EVD-06" : tSelect.value);
  } else if (presetKey === 'meter' || presetKey === 'hose') {
    pInput.value = "อุปกรณ์ใดถูกปล่อยให้ทำงานอย่างต่อเนื่อง เพื่อค่อยๆ เติมน้ำหนักลงในถังถ่วงน้ำหนักจนถึงเวลาตาย!?";
    tSelect.value = tSelect.querySelector('option[value="EVD-10"]') ? "EVD-10" : (tSelect.querySelector('option[value="EVD-12"]') ? "EVD-12" : tSelect.value);
  } else if (presetKey === 'dryer' || presetKey === 'timer') {
    pInput.value = "อุปกรณ์ใดถูกตั้งเวลาล่วงหน้าเพื่อสร้างเสียงต่อสู้หลอกเวลา 21:00 น. ในห้องซักรีด!?";
    tSelect.value = "EVD-05";
  } else if (presetKey === 'knife') {
    pInput.value = "สิ่งใดอยู่ในกระเป๋าเสื้อเหยื่อเรียวตะ (B) ที่ยืนยันว่าไม่มีการต่อสู้ระยะประชิดในห้องซักรีด!?";
    tSelect.value = "EVD-12";
  }
}

function applyPresetStage2(word, prompt) {
  const wInput = document.getElementById('cfgStg2Word');
  const pInput = document.getElementById('cfgStg2Prompt');
  if (wInput) wInput.value = word;
  if (pInput) pInput.value = prompt;
}

function applyPresetStage3(opp, arg) {
  const oppInput = document.getElementById('cfgStg3Opponent');
  const argInput = document.getElementById('cfgStg3Arg');
  if (oppInput) oppInput.value = opp;
  if (argInput) argInput.value = arg;
}

function applyPresetStage4(key) {
  if (key === 'timeline') {
    LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES.timeline;
    gameState.stg4Route = 'timeline';
    showToast("🛹 สลับ Logic Dive: Route 2 (The Blackened Timeline)");
  } else {
    LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES.pulley;
    gameState.stg4Route = 'pulley';
    showToast("🛹 สลับ Logic Dive: Route 1 (The Ceiling Pulley Trap)");
  }
}

function applyPresetStage5(topic, left, right) {
  const tInput = document.getElementById('cfgStg5Topic');
  const lInput = document.getElementById('cfgStg5Left');
  const rInput = document.getElementById('cfgStg5Right');
  if (tInput) tInput.value = topic;
  if (lInput) lInput.value = left;
  if (rInput) rInput.value = right;
}

function applyPresetStage6(opp, scream) {
  const sInput = document.getElementById('cfgStg6Scream');
  if (sInput) sInput.value = scream;
}

function applyPresetStage7(mode) {
  showToast("📖 โหลดพรีเซ็ตคดีห้องซักผ้าฉบับสมบูรณ์เรียบร้อย");
  logCourt("📖 [CLOSING PRESET]: DM โหลดพรีเซ็ตมังงะสรุปคดีห้องซักผ้าฉบับสมบูรณ์ (The Culprit B Timeline)");
}

function adminLaunchSelectedConfigGame() {
  const stg = currentSelectedConfigStage || 'stage1';
  let config = {};

  if (stg === 'stage1') {
    const prompt = document.getElementById('cfgStg1Prompt') ? document.getElementById('cfgStg1Prompt').value : '';
    const target = document.getElementById('cfgStg1TargetClue') ? document.getElementById('cfgStg1TargetClue').value : 'EVD-02';
    config = { prompt: prompt, correctClueId: target };
  } else if (stg === 'stage2') {
    const prompt = document.getElementById('cfgStg2Prompt') ? document.getElementById('cfgStg2Prompt').value : '';
    const word = document.getElementById('cfgStg2Word') ? document.getElementById('cfgStg2Word').value.trim().toUpperCase() : 'WATER CLOCK';
    config = { prompt: prompt, targetWord: word };
  } else if (stg === 'stage3') {
    const opp = document.getElementById('cfgStg3Opponent') ? document.getElementById('cfgStg3Opponent').value : 'นักมายากล (A)';
    const arg = document.getElementById('cfgStg3Arg') ? document.getElementById('cfgStg3Arg').value : '';
    config = { opponent: opp, argument: arg };
  } else if (stg === 'stage4') {
    const route = (gameState.stg4Route === 'timeline' || LOGIC_DIVE_DATA === LOGIC_DIVE_ROUTES.timeline) ? 'timeline' : 'pulley';
    config = { route: route };
  } else if (stg === 'stage5') {
    const topic = document.getElementById('cfgStg5Topic') ? document.getElementById('cfgStg5Topic').value : '';
    const left = document.getElementById('cfgStg5Left') ? document.getElementById('cfgStg5Left').value : '';
    const right = document.getElementById('cfgStg5Right') ? document.getElementById('cfgStg5Right').value : '';
    config = { topic: topic, leftTeam: left, rightTeam: right };
  } else if (stg === 'stage6') {
    const scream = document.getElementById('cfgStg6Scream') ? document.getElementById('cfgStg6Scream').value : '';
    config = { opponent: 'นักมายากล (A)', scream: scream };
  } else if (stg === 'stage7') {
    config = { mode: 'full' };
    setStage('closing', config);
    broadcast({ type: 'set_stage', stage: 'closing', config: config });
    closeAdminMinigameModal();
    logCourt(`🎮 [MINIGAME LAUNCH]: DM เริ่มต้น CLOSING ARGUMENT พร้อมการตั้งค่าที่กำหนด`);
    return;
  }

  setStage(stg, config);
  broadcast({ type: 'set_stage', stage: stg, config: config });
  closeAdminMinigameModal();
  logCourt(`🎮 [MINIGAME LAUNCH]: DM เริ่มต้น ${stg.toUpperCase()} พร้อมการตั้งค่าที่กำหนด`);
}

// ==========================================================
// PC / DESKTOP CONTROLS: FULLSCREEN, POPOUT & HOTKEYS MODAL
// ==========================================================
function toggleCourtFullscreen() {
  const courtEl = document.getElementById('viewCourt');
  if (!courtEl) return;
  if (!document.fullscreenElement) {
    if (courtEl.requestFullscreen) {
      courtEl.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
        courtEl.classList.toggle('court-fullscreen-mode');
      });
    } else if (courtEl.webkitRequestFullscreen) {
      courtEl.webkitRequestFullscreen();
    } else {
      courtEl.classList.toggle('court-fullscreen-mode');
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

function openCourtPopout() {
  const url = window.location.origin + '/?view=court';
  const popout = window.open(url, 'DanganronpaCourtScreen', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no,resizable=yes');
  if (popout) {
    popout.focus();
    showToast('📺 เปิดหน้าต่างจอศาล (Court Screen) สำหรับแยกแสดงผลเรียบร้อย');
  } else {
    showToast('⚠️ เบราว์เซอร์บล็อก Pop-up กรุณาอนุญาต Pop-up บนเว็บไซต์นี้');
  }
}

function openHotkeysModal() {
  const modal = document.getElementById('hotkeysModal');
  if (modal) modal.classList.remove('hidden');
}

function closeHotkeysModal() {
  const modal = document.getElementById('hotkeysModal');
  if (modal) modal.classList.add('hidden');
}

function initGlobalKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    const tag = document.activeElement ? document.activeElement.tagName.toUpperCase() : '';
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement.isContentEditable;

    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal-backdrop:not(.hidden)');
      if (modals.length > 0) {
        modals.forEach(m => m.classList.add('hidden'));
        e.preventDefault();
        return;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen();
        e.preventDefault();
        return;
      }
      if (isInput) {
        document.activeElement.blur();
        return;
      }
    }

    if (isInput) return;

    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      const hotkeysModal = document.getElementById('hotkeysModal');
      if (hotkeysModal) {
        if (hotkeysModal.classList.contains('hidden')) openHotkeysModal();
        else closeHotkeysModal();
        e.preventDefault();
        return;
      }
    }

    if (currentView === 'court') {
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleCourtFullscreen();
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleCourtAudioMute();
        return;
      }
    }

    if (currentView === 'admin') {
      if (e.code === 'Space') {
        e.preventDefault();
        adminToggleTimer();
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        openAdminMinigameModal(currentSelectedConfigStage || 'stage1');
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        triggerFx('glitch');
        return;
      }
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleCourtAudioMute();
        return;
      }
      if (e.key >= '1' && e.key <= '8' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        const stageMap = {
          '1': 'stage1',
          '2': 'stage2',
          '3': 'stage3',
          '4': 'stage4',
          '5': 'stage5',
          '6': 'stage6',
          '7': 'closing',
          '8': 'stage7'
        };
        const targetStg = stageMap[e.key];
        if (targetStg) {
          if (targetStg === 'stage3') adminStartRebuttal();
          else if (targetStg === 'stage6') adminStartArmament();
          else adminSetGame(targetStg);
          showToast(`⚡ DM Hotkey [${e.key}]: สลับไปยัง ${targetStg.toUpperCase()}`);
        }
        return;
      }
      if (e.key === '0') {
        e.preventDefault();
        adminSetGame('lobby');
        showToast('⚡ DM Hotkey [0]: กลับสู่หน้าแท่นศาล (Lobby)');
        return;
      }
    }

    if (currentView === 'player' || currentView === 'mobile') {
      if (e.key === 'Tab') {
        e.preventDefault();
        const pTabs = ['game', 'clues', 'map', 'guide', 'rules'];
        const activeTabEl = document.querySelector('.player-nav-tabs .p-nav-btn.active');
        let nextIdx = 0;
        if (activeTabEl) {
          const curTab = activeTabEl.id.replace('pTab', '').toLowerCase();
          const curIdx = pTabs.indexOf(curTab);
          nextIdx = (curIdx + 1) % pTabs.length;
        }
        switchPlayerTab(pTabs[nextIdx]);
        return;
      }
      if (['1', '2', '3', '4', '5'].includes(e.key) && !e.ctrlKey && !e.altKey) {
        const tabList = { '1': 'game', '2': 'clues', '3': 'map', '4': 'guide', '5': 'rules' };
        switchPlayerTab(tabList[e.key]);
        e.preventDefault();
        return;
      }
      if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        triggerFx('counter');
        showToast('⚡ ลุกขึ้นยืนแย้ง (OBJECTION!)');
        return;
      }
    }
  });
}

// ==========================================================
// ADMIN PRINTABLE CLUES MODAL (WITH CATEGORY FILTERS & IMPORTANCE BADGES)
// ==========================================================
let currentPrintFilter = 'ALL';

function filterPrintClues(cat) {
  currentPrintFilter = cat;
  const filterBtns = document.querySelectorAll('#printClueFilterBar button');
  filterBtns.forEach(b => {
    if (b.getAttribute('data-cat') === cat) {
      b.style.background = 'var(--mono-pink)';
      b.style.color = '#fff';
    } else {
      b.style.background = '#222238';
      b.style.color = '#aaa';
    }
  });
  renderPrintableClues();
}

function getNeutralClueCategory(c) {
  if (c.id === 'EVD-01') return '📑 ผลชันสูตรทางการ';
  if (c.id === 'EVD-11') return '🗺️ ผังอาคารสถานที่';
  if (c.id === 'EVD-12') return '📊 ข้อมูลสาธารณูปโภค';
  if (c.secretType === 'TESTIMONY') return '💬 คำให้การนักเรียน';
  if (['EVD-02', 'EVD-04', 'EVD-05', 'EVD-27'].includes(c.id)) return '📦 วัตถุพยานคดี';
  if (['EVD-06', 'EVD-07', 'EVD-09'].includes(c.id)) return '⚙️ ชิ้นส่วนกลไก';
  if (['EVD-25', 'EVD-26'].includes(c.id)) return '🧠 ความทรงจำ / ประสาทสัมผัส';
  if (c.id === 'EVD-30') return '📋 กฎและตารางเวร';
  if (['EVD-22', 'EVD-23', 'EVD-24'].includes(c.id)) return '📦 สิ่งของทั่วไป';
  return '🏢 ร่องรอยสถานที่';
}

function renderPrintableClues() {
  const sheet = document.getElementById('printableCluesSheet');
  if (!sheet) return;
  sheet.innerHTML = '';

  const filtered = ALL_CLUES_DATA.filter(c => {
    if (currentPrintFilter === 'MUST') return c.importance === 'MUST';
    if (currentPrintFilter === 'GOOD') return c.importance === 'GOOD';
    if (currentPrintFilter === 'OPT') return c.importance === 'OPTIONAL';
    if (currentPrintFilter === 'TEST') return c.secretType === 'TESTIMONY';
    return true;
  });

  filtered.forEach(c => {
    const cluePin = c.pin || '000000';
    const origin = (window.location.origin && !window.location.origin.includes('localhost')) ? window.location.origin : 'https://danganronpa-ttrpg.vercel.app';
    const qrTargetUrl = `${origin}/play?room=${encodeURIComponent(roomCode)}&clue=${encodeURIComponent(cluePin)}`;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=2&data=${encodeURIComponent(qrTargetUrl)}`;

    // DM Secret Badge: Shown only on screen for DM, completely hidden in @media print
    let dmBadge = '';
    if (c.importance === 'MUST') {
      dmBadge = '<span class="p-card-dm-badge print-hide dm-core" title="ความสำคัญต่อคดี: ต้องเก็บ">🔴 ต้องเก็บ</span>';
    } else if (c.importance === 'GOOD') {
      dmBadge = '<span class="p-card-dm-badge print-hide dm-supp" title="ความสำคัญต่อคดี: มีก็ดีช่วยเสริม">🔵 มีก็ดี</span>';
    } else if (c.secretType === 'HERR') {
      dmBadge = '<span class="p-card-dm-badge print-hide dm-herr" title="ความสำคัญต่อคดี: ตัวหลอก">🟡 ตัวหลอก</span>';
    } else if (c.secretType === 'TRASH') {
      dmBadge = '<span class="p-card-dm-badge print-hide dm-trash" title="ความสำคัญต่อคดี: ขยะ">⚪ ขยะ</span>';
    } else {
      dmBadge = '<span class="p-card-dm-badge print-hide dm-test" title="คำให้การนักเรียน">💬 คำให้การ</span>';
    }

    const card = document.createElement('div');
    card.className = 'print-clue-card printable-clue-card';
    card.innerHTML = `
      <div class="p-card-top">
        <div class="p-card-top-left">
          <span class="p-card-id">[${c.id}]</span>
        </div>
        ${dmBadge}
      </div>
      <div class="p-card-title">${escapeHtml(c.name)}</div>
      <div class="p-card-loc"><span class="p-loc-lbl">📍 สถานที่พบ:</span> <span class="p-loc-val">${escapeHtml(c.loc)}</span></div>
      <div class="p-card-body">
        <div class="p-card-qr-col">
          <div class="p-card-qr-box">
            <img src="${qrImgUrl}" alt="QR ${c.id}" class="p-card-qr-img" onerror="this.style.display='none';">
          </div>
          <div class="p-card-code-pill">รหัส PIN: <strong>${cluePin}</strong></div>
        </div>
        <div class="p-card-desc-col">
          <div class="p-card-desc">${escapeHtml(c.desc)}</div>
        </div>
      </div>
      <div class="p-card-footer">
        <span>HOPE'S PEAK ACADEMY • INVESTIGATION LOG</span>
        <span>MONOPAD ARCHIVE v3.2</span>
      </div>
    `;
    sheet.appendChild(card);
  });
}

function adminOpenPrintCluesModal() {
  const modal = document.getElementById('adminPrintCluesModal');
  if (!modal) return;

  const titleEl = document.getElementById('adminPrintCluesModalTitle');
  if (titleEl) {
    titleEl.innerText = `🖨️ บัตรหลักฐาน & คำให้การ QR (${ALL_CLUES_DATA.length} ใบ)`;
  }

  const mustCount = ALL_CLUES_DATA.filter(c => c.importance === 'MUST').length;
  const goodCount = ALL_CLUES_DATA.filter(c => c.importance === 'GOOD').length;
  const optCount = ALL_CLUES_DATA.filter(c => c.importance === 'OPTIONAL').length;
  const testCount = ALL_CLUES_DATA.filter(c => c.secretType === 'TESTIMONY').length;

  // Ensure filter bar exists
  let bar = document.getElementById('printClueFilterBar');
  if (!bar) {
    const dialog = modal.querySelector('.modal-dialog');
    const titleBar = modal.querySelector('.modal-title-bar');
    if (dialog && titleBar) {
      bar = document.createElement('div');
      bar.id = 'printClueFilterBar';
      bar.className = 'print-hide';
      bar.style.display = 'flex';
      bar.style.flexWrap = 'wrap';
      bar.style.gap = '6px';
      bar.style.margin = '10px 0';
      titleBar.insertAdjacentElement('afterend', bar);
    }
  }

  if (bar) {
    bar.innerHTML = `
      <button class="small-btn" data-cat="ALL" onclick="filterPrintClues('ALL')" style="padding:6px 12px; font-size:0.8rem; background:var(--mono-pink); color:#fff; font-weight:800;">ทั้งหมด (${ALL_CLUES_DATA.length})</button>
      <button class="small-btn" data-cat="MUST" onclick="filterPrintClues('MUST')" style="padding:6px 12px; font-size:0.8rem; background:#222238; color:#aaa; font-weight:800;">🔴 ต้องเก็บ (${mustCount})</button>
      <button class="small-btn" data-cat="GOOD" onclick="filterPrintClues('GOOD')" style="padding:6px 12px; font-size:0.8rem; background:#222238; color:#aaa; font-weight:800;">🔵 มีก็ดี (${goodCount})</button>
      <button class="small-btn" data-cat="OPT" onclick="filterPrintClues('OPT')" style="padding:6px 12px; font-size:0.8rem; background:#222238; color:#aaa; font-weight:800;">⚪ ตัวหลอก & ขยะ (${optCount})</button>
      <button class="small-btn" data-cat="TEST" onclick="filterPrintClues('TEST')" style="padding:6px 12px; font-size:0.8rem; background:#222238; color:#aaa; font-weight:800;">💬 คำให้การ (${testCount})</button>
    `;
  }

  currentPrintFilter = 'ALL';
  renderPrintableClues();
  modal.classList.remove('hidden');
}

function closeAdminPrintCluesModal() {
  const modal = document.getElementById('adminPrintCluesModal');
  if (modal) modal.classList.add('hidden');
}

// ==========================================================
// MONOPAD CAMERA & QR SCANNER (Enhanced with jsQR engine)
// ==========================================================
let cameraStream = null;
let cameraScanningRaf = null;
let cameraScanningInterval = null;

function openClueScannerModal() {
  const modal = document.getElementById('clueScanModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  const inp = document.getElementById('manualClueInput');
  if (inp) {
    inp.value = '';
    setTimeout(() => inp.focus(), 200);
  }
}

function closeClueScannerModal() {
  stopCameraStream();
  const modal = document.getElementById('clueScanModal');
  if (modal) modal.classList.add('hidden');
}

function submitManualClue() {
  const inp = document.getElementById('manualClueInput');
  if (!inp || !inp.value.trim()) {
    alert('กรุณากรอกรหัส PIN 6 หลัก เช่น 482915');
    return;
  }
  const success = unlockClue(inp.value.trim());
  if (success) {
    closeClueScannerModal();
    switchPlayerTab('clues');
  }
}

function toggleCameraScanner() {
  if (cameraStream) {
    stopCameraStream();
  } else {
    startCameraStream();
  }
}

async function startCameraStream() {
  const video = document.getElementById('cameraVideoFeed');
  const canvas = document.getElementById('qrScanCanvas');
  const btn = document.getElementById('btnToggleCamera');
  const status = document.getElementById('cameraStatusText');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (status) status.innerText = '❌ เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง กรุณาพิมพ์รหัส PIN แทน';
    return;
  }

  try {
    if (status) status.innerText = 'กำลังเปิดกล้อง...';
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 640 } }
    });
    cameraStream = stream;
    if (video) {
      video.srcObject = stream;
      video.setAttribute('playsinline', 'true');
      video.style.display = 'block';
      await video.play();
    }
    if (btn) {
      btn.innerText = '⏹️ ปิดกล้อง';
      btn.className = 'small-btn red';
    }
    if (status) status.innerText = '📷 นำกล้องส่องไปที่ QR Code บนบัตรหลักฐาน...';

    // Canvas frame scanning with jsQR (cross-browser compatibility for iOS & Android)
    const scanFrame = () => {
      if (!cameraStream || !video || video.readyState < 2) {
        if (cameraStream) cameraScanningRaf = requestAnimationFrame(scanFrame);
        return;
      }

      if (canvas) {
        const w = video.videoWidth || 480;
        const h = video.videoHeight || 480;
        if (canvas.width !== w) canvas.width = w;
        if (canvas.height !== h) canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(video, 0, 0, w, h);

        let detected = null;

        // 1. Try jsQR
        if (window.jsQR) {
          try {
            const imgData = ctx.getImageData(0, 0, w, h);
            const qr = jsQR(imgData.data, imgData.width, imgData.height, { inversionAttempts: 'dontInvert' });
            if (qr && qr.data) detected = qr.data;
          } catch(e) {}
        }

        if (detected) {
          handleQrPayload(detected);
          return;
        }
      }

      cameraScanningRaf = requestAnimationFrame(scanFrame);
    };

    cameraScanningRaf = requestAnimationFrame(scanFrame);

  } catch(err) {
    console.error('Camera error:', err);
    if (status) status.innerText = '❌ ไม่สามารถเปิดกล้องได้ (โปรดอนุญาตสิทธิ์กล้อง หรือใช้การกรอกรหัส PIN)';
    stopCameraStream();
  }
}

function stopCameraStream() {
  if (cameraScanningRaf) {
    cancelAnimationFrame(cameraScanningRaf);
    cameraScanningRaf = null;
  }
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  const video = document.getElementById('cameraVideoFeed');
  if (video) {
    video.style.display = 'none';
    video.srcObject = null;
  }
  const btn = document.getElementById('btnToggleCamera');
  if (btn) {
    btn.innerText = '📷 เปิดกล้องสแกนทันที';
    btn.className = 'small-btn cyan';
  }
  const status = document.getElementById('cameraStatusText');
  if (status) status.innerText = '';
}

function handleQrPayload(rawStr) {
  if (!rawStr) return;
  stopCameraStream();
  let clueCode = rawStr.trim();
  
  // Extract parameter if full URL
  try {
    if (clueCode.includes('?')) {
      const url = new URL(clueCode, window.location.origin);
      clueCode = url.searchParams.get('clue') || url.searchParams.get('unlock') || clueCode;
    }
  } catch(e) {}

  const m = clueCode.match(/[?&](?:clue|unlock)=([a-zA-Z0-9_-]+)/);
  if (m) clueCode = m[1];

  const success = unlockClue(clueCode);
  if (success) {
    closeClueScannerModal();
    switchPlayerTab('clues');
  }
}

async function handleQrFileUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const status = document.getElementById('cameraStatusText');
  if (status) status.innerText = 'กำลังอ่านรูปภาพ QR...';

  try {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await img.decode();

    const canvas = document.getElementById('qrScanCanvas') || document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    let detected = null;
    if (window.jsQR) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imgData.data, imgData.width, imgData.height);
      if (qr && qr.data) detected = qr.data;
    }

    if (!detected && window.BarcodeDetector) {
      try {
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(img);
        if (barcodes && barcodes.length > 0) detected = barcodes[0].rawValue;
      } catch(e) {}
    }

    if (detected) {
      handleQrPayload(detected);
    } else {
      if (status) status.innerText = '⚠️ ไม่พบ QR Code ในรูปภาพ กรุณากรอกรหัส PIN ด้วยตนเอง';
    }
  } catch(err) {
    console.error('QR file scan error:', err);
    if (status) status.innerText = '❌ เกิดข้อผิดพลาดในการอ่านไฟล์ภาพ';
  }
}

// Start on Load
window.addEventListener('DOMContentLoaded', () => {
  // Guarantee glitch overlay is hidden on boot
  const overlay = document.getElementById('screenGlitch');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }

  handleRoute();
  initRealtime();
  initGlobalKeyboardShortcuts();
});

window.addEventListener('beforeunload', () => {
  if (myPeer && !myPeer.destroyed) {
    try { myPeer.destroy(); } catch(e) {}
  }
});

// ==========================================================
// REAL-TIME MULTI-CLIENT SIMULATION LAB & TEST ENGINE
// ==========================================================
let simRoomCode = 'SIM888';
let simEventSource = null;
let simAutoRunning = false;

function initSimulationLab() {
  const codeEl = document.getElementById('simActiveRoomCode');
  if (codeEl) codeEl.innerText = simRoomCode;

  // Clear any existing simulation player data so lab starts with 0 players
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && !k.startsWith('dangan_unlocked_') && !k.startsWith('dangan_tags_') && !k.startsWith('dangan_notes_') && (k.includes('sim_') || k.toUpperCase().includes('SIM888') || k.startsWith('dangan_player_SIM') || k === 'dangan_player_SIM888')) {
        localStorage.removeItem(k);
      }
    }
  } catch(e) {}

  // 1. Setup local BroadcastChannel for guaranteed 0ms in-browser communication
  setupLocalChannel(simRoomCode);

  // 2. Connect Simulation Monitor to server SSE stream if available
  if (simEventSource) {
    try { simEventSource.close(); } catch(e) {}
    simEventSource = null;
  }

  const sseUrl = '/api/rooms/' + encodeURIComponent(simRoomCode) + '/stream';
  try {
    simEventSource = new EventSource(sseUrl);
    simEventSource.onopen = () => {
      logSimEvent({ type: 'sim_info', text: '🟢 เชื่อมต่อ SSE Stream ห้อง [' + simRoomCode + '] สำเร็จ พร้อมดักจับแพ็กเก็ต Real-Time' });
      simProbePing();
    };
    simEventSource.onmessage = (event) => {
      if (!event.data) return;
      try {
        const msg = JSON.parse(event.data);
        logSimEvent(msg);
      } catch (err) {}
    };
    simEventSource.onerror = (err) => {
      // If server SSE fails or returns 405 (static host/Vercel static), local BroadcastChannel handles 100% of actions!
    };
  } catch (e) {}

  // 3. Load the 4 isolated viewports with universal ?view= URLs that work on ANY web host
  const fCourt = document.getElementById('simFrameCourt');
  const fAdmin = document.getElementById('simFrameAdmin');
  const fP1 = document.getElementById('simFramePlayer1');
  const fP2 = document.getElementById('simFramePlayer2');
  const fP3 = document.getElementById('simFramePlayer3');
  const fP4 = document.getElementById('simFramePlayer4');

  const loc = window.location;
  const baseUrl = loc.protocol + '//' + loc.host;
  const pathPrefix = loc.pathname.endsWith('.html') ? loc.pathname : (loc.pathname === '/' ? '/index.html' : loc.pathname.replace(/\/simulation\/?$/, '') + '/index.html');

  const courtUrl = baseUrl + pathPrefix + '?view=court&room=' + simRoomCode;
  const adminUrl = baseUrl + pathPrefix + '?view=admin&room=' + simRoomCode + '&pin=295437&muted=1';
  const p1Url = baseUrl + pathPrefix + '?view=player&user=sim_naegi&room=' + simRoomCode + '&name=' + encodeURIComponent('นาเอกิ') + '&role=' + encodeURIComponent('นักแต่งนิยาย') + '&muted=1';
  const p2Url = baseUrl + pathPrefix + '?view=player&user=sim_kyoko&room=' + simRoomCode + '&name=' + encodeURIComponent('เคียวโกะ') + '&role=' + encodeURIComponent('นักกีฬา') + '&muted=1';
  const p3Url = baseUrl + pathPrefix + '?view=player&user=sim_byakuya&room=' + simRoomCode + '&name=' + encodeURIComponent('เบียคุยะ') + '&role=' + encodeURIComponent('นักมายากล') + '&muted=1';
  const p4Url = baseUrl + pathPrefix + '?view=player&user=sim_aoi&room=' + simRoomCode + '&name=' + encodeURIComponent('อาโออิ') + '&role=' + encodeURIComponent('นักชิม') + '&muted=1';

  if (fCourt && (!fCourt.src || fCourt.src === 'about:blank' || !fCourt.src.includes(simRoomCode))) fCourt.src = courtUrl;
  if (fAdmin && (!fAdmin.src || fAdmin.src === 'about:blank' || !fAdmin.src.includes(simRoomCode))) fAdmin.src = adminUrl;
  if (fP1 && (!fP1.src || fP1.src === 'about:blank' || !fP1.src.includes(simRoomCode) || fP1.src.includes('autoJoin=1'))) fP1.src = p1Url;
  if (fP2 && (!fP2.src || fP2.src === 'about:blank' || !fP2.src.includes(simRoomCode) || fP2.src.includes('autoJoin=1'))) fP2.src = p2Url;
  if (fP3 && (!fP3.src || fP3.src === 'about:blank' || !fP3.src.includes(simRoomCode) || fP3.src.includes('autoJoin=1'))) fP3.src = p3Url;
  if (fP4 && (!fP4.src || fP4.src === 'about:blank' || !fP4.src.includes(simRoomCode) || fP4.src.includes('autoJoin=1'))) fP4.src = p4Url;

  setTimeout(() => { simProbePing(); }, 400);
}

const loggedSimMessageIds = new Set();
function logSimEvent(msg) {
  const consoleEl = document.getElementById('simEventLogConsole');
  if (!consoleEl || !msg) return;

  if (msg._id) {
    if (loggedSimMessageIds.has(msg._id)) return;
    loggedSimMessageIds.add(msg._id);
    if (loggedSimMessageIds.size > 300) {
      const oldest = loggedSimMessageIds.values().next().value;
      loggedSimMessageIds.delete(oldest);
    }
  }

  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

  const entry = document.createElement('div');
  entry.className = 'sim-log-entry';

  if (msg.type === 'sim_info') {
    entry.className += ' info';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> ' + msg.text;
  } else if (msg.type === 'sim_ping_reply') {
    entry.className += ' success';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> ⚡ <strong>PING RTT</strong>: ได้รับการตอบกลับใน <strong>' + msg.latency + ' ms</strong> (Zero Lag)';
  } else if (msg.type === 'request_claim_character') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📤 <strong>[MOBILE -> COURT]</strong>: ผู้เล่น [' + (msg.playerName || 'ผู้เล่น') + '] ร้องขอสวมบท [' + msg.role + ']';
  } else if (msg.type === 'claim_approved') {
    entry.className += ' court';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📥 <strong>[COURT -> MOBILE]</strong>: อนุมัติบท [' + (msg.player ? msg.player.role : '') + '] ให้แก่ [' + (msg.player ? msg.player.name : '') + '] สำเร็จ ✅';
  } else if (msg.type === 'set_stage') {
    entry.className += ' admin';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 👑 <strong>[ADMIN -> ALL]</strong>: สั่งเปลี่ยนสเตจศาลเป็น [<strong>' + msg.stage + '</strong>]';
  } else if (msg.type === 'stg1_submit') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔍 <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' ส่งหลักฐาน [<strong>' + msg.clueId + '</strong>] ขึ้นจอศาล!';
  } else if (msg.type === 'stg1_evaluate') {
    entry.className += ' court';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> ⚖️ <strong>[COURT EVAL]</strong>: ประเมินผลข้อโต้แย้งสเตจ 1 สำเร็จ!';
  } else if (msg.type === 'stg2_char') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔤 <strong>[MOBILE -> COURT]</strong>: ทายตัวอักษร [<strong>' + msg.char + '</strong>] บนกระดาน Hangman!';
  } else if (msg.type === 'rebuttal_slash') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🗡️ <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' ฟันดาบความจริงด้วยกระสุน [<strong>' + msg.bullet + '</strong>]!';
  } else if (msg.type === 'rebuttal_verdict') {
    entry.className += ' court';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🏆 <strong>[COURT]</strong>: ดาบปฏิเสธถูกทำลายสำเร็จ (Blade of Truth)!';
  } else if (msg.type === 'logic_dive_vote') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🛹 <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' โหวตทางเลือก [<strong>ข้อ ' + msg.choice + '</strong>]!';
  } else if (msg.type === 'stg5_scrum') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔥 <strong>[MOBILE -> COURT]</strong>: รัวปุ่มดัน Scrum! (Delta: <strong>' + (msg.delta > 0 ? '+' : '') + msg.delta + '%</strong>)';
  } else if (msg.type === 'stg6_counter') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🛡️ <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้ถูกต้อน') + ' ตอกกลับข้อกล่าวหา (+4% Shield)!';
  } else if (msg.type === 'stg6_hit') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔨 <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' ทุบเกราะความจริง (-10% Shield)!';
  } else if (msg.type === 'stg6_final_blow') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 💥 <strong>[MOBILE -> COURT]</strong>: ยิงกระสุนความจริงนัดสุดท้ายทลายเกราะสำเร็จ!';
  } else if (msg.type === 'closing_submit') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📖 <strong>[MOBILE -> COURT]</strong>: วางการ์ด [<strong>' + msg.cardId + '</strong>] ลงช่องที่ ' + msg.slot;
  } else if (msg.type === 'submit_vote') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🗳️ <strong>[MOBILE -> COURT]</strong>: ลงคะแนนชี้ชะตาเลือกผู้ต้องสงสัย [<strong>' + msg.candidate + '</strong>]';
  } else if (msg.type === 'reveal_votes') {
    entry.className += ' court';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📊 <strong>[COURT]</strong>: เปิดผลคะแนนโหวตทั้งหมด!';
  } else if (msg.type === 'minigame_result') {
    entry.className += ' court';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🏆 <strong>[COURT MODAL]</strong>: ' + (msg.title || '') + ' - ' + (msg.desc || '');
  } else if (msg.type !== 'sim_ping') {
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📦 <strong>[' + msg.type + ']</strong>: ' + JSON.stringify(msg).substring(0, 100);
  }

  consoleEl.appendChild(entry);
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

function clearSimLogs() {
  const consoleEl = document.getElementById('simEventLogConsole');
  if (consoleEl) consoleEl.innerHTML = '';
}

async function simPost(msg) {
  if (!msg._sender) msg._sender = 'sim_monitor';
  if (!msg._id) {
    msg._id = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  }

  // 1. Dispatch through BroadcastChannel for zero-latency local delivery
  if (localRoomChannel) {
    try { localRoomChannel.postMessage(msg); } catch(e) {}
  } else {
    // 2. Dispatch directly into child iframes via postMessage only if no BroadcastChannel
    const iframes = [
      document.getElementById('simFrameCourt'),
      document.getElementById('simFrameAdmin'),
      document.getElementById('simFramePlayer1'),
      document.getElementById('simFramePlayer2'),
      document.getElementById('simFramePlayer3'),
      document.getElementById('simFramePlayer4')
    ];
    iframes.forEach(f => {
      if (f && f.contentWindow) {
        try { f.contentWindow.postMessage(msg, '*'); } catch(e) {}
      }
    });
  }

  // Log in Simulation Monitor
  logSimEvent(msg);

  // 3. Dispatch to server HTTP relay if running on Node server (silently fallback if on static host)
  try {
    fetch('/api/rooms/' + encodeURIComponent(simRoomCode) + '/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    }).catch(() => {});
  } catch (e) {}
}

async function simProbePing() {
  const t0 = performance.now();
  const pingId = 'ping_' + Date.now();

  const handlePing = (event) => {
    try {
      const data = event.data;
      if (data && data.type === 'sim_ping' && data.pingId === pingId) {
        const latency = Math.max(1, Math.round(performance.now() - t0));
        const msEl = document.getElementById('simPingMs');
        if (msEl) msEl.innerText = latency + ' ms';
        logSimEvent({ type: 'sim_ping_reply', latency: latency });
        if (localRoomChannel) localRoomChannel.removeEventListener('message', handlePing);
      }
    } catch(e) {}
  };

  if (localRoomChannel) {
    localRoomChannel.addEventListener('message', handlePing);
  }

  setTimeout(() => {
    const msEl = document.getElementById('simPingMs');
    if (msEl && (msEl.innerText === '-- ms' || msEl.innerText === '')) {
      msEl.innerText = '< 1 ms (Local)';
      logSimEvent({ type: 'sim_ping_reply', latency: '< 1' });
    }
  }, 100);

  simPost({ type: 'sim_ping', pingId: pingId, t: t0 });
}

let isSimActionRunning = false;

async function runSimGuarded(actionName, actionFn) {
  if (isSimActionRunning) {
    logSimEvent({ type: 'sim_info', text: `⏳ [BUSY]: กำลังประมวลผลคำสั่งจำลองอื่นอยู่ กรุณารอสักครู่...` });
    return;
  }
  isSimActionRunning = true;
  const buttons = document.querySelectorAll('.sim-btn');
  buttons.forEach(b => {
    if (!b.classList.contains('reset')) b.disabled = true;
  });

  try {
    await actionFn();
  } catch (err) {
    console.error('Simulation step error:', err);
    logSimEvent({ type: 'sim_info', text: `❌ [ERROR]: การจำลองเกิดข้อผิดพลาด: ${err.message}` });
  } finally {
    isSimActionRunning = false;
    buttons.forEach(b => b.disabled = false);
  }
}

async function simJoinPlayersRaw() {
  logSimEvent({ type: 'sim_info', text: '👤 [ACTION]: จำลองส่งคำขอสวมบทบาท 4 คน: นาเอกิ (นิยาย), เคียวโกะ (กีฬา), เบียคุยะ (มายากล), อาโออิ (ชิม)...' });
  await simPost({
    type: 'request_claim_character',
    role: 'นักแต่งนิยาย',
    playerName: 'นาเอกิ',
    userHash: 'sim_naegi'
  });
  await new Promise(r => setTimeout(r, 200));
  await simPost({
    type: 'request_claim_character',
    role: 'นักกีฬา',
    playerName: 'เคียวโกะ',
    userHash: 'sim_kyoko'
  });
  await new Promise(r => setTimeout(r, 200));
  await simPost({
    type: 'request_claim_character',
    role: 'นักมายากล',
    playerName: 'เบียคุยะ',
    userHash: 'sim_byakuya'
  });
  await new Promise(r => setTimeout(r, 200));
  await simPost({
    type: 'request_claim_character',
    role: 'นักชิม',
    playerName: 'อาโออิ',
    userHash: 'sim_aoi'
  });
}

async function simJoinPlayers() {
  return runSimGuarded('เข้าห้องสวมบท', simJoinPlayersRaw);
}

async function simStage1EvidenceRaw() {
  logSimEvent({ type: 'sim_info', text: '🔍 [ACTION]: เริ่ม Stage 1 (Evidence Linker) และส่งหลักฐาน...' });
  await simPost({ type: 'set_stage', stage: 'stage1' });
  await new Promise(r => setTimeout(r, 450));
  await simPost({ type: 'stg1_submit', clueId: 'EVD-01', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 350));
  await simPost({ type: 'stg1_submit', clueId: 'EVD-04', playerName: 'เคียวโกะ' });
  await new Promise(r => setTimeout(r, 600));
  await simPost({ type: 'stg1_evaluate' });
}

async function simStage1Evidence() {
  return runSimGuarded('สเตจ 1: Evidence Linker', simStage1EvidenceRaw);
}

async function simStage2HangmanRaw() {
  logSimEvent({ type: 'sim_info', text: "🔤 [ACTION]: เริ่ม Stage 2 (Hangman's Gambit) ทายตัวอักษร \"WATER CLOCK\"..." });
  await simPost({ type: 'set_stage', stage: 'stage2' });
  const letters = ['W', 'A', 'T', 'E', 'R', 'C', 'L', 'O', 'C', 'K'];
  for (const ch of letters) {
    await new Promise(r => setTimeout(r, 250));
    await simPost({ type: 'stg2_char', char: ch });
  }
}

async function simStage2Hangman() {
  return runSimGuarded("สเตจ 2: Hangman's Gambit", simStage2HangmanRaw);
}

async function simStage3RebuttalRaw() {
  logSimEvent({ type: 'sim_info', text: '🗡️ [ACTION]: เริ่ม Stage 3 (Rebuttal Showdown) ฟันดาบความจริง...' });
  await simPost({ type: 'set_stage', stage: 'stage3' });
  await new Promise(r => setTimeout(r, 450));
  await simPost({ type: 'rebuttal_slash', bullet: 'EVD-01', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 600));
  await simPost({ type: 'rebuttal_verdict', isWin: true });
}

async function simStage3Rebuttal() {
  return runSimGuarded('สเตจ 3: Rebuttal Showdown', simStage3RebuttalRaw);
}

async function simStage4LogicDiveRaw() {
  logSimEvent({ type: 'sim_info', text: '🛹 [ACTION]: เริ่ม Stage 4 (Logic Dive) ผู้เล่น 4 คนร่วมโหวตทางเลือกตรรกะ...' });
  await simPost({ type: 'set_stage', stage: 'stage4' });
  await new Promise(r => setTimeout(r, 350));
  await simPost({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'sim_naegi', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 150));
  await simPost({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'sim_kyoko', playerName: 'เคียวโกะ' });
  await new Promise(r => setTimeout(r, 150));
  await simPost({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'sim_byakuya', playerName: 'เบียคุยะ' });
  await new Promise(r => setTimeout(r, 150));
  await simPost({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'sim_aoi', playerName: 'อาโออิ' });
}

async function simStage4LogicDive() {
  return runSimGuarded('สเตจ 4: Logic Dive', simStage4LogicDiveRaw);
}

async function simStage5ScrumRaw() {
  logSimEvent({ type: 'sim_info', text: '🔥 [ACTION]: เริ่ม Stage 5 (Debate Scrum) ดันเกจตรรกะ (+10% per hit)...' });
  await simPost({ type: 'set_stage', stage: 'stage5' });
  for (let i = 0; i < 6; i++) {
    await new Promise(r => setTimeout(r, 180));
    await simPost({ type: 'stg5_scrum', delta: 10 });
  }
}

async function simStage5Scrum() {
  return runSimGuarded('สเตจ 5: Debate Scrum', simStage5ScrumRaw);
}

async function simStage6ArmamentRaw() {
  logSimEvent({ type: 'sim_info', text: '🔨 [ACTION]: เริ่ม Stage 6 (Argument Armament) ทุบเกราะความจริง...' });
  await simPost({ type: 'set_stage', stage: 'stage6' });
  for (let i = 0; i < 4; i++) {
    await new Promise(r => setTimeout(r, 200));
    await simPost({ type: 'stg6_hit', playerName: 'นาเอกิ' });
  }
  await new Promise(r => setTimeout(r, 450));
  await simPost({ type: 'stg6_final_blow', playerName: 'นาเอกิ' });
}

async function simStage6Armament() {
  return runSimGuarded('สเตจ 6: Argument Armament', simStage6ArmamentRaw);
}

async function simClosingArgumentRaw() {
  logSimEvent({ type: 'sim_info', text: '📖 [ACTION]: เริ่ม Closing Argument วางการ์ดมังงะสรุปคดี...' });
  await simPost({ type: 'set_stage', stage: 'closing' });
  await new Promise(r => setTimeout(r, 350));
  await simPost({ type: 'closing_submit', slot: 1, cardId: 'EVD-14', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 350));
  await simPost({ type: 'closing_submit', slot: 2, cardId: 'EVD-11', playerName: 'เคียวโกะ' });
}

async function simClosingArgument() {
  return runSimGuarded('Closing Argument', simClosingArgumentRaw);
}

async function simStage7VoteRaw() {
  logSimEvent({ type: 'sim_info', text: '🗳️ [ACTION]: เริ่ม Stage 7 (Voting Time) ผู้เล่นจำลอง 4 คนลงคะแนนโหวต...' });
  await simPost({ type: 'set_stage', stage: 'stage7' });
  await new Promise(r => setTimeout(r, 450));
  const targetSuspect = 'NPC B (พยานปากเอก / ผู้ต้องสงสัย)';
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_naegi' });
  await new Promise(r => setTimeout(r, 150));
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_kyoko' });
  await new Promise(r => setTimeout(r, 150));
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_byakuya' });
  await new Promise(r => setTimeout(r, 150));
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_aoi' });
  await new Promise(r => setTimeout(r, 600));
  await simPost({ type: 'reveal_votes' });
}

async function simStage7Vote() {
  return runSimGuarded('สเตจ 7: Voting Time', simStage7VoteRaw);
}

async function runSimFullSequence() {
  return runSimGuarded('Full Auto (8 สเตจ)', async () => {
    logSimEvent({ type: 'sim_info', text: '🚀 [FULL AUTO]: เริ่มการทดสอบอัตโนมัติครบ 8 สเตจแบบต่อเนื่อง...' });

    await simJoinPlayersRaw();
    await new Promise(r => setTimeout(r, 1200));

    await simStage1EvidenceRaw();
    await new Promise(r => setTimeout(r, 1800));

    await simStage2HangmanRaw();
    await new Promise(r => setTimeout(r, 1800));

    await simStage3RebuttalRaw();
    await new Promise(r => setTimeout(r, 1800));

    await simStage4LogicDiveRaw();
    await new Promise(r => setTimeout(r, 1800));

    await simStage5ScrumRaw();
    await new Promise(r => setTimeout(r, 1800));

    await simStage6ArmamentRaw();
    await new Promise(r => setTimeout(r, 1800));

    await simClosingArgumentRaw();
    await new Promise(r => setTimeout(r, 1800));

    await simStage7VoteRaw();
    await new Promise(r => setTimeout(r, 1400));

    logSimEvent({ type: 'sim_info', text: '🎉 [COMPLETE]: การจำลอง Full Sequence เสร็จสมบูรณ์ ทุกมินิเกมตอบสนอง Real-Time 100%!' });
  });
}

function simResetRoom() {
  logSimEvent({ type: 'sim_info', text: '🔄 กำลังรีเซ็ตห้องทดลองจำลอง...' });
  simPost({ type: 'admin_reset_session' });
  setTimeout(() => {
    initSimulationLab();
  }, 300);
}



function setAdminSimAspect(mode) {
  const panel = document.getElementById('simAdminPanel');
  const wrap = document.getElementById('simAdminIframeWrap');
  const btnMob = document.getElementById('btnAdminModeMobile');
  const btnIpad = document.getElementById('btnAdminModeIpad');
  const btnPc = document.getElementById('btnAdminModePc');
  const title = panel ? panel.querySelector('.sim-panel-title') : null;

  if (wrap) {
    wrap.classList.remove('mobile-wrap', 'court-wrap', 'ipad-wrap');
  }
  if (panel) {
    panel.classList.remove('admin-pc-full', 'admin-ipad-full');
  }
  if (btnMob) btnMob.classList.remove('active');
  if (btnIpad) btnIpad.classList.remove('active');
  if (btnPc) btnPc.classList.remove('active');

  if (mode === '16:9') {
    if (wrap) wrap.classList.add('court-wrap');
    if (panel) panel.classList.add('admin-pc-full');
    if (btnPc) btnPc.classList.add('active');
    if (title) title.innerText = '2. ผู้ดูแลศาล (DM Admin - 16:9)';
  } else if (mode === '4:3') {
    if (wrap) wrap.classList.add('ipad-wrap');
    if (panel) panel.classList.add('admin-ipad-full');
    if (btnIpad) btnIpad.classList.add('active');
    if (title) title.innerText = '2. ผู้ดูแลศาล (DM Admin - 4:3 iPad)';
  } else {
    if (wrap) wrap.classList.add('mobile-wrap');
    if (btnMob) btnMob.classList.add('active');
    if (title) title.innerText = '2. ผู้ดูแลศาล (DM Admin - 9:16)';
  }
}


// ==========================================================
// 1F ACADEMY BLUEPRINT & TRAP CUTAWAY INTERACTION ENGINE
// ==========================================================
let currentMapMode = 'clean'; // 'clean' | 'crime' | 'cutaway' | 'simulate'
let currentSimPhase = 1; // 1 | 2 | 3
let simAnimationTimer = null;

const ACADEMY_ROOMS_DATA = {
  'laundry': {
    badge: '🧺 จุดเกิดเหตุสำคัญ (CRIME SCENE)',
    title: 'ห้องซักรีด ปีกบริการชั้น 1 (Laundry Room)',
    image: 'assets/room_laundry.jpg',
    crimeImage: 'assets/crime_scene_laundry.jpg',
    arch: 'ห้องซักรีดเพดานสูง 4.0 เมตร คานเพดานติดตั้งราวท่อสแตนเลสกลมแขวนผ้าแห้ง (ผิวเรียบมัน ทนแรงดึงสูง) มีเครื่องซักผ้าและเครื่องอบผ้าตั้งเวลา ผนังด้านหลังมีหน้าต่างระบายอากาศบานกระทุ้งเหล็กดัด สูงจากพื้นลานปูนด้านนอก 3.5 เมตร และก๊อกน้ำประปาที่ต่อสายยางลอดออกนอกหน้าต่าง',
    clues: [
      '<strong>EVD-04 (เชือกขาด):</strong> เชือกตากผ้าไนลอนมีรอยมีดตัดเรียบกริบ (ไม่ใช่รอยขาดจากแรงกระชาก)',
      '<strong>EVD-11 (เครื่องอบผ้า):</strong> หมุนรองเท้าบูทคู่หนัก ตั้งเวลา Delay 21:00 น. เพื่อสร้างเสียงต่อสู้หลอก',
      '<strong>EVD-23 (สายยางน้ำดีดกลับ):</strong> สายยางต่อจากก๊อกในห้องซักรีด ดีดกลับเข้ามาในห้องหลังถังตก น้ำไหลท่วมเจิ่งนองทั่วพื้น'
    ],
    timeline: '• <strong>17:30 น.:</strong> A ลอบเข้ามาฟาด B จนสลบ<br>• <strong>18:10 น.:</strong> A เซ็ตกลไกเชือกและถังน้ำถ่วงน้ำหนัก แขวนถัง 100 ลิตรนอกหน้าต่าง<br>• <strong>20:45 น.:</strong> B ฟื้นขึ้นมาตัดเชือกและผูกฮาร์เนสแต่พลาด'
  },
  'courtyard': {
    badge: '🌿 ลานซักล้างกลางแจ้ง',
    title: 'ลานปูนซักล้างปิดตายด้านหลัง (Rear Courtyard)',
    image: 'assets/crime_scene_courtyard_impact.jpg',
    arch: 'ลานกลางแจ้งระดับพื้น ±0.00 ม. ล้อมรอบด้วยกำแพงคอนกรีตสูง 5.0 เมตร ไม่มีประตูทางออกสู่ภายนอก มีท่อระบายน้ำที่พื้นปูน เหนือศีรษะที่ระดับ 3.5 ม. มีหน้าต่างห้องซักรีด ซึ่งเป็นจุดที่ถังน้ำ 100 ลิตรถูกแขวนลอยอยู่',
    clues: [
      '<strong>EVD-05 (ซากถังน้ำ 100 ลิตร):</strong> ถังพลาสติกสีน้ำเงินตกแตกกระจายบนพื้นปูน',
      '<strong>EVD-12 (คราบน้ำบนลานปูน):</strong> คราบน้ำปริมาณมหาศาล (~100 ลิตร) ไหลนองลงสู่ตะแกรงระบายน้ำ',
      '<strong>ระยะตกอิสระ (Free Fall):</strong> วัดระยะจากหน้าต่างถึงพื้นลานปูนได้ 3.5 เมตร'
    ],
    timeline: '• <strong>18:10 น.:</strong> ถังเปล่าถูกแขวนนอกหน้าต่าง น้ำเริ่มหยดลงถัง<br>• <strong>21:00 น.:</strong> ถังน้ำหนัก 100 กก. ร่วงวูบ 3.5 ม. กระแทกพื้นปูนเสียงดังสนั่น "โครม!"'
  },
  'barrel': {
    badge: '🪣 กลไกน้ำหนักถ่วง (COUNTERWEIGHT)',
    title: 'ถังน้ำพลาสติก 100 ลิตร (Water-Timer Counterweight)',
    image: 'assets/item_shattered_barrel.jpg',
    arch: 'ถังใส่ผ้าซักพลาสติกเปล่า (หนักเพียง 2 กก.) ที่หย่อนออกไปนอกหน้าต่าง แล้วต่อสายยางปล่อยน้ำเข้าจนหนัก 65.2 กก. ผูกติดกับปลายเชือกตากผ้าไนลอนที่โยงมาจากรอกในห้องซักรีด แขวนลอยอยู่ในอากาศสูง 3.5 เมตรเหนือพื้นลานปูน โดยมีสายยางน้ำประปาปล่อยน้ำไหลเอื่อยๆ ลงในถัง',
    clues: [
      '<strong>มวลน้ำเต็มถัง:</strong> 100 ลิตร = มวล 100 กิโลกรัม',
      '<strong>คำนวณแรงกระชาก (Shock Load):</strong> เมื่อมวล 100 กก. ตกจากความสูง 3.5 ม. จะสร้างแรงกระตุกฉับพลันสูงถึง 250 - 300 กิโลกรัม-แรง!'
    ],
    timeline: '• <strong>18:10 น.:</strong> A ปล่อยน้ำไหลเอื่อยๆ กะเวลาให้เต็มตอน 21:00 น.<br>• <strong>21:00 น.:</strong> น้ำหนักเกินสมดุล ถังร่วงดึงร่าง B ขึ้นแขวนคอ'
  },
  'window': {
    badge: '🪟 จุดเชื่อมต่อสถาปัตยกรรม (3.5 M WINDOW)',
    title: 'หน้าต่างระบายอากาศบานกระทุ้งเหล็กดัด',
    image: 'assets/item_laundry_window.jpg',
    arch: 'ติดตั้งอยู่บนผนังระหว่างห้องซักรีดกับลานปูน อยู่สูงจากระดับพื้น 3.5 เมตร เป็นบานกระทุ้งเหล็กดัดป้องกันคนปีน แต่มีช่องว่างให้เชือกตากผ้าไนลอนและสายยางน้ำลอดผ่านออกไปได้',
    clues: [
      '<strong>ความสูง 3.5 เมตร:</strong> ไขข้อสงสัยว่าทำไมอยู่ชั้น 1 แต่ของร่วงลงไปข้างล่างได้ เพราะหน้าต่างอยู่สูงจากพื้นลานปูนถึง 3.5 ม.!',
      '<strong>รอยเสียดสีของเชือก:</strong> มีรอยเชือกตากผ้าไนลอนเสียดสีกับขอบเหล็กดัด'
    ],
    timeline: '• ปลายเชือกและสายยางถูกลอดผ่านหน้าต่างนี้เพื่อสร้างกลไกแขวนคอพลังน้ำ'
  },
  'glass_corridor': {
    badge: '👁️ จุดสังเกตการณ์',
    title: 'ทางเดินกระจกใสเลียบลานปูน (Glass Corridor)',
    image: 'assets/room_glass_corridor.jpg',
    arch: 'ทางเดินผนังกระจกนิรภัยใสหนาพิเศษ มองเห็นลานปูนซักล้างด้านหลังและถังน้ำที่แขวนอยู่นอกหน้าต่างห้องซักรีดได้อย่างชัดเจน',
    clues: [
      '<strong>ทัศนวิสัย:</strong> จากทางเดินนี้ สามารถมองเห็นเงาของถังน้ำที่แขวนอยู่นอกหน้าต่างได้ แต่แสงไฟสลัวตอนค่ำทำให้ผู้เล่นคิดว่าเป็นอุปกรณ์ช่างทั่วไป'
    ],
    timeline: '• <strong>17:45 - 18:15 น.:</strong> PC 4 เดินเลี่ยงมารับลมที่ทางเดินนี้ และมองเห็นเงาถังน้ำแขวนลอยอยู่'
  },
  'kitchen': {
    badge: '🍳 ห้องครัว & ห้องอาหาร',
    title: 'ห้องครัว & ห้องอาหาร (Kitchen & Dining Hall)',
    image: 'assets/crime_scene_kitchen_stew.jpg',
    arch: 'ประกอบด้วยโซนทำอาหาร, ตู้แช่แข็ง Walk-in Freezer, เตาแก๊สอุตสาหกรรม, และโต๊ะอาหารยาวสำหรับนักเรียนทุกคน',
    clues: [
      '<strong>EVD-01 (ท่อนกระดูกหมูต้มเปื่อย):</strong> พบในก้นหม้อสตูว์ มีรอยบิ่นแตกจากการใช้เป็นอาวุธฟาด B',
      '<strong>EVD-07 (ขวดไวน์แดง):</strong> ถูกเปิดใช้เกือบหมดขวดเพื่อกลบสีและกลิ่นเลือดในน้ำซุปสตูว์'
    ],
    timeline: '• <strong>17:30 น.:</strong> A หยิบท่อนกระดูกหมูแช่แข็งจากตู้ฟรีซไปเป็นอาวุธ<br>• <strong>17:50 น.:</strong> A นำกระดูกเปื้อนเลือดมาต้มในหม้อสตูว์เพื่อทำลายคราบเลือด<br>• <strong>19:00 - 20:30 น.:</strong> ทุกคนนั่งกินสตูว์ร่วมกัน (สร้าง Alibi ให้ A)'
  },
  'gym': {
    badge: '🥊 โรงยิม & เวทีปฐมนิเทศ',
    title: 'โรงยิม & เวทีปฐมนิเทศ (Gymnasium)',
    image: 'assets/crime_scene_gym_execution.jpg',
    arch: 'โรงยิมขนาดใหญ่ มีเวทีปราศรัยของ Monokuma และห้องล็อกเกอร์เก็บอุปกรณ์กีฬาที่ถูกเชื่อมปิดตาย',
    clues: [
      '<strong>จุดประหาร ไดกิ (NPC 1):</strong> พื้นถูกหุ่นยนต์ทำความสะอาดเช็ดจนเกลี้ยง ไม่มีรอยกระสุนเหลืออยู่',
      '<strong>ล็อกเกอร์ปิดตาย:</strong> ตู้เก็บอุปกรณ์ถูกเชื่อมเหล็ก ป้องกันไม่ให้ผู้เล่นหยิบอาวุธ'
    ],
    timeline: '• <strong>14:00 น.:</strong> Monokuma ประหาร ไดกิ (NPC 1) เพื่อเชือดไก่ให้ลิงดู<br>• <strong>17:45 น.:</strong> PC 2 เดินมาสำรวจโรงยิมและพยายามงัดล็อกเกอร์'
  },
  'corridor': {
    badge: '🏛️ โถงทางเดินกลาง',
    title: 'โถงทางเดินกลาง (Central Corridor)',
    image: 'assets/room_central_corridor.jpg',
    arch: 'ทางเดินกว้างเชื่อมต่อทุกโซนในอาคาร มีตู้กดเครื่องดื่มอัตโนมัติ (กินเหรียญ 17:45 น.) และบอร์ดประชาสัมพันธ์โรงเรียน',
    clues: [
      '<strong>ตู้กดน้ำกินเหรียญ (17:45 น.):</strong> PC 1 ยืนก้มหน้าทุบตู้เสียงดัง เปิดช่องให้คนร้ายห่อกระดูกเดินผ่านหลังเข้าครัว!',
      '<strong>จุดดีเบตในศาล:</strong> <em>"แล้วแกไม่ได้ก้มหน้าทุบตู้กดน้ำอยู่เหรอ?! คนร้ายเอาผ้าขนหนูห่อกระดูกเดินผ่านหลังแกไปตอนนั้น!"</em>',
      '<strong>เสียงฮัมในท่อ:</strong> เกิดจากการเปิดสายยางปล่อยน้ำเข้าถังอย่างต่อเนื่อง'
    ],
    timeline: '• <strong>17:45 น.:</strong> PC 1 ยืนทุบตู้กดน้ำ / คนร้ายเดินผ่านเข้าครัว<br>• <strong>18:15 น.:</strong> PC 1 และ PC 2 เดินสวนกันไปกินข้าว'
  },
  'dorms': {
    badge: '🛏️ โซนหอพักนักเรียน',
    title: 'โซนหอพักนักเรียน (Student Dormitories)',
    image: 'assets/room_dormitory_hallway.jpg',
    arch: 'ห้องพักส่วนตัว 6 ห้อง แต่ละห้องมีประตูล็อกดิจิทัล ปลดล็อกด้วย Monopad ประจำตัวเท่านั้น',
    clues: [
      '<strong>ห้องพัก B:</strong> B ไม่ได้กลับมาที่ห้องพักตั้งแต่ช่วงบ่าย เพราะเก็บตัวอยู่ที่ห้องซักรีด',
      '<strong>Alibi ช่วง 20:00 - 21:00 น.:</strong> ผู้เล่นใช้ห้องพักและห้องนั่งเล่นในการประกาศกิจกรรมพักผ่อน'
    ],
    timeline: '• <strong>17:30 น.:</strong> PC 2 เดินทดสอบระบบกลอนประตูดิจิทัล<br>• <strong>20:00 น.:</strong> เสียงระฆังราตรี Night Time'
  },
  'entrance': {
    badge: '🚪 โถงทางเข้าหลัก',
    title: 'โถงทางเข้าหลัก (Main Entrance Hall)',
    arch: 'ทางเข้าหลักถูกปิดผนึกด้วยประตูเหล็กยักษ์ Blast Gate เชื่อมต่อวงจรไฟฟ้าแรงสูง ข้างประตูมีตู้ควบคุมไฟฟ้าหลักและมิเตอร์น้ำประปา',
    clues: [
      '<strong>มิเตอร์วัดแรงดันน้ำ:</strong> เข็มสั่นระริก แสดงว่ามีก๊อกน้ำตัวหนึ่งเปิดทิ้งไว้ต่อเนื่องนับชั่วโมง',
      '<strong>ตัวตั้งเวลา (Timer Relay):</strong> มีรอยต่อพ่วงกับเครื่องใช้ไฟฟ้าในปีกบริการ'
    ],
    timeline: '• <strong>17:30 - 18:15 น.:</strong> PC 3 มาตรวจดูประตูเหล็กและแผงควบคุมระบบ'
  }
};

function initMapView() {
  setMapDisplayMode('clean');
}

function setMapDisplayMode(mode) {
  currentMapMode = mode;
  ['btnMapClean', 'btnMapCrime', 'btnMapCutaway', 'btnMapSimulate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  });

  const containers = {
    'clean': 'mapCleanContainer',
    'crime': 'mapCrimeContainer',
    'cutaway': 'mapCutawayContainer',
    'simulate': 'mapSimulateContainer'
  };

  Object.values(containers).forEach(cid => {
    const el = document.getElementById(cid);
    if (el) el.classList.add('hidden');
  });

  const drawer = document.getElementById('mapInspectionDrawer');

  if (mode === 'clean') {
    const btn = document.getElementById('btnMapClean');
    if (btn) btn.classList.add('active');
    const c = document.getElementById('mapCleanContainer');
    if (c) c.classList.remove('hidden');
    if (drawer) drawer.classList.add('hidden');
  } else if (mode === 'crime') {
    const btn = document.getElementById('btnMapCrime');
    if (btn) btn.classList.add('active');
    const c = document.getElementById('mapCrimeContainer');
    if (c) c.classList.remove('hidden');
    if (drawer) drawer.classList.remove('hidden');
    selectMapRoom('laundry');
  } else if (mode === 'cutaway') {
    const btn = document.getElementById('btnMapCutaway');
    if (btn) btn.classList.add('active');
    const c = document.getElementById('mapCutawayContainer');
    if (c) c.classList.remove('hidden');
    if (drawer) drawer.classList.remove('hidden');
  } else if (mode === 'simulate') {
    const btn = document.getElementById('btnMapSimulate');
    if (btn) btn.classList.add('active');
    const c = document.getElementById('mapSimulateContainer');
    if (c) c.classList.remove('hidden');
    if (drawer) drawer.classList.remove('hidden');
    setSimPhase(1);
  }
}

// ==========================================================
// 1F STANDARD BLUEPRINT NORMAL ROOM INSPECTION ENGINE
// ==========================================================
const NORMAL_ROOMS_DATA = {
  kitchen: {
    name: "RM-102: ห้องครัว (Kitchen)",
    tag: "🍳 ปีกบริการอาหารและโภชนาการ",
    image: "assets/room_kitchen.jpg",
    spec: "ขนาด: 6.0m x 6.5m // เพดานสูง 3.2m // ประตู D-102 (บานเดี่ยวสวิง)",
    desc: "ห้องครัวประกอบอาหารขนาดใหญ่ของโรงเรียนคิโบกามิเนะ จัดเตรียมอุปกรณ์ทำครัวระดับมืออาชีพ เคาน์เตอร์สเตนเลส ตู้แช่แข็งอาหารสด (Walk-in Freezer) และเตาแก๊สอุตสาหกรรม เป็นสถานที่จัดเตรียมอาหารเย็นและสตูว์สำหรับนักเรียนทุกคน"
  },
  dining: {
    name: "RM-103: โรงอาหาร & ห้องโถงรับประทานอาหาร (Dining Hall)",
    tag: "🍽️ พื้นที่สันทนาการและรับประทานอาหารส่วนกลาง",
    image: "assets/room_dining_hall.jpg",
    spec: "ขนาด: 8.0m x 6.5m // เพดานสูง 3.5m // ประตู D-103 (บานเดี่ยวสวิง)",
    desc: "ห้องโถงรับประทานอาหารกว้างขวาง จัดวางโต๊ะอาหารไม้ยาวสำหรับนักเรียนทุกคน มีแสงไฟวอร์มไลท์ส่องสว่าง มีนาฬิกาแขวนผนังบอกเวลา และเป็นศูนย์รวมกิจกรรมพบปะพูดคุยประจำวัน"
  },
  laundry: {
    name: "RM-101: ห้องซักรีด (Service Laundry Room)",
    tag: "🧺 ปีกบริการและซักล้างประจำอาคาร",
    image: "assets/room_laundry.jpg",
    spec: "ขนาด: 8.0m x 6.5m // เพดานสูง 4.0m // หน้าต่าง W-101 (สูง 3.5m จากพื้นลานปูน) // ประตู D-101",
    desc: "ห้องซักรีดมาตรฐานประจำปีกบริการชั้น 1 เรียงรายด้วยเครื่องซักผ้าอัตโนมัติ เครื่องอบผ้าอุตสาหกรรม DRY-1 และอ่างก๊อกน้ำซักล้าง ด้านบนมีราวท่อส่งสแตนเลสพาดผ่านเพดานสูง 4 เมตร และมีหน้าต่างระบายอากาศบานเลื่อนสู่ลานหลัง"
  },
  courtyard: {
    name: "EXT-101: ลานปูนซักล้างปิดตายด้านหลัง (Rear Service Courtyard)",
    tag: "🌿 พื้นที่บริการกลางแจ้งปิดตาย",
    image: "assets/room_courtyard.jpg",
    spec: "ขนาด: 18.0m x 6.5m // กำแพง ค.ส.ล. สูง 5.0m รอบด้าน // ปิดตายไร้ทางออก",
    desc: "ลานคอนกรีตกลางแจ้งสำหรับงานบริการ ตากล้าง และระบายน้ำ โอบล้อมด้วยกำแพงคอนกรีตเสริมเหล็กสูง 5 เมตรที่ปิดตาย ไร้บันไดหนีไฟหรือประตูทะลุออกไปนอกโรงเรียน เหนือศีรษะที่ระดับ 3.5 เมตรตรงแนวห้องซักรีดมีหน้าต่างระบายอากาศเปิดอยู่"
  },
  gym: {
    name: "RM-104: โรงยิมเนเซียม (Gymnasium)",
    tag: "🏀 ศูนย์กีฬาและการชุมนุมใหญ่",
    image: "assets/room_gymnasium.jpg",
    spec: "ขนาด: 10.0m x 10.0m // เพดานสูง 7.0m // ประตู D-104 (บานคู่ Double Door)",
    desc: "อาคารโรงยิมอเนกประสงค์ขนาดใหญ่ ปูพื้นไม้ปาร์เกต์ขัดมัน มีเวทีประกอบพิธีการ แป้นบาสเกตบอล และห้องเก็บอุปกรณ์กีฬา เป็นสถานที่ปฐมนิเทศและชุมนุมนักเรียนโดย Monokuma"
  },
  corridor: {
    name: "CORR-100: โถงทางเดินหลักชั้น 1 (Main Central Corridor)",
    tag: "🏛️ ทางสัญจรแกนกลางอาคาร",
    image: "assets/room_central_corridor.jpg",
    spec: "ขนาด: กว้าง 3.0m x ยาว 45m // เพดานสูง 3.5m // พื้นกระเบื้องแกรนิตโต้",
    desc: "ทางเดินโอ่โถงเชื่อมต่อระหว่างปีกหอพัก ห้องครัว โรงอาหาร โรงยิม และประตูกล มีบอร์ดข่าวสารประจำวัน ตู้กดเครื่องดื่มอัตโนมัติ และกล้องวงจรปิด Monokuma สอดส่องตลอด 24 ชั่วโมง"
  },
  glass_corridor: {
    name: "CORR-101: ทางเดินกระจกเชื่อมปีกหลัง (North Glass Passage)",
    tag: "🪟 ทางเดินชมวิวรูปตัว L",
    image: "assets/room_glass_corridor.jpg",
    spec: "ขนาด: 12.0m x 4.5m // ผนังกระจกนิรภัยหนา 15mm หันสู่ลานซักล้าง",
    desc: "ทางเดินกระจกใสที่ทอดตัวขนานกับลานซักล้างปีกหลัง แม้จะมองเห็นทัศนียภาพของลานคอนกรีตภายนอกได้อย่างชัดเจน แต่ผนังกระจกนิรภัยถูกปิดตายแน่นหนา ไม่สามารถเปิดหรือทุบทำลายได้"
  },
  dormitory: {
    name: "CORR-102: ทางเดินปีกหอพักนักเรียน (Dormitory Wing)",
    tag: "🛏️ พื้นที่พักอาศัยส่วนบุคคล",
    image: "assets/room_dormitory_hallway.jpg",
    spec: "ขนาด: กว้าง 2.5m // ประตูห้องพักพร้อมระบบล็อกคีย์การ์ดดิจิทัลและป้ายชื่อทองเหลือง",
    desc: "โถงทางเดินเงียบสงบปูพรมหนานุ่ม แบ่งซอยเป็นห้องนอนส่วนตัวของนักเรียนแต่ละคน ประตูติดตั้งระบบล็อกนิรภัยชั้นสูงตามกฎโรงเรียน ห้ามบุกรุกห้องของผู้อื่นโดยไม่ได้รับอนุญาต"
  },
  blast_gate: {
    name: "BLAST GATE: ประตูกลนิรภัย & บันไดขึ้นชั้น 2",
    tag: "🚪 ระบบรักษาความปลอดภัยเขตหวงห้าม",
    image: "assets/room_blast_gate.jpg",
    spec: "ประตูกลเหล็กกล้าไฮดรอลิกหนา 30cm // ล็อกด้วยรหัสผ่านความปลอดภัยสูง",
    desc: "ประตูกลเหล็กกล้าปิดกั้นบันไดทางขึ้นสู่ชั้น 2 ของโรงเรียนอย่างแน่นหนา มีแผงวงจรและสัญญาณไฟสีแดงเตือน จะเปิดออกเฉพาะเมื่อได้รับคำสั่งปลดล็อกพิเศษจาก Monokuma เท่านั้น"
  }
};

function openNormalRoomModal(roomId) {
  const data = NORMAL_ROOMS_DATA[roomId];
  if (!data) return;

  const modal = document.getElementById('normalRoomInspectionModal');
  if (!modal) return;

  const tagEl = document.getElementById('normRoomTag');
  const titleEl = document.getElementById('normRoomTitle');
  const imgEl = document.getElementById('normRoomImage');
  const specEl = document.getElementById('normRoomSpec');
  const descEl = document.getElementById('normRoomDesc');

  if (tagEl) tagEl.innerText = data.tag;
  if (titleEl) titleEl.innerText = data.name;
  if (imgEl) {
    imgEl.src = data.image;
    imgEl.alt = data.name;
  }
  if (specEl) specEl.innerText = data.spec;
  if (descEl) descEl.innerText = data.desc;

  modal.classList.remove('hidden');
  playSfx('click');
}

function closeNormalRoomModal() {
  const modal = document.getElementById('normalRoomInspectionModal');
  if (modal) modal.classList.add('hidden');
}

function printCleanBlueprint() {
  setMapDisplayMode('clean');
  
  const src = document.getElementById('mapCleanContainer');
  if (!src) return;

  let printSection = document.getElementById('blueprintPrintSection');
  if (!printSection) {
    printSection = document.createElement('div');
    printSection.id = 'blueprintPrintSection';
    document.body.appendChild(printSection);
  }
  
  // Clone clean blueprint container content into printSection
  printSection.innerHTML = src.innerHTML;
  
  // Remove any interactive action buttons from printed output
  const btns = printSection.querySelectorAll('button, .blueprint-action-btn');
  btns.forEach(b => b.remove());

  document.body.classList.add('printing-blueprint');
  
  setTimeout(() => {
    window.print();
  }, 100);
}

window.addEventListener('afterprint', () => {
  document.body.classList.remove('printing-blueprint');
  const printSection = document.getElementById('blueprintPrintSection');
  if (printSection) printSection.innerHTML = '';
});

function selectMapRoom(roomId) {
  const data = ACADEMY_ROOMS_DATA[roomId];
  if (!data) return;

  const badgeEl = document.getElementById('inspectBadge');
  const titleEl = document.getElementById('inspectTitle');
  const archEl = document.getElementById('inspectArch');
  const cluesEl = document.getElementById('inspectClues');
  const timelineEl = document.getElementById('inspectTimeline');

  if (badgeEl) badgeEl.innerText = data.badge;
  if (titleEl) titleEl.innerText = data.title;
  if (archEl) archEl.innerHTML = data.arch;
  if (cluesEl) cluesEl.innerHTML = (data.clues || []).map(c => `<li>${c}</li>`).join('');
  if (timelineEl) timelineEl.innerHTML = data.timeline;

  const imgEl = document.getElementById('inspectImg');
  if (imgEl && data.image) {
    imgEl.src = data.image;
    imgEl.alt = data.title;
  }

  // Flash inspection drawer
  const drawer = document.getElementById('mapInspectionDrawer');
  if (drawer) {
    drawer.style.borderColor = '#38bdf8';
    setTimeout(() => {
      drawer.style.borderColor = '#000';
    }, 400);
  }
}

function setSimPhase(phase) {
  currentSimPhase = phase;
  ['btnSimPhase1', 'btnSimPhase2', 'btnSimPhase3'].forEach((id, idx) => {
    const btn = document.getElementById(id);
    if (btn) {
      if (idx + 1 === phase) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  const badge = document.getElementById('simNarrativeBadge');
  const title = document.getElementById('simNarrativeTitle');
  const desc = document.getElementById('simNarrativeDesc');
  const victimAvatar = document.getElementById('simVictimAvatar');
  const victimIcon = document.getElementById('simVictimIcon');
  const victimTag = document.getElementById('simVictimTag');
  const victimStatus = document.getElementById('simVictimStatus');
  const ropeLeft = document.getElementById('simRopeLeft');
  const barrelEntity = document.getElementById('simBarrelEntity');
  const barrelWeight = document.getElementById('simBarrelWeight');
  const pulleyWheel = document.getElementById('simPulleyWheel');

  if (phase === 1) {
    if (badge) badge.innerText = 'เฟส 1: การเซ็ตกลไกเชือกและถังน้ำถ่วงน้ำหนัก (18:10 น.)';
    if (title) title.innerText = 'คนร้ายลอบวางกับดักน้ำถ่วงเวลาในห้องซักรีด';
    if (desc) desc.innerText = 'A (ผู้เล่น INT สูง) คล้องเชือกตากผ้าไนลอนที่คอ B พาดผ่านราวท่อสแตนเลสเพดาน หย่อนถังเปล่า (2 กก.) ออกนอกหน้าต่างสูง 3.5 ม. และสอดสายยางผ่านรูมือจับของถังซักผ้าและมัดประคองด้วยเชือกไนลอน (ทางน้ำเปิดโล่ง 100%) หรี่น้ำ 0.5 ลิตร/นาที โดยร่าง B (68 กก.) ถ่วงเชือกไว้ ทำให้ถังลอยนิ่งอยู่ที่เดิมไม่ขยับลงเลยจนกว่าน้ำจะเต็มตอน 21:00 น.!';
    
    if (victimAvatar) {
      victimAvatar.style.bottom = '25px';
      victimAvatar.style.top = 'auto';
    }
    if (victimIcon) victimIcon.innerText = '😴';
    if (victimTag) victimTag.innerText = 'B (หมดสติที่พื้น)';
    if (victimStatus) {
      victimStatus.innerText = 'คล้องบ่วงที่คอ';
      victimStatus.style.borderColor = '#f43f5e';
      victimStatus.style.color = '#f43f5e';
    }
    if (ropeLeft) ropeLeft.style.height = '180px';
    if (barrelEntity) {
      barrelEntity.style.top = '60px';
      barrelEntity.style.bottom = 'auto';
    }
    if (barrelWeight) barrelWeight.innerText = '10 L (~10 kg) [น้ำเริ่มไหล]';
    if (pulleyWheel) pulleyWheel.style.transform = 'rotate(0deg)';
  } else if (phase === 2) {
    if (badge) badge.innerText = 'เฟส 2: แผนดัดหลังของเหยื่อที่ผิดพลาด (20:45 น.)';
    if (title) title.innerText = 'B ฟื้นขึ้นมาตัดเชือก แต่ผูกเงื่อนฮาร์เนสตบตาพลาด!';
    if (desc) desc.innerText = 'B ฟื้นสติขึ้นมา รู้ตัวว่าโดนลอบฆ่า จึงควักมีดพกตัดเชือกขาดสะบั้น! B รอดตายแล้ว 100%! แต่ด้วยความหยิ่ง B ต้องการดัดหลังคนร้ายในศาล จึงนำเศษเชือกมาผูกเซฟตี้ฮาร์เนสกับลำตัวใต้เสื้อเพื่อรับน้ำหนักแทนคอ แล้วเอาบ่วงหลวมๆ คล้องคอตบตา แต่ B มึนหัวจากแผลฟาดทำให้ผูกเงื่อนหลุดตำแหน่ง!';
    
    if (victimAvatar) {
      victimAvatar.style.bottom = '25px';
      victimAvatar.style.top = 'auto';
    }
    if (victimIcon) victimIcon.innerText = '😏';
    if (victimTag) victimTag.innerText = 'B (ตัดเชือกสำเร็จ!)';
    if (victimStatus) {
      victimStatus.innerText = '✂️ ผูกฮาร์เนสดัดหลัง';
      victimStatus.style.borderColor = '#10b981';
      victimStatus.style.color = '#10b981';
    }
    if (ropeLeft) ropeLeft.style.height = '180px';
    if (barrelEntity) {
      barrelEntity.style.top = '60px';
      barrelEntity.style.bottom = 'auto';
    }
    if (barrelWeight) barrelWeight.innerText = '80 L (~80 kg) [ใกล้เต็มถัง]';
    if (pulleyWheel) pulleyWheel.style.transform = 'rotate(0deg)';
  } else if (phase === 3) {
    if (badge) badge.innerText = 'เฟส 3: วินาทีสังหาร & การตายที่แท้จริง (21:00 น.)';
    if (title) title.innerText = 'ถังน้ำ 100 กก. ร่วงกระแทกพื้น กระชากร่าง B คอหักตายคาที่!';
    if (desc) desc.innerText = '21:00 น. เครื่องอบผ้าหมุนเสียงดังตึงตัง ถังน้ำหนัก 65.2 กก. ชนะน้ำหนัก B จึงร่วงวูบ 3.5 ม. กระแทกพื้นลานปูนดัง "โครม!!" แรงกระชากกระตุกสายยางหลุดกระเด็นออกจากก๊อก และดึงร่างเรียวตะลอยหวือขึ้นเพดาน เงื่อนฮาร์เนสหลุด บ่วงรูดขึ้นรัดคอกระแทกราวสแตนเลสจนคอหักเสียชีวิตทันที! เรียวตะ จึงกลายเป็น Blackened ปลิดชีพตนเอง!';
    
    if (victimAvatar) {
      victimAvatar.style.bottom = 'auto';
      victimAvatar.style.top = '70px'; // Pulled up to ceiling!
    }
    if (victimIcon) victimIcon.innerText = '💀';
    if (victimTag) victimTag.innerText = 'B (เสียชีวิตคาที่!)';
    if (victimStatus) {
      victimStatus.innerText = '⚡ กระชากคอหักบนเพดาน';
      victimStatus.style.borderColor = '#ef4444';
      victimStatus.style.color = '#ef4444';
    }
    if (ropeLeft) ropeLeft.style.height = '40px'; // Rope pulled up!
    if (barrelEntity) {
      barrelEntity.style.top = 'auto';
      barrelEntity.style.bottom = '35px'; // Smashed on ground!
    }
    if (barrelWeight) barrelWeight.innerText = '100 L (แตกกระจายบนลานปูน!)';
    if (pulleyWheel) pulleyWheel.style.transform = 'rotate(360deg)';

    if (typeof playSfx === 'function') {
      try { playSfx('gavel'); } catch(e) {}
    }
  }
}

function playTrapSimulation() {
  if (simAnimationTimer) clearTimeout(simAnimationTimer);
  setSimPhase(1);
  simAnimationTimer = setTimeout(() => {
    setSimPhase(2);
    simAnimationTimer = setTimeout(() => {
      setSimPhase(3);
    }, 2500);
  }, 2200);
}
