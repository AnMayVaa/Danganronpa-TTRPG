// ==========================================================
// DANGANRONPA CLASS TRIAL UNIVERSAL REAL-TIME ENGINE
// Supports: Vercel WebRTC (PeerJS) & Local Node (Socket.io)
// ==========================================================

// Global Game State
let roomCode = 'DESPAIR';
let myPeer = null;
let hostPeer = null;
let peerConnections = []; // If this client is Host, stores all player connections
let isHost = false;
let socket = null;

let currentView = 'hub'; // hub, court, admin, player
let currentUserHash = '';
let enteredPin = '';
const ADMIN_CORRECT_PIN = '295437';
let myPlayer = null;

let gameState = {
  stage: 'lobby', // lobby, stage1..stage7, verdict
  influence: 100,
  timeRemaining: 60,
  timerRunning: false,
  players: {}, // id -> { name, role, isKiller, votedFor }
  
  // Stage 1: Evidence Linker
  stg1Submissions: 0,
  stg1Required: 3,

  // Stage 2: Hangman's Gambit
  stg2Target: ["น", "า", "ฬิ", "ก", "า", "น้", "ำ"],
  stg2Board: ["_", "_", "_", "_", "_", "_", "_"],

  // Stage 3: Rebuttal Showdown
  stg3AccuserScore: 0,
  stg3SuspectScore: 0,
  stg3ClashRound: 1,

  // Stage 4: Logic Dive
  stg4Step: 1, // 1 to 3

  // Stage 5: Debate Scrum
  stg5Meter: 50, // 0 to 100

  // Stage 6: Argument Armament
  stg6Shield: 100,

  // Stage 7: Voting Time
  votingOpen: false,
  votes: {} // candidate -> count
};

let timerInterval = null;

// ==========================================================
// WEB AUDIO SYNTHESIZER (DANGANRONPA SFX)
// ==========================================================
let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSfx(type) {
  try {
    const ctx = getAudio();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'gavel') {
      // Deep heavy courtroom gavel slam
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    } else if (type === 'correct') {
      // High chime
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'wrong') {
      // Harsh buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now); osc.stop(now + 0.35);
    } else if (type === 'glitch') {
      // Cyber static jam
      osc.type = 'square';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.setValueAtTime(900, now + 0.05);
      osc.frequency.setValueAtTime(220, now + 0.12);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now); osc.stop(now + 0.3);
    } else if (type === 'laugh') {
      // Monokuma laughter synth
      [300, 360, 420, 320].forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = 'sawtooth';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        g.gain.setValueAtTime(0.12, now + idx * 0.08);
        g.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.07);
        o.start(now + idx * 0.08); o.stop(now + idx * 0.08 + 0.07);
      });
    } else if (type === 'siren') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.25);
      osc.frequency.linearRampToValueAtTime(600, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now); osc.stop(now + 0.5);
    }
  } catch (e) {}
}

