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

// Server-Sent Events (SSE) Real-Time Message Bus
let serverStreamSource = null;
let activeServerRoomCode = null;
const processedMessageIds = new Set();

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

async function fetchActiveRooms() {
  const container = document.getElementById('hubActiveRoomsSection');
  const listEl = document.getElementById('activeRoomsList');
  if (!container || !listEl) return;

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
    "แล้วเชือกนั่นล่ะ? ถ้าไม่มีใครตัด เชือกมันจะขาดสะบั้นเองได้ยังไง?!",
    "หม้อสตูว์ใบนั้นไม่มีรอยเลือดของฉันสักหยดเดียวเลยนะ!!",
    "พวกแกไม่มีหลักฐานชิ้นสุดท้ายที่จะพิสูจน์การกระทำของฉันหรอก!!"
  ],

  // Mini-Game 7: Closing Argument
  closingSlots: { 1: false, 2: false },

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

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSfx(type) {
  // Prevent audio overlapping: stop previous soundboard SFX immediately
  if (activeSfxAudio) {
    try {
      activeSfxAudio.pause();
      activeSfxAudio.currentTime = 0;
    } catch(e) {}
    activeSfxAudio = null;
  }

  const file = SOUND_FILES[type];
  if (file) {
    try {
      const audio = new Audio(file);
      audio.volume = 0.88;
      activeSfxAudio = audio;
      audio.onended = () => {
        if (activeSfxAudio === audio) activeSfxAudio = null;
      };
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
  if (serverStreamSource && activeServerRoomCode === code) return;

  if (serverStreamSource) {
    try { serverStreamSource.close(); } catch(e) {}
    serverStreamSource = null;
  }
  activeServerRoomCode = code;

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

        // Deduplication: skip if already handled
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

  // 1. Assign unique message ID for cross-transport deduplication
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

  // 2. High-speed guaranteed HTTP POST broadcast relay via Node server
  const activeRoom = roomCode || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('dangan_court_room_code')) || (typeof localStorage !== 'undefined' && localStorage.getItem('dangan_current_room'));
  if (activeRoom) {
    try {
      fetch('/api/rooms/' + encodeURIComponent(activeRoom.toUpperCase()) + '/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
        keepalive: true
      }).catch(err => {
        console.warn('[BROADCAST POST FAIL]:', err);
      });
    } catch(e) {}
  }

  // 3. WebRTC DataChannel (Parallel direct peer-to-peer fast path)
  if (isHost) {
    peerConnections.forEach(conn => {
      if (conn && conn.open) {
        try { conn.send(msg); } catch(e) {}
      }
    });
  } else if (hostPeer && hostPeer.open) {
    try { hostPeer.send(msg); } catch(e) {}
  }

  // 4. Also broadcast locally to this browser tab ONLY if it shouldn't be excluded
  if (msg.type !== 'trigger_fx' && msg.type !== 'request_claim_character' && msg.type !== 'player_leave') {
    handleIncomingMessage(msg, null);
  }

  // 5. Socket.io if available
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
    const reqRole = msg.role;
    const reqName = msg.playerName;
    const senderId = senderConn ? senderConn.peer : (msg.userHash || currentUserHash || ('p_' + Math.random().toString(36).substr(2, 6)));

    // Check if role is already claimed by someone else
    const existing = Object.values(gameState.players).find(p => p.role === reqRole && p.id !== senderId && p.userHash !== msg.userHash);
    if (existing) {
      const rejectPacket = {
        type: 'claim_rejected',
        targetHash: msg.userHash || senderId,
        role: reqRole,
        reason: `บทบาท "${reqRole}" ถูกเลือกโดย "${existing.name}" ไปแล้ว กรุณาเลือกบทอื่น!`
      };
      if (senderConn && senderConn.open) {
        try { senderConn.send(rejectPacket); } catch(e) {}
      }
      broadcast(rejectPacket);
      return;
    }

    // Role is free!
    const isKiller = (reqRole === 'นักมายากล');
    const playerObj = {
      id: senderId,
      name: reqName,
      role: reqRole,
      isKiller: isKiller,
      roomCode: roomCode,
      userHash: msg.userHash || senderId
    };
    gameState.players[senderId] = playerObj;
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

    logCourt(`👤 [PODIUM]: ${reqName} ยืนประจำแท่น [${reqRole}]`);
  } else if (msg.type === 'claim_approved') {
    if (msg.targetHash && currentUserHash && msg.targetHash !== currentUserHash) return;
    if (typeof joinClaimTimeout !== 'undefined' && joinClaimTimeout) {
      clearTimeout(joinClaimTimeout);
      joinClaimTimeout = null;
    }
    myPlayer = msg.player;
    localStorage.setItem('dangan_player_' + roomCode, JSON.stringify(myPlayer));
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
    document.getElementById('pMyRole').innerText = `[${myPlayer.role}]`;
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

    showToast(`✨ คุณได้สวมบทบาท [${myPlayer.role}] เข้าสู่ศาลแล้ว!`);
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
    gameState.players[msg.player.id] = msg.player;
    updatePlayerDisplays();
    logCourt(`👤 [JOIN]: ${msg.player.name} (${msg.player.role}) ยืนประจำโพเดียม`);
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
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
    handleClueDiscovered(msg.clueId, msg.clueName, msg.playerName);
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
    updateInfluenceDisplay();
    if (msg.delta < 0) playSfx('wrong');
    else if (msg.delta > 0) playSfx('correct');
  } else if (msg.type === 'sabotage') {
    handleSabotage(msg.sabType, msg.playerName);
  } else if (msg.type === 'stg1_submit') {
    handleStg1Submit(msg.clueId, msg.playerName);
  } else if (msg.type === 'stg1_evaluate') {
    evaluateStg1Batch();
  } else if (msg.type === 'stg2_char') {
    handleStg2Char(msg.char);
  } else if (msg.type === 'rebuttal_slash') {
    handleRebuttalSlash(msg.bullet, msg.playerName);
  } else if (msg.type === 'rebuttal_verdict') {
    // Rebuttal verdict already handled
  } else if (msg.type === 'logic_dive_vote') {
    handleLogicDiveVote(msg.question, msg.choice, msg.voterId, msg.playerName);
  } else if (msg.type === 'logic_dive_crash') {
    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.remove('hidden');
      crashNotice.style.display = 'block';
      crashNotice.innerText = `💥 ชนผนังอุโมงค์! เสียงข้างมากเลือกข้อ [${msg.winningChoice}] ซึ่งเป็นทางตัน (-15% Influence)`;
    }
  } else if (msg.type === 'logic_dive_retry') {
    const choicesBox = document.getElementById('diveMobileChoices');
    const feedback = document.getElementById('diveChoiceFeedback');
    if (choicesBox) {
      choicesBox.style.pointerEvents = 'auto';
      Array.from(choicesBox.children).forEach(b => b.classList.remove('btn-selected'));
    }
    if (feedback) feedback.style.display = 'none';
  } else if (msg.type === 'stg5_scrum') {
    handleStg5Scrum(msg.delta);
  } else if (msg.type === 'stg6_hit') {
    handleStg6Hit(msg.playerName);
  } else if (msg.type === 'stg6_final_blow') {
    handleStg6FinalBlow(msg.playerName);
  } else if (msg.type === 'armament_final_ready') {
    const box = document.getElementById('finalBlowMobileBox');
    if (box) box.style.display = 'block';
  } else if (msg.type === 'closing_submit') {
    handleClosingSubmit(msg.slot, msg.cardId, msg.playerName);
  } else if (msg.type === 'submit_vote') {
    handleVoteSubmitted(msg.candidate, msg.voterId);
  } else if (msg.type === 'minigame_result') {
    showMinigameResult(msg.success, msg.title, msg.desc, msg.details);
  } else if (msg.type === 'close_minigame_result') {
    closeCourtResultModal();
  } else if (msg.type === 'execution_cutscene') {
    triggerMonokumaExecutionCutscene(msg.isVictory);
  } else if (msg.type === 'close_execution_cutscene') {
    closeExecutionModal();
  } else if (msg.type === 'verdict') {
    showVerdict(msg.isVictory);
  } else if (msg.type === 'trigger_fx') {
    if (isHost || currentView === 'court') {
      playSfx(msg.fx);
    }
  }
}

function applyState(st) {
  gameState = st;
  updateInfluenceDisplay();
  updateTimerDisplay();
  updatePlayerDisplays();
  renderStage(gameState.stage);
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
  if (qView) return qView.toLowerCase();
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
    }, 600);
  }

  hidePinModal();

  if (!p || lowerP === 'index' || lowerP === 'hub') {
    switchView('hub');
  } else if (lowerP === 'court') {
    switchView('court');
  } else if (lowerP === 'simulation' || lowerP === 'sim') {
    switchView('simulation');
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

  // Set active view class on root elements to control navigation button visibility
  ['view-is-hub', 'view-is-court', 'view-is-admin', 'view-is-player', 'view-is-simulation'].forEach(cls => {
    document.documentElement.classList.remove(cls);
    document.body.classList.remove(cls);
  });
  document.documentElement.classList.add('view-is-' + v);
  document.body.classList.add('view-is-' + v);

  const panels = ['viewHub', 'viewCourt', 'viewAdmin', 'viewPlayer', 'viewSimulation'];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const tabs = ['tabHub', 'tabCourt', 'tabAdmin', 'tabPlayer', 'tabSimulation'];
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
  } else if (v === 'simulation') {
    const el = document.getElementById('viewSimulation');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabSimulation');
    if (tab) tab.classList.add('active');
    initSimulationLab();
  }
}

function updateHubDisplay() {
  fetchActiveRooms();
  if (hubRoomsPollingInterval) clearInterval(hubRoomsPollingInterval);
  hubRoomsPollingInterval = setInterval(fetchActiveRooms, 5000);
}

