const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const os = require('os');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// ให้บริการไฟล์ Static ในโฟลเดอร์ public
app.use(express.static(path.join(__dirname, 'public')));

// หา Local IP ของเครื่องเพื่อนำไปโชว์ให้ผู้เล่นสแกนเข้าจากมือถือ
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const localIp = getLocalIp();

// สถานะของเกม (Game State)
let gameState = {
  stage: 'lobby', // lobby, stage1, stage2, stage3, ending
  influence: 100, // หลอดเลือด 0-100%
  timeRemaining: 60,
  timerRunning: false,
  players: {}, // socketId -> { id, name, role, isKiller, score }
  
  // Stage 1: Evidence Linker
  stage1: {
    prompt: "อาวุธที่ใช้ทำร้ายท้ายทอย B จนสลบ คือสิ่งใดและถูกทำลายอย่างไร?",
    correctId: "CORE-01",
    correctSubmissions: 0,
    requiredSubmissions: 3,
    submittedPlayers: []
  },

  // Stage 2: Logic Reconstruct (Keyword Decipher)
  stage2: {
    word: "นาฬิกาน้ำ",
    targetChars: ["น", "า", "ฬิ", "ก", "า", "น้", "ำ"],
    currentSlots: ["_", "_", "_", "_", "_", "_", "_"],
    solvedCount: 0
  },

  // Stage 3: Debate Showdown (Scrum Meter)
  stage3: {
    meter: 50, // 0 = Despair (A Framed / Loss), 100 = Hope (B is Blackened / Win)
    targetStatement: "คนที่ผูกเชือกรอบคอเหยื่อเป็นคนสุดท้าย และทำให้คอหักตาย คือตัว B เอง!"
  }
};

let timerInterval = null;