// ==========================================================
// REAL-TIME NETWORKING (PEERJS + SOCKET.IO DUAL-STACK)
// ==========================================================
function initRealtime() {
  // Check URL params for room
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('room')) {
    roomCode = urlParams.get('room').toUpperCase();
  }

  const dispRoom = document.getElementById('displayRoomCode');
  if (dispRoom) dispRoom.innerText = roomCode;
  const courtRoom = document.getElementById('courtLobbyRoomCode');
  if (courtRoom) courtRoom.innerText = roomCode;
  const mobRoom = document.getElementById('mobileRoomInput');
  if (mobRoom) mobRoom.value = roomCode;
  const joinUrl = document.getElementById('courtJoinUrl');
  if (joinUrl) joinUrl.innerText = window.location.origin + '/play?room=' + roomCode;

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
  if (myPeer && !myPeer.destroyed) return;

  const hostPeerId = `dangan-court-${roomCode.toLowerCase()}`;

  // If Courtroom or Admin screen, register as Host or connect
  if (currentView === 'court' || currentView === 'admin') {
    isHost = true;
    myPeer = new Peer(hostPeerId, { debug: 1 });

    myPeer.on('open', (id) => {
      console.log('[WEBRTC HOST ACTIVE]:', id);
      logCourt(`[WEBRTC]: ห้อง ${roomCode} ออนไลน์ พร้อมรับการเชื่อมต่อจากผู้เล่นทุกอุปกรณ์!`);
    });

    myPeer.on('connection', (conn) => {
      peerConnections.push(conn);
      console.log('[WEBRTC] Player connected:', conn.peer);
      
      conn.on('data', (data) => {
        handleIncomingMessage(data, conn);
      });

      conn.on('close', () => {
        peerConnections = peerConnections.filter(c => c !== conn);
      });

      // Send initial state to newly joined player
      setTimeout(() => {
        conn.send({ type: 'sync_state', state: gameState });
      }, 500);
    });

    myPeer.on('error', (err) => {
      // If host ID is already taken, this might be a secondary screen (e.g. Admin screen connecting to Court screen)
      if (err.type === 'unavailable-id') {
        console.log('[WEBRTC] Host ID in use, connecting as Client to Host:', hostPeerId);
        isHost = false;
        connectToHostPeer(hostPeerId);
      }
    });
  } else if (currentView === 'player') {
    // Player mobile connects to Host
    connectToHostPeer(hostPeerId);
  }
}

function connectToHostPeer(hostId) {
  myPeer = new Peer();
  myPeer.on('open', () => {
    hostPeer = myPeer.connect(hostId, { reliable: true });
    hostPeer.on('open', () => {
      console.log('[WEBRTC] Connected to Host:', hostId);
    });
    hostPeer.on('data', (data) => {
      handleIncomingMessage(data, hostPeer);
    });
  });
}

function broadcast(msg) {
  // If host, send to all connected peers
  if (isHost) {
    peerConnections.forEach(conn => {
      try { conn.send(msg); } catch(e) {}
    });
  } else if (hostPeer && hostPeer.open) {
    // If client, send to host
    hostPeer.send(msg);
  }

  // Also broadcast locally to this browser tab
  handleIncomingMessage(msg, null);

  // Sync to socket if available
  if (socket && socket.connected) {
    socket.emit('client_broadcast', msg);
  }
}

function handleIncomingMessage(msg, senderConn) {
  if (!msg || !msg.type) return;

  if (msg.type === 'sync_state') {
    applyState(msg.state);
  } else if (msg.type === 'player_joined') {
    gameState.players[msg.player.id] = msg.player;
    updatePlayerDisplays();
    logCourt(`👤 [JOIN]: ${msg.player.name} (${msg.player.role}) ยืนประจำโพเดียม`);
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
  } else if (msg.type === 'set_stage') {
    setStage(msg.stage);
  } else if (msg.type === 'timer_tick') {
    gameState.timeRemaining = msg.time;
    updateTimerDisplay();
  } else if (msg.type === 'adjust_influence') {
    gameState.influence = Math.max(0, Math.min(100, gameState.influence + msg.delta));
    updateInfluenceDisplay();
    playSfx('wrong');
  } else if (msg.type === 'sabotage') {
    handleSabotage(msg.sabType, msg.playerName);
  } else if (msg.type === 'stg1_submit') {
    handleStg1Submit(msg.clueId, msg.playerName);
  } else if (msg.type === 'stg2_char') {
    handleStg2Char(msg.index, msg.char);
  } else if (msg.type === 'stg5_scrum') {
    gameState.stg5Meter = Math.max(0, Math.min(100, gameState.stg5Meter + msg.delta));
    updateScrumDisplay();
  } else if (msg.type === 'stg6_hit') {
    gameState.stg6Shield = Math.max(0, gameState.stg6Shield - 15);
    updateShieldDisplay();
  } else if (msg.type === 'submit_vote') {
    gameState.votes[msg.candidate] = (gameState.votes[msg.candidate] || 0) + 1;
    updateVoteDisplay();
  } else if (msg.type === 'verdict') {
    showVerdict(msg.isVictory);
  } else if (msg.type === 'trigger_fx') {
    playSfx(msg.fx);
  }
}

