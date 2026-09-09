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

  console.log('[SSE Setup] Connecting 4 independent clients to room stream...');
  await Promise.all([court.connect(), admin.connect(), player1.connect(), player2.connect()]);
  console.log('✅ All 4 clients connected to real-time stream successfully!\n');

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
  // Test 2: Player 1 (Naegi) Role Claim
  // -------------------------------------------------------------
  process.stdout.write('👤 Step 2: Player 1 (Naegi) claims role "นักแต่งนิยาย"... ');
  const claim1Promise = court.waitFor(m => m.type === 'request_claim_character' && m.playerName === 'นาเอกิ');
  await player1.send({
    type: 'request_claim_character',
    role: 'นักแต่งนิยาย',
    playerName: 'นาเอกิ',
    userHash: 'u-naegi'
  });
  const claim1 = await claim1Promise;
  latencies.push(claim1.latency);

  // Court approves claim 1
  const app1Promise = player1.waitFor(m => m.type === 'claim_approved' && m.targetHash === 'u-naegi');
  await court.send({
    type: 'claim_approved',
    targetHash: 'u-naegi',
    player: { id: 'u-naegi', name: 'นาเอกิ', role: 'นักแต่งนิยาย', isKiller: false },
    state: { players: { 'u-naegi': { name: 'นาเอกิ', role: 'นักแต่งนิยาย' } } }
  });
  const app1 = await app1Promise;
  latencies.push(app1.latency);
  console.log(`PASS (${claim1.latency + app1.latency} ms roundtrip)`);

  // -------------------------------------------------------------
  // Test 3: Player 2 (Kyoko) Role Claim
  // -------------------------------------------------------------
  process.stdout.write('👤 Step 3: Player 2 (Kyoko) claims role "นักกีฬา"... ');
  const claim2Promise = court.waitFor(m => m.type === 'request_claim_character' && m.playerName === 'เคียวโกะ');
  await player2.send({
    type: 'request_claim_character',
    role: 'นักกีฬา',
    playerName: 'เคียวโกะ',
    userHash: 'u-kyoko'
  });
  const claim2 = await claim2Promise;
  latencies.push(claim2.latency);

  // Court approves claim 2
  const app2Promise = player2.waitFor(m => m.type === 'claim_approved' && m.targetHash === 'u-kyoko');
  await court.send({
    type: 'claim_approved',
    targetHash: 'u-kyoko',
    player: { id: 'u-kyoko', name: 'เคียวโกะ', role: 'นักกีฬา', isKiller: false },
    state: { players: { 'u-naegi': { name: 'นาเอกิ' }, 'u-kyoko': { name: 'เคียวโกะ' } } }
  });
  const app2 = await app2Promise;
  latencies.push(app2.latency);
  console.log(`PASS (${claim2.latency + app2.latency} ms roundtrip)`);

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
  // Test 8: Stage 3 Rebuttal Showdown Blade Slash
  // -------------------------------------------------------------
  process.stdout.write('🗡️ Step 8: Mobile Player 1 sends Rebuttal Slash with bullet... ');
  await admin.send({ type: 'set_stage', stage: 'stage3' });
  const slashPromise = court.waitFor(m => m.type === 'rebuttal_slash' && m.bullet === 'EVD-01');
  await player1.send({ type: 'rebuttal_slash', bullet: 'EVD-01', playerName: 'นาเอกิ' });
  const slashRes = await slashPromise;
  latencies.push(slashRes.latency);
  console.log(`PASS (${slashRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 9: Stage 4 Logic Dive Choices
  // -------------------------------------------------------------
  process.stdout.write('🛹 Step 9: Players vote choices in Logic Dive... ');
  await admin.send({ type: 'set_stage', stage: 'stage4' });
  const divePromise1 = court.waitFor(m => m.type === 'logic_dive_vote' && m.choice === 'A' && m.voterId === 'u-naegi');
  const divePromise2 = court.waitFor(m => m.type === 'logic_dive_vote' && m.choice === 'A' && m.voterId === 'u-kyoko');
  await player1.send({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'u-naegi', playerName: 'นาเอกิ' });
  await player2.send({ type: 'logic_dive_vote', question: 1, choice: 'A', voterId: 'u-kyoko', playerName: 'เคียวโกะ' });
  const [d1, d2] = await Promise.all([divePromise1, divePromise2]);
  latencies.push(d1.latency, d2.latency);
  console.log(`PASS (Both votes registered in ${Math.max(d1.latency, d2.latency)} ms)`);

  // -------------------------------------------------------------
  // Test 10: Stage 5 Debate Scrum Logic Push
  // -------------------------------------------------------------
  process.stdout.write('🔥 Step 10: Mobile Player 1 sends Debate Scrum push (+4%)... ');
  await admin.send({ type: 'set_stage', stage: 'stage5' });
  const scrumPromise = court.waitFor(m => m.type === 'stg5_scrum' && m.delta === 4);
  await player1.send({ type: 'stg5_scrum', delta: 4 });
  const scrumRes = await scrumPromise;
  latencies.push(scrumRes.latency);
  console.log(`PASS (${scrumRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 11: Stage 6 Argument Armament Shield Hit
  // -------------------------------------------------------------
  process.stdout.write('🔨 Step 11: Mobile Player 1 sends Argument Armament hit... ');
  await admin.send({ type: 'set_stage', stage: 'stage6' });
  const armPromise = court.waitFor(m => m.type === 'stg6_hit');
  await player1.send({ type: 'stg6_hit', playerName: 'นาเอกิ' });
  const armRes = await armPromise;
  latencies.push(armRes.latency);
  console.log(`PASS (${armRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 12: Closing Argument Comic Card Placement
  // -------------------------------------------------------------
  process.stdout.write('📖 Step 12: Mobile Player 1 submits Closing Card EVD-14... ');
  await admin.send({ type: 'set_stage', stage: 'closing' });
  const closePromise = court.waitFor(m => m.type === 'closing_submit' && m.cardId === 'EVD-14');
  await player1.send({ type: 'closing_submit', slot: 1, cardId: 'EVD-14', playerName: 'นาเอกิ' });
  const closeRes = await closePromise;
  latencies.push(closeRes.latency);
  console.log(`PASS (${closeRes.latency} ms)`);

  // -------------------------------------------------------------
  // Test 13: Stage 7 Voting Time Votes Submission
  // -------------------------------------------------------------
  process.stdout.write('🗳️ Step 13: Players submit votes in Voting Time... ');
  await admin.send({ type: 'set_stage', stage: 'stage7' });
  const vote1Promise = court.waitFor(m => m.type === 'submit_vote' && m.voterId === 'u-naegi');
  const vote2Promise = court.waitFor(m => m.type === 'submit_vote' && m.voterId === 'u-kyoko');
  await player1.send({ type: 'submit_vote', candidate: 'นักมายากล', voterId: 'u-naegi' });
  await player2.send({ type: 'submit_vote', candidate: 'นักมายากล', voterId: 'u-kyoko' });
  const [v1, v2] = await Promise.all([vote1Promise, vote2Promise]);
  latencies.push(v1.latency, v2.latency);
  console.log(`PASS (Both votes arrived on Court in ${Math.max(v1.latency, v2.latency)} ms)`);

  // Clean shutdown
  court.close();
  admin.close();
  player1.close();
  player2.close();
  server.close();

  const avgLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1);
  const maxLatency = Math.max(...latencies);

  console.log('\n===============================================================');
  console.log('🎉 ALL 13 REAL-TIME SIMULATION TESTS COMPLETED SUCCESSFULLY!');
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
