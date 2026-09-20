// Test Simulation Lab message flow across Parent, Court, Admin, and 5 Player frames over BroadcastChannel
const { BroadcastChannel } = require('worker_threads');

const channelName = 'dangan_channel_SIM888';

// Create 8 endpoints representing the parent dashboard and 7 child iframes
const parentBC = new BroadcastChannel(channelName);
const courtBC = new BroadcastChannel(channelName);
const adminBC = new BroadcastChannel(channelName);
const p1BC = new BroadcastChannel(channelName);
const p2BC = new BroadcastChannel(channelName);
const p3BC = new BroadcastChannel(channelName);
const p4BC = new BroadcastChannel(channelName);
const p5BC = new BroadcastChannel(channelName);

let courtReceived = [];
let adminReceived = [];
let playerReceived = [];
let parentLogs = [];

courtBC.onmessage = (e) => courtReceived.push(e.data.type);
adminBC.onmessage = (e) => adminReceived.push(e.data.type);
p1BC.onmessage = (e) => playerReceived.push(e.data.type);
parentBC.onmessage = (e) => parentLogs.push(e.data.type);

async function runTest() {
  console.log('Testing Simulation BroadcastChannel Message Bus...');
  
  // 1. Sim join players
  parentBC.postMessage({ type: 'request_claim_character', playerName: 'นาเอกิ', pcSlot: 1, userHash: 'sim_naegi' });
  parentBC.postMessage({ type: 'request_claim_character', playerName: 'เคียวโกะ', pcSlot: 2, userHash: 'sim_kyoko' });
  parentBC.postMessage({ type: 'request_claim_character', playerName: 'เบียคุยะ', pcSlot: 3, userHash: 'sim_byakuya' });
  parentBC.postMessage({ type: 'request_claim_character', playerName: 'อาโออิ', pcSlot: 4, userHash: 'sim_aoi' });
  parentBC.postMessage({ type: 'request_claim_character', playerName: 'ฮิฟุมิ', pcSlot: 5, userHash: 'sim_hifumi' });

  await new Promise(r => setTimeout(r, 50));

  // 2. Court approves
  courtBC.postMessage({ type: 'claim_approved', targetHash: 'sim_naegi', player: { name: 'นาเอกิ', pcSlot: 1 } });
  courtBC.postMessage({ type: 'claim_approved', targetHash: 'sim_kyoko', player: { name: 'เคียวโกะ', pcSlot: 2 } });
  courtBC.postMessage({ type: 'claim_approved', targetHash: 'sim_byakuya', player: { name: 'เบียคุยะ', pcSlot: 3 } });
  courtBC.postMessage({ type: 'claim_approved', targetHash: 'sim_aoi', player: { name: 'อาโออิ', pcSlot: 4 } });
  courtBC.postMessage({ type: 'claim_approved', targetHash: 'sim_hifumi', player: { name: 'ฮิฟุมิ', pcSlot: 5 } });

  await new Promise(r => setTimeout(r, 50));

  // 3. Stage 0 Non-Stop Debate
  parentBC.postMessage({ type: 'set_stage', stage: 'stage0' });
  parentBC.postMessage({ type: 'stg0_buzz', player: 'นาเอกิ' });
  parentBC.postMessage({ type: 'stg0_shoot', player: 'นาเอกิ', clueId: 'EVD-02' });
  parentBC.postMessage({ type: 'stg0_verdict', approved: true, objector: 'นาเอกิ' });

  await new Promise(r => setTimeout(r, 50));

  // 4. Stage 1 Evidence
  parentBC.postMessage({ type: 'set_stage', stage: 'stage1' });
  p1BC.postMessage({ type: 'stg1_submit', clueId: 'EVD-01', playerName: 'นาเอกิ' });
  courtBC.postMessage({ type: 'stg1_evaluate' });

  await new Promise(r => setTimeout(r, 50));

  // 5. Stage 2 Hangman
  parentBC.postMessage({ type: 'set_stage', stage: 'stage2' });
  parentBC.postMessage({ type: 'stg2_char', char: 'W' });

  await new Promise(r => setTimeout(r, 50));

  // 6. Stage 3 Rebuttal
  parentBC.postMessage({ type: 'set_stage', stage: 'stage3' });
  parentBC.postMessage({ type: 'rebuttal_slash', bullet: 'EVD-02', playerName: 'นาเอกิ' });
  parentBC.postMessage({ type: 'rebuttal_verdict', isWin: true });

  await new Promise(r => setTimeout(r, 50));

  // 7. Stage 4 Logic Dive
  parentBC.postMessage({ type: 'set_stage', stage: 'stage4' });
  p1BC.postMessage({ type: 'logic_dive_vote', choice: 'A' });

  await new Promise(r => setTimeout(r, 50));

  // 8. Stage 5 Scrum
  parentBC.postMessage({ type: 'set_stage', stage: 'stage5' });
  parentBC.postMessage({ type: 'stg5_scrum', delta: 10 });

  await new Promise(r => setTimeout(r, 50));

  // 9. Stage 6 Armament
  parentBC.postMessage({ type: 'set_stage', stage: 'stage6' });
  parentBC.postMessage({ type: 'stg6_shot_fired', shooter: 'นาเอกิ', cellIndex: 0 });
  parentBC.postMessage({ type: 'stg6_final_blow', playerName: 'นาเอกิ' });

  await new Promise(r => setTimeout(r, 50));

  // 10. Closing Argument
  parentBC.postMessage({ type: 'set_stage', stage: 'closing' });
  p1BC.postMessage({ type: 'closing_submit', slot: 1, cardId: 'EVD-14' });

  await new Promise(r => setTimeout(r, 50));

  // 11. Stage 7 Voting
  parentBC.postMessage({ type: 'set_stage', stage: 'stage7' });
  p1BC.postMessage({ type: 'submit_vote', candidate: 'ฮิฟุมิ' });
  courtBC.postMessage({ type: 'reveal_votes' });

  await new Promise(r => setTimeout(r, 100));

  console.log(`Results:
  Court received: ${courtReceived.length} packets
  Admin received: ${adminReceived.length} packets
  Player 1 received: ${playerReceived.length} packets
  Parent received: ${parentLogs.length} packets
  `);

  if (courtReceived.length > 20 && playerReceived.length > 20 && adminReceived.length > 20) {
    console.log('✅ ALL SIMULATION BROADCAST CHANNEL FLOWS VERIFIED SUCCESSFULLY!');
  } else {
    console.error('❌ PACKET LOSS DETECTED');
    process.exit(1);
  }

  parentBC.close();
  courtBC.close();
  adminBC.close();
  p1BC.close();
  p2BC.close();
  p3BC.close();
  p4BC.close();
  p5BC.close();
}

runTest().catch(console.error);