function startTimer(duration, onTick, onComplete) {
  if (timerInterval) clearInterval(timerInterval);
  gameState.timeRemaining = duration;
  gameState.timerRunning = true;
  io.emit('timer_update', { timeRemaining: gameState.timeRemaining, influence: gameState.influence });

  timerInterval = setInterval(() => {
    if (gameState.timeRemaining > 0) {
      gameState.timeRemaining--;
      io.emit('timer_update', { timeRemaining: gameState.timeRemaining, influence: gameState.influence });
      if (onTick) onTick(gameState.timeRemaining);
    } else {
      clearInterval(timerInterval);
      gameState.timerRunning = false;
      if (onComplete) onComplete();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  gameState.timerRunning = false;
}

function damageInfluence(amount, reason) {
  gameState.influence = Math.max(0, gameState.influence - amount);
  io.emit('influence_update', { influence: gameState.influence, reason });
  io.emit('alert_anomaly', { message: `⚠️ [DESPAIR PENALTY]: ${reason} (-${amount}%)` });
  if (gameState.influence <= 0) {
    endGame(false, "Influence Gauge เหลือ 0% ทุกคนถูก Monokuma ประหารหมู่!");
  }
}

function endGame(isVictory, summary) {
  stopTimer();
  gameState.stage = 'ending';
  io.emit('game_ended', { isVictory, summary, influence: gameState.influence });
}

io.on('connection', (socket) => {
  // ส่งข้อมูลเริ่มต้นให้ผู้เล่นที่เพิ่งต่อเข้ามา
  socket.emit('init_connection', {
    localIp,
    port: PORT,
    gameState: {
      stage: gameState.stage,
      influence: gameState.influence,
      timeRemaining: gameState.timeRemaining,
      players: gameState.players
    }
  });

  // เมื่อผู้เล่นเข้าร่วม (Join)
  socket.on('join_game', ({ name, role }) => {
    // ถ้าเลือกนักมายากล ให้เป็นคนร้าย (Killer / Saboteur) โดยอัตโนมัติ
    const isKiller = (role === 'นักมายากล');
    
    gameState.players[socket.id] = {
      id: socket.id,
      name: name || 'นักเรียนนิรนาม',
      role: role || 'นักเรียนทั่วไป',
      isKiller: isKiller,
      score: 0
    };

    socket.emit('player_assigned', {
      player: gameState.players[socket.id],
      isKiller: isKiller
    });

    io.emit('players_updated', gameState.players);
    io.emit('alert_anomaly', { message: `📢 [USER JOINED]: ${name} (${role}) เข้าสู่ศาลชั้นเรียน` });
  });

  // DM ควบคุมการเปลี่ยน Stage
  socket.on('admin_set_stage', ({ stage }) => {
    gameState.stage = stage;
    stopTimer();

    if (stage === 'stage1') {
      gameState.stage1.correctSubmissions = 0;
      gameState.stage1.submittedPlayers = [];
      startTimer(60, null, () => {
        damageInfluence(25, "หมดเวลาในการค้นหาอาวุธ!");
      });
    } else if (stage === 'stage2') {
      gameState.stage2.currentSlots = ["_", "_", "_", "_", "_", "_", "_"];
      gameState.stage2.solvedCount = 0;
      startTimer(75, null, () => {
        damageInfluence(25, "หมดเวลาถอดรหัสกลไกคดี!");
      });
    } else if (stage === 'stage3') {
      gameState.stage3.meter = 50;
      startTimer(60, null, () => {
        if (gameState.stage3.meter >= 70) {
          endGame(true, "ถกเถียงสำเร็จ! ปลุกระดมตรรกะได้ว่า B คือ Blackened!");
        } else {
          endGame(false, "หมดเวลาดีเบต! ไม่สามารถหยุดยั้งข้อสงสัยได้ ทุกคนโหวตผิด!");
        }
      });
    }

    io.emit('stage_changed', { stage: gameState.stage, gameState });
  });

  // ==========================================
  // STAGE 1: Evidence Linker Actions
  // ==========================================
  socket.on('submit_evidence', ({ clueId }) => {
    const player = gameState.players[socket.id];
    if (!player || gameState.stage !== 'stage1') return;

    if (clueId === gameState.stage1.correctId) {
      if (!gameState.stage1.submittedPlayers.includes(socket.id)) {
        gameState.stage1.submittedPlayers.push(socket.id);
        gameState.stage1.correctSubmissions++;
        
        io.emit('stage1_progress', {
          current: gameState.stage1.correctSubmissions,
          required: gameState.stage1.requiredSubmissions,
          message: `🎯 [TRUTH MATCH]: ${player.name} นำเสนอ 'ท่อนกระดูกหมูในสตูว์' ถูกต้อง!`
        });

        if (gameState.stage1.correctSubmissions >= gameState.stage1.requiredSubmissions) {
          stopTimer();
          io.emit('alert_anomaly', { message: `✨ [STAGE 1 CLEARED]: หักล้างข้ออ้างเรื่องอาวุธสำเร็จ!` });
        }
      }
    } else {
      // ส่งหลักฐานผิด หรือคนร้ายแอบส่งของหลอก
      damageInfluence(10, `${player.name} นำเสนอหลักฐานผิด (${clueId})`);
    }
  });

  // ==========================================
  // STAGE 2: Logic Reconstruct Actions
  // ==========================================
  socket.on('submit_char', ({ charIndex, charVal }) => {
    if (gameState.stage !== 'stage2') return;
    const player = gameState.players[socket.id];

    if (gameState.stage2.targetChars[charIndex] === charVal) {
      gameState.stage2.currentSlots[charIndex] = charVal;
      gameState.stage2.solvedCount++;
      io.emit('stage2_slots_updated', {
        slots: gameState.stage2.currentSlots,
        message: `🧩 ${player ? player.name : 'ผู้เล่น'} ประกอบอักษร '${charVal}' ลงในบอร์ดสำเร็จ!`
      });

      if (!gameState.stage2.currentSlots.includes("_")) {
        stopTimer();
        io.emit('alert_anomaly', { message: `✨ [STAGE 2 CLEARED]: ถอดรหัสคำว่า 'นาฬิกาน้ำ' สำเร็จ!` });
      }
    }
  });

  // ==========================================
  // STAGE 3: Debate Showdown Actions
  // ==========================================
  socket.on('debate_push', ({ delta }) => {
    if (gameState.stage !== 'stage3') return;
    const player = gameState.players[socket.id];

    // delta: +3 สำหรับคนดี, -5 สำหรับคนร้ายแอบดึงกลับ
    gameState.stage3.meter = Math.max(0, Math.min(100, gameState.stage3.meter + delta));
    io.emit('stage3_meter_updated', {
      meter: gameState.stage3.meter,
      pushedBy: player ? player.name : 'ใครบางคน'
    });

    if (gameState.stage3.meter >= 100) {
      endGame(true, "ความจริงกระจ่างชัด! ข้อสรุปคือ B กระทำต่อตัวเองจนเสียชีวิต (B คือ Blackened) ทุกคนรอดชีวิต!");
    } else if (gameState.stage3.meter <= 0) {
      endGame(false, "ความสิ้นหวังครอบงำ! โต๊ะเชื่อว่า A คือคนร้าย ทุกคนโดน Monokuma ประหารหมู่!");
    }
  });

  // ==========================================
  // SABOTAGE ACTIONS (เฉพาะคนร้าย / นักมายากล)
  // ==========================================
  socket.on('killer_sabotage', ({ type }) => {
    const player = gameState.players[socket.id];
    if (!player || !player.isKiller) return;

    if (type === 'glitch') {
      // ทำให้หน้าจอผู้เล่นคนอื่นเบลอ/สั่น 4 วินาที
      socket.broadcast.emit('trigger_glitch', { durationMs: 4000 });
      io.emit('alert_anomaly', { message: `⚡ [SYSTEM ALERT]: ตรวจพบคลื่นสัญญาณรบกวนในระบบศาล! (หน้าจอขัดข้อง)` });
    } else if (type === 'drain_time') {
      // แอบลดเวลา 10 วินาที
      gameState.timeRemaining = Math.max(5, gameState.timeRemaining - 10);
      io.emit('timer_update', { timeRemaining: gameState.timeRemaining, influence: gameState.influence });
      io.emit('alert_anomaly', { message: `⏱️ [TIME GLITCH]: เวลาศาลชั้นเรียนถูกเร่งรัดกะทันหัน! (-10 วินาที)` });
    } else if (type === 'inject_junk') {
      // ส่งอักษรขยะหรือลดหลอดเลือด
      damageInfluence(8, "ข้อมูลปลอมปนเปื้อนในระบบศาล");
      io.emit('alert_anomaly', { message: `⚠️ [DATA CORRUPTION]: มีการแทรกแซงข้อมูลเท็จลงในกระดานหลัก!` });
    }
  });

  // เมื่อมีข้อความ broadcast จาก client
  socket.on('client_broadcast', (msg) => {
    socket.broadcast.emit('sync_game', msg);
  });

  // เมื่อผู้เล่นออกจากระบบ
  socket.on('disconnect', () => {
    if (gameState.players[socket.id]) {
      const p = gameState.players[socket.id];
      delete gameState.players[socket.id];
      io.emit('players_updated', gameState.players);
      io.emit('alert_anomaly', { message: `🚪 [USER LEFT]: ${p.name} หลุดออกจากศาลชั้นเรียน` });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  DANGANRONPA TRPG CLASS TRIAL WEB MINIGAME`);
  console.log(`====================================================`);
  console.log(`  🖥️  DM Screen (Projector/Laptop):`);
  console.log(`     http://localhost:${PORT}`);
  console.log(`  📱 Mobile Players Join URL:`);
  console.log(`     http://${localIp}:${PORT}`);
  console.log(`====================================================`);
});
