/**
 * DANGANRONPA CLASS TRIAL REAL-TIME MULTI-CLIENT SIMULATION TEST SUITE
 * Simulates Court (Host), Admin, and 2 Mobile Players communicating via Server-Sent Events (SSE) Bus
 * Verifies end-to-end real-time message delivery across all 8 trial stages
 */

const http = require('http');
const server = require('../server.js');

const PORT = 39824;
const ROOM = 'SIMTEST';

class SSEClient {
  constructor(name, port, room) {
    this.name = name;
    this.port = port;
    this.room = room;
    this.listeners = [];
    this.res = null;
    this.req = null;
    this.connected = false;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.req = http.request(`http://localhost:${this.port}/api/rooms/${this.room}/stream`, {
        headers: { 'Accept': 'text/event-stream' }
      }, (res) => {
        this.res = res;
        this.connected = true;
        let buffer = '';

        res.on('data', (chunk) => {
          buffer += chunk.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep last incomplete line

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const raw = line.substring(6).trim();
              if (raw) {
                try {
                  const msg = JSON.parse(raw);
                  this.listeners.forEach(fn => fn(msg));
                } catch (e) {}
              }
            }
          }
        });

        resolve();
      });

      this.req.on('error', reject);
      this.req.end();
    });
  }

  on(fn) {
    this.listeners.push(fn);
  }

  send(msg) {
    return new Promise((resolve, reject) => {
      const payload = JSON.stringify({
        ...msg,
        _id: `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
      });

      const postReq = http.request(`http://localhost:${this.port}/api/rooms/${this.room}/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let body = '';
        res.on('data', d => body += d);
        res.on('end', () => resolve(JSON.parse(body || '{}')));
      });

      postReq.on('error', reject);
      postReq.write(payload);
      postReq.end();
    });
  }

  waitFor(predicate, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
      const t0 = Date.now();
      const handler = (msg) => {
        if (predicate(msg)) {
          const latency = Date.now() - t0;
          this.listeners = this.listeners.filter(l => l !== handler);
          clearTimeout(timer);
          resolve({ msg, latency });
        }
      };
      this.on(handler);

      const timer = setTimeout(() => {
        this.listeners = this.listeners.filter(l => l !== handler);
        reject(new Error(`[${this.name}] Timeout waiting for message after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  close() {
    if (this.req) {
      try { this.req.destroy(); } catch (e) {}
    }
  }
}

async function runSimulation() {
  console.log('===============================================================');
  console.log('🧪 DANGANRONPA CLASS TRIAL REAL-TIME SIMULATION TEST SUITE');
  console.log('===============================================================\n');

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`[HTTP Server] Running on http://localhost:${PORT}`);

  const court = new SSEClient('CourtScreen', PORT, ROOM);
  const admin = new SSEClient('AdminDM', PORT, ROOM);
  const player1 = new SSEClient('Player1_Naegi', PORT, ROOM);
  const player2 = new SSEClient('Player2_Kyoko', PORT, ROOM);
  const player3 = new SSEClient('Player3_Byakuya', PORT, ROOM);
  const player4 = new SSEClient('Player4_Aoi', PORT, ROOM);
  const player5 = new SSEClient('Player5_Hifumi', PORT, ROOM);

  console.log('[SSE Setup] Connecting 7 independent clients (Court, Admin, PC 1-5)...');
  await Promise.all([
    court.connect(),
    admin.connect(),
    player1.connect(),
    player2.connect(),
    player3.connect(),
    player4.connect(),
    player5.connect()
  ]);
  console.log('✅ All 7 clients connected to real-time stream successfully!\n');

  const latencies = [];

  // -------------------------------------------------------------
  // Test 1: Real-Time Ping Probe
  // -------------------------------------------------------------
  process.stdout.write('⚡ Step 1: Real-time network latency probe... ');
  const pingPromise = court.waitFor(m => m.type === 'test_ping');
  await player1.send({ type: 'test_ping', text: 'hello court' });
  const pingRes = await pingPromise;
  latencies.push(pingRes.latency);
  console.log(`PASS (${pingRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 2: PC 1 to PC 5 Claim Characters (PC 5 gets isKiller: true)
  // -------------------------------------------------------------
  process.stdout.write('👤 Step 2: PC 1-5 claim characters (verifying PC 5 Saboteur)... ');
  const roster = [
    { client: player1, name: 'นาเอกิ', role: 'นักแต่งนิยาย', slot: 1, user: 'u-naegi', killer: false },
    { client: player2, name: 'เคียวโกะ', role: 'นักกีฬา', slot: 2, user: 'u-kyoko', killer: false },
    { client: player3, name: 'เบียคุยะ', role: 'นักสืบ', slot: 3, user: 'u-byakuya', killer: false },
    { client: player4, name: 'อาโออิ', role: 'นักชิม', slot: 4, user: 'u-aoi', killer: false },
    { client: player5, name: 'ฮิฟุมิ', role: 'ช่างกล', slot: 5, user: 'u-hifumi', killer: true }
  ];

  for (const p of roster) {
    const claimWait = court.waitFor(m => m.type === 'request_claim_character' && m.playerName === p.name);
    await p.client.send({
      type: 'request_claim_character',
      role: p.role,
      playerName: p.name,
      pcSlot: p.slot,
      userHash: p.user
    });
    const cl = await claimWait;
    latencies.push(cl.latency);

    const appWait = p.client.waitFor(m => m.type === 'claim_approved' && m.targetHash === p.user);
    await court.send({
      type: 'claim_approved',
      targetHash: p.user,
      player: {
        id: p.user,
        name: p.name,
        role: p.role,
        pcSlot: p.slot,
        isKiller: p.killer
      },
      state: { stage: 'lobby' }
    });
    const app = await appWait;
    latencies.push(app.latency);
  }
  console.log('PASS (All 5 PCs claimed & PC 5 assigned isKiller=true)');

  // -------------------------------------------------------------
  // Test 3: Investigation Phase & Clue Discovery
  // -------------------------------------------------------------
  process.stdout.write('🔍 Step 3: Admin sets Investigation Phase & PCs discover clues... ');
  const invWait = player1.waitFor(m => m.type === 'set_stage' && m.stage === 'investigation');
  await admin.send({ type: 'set_stage', stage: 'investigation' });
  const invRes = await invWait;
  latencies.push(invRes.latency);

  const c1Wait = court.waitFor(m => m.type === 'clue_discovered' && m.clueId === 'EVD-07');
  const c5Wait = court.waitFor(m => m.type === 'clue_discovered' && m.clueId === 'EVD-16');
  await player1.send({ type: 'clue_discovered', clueId: 'EVD-07', playerName: 'นาเอกิ', userHash: 'u-naegi' });
  await player5.send({ type: 'clue_discovered', clueId: 'EVD-16', playerName: 'ฮิฟุมิ', userHash: 'u-hifumi' });
  const [c1, c5] = await Promise.all([c1Wait, c5Wait]);
  latencies.push(c1.latency, c5.latency);
  console.log(`PASS (Investigation stage & clues synced in ${Math.max(c1.latency, c5.latency)} ms)`);

  // -------------------------------------------------------------
  // Test 4: Admin sets Stage 1 (Evidence Linker)
  // -------------------------------------------------------------
  process.stdout.write('🔍 Step 4: Admin triggers Stage 1 (Evidence Linker)... ');
  const stg1CourtPromise = court.waitFor(m => m.type === 'set_stage' && m.stage === 'stage1');
  const stg1P1Promise = player1.waitFor(m => m.type === 'set_stage' && m.stage === 'stage1');
  await admin.send({ type: 'set_stage', stage: 'stage1' });
  const [s1c, s1p] = await Promise.all([stg1CourtPromise, stg1P1Promise]);
  latencies.push(s1c.latency);
  console.log(`PASS (Dispatched to Court & Players in ${s1c.latency} ms)`);

  // -------------------------------------------------------------
  // Test 5: Mobile Player 1 submits Clue EVD-01
  // -------------------------------------------------------------
  process.stdout.write('📤 Step 5: Mobile Player 1 submits Clue EVD-01 to Court... ');
  const cluePromise = court.waitFor(m => m.type === 'stg1_submit' && m.clueId === 'EVD-01');
  await player1.send({ type: 'stg1_submit', clueId: 'EVD-01', playerName: 'นาเอกิ' });
  const clueRes = await cluePromise;
  latencies.push(clueRes.latency);
  console.log(`PASS (Arrived on Court in ${clueRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 6: Admin evaluates Stage 1
  // -------------------------------------------------------------
  process.stdout.write('⚖️ Step 6: Admin triggers Stage 1 evaluation... ');
  const evalPromise = court.waitFor(m => m.type === 'stg1_evaluate');
  await admin.send({ type: 'stg1_evaluate' });
  const evalRes = await evalPromise;
  latencies.push(evalRes.latency);
  console.log(`PASS (${evalRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 7: Stage 2 Hangman's Gambit Letter Guessing
  // -------------------------------------------------------------
  process.stdout.write('🔤 Step 7: Mobile Player 1 guesses Hangman letter "ว"... ');
  await admin.send({ type: 'set_stage', stage: 'stage2' });
  const hangPromise = court.waitFor(m => m.type === 'stg2_char' && m.char === 'ว');
  await player1.send({ type: 'stg2_char', char: 'ว' });
  const hangRes = await hangPromise;
  latencies.push(hangRes.latency);
  console.log(`PASS (Received on Court board in ${hangRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 8: Stage 3 Rebuttal Showdown (Slash & Verdict)
  // -------------------------------------------------------------
  process.stdout.write('⚔️ Step 8: Stage 3 Rebuttal Showdown & Verdict broadcast... ');
  await admin.send({ type: 'set_stage', stage: 'stage3' });
  const slashPromise = court.waitFor(m => m.type === 'rebuttal_slash' && m.bullet === 'EVD-07');
  await player1.send({ type: 'rebuttal_slash', bullet: 'EVD-07', playerName: 'นาเอกิ' });
  const slashRes = await slashPromise;
  latencies.push(slashRes.latency);

  // Admin triggers verdict announcement
  const verdictWait = player1.waitFor(m => m.type === 'rebuttal_verdict' && m.winner === 'นาเอกิ');
  await admin.send({
    type: 'rebuttal_verdict',
    isWin: true,
    winner: 'นาเอกิ',
    topic: 'ข้ออ้างเวลาเกิดเหตุในครัว',
    clue: '[EVD-07] รายการวัตถุดิบทำอาหาร',
    challenger: 'นาเอกิ',
    opponent: 'เคียวโกะ'
  });
  const verdictRes = await verdictWait;
  latencies.push(verdictRes.latency);
  console.log(`PASS (Slash & Verdict announced in ${slashRes.latency + verdictRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 9: Stage 4 Logic Dive Choices
  // -------------------------------------------------------------
  process.stdout.write('🛹 Step 9: Players vote choices in Logic Dive... ');
  await admin.send({ type: 'set_stage', stage: 'stage4' });
  const divePromise1 = court.waitFor(m => m.type === 'logic_dive_vote' && m.choice === 'A' && m.voterId === 'u-naegi');
  const divePromise2 = court.waitFor(m => m.type === 'logic_dive_vote' && m.choice === 'A' && m.voterId === 'u-kyoko');
  const divePromise5 = court.waitFor(m => m.type === 'logic_dive_vote' && m.choice === 'B' && m.voterId === 'u-hifumi');
  await player1.send({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'u-naegi', playerName: 'นาเอกิ' });
  await player2.send({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'u-kyoko', playerName: 'เคียวโกะ' });
  await player5.send({ type: 'logic_dive_vote', question: 1, choice: 'B', voterId: 'u-hifumi', playerName: 'ฮิฟุมิ' });
  const [d1, d2, d5] = await Promise.all([divePromise1, divePromise2, divePromise5]);
  latencies.push(d1.latency, d2.latency, d5.latency);
  console.log(`PASS (3 votes registered in ${Math.max(d1.latency, d2.latency, d5.latency)} ms)`);

  // -------------------------------------------------------------
  // Test 10: Stage 5 Debate Scrum (Blue vs Purple)
  // -------------------------------------------------------------
  process.stdout.write('🔵🟣 Step 10: Stage 5 Debate Scrum pushes... ');
  await admin.send({ type: 'set_stage', stage: 'stage5' });
  const scrumLeftWait = court.waitFor(m => m.type === 'stg5_scrum' && m.delta === -4);
  const scrumRightWait = court.waitFor(m => m.type === 'stg5_scrum' && m.delta === 4);
  await player1.send({ type: 'stg5_scrum', delta: -4 }); // Blue side
  await player5.send({ type: 'stg5_scrum', delta: 4 });  // Purple side
  const [sL, sR] = await Promise.all([scrumLeftWait, scrumRightWait]);
  latencies.push(sL.latency, sR.latency);
  console.log(`PASS (Dual opposing pushes in ${Math.max(sL.latency, sR.latency)} ms)`);

  // -------------------------------------------------------------
  // Test 11: PC 5 Saboteur Action
  // -------------------------------------------------------------
  process.stdout.write('😈 Step 11: PC 5 executes Saboteur action (corrupt_data)... ');
  const sabWait = court.waitFor(m => m.type === 'sabotage' && m.sabType === 'corrupt_data');
  await player5.send({ type: 'sabotage', sabType: 'corrupt_data', playerName: 'ฮิฟุมิ' });
  const sabRes = await sabWait;
  latencies.push(sabRes.latency);
  console.log(`PASS (${sabRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 12: Stage 6 Argument Armament Hit & Final Blow
  // -------------------------------------------------------------
  process.stdout.write('🔨 Step 12: Stage 6 Argument Armament hit & final blow... ');
  await admin.send({ type: 'set_stage', stage: 'stage6' });
  const armPromise = court.waitFor(m => m.type === 'stg6_hit');
  await player1.send({ type: 'stg6_hit', playerName: 'นาเอกิ' });
  const armRes = await armPromise;
  latencies.push(armRes.latency);

  const armBlowWait = court.waitFor(m => m.type === 'stg6_final_blow');
  await player1.send({ type: 'stg6_final_blow', playerName: 'นาเอกิ' });
  const armBlowRes = await armBlowWait;
  latencies.push(armBlowRes.latency);
  console.log(`PASS (Hit & Final Blow in ${armRes.latency + armBlowRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 13: Stage 7 Closing Argument (Page Sync & Card Unlock)
  // -------------------------------------------------------------
  process.stdout.write('📖 Step 13: Stage 7 Closing Argument page sync & card submit... ');
  await admin.send({ type: 'set_stage', stage: 'closing' });

  // Admin flips page
  const pageWait = player1.waitFor(m => m.type === 'closing_page_change' && m.page === 2);
  await admin.send({ type: 'closing_page_change', page: 2 });
  const pageRes = await pageWait;
  latencies.push(pageRes.latency);

  // PC 1 submits card
  const closePromise = court.waitFor(m => m.type === 'closing_submit' && m.cardId === 'CARD-P1-S1');
  await player1.send({ type: 'closing_submit', slot: 1, cardId: 'CARD-P1-S1', playerName: 'นาเอกิ' });
  const closeRes = await closePromise;
  latencies.push(closeRes.latency);

  // Court unlocks next card
  const cardUnlockWait = player2.waitFor(m => m.type === 'closing_card_unlocked');
  await court.send({
    type: 'closing_card_unlocked',
    playerId: 'u-kyoko',
    cardId: 'CARD-P1-S2',
    cardTitle: 'โยนท่อนกระดูกหมูเปื้อนเลือดลงไปต้มในหม้อสตูว์เนื้อ'
  });
  const cardUnlockRes = await cardUnlockWait;
  latencies.push(cardUnlockRes.latency);
  console.log(`PASS (Page changed & card unlocked in ${pageRes.latency + cardUnlockRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 14: Stage 8 Voting Time (All 5 PCs Vote & Verdict)
  // -------------------------------------------------------------
  process.stdout.write('🗳️ Step 14: Stage 8 Voting Time (All 5 PCs vote)... ');
  await admin.send({ type: 'set_stage', stage: 'stage7' });

  const votePromises = roster.map(p => {
    return court.waitFor(m => m.type === 'submit_vote' && m.voterId === p.user);
  });

  for (const p of roster) {
    await p.client.send({
      type: 'submit_vote',
      candidate: 'ช่างกล',
      voterId: p.user
    });
  }

  const voteResults = await Promise.all(votePromises);
  voteResults.forEach(v => latencies.push(v.latency));

  const revealWait = court.waitFor(m => m.type === 'reveal_votes');
  await admin.send({ type: 'reveal_votes' });
  const revRes = await revealWait;
  latencies.push(revRes.latency);

  console.log(`PASS (5 votes recorded & revealed in ${Math.max(...voteResults.map(r=>r.latency))} ms)`);

  // Clean shutdown
  court.close();
  admin.close();
  player1.close();
  player2.close();
  player3.close();
  player4.close();
  player5.close();
  server.close();

  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1);
  const maxLatency = Math.max(...latencies);

  console.log('\n===============================================================');
  console.log('🎉 ALL 14 EXPANDED REAL-TIME SIMULATION TESTS COMPLETED SUCCESSFULLY!');
  console.log(`📊 Statistics: Total Packets Tested: ${latencies.length}`);
  console.log(`⏱️ Average Latency: ${avgLatency} ms | Max Latency: ${maxLatency} ms`);
  console.log('💯 Real-Time Packet Delivery Rate: 100.0%');
  console.log('===============================================================\n');

  process.exit(0);
}

runSimulation().catch((err) => {
  console.error('\n❌ SIMULATION TEST FAILED:', err);
  process.exit(1);
});