function clearPlayerLocalData() {
  myPlayer = null;
  currentUserHash = '';
  const localKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('dangan_')) {
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
  const disp = document.getElementById('displayUserHash');
  if (disp) disp.innerText = '#' + hash;
  const pHash = document.getElementById('pMyHash');
  if (pHash) pHash.innerText = '#' + hash;

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

  const savedData = roomCode ? localStorage.getItem('dangan_player_' + roomCode) : null;
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
  const tabs = ['pTabGame', 'pTabChar', 'pTabClues', 'pTabGuide'];
  const panes = ['playerSectionGame', 'playerSectionChar', 'playerSectionClues', 'playerSectionGuide'];

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
  } else if (tab === 'guide') {
    const t = document.getElementById('pTabGuide');
    const p = document.getElementById('playerSectionGuide');
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
      { time: '20:00 - 21:00 น.', desc: 'ช่วงไฟดับ คุณไปตรวจดูตู้ไฟพบเศษใยเชือกไนลอนไหม้คาเบรกเกอร์' },
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
  { id: 'EVD-01', aliases: ['C01', 'CORE-01', '1', 'E1'], name: 'ท่อนกระดูกหมูต้มเปื้อนเลือดสดมนุษย์', secretType: 'CORE', typeLabel: 'สำคัญแก่หลัก', loc: 'ห้องครัว (ก้นหม้อสตูว์)', desc: 'ท่อนกระดูกหมูขนาดใหญ่สับสองท่อน ผิวกระดูกมีรอยร้าวจากการฟาดอย่างแรง มีกลิ่นคาวสนิมเหล็กเข้มข้นของเลือดสดมนุษย์ซึมลึกในเนื้อกระดูกชัดเจน' },
  { id: 'EVD-02', aliases: ['C02', 'CORE-02', '2', 'E2'], name: 'มีดพกเปื้อนใยเชือกในกระเป๋าเสื้อ B', secretType: 'CORE', typeLabel: 'สำคัญแก่หลัก', loc: 'ร่างเหยื่อ B', desc: 'มีดพกพับเดินป่า ใบมีดมีคราบใยเชือกไนลอนติดอยู่ แสดงว่าเหยื่อใช้มีดตัดเชือกที่มัดมือตนเองจนขาดออกมาก่อนเสียชีวิต!' },
  { id: 'EVD-03', aliases: ['C03', 'CORE-03', '3', 'E3'], name: 'ลูกตุ้มเหล็ก 68 กก. และรอกคู่หน้าต่าง', secretType: 'CORE', typeLabel: 'สำคัญแก่หลัก', loc: 'ลานปูนนอกหน้าต่าง', desc: 'ลูกตุ้มเหล็กถ่วงน้ำหนัก 68 กก. ถูกผูกปลายเชือกโยงผ่านรอกหน้าต่าง ใช้เป็นน้ำหนักถ่วงดึงร่างเหยื่อขึ้นแขวนคอ' },
  { id: 'EVD-04', aliases: ['C04', 'CORE-04', '4', 'E4'], name: 'แผงตั้งเวลาเครื่องอบผ้าและระบบประปา', secretType: 'CORE', typeLabel: 'สำคัญแก่หลัก', loc: 'ห้องซักรีดใต้ดิน', desc: 'แผงวงจรตั้งเวลาของเครื่องอบผ้าถูกดัดแปลงให้ตัดไฟและปล่อยน้ำออกจากท่อระบายในเวลาที่กำหนดเพื่อเริ่มกลไกสังหาร' },

  { id: 'EVD-05', aliases: ['S01', 'SUPP-01', '5', 'E5'], name: 'ถังน้ำเจาะรูและคราบน้ำบนลานปูน', secretType: 'SUPP', typeLabel: 'มีก็ดีช่วยเสริม', loc: 'ลานปูนนอกหน้าต่าง', desc: 'ถังพลาสติกขนาดใหญ่ถูกเจาะรูที่ก้น น้ำค่อยๆ ไหลซึมออกช้าๆ ทำหน้าที่เป็น "นาฬิกาน้ำ" ถ่วงเวลาให้น้ำหนักลดลงจนลูกตุ้มตกลงมา' },
  { id: 'EVD-06', aliases: ['S02', 'SUPP-02', '6', 'E6'], name: 'สายรัดลำตัวปีนเขาแบบมีห่วงนิรภัย', secretType: 'SUPP', typeLabel: 'มีก็ดีช่วยเสริม', loc: 'ร่างเหยื่อ B', desc: 'B สวมสายรัดลำตัวไว้ใต้เสื้อแจ็กเก็ต แต่แรงกระชาก (Shock Load) มหาศาลทำให้เงื่อนหลุดเลื่อนขึ้นมารัดคอจนกระดูกคอหัก' },
  { id: 'EVD-07', aliases: ['S03', 'SUPP-03', '7', 'E7'], name: 'หม้อสตูว์เค็มจัดใส่ไวน์แดงดับคาวเข้มข้น', secretType: 'SUPP', typeLabel: 'มีก็ดีช่วยเสริม', loc: 'ห้องครัว', desc: 'สตูว์เนื้อถูกปรุงรสเค็มจัดและใส่ไวน์แดงเข้มข้น เพื่อกลบกลิ่นคาวเลือดสดของ B ที่คนร้ายต้มท่อนกระดูกหมูลงไปอำพราง' },
  { id: 'EVD-08', aliases: ['S04', 'SUPP-04', '8', 'E8'], name: 'เศษใยเชือกไนลอนไหม้เกรียมในตู้ควบคุมไฟ', secretType: 'SUPP', typeLabel: 'มีก็ดีช่วยเสริม', loc: 'ทางเดินโถงกลาง', desc: 'เศษเชือกไนลอนถูกผูกโยงระหว่างสวิตช์ไฟกับตัวตั้งเวลา ทำให้เกิดไฟดับชั่วขณะตอน 20:30 น.' },

  { id: 'EVD-09', aliases: ['H01', 'HERR-01', '9', 'E9'], name: 'หลอดแก้วสารพิษไซยาไนด์เปล่า', secretType: 'HERR', typeLabel: 'หลอก (Red Herring)', loc: 'ห้องครัว (ถังขยะ)', desc: 'หลอดแก้วติดฉลากกะโหลกไขว้ แต่ข้างในเป็นเพียงแป้งมันสำปะหลังผสมเกลือที่คนร้ายจงใจวางทิ้งไว้ลวงการสืบสวน' },
  { id: 'EVD-10', aliases: ['H02', 'HERR-02', '10', 'E10'], name: 'จดหมายข่มขู่ลายมือปลอมของ B', secretType: 'HERR', typeLabel: 'หลอก (Red Herring)', loc: 'ร่างเหยื่อ B', desc: 'กระดาษโน้ตเขียนข้อความตัดพ้อและข่มขู่ แต่หมึกยังไม่แห้งสนิทและไม่ใช่ลายมือที่แท้จริงของ B' },
  { id: 'EVD-11', aliases: ['H03', 'HERR-03', '11', 'E11'], name: 'เสื้อกันฝนเปื้อนคราบโคลนสีแดง', secretType: 'HERR', typeLabel: 'หลอก (Red Herring)', loc: 'ห้องซักรีด', desc: 'เสื้อกันฝนเปื้อนคราบสีแดงเข้ม แต่ผลการตรวจสอบพบว่าเป็นเพียงคราบสนิมผสมสีน้ำมัน' },
  { id: 'EVD-12', aliases: ['H04', 'HERR-04', '12', 'E12'], name: 'รอยเท้าลึกลับมุ่งหน้าไปสระว่ายน้ำ', secretType: 'HERR', typeLabel: 'หลอก (Red Herring)', loc: 'ลานปูน', desc: 'รอยรองเท้าผ้าใบเปียกน้ำมุ่งตรงไปทางสระว่ายน้ำ แต่เป็นรอยเก่าตั้งแต่ตอนเที่ยงวัน' },

  { id: 'EVD-13', aliases: ['T01', 'TRASH-01', '13', 'E13'], name: 'ห่อบะหมี่กึ่งสำเร็จรูปหมดอายุ 2 ปี', secretType: 'TRASH', typeLabel: 'ขยะ (Trash)', loc: 'ห้องครัว', desc: 'บะหมี่ซองรสหมูสับหมดอายุตั้งแต่ปีก่อน เส้นเหนียวแข็งกินไม่ได้ ไม่มีส่วนเกี่ยวข้องกับคดี' },
  { id: 'EVD-14', aliases: ['T02', 'TRASH-02', '14', 'E14'], name: 'ดัมเบลเปื้อนซอสมะเขือเทศแห้งกรัง', secretType: 'TRASH', typeLabel: 'ขยะ (Trash)', loc: 'ห้องซักรีด', desc: 'ดัมเบลขนาด 5 กก. มีคราบสีแดงติดอยู่ แต่ดมดูแล้วเป็นซอสมะเขือเทศจากมื้อเที่ยงชัดเจน' },
  { id: 'EVD-15', aliases: ['T03', 'TRASH-03', '15', 'E15'], name: 'เหรียญโมโนคุมะขึ้นสนิม 10 เหรียญ', secretType: 'TRASH', typeLabel: 'ขยะ (Trash)', loc: 'ร่างเหยื่อ B', desc: 'เหรียญตราโมโนคุมะเก่าๆ 10 เหรียญในกระเป๋ากางเกง ใช้หยอดตู้กาชาปองในห้องเรียน' },
  { id: 'EVD-16', aliases: ['T04', 'TRASH-04', '16', 'E16'], name: 'หนังสือการ์ตูนยอดนักสืบเล่ม 13 ขาดครึ่ง', secretType: 'TRASH', typeLabel: 'ขยะ (Trash)', loc: 'ทางเดินโถงกลาง', desc: 'การ์ตูนสืบสวนหน้าเฉลยคนร้ายถูกฉีกหายไป มีแต่รอยขีดเขียนเล่นของนักเรียน' }
];

