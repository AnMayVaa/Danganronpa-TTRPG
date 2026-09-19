const fs = require('fs');

// Minimal DOM mock
const elements = {};
global.document = {
  getElementById: (id) => {
    if (!elements[id]) {
      elements[id] = {
        id,
        _innerHTML: '',
        get innerHTML() { return this._innerHTML; },
        set innerHTML(val) {
          this._innerHTML = val;
          if (val === '') this.children = [];
        },
        options: [],
        children: [],
        style: {},
        appendChild: function(child) { this.children.push(child); },
        classList: { add: () => {}, remove: () => {} }
      };
    }
    return elements[id];
  },
  querySelector: () => null,
  createElement: (tag) => ({
    tagName: tag,
    className: '',
    style: {},
    innerHTML: '',
    children: []
  })
};
global.window = {
  location: { search: '' },
  addEventListener: () => {},
  removeEventListener: () => {}
};
global.document.addEventListener = () => {};
global.document.removeEventListener = () => {};
global.localStorage = {
  store: {},
  getItem: function(k) { return this.store[k] || null; },
  setItem: function(k, v) { this.store[k] = String(v); }
};
global.escapeHtml = (s) => String(s);
global.broadcast = (msg) => { /* console.log('[BROADCAST]', msg.type); */ };
global.playSfx = () => {};
global.showToast = (msg) => { console.log('[TOAST]', msg); };
global.logCourt = (msg) => { console.log('[LOG]', msg); };
global.confirm = () => true;
global.alert = (msg) => { console.log('[ALERT]', msg); };

// Load client.js
const code = fs.readFileSync('js/client.js', 'utf8')
  .replace(/let gameState\s*=/g, 'global.gameState =')
  .replace(/var gameState\s*=/g, 'global.gameState =');
eval(code);

console.log('=== 1. TEST resolvePlayerSlot ===');
console.log('Case 1: { name: "Ohm PC 1" } ->', resolvePlayerSlot({ name: "Ohm PC 1" }));
console.log('Case 2: { name: "Ohm", pcSlot: 2 } ->', resolvePlayerSlot({ name: "Ohm", pcSlot: 2 }));
console.log('Case 3: { name: "Ohm", role: "เคียวโกะ" } ->', resolvePlayerSlot({ name: "Ohm", role: "เคียวโกะ" }));
console.log('Case 4: { name: "Ohm" } alone (defaultIndex 1) ->', resolvePlayerSlot({ name: "Ohm" }, 1));

console.log('\n=== 2. TEST adminDistributeRoleClues for Ohm PC 1 ===');
gameState.players = {
  'user_ohm': { id: 'p_ohm', name: 'Ohm PC 1', userHash: 'user_ohm', clues: [] }
};
adminDistributeRoleClues();
const ohm = gameState.players['user_ohm'];
console.log('Ohm pcSlot:', ohm.pcSlot);
console.log('Ohm clues count:', ohm.clues.length, 'Clues:', ohm.clues);
if (ohm.clues.length === 6 && ohm.pcSlot === 1) {
  console.log('✅ PASS: adminDistributeRoleClues granted all 6 PC 1 clues!');
} else {
  console.error('❌ FAIL: adminDistributeRoleClues failed');
  process.exit(1);
}

console.log('\n=== 3. TEST adminGrantRoleCluesToPlayer ===');
ohm.clues = [];
adminGrantRoleCluesToPlayer('user_ohm');
console.log('Ohm clues count after single grant:', ohm.clues.length, 'Clues:', ohm.clues);
if (ohm.clues.length === 6) {
  console.log('✅ PASS: adminGrantRoleCluesToPlayer granted 6 role clues!');
} else {
  console.error('❌ FAIL: adminGrantRoleCluesToPlayer failed');
  process.exit(1);
}

console.log('\n=== 4. TEST renderAdminEvidenceTracker deduplication & container clear ===');
const container = document.getElementById('adminPlayerEvidenceList');
container.innerHTML = '<div style="text-align:center; padding:16px; color:#64748b; font-size:0.85rem;">ยังไม่มีผู้เล่นเชื่อมต่อในระบบ (0 คน)</div>';
container.children = [{}]; // Mock previous child

renderAdminEvidenceTracker();
console.log('Container children count:', container.children.length);
if (container.children.length === 1 && !container.innerHTML.includes('ยังไม่มีผู้เล่นเชื่อมต่อในระบบ')) {
  console.log('✅ PASS: Exactly 1 card rendered, "no players" banner properly cleared!');
} else {
  console.error('❌ FAIL: Evidence tracker rendered incorrectly');
  process.exit(1);
}

console.log('\n=== 5. TEST adminBroadcastClue ===');
adminBroadcastClue('EVD-01');
console.log('Ohm clues has EVD-01:', ohm.clues.includes('EVD-01'));
if (ohm.clues.includes('EVD-01')) {
  console.log('✅ PASS: adminBroadcastClue added EVD-01 to Ohm!');
} else {
  console.error('❌ FAIL: adminBroadcastClue failed');
  process.exit(1);
}

console.log('\n=== 6. TEST Server static asset subdirectory resolution ===');
const srv = require('../server.js');
const testPort = 39871;
srv.listen(testPort, () => {
  const http = require('http');
  http.get(`http://localhost:${testPort}/assets/item_water_drops.jpg`, (res) => {
    console.log('GET /assets/item_water_drops.jpg -> status:', res.statusCode, 'content-type:', res.headers['content-type']);
    if (res.statusCode === 200 && res.headers['content-type'] === 'image/jpeg') {
      console.log('✅ PASS: Server resolved asset from assets/item/ correctly!');
      srv.close(() => {
        console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
        process.exit(0);
      });
    } else {
      console.error('❌ FAIL: Failed to resolve asset');
      srv.close(() => process.exit(1));
    }
  });
});