function applyState(st) {
  gameState = st;
  updateInfluenceDisplay();
  updateTimerDisplay();
  updatePlayerDisplays();
  renderStage(gameState.stage);
}

// ==========================================================
// SPA ROUTING, PIN ACCESS & VIEW SWITCHING
// ==========================================================
function getCleanPath() {
  let p = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (p.toLowerCase().endsWith('.html')) p = p.substring(0, p.length - 5);
  return p;
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

  hidePinModal();

  if (!p || lowerP === 'index' || lowerP === 'hub') {
    switchView('hub');
  } else if (lowerP === 'court') {
    switchView('court');
  } else if (lowerP === 'admin') {
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

  const panels = ['viewHub', 'viewCourt', 'viewAdmin', 'viewPlayer'];
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const tabs = ['tabHub', 'tabCourt', 'tabAdmin', 'tabPlayer'];
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
    setupPeerJS();
  } else if (v === 'admin') {
    const el = document.getElementById('viewAdmin');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabAdmin');
    if (tab) tab.classList.add('active');
    updateAdminDisplay();
    setupPeerJS();
  } else if (v === 'player') {
    const el = document.getElementById('viewPlayer');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabPlayer');
    if (tab) tab.classList.add('active');
    setupPeerJS();
  }
}

function updateHubDisplay() {
  const hash = localStorage.getItem('dangan_current_user_hash');
  const box = document.getElementById('hubResumeBox');
  const info = document.getElementById('hubResumeInfo');
  if (!box || !info) return;

  if (hash) {
    const saved = localStorage.getItem('dangan_player_' + hash);
    if (saved) {
      try {
        const p = JSON.parse(saved);
        info.innerHTML = `ตัวละคร: <strong style="color:var(--mono-pink);">${p.name}</strong> [${p.role}] | ลิงก์ของคุณ: <code style="color:var(--mono-cyan);">/${hash}</code>`;
        box.classList.remove('hidden');
        return;
      } catch(e) {}
    }
  }
  box.classList.add('hidden');
}

function resumePlayerSession() {
  const hash = localStorage.getItem('dangan_current_user_hash');
  if (hash) {
    navigate('/' + hash);
  } else {
    navigate('/play');
  }
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

  const savedData = localStorage.getItem('dangan_player_' + hash);
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

      broadcast({ type: 'player_joined', player: myPlayer });
      return;
    } catch(e) {}
  }

  // If no saved player, show join form
  const joinScr = document.getElementById('mobileJoinScreen');
  if (joinScr) joinScr.classList.remove('hidden');
  const gameScr = document.getElementById('mobileGameScreen');
  if (gameScr) gameScr.classList.add('hidden');
}