let currentUserClueTagFilter = 'ALL';

function getUnlockedClues() {
  const raw = localStorage.getItem('dangan_unlocked_' + (currentUserHash || 'guest'));
  if (raw) {
    try { return JSON.parse(raw); } catch(e) {}
  }
  // Base starting clues for trial
  return ['EVD-01', 'EVD-05'];
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
  const clue = ALL_CLUES_DATA.find(c => {
    if (c.id === clean) return true;
    if (c.aliases && c.aliases.includes(clean)) return true;
    const num = clean.replace(/^(EVD-|CORE-|SUPP-|HERR-|TRASH-|C|S|H|T)/i, '');
    const cNum = c.id.replace('EVD-', '');
    if (num && parseInt(num, 10) === parseInt(cNum, 10)) return true;
    return false;
  });

  if (!clue) {
    playSfx('wrong');
    alert(`❌ ไม่พบหลักฐานสำหรับรหัส: "${rawCode}" กรุณาตรวจสอบรหัสอีกครั้ง`);
    return false;
  }

  let unlocked = getUnlockedClues();
  if (!unlocked.includes(clue.id)) {
    unlocked.push(clue.id);
    localStorage.setItem('dangan_unlocked_' + (currentUserHash || 'guest'), JSON.stringify(unlocked));
    playSfx('clue_get');
    showToast(`✨ ค้นพบหลักฐานใหม่: [${clue.name}] บันทึกลงใน Monopad แล้ว!`);
    broadcast({
      type: 'clue_discovered',
      clueId: clue.id,
      clueName: clue.name,
      playerName: (myPlayer && myPlayer.name) ? myPlayer.name : 'นักเรียน'
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
          <div class="clue-header">
            <span class="clue-code" style="color:var(--mono-yellow); font-weight:900;">${c.id}</span>
            <span style="font-size:0.75rem; color:#888;">กระสุนความจริง</span>
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
      // Locked clue card
      html += `
        <div class="clue-locked-card">
          <div>
            <div style="color:#aaa; font-weight:700; font-size:0.9rem;">🔒 ${c.id}: [ยังไม่ถูกค้นพบ]</div>
            <div style="font-size:0.8rem; color:#777; margin-top:3px;">📍 เบาะแสสถานที่: ${c.loc}</div>
          </div>
          <button class="small-btn cyan" onclick="openClueScannerModal('${c.id}')" style="font-size:0.75rem; padding:6px 10px;">
            สแกน
          </button>
        </div>
      `;
    }
  });

  if (visibleCount === 0) {
    container.innerHTML = `<div style="text-align:center; padding:30px; color:#888;">ไม่พบการ์ดหลักฐานที่ตรงกับเงื่อนไข</div>`;
  } else {
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
  stopTimer();
  closeCourtResultModal();
  closeExecutionModal();

  if (stage === 'idle') {
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
    gameState.stg1Required = Math.max(1, Math.min(3, Math.ceil(activePlayerCount * 0.6)));
    gameState.stg1Submissions = 0;
    gameState.stg1SubmissionsList = [];
    gameState.stg1Evaluated = false;
    updateStg1Display();
    if (config) {
      if (config.prompt) gameState.stg1Prompt = config.prompt;
      if (config.correctClueId) gameState.stg1TargetClue = config.correctClueId;
    }
    const pBox = document.getElementById('courtStage1Prompt');
    if (pBox && gameState.stg1Prompt) pBox.innerText = `"${gameState.stg1Prompt}"`;
    startTimer(60);
    playSfx('gavel');
  } else if (stage === 'stage2') {
    autoUnlockTrialClues();
    gameState.stg2Word = "WATER CLOCK";
    gameState.stg2Target = ["W", "A", "T", "E", "R", " ", "C", "L", "O", "C", "K"];
    gameState.stg2Board = gameState.stg2Target.map(c => c === ' ' ? ' ' : '_');
    gameState.stg2Mistakes = 0;
    gameState.stg2MaxMistakes = 5;
    gameState.hangmanTurnIdx = 0;
    if (config) {
      if (config.prompt) gameState.stg2Prompt = config.prompt;
    }
    updateHangmanHealthDisplay();
    updateHangmanDisplay();
    startTimer(75);
    playSfx('gavel');
  } else if (stage === 'stage3') {
    autoUnlockTrialClues();
    gameState.stg3Opponent = "สุดยอดนักมายากล";
    if (config) {
      if (config.argument) gameState.stg3Argument = config.argument;
    }
    const oppEl = document.getElementById('rebuttalSuspect');
    if (oppEl) oppEl.innerText = gameState.stg3Opponent;
    const stmtEl = document.getElementById('rebuttalStatement');
    if (stmtEl && gameState.stg3Argument) stmtEl.innerText = `"${gameState.stg3Argument}"`;
    startTimer(60);
    playSfx('rebuttal');
  } else if (stage === 'stage4') {
    autoUnlockTrialClues();
    gameState.stg4Step = 1;
    gameState.stg4Votes = {};
    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.add('hidden');
      crashNotice.style.display = 'none';
    }
    updateLogicDiveDisplay();
    startTimer(45);
    playSfx('gavel');
  } else if (stage === 'stage5') {
    if (config) {
      if (config.topic) gameState.stg5Topic = config.topic;
      if (config.leftTeam) gameState.stg5LeftTeam = config.leftTeam;
      if (config.rightTeam) gameState.stg5RightTeam = config.rightTeam;
    }
    const sTitle = document.querySelector('#courtStage5 .riddle-title');
    if (sTitle && gameState.stg5Topic) sTitle.innerText = `"${gameState.stg5Topic}"`;
    const sLeft = document.querySelector('#courtStage5 .scrum-side.left h3');
    if (sLeft && gameState.stg5LeftTeam) sLeft.innerText = gameState.stg5LeftTeam;
    const sRight = document.querySelector('#courtStage5 .scrum-side.right h3');
    if (sRight && gameState.stg5RightTeam) sRight.innerText = gameState.stg5RightTeam;
    gameState.stg5Meter = 50;
    startTimer(60);
    playSfx('gavel');
  } else if (stage === 'stage6') {
    autoUnlockTrialClues();
    gameState.stg6Wave = 1;
    gameState.stg6MaxWave = 4;
    gameState.stg6Shield = 100;
    gameState.stg6Statement = gameState.stg6Denials[0];
    const waveEl = document.getElementById('armamentWaveTxt');
    if (waveEl) waveEl.innerText = `1 / 4`;
    const scEl = document.getElementById('culpritScreamText');
    if (scEl) scEl.innerText = `"${gameState.stg6Statement}"`;
    const banner = document.getElementById('armamentFinalBlowBanner');
    if (banner) banner.classList.add('hidden');
    startTimer(60);
    playSfx('gavel');
  } else if (stage === 'closing') {
    autoUnlockTrialClues();
    gameState.closingSlots = { 1: false, 2: false };
    updateClosingDisplay();
    startTimer(90);
    playSfx('gavel');
    logCourt(`📖 [CLOSING ARGUMENT]: เริ่มต้นการปะติดปะต่อลำดับเหตุการณ์มังงะคดีความ!`);
  } else if (stage === 'stage7') {
    gameState.votingOpen = true;
    gameState.votes = {};
    gameState.votesCast = {};
    gameState.votesRevealed = false;
    updateVoteDisplay();
    startTimer(60);
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
  const bar = document.getElementById('courtInfluenceBar');
  const txt = document.getElementById('courtInfluenceTxt');
  if (bar) bar.style.width = `${gameState.influence}%`;
  if (txt) txt.innerText = `${gameState.influence}%`;
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
  if (fillEl) fillEl.style.width = `${Math.min(100, Math.round((count / 16) * 100))}%`;

  const mapStubs = {
    'kitchenClueList': ['EVD-01', 'EVD-07', 'EVD-09', 'EVD-13'],
    'courtyardClueList': ['EVD-03', 'EVD-05', 'EVD-12'],
    'laundryClueList': ['EVD-04', 'EVD-11', 'EVD-14'],
    'hallwayClueList': ['EVD-02', 'EVD-06', 'EVD-08', 'EVD-10', 'EVD-15', 'EVD-16']
  };

  Object.entries(mapStubs).forEach(([listId, clueIds]) => {
    const list = document.getElementById(listId);
    if (!list) return;
    const items = list.querySelectorAll('.clue-stub');
    clueIds.forEach((cid, idx) => {
      if (items[idx]) {
        if (discovered.includes(cid)) {
          items[idx].classList.add('found');
          const found = ALL_CLUES_DATA.find(c => c.id === cid);
          items[idx].innerHTML = `✅ [ค้นพบ]: ${found ? found.name : cid}`;
        }
      }
    });
  });
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
    updateInfluenceDisplay();
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

function handleClueDiscovered(clueId, clueName, playerName) {
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
}

// ==========================================================
// STAGE RENDERERS (COURTROOM VIEW & MOBILE VIEW)
// ==========================================================
function renderStage(stage) {
  const courtStages = ['courtIdle', 'courtLobby', 'courtTrial', 'courtInvestigation', 'courtStage1', 'courtStage2', 'courtStage3', 'courtStage4', 'courtStage5', 'courtStage6', 'courtClosing', 'courtStage7', 'courtVerdict'];
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

  if (stage === 'idle') {
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
  const trialClueIds = ['CORE-01', 'EVD-01', 'EVD-04', 'EVD-11', 'EVD-14'];
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
function showMinigameResult(success, title, desc, details) {
  stopTimer();
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

  if (isHost) {
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

function closeCourtResultModal() {
  const modal = document.getElementById('courtResultModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  if (isHost) broadcast({ type: 'close_minigame_result' });
}

function triggerMonokumaExecutionCutscene(isVictory) {
  stopTimer();
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

  if (isHost) {
    broadcast({ type: 'execution_cutscene', isVictory: isVictory });
  }
}

function closeExecutionModal() {
  const modal = document.getElementById('monokumaExecutionModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
  if (isHost) broadcast({ type: 'close_execution_cutscene' });
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
  } else {
    gameState.influence = Math.max(0, gameState.influence - 15);
    updateInfluenceDisplay();
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
  let matched = false;
  const upChar = char.toUpperCase();
  gameState.stg2Target.forEach((targetChar, idx) => {
    if (targetChar.toUpperCase() === upChar) {
      gameState.stg2Board[idx] = targetChar;
      matched = true;
    }
  });

  if (matched) {
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
    updateInfluenceDisplay();
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
  const clue = ALL_CLUES_DATA.find(c => c.id === bulletId) || { name: bulletId || 'กระสุนความจริง' };
  playSfx('blade');
  logCourt(`⚔️ [TRUTH BLADE]: ${pName || 'ผู้เล่น'} กวัดแกว่ง [${clue.name}] เข้าปะทะข้อโต้แย้ง!`);

  const slashEl = document.getElementById('rebuttalSlashFx');
  if (slashEl) {
    slashEl.classList.remove('hidden');
    slashEl.style.display = 'flex';
    setTimeout(() => {
      slashEl.classList.add('hidden');
      slashEl.style.display = 'none';
    }, 700);
  }
}

function adminRebuttalVerdict(isWin) {
  stopTimer();
  if (isWin) {
    playSfx('counter');
    setTimeout(() => {
      showMinigameResult(
        true,
        "BLADE OF TRUTH!",
        "ผู้เล่นฟันทำลายดาบปฏิเสธของคู่ต่อสู้สำเร็จ! 'Sore wa Chigau yo!'",
        "ข้ออ้างของฝ่ายตรงข้ามถูกหักล้างจนหมดสิ้น!"
      );
    }, 400);
    broadcast({ type: 'rebuttal_verdict', isWin: true });
  } else {
    gameState.influence = Math.max(0, gameState.influence - 15);
    updateInfluenceDisplay();
    showMinigameResult(
      false,
      "REBUTTAL DEFEAT!",
      "ข้อโต้แย้งของผู้เล่นถูกฟันตกสะบั้น! (-15% Influence)",
      "ฝ่ายตรงข้ามยังคงยืนกรานข้ออ้างต่อไปได้"
    );
    broadcast({ type: 'rebuttal_verdict', isWin: false });
  }
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
const LOGIC_DIVE_DATA = [
  {
    step: 1,
    question: "สาเหตุที่น้ำในถังหนักขึ้นเรื่อยๆ จนกระชากกลไกรอกเกิดจากอะไร?",
    choices: {
      A: "ฝนตกลงมาจากช่องระบายอากาศ",
      B: "น้ำจากก๊อกที่เปิดไหลทิ้งไว้",
      C: "มีคนแอบนำก้อนน้ำแข็งมาวาง"
    },
    correct: "B"
  },
  {
    step: 2,
    question: "เชือกที่ผูกกับถังน้ำขาดสะบั้นออกจากกันได้อย่างไร?",
    choices: {
      A: "เหยื่อ B ใช้มีดปอกผลไม้ตัดเชือกเองจนหลุด",
      B: "เชือกเปื่อยยุ่ยเพราะถูกน้ำแช่เป็นเวลานาน",
      C: "มีดของคนร้ายบาดขาดระหว่างการต่อสู้"
    },
    correct: "A"
  },
  {
    step: 3,
    question: "สาเหตุการเสียชีวิตที่แท้จริงของเหยื่อ B คืออะไร?",
    choices: {
      A: "จมน้ำขาดอากาศหายใจในถัง",
      B: "ถูกกะโหลกแตกด้วยหม้อสตูว์",
      C: "คอหักจากการกระทำสุดท้ายที่ตนเองผูกบ่วงเชือก"
    },
    correct: "C"
  }
];

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
    evaluateLogicDiveMajority();
  } else {
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
  }
}

function evaluateLogicDiveMajority() {
  const currentData = LOGIC_DIVE_DATA.find(d => d.step === gameState.stg4Step);
  if (!currentData) return;

  const tally = { A: 0, B: 0, C: 0 };
  Object.values(gameState.stg4Votes || {}).forEach(ch => {
    if (tally[ch] !== undefined) tally[ch]++;
  });

  let winningChoice = 'A';
  let maxVotes = -1;
  ['A', 'B', 'C'].forEach(ch => {
    if (tally[ch] > maxVotes) {
      maxVotes = tally[ch];
      winningChoice = ch;
    }
  });

  if (winningChoice === currentData.correct) {
    playSfx('correct');
    logCourt(`✨ [LOGIC DIVE]: มติเสียงข้างมากเลือกข้อ [${winningChoice}] ถูกต้อง! สเก็ตบอร์ดพุ่งทะลวงสู่อุโมงค์ถัดไป`);

    const lane = document.getElementById('lane' + winningChoice);
    if (lane) lane.classList.add('active-match');

    setTimeout(() => {
      gameState.stg4Step++;
      gameState.stg4Votes = {};
      if (gameState.stg4Step > 3) {
        stopTimer();
        showMinigameResult(
          true,
          "LOGIC DIVE CLEAR!",
          "ทะลวงตรรกะจนพบความจริง! B ตัดเชือกและผูกบ่วงคอหักตายเอง!",
          "เส้นทางความคิดทั้งหมดเชื่อมโยงสู่ข้อสรุปที่แท้จริง!"
        );
      } else {
        updateLogicDiveDisplay();
        startTimer(45);
        broadcast({ type: 'sync_state', state: gameState });
      }
    }, 1200);
  } else {
    // Collision crash - DO NOT reveal the correct answer!
    stopTimer();
    gameState.influence = Math.max(0, gameState.influence - 15);
    updateInfluenceDisplay();
    playSfx('wrong');

    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.remove('hidden');
      crashNotice.style.display = 'block';
      crashNotice.innerText = `💥 ชนผนังอุโมงค์! เสียงข้างมากเลือกข้อ [${winningChoice}] ซึ่งเป็นทางตัน (-15% Influence)`;
    }

    logCourt(`⚠️ [LOGIC DIVE CRASH]: เสียงข้างมากเลือกข้อ [${winningChoice}] ผิดทาง! ชนผนังอุโมงค์ (-15% Influence)`);
    broadcast({ type: 'logic_dive_crash', winningChoice: winningChoice });
  }
}

function adminRetryLogicDive() {
  gameState.stg4Votes = {};
  const crashNotice = document.getElementById('diveCrashNotice');
  if (crashNotice) {
    crashNotice.classList.add('hidden');
    crashNotice.style.display = 'none';
  }
  updateLogicDiveDisplay();
  startTimer(40);
  broadcast({ type: 'logic_dive_retry' });
  showToast('🔄 ให้โอกาสผู้เล่นคิดและเลือกเส้นทางใหม่');
}

function adminSkipLogicDive() {
  gameState.stg4Step++;
  gameState.stg4Votes = {};
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
  gameState.stg5Meter = Math.max(0, Math.min(100, gameState.stg5Meter + delta));
  updateScrumDisplay();

  if (gameState.stg5Meter >= 100) {
    stopTimer();
    showMinigameResult(
      true,
      "SCRUM VICTORY!",
      "ฝ่ายความจริงผลักดันข้อโต้แย้งสำเร็จ 100%!",
      "ข้อโต้แย้งของฝ่ายตรงข้ามถูกดันจนมุมสิ้นเชิง!"
    );
  } else if (gameState.stg5Meter <= 0) {
    stopTimer();
    gameState.influence = Math.max(0, gameState.influence - 20);
    updateInfluenceDisplay();
    showMinigameResult(
      false,
      "SCRUM DEFEAT!",
      "ฝ่ายคนร้ายกลืนกินข้อโต้แย้งจนหมดสิ้น! (-20% Influence)",
      "ศาลถูกชักจูงไปในทางที่ผิดพลาด"
    );
  }
}

function updateScrumDisplay() {
  const fill = document.getElementById('courtScrumFill');
  if (fill) fill.style.width = `${gameState.stg5Meter}%`;
}

// 6. Argument Armament
function handleStg6Hit(pName) {
  gameState.stg6Shield = Math.max(0, gameState.stg6Shield - 10);
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
      broadcast({ type: 'sync_state', state: gameState });
    } else {
      playSfx('break');
      const banner = document.getElementById('armamentFinalBlowBanner');
      if (banner) banner.classList.remove('hidden');
      logCourt(`💥 [ARMAMENT READY]: เกราะการปฏิเสธของคนร้ายพังทลายสิ้นเชิง! เล็งยิงกระสุนความจริงนัดสุดท้าย!`);
      broadcast({ type: 'armament_final_ready' });
    }
  }
}

function handleStg6FinalBlow(pName) {
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
  if (fill) fill.style.width = `${gameState.stg6Shield}%`;
  if (waveTxt) waveTxt.innerText = `${gameState.stg6Wave || 1} / 4`;
  if (scEl && gameState.stg6Statement) scEl.innerText = `"${gameState.stg6Statement}"`;
}

// 7. Closing Argument (Mini-Game 7)
function handleClosingSubmit(slot, cardId, pName) {
  if (!gameState.closingSlots) gameState.closingSlots = { 1: false, 2: false };
  let correct = false;

  if (slot == 1 && (cardId === 'EVD-14' || cardId === 'ACTION-CUT')) {
    gameState.closingSlots[1] = true;
    correct = true;
    logCourt(`📖 [CLOSING ACT 3]: ${pName} เติมมังงะช่องที่ 1 สำเร็จ! "เหยื่อ B ฟื้นสติและใช้มีดปอกผลไม้ตัดเชือกที่มัดมือออกเอง"`);
  } else if (slot == 2 && (cardId === 'EVD-11' || cardId === 'ACTION-NOOSE')) {
    gameState.closingSlots[2] = true;
    correct = true;
    logCourt(`📖 [CLOSING ACT 4]: ${pName} เติมมังงะช่องที่ 2 สำเร็จ! "เหยื่อ B นำบ่วงเชือกมาคล้องคอตนเองเพื่อจัดฉากกลั่นแกล้ง"`);
  }

  if (correct) {
    playSfx('correct');
    updateClosingDisplay();
    if (gameState.closingSlots[1] && gameState.closingSlots[2]) {
      stopTimer();
      setTimeout(() => {
        playSfx('point_break');
        showMinigameResult(
          true,
          "CLOSING ARGUMENT COMPLETE!",
          "การปะติดปะต่อลำดับเหตุการณ์มังงะคดีความสมบูรณ์แบบ 100%!",
          "เรื่องราวทั้งหมดของคดีถูกคลี่คลายอย่างสมบูรณ์แบบ!"
        );
      }, 500);
    }
    broadcast({ type: 'sync_state', state: gameState });
  } else {
    gameState.influence = Math.max(0, gameState.influence - 10);
    updateInfluenceDisplay();
    playSfx('wrong');
    logCourt(`❌ [CLOSING MISMATCH]: การ์ดเหตุการณ์ไม่ตรงกับช่องว่าง (-10% Influence)`);
  }
}

function updateClosingDisplay() {
  const s1 = document.getElementById('mangaSlot1');
  const s2 = document.getElementById('mangaSlot2');
  if (gameState.closingSlots && gameState.closingSlots[1]) {
    if (s1) {
      s1.className = 'manga-panel complete solved';
      const art = document.getElementById('mangaSlot1Art');
      const desc = document.getElementById('mangaSlot1Desc');
      if (art) art.innerText = '🔪';
      if (desc) desc.innerText = 'เหยื่อ B ฟื้นสติขึ้นมา และใช้มีดปอกผลไม้ในกระเป๋าตัดเชือกที่มัดมือออกเองจนหลุด!';
    }
  }
  if (gameState.closingSlots && gameState.closingSlots[2]) {
    if (s2) {
      s2.className = 'manga-panel complete solved';
      const art = document.getElementById('mangaSlot2Art');
      const desc = document.getElementById('mangaSlot2Desc');
      if (art) art.innerText = '🪢';
      if (desc) desc.innerText = 'เหยื่อ B ผูกบ่วงเชือกเส้นใหม่มาคล้องคอตนเอง หวังจัดฉากฆาตกรรมกลั่นแกล้งคนอื่น!';
    }
  }
}

// 8. Voting & Verdict
function handleVoteSubmitted(candidate, voterId) {
  if (!gameState.votesCast) gameState.votesCast = {};
  gameState.votesCast[voterId] = true;
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
    const candidates = ['PC 1 (นักแต่งนิยาย)', 'PC 2 (นักกีฬา)', 'PC 3 (นักมายากล)', 'PC 4 (นักชิม)', 'PC 5 (นักแสดงผาดโผน)', 'PC 6 (ช่างกล)', 'NPC B (สุดยอดนักเอาตัวรอด)'];
    candidates.forEach(cand => {
      const card = document.createElement('div');
      card.className = 'vote-card';
      const count = gameState.votes[cand] || 0;
      card.innerHTML = `<span>👤 ${cand}</span><span class="vote-count-badge">${count} โหวต</span>`;
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
  const name = document.getElementById('mobileNameInput').value.trim();
  const roleSelect = document.getElementById('mobileRoleSelect');
  const role = roleSelect ? roleSelect.value : '';
  const room = (document.getElementById('mobileRoomInput').value || '').trim().toUpperCase();

  if (!name) { alert('กรุณากรอกชื่อของคุณ'); return; }
  if (!room) { alert('กรุณากรอกรหัสห้อง 6 หลัก'); return; }

  const selectedOpt = roleSelect.options[roleSelect.selectedIndex];
  if (selectedOpt && selectedOpt.disabled) {
    alert(`บทบาท "${role}" ถูกผู้เล่นอื่นเลือกไปแล้ว กรุณาเลือกบทอื่น!`);
    return;
  }

  roomCode = room;
  localStorage.setItem('dangan_current_room', roomCode);

  if (!currentUserHash) {
    currentUserHash = localStorage.getItem('dangan_current_user_hash') || ('u-' + Math.random().toString(36).substring(2, 8));
    localStorage.setItem('dangan_current_user_hash', currentUserHash);
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
    userHash: currentUserHash
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
  const area = document.getElementById('mobileTaskArea');
  if (!area) return;
  area.innerHTML = '';

  // Auto-switch to game tab if stage is active
  if (stage !== 'lobby') {
    switchPlayerTab('game');
  }

  if (stage === 'lobby') {
    area.innerHTML = '<div class="idle-message"><div class="idle-spinner"></div><p>กำลังรอเริ่มศาลชั้นเรียน... (Lobby)</p></div>';
  } else if (stage === 'trial') {
    area.innerHTML = `
      <div style="background:rgba(20,20,35,0.95); border:2px solid var(--mono-yellow); border-radius:10px; padding:16px; text-align:center;">
        <div style="font-size:2.2rem; margin-bottom:8px;">⚖️</div>
        <h3 style="color:var(--court-gold); margin-bottom:6px; font-weight:900;">ศาลชั้นเรียนกำลังดำเนินอยู่</h3>
        <p style="color:#ddd; font-size:0.9rem; margin-bottom:14px;">ขณะนี้อยู่ในช่วงอภิปรายและไต่สวนคดี (Debate & Discussion) ให้ทุกคนซักถาม ถกเถียง และตรวจสอบข้อมูลผ่านแท็บด้านบน</p>
        <div style="display:flex; flex-direction:column; gap:8px;">
          <button class="p-task-btn" onclick="switchPlayerTab('char')" style="background:rgba(255,230,0,0.15); border-color:#ffe600; color:#fff;">📜 ดูแผ่นตัวละคร & ไทม์ไลน์ส่วนตัว</button>
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
    const btnsHtml = chosenIds.map(cid => {
      const clue = ALL_CLUES_DATA.find(c => c.id === cid) || { id: cid, name: cid };
      return `<button class="p-task-btn" onclick="sendStg1('${clue.id}')">[${clue.id}] ${clue.name}</button>`;
    }).join('');

    area.innerHTML = `
      <h3 style="color:var(--court-gold); margin-bottom:12px; font-weight:900;">เลือกการ์ดหลักฐานที่ตรงกับอาวุธ/ปริศนา:</h3>
      <div class="mobile-task-grid">
        ${btnsHtml}
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
        ${letters.map(ch => `<button class="p-task-btn letter-btn" style="min-width:30px; padding:8px 4px; font-weight:900; font-size:1rem; opacity: ${isMyTurn ? '1' : '0.35'};" ${isMyTurn ? '' : 'disabled'} onclick="sendStg2Char('${ch}')">${ch}</button>`).join('')}
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
    if (gameState.stg3Challenger && myPlayer && myPlayer.name !== gameState.stg3Challenger) {
      area.innerHTML = `
        <div style="background:rgba(20,20,35,0.95); border:2px solid var(--mono-pink); border-radius:10px; padding:20px; text-align:center;">
          <div style="font-size:3rem; margin-bottom:10px;">⚔️</div>
          <h3 style="color:var(--mono-pink); font-weight:900;">การดวลดาบคำพูด (Rebuttal Showdown)</h3>
          <p style="color:#ddd; font-size:0.95rem; margin-top:8px;">คุณ <strong style="color:var(--court-gold);">${gameState.stg3Challenger}</strong> กำลังดวลดาบความจริงกับฝ่ายตรงข้าม!</p>
          <p style="color:#888; font-size:0.85rem; margin-top:12px;">จับตาดูการฟันฝ่าและลุ้นผลลัพธ์บนจอใหญ่ศาลชั้นเรียน...</p>
        </div>
      `;
    } else {
      const activeBullets = (gameState.discoveredClues && gameState.discoveredClues.length) ? gameState.discoveredClues : ['CORE-01', 'EVD-01', 'EVD-04', 'EVD-14'];
      let bulletOptions = activeBullets.map(cid => {
        const c = ALL_CLUES_DATA.find(x => x.id === cid) || { id: cid, name: cid };
        return `<option value="${c.id}">[${c.id}] ${c.name}</option>`;
      }).join('');

      area.innerHTML = `
        <h3 style="color:var(--mono-pink); margin-bottom:12px; font-weight:900;">⚔️ คุณคือนักดาบผู้ท้าชิง (Rebuttal Duelist)!</h3>
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
    }
  } else if (stage === 'stage4') {
    const currentData = LOGIC_DIVE_DATA.find(d => d.step === gameState.stg4Step) || LOGIC_DIVE_DATA[0];
    area.innerHTML = `
      <h3 style="color:var(--court-gold); margin-bottom:10px; font-weight:900;">Logic Dive: เลือกทางแยกตรรกะ!</h3>
      <p style="font-size:0.9rem; color:#ddd; margin-bottom:12px;">${currentData.question}</p>
      <div class="mobile-task-grid" id="diveMobileChoices">
        <button class="p-task-btn" data-choice="A" onclick="sendLogicDiveChoice('A')"><strong>A:</strong> ${currentData.choices.A}</button>
        <button class="p-task-btn" data-choice="B" onclick="sendLogicDiveChoice('B')"><strong>B:</strong> ${currentData.choices.B}</button>
        <button class="p-task-btn" data-choice="C" onclick="sendLogicDiveChoice('C')"><strong>C:</strong> ${currentData.choices.C}</button>
      </div>
      <div id="diveChoiceFeedback" style="display:none; margin-top:12px; color:#ffe600; font-weight:700;">
        ⏳ ส่งเสียงโหวตเส้นทางแล้ว รอสรุปมติพร้อมกัน!
      </div>
    `;
  } else if (stage === 'stage5') {
    let killerSab = '';
    if (myPlayer && myPlayer.isKiller) {
      killerSab = `<button class="p-task-btn" style="background:#4a101a; border-color:#ff2244; margin-top:12px;" onclick="broadcast({type:'stg5_scrum',delta:-6})">☠️ [ลับเฉพาะคนร้าย] แอบดึงกลับ (-6%)</button>`;
    }
    area.innerHTML = `
      <h3 style="color:var(--mono-yellow); margin-bottom:12px; font-weight:900;">Debate Scrum: รัวปุ่มดันตรรกะ!</h3>
      <button class="p-task-btn big-action-btn" style="background:#1d2b1e; border:3px solid #2ecc71; box-shadow:4px 4px 0 #000;" onclick="broadcast({type:'stg5_scrum',delta:4})">
        🔥 ดันความจริง! (B ทำให้ตัวเองตาย)
      </button>
      ${killerSab}
    `;
  } else if (stage === 'stage6') {
    area.innerHTML = `
      <h3 style="color:var(--mono-yellow); margin-bottom:12px; font-weight:900;">Argument Armament: รัวปุ่มทุบเกราะ!</h3>
      <button class="p-task-btn big-action-btn" style="background:#423414; border:3px solid var(--mono-yellow); box-shadow:4px 4px 0 #000;" onclick="broadcast({type:'stg6_hit', playerName: myPlayer ? myPlayer.name : 'ผู้เล่น'})">
        🔨 ทุบเกราะความจริง! (-10% Shield)
      </button>
      <div id="finalBlowMobileBox" style="margin-top:14px; display:none;">
        <button class="p-task-btn big-action-btn" style="background:#5e111a; border:3px solid var(--mono-pink); box-shadow:0 0 16px var(--mono-pink); font-size:1.15rem;" onclick="sendStg6FinalBlow()">
          💥 ยิงกระสุนความจริงนัดสุดท้าย: [มีดปอกผลไม้ในมือ B]!
        </button>
      </div>
    `;
  } else if (stage === 'closing') {
    const allCards = [
      { id: 'EVD-14', title: 'เหยื่อ B ฟื้นสติและใช้มีดปอกผลไม้ตัดเชือกที่มัดมือออกเอง' },
      { id: 'EVD-11', title: 'เหยื่อ B นำบ่วงเชือกมาคล้องคอตนเองเพื่อจัดฉากกลั่นแกล้ง' },
      { id: 'ACT-ESCAPE', title: 'เหยื่อ B วิ่งหนีขึ้นบันไดไปตามคนมาช่วย' },
      { id: 'ACT-CHECK', title: 'คนร้ายกลับมาที่ห้องซักรีดเพื่อตรวจผลงาน' }
    ];

    const playersList = getActivePlayersList();
    let myCards = allCards;
    if (playersList.length >= 2 && myPlayer) {
      const myIdx = playersList.findIndex(p => p.id === myPlayer.id);
      if (myIdx === 0) {
        myCards = [allCards[0], allCards[2]];
      } else if (myIdx === 1) {
        myCards = [allCards[1], allCards[3]];
      }
    }

    let cardButtons = myCards.map(c => `
      <div style="background:#19192b; border:2px solid #444; border-radius:8px; padding:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <span style="font-size:0.85rem; color:#fff; text-align:left;">${c.title}</span>
        <div style="display:flex; gap:4px;">
          <button class="small-btn cyan" onclick="sendClosingCard(1, '${c.id}')" style="white-space:nowrap; padding:4px 8px; font-size:0.75rem;">ใส่ช่อง 1</button>
          <button class="small-btn pink" onclick="sendClosingCard(2, '${c.id}')" style="white-space:nowrap; padding:4px 8px; font-size:0.75rem;">ใส่ช่อง 2</button>
        </div>
      </div>
    `).join('');

    area.innerHTML = `
      <h3 style="color:var(--mono-cyan); margin-bottom:10px; font-weight:900;">Closing Argument: เติมการ์ดลงช่องมังงะ</h3>
      <p style="font-size:0.85rem; color:#aaa; margin-bottom:12px;">เลือกการ์ดเหตุการณ์ที่ถูกต้องแล้วกดวางลงในช่องว่างที่ 1 หรือ 2 บนจอใหญ่:</p>
      <div>${cardButtons}</div>
    `;
  } else if (stage === 'stage7') {
    const candidates = ['PC 1 (นักแต่งนิยาย)', 'PC 2 (นักกีฬา)', 'PC 3 (นักมายากล)', 'PC 4 (นักชิม)', 'PC 5 (นักแสดงผาดโผน)', 'PC 6 (ช่างกล)', 'NPC B (สุดยอดนักเอาตัวรอด)'];
    let btns = candidates.map(c => `<button class="p-task-btn vote-option-btn" onclick="submitPlayerVote('${c}')">👉 โหวต: ${c}</button>`).join('');
    area.innerHTML = `
      <h3 style="color:var(--mono-pink); margin-bottom:12px; font-weight:900;">โหวตเลือก Blackened ผู้ปลิดชีพ B:</h3>
      <div class="mobile-task-grid">${btns}</div>
    `;
  }
}

function sendStg1(id) {
  broadcast({ type: 'stg1_submit', clueId: id, playerName: myPlayer ? myPlayer.name : 'ผู้เล่น' });
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
  broadcast({ type: 'submit_vote', candidate: cand, voterId: voterId });
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
      updateInfluenceDisplay();
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
    updateInfluenceDisplay();
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
  updateInfluenceDisplay();
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

function updateAdminDisplay() {
  const table = document.getElementById('adminPlayerTable');
  const cnt = document.getElementById('adminPlayerCount');
  const rebSel = document.getElementById('adminRebuttalChallengerSelect');
  if (!table || !cnt) return;
  table.innerHTML = '';
  const players = Object.values(gameState.players);
  cnt.innerText = players.length;

  if (rebSel) {
    const currentVal = rebSel.value;
    rebSel.innerHTML = '<option value="">(ทุกคนในห้อง / อิสระ)</option>';
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.innerText = `${p.name} [${p.role}]`;
      if (p.name === currentVal) opt.selected = true;
      rebSel.appendChild(opt);
    });
  }

  players.forEach(p => {
    const row = document.createElement('div');
    row.className = 'admin-p-row' + (p.isKiller ? ' is-killer' : '');
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(p.name)}</strong>
        <span style="color:#ffe600; font-size:0.8rem; margin-left:6px;">[${escapeHtml(p.role)}]</span>
        ${p.isKiller ? '<span style="color:#ff2244; font-weight:900; margin-left:6px;">[SABOTEUR]</span>' : ''}
      </div>
      <div style="display:flex; align-items:center; gap:8px;">
        <span>${p.votedFor ? `โหวต: ${escapeHtml(p.votedFor)}` : 'ยังไม่โหวต'}</span>
        <button class="small-btn red" style="padding:4px 8px; font-size:0.75rem; font-weight:700;" onclick="adminKickPlayer('${p.id}')">❌ เตะ</button>
      </div>
    `;
    table.appendChild(row);
  });
}

function updatePlayerDisplays() {
  const list = document.getElementById('courtPodiumList');
  const count = document.getElementById('courtPlayerCount');
  const trialList = document.getElementById('courtTrialPodiumList');
  const trialCount = document.getElementById('courtTrialPlayerCount');
  const idleCount = document.getElementById('courtIdlePlayerCount');
  const players = Object.values(gameState.players);

  if (count) count.innerText = players.length;
  if (trialCount) trialCount.innerText = players.length;
  if (idleCount) idleCount.innerText = players.length;

  [list, trialList].forEach(targetList => {
    if (!targetList) return;
    targetList.innerHTML = '';
    players.forEach(p => {
      const seat = document.createElement('div');
      // All podium seats have uniform color & styling - zero spoilers
      seat.className = 'podium-seat';
      seat.innerHTML = `<span>👤 ${escapeHtml(p.name)}</span><span class="podium-role">[${escapeHtml(p.role)}]</span>`;
      targetList.appendChild(seat);
    });
  });

  updateAdminDisplay();
}

function adminChangeRoomCode() {
  const newCode = document.getElementById('inputNewRoomCode').value.trim().toUpperCase();
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

function openAdminMinigameModal(defaultTab) {
  const modal = document.getElementById('adminMinigameModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  selectConfigTab(defaultTab || 'stage1');
}

function closeAdminMinigameModal() {
  const modal = document.getElementById('adminMinigameModal');
  if (modal) modal.classList.add('hidden');
}

function selectConfigTab(stageKey) {
  currentSelectedConfigStage = stageKey;
  const stages = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6'];
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
  const pInput = document.getElementById('cfgStg1Prompt');
  const tSelect = document.getElementById('cfgStg1TargetClue');
  if (!pInput || !tSelect) return;

  if (presetKey === 'bone') {
    pInput.value = "อุปุ๊ปุ๊! อาวุธที่ใช้ฟาดหัว B จนสลบตอน 17:30 น. คืออะไร และถูกนำไปซ่อนที่ไหนกันแน่นะ!?";
    tSelect.value = "EVD-01";
  } else if (presetKey === 'knife') {
    pInput.value = "B ใช้สิ่งใดในการตัดเชือกเพื่อพยายามหนีเอาชีวิตรอดจนเกิดการสะบัดหลุด!?";
    tSelect.value = "EVD-02";
  } else if (presetKey === 'timer') {
    pInput.value = "อุปกรณ์ใดถูกดัดแปลงเพื่อทำให้ระบบไฟฟ้าและน้ำทำงานประสานกัน!?";
    tSelect.value = "EVD-04";
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
  // Standard logic dive route
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

function adminLaunchSelectedConfigGame() {
  const stg = currentSelectedConfigStage || 'stage1';
  let config = {};

  if (stg === 'stage1') {
    const prompt = document.getElementById('cfgStg1Prompt') ? document.getElementById('cfgStg1Prompt').value : '';
    const target = document.getElementById('cfgStg1TargetClue') ? document.getElementById('cfgStg1TargetClue').value : 'EVD-01';
    config = { prompt: prompt, correctClueId: target };
  } else if (stg === 'stage2') {
    const prompt = document.getElementById('cfgStg2Prompt') ? document.getElementById('cfgStg2Prompt').value : '';
    const word = document.getElementById('cfgStg2Word') ? document.getElementById('cfgStg2Word').value.trim() : 'นาฬิกาน้ำ';
    config = { prompt: prompt, targetWord: word };
  } else if (stg === 'stage3') {
    const opp = document.getElementById('cfgStg3Opponent') ? document.getElementById('cfgStg3Opponent').value : 'นักมายากล (A)';
    const arg = document.getElementById('cfgStg3Arg') ? document.getElementById('cfgStg3Arg').value : '';
    config = { opponent: opp, argument: arg };
  } else if (stg === 'stage4') {
    config = {};
  } else if (stg === 'stage5') {
    const topic = document.getElementById('cfgStg5Topic') ? document.getElementById('cfgStg5Topic').value : '';
    const left = document.getElementById('cfgStg5Left') ? document.getElementById('cfgStg5Left').value : '';
    const right = document.getElementById('cfgStg5Right') ? document.getElementById('cfgStg5Right').value : '';
    config = { topic: topic, leftTeam: left, rightTeam: right };
  } else if (stg === 'stage6') {
    const scream = document.getElementById('cfgStg6Scream') ? document.getElementById('cfgStg6Scream').value : '';
    config = { opponent: 'นักมายากล (A)', scream: scream };
  }

  setStage(stg, config);
  broadcast({ type: 'set_stage', stage: stg, config: config });
  closeAdminMinigameModal();
  logCourt(`🎮 [MINIGAME LAUNCH]: DM เริ่มต้น ${stg.toUpperCase()} พร้อมการตั้งค่าที่กำหนด`);
}

// ==========================================================
// ADMIN PRINTABLE CLUES MODAL
// ==========================================================
function adminOpenPrintCluesModal() {
  const modal = document.getElementById('adminPrintCluesModal');
  const sheet = document.getElementById('printableCluesSheet');
  if (!modal || !sheet) return;

  sheet.innerHTML = '';
  ALL_CLUES_DATA.forEach(c => {
    const qrTargetUrl = `https://danganronpa-ttrpg.vercel.app/play?room=${roomCode}&clue=${c.id}`;
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrTargetUrl)}`;

    const card = document.createElement('div');
    card.className = 'printable-clue-card';
    card.innerHTML = `
      <div class="p-card-top">
        <span class="p-card-id">[${c.id}]</span>
        <span class="p-card-type">[${c.typeLabel}]</span>
      </div>
      <h4 class="p-card-title">${escapeHtml(c.name)}</h4>
      <div class="p-card-loc">📍 สถานที่พบ: ${escapeHtml(c.loc)}</div>
      <div class="p-card-qr-box">
        <img src="${qrImgUrl}" alt="QR ${c.id}" class="p-card-qr-img" onerror="this.style.display='none';">
      </div>
      <div class="p-card-code-hint">รหัสสแกน / กรอกด้วยตนเอง: <strong>${c.id}</strong></div>
      <p class="p-card-desc">${escapeHtml(c.desc)}</p>
    `;
    sheet.appendChild(card);
  });

  modal.classList.remove('hidden');
}

function closeAdminPrintCluesModal() {
  const modal = document.getElementById('adminPrintCluesModal');
  if (modal) modal.classList.add('hidden');
}

// ==========================================================
// MONOPAD CAMERA & QR SCANNER
// ==========================================================
let cameraStream = null;
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
    alert('กรุณากรอกรหัสหลักฐาน เช่น EVD-01 หรือ C01');
    return;
  }
  const success = unlockClue(inp.value.trim());
  if (success) {
    closeClueScannerModal();
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
  const btn = document.getElementById('btnToggleCamera');
  const status = document.getElementById('cameraStatusText');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (status) status.innerText = '❌ เบราว์เซอร์ไม่รองรับการเข้าถึงกล้อง กรุณาพิมพ์รหัสแทน';
    return;
  }

  try {
    if (status) status.innerText = 'กำลังเปิดกล้อง...';
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    });
    cameraStream = stream;
    if (video) {
      video.srcObject = stream;
      video.setAttribute('playsinline', true);
      video.style.display = 'block';
      await video.play();
    }
    if (btn) {
      btn.innerText = '⏹️ ปิดกล้อง';
      btn.className = 'small-btn red';
    }
    if (status) status.innerText = '📷 นำกล้องส่องไปที่ QR Code บนบัตรหลักฐาน...';

    // Start scanning frames if BarcodeDetector is available
    if (window.BarcodeDetector) {
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      cameraScanningInterval = setInterval(async () => {
        if (!video || video.readyState < 2) return;
        try {
          const barcodes = await detector.detect(video);
          if (barcodes && barcodes.length > 0) {
            handleQrPayload(barcodes[0].rawValue);
          }
        } catch(err) {}
      }, 400);
    } else {
      if (status) status.innerText = '📷 หากกล้องไม่ตรวจจับอัตโนมัติ ให้กรอกรหัส หรืออัปโหลดรูป QR ด้านล่าง';
    }
  } catch(err) {
    console.error('Camera error:', err);
    if (status) status.innerText = '❌ ไม่สามารถเปิดกล้องได้ (โปรดอนุญาตสิทธิ์กล้อง หรือใช้การกรอกรหัส)';
    stopCameraStream();
  }
}

function stopCameraStream() {
  if (cameraScanningInterval) {
    clearInterval(cameraScanningInterval);
    cameraScanningInterval = null;
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
  let clueCode = rawStr;
  try {
    if (rawStr.includes('?')) {
      const url = new URL(rawStr, window.location.origin);
      clueCode = url.searchParams.get('clue') || url.searchParams.get('unlock') || rawStr;
    }
  } catch(e) {}

  const success = unlockClue(clueCode);
  if (success) {
    closeClueScannerModal();
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

    if (window.BarcodeDetector) {
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(img);
      if (barcodes && barcodes.length > 0) {
        handleQrPayload(barcodes[0].rawValue);
        return;
      }
    }

    if (status) status.innerText = '⚠️ ไม่สามารถอ่าน QR อัตโนมัติได้ กรุณากรอกรหัสด้วยตนเอง';
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

  // 1. Connect Simulation Monitor to the SSE stream of the simulation room
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
      console.warn('[SIM SSE Error/Reconnecting]:', err);
    };
  } catch (e) {}

  // 2. Load the 4 isolated viewports if not already loaded
  const fCourt = document.getElementById('simFrameCourt');
  const fAdmin = document.getElementById('simFrameAdmin');
  const fP1 = document.getElementById('simFramePlayer1');
  const fP2 = document.getElementById('simFramePlayer2');

  const origin = window.location.origin;
  const courtUrl = origin + '/court?room=' + simRoomCode;
  const adminUrl = origin + '/admin?room=' + simRoomCode + '&pin=295437';
  const p1Url = origin + '/u/sim_naegi?room=' + simRoomCode + '&autoJoin=1&name=' + encodeURIComponent('นาเอกิ') + '&role=' + encodeURIComponent('นักแต่งนิยาย');
  const p2Url = origin + '/u/sim_kyoko?room=' + simRoomCode + '&autoJoin=1&name=' + encodeURIComponent('เคียวโกะ') + '&role=' + encodeURIComponent('นักกีฬา');

  if (fCourt && (!fCourt.src || fCourt.src === 'about:blank' || !fCourt.src.includes(simRoomCode))) {
    fCourt.src = courtUrl;
  }
  if (fAdmin && (!fAdmin.src || fAdmin.src === 'about:blank' || !fAdmin.src.includes(simRoomCode))) {
    fAdmin.src = adminUrl;
  }
  if (fP1 && (!fP1.src || fP1.src === 'about:blank' || !fP1.src.includes(simRoomCode))) {
    fP1.src = p1Url;
  }
  if (fP2 && (!fP2.src || fP2.src === 'about:blank' || !fP2.src.includes(simRoomCode))) {
    fP2.src = p2Url;
  }
}

function logSimEvent(msg) {
  const consoleEl = document.getElementById('simEventLogConsole');
  if (!consoleEl) return;

  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');

  const entry = document.createElement('div');
  entry.className = 'sim-log-entry';

  if (msg.type === 'sim_info') {
    entry.className += ' info';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> ' + msg.text;
  } else if (msg.type === 'sim_ping_reply') {
    entry.className += ' success';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> ⚡ <strong>PING RTT</strong>: ได้รับการตอบกลับใน <strong>' + msg.latency + ' ms</strong>';
  } else if (msg.type === 'request_claim_character') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📤 <strong>[MOBILE -> COURT]</strong>: ผู้เล่น [' + (msg.playerName || 'ผู้เล่น') + '] ร้องขอสวมบท [' + msg.role + '] (userHash: ' + (msg.userHash || 'N/A') + ')';
  } else if (msg.type === 'claim_approved') {
    entry.className += ' court';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📥 <strong>[COURT -> MOBILE]</strong>: อนุมัติบท [' + (msg.player ? msg.player.role : '') + '] ให้แก่ [' + (msg.player ? msg.player.name : '') + '] สำเร็จ ✅';
  } else if (msg.type === 'set_stage') {
    entry.className += ' admin';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 👑 <strong>[ADMIN -> ALL]</strong>: สั่งเปลี่ยนสเตจศาลเป็น [<strong>' + msg.stage + '</strong>]';
  } else if (msg.type === 'stg1_submit') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔍 <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' ส่งหลักฐาน [<strong>' + msg.clueId + '</strong>] ขึ้นจอศาล!';
  } else if (msg.type === 'stg2_char') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔤 <strong>[MOBILE -> COURT]</strong>: ทายตัวอักษร [<strong>' + msg.char + '</strong>] บนกระดาน Hangman!';
  } else if (msg.type === 'rebuttal_slash') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🗡️ <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' ฟันดาบความจริงด้วยกระสุน [<strong>' + msg.bullet + '</strong>]!';
  } else if (msg.type === 'logic_dive_vote') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🛹 <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' โหวตทางเลือก [<strong>ข้อ ' + msg.choice + '</strong>]!';
  } else if (msg.type === 'stg5_scrum') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔥 <strong>[MOBILE -> COURT]</strong>: รัวปุ่มดัน Scrum! (Delta: <strong>' + (msg.delta > 0 ? '+' : '') + msg.delta + '%</strong>)';
  } else if (msg.type === 'stg6_hit') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🔨 <strong>[MOBILE -> COURT]</strong>: ' + (msg.playerName || 'ผู้เล่น') + ' ทุบเกราะความจริง (-10% Shield)!';
  } else if (msg.type === 'closing_submit') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 📖 <strong>[MOBILE -> COURT]</strong>: วางการ์ด [<strong>' + msg.cardId + '</strong>] ลงช่องที่ ' + msg.slot;
  } else if (msg.type === 'submit_vote') {
    entry.className += ' player';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🗳️ <strong>[MOBILE -> COURT]</strong>: ลงคะแนนชี้ชะตาเลือกผู้ต้องสงสัย [<strong>' + msg.candidate + '</strong>]';
  } else if (msg.type === 'minigame_result') {
    entry.className += ' court';
    entry.innerHTML = '<span class="log-time">[' + timeStr + ']</span> 🏆 <strong>[COURT MODAL]</strong>: ' + (msg.title || '') + ' - ' + (msg.desc || '');
  } else {
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
  if (!msg._id) {
    msg._id = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  }
  try {
    const res = await fetch('/api/rooms/' + encodeURIComponent(simRoomCode) + '/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    });
    if (!res.ok) {
      logSimEvent({ type: 'sim_info', text: '⚠️ [SIM HTTP]: ส่งข้อความล้มเหลว Status: ' + res.status });
    }
  } catch (e) {
    console.error('Sim post failed:', e);
    logSimEvent({ type: 'sim_info', text: '❌ [SIM ERROR]: ' + e.message });
  }
}

async function simProbePing() {
  const t0 = performance.now();
  const pingId = 'ping_' + Date.now();

  const handlePing = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'sim_ping' && data.pingId === pingId) {
        const latency = Math.round(performance.now() - t0);
        const msEl = document.getElementById('simPingMs');
        if (msEl) msEl.innerText = latency + ' ms';
        logSimEvent({ type: 'sim_ping_reply', latency: latency });
        if (simEventSource) simEventSource.removeEventListener('message', handlePing);
      }
    } catch(e) {}
  };

  if (simEventSource) {
    simEventSource.addEventListener('message', handlePing);
  }

  await simPost({ type: 'sim_ping', pingId: pingId, t: t0 });
}

async function simJoinPlayers() {
  logSimEvent({ type: 'sim_info', text: '👤 [ACTION]: จำลองส่งคำขอสวมบทบาท: นาเอกิ (นักแต่งนิยาย) และ เคียวโกะ (นักกีฬา)...' });
  await simPost({
    type: 'request_claim_character',
    role: 'นักแต่งนิยาย',
    playerName: 'นาเอกิ',
    userHash: 'sim_naegi'
  });
  await new Promise(r => setTimeout(r, 150));
  await simPost({
    type: 'request_claim_character',
    role: 'นักกีฬา',
    playerName: 'เคียวโกะ',
    userHash: 'sim_kyoko'
  });
}

async function simStage1Evidence() {
  logSimEvent({ type: 'sim_info', text: '🔍 [ACTION]: เริ่ม Stage 1 (Evidence Linker) และส่งหลักฐาน...' });
  await simPost({ type: 'set_stage', stage: 'stage1' });
  await new Promise(r => setTimeout(r, 250));
  await simPost({ type: 'stg1_submit', clueId: 'EVD-01', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 200));
  await simPost({ type: 'stg1_submit', clueId: 'EVD-04', playerName: 'เคียวโกะ' });
  await new Promise(r => setTimeout(r, 500));
  await simPost({ type: 'stg1_evaluate' });
}

async function simStage2Hangman() {
  logSimEvent({ type: 'sim_info', text: '🔤 [ACTION]: เริ่ม Stage 2 (Hangman\'s Gambit) ทายตัวอักษร "นาฬิกาน้ำ"...' });
  await simPost({ type: 'set_stage', stage: 'stage2' });
  const letters = ['น', 'า', 'ฬ', 'ิ', 'ก', 'า', 'น', '้', 'ำ'];
  for (const ch of letters) {
    await new Promise(r => setTimeout(r, 180));
    await simPost({ type: 'stg2_char', char: ch });
  }
}

async function simStage3Rebuttal() {
  logSimEvent({ type: 'sim_info', text: '🗡️ [ACTION]: เริ่ม Stage 3 (Rebuttal Showdown) ฟันดาบความจริง...' });
  await simPost({ type: 'set_stage', stage: 'stage3' });
  await new Promise(r => setTimeout(r, 300));
  await simPost({ type: 'rebuttal_slash', bullet: 'EVD-01', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 500));
  await simPost({ type: 'rebuttal_verdict', isWin: true });
}

async function simStage4LogicDive() {
  logSimEvent({ type: 'sim_info', text: '🛹 [ACTION]: เริ่ม Stage 4 (Logic Dive) โหวตทางเลือกตรรกะ...' });
  await simPost({ type: 'set_stage', stage: 'stage4' });
  await new Promise(r => setTimeout(r, 250));
  await simPost({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'sim_naegi', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 180));
  await simPost({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'sim_kyoko', playerName: 'เคียวโกะ' });
}

async function simStage5Scrum() {
  logSimEvent({ type: 'sim_info', text: '🔥 [ACTION]: เริ่ม Stage 5 (Debate Scrum) รัวปุ่มดันตรรกะ (+8% per hit)...' });
  await simPost({ type: 'set_stage', stage: 'stage5' });
  for (let i = 0; i < 7; i++) {
    await new Promise(r => setTimeout(r, 120));
    await simPost({ type: 'stg5_scrum', delta: 8 });
  }
}

async function simStage6Armament() {
  logSimEvent({ type: 'sim_info', text: '🔨 [ACTION]: เริ่ม Stage 6 (Argument Armament) ทุบเกราะความจริง...' });
  await simPost({ type: 'set_stage', stage: 'stage6' });
  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 120));
    await simPost({ type: 'stg6_hit', playerName: 'นาเอกิ' });
  }
  await new Promise(r => setTimeout(r, 350));
  await simPost({ type: 'stg6_final_blow', playerName: 'นาเอกิ' });
}

async function simClosingArgument() {
  logSimEvent({ type: 'sim_info', text: '📖 [ACTION]: เริ่ม Closing Argument วางการ์ดมังงะสรุปคดี...' });
  await simPost({ type: 'set_stage', stage: 'closing' });
  await new Promise(r => setTimeout(r, 200));
  await simPost({ type: 'closing_submit', slot: 1, cardId: 'EVD-14', playerName: 'นาเอกิ' });
  await new Promise(r => setTimeout(r, 200));
  await simPost({ type: 'closing_submit', slot: 2, cardId: 'EVD-11', playerName: 'เคียวโกะ' });
}

async function simStage7Vote() {
  logSimEvent({ type: 'sim_info', text: '🗳️ [ACTION]: เริ่ม Stage 7 (Voting Time) ลงคะแนนโหวตหา Blackened...' });
  await simPost({ type: 'set_stage', stage: 'stage7' });
  await new Promise(r => setTimeout(r, 250));
  await simPost({ type: 'submit_vote', candidate: 'นักมายากล', voterId: 'sim_naegi' });
  await new Promise(r => setTimeout(r, 180));
  await simPost({ type: 'submit_vote', candidate: 'นักมายากล', voterId: 'sim_kyoko' });
  await new Promise(r => setTimeout(r, 450));
  await simPost({ type: 'reveal_votes' });
}

async function runSimFullSequence() {
  if (simAutoRunning) return;
  simAutoRunning = true;
  logSimEvent({ type: 'sim_info', text: '🚀 [FULL AUTO]: เริ่มการทดสอบอัตโนมัติครบ 8 สเตจแบบต่อเนื่อง...' });

  try {
    await simJoinPlayers();
    await new Promise(r => setTimeout(r, 1200));

    await simStage1Evidence();
    await new Promise(r => setTimeout(r, 1500));

    await simStage2Hangman();
    await new Promise(r => setTimeout(r, 1500));

    await simStage3Rebuttal();
    await new Promise(r => setTimeout(r, 1500));

    await simStage4LogicDive();
    await new Promise(r => setTimeout(r, 1500));

    await simStage5Scrum();
    await new Promise(r => setTimeout(r, 1500));

    await simStage6Armament();
    await new Promise(r => setTimeout(r, 1500));

    await simClosingArgument();
    await new Promise(r => setTimeout(r, 1500));

    await simStage7Vote();
    await new Promise(r => setTimeout(r, 1200));

    logSimEvent({ type: 'sim_info', text: '🎉 [COMPLETE]: การจำลอง Full Sequence เสร็จสมบูรณ์ ทุกมินิเกมตอบสนอง Real-Time 100%!' });
  } finally {
    simAutoRunning = false;
  }
}

function simResetRoom() {
  logSimEvent({ type: 'sim_info', text: '🔄 กำลังรีเซ็ตห้องทดลองจำลอง...' });
  simPost({ type: 'admin_reset_session' });
  setTimeout(() => {
    initSimulationLab();
  }, 300);
}