// ==========================================================
// STAGE CONTROLS & TIMERS
// ==========================================================
function setStage(stage) {
  gameState.stage = stage;
  stopTimer();

  if (stage === 'stage1') {
    gameState.stg1Submissions = 0;
    startTimer(60);
    playSfx('gavel');
  } else if (stage === 'stage2') {
    gameState.stg2Board = ["_", "_", "_", "_", "_", "_", "_"];
    startTimer(75);
    playSfx('gavel');
  } else if (stage === 'stage3') {
    startTimer(45);
    playSfx('gavel');
  } else if (stage === 'stage4') {
    gameState.stg4Step = 1;
    startTimer(60);
    playSfx('gavel');
  } else if (stage === 'stage5') {
    gameState.stg5Meter = 50;
    startTimer(60);
    playSfx('gavel');
  } else if (stage === 'stage6') {
    gameState.stg6Shield = 100;
    startTimer(45);
    playSfx('gavel');
  } else if (stage === 'stage7') {
    gameState.votingOpen = true;
    gameState.votes = {};
    startTimer(60);
    playSfx('siren');
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
  document.getElementById('courtTimerDigits').innerText = str;
  if (gameState.timeRemaining <= 15) {
    document.getElementById('courtTimerDigits').style.color = '#ff2244';
  } else {
    document.getElementById('courtTimerDigits').style.color = '#fff';
  }
}

function updateInfluenceDisplay() {
  document.getElementById('courtInfluenceBar').style.width = `${gameState.influence}%`;
  document.getElementById('courtInfluenceTxt').innerText = `${gameState.influence}%`;
}

function logCourt(text) {
  const box = document.getElementById('courtLog');
  const d = document.createElement('div');
  d.innerText = `> ${text}`;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

// ==========================================================
// STAGE RENDERERS (COURTROOM VIEW & MOBILE VIEW)
// ==========================================================
function renderStage(stage) {
  // Hide all court boxes
  ['courtLobby','courtStage1','courtStage2','courtStage3','courtStage4','courtStage5','courtStage6','courtStage7','courtVerdict'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  if (stage === 'lobby') document.getElementById('courtLobby').classList.remove('hidden');
  else if (stage === 'stage1') {
    document.getElementById('courtStage1').classList.remove('hidden');
    updateStg1Display();
  } else if (stage === 'stage2') {
    document.getElementById('courtStage2').classList.remove('hidden');
    updateHangmanDisplay();
  } else if (stage === 'stage3') {
    document.getElementById('courtStage3').classList.remove('hidden');
  } else if (stage === 'stage4') {
    document.getElementById('courtStage4').classList.remove('hidden');
    updateLogicDiveDisplay();
  } else if (stage === 'stage5') {
    document.getElementById('courtStage5').classList.remove('hidden');
    updateScrumDisplay();
  } else if (stage === 'stage6') {
    document.getElementById('courtStage6').classList.remove('hidden');
    updateShieldDisplay();
  } else if (stage === 'stage7') {
    document.getElementById('courtStage7').classList.remove('hidden');
    updateVoteDisplay();
  }

  // Render on Mobile
  renderMobileTask(stage);
}

// ==========================================================
// MINI-GAME SPECIFIC LOGIC
// ==========================================================
// 1. Evidence Linker
function handleStg1Submit(clueId, pName) {
  if (clueId === 'CORE-01') {
    gameState.stg1Submissions++;
    playSfx('correct');
    logCourt(`🎯 [TRUTH BULLET]: ${pName} นำเสนอ 'ท่อนกระดูกหมูในสตูว์' ถูกต้อง!`);
    updateStg1Display();
    if (gameState.stg1Submissions >= gameState.stg1Required) {
      logCourt(`✨ [CLEARED]: หักล้างข้ออ้างสำเร็จ!`);
      playSfx('correct');
    }
  } else {
    gameState.influence = Math.max(0, gameState.influence - 10);
    updateInfluenceDisplay();
    playSfx('wrong');
    logCourt(`❌ [OBJECTION FAILED]: ${pName} ยิงหลักฐานผิดใบ (-10% Influence)`);
  }
}

function updateStg1Display() {
  document.getElementById('stg1Count').innerText = gameState.stg1Submissions;
  const placeholders = document.querySelectorAll('#stg1SlotsDisplay .clue-card-placeholder');
  placeholders.forEach((el, idx) => {
    if (idx < gameState.stg1Submissions) {
      el.classList.add('active-match');
      el.innerText = `✅ [CORE-01] ท่อนกระดูกหมูเปื้อนเลือด`;
    } else {
      el.classList.remove('active-match');
      el.innerText = `รอหลักฐานชิ้นที่ ${idx+1}...`;
    }
  });
}

// 2. Hangman's Gambit
function handleStg2Char(idx, char) {
  if (gameState.stg2Target[idx] === char) {
    gameState.stg2Board[idx] = char;
    playSfx('correct');
    updateHangmanDisplay();
  } else {
    gameState.influence = Math.max(0, gameState.influence - 5);
    updateInfluenceDisplay();
    playSfx('wrong');
  }
}

function updateHangmanDisplay() {
  const b = document.getElementById('hangmanBoard');
  b.innerHTML = '';
  gameState.stg2Board.forEach(c => {
    const tile = document.createElement('div');
    tile.className = 'hangman-tile' + (c !== '_' ? ' revealed' : '');
    tile.innerText = c;
    b.appendChild(tile);
  });
}

// 4. Logic Dive
function advanceLogicDive(choice) {
  if (choice === 'correct') {
    gameState.stg4Step++;
    playSfx('correct');
    if (gameState.stg4Step > 3) {
      logCourt(`✨ [LOGIC DIVE CLEAR]: ทะลวงตรรกะสำเร็จ B ตัดเชือกเองและคอหักตายเอง!`);
    } else {
      updateLogicDiveDisplay();
    }
  } else {
    gameState.influence = Math.max(0, gameState.influence - 15);
    updateInfluenceDisplay();
    playSfx('wrong');
    logCourt(`⚠️ [LOGIC DIVE CRASH]: เลือกทางแยกผิด ตกหน้าผาจิตสำนึก!`);
  }
}

function updateLogicDiveDisplay() {
  document.getElementById('diveStageNum').innerText = `STAGE ${gameState.stg4Step} / 3`;
  if (gameState.stg4Step === 1) {
    document.getElementById('diveQuestion').innerText = `"มีดพกเปื้อนใยเชือกในกระเป๋าเสื้อของ B หมายความว่าอย่างไร?"`;
    document.getElementById('laneA').innerText = `A: คนร้ายใช้มีดอำพราง`;
    document.getElementById('laneB').innerText = `B: ตัวเหยื่อตัดเชือกเองจนรอดแล้ว!`;
  } else if (gameState.stg4Step === 2) {
    document.getElementById('diveQuestion').innerText = `"ถ้า B ตัดเชือกรอดแล้ว ทำไมถึงมีเงื่อนโบว์ไลน์ผูกติดสายรัดลำตัว?"`;
    document.getElementById('laneA').innerText = `A: B แกล้งจัดฉากผูกหลอกเพื่อแฉคนร้าย`;
    document.getElementById('laneB').innerText = `B: B พยายามปีนหนีขึ้นเพดาน`;
  } else if (gameState.stg4Step === 3) {
    document.getElementById('diveQuestion').innerText = `"แล้วทำไม B ถึงคอหักตายจริง ทั้งที่มีสายรัดลำตัวพยุงอยู่!?"`;
    document.getElementById('laneA').innerText = `A: B ถูกวางยาพิษไซยาไนด์`;
    document.getElementById('laneB').innerText = `B: มวลน้ำเกิด Shock Load มหาศาล กระชากเงื่อนหลุดรัดคอ!`;
  }
}

// 5. Debate Scrum
function updateScrumDisplay() {
  document.getElementById('courtScrumFill').style.width = `${gameState.stg5Meter}%`;
}

// 6. Argument Armament
function updateShieldDisplay() {
  document.getElementById('shieldFill').style.width = `${gameState.stg6Shield}%`;
  if (gameState.stg6Shield <= 0) {
    document.getElementById('culpritScreamText').innerText = `"อ๊ากกกกกก!! ความจริงมัน... เป็นไปไม่ได้... แผนของฉัน!!"`;
    playSfx('gavel');
  }
}

// 7. Voting & Verdict
function updateVoteDisplay() {
  const container = document.getElementById('courtVoteResults');
  container.innerHTML = '';
  const candidates = ['PC 1 (นักแต่งนิยาย)', 'PC 2 (นักกีฬา)', 'PC 3 (นักมายากล A)', 'PC 4 (นักชิม)', 'PC 5 (นักแสดงผาดโผน)', 'PC 6 (ช่างกล)', 'NPC B (สุดยอดนักเอาตัวรอด)'];
  
  candidates.forEach(cand => {
    const card = document.createElement('div');
    card.className = 'vote-card';
    const count = gameState.votes[cand] || 0;
    card.innerHTML = `<span>👤 ${cand}</span><span class="vote-count-badge">${count} โหวต</span>`;
    container.appendChild(card);
  });
}

function showVerdict(isVictory) {
  setStage('verdict');
  const title = document.getElementById('verdictHeadline');
  const body = document.getElementById('verdictDetails');

  if (isVictory) {
    title.className = 'verdict-headline win';
    title.innerText = '✨ TRUE ENDING: EVERYONE SURVIVES!';
    body.innerHTML = `
      <p style="color:#00ff88; font-weight:700; margin-bottom:15px;">ถูกต้อง! คนที่ผูกเงื่อนรัดคอตัวเองจนเกิดอุบัติเหตุคอหักตายคือ B (สุดยอดนักเอาตัวรอด)!</p>
      <p>Monokuma หัวเราะเยาะ A (นักมายากล) ที่แผนการพังไม่เป็นท่า และลากร่างศพของ B ไปประหารซ้ำแบบเย้ยหยัน! ผู้เล่นทุกคนรอดชีวิต แต่ A จะถูกเพื่อนร่วมชั้นเกลียดชังและหวาดระแวงตลอดกาล!</p>
    `;
    playSfx('correct');
  } else {
    title.className = 'verdict-headline lose';
    title.innerText = '💀 BAD ENDING: TOTAL EXECUTION!';
    body.innerHTML = `
      <p style="color:#ff2244; font-weight:700; margin-bottom:15px;">โหวตผิด! Blackened ที่แท้จริงคือ B ไม่ใช่ A!</p>
      <p>ตามกฎศักดิ์สิทธิ์ของโรงเรียน เมื่อลงคะแนนผิด... นักเรียนทุกคนในห้องพิจารณาคดีจะต้องถูกนำตัวเข้าสู่ลานประหารชีวิตหมู่!! ขอต้อนรับสู่ความสิ้นหวังอย่างสมบูรณ์แบบ!</p>
    `;
    playSfx('wrong');
  }
}

// ==========================================================
// MOBILE PLAYER CONTROLS & TASKS
// ==========================================================
function playerJoin() {
  getAudio();
  const name = document.getElementById('mobileNameInput').value.trim();
  const role = document.getElementById('mobileRoleSelect').value;
  const room = document.getElementById('mobileRoomInput').value.trim().toUpperCase();

  if (!name) { alert('กรุณากรอกชื่อตัวละคร'); return; }
  roomCode = room;

  const isKiller = (role === 'นักมายากล');
  const playerId = currentUserHash || ('p_' + Math.random().toString(36).substr(2, 9));
  myPlayer = {
    id: playerId,
    name: name,
    role: role,
    isKiller: isKiller
  };

  // Save session to localStorage
  if (currentUserHash) {
    localStorage.setItem('dangan_player_' + currentUserHash, JSON.stringify(myPlayer));
    localStorage.setItem('dangan_current_user_hash', currentUserHash);
  }

  document.getElementById('mobileJoinScreen').classList.add('hidden');
  document.getElementById('mobileGameScreen').classList.remove('hidden');

  document.getElementById('pMyName').innerText = name;
  document.getElementById('pMyRole').innerText = `[${role}]`;
  const pHash = document.getElementById('pMyHash');
  if (pHash) pHash.innerText = '#' + (currentUserHash || 'USER');

  if (isKiller) {
    document.getElementById('pMyStatus').innerText = '☠️ ผู้วางแผน (Blackened)';
    document.getElementById('pMyStatus').className = 'p-status killer';
    document.getElementById('mobileSaboteurPanel').classList.remove('hidden');
  } else {
    document.getElementById('pMyStatus').innerText = '🛡️ นักเรียนผู้บริสุทธิ์';
    document.getElementById('pMyStatus').className = 'p-status normal';
    document.getElementById('mobileSaboteurPanel').classList.add('hidden');
  }

  broadcast({ type: 'player_joined', player: myPlayer });
}

function renderMobileTask(stage) {
  const area = document.getElementById('mobileTaskArea');
  if (!area) return;
  area.innerHTML = '';

  if (stage === 'lobby') {
    area.innerHTML = '<div class="idle-message"><div class="idle-spinner"></div><p>กำลังรอเริ่มศาลชั้นเรียน...</p></div>';
  } else if (stage === 'stage1') {
    area.innerHTML = `
      <h3 style="color:#00f3ff; margin-bottom:12px;">เลือกการ์ดหลักฐานที่ตรงกับอาวุธ:</h3>
      <button class="p-task-btn" onclick="sendStg1('CORE-01')">🔴 [CORE-01] ท่อนกระดูกหมูต้มเปื้อนเลือด</button>
      <button class="p-task-btn" onclick="sendStg1('HERR-01')">🟡 [HERR-01] หลอดแก้วไซยาไนด์เปล่า</button>
      <button class="p-task-btn" onclick="sendStg1('TRASH-02')">⚫ [TRASH-02] ดัมเบลเปื้อนซอสมะเขือเทศ</button>
      <button class="p-task-btn" onclick="sendStg1('SUPP-01')">🔵 [SUPP-01] แผงตั้งเวลาเครื่องอบผ้า</button>
    `;
  } else if (stage === 'stage2') {
    area.innerHTML = `
      <h3 style="color:#00f3ff; margin-bottom:12px;">แตะตัวอักษรเพื่อส่งขึ้นกระดาน:</h3>
      <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:10px; width:100%;">
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(0,'น')">น</button>
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(1,'า')">า</button>
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(2,'ฬิ')">ฬิ</button>
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(3,'ก')">ก</button>
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(4,'า')">า</button>
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(5,'น้')">น้</button>
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(6,'ำ')">ำ</button>
        <button class="p-task-btn" style="text-align:center;" onclick="sendStg2(99,'ร')">ร</button>
      </div>
    `;
  } else if (stage === 'stage3') {
    area.innerHTML = `
      <h3 style="color:#ff2244; margin-bottom:12px;">ดวลดาบคำพูด (Rebuttal Showdown)!</h3>
      <button class="p-task-btn" style="background:#1a4d2e; border-color:#00ff88; padding:25px;" onclick="broadcast({type:'trigger_fx',fx:'correct'})">
        ⚔️ ฟันดาบความจริง! (Truth Blade Slash)
      </button>
    `;
  } else if (stage === 'stage4') {
    area.innerHTML = `
      <h3 style="color:#b537f2; margin-bottom:12px;">Logic Dive: เลือกทางแยกตรรกะ!</h3>
      <button class="p-task-btn" onclick="advanceLogicDive('wrong')">ทางแยกซ้าย</button>
      <button class="p-task-btn" onclick="advanceLogicDive('correct')">ทางแยกขวา (ทางถูกต้อง)</button>
    `;
  } else if (stage === 'stage5') {
    let killerSab = '';
    if (myPlayer && myPlayer.isKiller) {
      killerSab = `<button class="p-task-btn" style="background:#4a101a; border-color:#ff2244; margin-top:12px;" onclick="broadcast({type:'stg5_scrum',delta:-6})">☠️ [ลับเฉพาะคนร้าย] แอบดึงกลับ (-6%)</button>`;
    }
    area.innerHTML = `
      <h3 style="color:#00ff88; margin-bottom:12px;">Debate Scrum: รัวปุ่มดันตรรกะ!</h3>
      <button class="p-task-btn" style="background:#143d22; border-color:#00ff88; padding:25px; font-size:1.2rem;" onclick="broadcast({type:'stg5_scrum',delta:4})">
        🔥 ดันความจริง! (B ทำให้ตัวเองตาย)
      </button>
      ${killerSab}
    `;
  } else if (stage === 'stage6') {
    area.innerHTML = `
      <h3 style="color:#ffea00; margin-bottom:12px;">Argument Armament: รัวปุ่มทุบเกราะ!</h3>
      <button class="p-task-btn" style="background:#4d4010; border-color:#ffea00; padding:25px; font-size:1.2rem;" onclick="broadcast({type:'stg6_hit'})">
        🔨 ทุบเกราะความจริง! (-15% Shield)
      </button>
    `;
  } else if (stage === 'stage7') {
    const candidates = ['PC 1 (นักแต่งนิยาย)', 'PC 2 (นักกีฬา)', 'PC 3 (นักมายากล A)', 'PC 4 (นักชิม)', 'PC 5 (นักแสดงผาดโผน)', 'PC 6 (ช่างกล)', 'NPC B (สุดยอดนักเอาตัวรอด)'];
    let btns = candidates.map(c => `<button class="p-task-btn" onclick="submitPlayerVote('${c}')">👉 โหวต: ${c}</button>`).join('');
    area.innerHTML = `
      <h3 style="color:#ffe600; margin-bottom:12px;">โหวตเลือก Blackened ผู้ปลิดชีพ B:</h3>
      <div style="display:flex; flex-direction:column; gap:8px; width:100%;">${btns}</div>
    `;
  }
}

function sendStg1(id) {
  broadcast({ type: 'stg1_submit', clueId: id, playerName: myPlayer ? myPlayer.name : 'ผู้เล่น' });
}

function sendStg2(idx, char) {
  broadcast({ type: 'stg2_char', index: idx, char: char });
}

function submitPlayerVote(cand) {
  broadcast({ type: 'submit_vote', candidate: cand });
  alert(`คุณได้ลงคะแนนโหวตให้ '${cand}' เรียบร้อยแล้ว!`);
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
function adminSetGame(stage) {
  setStage(stage);
}

function adminAdjustTimer(secs) {
  gameState.timeRemaining = Math.max(0, gameState.timeRemaining + secs);
  updateTimerDisplay();
  if (isHost) broadcast({ type: 'timer_tick', time: gameState.timeRemaining });
}

function adminToggleTimer() {
  if (gameState.timerRunning) stopTimer();
  else startTimer(gameState.timeRemaining || 60);
}

function adminAdjustInfluence(amount, reset) {
  if (reset) gameState.influence = amount;
  else gameState.influence = Math.max(0, Math.min(100, gameState.influence + amount));
  updateInfluenceDisplay();
  broadcast({ type: 'adjust_influence', delta: amount });
}

function adminTriggerVerdict(isVictory) {
  broadcast({ type: 'verdict', isVictory: isVictory });
}

function triggerFx(fx) {
  broadcast({ type: 'trigger_fx', fx: fx });
}

function updateAdminDisplay() {
  const table = document.getElementById('adminPlayerTable');
  const cnt = document.getElementById('adminPlayerCount');
  table.innerHTML = '';
  const players = Object.values(gameState.players);
  cnt.innerText = players.length;

  players.forEach(p => {
    const row = document.createElement('div');
    row.className = 'admin-p-row' + (p.isKiller ? ' is-killer' : '');
    row.innerHTML = `
      <div>
        <strong>${p.name}</strong>
        <span style="color:#ffe600; font-size:0.8rem; margin-left:6px;">[${p.role}]</span>
        ${p.isKiller ? '<span style="color:#ff2244; font-weight:900; margin-left:6px;">[SABOTEUR]</span>' : ''}
      </div>
      <div>${p.votedFor ? `โหวต: ${p.votedFor}` : 'ยังไม่โหวต'}</div>
    `;
    table.appendChild(row);
  });
}

function updatePlayerDisplays() {
  const list = document.getElementById('courtPodiumList');
  const count = document.getElementById('courtPlayerCount');
  if (list && count) {
    list.innerHTML = '';
    const players = Object.values(gameState.players);
    count.innerText = players.length;
    players.forEach(p => {
      const seat = document.createElement('div');
      seat.className = 'podium-seat' + (p.isKiller ? ' killer-badge' : '');
      seat.innerHTML = `<span>👤 ${p.name}</span><span class="podium-role">[${p.role}]</span>`;
      list.appendChild(seat);
    });
  }
  updateAdminDisplay();
}

function adminChangeRoomCode() {
  const newCode = document.getElementById('inputNewRoomCode').value.trim().toUpperCase();
  if (newCode) {
    roomCode = newCode;
    window.location.href = window.location.pathname + '?room=' + roomCode + '&view=' + currentView;
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
