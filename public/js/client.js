
// ============================================================
// DRESS-UP AVATAR CREATOR & SVG ENGINE
// ============================================================
const AVATAR_OPTIONS = {
  skins: [
    { id: 0, name: 'ขาวอมชมพู', color: '#ffe0bd', shadow: '#e8b892' },
    { id: 1, name: 'ผิวสองสี', color: '#ffd1a4', shadow: '#dba574' },
    { id: 2, name: 'ผิวแทน', color: '#c68652', shadow: '#9c6136' },
    { id: 3, name: 'ขาวซีด', color: '#f5ebe6', shadow: '#d6c0b6' }
  ],
  hairStyles: [
    { id: 0, name: 'สไปกี้ตัวเอก (Spiky Ahoge)' },
    { id: 1, name: 'แสกข้างสุขุม (Slick Part)' },
    { id: 2, name: 'ผมยาวสลวย (Long Straight)' },
    { id: 3, name: 'ทวินเทล (Twin Tails)' },
    { id: 4, name: 'บ็อบนุ่มนวล (Fluffy Bob)' },
    { id: 5, name: 'ไวลด์/นักเลง (Wild Pompadour)' }
  ],
  hairColors: [
    { id: 0, name: 'ดำขลับ', color: '#25262c', highlight: '#444654' },
    { id: 1, name: 'น้ำตาลเข้ม', color: '#543625', highlight: '#785038' },
    { id: 2, name: 'บลอนด์ทอง', color: '#dfaa33', highlight: '#f3c760' },
    { id: 3, name: 'ม่วงพาสเทล', color: '#887bb0', highlight: '#b1a5d6' },
    { id: 4, name: 'ชมพูนีออน', color: '#ff2e88', highlight: '#ff66a8' },
    { id: 5, name: 'ฟ้าไซเบอร์', color: '#00b4d8', highlight: '#48cae4' },
    { id: 6, name: 'ขาวเงิน', color: '#d8dee9', highlight: '#f1f5f9' }
  ],
  eyes: [
    { id: 0, name: 'มุ่งมั่น (Confident)' },
    { id: 1, name: 'สุขุม/เฉียบคม (Analytical)' },
    { id: 2, name: 'สดใส (Cheerful)' },
    { id: 3, name: 'เจ้าเล่ห์ (Smug)' },
    { id: 4, name: 'เคร่งขรึม (Serious)' }
  ],
  outfits: [
    { id: 0, name: 'สูทนักเรียน (Blazer)', color: '#1e212d', trim: '#ff3366', tie: '#e63946' },
    { id: 1, name: 'ชุดกะลาสี (Sailor)', color: '#1d3557', trim: '#f1faee', tie: '#e63946' },
    { id: 2, name: 'เสื้อฮู้ด (Hoodie)', color: '#386641', trim: '#6a994e', tie: '#a7c957' },
    { id: 3, name: 'เสื้อกั๊กทางการ (Vest)', color: '#2b2d42', trim: '#8d99ae', tie: '#ffd166' },
    { id: 4, name: 'ชุดวอร์ม (Tracksuit)', color: '#d90429', trim: '#ffffff', tie: '#ffffff' }
  ],
  accessories: [
    { id: 0, name: 'ไม่มี (None)' },
    { id: 1, name: 'แว่นตาดำ (Glasses)' },
    { id: 2, name: 'แว่นตากลม (Round Glasses)' },
    { id: 3, name: 'พลาสเตอร์ยา (Bandage)' },
    { id: 4, name: 'กิ๊บติดผม (Hairpin)' },
    { id: 5, name: 'หูฟังเกมมิ่ง (Headphones)' }
  ]
};

let currentAvatarConfig = loadSavedAvatarConfig();
let tempAvatarConfig = Object.assign({}, currentAvatarConfig);

function loadSavedAvatarConfig() {
  try {
    const saved = localStorage.getItem('dangan_avatar_config');
    if (saved) return JSON.parse(saved);
  } catch(e) {}
  return { skin: 0, hairStyle: 0, hairColor: 0, eyes: 0, outfit: 0, acc: 0 };
}

function saveAvatarConfigToLocal(cfg) {
  try {
    localStorage.setItem('dangan_avatar_config', JSON.stringify(cfg));
  } catch(e) {}
}

function renderAvatarSvg(cfg, size = 100, isShouting = false) {
  const conf = Object.assign({ skin: 0, hairStyle: 0, hairColor: 0, eyes: 0, outfit: 0, acc: 0 }, cfg || {});
  const skin = AVATAR_OPTIONS.skins[conf.skin % AVATAR_OPTIONS.skins.length] || AVATAR_OPTIONS.skins[0];
  const hairCol = AVATAR_OPTIONS.hairColors[conf.hairColor % AVATAR_OPTIONS.hairColors.length] || AVATAR_OPTIONS.hairColors[0];
  const outfit = AVATAR_OPTIONS.outfits[conf.outfit % AVATAR_OPTIONS.outfits.length] || AVATAR_OPTIONS.outfits[0];
  const hairStyle = conf.hairStyle % AVATAR_OPTIONS.hairStyles.length;
  const eyesStyle = conf.eyes % AVATAR_OPTIONS.eyes.length;
  const accStyle = conf.acc % AVATAR_OPTIONS.accessories.length;

  let backHair = '';
  if (hairStyle === 2) {
    backHair = `<path d="M 24 40 C 18 60, 16 85, 14 98 L 32 98 C 30 75, 28 55, 28 40 Z" fill="${hairCol.color}" />
                <path d="M 76 40 C 82 60, 84 85, 86 98 L 68 98 C 70 75, 72 55, 72 40 Z" fill="${hairCol.color}" />`;
  } else if (hairStyle === 3) {
    backHair = `<path d="M 22 35 C 10 45, 6 70, 8 92 C 14 78, 20 60, 24 45 Z" fill="${hairCol.color}" />
                <path d="M 78 35 C 90 45, 94 70, 92 92 C 86 78, 80 60, 76 45 Z" fill="${hairCol.color}" />`;
  }

  let bodyOutfit = '';
  if (conf.outfit === 0) {
    bodyOutfit = `
      <path d="M 20 98 L 24 72 L 36 66 L 50 74 L 64 66 L 76 72 L 80 98 Z" fill="${outfit.color}" />
      <path d="M 38 67 L 50 90 L 62 67 Z" fill="#ffffff" />
      <path d="M 47 70 L 53 70 L 52 88 L 50 93 L 48 88 Z" fill="${outfit.tie}" />
      <path d="M 34 66 L 46 80 L 38 82 L 26 73 Z" fill="#2d3142" />
      <path d="M 66 66 L 54 80 L 62 82 L 74 73 Z" fill="#2d3142" />
      <circle cx="34" cy="78" r="2.5" fill="${outfit.trim}" />
    `;
  } else if (conf.outfit === 1) {
    bodyOutfit = `
      <path d="M 20 98 L 24 72 L 36 66 L 50 72 L 64 66 L 76 72 L 80 98 Z" fill="${outfit.color}" />
      <path d="M 32 66 L 50 86 L 68 66 L 75 73 L 50 95 L 25 73 Z" fill="${outfit.trim}" />
      <path d="M 44 80 L 56 80 L 50 88 Z" fill="${outfit.tie}" />
      <circle cx="50" cy="80" r="3" fill="#ffffff" />
    `;
  } else if (conf.outfit === 2) {
    bodyOutfit = `
      <path d="M 20 98 L 24 72 L 34 64 L 50 68 L 66 64 L 76 72 L 80 98 Z" fill="${outfit.color}" />
      <path d="M 49 68 L 51 68 L 51 98 L 49 98 Z" fill="${outfit.trim}" />
      <path d="M 38 66 Q 50 78 62 66 Q 50 72 38 66 Z" fill="${outfit.trim}" />
      <line x1="45" y1="74" x2="45" y2="88" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
      <line x1="55" y1="74" x2="55" y2="88" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" />
    `;
  } else if (conf.outfit === 3) {
    bodyOutfit = `
      <path d="M 20 98 L 24 72 L 36 66 L 50 72 L 64 66 L 76 72 L 80 98 Z" fill="#ffffff" />
      <path d="M 26 73 L 42 75 L 42 98 L 20 98 Z" fill="${outfit.color}" />
      <path d="M 74 73 L 58 75 L 58 98 L 80 98 Z" fill="${outfit.color}" />
      <path d="M 47 68 L 53 68 L 52 86 L 50 90 L 48 86 Z" fill="${outfit.tie}" />
    `;
  } else {
    bodyOutfit = `
      <path d="M 20 98 L 24 72 L 36 66 L 50 70 L 64 66 L 76 72 L 80 98 Z" fill="${outfit.color}" />
      <line x1="22" y1="73" x2="20" y2="98" stroke="${outfit.trim}" stroke-width="2.5" />
      <line x1="78" y1="73" x2="80" y2="98" stroke="${outfit.trim}" stroke-width="2.5" />
      <line x1="50" y1="70" x2="50" y2="98" stroke="#ffffff" stroke-width="2" />
    `;
  }

  const neckHead = `
    <polygon points="44,60 56,60 54,72 46,72" fill="${skin.shadow}" />
    <polygon points="45,61 55,61 53,70 47,70" fill="${skin.color}" />
    <circle cx="28" cy="46" r="5" fill="${skin.shadow}" />
    <circle cx="29" cy="46" r="3.5" fill="${skin.color}" />
    <circle cx="72" cy="46" r="5" fill="${skin.shadow}" />
    <circle cx="71" cy="46" r="3.5" fill="${skin.color}" />
    <path d="M 30 38 Q 28 54 50 67 Q 72 54 70 38 Q 70 20 50 20 Q 30 20 30 38 Z" fill="${skin.color}" />
  `;

  let eyesSvg = '';
  if (isShouting) {
    eyesSvg = `
      <!-- Fierce Slanted Eyebrows -->
      <path d="M 32 33 L 48 37" stroke="#111" stroke-width="3.2" stroke-linecap="round" />
      <path d="M 68 33 L 52 37" stroke="#111" stroke-width="3.2" stroke-linecap="round" />
      <!-- Intense Eyes with Focused Pupils -->
      <path d="M 33 40 Q 41 36 47 41" stroke="#111" stroke-width="2.8" fill="none" />
      <circle cx="41" cy="42.5" r="3.6" fill="${hairCol.color === '#ff4081' ? '#ff0055' : '#1d3557'}" />
      <circle cx="42.5" cy="41.5" r="1.5" fill="#ffffff" />
      <circle cx="39.5" cy="43.5" r="0.8" fill="#ffffff" />
      <path d="M 67 40 Q 59 36 53 41" stroke="#111" stroke-width="2.8" fill="none" />
      <circle cx="59" cy="42.5" r="3.6" fill="${hairCol.color === '#ff4081' ? '#ff0055' : '#1d3557'}" />
      <circle cx="60.5" cy="41.5" r="1.5" fill="#ffffff" />
      <circle cx="57.5" cy="43.5" r="0.8" fill="#ffffff" />
      <!-- Nose -->
      <path d="M 50 48 L 48 52 L 51 52" stroke="${skin.shadow}" stroke-width="1.8" fill="none" />
      <!-- Open Shouting Mouth with teeth and tongue -->
      <path d="M 40 54 Q 50 50 60 54 Q 59 68 50 69.5 Q 41 68 40 54 Z" fill="#4a151b" stroke="#111" stroke-width="2" />
      <path d="M 42 54.5 Q 50 52 58 54.5 L 57 57 Q 50 55 43 57 Z" fill="#ffffff" />
      <path d="M 44 63 Q 50 60.5 56 63 Q 55 68.5 50 69 Q 45 68.5 44 63 Z" fill="#f43f5e" />
    `;
  } else if (eyesStyle === 0) {
    eyesSvg = `
      <path d="M 35 37 Q 40 34 46 36" stroke="#222" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M 65 37 Q 60 34 54 36" stroke="#222" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M 35 43 Q 41 39 46 43" stroke="#222" stroke-width="2.5" fill="none" />
      <circle cx="41" cy="44" r="3.5" fill="#1d3557" />
      <circle cx="42" cy="43" r="1.2" fill="#ffffff" />
      <path d="M 65 43 Q 59 39 54 43" stroke="#222" stroke-width="2.5" fill="none" />
      <circle cx="59" cy="44" r="3.5" fill="#1d3557" />
      <circle cx="60" cy="43" r="1.2" fill="#ffffff" />
      <path d="M 50 49 L 49 53 L 51 53" stroke="${skin.shadow}" stroke-width="1.5" fill="none" />
      <path d="M 45 58 Q 50 62 55 58" stroke="#993344" stroke-width="2" stroke-linecap="round" fill="none" />
    `;
  } else if (eyesStyle === 1) {
    eyesSvg = `
      <line x1="35" y1="36" x2="46" y2="36" stroke="#222" stroke-width="2" stroke-linecap="round" />
      <line x1="65" y1="36" x2="54" y2="36" stroke="#222" stroke-width="2" stroke-linecap="round" />
      <path d="M 34 43 L 46 42" stroke="#222" stroke-width="2.8" stroke-linecap="round" />
      <circle cx="40" cy="44" r="2.8" fill="#58355e" />
      <circle cx="41" cy="43" r="1" fill="#ffffff" />
      <path d="M 66 43 L 54 42" stroke="#222" stroke-width="2.8" stroke-linecap="round" />
      <circle cx="60" cy="44" r="2.8" fill="#58355e" />
      <circle cx="61" cy="43" r="1" fill="#ffffff" />
      <path d="M 50 49 L 49 53" stroke="${skin.shadow}" stroke-width="1.5" />
      <line x1="46" y1="58" x2="54" y2="58" stroke="#883344" stroke-width="2" stroke-linecap="round" />
    `;
  } else if (eyesStyle === 2) {
    eyesSvg = `
      <path d="M 34 35 Q 40 33 46 36" stroke="#222" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M 66 35 Q 60 33 54 36" stroke="#222" stroke-width="2" stroke-linecap="round" fill="none" />
      <ellipse cx="40" cy="44" rx="4" ry="5" fill="#3a5a40" />
      <circle cx="41" cy="42" r="1.8" fill="#ffffff" />
      <ellipse cx="60" cy="44" rx="4" ry="5" fill="#3a5a40" />
      <circle cx="61" cy="42" r="1.8" fill="#ffffff" />
      <ellipse cx="33" cy="51" rx="3.5" ry="1.5" fill="#ff758f" opacity="0.6" />
      <ellipse cx="67" cy="51" rx="3.5" ry="1.5" fill="#ff758f" opacity="0.6" />
      <path d="M 44 56 Q 50 64 56 56 Z" fill="#cc3355" />
    `;
  } else if (eyesStyle === 3) {
    eyesSvg = `
      <path d="M 34 37 L 46 35" stroke="#222" stroke-width="2" stroke-linecap="round" />
      <path d="M 54 34 Q 60 30 66 35" stroke="#222" stroke-width="2" stroke-linecap="round" fill="none" />
      <path d="M 34 43 Q 40 40 46 44" stroke="#222" stroke-width="2.5" fill="none" />
      <circle cx="41" cy="44" r="3" fill="#b5179e" />
      <circle cx="42" cy="43" r="1" fill="#fff" />
      <path d="M 66 42 Q 60 39 54 43" stroke="#222" stroke-width="2.5" fill="none" />
      <circle cx="59" cy="43" r="3" fill="#b5179e" />
      <circle cx="60" cy="42" r="1" fill="#fff" />
      <path d="M 47 58 Q 54 58 57 53" stroke="#881133" stroke-width="2" stroke-linecap="round" fill="none" />
    `;
  } else {
    eyesSvg = `
      <path d="M 34 35 L 47 38" stroke="#222" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 66 35 L 53 38" stroke="#222" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 35 44 L 46 43" stroke="#222" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="41" cy="45" r="3" fill="#9d0208" />
      <circle cx="42" cy="44" r="1" fill="#fff" />
      <path d="M 65 44 L 54 43" stroke="#222" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="59" cy="45" r="3" fill="#9d0208" />
      <circle cx="60" cy="44" r="1" fill="#fff" />
      <path d="M 45 59 Q 50 56 55 59" stroke="#771122" stroke-width="2" stroke-linecap="round" fill="none" />
    `;
  }

  let frontHair = '';
  if (hairStyle === 0) {
    frontHair = `
      <path d="M 50 20 Q 52 4 60 6 Q 54 10 50 18 Z" fill="${hairCol.color}" />
      <path d="M 26 38 C 24 20, 36 12, 50 12 C 64 12, 76 20, 74 38 C 72 32, 68 28, 64 34 C 60 26, 56 26, 52 38 C 48 26, 44 26, 40 36 C 36 28, 30 30, 26 38 Z" fill="${hairCol.color}" />
      <path d="M 34 18 Q 50 14 66 18 Q 50 16 34 18 Z" fill="${hairCol.highlight}" opacity="0.8" />
    `;
  } else if (hairStyle === 1) {
    frontHair = `
      <path d="M 26 36 C 25 18, 38 12, 50 12 C 64 12, 75 18, 74 36 C 72 30, 68 28, 62 30 C 52 30, 42 36, 32 40 C 29 36, 27 36, 26 36 Z" fill="${hairCol.color}" />
      <path d="M 36 16 Q 50 14 64 18" stroke="${hairCol.highlight}" stroke-width="2" fill="none" />
    `;
  } else if (hairStyle === 2) {
    frontHair = `
      <path d="M 26 44 C 24 20, 36 12, 50 12 C 64 12, 76 20, 74 44 C 72 34, 68 32, 66 40 C 62 30, 56 28, 50 32 C 44 28, 38 30, 34 40 C 32 32, 28 34, 26 44 Z" fill="${hairCol.color}" />
      <path d="M 32 20 Q 50 16 68 20" stroke="${hairCol.highlight}" stroke-width="2" fill="none" />
    `;
  } else if (hairStyle === 3) {
    frontHair = `
      <circle cx="20" cy="34" r="3.5" fill="#ff0055" />
      <circle cx="80" cy="34" r="3.5" fill="#ff0055" />
      <path d="M 26 40 C 25 18, 36 12, 50 12 C 64 12, 75 18, 74 40 C 70 32, 66 30, 60 34 C 54 28, 46 28, 40 34 C 34 30, 30 32, 26 40 Z" fill="${hairCol.color}" />
    `;
  } else if (hairStyle === 4) {
    frontHair = `
      <path d="M 24 46 C 20 28, 32 10, 50 10 C 68 10, 80 28, 76 46 C 74 38, 70 34, 66 42 C 60 32, 54 30, 50 34 C 46 30, 40 32, 34 42 C 30 34, 26 38, 24 46 Z" fill="${hairCol.color}" />
    `;
  } else {
    frontHair = `
      <path d="M 28 36 C 24 16, 28 4, 50 2 C 72 4, 76 16, 72 36 C 70 28, 66 26, 62 32 C 58 22, 52 22, 48 30 C 42 22, 36 26, 32 32 C 30 28, 28 32, 28 36 Z" fill="${hairCol.color}" />
      <path d="M 40 8 Q 50 5 60 8" stroke="${hairCol.highlight}" stroke-width="2" fill="none" />
    `;
  }

  let accSvg = '';
  if (accStyle === 1) {
    accSvg = `
      <rect x="33" y="40" width="13" height="8" rx="2" fill="none" stroke="#222222" stroke-width="2" />
      <rect x="54" y="40" width="13" height="8" rx="2" fill="none" stroke="#222222" stroke-width="2" />
      <line x1="46" y1="44" x2="54" y2="44" stroke="#222222" stroke-width="2" />
      <line x1="28" y1="43" x2="33" y2="43" stroke="#222222" stroke-width="1.8" />
      <line x1="67" y1="43" x2="72" y2="43" stroke="#222222" stroke-width="1.8" />
    `;
  } else if (accStyle === 2) {
    accSvg = `
      <circle cx="40" cy="44" r="6" fill="none" stroke="#d4af37" stroke-width="1.8" />
      <circle cx="60" cy="44" r="6" fill="none" stroke="#d4af37" stroke-width="1.8" />
      <path d="M 46 44 Q 50 42 54 44" stroke="#d4af37" stroke-width="1.8" fill="none" />
    `;
  } else if (accStyle === 3) {
    accSvg = `
      <rect x="33" y="50" width="7" height="4" rx="1" transform="rotate(-15 36 52)" fill="#ffffff" stroke="#c0a080" stroke-width="0.8" />
    `;
  } else if (accStyle === 4) {
    accSvg = `
      <line x1="64" y1="28" x2="72" y2="34" stroke="#ff0055" stroke-width="2.5" stroke-linecap="round" />
      <line x1="72" y1="28" x2="64" y2="34" stroke="#ff0055" stroke-width="2.5" stroke-linecap="round" />
    `;
  } else if (accStyle === 5) {
    accSvg = `
      <path d="M 28 62 C 26 76, 74 76, 72 62" stroke="#222228" stroke-width="5" stroke-linecap="round" fill="none" />
      <rect x="23" y="58" width="8" height="12" rx="3" fill="#ff0055" />
      <rect x="69" y="58" width="8" height="12" rx="3" fill="#ff0055" />
    `;
  }

  const gradId = 'bgGrad_' + size + '_' + Math.floor(Math.random()*100000);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" class="dangan-avatar-svg">
      <defs>
        <radialGradient id="${gradId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#2a2a44" />
          <stop offset="100%" stop-color="#121220" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#${gradId})" stroke="#3f3f60" stroke-width="2" />
      ${backHair}
      ${bodyOutfit}
      ${neckHead}
      ${eyesSvg}
      ${frontHair}
      ${accSvg}
    </svg>
  `.trim();
}

function updateAvatarJoinPreview() {
  const wrap = document.getElementById('joinAvatarSvgWrap');
  if (wrap) {
    wrap.innerHTML = renderAvatarSvg(currentAvatarConfig, 64);
  }
  const myAv = document.getElementById('pMyAvatar');
  if (myAv) {
    myAv.innerHTML = renderAvatarSvg(currentAvatarConfig, 38);
  }
}

function randomizeAvatarAndRender() {
  currentAvatarConfig = {
    skin: Math.floor(Math.random() * AVATAR_OPTIONS.skins.length),
    hairStyle: Math.floor(Math.random() * AVATAR_OPTIONS.hairStyles.length),
    hairColor: Math.floor(Math.random() * AVATAR_OPTIONS.hairColors.length),
    eyes: Math.floor(Math.random() * AVATAR_OPTIONS.eyes.length),
    outfit: Math.floor(Math.random() * AVATAR_OPTIONS.outfits.length),
    acc: Math.floor(Math.random() * AVATAR_OPTIONS.accessories.length)
  };
  saveAvatarConfigToLocal(currentAvatarConfig);
  updateAvatarJoinPreview();
  if (myPlayer) {
    myPlayer.avatarConfig = currentAvatarConfig;
    broadcast({
      type: 'update_player_avatar',
      userHash: currentUserHash,
      avatarConfig: currentAvatarConfig
    });
    renderPlayerCharSheet();
  }
  showToast('🎲 สุ่มชุดตัวละครใหม่เรียบร้อย!');
}

function openAvatarModal() {
  tempAvatarConfig = Object.assign({}, myPlayer?.avatarConfig || currentAvatarConfig);
  const modal = document.getElementById('avatarDressUpModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderAvatarModalControls();
  updateAvatarModalPreview();

  // Smooth scroll into view so the player clearly sees where it is on all screens
  setTimeout(() => {
    const box = modal.querySelector('.avatar-dressup-box') || modal;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const content = modal.querySelector('.avatar-dressup-content');
    if (content) content.scrollTop = 0;
  }, 40);
}

function closeAvatarModal() {
  const modal = document.getElementById('avatarDressUpModal');
  if (modal) modal.classList.add('hidden');
}

function updateAvatarModalPreview() {
  const wrap = document.getElementById('avatarModalPreviewWrap');
  if (wrap) wrap.innerHTML = renderAvatarSvg(tempAvatarConfig, 140);
}

function switchAvatarTab(tab) {
  ['hair', 'face', 'outfit', 'acc'].forEach(t => {
    const pane = document.getElementById(`avatarPane${t.charAt(0).toUpperCase() + t.slice(1)}`);
    const btn = document.getElementById(`avTab${t.charAt(0).toUpperCase() + t.slice(1)}`);
    if (pane) pane.classList.toggle('hidden', t !== tab);
    if (btn) btn.classList.toggle('active', t === tab);
  });
}

function renderAvatarModalControls() {
  const hairGrid = document.getElementById('avatarHairChoices');
  if (hairGrid) {
    hairGrid.innerHTML = AVATAR_OPTIONS.hairStyles.map((h, idx) => `
      <div class="avatar-choice-card ${tempAvatarConfig.hairStyle === idx ? 'active' : ''}" onclick="selectAvatarOption('hairStyle', ${idx})">
        ${h.name}
      </div>
    `).join('');
  }

  const hairColorGrid = document.getElementById('avatarHairColorSwatches');
  if (hairColorGrid) {
    hairColorGrid.innerHTML = AVATAR_OPTIONS.hairColors.map((c, idx) => `
      <div class="avatar-color-swatch ${tempAvatarConfig.hairColor === idx ? 'active' : ''}" 
           style="background:${c.color};" 
           title="${c.name}"
           onclick="selectAvatarOption('hairColor', ${idx})"></div>
    `).join('');
  }

  const skinGrid = document.getElementById('avatarSkinSwatches');
  if (skinGrid) {
    skinGrid.innerHTML = AVATAR_OPTIONS.skins.map((s, idx) => `
      <div class="avatar-color-swatch ${tempAvatarConfig.skin === idx ? 'active' : ''}" 
           style="background:${s.color};" 
           title="${s.name}"
           onclick="selectAvatarOption('skin', ${idx})"></div>
    `).join('');
  }

  const eyeGrid = document.getElementById('avatarEyeChoices');
  if (eyeGrid) {
    eyeGrid.innerHTML = AVATAR_OPTIONS.eyes.map((e, idx) => `
      <div class="avatar-choice-card ${tempAvatarConfig.eyes === idx ? 'active' : ''}" onclick="selectAvatarOption('eyes', ${idx})">
        ${e.name}
      </div>
    `).join('');
  }

  const outfitGrid = document.getElementById('avatarOutfitChoices');
  if (outfitGrid) {
    outfitGrid.innerHTML = AVATAR_OPTIONS.outfits.map((o, idx) => `
      <div class="avatar-choice-card ${tempAvatarConfig.outfit === idx ? 'active' : ''}" onclick="selectAvatarOption('outfit', ${idx})">
        ${o.name}
      </div>
    `).join('');
  }

  const accGrid = document.getElementById('avatarAccChoices');
  if (accGrid) {
    accGrid.innerHTML = AVATAR_OPTIONS.accessories.map((a, idx) => `
      <div class="avatar-choice-card ${tempAvatarConfig.acc === idx ? 'active' : ''}" onclick="selectAvatarOption('acc', ${idx})">
        ${a.name}
      </div>
    `).join('');
  }
}

function selectAvatarOption(key, val) {
  tempAvatarConfig[key] = val;
  updateAvatarModalPreview();
  renderAvatarModalControls();
}

function randomizeAvatarInModal() {
  tempAvatarConfig = {
    skin: Math.floor(Math.random() * AVATAR_OPTIONS.skins.length),
    hairStyle: Math.floor(Math.random() * AVATAR_OPTIONS.hairStyles.length),
    hairColor: Math.floor(Math.random() * AVATAR_OPTIONS.hairColors.length),
    eyes: Math.floor(Math.random() * AVATAR_OPTIONS.eyes.length),
    outfit: Math.floor(Math.random() * AVATAR_OPTIONS.outfits.length),
    acc: Math.floor(Math.random() * AVATAR_OPTIONS.accessories.length)
  };
  updateAvatarModalPreview();
  renderAvatarModalControls();
}

function resetAvatarInModal() {
  tempAvatarConfig = { skin: 0, hairStyle: 0, hairColor: 0, eyes: 0, outfit: 0, acc: 0 };
  updateAvatarModalPreview();
  renderAvatarModalControls();
}

function saveAvatarFromModal() {
  currentAvatarConfig = Object.assign({}, tempAvatarConfig);
  saveAvatarConfigToLocal(currentAvatarConfig);
  updateAvatarJoinPreview();
  const topAv = document.getElementById('pMyAvatar');
  if (topAv) topAv.innerHTML = renderAvatarSvg(currentAvatarConfig, 38);
  if (myPlayer) {
    myPlayer.avatarConfig = currentAvatarConfig;
    broadcast({
      type: 'update_player_avatar',
      userHash: currentUserHash,
      avatarConfig: currentAvatarConfig
    });
    renderPlayerCharSheet();
  }
  closeAvatarModal();
  showToast('💾 บันทึกตัวละครเรียบร้อยแล้ว!');
}

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

  // Stage 0: Non-Stop Debate (การถกเถียงต่อเนื่อง)
  stg0: {
    topic: 'ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.',
    statements: [],
    currentIndex: 0,
    isPaused: false,
    buzzedBy: null,
    buzzedAvatar: '👤',
    buzzedRole: 'นักเรียน',
    objectionQuote: '⚡ นั่นผิดแล้ว! (SORE WA CHIGAU YO!)',
    selectedClueId: null,
    approved: null
  },

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
  stg5LeftTeam: "🔵 ข้อสันนิษฐานคนร้ายวางกับดัก",
  stg5RightTeam: "🟣 ข้อสันนิษฐานอุบัติเหตุ/เหยื่อทำตัวเอง",
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

// Stage 0: Non-Stop Debate Chuunibyou Catchphrases (Thai / English)
const OBJECTION_CATCHPHRASES = [
  "⚡ นั่นผิดแล้ว! (SORE WA CHIGAU YO!)",
  "⚡ ขอคัดค้าน! (OBJECTION!)",
  "⚡ เดี๋ยวก่อน! (HOLD IT!)",
  "⚡ รับนี่ไปซะ! (TAKE THAT!)",
  "⚡ ความจริงมีเพียงหนึ่งเดียวเท่านั้น! (THERE IS ONLY ONE TRUTH!)",
  "⚡ ภาพลวงตาของนายจบลงแค่นี้แหละ! (YOUR ILLUSION ENDS HERE!)",
  "⚡ กระสุนความจริงนี้จะทะลวงคำโกหกของนาย! (PIERCE THROUGH THE LIES!)",
  "⚡ หยุดอยู่ตรงนั้นแหละ! ตรรกะของนายมันพังทลายแล้ว! (LOGIC BREAK!)",
  "⚡ ทฤษฎีนั่น... ฉันขอปฏิเสธ! (I DENY THAT REALITY!)",
  "⚡ ความมืดมิดไม่อาจบดบังความจริงได้! (DARKNESS CANNOT HIDE THE TRUTH!)"
];

const DEFAULT_STG0_STATEMENTS = [
  { speaker: "ยูโตะ", avatar: "👨‍🍳", text: "ตอน 21:00 น. ทุกคนก็ได้ยินเสียงการต่อสู้ในห้องซักผ้าพร้อมกันไม่ใช่เหรอ!?" },
  { speaker: "ซากุระ", avatar: "👧", text: "ใช่แล้ว! เสียงทุบกระแทกดังตึงตังขนาดนั้น ต้องเป็นการดิ้นรนก่อนตายของเรียวตะแน่นอน!" },
  { speaker: "ฮิคาริ", avatar: "👩‍💼", text: "แต่ว่าสภาพห้องซักรีดมันไม่เห็นมีรอยการดิ้นรนหรือเลือดเปรอะเลยนะ..." },
  { speaker: "ไคโตะ", avatar: "🧑‍💻", text: "จะไม่มีได้ยังไง ก็เรียวตะพกมีดพกไปด้วย เขาก็ต้องชักออกมาป้องกันตัวสิ!" },
  { speaker: "เรนะ", avatar: "👱‍♀️", text: "ถ้าอย่างนั้น เสียงเหล็กกระแทกที่ดังสนั่น 2 ครั้งติดกันตอนนั้น มันมาจากไหนล่ะ!?" },
  { speaker: "ชิน", avatar: "🕵️", text: "หรือว่าเสียงนั่นจะไม่ได้มาจากคน แต่เป็นเสียงเครื่องจักรทำงานอัตโนมัติ!?" }
];

function getDynamicStg0Statements() {
  const players = Object.values(gameState?.players || {}).filter(p => !p.isAdmin && p.role !== 'DM' && p.name !== 'DM');
  if (players.length === 0) return [...DEFAULT_STG0_STATEMENTS];
  
  const noiseQuotes = [
    "ตอน 21:00 น. ทุกคนก็ได้ยินเสียงการต่อสู้ในห้องซักผ้าพร้อมกันไม่ใช่เหรอ!?",
    "ใช่แล้ว! เสียงทุบกระแทกดังตึงตังขนาดนั้น ต้องเป็นการดิ้นรนก่อนตายของเรียวตะแน่นอน!",
    "แต่ว่าสภาพห้องซักรีดมันไม่เห็นมีรอยการดิ้นรนหรือเลือดเปรอะเลยนะ...",
    "จะไม่มีได้ยังไง ก็เรียวตะพกมีดพกไปด้วย เขาก็ต้องชักออกมาป้องกันตัวสิ!",
    "ถ้าอย่างนั้น เสียงเหล็กกระแทกที่ดังสนั่น 2 ครั้งติดกันตอนนั้น มันมาจากไหนล่ะ!?",
    "หรือว่าเสียงนั่นจะไม่ได้มาจากคน แต่เป็นเสียงเครื่องจักรทำงานอัตโนมัติ!?",
    "แล้วสายยางน้ำที่เปิดทิ้งไว้ล่ะ ใครเป็นคนเปิดทิ้งไว้กันแน่!?",
    "ฉันว่าพวกเราอาจจะมองข้ามอะไรบางอย่างที่สำคัญมากๆ ในที่เกิดเหตุไปรึเปล่า?"
  ];

  return players.map((p, idx) => {
    return {
      speaker: p.name || `นักเรียนคนที่ ${idx + 1}`,
      avatar: p.avatar || '👤',
      avatarConfig: p.avatarConfig || null,
      role: p.role || 'สุดยอดนักเรียน',
      text: noiseQuotes[idx % noiseQuotes.length]
    };
  });
}

// ==========================================================
// AUTHENTIC DANGANRONPA AUDIO & SFX ENGINE
// ==========================================================
const SOUND_FILES = {
  gavel: 'sounds/gavel_wooden.wav',
  laugh: 'sounds/monokuma_laugh_pure.wav',
  laugh1: 'sounds/monokuma_laugh1.wav',
  laugh2: 'sounds/monokuma_laugh2.wav',
  laugh3: 'sounds/monokuma_laugh3.wav',
  blade: 'sounds/sword_clash.wav',
  slash: 'sounds/sword_swing.wav',
  break: 'sounds/screenbreak.mp3',
  point_break: 'sounds/screenbreak.mp3',
  chime: 'sounds/dingdongbingbong.mp3',
  bda: 'sounds/bda_bell.mp3',
  bda_bell: 'sounds/bda_bell.mp3',
  counter: 'sounds/countersfx.mp3',
  shoot: 'sounds/shoottb.mp3',
  rebuttal: 'sounds/rebuttal_intro.wav',
  vote_intro: 'sounds/vote_intro.wav',
  vote_music: 'sounds/vote_intro.wav',
  correct: 'sounds/correct_logic.wav',
  wrong: 'sounds/vote_incorrect.wav',
  clue_get: 'sounds/bullet_get.mp3',
  bullet_get: 'sounds/bullet_get.mp3',
  glitch: 'sounds/static.mp3',
  despair: 'sounds/despairnoise.mp3'
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

function speakMonokumaLaugh() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance('อุ๊ปุ๊ๆๆๆ! อุ๊ปุ๊ปุ๊ปุ๊!');
      utt.lang = 'th-TH';
      utt.pitch = 1.9;
      utt.rate = 1.45;
      utt.volume = 0.95;
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const thVoice = voices.find(v => v.lang === 'th-TH' || v.lang.startsWith('th') || (v.lang && v.lang.includes('th_TH')));
        if (thVoice) utt.voice = thVoice;
      }
      window.speechSynthesis.speak(utt);
    } catch(e) {}
  }
}

function playSfx(type) {
  // CRITICAL: DM Admin screen must NEVER play audio or sound effects
  if (currentView === 'admin' || (typeof document !== 'undefined' && document.body && document.body.classList.contains('view-is-admin'))) return;
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

  // Authentic Monokuma Thai vocalization for laugh triggers
  if (type === 'laugh' || type.startsWith('laugh')) {
    speakMonokumaLaugh();
  }

  const file = SOUND_FILES[type];
  if (file) {
    try {
      const audio = new Audio(file);
      audio.volume = 0.88;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If relative path fails, try root path fallback or synth
          const fallback = file.startsWith('/') ? file.slice(1) : '/' + file;
          const audio2 = new Audio(fallback);
          audio2.volume = 0.88;
          audio2.play().catch(() => {
            playSynthSfx(type);
          });
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
  // CRITICAL: DM Admin screen must NEVER play synthesized audio
  if (currentView === 'admin' || (typeof document !== 'undefined' && document.body && document.body.classList.contains('view-is-admin'))) return;
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

    } else if (type === 'laugh' || type.startsWith('laugh')) {
      // Monokuma "Upupupu" (อุ๊ปุ๊ๆๆๆ) authentic high-pitched staccato laughter
      const syllPitches = [840, 920, 1020, 1120, 1040, 920];
      syllPitches.forEach((freq, idx) => {
        const start = now + idx * 0.10;
        const dur = 0.085;

        // 1. High vocal fundamental + formant filter
        const o1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        o1.type = 'triangle';
        o1.frequency.setValueAtTime(freq, start);
        o1.frequency.linearRampToValueAtTime(freq * 1.08, start + dur * 0.5);
        o1.frequency.linearRampToValueAtTime(freq, start + dur);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1050, start);
        filter.Q.setValueAtTime(2.2, start);

        g1.gain.setValueAtTime(0.28, start);
        g1.gain.exponentialRampToValueAtTime(0.001, start + dur);

        o1.connect(filter);
        filter.connect(g1);
        g1.connect(ctx.destination);
        o1.start(start);
        o1.stop(start + dur);

        // 2. Plosive 'P' consonant transient click on each syllable
        if (idx > 0) {
          const click = ctx.createOscillator();
          const clickGain = ctx.createGain();
          click.type = 'square';
          click.frequency.setValueAtTime(450, start);
          click.frequency.exponentialRampToValueAtTime(60, start + 0.018);
          clickGain.gain.setValueAtTime(0.20, start);
          clickGain.gain.exponentialRampToValueAtTime(0.001, start + 0.018);
          click.connect(clickGain);
          clickGain.connect(ctx.destination);
          click.start(start);
          click.stop(start + 0.018);
        }
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
        if (!data || typeof data !== 'object') return;
        // Anti-Echo: Ignore messages originating from ourselves
        if (data._sender === myClientId) return;
        // Deduplication: Drop duplicate packet if already received via BroadcastChannel or SSE
        if (data._id) {
          if (processedMessageIds.has(data._id)) return;
          processedMessageIds.add(data._id);
          if (processedMessageIds.size > 500) {
            const oldest = processedMessageIds.values().next().value;
            processedMessageIds.delete(oldest);
          }
        }
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
        if (!data || typeof data !== 'object') return;
        // Anti-Echo: Ignore messages originating from ourselves
        if (data._sender === myClientId) return;
        // Deduplication: Drop duplicate packet if already received via BroadcastChannel or SSE
        if (data._id) {
          if (processedMessageIds.has(data._id)) return;
          processedMessageIds.add(data._id);
          if (processedMessageIds.size > 500) {
            const oldest = processedMessageIds.values().next().value;
            processedMessageIds.delete(oldest);
          }
        }
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

  if (serverStreamSource && activeServerRoomCode === code && serverStreamSource.readyState !== 2) return;

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
      if (serverStreamSource && serverStreamSource.readyState === 2) {
        try { serverStreamSource.close(); } catch(e) {}
        serverStreamSource = null;
        setTimeout(() => {
          if (activeServerRoomCode === code) {
            setupServerStream(code);
          }
        }, 1500);
      }
    };
  } catch (err) {
    console.error('[SSE] Failed to initialize EventSource:', err);
  }

  // Periodic watchdog to ensure SSE connection stays alive
  if (typeof window !== 'undefined' && !window._sseWatchdogStarted) {
    window._sseWatchdogStarted = true;
    setInterval(() => {
      const targetRoom = (roomCode || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('dangan_court_room_code')) || (typeof localStorage !== 'undefined' && localStorage.getItem('dangan_current_room')) || '').toUpperCase().trim();
      if (targetRoom) {
        if (!serverStreamSource || serverStreamSource.readyState === 2) {
          console.log('[SSE Watchdog] Stream closed or missing. Reconnecting to room:', targetRoom);
          setupServerStream(targetRoom);
        }
      }
    }, 4000);
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
    'reveal_votes', 'sync_state', 'rebuttal_verdict', 'stg2_char',
    'stg0_buzz', 'stg0_shoot', 'stg0_verdict', 'stg0_resume'
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

    // Early slot resolution to prevent ReferenceError (Temporal Dead Zone)
    let pcSlot = msg.pcSlot ? parseInt(msg.pcSlot, 10) : NaN;
    if (!pcSlot || isNaN(pcSlot) || pcSlot < 1 || pcSlot > 5) {
      const textToMatch = `${reqRole || ''} ${reqName || ''}`;
      if (/PC\s*1|นาเอกิ|naegi/i.test(textToMatch)) pcSlot = 1;
      else if (/PC\s*2|เคียวโกะ|kyoko|kirigiri/i.test(textToMatch)) pcSlot = 2;
      else if (/PC\s*3|เบียคุยะ|byakuya|togami/i.test(textToMatch)) pcSlot = 3;
      else if (/PC\s*4|อาโออิ|aoi|asahina/i.test(textToMatch)) pcSlot = 4;
      else if (/PC\s*5|ฮิฟุมิ|hifumi|yamada/i.test(textToMatch)) pcSlot = 5;
      else {
        const match = textToMatch.match(/PC\s*([1-5])/i);
        if (match) pcSlot = parseInt(match[1], 10);
        else pcSlot = ((Object.keys(gameState.players).length % 5) + 1);
      }
    }

    const isHifumi = Boolean(reqName && (reqName.includes('ฮิฟุมิ') || reqName.toLowerCase().includes('hifumi') || reqName.includes('ยามาดะ')));
    if (isHifumi) {
      pcSlot = 5;
    }

    // Auto-assign available role internally if not specified
    if (!reqRole) {
      reqRole = `สุดยอดนักเรียนมัธยมปลาย (PC ${pcSlot})`;
    }

    // Deduplication guard: Remove any prior entry matching the same userHash OR same name to prevent character doubling!
    Object.keys(gameState.players).forEach(key => {
      const p = gameState.players[key];
      if (p && ((msg.userHash && p.userHash === msg.userHash) || (p.name && reqName && p.name.toLowerCase() === reqName.toLowerCase()))) {
        delete gameState.players[key];
      }
    });

    const isKiller = (parseInt(pcSlot, 10) === 5) || isHifumi;
    const initialClues = (Array.isArray(msg.clues) && msg.clues.length > 0)
      ? msg.clues
      : (PC_INVESTIGATION_CLUES[pcSlot] ? [...PC_INVESTIGATION_CLUES[pcSlot]] : []);

    const playerObj = {
      id: senderId,
      name: reqName,
      role: reqRole,
      pcSlot: pcSlot,
      isKiller: isKiller,
      roomCode: roomCode,
      userHash: msg.userHash || senderId,
      avatarConfig: msg.avatarConfig || currentAvatarConfig,
      clues: initialClues
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
    if (currentView === 'admin' || currentView === 'court') return;
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
    const pRoleEl = document.getElementById('pMyRole');
    if (pRoleEl) pRoleEl.innerText = '';
    const pRoleDisp = document.getElementById('pMyRoleDisplay');
    if (pRoleDisp) pRoleDisp.innerText = myPlayer.role || 'สุดยอดนักเรียนมัธยมปลาย';
    const pAvEl = document.getElementById('pMyAvatar');
    if (pAvEl) pAvEl.innerHTML = renderAvatarSvg(myPlayer.avatarConfig || currentAvatarConfig, 38);
    const pHash = document.getElementById('pMyHash');
    if (pHash) pHash.innerText = '#' + (currentUserHash || 'USER');

    // status badge removed (no spoiler)
    document.getElementById('pMyStatus').className = 'p-status normal';

    updateSaboteurPanelVisibility();

    showToast(`✨ คุณ [${myPlayer.name}] เข้าสู่เกมเรียบร้อยแล้ว!`);
    updateMonopadDeviceBar();
    updateMonopadPhaseTabs(gameState.stage);
    playSfx('correct');

    if (myPlayer && Array.isArray(myPlayer.clues) && myPlayer.clues.length > 0) {
      saveUnlockedClues(myPlayer.clues);
      if (typeof renderPlayerCluesList === 'function') renderPlayerCluesList();
    }
    grantInvestigationClues(true);
    // Broadcast initial clues to host immediately
    broadcast({
      type: 'sync_player_clues',
      userHash: currentUserHash,
      playerName: myPlayer.name,
      clues: getUnlockedClues()
    });
  } else if (msg.type === 'claim_rejected') {
    if (currentView === 'admin' || currentView === 'court') return;
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
  } else if (msg.type === 'admin_set_escape_proximity') {
    if (!gameState.escapeProximity) gameState.escapeProximity = {};
    if (msg.targetUser === 'ALL') {
      if (gameState.players) {
        Object.keys(gameState.players).forEach(k => {
          gameState.escapeProximity[k] = Boolean(msg.granted);
        });
      }
      gameState.escapeProximity['*'] = Boolean(msg.granted);
    } else if (msg.targetUser) {
      gameState.escapeProximity[msg.targetUser] = Boolean(msg.granted);
    }
    updateEscapeProximityUI();
    updateAdminEscapeProximityDisplay();
    if (msg.granted) {
      const myHash = currentUserHash || (myPlayer && myPlayer.userHash) || (myPlayer && myPlayer.id);
      if (msg.targetUser === 'ALL' || msg.targetUser === myHash || (myPlayer && msg.targetUser === myPlayer.name)) {
        showToast('🔓 เซนเซอร์ Monopad ยืนยัน: ตรวจพบพิกัดหน้าประตูทางออกฉุกเฉินแล้ว!');
        playSfx('correct');
      }
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
    handleKickPlayer(msg);
  } else if (msg.type === 'clue_discovered') {
    handleClueDiscovered(msg.clueId, msg.clueName, msg.playerName, msg.userHash);
  } else if (msg.type === 'admin_grant_clue') {
    if (currentView === 'admin' || currentView === 'court') return;
    const isTarget = (currentUserHash && msg.targetKey === currentUserHash) ||
                     (msg.targetName && myPlayer && myPlayer.name === msg.targetName) ||
                     (msg.targetSlot && myPlayer && String(myPlayer.pcSlot) === String(msg.targetSlot)) ||
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
  } else if (msg.type === 'admin_grant_batch_clues') {
    if (currentView === 'admin' || currentView === 'court') return;
    const isTarget = (currentUserHash && msg.targetKey === currentUserHash) ||
                     (msg.targetName && myPlayer && myPlayer.name === msg.targetName) ||
                     (msg.targetSlot && myPlayer && String(myPlayer.pcSlot) === String(msg.targetSlot)) ||
                     (myPlayer && (myPlayer.id === msg.targetKey || myPlayer.name === msg.targetKey || (myPlayer.userHash && myPlayer.userHash === msg.targetKey)));
    if (isTarget && Array.isArray(msg.clueIds)) {
      msg.clueIds.forEach(cid => unlockClueDirect(cid));
      playSfx('clue_get');
      showToast(`🎁 [DM มอบหลักฐานตามบทบาท]: ได้รับหลักฐาน ${msg.clueIds.length} ชิ้นเข้าสู่ Monopad แล้ว!`);
      broadcast({
        type: 'sync_player_clues',
        userHash: currentUserHash,
        playerName: (myPlayer && myPlayer.name) ? myPlayer.name : '',
        clues: getUnlockedClues()
      });
    }
  } else if (msg.type === 'court_clue_revealed') {
    if (currentView === 'admin') return;
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
  } else if (msg.type === 'update_player_avatar') {
    const p = Object.values(gameState.players).find(pl => pl.userHash === msg.userHash || pl.id === msg.userHash);
    if (p) {
      p.avatarConfig = msg.avatarConfig;
      updatePlayerDisplays();
    }
  } else if (msg.type === 'sabotage') {
    handleSabotage(msg.sabType, msg.playerName, msg.senderHash);
  } else if (msg.type === 'stg0_buzz') {
    handleStg0Buzz(msg);
  } else if (msg.type === 'stg0_shoot') {
    handleStg0Shoot(msg);
  } else if (msg.type === 'stg0_verdict') {
    handleStg0Verdict(msg);
  } else if (msg.type === 'stg0_resume') {
    handleStg0Resume();
  } else if (msg.type === 'stg1_submit') {
    handleStg1Submit(msg.clueId, msg.playerName);
  } else if (msg.type === 'stg1_evaluate') {
    evaluateStg1Batch();
  } else if (msg.type === 'stg2_char') {
    if (isHost) handleStg2Char(msg.char); // Only host processes to avoid double-fire
  } else if (msg.type === 'rebuttal_slash') {
    handleRebuttalSlash(msg.bullet, msg.playerName);
  } else if (msg.type === 'rebuttal_verdict') {
    triggerRebuttalVerdict(msg.isWin, true, msg);
  } else if (msg.type === 'logic_dive_vote') {
    handleLogicDiveVote(msg.question, msg.choice, msg.voterId, msg.playerName);
  } else if (msg.type === 'logic_dive_crash') {
    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.remove('hidden');
      crashNotice.style.display = 'block';
      crashNotice.innerText = `💥 ชนผนังอุโมงค์! เสียงข้างมากเลือกข้อ [${msg.winningChoice}] ซึ่งเป็นทางตัน`;
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
  } else if (msg.type === 'stg6_setup_secret') {
    handleStg6SetupSecret(msg.secret, msg.playerName);
  } else if (msg.type === 'stg6_shot_fired') {
    handleStg6Shot(msg.shooter, msg.cellIndex, msg.timing);
  } else if (msg.type === 'stg6_counter') {
    handleStg6Counter(msg.playerName);
  } else if (msg.type === 'stg6_hit') {
    handleStg6LegacyHit(msg.playerName);
  } else if (msg.type === 'stg6_final_blow') {
    handleStg6FinalBlow(msg.playerName);
  } else if (msg.type === 'stg6_dm_retry') {
    handleStg6DmRetry();
  } else if (msg.type === 'stg6_dm_force_pass') {
    handleStg6DmForcePass();
  } else if (msg.type === 'armament_final_ready') {
    if (gameState) gameState.stg6FinalReady = true;
    const banner = document.getElementById('armamentFinalBlowBanner');
    if (banner) banner.classList.remove('hidden');
    const box = document.getElementById('finalBlowMobileBox');
    if (box) box.style.display = 'block';
    updateStage6Displays();
    renderMobileTask('stage6');
  } else if (msg.type === 'closing_submit') {
    handleClosingSubmit(msg.slot, msg.cardId, msg.playerName);
  } else if (msg.type === 'closing_page_change') {
    if (gameState && gameState.stage === 'closing') {
      gameState.closingCurrentPage = msg.page;
      playerPreviewClosingPage = msg.page;
      updateClosingDisplay();
      renderMobileTask('closing');
    }
  } else if (msg.type === 'closing_bonus_time') {
    if (currentView === 'admin') return;
    if (gameState && gameState.stage === 'closing') {
      showBonusTimePopup(msg.seconds);
    }
  } else if (msg.type === 'closing_card_unlocked') {
    if (msg.hands) gameState.closingPlayerHands = msg.hands;
    if (currentView === 'admin') return;
    const isMe = (typeof myPlayer !== 'undefined' && myPlayer && (myPlayer.id === msg.playerId || myPlayer.userHash === msg.playerId || myPlayer.name === msg.playerId)) ||
                 (typeof currentUserHash !== 'undefined' && currentUserHash === msg.playerId);
    if (isMe) {
      playSfx('correct');
      showToast(`🔓 ปลดล็อกการ์ดใหม่ในมือคุณแล้ว: ${msg.cardTitle || 'การ์ดสรุปคดี'}!`);
    }
    renderMobileTask('closing');
  } else if (msg.type === 'closing_hands_sync') {
    gameState.closingPlayerHands = msg.hands;
    if (currentView === 'admin') return;
    renderMobileTask('closing');
  } else if (msg.type === 'start_closing_climax') {
    if (currentView === 'admin') return;
    startClosingClimaxPlayback();
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
      if (currentView === 'player' && gameState.stage) {
        renderMobileTask(gameState.stage);
      }
      if (isHost) {
        broadcast({ type: 'sync_state', state: gameState });
      }
    }
  } else if (msg.type === 'qq_vote') {
    if (!gameState.qqData) gameState.qqData = { votes: {} };
    if (!gameState.qqData.votes) gameState.qqData.votes = {};
    const voter = msg.voterId || msg.playerName || senderId;
    gameState.qqData.votes[voter] = msg.choice;
    playSfx('button');
    updateQuickQuestionDisplay();
    if (currentView === 'player' && gameState.stage === 'quick_question') {
      renderMobileTask('quick_question');
    }
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
    checkQuickQuestionAutoReveal();
  } else if (msg.type === 'qq_reveal') {
    if (gameState.qqData) {
      gameState.qqData.revealed = true;
      gameState.qqData.revealing = false;
    }
    playSfx(msg.isMajorityCorrect ? 'correct' : 'wrong');
    updateQuickQuestionDisplay();
    if (currentView === 'player' && gameState.stage === 'quick_question') {
      renderMobileTask('quick_question');
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
    if (currentView === 'admin') return;
    triggerMonokumaExecutionCutscene(msg.isVictory, true);
  } else if (msg.type === 'close_execution_cutscene') {
    if (currentView === 'admin') return;
    closeExecutionModal(true);
  } else if (msg.type === 'verdict') {
    if (currentView === 'admin') return;
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
  if (myPlayer && gameState.players) {
    const updatedMe = Object.values(gameState.players).find(x => 
      (myPlayer.id && x.id === myPlayer.id) ||
      (myPlayer.name && x.name && x.name.toLowerCase() === myPlayer.name.toLowerCase()) ||
      (currentUserHash && x.userHash === currentUserHash)
    );
    if (updatedMe) {
      Object.assign(myPlayer, updatedMe);
      if (Array.isArray(updatedMe.clues) && updatedMe.clues.length > 0) {
        let changed = false;
        const currentUnlocked = getUnlockedClues();
        updatedMe.clues.forEach(cid => {
          if (!currentUnlocked.includes(cid)) {
            unlockClueDirect(cid);
            changed = true;
          }
        });
        if (changed && typeof renderPlayerCluesList === 'function') {
          renderPlayerCluesList();
        }
      }
    }
  }
  updateSaboteurPanelVisibility();
  updateEscapeProximityUI();
  updateAdminEscapeProximityDisplay();
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
    myPlayer = null; // DM must NEVER hold a player slot or adopt player identity
    const el = document.getElementById('viewAdmin');
    if (el) el.classList.remove('hidden');
    const tab = document.getElementById('tabAdmin');
    if (tab) tab.classList.add('active');
    initRealtime();
    updateAdminDisplay();
    initAdminPresetsDisplay();
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
  const qPc = urlParams.get('pc');

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
  if (qPc) {
    const pcSel = document.getElementById('mobilePcSlotSelect');
    if (pcSel) pcSel.value = qPc;
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
      if (p.pcSlot) {
        const pcSel = document.getElementById('mobilePcSlotSelect');
        if (pcSel) pcSel.value = p.pcSlot;
      }

      const joinScr = document.getElementById('mobileJoinScreen');
      if (joinScr) joinScr.classList.add('hidden');
      const gameScr = document.getElementById('mobileGameScreen');
      if (gameScr) gameScr.classList.remove('hidden');

      const nameEl = document.getElementById('pMyName');
      if (nameEl) nameEl.innerText = p.name;
      const pRoleEl = document.getElementById('pMyRole');
      if (pRoleEl) pRoleEl.innerText = '';
      const pRoleDisp = document.getElementById('pMyRoleDisplay');
      if (pRoleDisp) pRoleDisp.innerText = p.role || 'สุดยอดนักเรียนมัธยมปลาย';
      const pAvEl = document.getElementById('pMyAvatar');
      if (pAvEl) pAvEl.innerHTML = renderAvatarSvg(p.avatarConfig || currentAvatarConfig, 38);

      const statusEl = document.getElementById('pMyStatus');
      const sabPanel = document.getElementById('mobileSaboteurPanel');
      if (statusEl) {
        statusEl.style.display = 'none';
      }
      updateSaboteurPanelVisibility();
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
  if (currentView === 'admin' || currentView === 'court') return;
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

  const vPlayer = document.getElementById('viewPlayer');
  if (vPlayer) {
    const isWide = (tab === 'map' || tab === 'char' || tab === 'rules');
    vPlayer.classList.toggle('tab-active-wide', isWide);
    vPlayer.classList.toggle('tab-active-map', tab === 'map');
  }

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
  updateSaboteurPanelVisibility();
  updateEscapeProximityUI();
}

const CHARACTER_DATA = {
  'สุดยอดนักเรียนโชคดี': {
    title: 'PC 1: สุดยอดนักเรียนโชคดี (Ultimate Lucky Student)',
    stats: ['INT 15 (+2)', 'WIS 15 (+2)', 'LUK 18 (+4)'],
    personality: 'มองโลกในแง่ดี ช่างสังเกต มุ่งมั่นตามหาความจริงและเชื่อมั่นในเพื่อนร่วมชั้นทุกคน',
    hook: 'กฎแห่งความหวัง: ไม่ยอมแพ้ต่อความสิ้นหวัง แอบจดพฤติกรรมและความผิดปกติของเพื่อนๆ เพื่อเชื่อมโยงกระสุนความจริง',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'เดินสำรวจรอบโถงกลาง สังเกตเห็นคนเดินเข้าออกระหว่างห้องครัวกับบันไดลงชั้นใต้ดินด้วยท่าทางเร่งรีบ' },
      { time: '19:00 - 20:00 น.', desc: 'ร่วมโต๊ะกินสตูว์เนื้อร่วมกับทุกคน จากนั้นก็นั่งคุยแลกเปลี่ยนข้อมูลอยู่ที่ห้องนั่งเล่น' },
      { time: '20:00 - 21:00 น.', desc: 'นั่งพักผ่อนคุยแลกเปลี่ยนข้อมูลกับเพื่อนๆ อยู่ที่โซฟาห้องนั่งเล่น ไม่ได้ลุกไปไหน มีเพื่อนคนอื่นนั่งอยู่ข้างๆ' },
      { time: '21:00 น.', desc: 'เสียงกระแทกดัง "ตึง! ตึง! ตึง!" มาจากห้องซักรีดใต้ดิน วิ่งตามกลุ่มไปพังประตูและเห็นร่างของเรียวตะห้อยอยู่บนเพดาน' }
    ]
  },
  'สุดยอดนักสืบ': {
    title: 'PC 2: สุดยอดนักสืบ (Ultimate Detective)',
    stats: ['INT 18 (+4)', 'WIS 16 (+3)', 'DEX 14 (+2)'],
    personality: 'เยือกเย็น สุขุม ช่างวิเคราะห์ ใช้ตรรกะและหลักฐานทางนิติวิทยาศาสตร์นำทาง',
    hook: 'สัมผัสนักสืบ: ตรวจพบร่องรอยการเคลื่อนย้ายวัตถุหนักและคราบสารเคมีผิดปกติในสถานที่เกิดเหตุ',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'ตรวจตราอาคาร สังเกตเห็นไฟในห้องซักรีดใต้ดินเปิดอยู่ และได้ยินเสียงน้ำไหลในท่อประปาดังผิดปกติ' },
      { time: '19:00 - 20:00 น.', desc: 'ร่วมมื้ออาหารค่ำ สังเกตปริมาณวัตถุดิบและพฤติกรรมของผู้ร่วมโต๊ะ' },
      { time: '20:00 - 21:00 น.', desc: 'วิเคราะห์ข้อมูลในห้องพัก ได้ยินเสียงคล้ายของหนักเลื่อนถ่วงพื้นด้านล่าง' },
      { time: '21:00 น.', desc: 'นำทีมไปยังห้องซักรีดและเริ่มกระบวนการตรวจสอบนิติเวชเบื้องต้น' }
    ]
  },
  'สุดยอดทายาทมหาเศรษฐี': {
    title: 'PC 3: สุดยอดทายาทมหาเศรษฐี (Ultimate Affluent Progeny)',
    stats: ['INT 17 (+3)', 'CHA 16 (+3)', 'WIS 14 (+2)'],
    personality: 'หยิ่งทรนง เยือกเย็น ฉลาดหลักแหลม มองเกมการฆาตกรรมนี้เป็นสิ่งที่ต้องชนะด้วยสติปัญญาอันเหนือชั้น',
    hook: 'สายตาผู้นำ: สังเกตเห็นพิรุธของทุกคนที่โถงทางเดิน และมีข้อมูลเกี่ยวกับประตูกล Blast Gate และมาตรวัดน้ำ',
    timeline: [
      { time: '17:30 - 18:15 น.', desc: 'สำรวจประตูกล Blast Gate และมาตรวัดน้ำ' },
      { time: '18:00 น.', desc: 'เห็นเพื่อนเดินอยู่ที่ทางเดินกระจกใส' },
      { time: '19:00 - 20:00 น.', desc: 'ร่วมโต๊ะกินสตูว์เนื้อเงียบๆ สังเกตปฏิกิริยาของแต่ละคน' },
      { time: '21:00 น.', desc: 'เดินตามกลุ่มไปห้องซักรีดเพื่อพิสูจน์ข้อเท็จจริง' }
    ]
  },
  'สุดยอดนักว่ายน้ำ': {
    title: 'PC 4: สุดยอดนักว่ายน้ำ (Ultimate Swimming Pro)',
    stats: ['STR 16 (+3)', 'AGI 16 (+3)', 'CON 15 (+2)'],
    personality: 'ร่าเริง ตรงไปตรงมา รักเพื่อน มีสัญชาตญาณร่างกายและความคล่องแคล่วเป็นเลิศ',
    hook: 'ประสาทสัมผัสฉับไว: ได้ยินเสียงน้ำไหลผิดปกติและสัมผัสได้ถึงกลิ่นคาวและรสเค็มจัดในอาหาร',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'วอร์มร่างกายและเดินตรวจเครื่องดื่ม พบว่าเกลือและเครื่องปรุงถูกใช้ไปในปริมาณมากผิดปกติ' },
      { time: '19:00 - 20:00 น.', desc: 'ร่วมกินสตูว์และทักท้วงเรื่องรสเค็มจัดและกลิ่นคาวสนิม' },
      { time: '20:00 - 21:00 น.', desc: 'พักผ่อนดื่มน้ำในห้องอาหาร' },
      { time: '21:00 น.', desc: 'วิ่งนำขบวนตามเสียงกระแทกไปยังห้องซักรีด' }
    ]
  },
  'สุดยอดนักเขียนโดจิน': {
    title: 'PC 5: สุดยอดนักเขียนโดจิน (Ultimate Doujin Creator - The Blackened)',
    stats: ['DEX 16 (+3)', 'INT 15 (+2)', 'CON 13 (+1)'],
    personality: 'พูดจาเพ้อฝัน มีความมั่นใจในโลก 2D แต่แอบซ่อนความทะเยอทะยานและแผนการอันแยบยลไว้',
    isKiller: true,
    hook: '⚠️ ความลับคนร้าย (The Trapper): คุณคือผู้เซ็ตกับดักฆ่าเรียวตะ! คุณใช้ท่อนกระดูกหมูฟาดหัวเรียวตะสลบ นำกระดูกไปต้มในหม้อสตูว์ ผูกเชือกกับถังน้ำนอกหน้าต่างและต่อสายยางเพื่อตั้งเวลา 21:00 น.... แต่ความจริงเรียวตะตัดเชือกและเกิดอุบัติเหตุคอหักตายเอง!',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'เข้าครัวไปแอบหยิบท่อนกระดูกหมู แล้วลงไปล่อเรียวตะในห้องซักรีดเพื่อเซ็ตกับดักเชือก' },
      { time: '19:00 - 20:00 น.', desc: 'ตักสตูว์เนื้อให้เพื่อนๆ กินอย่างกระตือรือร้น เพื่อกลบเกลื่อนหลักฐาน' },
      { time: '20:00 - 21:00 น.', desc: 'นั่งร่วมกลุ่มคุยกับทุกคนที่ห้องนั่งเล่นเพื่อสร้าง Alibi ที่แน่นหนา' },
      { time: '21:00 น.', desc: 'แกล้งทำเป็นตกใจสุดขีดเมื่อเห็นศพของเรียวตะห้อยอยู่' }
    ]
  },
  'สุดยอดนักประดิษฐ์': {
    title: 'PC 6: สุดยอดนักประดิษฐ์ (Ultimate Inventor)',
    stats: ['INT 17 (+3)', 'DEX 15 (+2)', 'CON 13 (+1)'],
    personality: 'หมกมุ่นกับกลไก ชอบรื้อ แก้ไข และสร้างสิ่งประดิษฐ์พิลึกพิลั่น',
    hook: 'วิศวกรรมย้อนรอย: สังเกตเห็นระบบตั้งเวลาของเครื่องอบผ้าและวาล์วประปาถูกดัดแปลงให้ปล่อยน้ำถ่วงน้ำหนักตรงกับเวลา 21:00 น.',
    timeline: [
      { time: '17:30 - 18:30 น.', desc: 'ตรวจตู้ไฟและแผงท่อประปาชั้นใต้ดิน พบว่าวาล์วน้ำหลักถูกปรับแต่ง' },
      { time: '19:00 - 20:00 น.', desc: 'ร่วมกินสตูว์เนื้อ' },
      { time: '20:00 - 21:00 น.', desc: 'นั่งพักผ่อนในห้องอาหาร สังเกตเห็นมาตรวัดน้ำประปายังคงหมุนด้วยอัตรา 0.4 ลิตร/นาที อย่างต่อเนื่อง' },
      { time: '21:00 น.', desc: 'ตรวจเครื่องอบผ้าในห้องซักรีดพบแผงตั้งเวลาหยุดทำงาน' }
    ]
  }
};

// Aliases for slot number indexing
CHARACTER_DATA['1'] = CHARACTER_DATA['PC1'] = CHARACTER_DATA['PC 1'] = CHARACTER_DATA['สุดยอดนักเรียนโชคดี'];
CHARACTER_DATA['2'] = CHARACTER_DATA['PC2'] = CHARACTER_DATA['PC 2'] = CHARACTER_DATA['สุดยอดนักสืบ'];
CHARACTER_DATA['3'] = CHARACTER_DATA['PC3'] = CHARACTER_DATA['PC 3'] = CHARACTER_DATA['สุดยอดทายาทมหาเศรษฐี'];
CHARACTER_DATA['4'] = CHARACTER_DATA['PC4'] = CHARACTER_DATA['PC 4'] = CHARACTER_DATA['สุดยอดนักว่ายน้ำ'];
CHARACTER_DATA['5'] = CHARACTER_DATA['PC5'] = CHARACTER_DATA['PC 5'] = CHARACTER_DATA['สุดยอดนักเขียนโดจิน'];
CHARACTER_DATA['6'] = CHARACTER_DATA['PC6'] = CHARACTER_DATA['PC 6'] = CHARACTER_DATA['สุดยอดนักประดิษฐ์'];

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

  const charName = (myPlayer && myPlayer.name) ? myPlayer.name : 'ตัวละครของคุณ';
  const role = (myPlayer && myPlayer.role) ? myPlayer.role : 'สุดยอดนักเรียนมัธยมปลาย';
  const pcSlot = (myPlayer && myPlayer.pcSlot) ? myPlayer.pcSlot : 1;
  const isKiller = Boolean(myPlayer && (myPlayer.isKiller || myPlayer.pcSlot === 5));
  const cData = CHARACTER_DATA[role] || CHARACTER_DATA[String(pcSlot)] || CHARACTER_DATA['PC' + pcSlot] || null;

  const title = `PC ${pcSlot}: ${role}`;
  const stats = (cData && cData.stats) ? cData.stats : ['INT 15 (+2)', 'WIS 14 (+2)', 'CHA 13 (+1)', 'DEX 12 (+1)'];
  const personality = (cData && cData.personality) ? cData.personality : `นักเรียนผู้มีความสามารถเฉพาะทางด้าน "${role}" ร่วมค้นหาความจริงและหักล้างคำโกหกในศาลชั้นเรียน`;
  const hook = isKiller
    ? '⚠️ ความลับคนร้าย (The Trapper): คุณคือผู้เซ็ตกับดักฆ่าเรียวตะ! คุณใช้ท่อนกระดูกหมูฟาดหัวเรียวตะสลบ นำกระดูกไปต้มในหม้อสตูว์ ผูกเชือกกับลูกตุ้มและเจาะถังน้ำเพื่อตั้งเวลา... แต่ความจริงเรียวตะตัดเชือกและเกิดอุบัติเหตุคอหักตายเอง!'
    : ((cData && cData.hook) ? cData.hook : `🎯 ทักษะเฉพาะตัว: ใช้สัญชาตญาณและความชำนาญในฐานะ "${role}" ตรวจสอบเบาะแสและจับพิรุธพฤติกรรมที่ขัดแย้ง`);

  let timelineHtml = '';
  if (cData && cData.timeline) {
    cData.timeline.forEach(item => {
      timelineHtml += `
        <div style="margin-bottom:10px; padding:8px 12px; background:rgba(0,0,0,0.3); border-left:3px solid var(--mono-yellow); border-radius:4px;">
          <div style="font-weight:900; color:var(--mono-yellow); font-size:0.85rem; margin-bottom:2px;">⏱️ ${item.time}</div>
          <div style="font-size:0.85rem; color:#ddd; line-height:1.4;">${item.desc}</div>
        </div>
      `;
    });
  } else {
    timelineHtml = `
      <div style="padding:10px 12px; background:rgba(0,0,0,0.25); border-left:3px solid #38bdf8; border-radius:4px; font-size:0.85rem; color:#cbd5e1; line-height:1.4;">
        ⏱️ <strong>ช่วงเกิดเหตุ (17:30 - 21:00 น.):</strong> ทำกิจกรรมตามบทบาทและสังเกตสิ่งรอบตัว บันทึกเบาะแสลงใน Monopad เพื่อใช้เป็นกระสุนความจริงในศาล
      </div>
    `;
  }

  let hearts = '';
  for (let i = 0; i < 5; i++) {
    hearts += `<span>${i < playerCredibilityHearts ? '❤️' : '🖤'}</span>`;
  }

  const avConfig = myPlayer?.avatarConfig || currentAvatarConfig;
  const avSvg = renderAvatarSvg(avConfig, 80);

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:80px; height:80px; border-radius:50%; border:2.5px solid var(--mono-pink); overflow:hidden; flex-shrink:0; background:#111122; box-shadow:0 0 15px rgba(255,46,136,0.4);">
          ${avSvg}
        </div>
        <div>
          <div style="font-size:0.85rem; color:var(--mono-cyan); font-weight:800;">👤 ${escapeHtml(charName)} (PC ${pcSlot})</div>
          <h2 style="color:var(--court-gold); font-size:1.15rem; margin:2px 0 4px 0; font-weight:900;">${escapeHtml(title)}</h2>
          <button type="button" class="small-btn pink" onclick="openAvatarModal()" style="font-size:0.75rem; padding:4px 10px;">🎨 แต่งตัว / เปลี่ยนสีหน้า</button>
        </div>
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
        ${stats.map(st => `<span style="background:#111122; border:1px solid #444; border-radius:4px; padding:3px 8px; font-size:0.82rem; font-weight:700; color:#fff;">${st}</span>`).join('')}
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
      <div style="font-size:0.85rem; font-weight:900; color:var(--mono-yellow); margin-bottom:6px;">🎭 ลักษณะนิสัย & บทบาท:</div>
      <p style="font-size:0.85rem; color:#ddd; margin-bottom:8px; line-height:1.4;">${personality}</p>
      <div style="background:rgba(255,230,0,0.1); border-left:3px solid var(--mono-yellow); padding:8px 10px; font-size:0.82rem; color:#eee; line-height:1.35;">
        ${hook}
      </div>
    </div>

    ${isKiller ? `
      <div style="background:rgba(220,20,60,0.15); border:2px solid #ef4444; border-radius:8px; padding:12px; margin-bottom:14px;">
        <div style="font-size:0.85rem; font-weight:900; color:#ef4444; margin-bottom:6px;">🩸 ความลับคนร้าย (The Blackened):</div>
        <div style="font-size:0.82rem; color:#fca5a5; line-height:1.4;">
          ⚠️ คุณคือคนร้ายผู้ลงมือในคดีนี้! ใช้แผงควบคุม Saboteur ในการก่อกวนศาล โยนความผิด และปกปิดข้อเท็จจริงเพื่อเอาชีวิตรอดให้ได้
        </div>
      </div>
    ` : ''}

    <!-- Personal Timeline -->
    <div style="background:rgba(20,20,35,0.85); border:2px solid var(--mono-dark-border); border-radius:8px; padding:12px;">
      <div style="font-size:0.85rem; font-weight:900; color:#00ff88; margin-bottom:8px;">⏱️ ไทม์ไลน์ความทรงจำของคุณ (ช่วงเกิดเหตุ 17:30 - 21:00 น.):</div>
      ${timelineHtml}
    </div>
  `;
}

const ALL_CLUES_DATA = [
  { id: "EVD-01", image: "assets/room_central_corridor.jpg", pin: "830627", aliases: ["CUP-01", "1", "E01"], name: "แก้วเก็บความเย็นหน้าหอพัก", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "โถงทางเดินหน้าหอพักนักเรียน", desc: "แก้วสแตนเลสเก็บความเย็นตกอยู่บนพื้นทางเดินหน้าหอพัก ตัวแก้วมีรอยบุบที่ขอบก้นแก้ว และมีคราบของเหลวสีน้ำตาลแดงแห้งติดอยู่บนพื้น" },
  { id: "EVD-02", image: "assets/item_pork_bone.jpg?v=4.0.0", pin: "719304", aliases: ["BONE-02", "2", "E02"], name: "ท่อนกระดูกหมูในหม้อสตูว์", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องครัว (ก้นหม้อสตูว์)", desc: "ท่อนกระดูกหมูต้มสุก 2 ท่อนก้นหม้อสตูว์ บนผิวกระดูกท่อนหนึ่งมีรอยแตกร้าวและคราบสีคล้ำติดแน่นตามรอยแยก" },
  { id: "EVD-03", pin: "936154", aliases: ["PC2-03", "3", "E03"], name: "คำให้การของ PC 2", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 2 (1 AP)", desc: "คำให้การ: \"ตอน 17:30 ถึง 18:00 น. ฉันอยู่ในโรงยิม พอเดินออกมาที่โถงทางเดินเห็นหลอดไฟนีออนกะพริบ และไม่พบใครบริเวณนั้น\"" },
  { id: "EVD-04", image: "assets/room_blast_gate.jpg", pin: "873205", aliases: ["CLIP-04", "4", "E04"], name: "คลิปหนีบกระดาษเหล็ก", importance: "OPTIONAL", secretType: "TRASH", typeLabel: "ขยะ (Trash)", loc: "หน้าบอร์ดประชาสัมพันธ์โถงทางเข้าหลัก", desc: "คลิปหนีบกระดาษทำจากลวดเหล็ก 3 ตัว สภาพมีคราบสนิมเกาะ ตกอยู่ในร่องรอยต่อของพื้นปูนหน้าบอร์ดประชาสัมพันธ์" },
  { id: "EVD-05", image: "assets/item_dryer_dry1.jpg?v=4.1.0", pin: "306795", aliases: ["DRY-05", "5", "E05"], name: "เครื่องอบผ้า DRY-1", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องซักรีด (เครื่องอบผ้า)", desc: "เครื่องอบผ้าอุตสาหกรรม DRY-1 ทำงานเสร็จสิ้น ภายในมีรองเท้าบูทหนังหุ้มข้อของเรียวตะ ที่หน้าปัดมีฟังก์ชันตั้งเวลาเริ่มทำงานล่วงหน้า (Delay Timer)" },
  { id: "EVD-06", image: "assets/item_vending_machine.jpg?v=4.1.0", pin: "684129", aliases: ["VEND-06", "6", "E06"], name: "ตู้กดน้ำอัตโนมัติโถงทางเดิน", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเดินกลาง (CORR-100)", desc: "ตู้กดเครื่องดื่มอัตโนมัติโถงทางเดินกลาง มีรอยบุบที่แผงด้านข้าง และมีเหรียญติดค้างในช่องหยอด" },
  { id: "EVD-07", image: "assets/item_monokuma_file.png", pin: "482915", aliases: ["FILE-07", "7", "E07"], name: "Monokuma File #1", importance: "MUST", secretType: "CORE", typeLabel: "ผลชันสูตรทางการ (Core)", loc: "ห้องซักรีด (ร่างของเรียวตะ)", desc: "รายงานชันสูตรทางการ: เวลาเสียชีวิต ~21:00 น. กระดูกคอหักและขาดอากาศหายใจ แผลแตกท้ายทอยเกิดก่อนตาย 1-2 ชม. สวมถุงเท้าไม่สวมรองเท้า น้ำหนักตัว 65.0 กก." },
  { id: "EVD-08", image: "assets/room_dining_hall.jpg", pin: "659143", aliases: ["SNACK-08", "8", "E08"], name: "ซองขนมปังกรอบใต้เก้าอี้", importance: "OPTIONAL", secretType: "TRASH", typeLabel: "ขยะ (Trash)", loc: "ห้องอาหาร (ใต้เก้าอี้ทานข้าว)", desc: "ซองฟอยล์บรรจุขนมปังกรอบรสสาหร่ายถูกฉีกเปิดทิ้งไว้ใต้เก้าอี้ห้องอาหาร ภายในซองมีเศษขนมปังกรอบเหลืออยู่เล็กน้อย" },
  { id: "EVD-09", image: "assets/item_pink_rope.jpg", pin: "852179", aliases: ["ROPE-09", "9", "E09"], name: "เชือกไนลอนสีชมพูบนพื้น", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องซักรีด (พื้นข้างศพเรียวตะ)", desc: "เชือกไนลอนถักสีชมพู 8 มม. ขดอยู่บนพื้น ปลายด้านหนึ่งผูกเป็นบ่วง ส่วนปลายอีกด้านมีรอยตัดผิวเรียบ" },
  { id: "EVD-10", image: "assets/item_water_meter.jpg?v=4.1.0", pin: "815307", aliases: ["METER-10", "10", "E10"], name: "มาตรวัดน้ำประปาหลัก", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเข้าหลัก (ข้าง Blast Gate)", desc: "มาตรวัดน้ำประปาแสดงตัวเลขใช้น้ำสะสม 65.2 ลิตร และเข็มวัดยังหมุนด้วยอัตราประมาณ 0.4 ลิตร/นาที (24 ลิตร/ชม.)" },
  { id: "EVD-11", image: "assets/item_bleach_gallon.jpg", pin: "741953", aliases: ["BLEACH-11", "11", "E11"], name: "แกลลอนน้ำยาฟอกขาวในถังขยะ", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "ห้องซักรีด (ถังขยะข้างเครื่องซักผ้า)", desc: "แกลลอนพลาสติกบรรจุน้ำยาฟอกขาวถูกทิ้งอยู่ในถังขยะห้องซักรีด ภายในแกลลอนว่างเปล่าและส่งกลิ่นคลอรีนรุนแรง" },
  { id: "EVD-12", image: "assets/item_pocket_knife.jpg?v=4.0.0", pin: "394820", aliases: ["KNIFE-12", "12", "E12"], name: "มีดพับในกระเป๋าเสื้อเรียวตะ", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ร่างของเรียวตะ (กระเป๋าเสื้อ)", desc: "มีดพับอเนกประสงค์ใบมีด 7 ซม. กางค้างไว้ในกระเป๋าเสื้อเรียวตะ โคนใบมีดมีเศษเส้นใยสังเคราะห์สีชมพูติดอยู่" },
  { id: "EVD-13", image: "assets/room_kitchen.jpg", pin: "630841", aliases: ["FREEZE-13", "13", "E13"], name: "ช่องแช่แข็งในห้องครัว", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องครัว (ช่องฟรีซ)", desc: "ช่องแช่แข็งตู้เย็นในครัวมีเกล็ดน้ำแข็งละลายเป็นแอ่งน้ำ และพบถุงพลาสติกบรรจุเนื้อสัตว์แช่แข็งถูกฉีกเปิดทิ้งไว้" },
  { id: "EVD-14", image: "assets/item_ceiling_pipe.jpg", pin: "928413", aliases: ["RAIL-14", "14", "E14"], name: "ราวท่อสแตนเลสเพดานห้องซักรีด", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องซักรีด (เพดานสูง 4 ม.)", desc: "ท่อสแตนเลสขนานเพดานห้องซักรีดสูง 4 ม. เหนือแนวหน้าต่าง ผิวด้านบนของท่อมีรอยขูดถลอกเป็นแถบแนวยาว และที่ซอกค้ำยันท่อกับเพดานพบปมเชือกไนลอนขนาดใหญ่ถูกแรงกระชากดึงเข้าไปขัดติดแน่นจนล็อกเชือกไม่ให้รูดกลับ" },
  { id: "EVD-15", image: "assets/room_gymnasium.jpg", pin: "295418", aliases: ["CHAIN-15", "15", "E15"], name: "โซ่คล้องประตูหนีไฟโรงยิม", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "โรงยิม (ประตูด้านหลัง)", desc: "โซ่เหล็กคล้องล็อกประตูหนีไฟด้านหลังโรงยิม ข้อโซ่ข้อหนึ่งมีรอยบากลึกจากใบเลื่อย และมีเศษผงเหล็กตกอยู่บนพื้นใต้บานประตู" },
  { id: "EVD-16", pin: "369842", aliases: ["PC5-16", "16", "E16"], name: "คำให้การของ PC 5", importance: "MUST", secretType: "TESTIMONY", typeLabel: "คำให้การ (Core)", loc: "ได้จากการถาม PC 5 (1 AP)", desc: "คำให้การ: \"ฉันมีเวรทำอาหารมื้อค่ำตามตารางใน Monopad อยู่ในครัวต้มสตูว์เนื้อตลอดเวลาช่วง 17:45 - 18:30 น. ไม่ได้ออกไปข้างนอก\"" },
  { id: "EVD-17", image: "assets/item_water_drops.jpg?v=4.1.0", pin: "785130", aliases: ["DROP-17", "17", "E17"], name: "รอยหยดน้ำบนพื้นโถงทางเดิน", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเดินกลาง (CORR-100)", desc: "รอยหยดน้ำขนาดเล็กกระจายตัวเป็นแนวยาวบนพื้นกระเบื้องโถงทางเดิน ระหว่างบริเวณหน้าห้องซักรีดไปจนถึงหน้าประตูห้องครัว" },
  { id: "EVD-18", image: "assets/room_glass_corridor.jpg", pin: "417285", aliases: ["GLASS-18", "18", "E18"], name: "เศษกระจกบริเวณเชิงบันได", importance: "OPTIONAL", secretType: "HERR", typeLabel: "หลอก (Red Herring)", loc: "เชิงบันไดทางขึ้นชั้น 2", desc: "เศษกระจกใสความหนา 5 มม. แตกกระจายอยู่บนขั้นบันไดทางขึ้นชั้น 2 บนขอบกระจกชิ้นหนึ่งมีคราบสีส้มอมแดงเกาะติดอยู่" },
  { id: "EVD-19", image: "assets/item_shattered_barrel.jpg", pin: "175936", aliases: ["BUCKET-19", "19", "E19"], name: "ซากถังน้ำพลาสติกตกแตก", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ลานปูนซักล้างด้านหลัง (ใต้หน้าต่าง)", desc: "ถังพลาสติก 80 ลิตร ตกแตกกระจายบนพื้นลานปูนด้านนอก มีน้ำสาดกระจายเปียกทั่วบริเวณลานปูน หูจับถังมีรอยเชือกไนลอนผูกติดอยู่" },
  { id: "EVD-20", pin: "472890", aliases: ["PC1-20", "20", "E20"], name: "คำให้การของ PC 1", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 1 (1 AP)", desc: "คำให้การ: \"ช่วง 17:45 น. ฉันทุบตู้กดน้ำที่กินเหรียญอยู่ที่โถงกลาง ได้ยินเสียงน้ำไหลเบาๆ ในแนวกำแพงข้างห้องซักรีด\"" },
  { id: "EVD-21", image: "assets/item_bloody_towel.jpg?v=4.0.0", pin: "904712", aliases: ["TOWEL-21", "21", "E21"], name: "ผ้าขนหนูสีกรมท่าเปื้อนเลือด", importance: "MUST", secretType: "CORE", typeLabel: "อาวุธ/พยาน (Core)", loc: "ห้องครัว (ใต้ถุงขยะดำก้นถัง)", desc: "ผ้าขนหนูสีกรมท่าเนื้อหนาถูกขยำอยู่ใต้ถุงขยะดำก้นถังในครัว เมื่อคลี่ออกพบรอยเปื้อนสีน้ำตาลคล้ำแห้งกรัง" },
  { id: "EVD-22", image: "assets/item_notepad.jpg?v=4.1.0", pin: "194836", aliases: ["NOTE-22", "22", "E22"], name: "แผ่นกระดาษโน้ตบนพื้นโถงทางเดิน", importance: "OPTIONAL", secretType: "TRASH", typeLabel: "ขยะ (Trash)", loc: "โถงทางเดินกลาง (CORR-100)", desc: "กระดาษสมุดฉีกขนาดฝ่ามือ มีลายมือเขียนตารางเกมโอเอกซ์และข้อความสั้นๆ ตกอยู่บนพื้นกระเบื้องโถงทางเดิน" },
  { id: "EVD-23", image: "assets/item_water_hose.jpg?v=4.1.0", pin: "541682", aliases: ["FAUCET-23", "23", "E23"], name: "สายยางน้ำเปิดทิ้งและน้ำท่วมขัง", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องซักรีด (แนวก๊อกน้ำและพื้นห้อง)", desc: "สายยางสีเขียวยาวต่ออยู่กับก๊อกน้ำที่เปิดวาล์วทิ้งไว้ ปลายสายยางดีดสะบัดตกอยู่บนพื้นห้องซักรีด น้ำไหลทะลักออกมาอย่างต่อเนื่องจนเจิ่งนองท่วมขังพื้นกระเบื้องทั่วห้อง" },
  { id: "EVD-24", image: "assets/item_notice_board.jpg?v=4.1.0", pin: "249581", aliases: ["MAP-24", "24", "E24"], name: "แผนผังอาคารบนบอร์ดประชาสัมพันธ์", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "โถงทางเข้าหลัก (ข้าง Blast Gate)", desc: "แผนผังอาคารชั้น 1 แสดงลานบริการด้านหลังเป็นพื้นที่ปิด ล้อมด้วยกำแพงคอนกรีตสูง 5 ม. ไร้ประตูทางออก" },
  { id: "EVD-25", image: "assets/item_towel_rack.jpg?v=4.1.0", pin: "612847", aliases: ["RACK-25", "25", "E25"], name: "ราวแขวนผ้าขนหนูห้องซักรีด", importance: "MUST", secretType: "CORE", typeLabel: "ร่องรอย/สิ่งของ (Core)", loc: "ห้องซักรีด (ราวแขวนผ้า)", desc: "ราวแขวนผ้าสแตนเลสข้างอ่างล้างห้องซักรีด มีผ้าขนหนูสีกรมท่าแขวนอยู่ 4 ผืน และมีช่องว่างเว้น 1 จุด" },
  { id: "EVD-26", image: "assets/item_wine_bottle.jpg?v=4.0.0", pin: "248356", aliases: ["WINE-26", "26", "E26"], name: "ขวดไวน์และคราบบนเคาน์เตอร์ครัว", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องครัว (เคาน์เตอร์ปรุงอาหาร)", desc: "ขวดไวน์แดงสำหรับปรุงอาหารเปิดฝาวางอยู่บนเคาน์เตอร์ครัว มีไวน์เหลืออยู่ก้นขวดเล็กน้อย บริเวณเคาน์เตอร์ข้างเตาพบรอยของเหลวสีแดงหกหยดเป็นจุดๆ" },
  { id: "EVD-27", pin: "180472", aliases: ["PC3-27", "27", "E27"], name: "คำให้การของ PC 3", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 3 (1 AP)", desc: "คำให้การ: \"ช่วง 17:30 ถึง 18:15 น. ฉันสำรวจประตูกล Blast Gate และมาตรวัดน้ำ ช่วงประมาณ 18:00 น. เห็น PC 4 เดินที่ทางเดินกระจกใส\"" },
  { id: "EVD-28", pin: "328691", aliases: ["TASTE-28", "28", "E28"], name: "รสชาติของน้ำซุปสตูว์เนื้อ", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องครัว (หม้อสตูว์บนเตา)", desc: "น้ำซุปสตูว์เนื้อในหม้อมีกลิ่นหอมของเครื่องเทศและไวน์แดง แต่เมื่อชิมแล้วจะสัมผัสได้ถึงรสชาติฝาดเฝื่อนคล้ายสนิมเหล็กผสมอยู่จางๆ" },
  { id: "EVD-29", pin: "561479", aliases: ["THUD-29", "29", "E29"], name: "เสียงกระแทกจากห้องซักรีดตอน 21:00 น.", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องอาหาร (จุดรวมตัวเวลาราตรี)", desc: "ขณะที่ทุกคนรวมตัวอยู่ในห้องอาหารเวลา 21:00 น. มีเสียงเครื่องจักรหมุนกระแทกและเสียงวัตถุหนักตกกระทบดังสนั่นมาจากทางปีกห้องซักรีด" },
  { id: "EVD-30", pin: "527391", aliases: ["PC4-30", "30", "E30"], name: "คำให้การของ PC 4", importance: "GOOD", secretType: "TESTIMONY", typeLabel: "คำให้การ (Supporting)", loc: "ได้จากการถาม PC 4 (1 AP)", desc: "คำให้การ: \"ช่วง 17:30 ถึง 18:15 น. ฉันเดินอยู่ที่ทางเดินกระจก มองเห็นเงาวัตถุทรงกระบอกห้อยอยู่นอกหน้าต่างห้องซักรีด\"" },
  { id: "EVD-31", pin: "439268", aliases: ["DINNER-31", "31", "E31"], name: "การรวมตัวมื้อค่ำเวลา 19:00 น.", importance: "GOOD", secretType: "SUPP", typeLabel: "ร่องรอย/สิ่งของ (Supporting)", loc: "ห้องอาหาร (โต๊ะมื้อค่ำ)", desc: "การรวมตัวรับประทานอาหารมื้อค่ำเวลา 19:00 น. มีสตูว์เนื้อปรุงเสร็จโดย PC 5 ตามตารางเวรบน Monopad โดยเรียวตะไม่ได้มาร่วมโต๊ะอาหาร" },
];

const PC_INVESTIGATION_CLUES = {
  1: ['EVD-07', 'EVD-20', 'EVD-06', 'EVD-12', 'EVD-24', 'EVD-04'],
  2: ['EVD-07', 'EVD-03', 'EVD-19', 'EVD-15', 'EVD-01', 'EVD-17'],
  3: ['EVD-07', 'EVD-27', 'EVD-05', 'EVD-10', 'EVD-18', 'EVD-13'],
  4: ['EVD-07', 'EVD-30', 'EVD-02', 'EVD-28', 'EVD-29', 'EVD-31'],
  5: ['EVD-07', 'EVD-16', 'EVD-09', 'EVD-14', 'EVD-21', 'EVD-23', 'EVD-25', 'EVD-26']
};

function resolvePlayerSlot(p, defaultIndex = 1) {
  if (!p) return defaultIndex || 1;
  let slot = parseInt(p.pcSlot, 10);
  if (slot >= 1 && slot <= 5) return slot;

  const text = `${p.pcSlot || ''} ${p.role || ''} ${p.name || ''}`;
  if (/PC\s*1|นาเอกิ|naegi/i.test(text)) return 1;
  if (/PC\s*2|เคียวโกะ|kyoko|kirigiri/i.test(text)) return 2;
  if (/PC\s*3|เบียคุยะ|byakuya|togami/i.test(text)) return 3;
  if (/PC\s*4|อาโออิ|aoi|asahina/i.test(text)) return 4;
  if (/PC\s*5|ฮิฟุมิ|hifumi|yamada/i.test(text)) return 5;

  const match = text.match(/PC\s*([1-5])/i);
  if (match) return parseInt(match[1], 10);

  if (defaultIndex >= 1 && defaultIndex <= 5) return defaultIndex;
  return 1;
}

function getPlayerNameByPcSlot(slotNum) {
  const slotInt = parseInt(slotNum, 10);
  if (gameState && gameState.players) {
    const p = Object.values(gameState.players).find(x => parseInt(x.pcSlot, 10) === slotInt);
    if (p && p.name) return p.name;
  }
  if (myPlayer && parseInt(myPlayer.pcSlot, 10) === slotInt && myPlayer.name) {
    return myPlayer.name;
  }
  const defaultNames = {
    1: 'นาเอกิ',
    2: 'เคียวโกะ',
    3: 'เบียคุยะ',
    4: 'อาโออิ',
    5: 'ฮิฟุมิ'
  };
  return defaultNames[slotInt] || `ผู้เล่น ${slotInt}`;
}

function getClueDisplayName(c) {
  if (!c) return '';
  const clueId = typeof c === 'string' ? c : c.id;
  const clueObj = typeof c === 'object' ? c : (typeof ALL_CLUES_DATA !== 'undefined' ? ALL_CLUES_DATA.find(x => x.id === clueId) : null);
  if (!clueObj) return clueId || '';

  if (clueId === 'EVD-20') {
    return `คำให้การของ ${getPlayerNameByPcSlot(1)}`;
  }
  if (clueId === 'EVD-03') {
    return `คำให้การของ ${getPlayerNameByPcSlot(2)}`;
  }
  if (clueId === 'EVD-27') {
    return `คำให้การของ ${getPlayerNameByPcSlot(3)}`;
  }
  if (clueId === 'EVD-30') {
    return `คำให้การของ ${getPlayerNameByPcSlot(4)}`;
  }
  if (clueId === 'EVD-16') {
    return `คำให้การของ ${getPlayerNameByPcSlot(5)}`;
  }

  let raw = clueObj.rawName !== undefined ? clueObj.rawName : '';
  if (!raw && typeof clueObj._rawName === 'string') raw = clueObj._rawName;
  raw = String(raw).replace(/PC\s*1/g, getPlayerNameByPcSlot(1))
                   .replace(/PC\s*2/g, getPlayerNameByPcSlot(2))
                   .replace(/PC\s*3/g, getPlayerNameByPcSlot(3))
                   .replace(/PC\s*4/g, getPlayerNameByPcSlot(4))
                   .replace(/PC\s*5/g, getPlayerNameByPcSlot(5));
  return raw.replace(/\[.*?\]/g, '').trim() || clueId;
}

function getClueDisplayLoc(c) {
  if (!c) return '';
  const clueId = typeof c === 'string' ? c : c.id;
  const clueObj = typeof c === 'object' ? c : (typeof ALL_CLUES_DATA !== 'undefined' ? ALL_CLUES_DATA.find(x => x.id === clueId) : null);
  if (!clueObj) return '';
  let loc = clueObj.rawLoc !== undefined ? clueObj.rawLoc : '';
  if (!loc) return '';
  loc = String(loc).replace(/PC\s*1/g, getPlayerNameByPcSlot(1))
                   .replace(/PC\s*2/g, getPlayerNameByPcSlot(2))
                   .replace(/PC\s*3/g, getPlayerNameByPcSlot(3))
                   .replace(/PC\s*4/g, getPlayerNameByPcSlot(4))
                   .replace(/PC\s*5/g, getPlayerNameByPcSlot(5));
  return loc;
}

function getClueDisplayDesc(c) {
  if (!c) return '';
  const clueId = typeof c === 'string' ? c : c.id;
  const clueObj = typeof c === 'object' ? c : (typeof ALL_CLUES_DATA !== 'undefined' ? ALL_CLUES_DATA.find(x => x.id === clueId) : null);
  if (!clueObj) return '';
  let desc = clueObj.rawDesc !== undefined ? clueObj.rawDesc : '';
  if (!desc) return '';
  const p1 = getPlayerNameByPcSlot(1);
  const p2 = getPlayerNameByPcSlot(2);
  const p3 = getPlayerNameByPcSlot(3);
  const p4 = getPlayerNameByPcSlot(4);
  const p5 = getPlayerNameByPcSlot(5);
  desc = String(desc);
  if (p1) desc = desc.replace(/PC\s*1/g, p1);
  if (p2) desc = desc.replace(/PC\s*2/g, p2);
  if (p3) desc = desc.replace(/PC\s*3/g, p3);
  if (p4) desc = desc.replace(/PC\s*4/g, p4);
  if (p5) desc = desc.replace(/PC\s*5/g, p5);
  return desc;
}

// Attach dynamic getters on ALL_CLUES_DATA so direct property reads (.name, .loc, .desc) automatically resolve PC names
ALL_CLUES_DATA.forEach(c => {
  c.rawName = c.name;
  c.rawLoc = c.loc;
  c.rawDesc = c.desc;
  Object.defineProperty(c, 'name', {
    get() { return getClueDisplayName(this); },
    set(v) { this.rawName = v; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(c, 'loc', {
    get() { return getClueDisplayLoc(this); },
    set(v) { this.rawLoc = v; },
    configurable: true,
    enumerable: true
  });
  Object.defineProperty(c, 'desc', {
    get() { return getClueDisplayDesc(this); },
    set(v) { this.rawDesc = v; },
    configurable: true,
    enumerable: true
  });
});

function grantInvestigationClues(silent = false) {
  if (currentView === 'admin' || currentView === 'court') return;
  let slot = 0;
  if (myPlayer) {
    slot = resolvePlayerSlot(myPlayer, parseInt(new URLSearchParams(window.location.search).get('pc') || '1', 10));
    myPlayer.pcSlot = slot;
  } else {
    const qSlot = new URLSearchParams(window.location.search).get('pc');
    if (qSlot) slot = parseInt(qSlot, 10);
  }
  if (!slot || slot < 1 || slot > 5) slot = 1;

  const assigned = PC_INVESTIGATION_CLUES[slot] || [];
  if (!assigned.length) return;

  const prefix = getClueStoragePrefix();
  const userKey = currentUserHash ? ('dangan_unlocked_' + prefix + currentUserHash) : null;
  const existingRaw = userKey ? localStorage.getItem(userKey) : null;

  let currentUnlocked;
  if (!existingRaw) {
    // New investigation session for this room! Start cleanly with strictly the assigned clues
    currentUnlocked = [...assigned];
    saveUnlockedClues(currentUnlocked);
  } else {
    currentUnlocked = getUnlockedClues();
    let newlyUnlocked = [];
    assigned.forEach(cid => {
      if (!currentUnlocked.includes(cid)) {
        currentUnlocked.push(cid);
        newlyUnlocked.push(cid);
      }
    });
    if (newlyUnlocked.length > 0) {
      saveUnlockedClues(currentUnlocked);
    }
  }

  if (typeof renderCluesList === 'function') {
    renderCluesList();
  }
  if (typeof renderPlayerCluesList === 'function') {
    renderPlayerCluesList();
  }

  if (!silent) {
    const clueLines = assigned.map(cid => {
      const c = ALL_CLUES_DATA.find(x => x.id === cid);
      return `• [${cid}] ${getClueDisplayName(c)}`;
    }).join('\n');
    showInvestigationClueModal(clueLines, slot);
  }
}

function showInvestigationClueModal(clueLines, slot) {
  if (currentView === 'admin' || currentView === 'court' || currentView === 'simulation') return;
  let modal = document.getElementById('pcInvestigationModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'pcInvestigationModal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.zIndex = '999999';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '20px';
    document.body.appendChild(modal);
  }
  modal.innerHTML = `
    <div style="background:#151528; border:3px solid var(--mono-cyan); border-radius:12px; max-width:440px; width:100%; padding:22px; text-align:center; box-shadow:0 0 30px rgba(0,240,255,0.35); color:#fff;">
      <div style="font-size:2.4rem; margin-bottom:8px;">🔍</div>
      <h3 style="color:var(--mono-cyan); font-weight:900; margin-bottom:8px; font-size:1.2rem;">ช่วงเวลาการสืบสวนเริ่มต้นขึ้นแล้ว!</h3>
      <p style="color:#cbd5e1; font-size:0.88rem; margin-bottom:12px; line-height:1.5;">
        คุณได้รับบันทึกและเบาะแสส่วนตัวประจำตัวละครของคุณเรียบร้อยแล้ว:
      </p>
      <div style="background:rgba(0,240,255,0.08); border:1px solid rgba(0,240,255,0.3); border-radius:8px; padding:12px; text-align:left; font-size:0.84rem; color:#e2e8f0; line-height:1.6; margin-bottom:16px; white-space:pre-line;">
${escapeHtml(clueLines)}
      </div>
      <button class="dangan-action-btn cyan" style="width:100%; padding:10px; font-weight:900;" onclick="closeInvestigationClueModal()">
        🔍 รับทราบ / ตรวจสอบใน Monopad
      </button>
    </div>
  `;
  modal.style.display = 'flex';
  playSfx('correct');
}

function closeInvestigationClueModal() {
  const modal = document.getElementById('pcInvestigationModal');
  if (modal) modal.style.display = 'none';
  if (typeof switchPlayerTab === 'function') switchPlayerTab('clues');
}

let currentUserClueTagFilter = 'ALL';

function getClueStoragePrefix() {
  const r = (typeof roomCode !== 'undefined' && roomCode) 
    ? roomCode 
    : ((typeof gameState !== 'undefined' && gameState && gameState.roomCode) ? gameState.roomCode : '');
  return r ? (r.toUpperCase() + '_') : '';
}

function getUnlockedClues() {
  const prefix = getClueStoragePrefix();

  // If player is identified by hash or character name
  if (currentUserHash || (myPlayer && myPlayer.name)) {
    const userKeys = [
      (prefix && currentUserHash) ? ('dangan_unlocked_' + prefix + currentUserHash) : null,
      (!prefix && currentUserHash) ? ('dangan_unlocked_' + currentUserHash) : null,
      (prefix && myPlayer && myPlayer.name) ? ('dangan_unlocked_name_' + prefix + myPlayer.name.trim().toLowerCase()) : null,
      (!prefix && myPlayer && myPlayer.name) ? ('dangan_unlocked_name_' + myPlayer.name.trim().toLowerCase()) : null
    ].filter(Boolean);

    for (const k of userKeys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr) && arr.length > 0) {
            return Array.from(new Set(arr));
          }
        } catch(e) {}
      }
    }

    // Default to player's starting investigation clues if they have a pcSlot
    let slot = 0;
    if (myPlayer && myPlayer.pcSlot) slot = parseInt(myPlayer.pcSlot, 10);
    else {
      const qSlot = new URLSearchParams(window.location.search).get('pc');
      if (qSlot) slot = parseInt(qSlot, 10);
    }
    if (slot && PC_INVESTIGATION_CLUES[slot]) {
      return [...PC_INVESTIGATION_CLUES[slot]];
    }
    return [];
  }

  // Fallback ONLY for guest with no account/name
  const guestKeys = [
    prefix ? ('dangan_unlocked_' + prefix + 'guest') : null,
    'dangan_unlocked_guest',
    'dangan_unlocked_default'
  ].filter(Boolean);

  for (const k of guestKeys) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) {
          return Array.from(new Set(arr));
        }
      } catch(e) {}
    }
  }
  return [];
}

function saveUnlockedClues(unlockedArray) {
  const prefix = getClueStoragePrefix();
  const safeArr = Array.from(new Set(Array.isArray(unlockedArray) ? unlockedArray : []));
  const jsonStr = JSON.stringify(safeArr);

  if (currentUserHash) {
    localStorage.setItem('dangan_unlocked_' + prefix + currentUserHash, jsonStr);
    localStorage.setItem('dangan_unlocked_' + currentUserHash, jsonStr);
  } else {
    localStorage.setItem('dangan_unlocked_' + prefix + 'guest', jsonStr);
    localStorage.setItem('dangan_unlocked_guest', jsonStr);
  }

  if (myPlayer && myPlayer.name) {
    const nKey = myPlayer.name.trim().toLowerCase();
    localStorage.setItem('dangan_unlocked_name_' + prefix + nKey, jsonStr);
    localStorage.setItem('dangan_unlocked_name_' + nKey, jsonStr);
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



  const qEl = document.getElementById('clueSearchInput');
  const q = (qEl && qEl.value ? qEl.value : '').toLowerCase().trim();

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
          <div class="clue-name">${getClueDisplayName(c)}</div>
          <div class="clue-location">📍 สถานที่พบ: ${escapeHtml(c.loc)}</div>
          <div class="clue-desc">${getClueDisplayDesc(c)}</div>

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

function dismissAllPreviousPhasePopups() {
  try {
    // 1. Minigame Result & Execution Cutscene Modals
    if (typeof closeCourtResultModal === 'function') closeCourtResultModal(true);
    if (typeof closeExecutionModal === 'function') closeExecutionModal(true);
    if (typeof closeClosingClimaxModal === 'function') closeClosingClimaxModal();

    // 2. Blueprint / Investigation Modals
    if (typeof closeNormalRoomModal === 'function') closeNormalRoomModal();
    if (typeof closeInvestigationClueModal === 'function') closeInvestigationClueModal();
    if (typeof closeClueScannerModal === 'function') closeClueScannerModal();
    if (typeof closeEmergencyEscapeModal === 'function') closeEmergencyEscapeModal();
    if (typeof closeAvatarModal === 'function') closeAvatarModal();
    if (typeof closeHotkeysModal === 'function') closeHotkeysModal();

    // 3. Clue Details & Pulley simulation
    const pulleyModal = document.getElementById('pulleySimulationModal');
    if (pulleyModal) pulleyModal.classList.add('hidden');

    const clueModal = document.getElementById('clueDetailsModal');
    if (clueModal) clueModal.classList.add('hidden');

    // 4. Overlays & Banners
    const overlaysToHide = [
      'objectionOverlay', 'nonstopBreakOverlay', 'rebuttalSlashOverlay',
      'saboteurSmokeOverlay', 'saboteurBannerOverlay', 'saboteurDistortOverlay',
      'logicDiveCrashNotice', 'stg4CrashNotice', 'armamentFinalBlowBanner',
      'closingBonusTimePopup', 'truthBulletFlyOverlay', 'perjuryConfirmModal'
    ];
    overlaysToHide.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });

    // 5. Hide any visible generic modal-backdrops except PIN and Admin Config
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(modal => {
        if (modal.id !== 'pinModal' && modal.id !== 'adminMinigameModal') {
          modal.classList.add('hidden');
        }
      });
    }
  } catch (err) {
    console.warn('[dismissAllPreviousPhasePopups] Error cleaning up modals:', err);
  }
}

function setStage(stage, config) {
  dismissAllPreviousPhasePopups();
  gameState.stage = stage;
  updateMonopadPhaseTabs(stage);
  updateAdminActiveStageButtons(stage);
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
    grantInvestigationClues();
    updateSaboteurPanelVisibility();
    if (isCurrentPlayerSaboteur()) {
      showToast('🩸 [BLACKENED]: ช่วงเวลาสืบสวนเริ่มต้นแล้ว! แผงควบคุม Saboteur พร้อมใช้งานตลอดเวลาเพื่ออำพรางความลับและก่อกวนศาล!');
    }
  } else if (stage === 'trial') {
    autoUnlockTrialClues();
    playSfx('gavel');
    logCourt(`⚖️ [CLASS TRIAL]: เริ่มต้นศาลชั้นเรียน! เข้าสู่ช่วงอภิปรายและไต่สวนคดี`);
  } else if (stage === 'stage0') {
    autoUnlockTrialClues();
    if (!gameState.stg0) gameState.stg0 = {};
    if (config) {
      if (config.topic) gameState.stg0.topic = config.topic;
      if (config.statements && Array.isArray(config.statements) && config.statements.length > 0) {
        gameState.stg0.statements = config.statements;
      }
    }
    if (!gameState.stg0.statements || gameState.stg0.statements.length === 0) {
      gameState.stg0.statements = getDynamicStg0Statements();
    }
    if (!gameState.stg0.topic) {
      gameState.stg0.topic = 'ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.';
    }
    gameState.stg0.currentIndex = 0;
    gameState.stg0.isPaused = false;
    gameState.stg0.buzzedBy = null;
    gameState.stg0.selectedClueId = null;
    gameState.stg0.approved = null;
    gameState.timeRemaining = 90;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
    logCourt(`🗣️ [NON-STOP DEBATE]: เริ่มต้นการถกเถียงต่อเนื่อง (Stage 0) ในประเด็น "${gameState.stg0.topic}"`);
    updateStg0CourtDisplay();
    updateAdminStg0Display();
    startStg0Loop();
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
      if (config.statement) gameState.stg3Argument = config.statement;
      if (config.topic !== undefined) gameState.stg3Topic = config.topic;
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
    const allPlayers = Object.values(gameState.players || {});
    let target = config?.targetPlayer || (document.getElementById('adminArmamentTargetSelect')?.value) || (document.getElementById('cfgStg6TargetSelect')?.value) || '';

    // Match and normalize target with connected online player
    let matchedPlayer = null;
    if (target) {
      matchedPlayer = allPlayers.find(p => p.name === target) ||
        allPlayers.find(p => p.name && (p.name.includes(target) || target.includes(p.name))) ||
        allPlayers.find(p => (p.isKiller || parseInt(p.pcSlot, 10) === 5) && (target.includes('ฮิฟุมิ') || target.includes('Hifumi') || target.includes('Blackened') || target.includes('คนร้าย')));
    }
    if (!matchedPlayer && !target) {
      matchedPlayer = allPlayers.find(p => p.name && (p.name.includes('ฮิฟุมิ') || p.name.includes('Hifumi'))) ||
        allPlayers.find(p => p.isKiller || parseInt(p.pcSlot, 10) === 5);
      if (!matchedPlayer && allPlayers.length > 0) {
        matchedPlayer = allPlayers[allPlayers.length - 1];
      }
    }
    if (matchedPlayer) {
      target = matchedPlayer.name;
    } else if (!target) {
      target = 'ฮิฟุมิ';
    }
    gameState.stg6TargetPlayer = target;
    gameState.stg6Phase = 'placement';
    gameState.stg6Grid = Array(16).fill(null);
    gameState.stg6Secret = null;
    gameState.stg6Ships = {
      arm: { name: 'เกราะแขน', size: 2, hits: 0, sunk: false },
      leg: { name: 'เกราะขา', size: 2, hits: 0, sunk: false },
      core: { name: 'แกนหัวใจ', size: 1, hits: 0, sunk: false }
    };
    gameState.stg6Ships.shoulder = gameState.stg6Ships.leg; // compatibility alias
    gameState.stg6BlocksRemaining = 5;
    gameState.stg6Finished = false;
    gameState.stg6FinalReady = false;
    stg6FinalBlowSent = false;
    gameState.stg6Defeat = false;
    gameState.stg6TrapPenaltyActive = false;
    gameState.stg6PoolAmmo = 8;

    // Accusers (all other players - strictly exclude defendant!)
    let accusers = allPlayers.filter(p => {
      if (matchedPlayer && (p.id === matchedPlayer.id || p.name === matchedPlayer.name)) return false;
      if (p.name === target) return false;
      if (p.name && target && (p.name.includes(target) || target.includes(p.name))) return false;
      if ((p.isKiller || parseInt(p.pcSlot, 10) === 5) && (target.includes('ฮิฟุมิ') || target.includes('Hifumi'))) return false;
      return true;
    }).map(p => p.name);

    if (accusers.length === 0) {
      accusers = ['นาเอกิ', 'เคียวโกะ', 'เบียคุยะ', 'อาโออิ'].filter(n => n !== target && !target.includes(n));
    }
    gameState.stg6Accusers = accusers;
    gameState.stg6CurrentTurnIndex = 0;
    gameState.stg6PlayerAmmo = {};
    accusers.forEach(p => {
      gameState.stg6PlayerAmmo[p] = 2;
    });

    if (config && config.scream) {
      gameState.stg6Statement = config.scream;
    } else if (!gameState.stg6Statement) {
      gameState.stg6Statement = 'ไม่มีทาง! รอกเชือกกับถังน้ำอะไรกัน... ฉันไม่เคยรู้เรื่องกลไกบ้าๆ นั่นเลยสักนิด!!';
    }

    updateStage6Displays();
    const banner = document.getElementById('armamentFinalBlowBanner');
    if (banner) banner.classList.add('hidden');
    gameState.timeRemaining = 60;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    playSfx('gavel');
    logCourt(`⚔️ [STAGE 6: ARGUMENT ARMAMENT]: ผู้ถูกกล่าวหาคือ [${gameState.stg6TargetPlayer}] เข้าสู่ช่วงติดตั้งเกราะ 3 ลำและกับดักสะท้อนบนเรดาร์ 4x4!`);
  } else if (stage === 'quick_question') {
    autoUnlockTrialClues();
    if (config) {
      gameState.qqData = {
        id: config.id || 'qq_custom',
        question: config.question || 'เวลาที่เหยื่อเรียวตะถูกลอบทำร้ายจนสลบในครัวคือช่วงเวลาใด!?',
        choices: config.choices || {
          A: '17:30 น. (ช่วงเตรียมอาหารเย็น)',
          B: '19:00 น. (ช่วงเริ่มรับประทานอาหาร)',
          C: '20:30 น. (ช่วงหลังมื้ออาหารค่ำ)'
        },
        correct: config.correct || 'A',
        votes: {},
        revealed: false
      };
    } else if (!gameState.qqData) {
      gameState.qqData = {
        id: 'qq_custom',
        question: 'เวลาที่เหยื่อเรียวตะถูกลอบทำร้ายจนสลบในครัวคือช่วงเวลาใด!?',
        choices: {
          A: '17:30 น. (ช่วงเตรียมอาหารเย็น)',
          B: '19:00 น. (ช่วงเริ่มรับประทานอาหาร)',
          C: '20:30 น. (ช่วงหลังมื้ออาหารค่ำ)'
        },
        correct: 'A',
        votes: {},
        revealed: false
      };
    }
    gameState.timeRemaining = 45;
    gameState.timerRunning = false;
    stopTimer();
    updateTimerDisplay();
    updateQuickQuestionDisplay();
    playSfx('gavel');
    logCourt(`⚡ [FLASH DECISION]: เริ่มต้นช่วงตอบคำถามสั้น 1 ข้อ! ทุกคนร่วมลงมติ`);
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
        showMinigameResult(false, "TIME EXHAUSTED!", "หมดเวลาการถอดรหัสคำศัพท์!", "ไม่สามารถถอดรหัสกลไกได้ทันเวลา");
      } else if (gameState.stage === 'stage3') {
        showMinigameResult(false, "TIME EXHAUSTED!", "หมดเวลาการดวลดาบคำพูด!", "ผู้เล่นไม่สามารถหักล้างข้อโต้แย้งได้ทันเวลา");
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
      } else if (gameState.stage === 'quick_question' && !gameState.qqData?.revealed) {
        adminRevealQuickQuestion();
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

let lastCourtLogText = '';
let lastCourtLogTime = 0;

function logCourt(text) {
  if (!text) return;
  const now = Date.now();
  const trimmed = String(text).trim();
  // Anti-Duplicate filter: Drop identical log message arriving within 1500ms
  if (trimmed === lastCourtLogText && (now - lastCourtLogTime) < 1500) {
    return;
  }
  lastCourtLogText = trimmed;
  lastCourtLogTime = now;

  const box = document.getElementById('courtLog');
  if (box) {
    const d = document.createElement('div');
    d.innerText = `> ${trimmed}`;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
  }
  const trialBox = document.getElementById('courtLogTrial');
  if (trialBox) {
    const d = document.createElement('div');
    d.innerText = `> ${trimmed}`;
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

function handleKickPlayer(msgOrId) {
  const kickMsg = (typeof msgOrId === 'object' && msgOrId !== null) ? msgOrId : { playerId: msgOrId, targetKey: msgOrId };
  const kickId = kickMsg.playerId;
  const kickHash = kickMsg.userHash;
  const kickKey = kickMsg.targetKey;
  const kickName = kickMsg.playerName;

  const isMe = (myPlayer && (
    (kickId && myPlayer.id === kickId) ||
    (kickHash && myPlayer.userHash === kickHash) ||
    (kickKey && (myPlayer.id === kickKey || myPlayer.userHash === kickKey)) ||
    (kickName && myPlayer.name === kickName)
  )) || (currentUserHash && (currentUserHash === kickHash || currentUserHash === kickKey || currentUserHash === kickId));

  if (isMe) {
    if (hostPeer) { try { hostPeer.close(); } catch(e){} }
    if (serverStreamSource) { try { serverStreamSource.close(); } catch(e){} }
    if (localRoomChannel) { try { localRoomChannel.close(); } catch(e){} }
    try {
      sessionStorage.removeItem('dangan_user_hash');
      sessionStorage.removeItem('dangan_court_room_code');
      localStorage.removeItem('dangan_current_room');
      localStorage.removeItem('dangan_my_player');
    } catch(e) {}
    alert('⚠️ คุณถูกนำออกจากห้องโดยผู้ดูแลศาล (DM)');
    if (typeof navigate === 'function') {
      navigate('/');
    } else {
      window.location.href = '/';
    }
    return;
  }

  // Remove matching player from gameState.players
  if (gameState && gameState.players) {
    Object.keys(gameState.players).forEach(k => {
      const p = gameState.players[k];
      if (k === kickKey || k === kickId || k === kickHash ||
          (p && (p.id === kickId || p.userHash === kickHash || (kickName && p.name === kickName)))) {
        delete gameState.players[k];
      }
    });
    updatePlayerDisplays();
    if (typeof updateAdminDisplay === 'function') updateAdminDisplay();
    if (typeof renderAdminEvidenceTracker === 'function') renderAdminEvidenceTracker();
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
  const courtStages = ['courtDailyLife', 'courtIdle', 'courtLobby', 'courtTrial', 'courtInvestigation', 'courtStage0', 'courtStage1', 'courtStage2', 'courtStage3', 'courtStage4', 'courtStage5', 'courtStage6', 'courtClosing', 'courtStage7', 'courtVerdict', 'courtQuickQuestion'];
  courtStages.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  if (stage !== 'stage0') {
    stopStg0Loop();
  }

  // Clock visibility: Only show during timed mini-games (stage1 to stage7, closing, quick_question)
  const clockEl = document.querySelector('.monokuma-clock');
  if (clockEl) {
    if (stage && (stage.startsWith('stage') || stage === 'closing' || stage === 'quick_question')) {
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
  } else if (stage === 'stage0') {
    const s0 = document.getElementById('courtStage0');
    if (s0) s0.classList.remove('hidden');
    updateStg0CourtDisplay();
    startStg0Loop();
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
    updateStage6Displays();
  } else if (stage === 'closing') {
    const cl = document.getElementById('courtClosing');
    if (cl) cl.classList.remove('hidden');
    updateClosingDisplay();
  } else if (stage === 'stage7') {
    const s7 = document.getElementById('courtStage7');
    if (s7) s7.classList.remove('hidden');
    updateVoteDisplay();
  } else if (stage === 'quick_question') {
    const qq = document.getElementById('courtQuickQuestion');
    if (qq) qq.classList.remove('hidden');
    updateQuickQuestionDisplay();
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
  const trialClueIds = ['EVD-01', 'EVD-02', 'EVD-04', 'EVD-05', 'EVD-06', 'EVD-07', 'EVD-08', 'EVD-09', 'EVD-10', 'EVD-11', 'EVD-12', 'EVD-14'];
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
  if (currentView === 'simulation') {
    return; // Parent simulation dashboard shouldn't overlay cutscene
  }
  const modal = document.getElementById('monokumaExecutionModal');
  const contentBox = document.getElementById('executionContentBox');
  const sirenLight = document.getElementById('executionSirenLight');
  const topBanner = document.getElementById('executionTopBanner');
  const headline = document.getElementById('executionHeadline');
  const subHeadline = document.getElementById('executionSubHeadline');
  const guiltyStamp = document.getElementById('guiltyStamp');
  const stampMain = document.getElementById('executionStampMain');
  const stampSub = document.getElementById('executionStampSub');
  const imgEl = document.getElementById('executionImage');
  const culpritCard = document.getElementById('executionCulpritCard');
  const nameEl = document.getElementById('executionCulpritName');
  const verdictEl = document.getElementById('executionVerdictText');
  const avatarEl = document.getElementById('executionCulpritAvatar');
  const closeBtn = document.getElementById('executionCloseBtn');

  const trapperName = getTrapperName();

  if (isVictory) {
    // True Ending: Class Survived! Green/Emerald/Hope Theme
    if (contentBox) contentBox.classList.add('victory-theme');
    if (sirenLight) sirenLight.classList.add('siren-victory');
    if (guiltyStamp) guiltyStamp.classList.add('stamp-victory');
    if (topBanner) {
      topBanner.className = 'slanted-banner green';
      topBanner.innerText = 'CLASS SURVIVAL & MOCK EXECUTION';
    }
    if (headline) {
      headline.classList.add('headline-victory');
      headline.innerText = 'NOT GUILTY: CLASS SURVIVED!';
    }
    if (subHeadline) {
      subHeadline.innerText = 'นักเรียนทุกคนรอดชีวิต! แผนของ Trapper พังทลาย... พิธีประหารซ้ำศพคนร้ายจำลอง!';
      subHeadline.style.color = '#a7f3d0';
    }
    if (stampMain) stampMain.innerText = 'SURVIVED';
    if (stampSub) stampSub.innerText = 'นักเรียนทุกคนรอดชีวิต!';
    if (imgEl) imgEl.src = 'assets/execution_true_ending.jpg';
    if (culpritCard) culpritCard.classList.add('card-victory');
    if (avatarEl) avatarEl.innerText = '🎉';
    if (nameEl) {
      nameEl.innerText = 'สึกิชิมะ เรียวตะ (สุดยอดนักเอาตัวรอด - The Blackened)';
      nameEl.style.color = '#34d399';
    }
    if (closeBtn) closeBtn.className = 'small-btn green';

    if (verdictEl) {
      verdictEl.innerHTML = `
        <div style="color:#10b981; font-weight:800; font-size:1.1rem; margin-bottom:8px; border-bottom:1px solid rgba(16,185,129,0.3); padding-bottom:6px;">
          🟢 ปิ๊งป่อง! ตัดสินถูกต้อง! คนร้าย (The Blackened) ที่แท้จริงคือ สึกิชิมะ เรียวตะ!
        </div>
        <div class="execution-story-box">
          <p style="margin-bottom:8px;">
            <strong style="color:#38bdf8;">Monokuma:</strong> "อุปุ๊ปุ๊ปุ๊! ปิ๊งป่องงงงง! ถูกต้องนะคร้าบบบบบบบ! เก่งมาก! ยอดเยี่ยมที่สุด! คนร้ายตัวจริง... 'Blackened' ของคดีนี้ไม่ใช่ใครอื่น แต่คือพ่อหนุ่มสุดยอดนักเอาตัวรอด <strong>'สึกิชิมะ เรียวตะ'</strong> นั่นเองจ้าาาา!"
          </p>
          <p style="margin-bottom:8px; color:#fca5a5;">
            <strong>${escapeHtml(trapperName)} (The Trapper):</strong> "มะ... ไม่จริง... ฉัน... ฉันเป็นคนฟาดหัวเขา... เอาเชือกไปคล้องคอเขา... เปิดน้ำใส่ถัง... ฉันสิที่เป็นคนฆ่าเขา! ทำไมฉันถึงไม่ใช่คนร้ายล่ะ?!"
          </p>
          <p style="margin-bottom:8px;">
            <strong style="color:#38bdf8;">Monokuma:</strong> "อุปุ๊ปุ๊! กฎก็คือกฎจ้ะ! การกระทำของเธอน่ะมันแค่ <strong>'พยายามฆ่า'</strong> เท่านั้นแหละ! เจ้าเรียวตะมันฟื้นขึ้นมา ตัดเชือกของเธอทิ้งไปแล้ว มันรอดตาย 100% แล้วแท้ๆ! แต่เพราะความหยิ่งยะโส คิดว่าตัวเองฉลาดเหนือใคร อยากจะแกล้งตายเพื่อมาแฉเธอในศาล... มันก็เลยเอาเศษเชือกมาผูกเป็นฮาร์เนสเอง แล้วก็เอาบ่วงมาคล้องคอตัวเองใหม่! แต่เพราะเงื่อนมันหลุดจากแรง Shock Load มวลน้ำ 65.2 กิโลกรัม เชือกเลยกระชากคอหอยมันหักดังเป๊าะ! คนที่ผูกเงื่อนมรณะเส้นนั้นเงื่อนสุดท้าย... คนที่เอามันมาสวมคอตัวเอง... ก็คือตัวมันเองทั้งนั้น! ฮ่าๆๆๆ!"
          </p>
          <div style="background:rgba(16,185,129,0.12); border-left:3px solid #10b981; padding:8px 10px; margin:10px 0; border-radius:4px; text-align:left;">
            <strong style="color:#34d399;">🎬 ฉากประหารจำลองศพเรียวตะ: The Ultimate Survivalist's Final Drill</strong><br/>
            ศพของเรียวตะถูกมัดติดเป้สนาม 100 กก. เข้าคอร์สฝึกภัยพิบัติหิมะถล่ม ดงหมีคลั่ง และหลุมพราง ก่อนถูกเฮลิคอปเตอร์กู้ภัยยกตัวลอยขึ้นสู่อากาศ... ทว่าสลิงเกิดขาดเพราะรับน้ำหนักเกินป้ายเตือน <em>'MAX LOAD: 50.0 KG'</em> ร่างร่วงดิ่งลงสู่เครื่องบดอัดขยะอุตสาหกรรม กลายเป็น <strong>'กระป๋องเสบียงยังชีพฉุกเฉิน (Survival Ration Can)'</strong> ขนาดยักษ์พร้อมตราประทับสีชมพูตัวเบ้อเริ่มว่า <strong>'EXPIRED // หมดอายุขัย'</strong>!
          </div>
          <p style="color:#6ee7b7; font-weight:700; margin-top:8px;">
            ✨ <strong>บทสรุป (True Ending):</strong> ในเมื่อคนร้ายตัวจริงได้ตายไปแล้ว การประหารศพจึงถือว่าครบถ้วนสมบูรณ์... <strong>ไม่มีใครในพวกแกต้องตายเพิ่มแม้แต่คนเดียว! ทุกคนรอดชีวิต! ส่วนแผนการของ ${escapeHtml(trapperName)} พังทลายไม่เป็นท่า!</strong>
          </p>
        </div>
      `;
    }
  } else {
    // Bad Ending: Class Cleansing Total Despair Execution
    if (contentBox) contentBox.classList.remove('victory-theme');
    if (sirenLight) sirenLight.classList.remove('siren-victory');
    if (guiltyStamp) guiltyStamp.classList.remove('stamp-victory');
    if (topBanner) {
      topBanner.className = 'slanted-banner pink';
      topBanner.innerText = 'DANGANRONPA EXECUTION';
    }
    if (headline) {
      headline.classList.remove('headline-victory');
      headline.innerText = 'PUNISHMENT TIME';
    }
    if (subHeadline) {
      subHeadline.innerText = 'ถึงเวลาลงทัณฑ์แห่งความสิ้นหวัง... อุปุ๊ปุ๊!';
      subHeadline.style.color = '#ffb3cc';
    }
    if (stampMain) stampMain.innerText = 'GUILTY';
    if (stampSub) stampSub.innerText = 'มีความผิดจริง (ประหารชีวิตหมู่)';
    if (imgEl) imgEl.src = 'assets/execution_bad_ending.jpg';
    if (culpritCard) culpritCard.classList.remove('card-victory');
    if (avatarEl) avatarEl.innerText = '💀';
    if (nameEl) {
      nameEl.innerText = 'นักเรียนทุกคนในห้องพิจารณาคดี (โหวตผิดตัว)';
      nameEl.style.color = 'var(--court-gold)';
    }
    if (closeBtn) closeBtn.className = 'small-btn red';

    if (verdictEl) {
      verdictEl.innerHTML = `
        <div style="color:#ff2244; font-weight:800; font-size:1.1rem; margin-bottom:8px; border-bottom:1px solid rgba(255,34,68,0.3); padding-bottom:6px;">
          🔴 โหวตผิด! Blackened ที่แท้จริงคือ สึกิชิมะ เรียวตะ ไม่ใช่คนอื่น!
        </div>
        <div class="execution-story-box">
          <p style="margin-bottom:8px;">
            <strong style="color:#ff2244;">Monokuma:</strong> "ปิ๊งป่อง... ผิดจ้าาาาาาาา! อุปุ๊ปุ๊ปุ๊! ว้ายๆๆ โดนหลอกกันหมดทั้งบางเลยนะเนี่ย! เจ้าคนที่พวกแกชี้หน้าว่าเป็นฆาตกร (<strong>${escapeHtml(trapperName)}</strong>) น่ะ มันเป็นแค่คนวางกับดักที่ล้มเหลวไม่เป็นท่าต่างหาก! คนที่ผูกเงื่อนมรณะจนตัวเองคอหักตายคือเจ้าเรียวตะเองต่างหากล่ะจ๊ะ!"
          </p>
          <p style="margin-bottom:8px;">
            <strong style="color:#ff2244;">Monokuma:</strong> "ในเมื่อพวกแกชี้ตัว Blackened ผิด... กฎเหล็กของโรงเรียนระบุไว้ชัดเจนว่า <em>'หากศาลชั้นเรียนตัดสินผิด... ผู้เป็น Blackened จะได้สำเร็จการศึกษา ส่วนนักเรียนที่เหลือทั้งหมด... จะต้องถูกประหารชีวิต!'</em> แต่เพราะ Blackened ดันชิงตายไปก่อนแล้ว... เหลือเพียงอย่างเดียวเท่านั้นสำหรับพวกแกทุกคนที่ยืนอยู่ตรงนี้... การลงโทษหมู่ยกชั้นเรียนยังไงล่ะ! <strong>IT'S PUNISHMENT TIME!!</strong>"
          </p>
          <div style="background:rgba(255,34,68,0.15); border-left:3px solid #ff0055; padding:8px 10px; margin:10px 0; border-radius:4px; text-align:left;">
            <strong style="color:#ff6b8b;">🎬 ฉากประหารหมู่นักเรียนทั้งห้อง: The Grand Class Cleansing</strong><br/>
            ตรวนเหล็กดีดล็อกโพเดียมของทุกคน เลื่อนลงสู่สายพานมรณะใต้ดิน <em>'The Despair Sorting Conveyor'</em> หุ่นยนต์ Monokuma ถือแท่งเหล็กประทับร้อนไฟลุกโชนประทับตรา <strong>'FAIL / ตกรอบ'</strong> ลงบนหน้าผากและแผ่นอกของทุกคน ก่อนจะลอดผ่านพายุลูกตุ้มเหล็กหนามยักษ์ และทิ้งดิ่งลงสู่ปากเตาหลอมมรณะ เปลวเพลิงสีชมพูอมม่วงระเบิดพวยพุ่งเป็นรูปหัวกะโหลก Monokuma แสยะยิ้ม!
          </div>
          <p style="color:#ff8899; font-weight:700; margin-top:8px;">
            🩸 <strong>บทสรุป (Bad Ending):</strong> ปิดฉากเรื่องราวของเหล่านักเรียนแห่งความหวัง... สู่ห้วงลึกแห่งความสิ้นหวังชั่วนิรันดร์ (TOTAL DESPAIR)
          </p>
        </div>
      `;
    }
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
  const contentBox = document.getElementById('executionContentBox');
  const sirenLight = document.getElementById('executionSirenLight');
  const guiltyStamp = document.getElementById('guiltyStamp');
  const culpritCard = document.getElementById('executionCulpritCard');
  if (contentBox) contentBox.classList.remove('victory-theme');
  if (sirenLight) sirenLight.classList.remove('siren-victory');
  if (guiltyStamp) guiltyStamp.classList.remove('stamp-victory');
  if (culpritCard) culpritCard.classList.remove('card-victory');

  if (!skipBroadcast && isHost) broadcast({ type: 'close_execution_cutscene' });
}

// ==========================================================
// MINI-GAME SPECIFIC LOGIC
// ==========================================================

// 0. Non-Stop Debate (การถกเถียงต่อเนื่อง)
let stg0LoopInterval = null;

function updateStg0CourtDisplay() {
  if (!gameState.stg0) return;
  const topicEl = document.getElementById('stg0CourtTopic');
  if (topicEl && gameState.stg0.topic) {
    topicEl.innerText = gameState.stg0.topic;
  }

  const stmts = gameState.stg0.statements || [];
  if (stmts.length > 0) {
    const idx = (gameState.stg0.currentIndex || 0) % stmts.length;
    const s = stmts[idx];
    const avEl = document.getElementById('stg0SpeakerAvatar');
    const nameEl = document.getElementById('stg0SpeakerName');
    const txtEl = document.getElementById('stg0StatementText');
    if (avEl) {
      if (s.avatarConfig) {
        avEl.innerHTML = renderAvatarSvg(s.avatarConfig, 50);
      } else {
        avEl.innerText = s.avatar || '👤';
      }
    }
    if (nameEl) nameEl.innerText = s.speaker || 'ผู้ร่วมอภิปราย';
    if (txtEl) txtEl.innerText = `"${s.text}"`;
  }

  // Live Objection Cut-In Overlay on Court Screen (2-Stage System)
  const overlay = document.getElementById('stg0ObjectionOverlay');
  if (overlay) {
    if (gameState.stg0.buzzedBy) {
      overlay.classList.remove('hidden');

      const burstEl = document.getElementById('stg0MangaCutinBurst');
      const explEl = document.getElementById('stg0ExplanationPhase');
      const isBurst = (gameState.stg0.objectionPhase !== 'explanation');

      if (burstEl) {
        if (isBurst) {
          burstEl.classList.remove('hidden');
          const BURST_POSITIONS = ['burst-pos-1', 'burst-pos-2', 'burst-pos-3', 'burst-pos-4'];
          BURST_POSITIONS.forEach(c => burstEl.classList.remove(c));
          burstEl.classList.add(gameState.stg0.burstPos || 'burst-pos-1');

          const bAv = document.getElementById('stg0BurstAvatar');
          const bQuote = document.getElementById('stg0BurstQuote');
          const bName = document.getElementById('stg0BurstPlayerName');
          if (bAv) {
            bAv.innerHTML = gameState.stg0.buzzedAvatarConfig
              ? renderAvatarSvg(gameState.stg0.buzzedAvatarConfig, 165, true)
              : `<div style="font-size:5rem; line-height:165px; text-align:center;">${gameState.stg0.buzzedAvatar || '👤'}</div>`;
          }
          if (bQuote) bQuote.innerText = gameState.stg0.objectionQuote || '⚡ นั่นมันผิดแล้วล่ะ! (NO, THAT\'S WRONG!)';
          if (bName) bName.innerText = gameState.stg0.buzzedBy;
        } else {
          burstEl.classList.add('hidden');
        }
      }

      if (explEl) {
        if (!isBurst) {
          explEl.classList.remove('hidden');
        } else {
          explEl.classList.add('hidden');
        }
      }

      // Always populate explanation phase elements so they are ready
      const giantAv = document.getElementById('stg0GiantAvatar');
      const objName = document.getElementById('stg0ObjectorName');
      const objTitle = document.getElementById('stg0ObjectorTitle');
      const bCode = document.getElementById('stg0BulletCode');
      const bName = document.getElementById('stg0BulletName');

      if (giantAv) {
        giantAv.innerHTML = gameState.stg0.buzzedAvatarConfig
          ? renderAvatarSvg(gameState.stg0.buzzedAvatarConfig, 160, false)
          : `<div style="font-size:5.5rem; line-height:160px; text-align:center;">${gameState.stg0.buzzedAvatar || '👤'}</div>`;
      }
      if (objName) objName.innerText = gameState.stg0.buzzedBy;
      if (objTitle) objTitle.innerText = gameState.stg0.buzzedRole || 'OBJECTION // ดาบแห่งความจริงฟันตัดข้อโต้แย้ง!';

      if (gameState.stg0.selectedClueId) {
        const clue = ALL_CLUES_DATA.find(c => c.id === gameState.stg0.selectedClueId);
        if (bCode) bCode.innerText = gameState.stg0.selectedClueId;
        if (bName) bName.innerText = clue ? clue.name : gameState.stg0.selectedClueId;
      } else {
        if (bCode) bCode.innerText = 'EVD-??';
        if (bName) bName.innerText = 'กำลังเลือกกระสุนใน Monopad...';
      }
    } else {
      if (typeof stg0BurstTimer !== 'undefined' && stg0BurstTimer) {
        clearTimeout(stg0BurstTimer);
        stg0BurstTimer = null;
      }
      overlay.classList.add('hidden');
      const burstEl = document.getElementById('stg0MangaCutinBurst');
      const explEl = document.getElementById('stg0ExplanationPhase');
      if (burstEl) burstEl.classList.add('hidden');
      if (explEl) explEl.classList.add('hidden');
    }
  }
}

function startStg0Loop() {
  stopStg0Loop();
  stg0LoopInterval = setInterval(() => {
    if (gameState.stage !== 'stage0') {
      stopStg0Loop();
      return;
    }
    if (gameState.stg0 && !gameState.stg0.isPaused && !gameState.stg0.buzzedBy) {
      const stmts = gameState.stg0.statements || [];
      if (stmts.length > 0) {
        gameState.stg0.currentIndex = (gameState.stg0.currentIndex + 1) % stmts.length;
        updateStg0CourtDisplay();
      }
    }
  }, 4000);
}

function stopStg0Loop() {
  if (stg0LoopInterval) {
    clearInterval(stg0LoopInterval);
    stg0LoopInterval = null;
  }
}

function stg0PressBuzzer() {
  if (gameState.stage !== 'stage0') return;
  if (gameState.stg0 && gameState.stg0.buzzedBy) {
    showToast("⚠️ มีผู้เล่นอื่นกดคัดค้านไปก่อนแล้ว!");
    return;
  }
  if (getMyCredibility() <= 0) {
    showToast("❌ แต้มความน่าเชื่อถือหมด (Panic State) ไม่สามารถกดคัดค้านได้");
    playSfx('wrong');
    return;
  }

  const myName = myPlayer ? myPlayer.name : 'ผู้เล่น';
  const myAvatar = myPlayer?.avatar || '👤';
  const myAvatarConfig = myPlayer?.avatarConfig || currentAvatarConfig;
  const myRole = myPlayer?.role || 'สุดยอดนักเรียนมัธยมปลาย';
  const quote = OBJECTION_CATCHPHRASES[Math.floor(Math.random() * OBJECTION_CATCHPHRASES.length)];
  const CUTIN_ANGLES = ['cutin-angle-br', 'cutin-angle-bl', 'cutin-angle-sr', 'cutin-angle-sl', 'cutin-angle-bc'];
  const chosenAngle = CUTIN_ANGLES[Math.floor(Math.random() * CUTIN_ANGLES.length)];

  if (!gameState.stg0) gameState.stg0 = {};
  gameState.stg0.buzzedBy = myName;
  gameState.stg0.buzzedAvatar = myAvatar;
  gameState.stg0.buzzedAvatarConfig = myAvatarConfig;
  gameState.stg0.buzzedRole = myRole;
  gameState.stg0.objectionQuote = quote;
  gameState.stg0.cutinAngle = chosenAngle;
  gameState.stg0.isPaused = true;
  gameState.stg0.selectedClueId = null;

  try {
    playSfx('counter');
  } catch(e) {
    playSfx('rebuttal');
  }
  showToast(`⚡ คุณกดคัดค้านสำเร็จ! ${quote}`);
  logCourt(`⚡ [OBJECTION]: [${myName}] กดแย่งจังหวะคัดค้าน! "${quote}"`);

  broadcast({
    type: 'stg0_buzz',
    player: myName,
    avatar: myAvatar,
    avatarConfig: myAvatarConfig,
    role: myRole,
    quote: quote,
    cutinAngle: chosenAngle
  });

  updateStg0CourtDisplay();
  updateAdminStg0Display();
  renderMobileTask('stage0');
}

function stg0ShootClue() {
  if (gameState.stage !== 'stage0') return;
  const sel = document.getElementById('stg0MobileClueSelect');
  const clueId = sel ? sel.value : null;
  const myName = myPlayer ? myPlayer.name : 'ผู้เล่น';

  if (!gameState.stg0) gameState.stg0 = {};
  gameState.stg0.selectedClueId = clueId;
  playSfx('shoot');

  const clue = ALL_CLUES_DATA.find(c => c.id === clueId);
  const clueName = clue ? clue.name : (clueId || 'ข้อสันนิษฐานปากเปล่า');

  showToast(`🎯 ยิงกระสุนความจริง: [${clueId || '-'}] ${clueName}`);
  logCourt(`🎯 [TRUTH BULLET]: [${myName}] ยิงกระสุนความจริง [${clueId || '-'}] ${clueName} ขึ้นจอศาล!`);

  broadcast({
    type: 'stg0_shoot',
    player: myName,
    clueId: clueId,
    clueName: clueName
  });

  updateStg0CourtDisplay();
  updateAdminStg0Display();
  renderMobileTask('stage0');
}

let stg0BurstTimer = null;

function handleStg0Buzz(msg) {
  if (!gameState.stg0) gameState.stg0 = {};
  gameState.stg0.buzzedBy = msg.player;
  gameState.stg0.buzzedAvatar = msg.avatar || '👤';
  gameState.stg0.buzzedAvatarConfig = msg.avatarConfig || null;
  gameState.stg0.buzzedRole = msg.role || 'สุดยอดนักเรียนมัธยมปลาย';
  gameState.stg0.objectionQuote = msg.quote || '⚡ นั่นมันผิดแล้วล่ะ!';
  gameState.stg0.isPaused = true;
  gameState.stg0.selectedClueId = null;
  gameState.stg0.objectionPhase = 'burst';

  const BURST_POSITIONS = ['burst-pos-1', 'burst-pos-2', 'burst-pos-3', 'burst-pos-4'];
  gameState.stg0.burstPos = BURST_POSITIONS[Math.floor(Math.random() * BURST_POSITIONS.length)];

  if (stg0BurstTimer) {
    clearTimeout(stg0BurstTimer);
    stg0BurstTimer = null;
  }
  stg0BurstTimer = setTimeout(() => {
    if (gameState.stg0 && gameState.stg0.buzzedBy) {
      gameState.stg0.objectionPhase = 'explanation';
      updateStg0CourtDisplay();
    }
  }, 1800);

  if (currentView === 'admin') {
    updateAdminStg0Display();
    return;
  }

  try {
    playSfx('counter');
  } catch(e) {
    playSfx('rebuttal');
  }
  const courtEl = document.getElementById('viewCourt');
  if (courtEl) {
    courtEl.classList.remove('court-objection-shake');
    void courtEl.offsetWidth;
    courtEl.classList.add('court-objection-shake');
  }
  logCourt(`⚡ [OBJECTION]: [${msg.player}] กดแย่งจังหวะคัดค้าน! "${msg.quote}"`);
  updateStg0CourtDisplay();
  updateAdminStg0Display();
  if (currentView === 'player' || gameState.stage === 'stage0') {
    renderMobileTask('stage0');
  }
}

function handleStg0Shoot(msg) {
  if (!gameState.stg0) gameState.stg0 = {};
  gameState.stg0.selectedClueId = msg.clueId;

  if (currentView === 'admin') {
    updateAdminStg0Display();
    return;
  }

  playSfx('shoot');
  logCourt(`🎯 [TRUTH BULLET]: [${msg.player}] ยิงกระสุนความจริง [${msg.clueId || '-'}] ${msg.clueName || ''} ขึ้นจอศาล!`);
  updateStg0CourtDisplay();
  updateAdminStg0Display();
  if (currentView === 'player' || gameState.stage === 'stage0') {
    renderMobileTask('stage0');
  }
}

function handleStg0Verdict(msg) {
  if (stg0BurstTimer) {
    clearTimeout(stg0BurstTimer);
    stg0BurstTimer = null;
  }
  if (!gameState.stg0) gameState.stg0 = {};
  gameState.stg0.approved = msg.approved;

  if (currentView === 'admin') {
    updateAdminStg0Display();
    return;
  }

  if (msg.approved) {
    playSfx('break');
    const breakLayer = document.getElementById('stg0BreakLayer');
    if (breakLayer) {
      breakLayer.classList.remove('hidden');
      setTimeout(() => {
        if (breakLayer) breakLayer.classList.add('hidden');
      }, 3500);
    }
    if (myPlayer && (myPlayer.name === msg.objector || myPlayer.id === msg.objector)) {
      showToast("💥 BREAK!! ข้อคัดค้านของคุณได้รับการอนุมัติอย่างสมบูรณ์แบบ! (+1 Credibility)");
    }
    logCourt(`💥 [BREAK!]: ข้อโต้แย้งถูกหักล้างอย่างสมบูรณ์แบบโดย [${msg.objector}]!`);
  } else {
    playSfx('wrong');
    playSfx('laugh');
    if (myPlayer && (myPlayer.name === msg.objector || myPlayer.id === msg.objector)) {
      showToast("❌ REJECT! ข้อคัดค้านของคุณถูกปฏิเสธโดย DM (-1 Credibility)");
    }
    logCourt(`❌ [REJECT]: ข้อคัดค้านของ [${msg.objector}] ถูกปฏิเสธโดย DM`);
  }

  setTimeout(() => {
    if (msg.approved) {
      const overlay = document.getElementById('stg0ObjectionOverlay');
      if (overlay) overlay.classList.add('hidden');
      const breakLayer = document.getElementById('stg0BreakLayer');
      if (breakLayer) breakLayer.classList.add('hidden');
      if (gameState.stg0) gameState.stg0.objectionPhase = null;
    } else {
      if (gameState.stage === 'stage0') {
        gameState.stg0.buzzedBy = null;
        gameState.stg0.selectedClueId = null;
        gameState.stg0.isPaused = false;
        gameState.stg0.objectionPhase = null;
        const overlay = document.getElementById('stg0ObjectionOverlay');
        if (overlay) overlay.classList.add('hidden');
        updateStg0CourtDisplay();
        updateAdminStg0Display();
        if (currentView === 'player' || gameState.stage === 'stage0') {
          renderMobileTask('stage0');
        }
      }
    }
  }, msg.approved ? 3500 : 2000);
}

function handleStg0Resume() {
  if (stg0BurstTimer) {
    clearTimeout(stg0BurstTimer);
    stg0BurstTimer = null;
  }
  if (!gameState.stg0) gameState.stg0 = {};
  gameState.stg0.buzzedBy = null;
  gameState.stg0.selectedClueId = null;
  gameState.stg0.isPaused = false;
  gameState.stg0.objectionPhase = null;

  if (currentView === 'admin') {
    updateAdminStg0Display();
    return;
  }

  const overlay = document.getElementById('stg0ObjectionOverlay');
  if (overlay) overlay.classList.add('hidden');
  const breakLayer = document.getElementById('stg0BreakLayer');
  if (breakLayer) breakLayer.classList.add('hidden');
  updateStg0CourtDisplay();
  updateAdminStg0Display();
  if (currentView === 'player' || gameState.stage === 'stage0') {
    renderMobileTask('stage0');
  }
}

function updateAdminStg0Display() {
  const badge = document.getElementById('adminStg0StatusBadge');
  const objInfo = document.getElementById('adminStg0ObjectorInfo');
  const bulletInfo = document.getElementById('adminStg0BulletInfo');
  const btnPass = document.getElementById('btnAdminStg0Pass');
  const btnFail = document.getElementById('btnAdminStg0Fail');

  if (!badge || !objInfo || !bulletInfo) return;

  if (gameState.stg0 && gameState.stg0.buzzedBy) {
    badge.innerText = '⚡ แย่งจังหวะคัดค้านแล้ว!';
    badge.style.background = '#e02475';
    badge.style.color = '#fff';
    objInfo.innerHTML = `ผู้คัดค้าน: <strong style="color:#00f0ff;">${gameState.stg0.buzzedBy}</strong> (${gameState.stg0.buzzedRole || 'นักเรียน'})<br><span style="color:#ff4081; font-style:italic;">"${gameState.stg0.objectionQuote || ''}"</span>`;

    if (gameState.stg0.selectedClueId) {
      const clue = ALL_CLUES_DATA.find(c => c.id === gameState.stg0.selectedClueId);
      bulletInfo.innerHTML = `กระสุนความจริง: <strong style="color:#ffe600;">[${gameState.stg0.selectedClueId}] ${clue ? clue.name : ''}</strong>`;
    } else {
      bulletInfo.innerText = 'กระสุนความจริง: (ผู้เล่นกำลังเลือกกระสุนใน Monopad...)';
    }
    if (btnPass) btnPass.disabled = false;
    if (btnFail) btnFail.disabled = false;
  } else {
    badge.innerText = 'กำลังหมุนเวียนบทพูด...';
    badge.style.background = '#222';
    badge.style.color = '#aaa';
    objInfo.innerText = 'ยังไม่มีผู้เล่นกดคัดค้าน (รอผู้เล่นกดแย่งจังหวะบน Monopad)';
    bulletInfo.innerText = 'กระสุนความจริง: -';
    if (btnPass) btnPass.disabled = true;
    if (btnFail) btnFail.disabled = true;
  }
}

function adminStg0Verdict(approved) {
  if (gameState.stage !== 'stage0') return;
  const objector = gameState.stg0?.buzzedBy || 'ผู้เล่น';
  const clueId = gameState.stg0?.selectedClueId || '-';

  if (approved) {
    playSfx('break');
    const breakLayer = document.getElementById('stg0BreakLayer');
    if (breakLayer) {
      breakLayer.classList.remove('hidden');
      setTimeout(() => {
        if (breakLayer) breakLayer.classList.add('hidden');
      }, 3500);
    }
    adminAdjustPlayerCred(objector, 1);
    logCourt(`💥 [BREAK!]: ข้อโต้แย้งถูกหักล้างอย่างสมบูรณ์แบบโดย [${objector}]! (+1 Credibility)`);
    showToast(`✅ DM อนุมัติ BREAK! ให้กับ [${objector}] เรียบร้อย`);
  } else {
    playSfx('wrong');
    playSfx('laugh');
    adminAdjustPlayerCred(objector, -1);
    logCourt(`❌ [REJECT]: ข้อคัดค้านของ [${objector}] ถูกปฏิเสธโดย DM (-1 Credibility)`);
    showToast(`❌ DM ปฏิเสธข้อคัดค้านของ [${objector}]`);
  }

  broadcast({
    type: 'stg0_verdict',
    approved: approved,
    objector: objector,
    clueId: clueId
  });

  if (approved) {
    // When ✅ BREAK! (Approved): After 3.5s dramatic glass break animation, return to ⚖️ Class Trial!
    setTimeout(() => {
      adminSetGame('trial');
    }, 3500);
  } else {
    // When ❌ REJECT (Denied): Resume Non-Stop Debate rotation loop after 2.0s so debate continues!
    setTimeout(() => {
      adminStg0Resume();
    }, 2000);
  }
}

function adminStg0Resume() {
  if (gameState.stage !== 'stage0') return;
  if (!gameState.stg0) gameState.stg0 = {};
  gameState.stg0.buzzedBy = null;
  gameState.stg0.selectedClueId = null;
  gameState.stg0.isPaused = false;
  const overlay = document.getElementById('stg0ObjectionOverlay');
  if (overlay) overlay.classList.add('hidden');
  const breakLayer = document.getElementById('stg0BreakLayer');
  if (breakLayer) breakLayer.classList.add('hidden');

  broadcast({ type: 'stg0_resume' });

  updateStg0CourtDisplay();
  updateAdminStg0Display();
  renderMobileTask('stage0');
  showToast("🔄 ปลดล็อกและหมุนเวียนบทพูดต่อเรียบร้อย");
}

function renderMobileStage0Task() {
  const area = document.getElementById('mobileTaskArea');
  if (!area) return;
  if (!gameState.stg0) gameState.stg0 = {};

  const myName = myPlayer ? myPlayer.name : '';
  const isBuzzedByMe = Boolean(myName && gameState.stg0.buzzedBy === myName);
  const isBuzzedByOther = Boolean(gameState.stg0.buzzedBy && !isBuzzedByMe);

  let html = `
    <div class="stg0-mobile-container">
      <div class="slanted-banner pink" style="font-size:0.95rem; margin-bottom:4px;">
        🎮 NON-STOP DEBATE // การถกเถียงต่อเนื่อง
      </div>
      <div class="stg0-mobile-topic-card">
        <div style="font-size:0.75rem; color:#ff4081; font-weight:900;">🗣️ หัวข้อการโต้แย้งในศาล:</div>
        <div style="font-size:0.95rem; color:#fff; font-weight:800; margin-top:2px;">
          ${gameState.stg0.topic || 'ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.'}
        </div>
      </div>
  `;

  if (!gameState.stg0.buzzedBy) {
    html += `
      <div class="stg0-buzzer-wrap">
        <button class="stg0-giant-buzzer" onclick="stg0PressBuzzer()">
          <span style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:1.8rem;">⚡</span>
            <span>คัดค้าน! (OBJECTION!)</span>
          </span>
          <span class="stg0-buzzer-sub">แตะเพื่อแย่งจังหวะคัดค้านข้อความที่กำลังลอยบนจอใหญ่</span>
        </button>
      </div>
      <div style="text-align:center; font-size:0.8rem; color:#94a3b8; line-height:1.4;">
        💡 ฟังคำให้การและมองข้อความบนจอ หากพบจุดขัดแย้งกับหลักฐาน ให้แตะปุ่มด้านบนทันที!
      </div>
    `;
  } else if (isBuzzedByMe) {
    // RESTRICTION: ONLY clues the player personally discovered!
    const unlockedIds = getUnlockedClues();
    const myClues = ALL_CLUES_DATA.filter(c => unlockedIds.includes(c.id));

    let optionsHtml = '';
    if (myClues.length === 0) {
      optionsHtml = '<option value="">(คุณยังไม่มีเบาะแสใน Monopad - ใช้การโต้แย้งปากเปล่า)</option>';
    } else {
      optionsHtml = myClues.map(c => `<option value="${c.id}" ${gameState.stg0.selectedClueId === c.id ? 'selected' : ''}>[${c.id}] ${getClueDisplayName(c)} (${getClueDisplayLoc(c)})</option>`).join('');
    }

    const myAvConfig = myPlayer?.avatarConfig || currentAvatarConfig;
    const myAvHtml = renderAvatarSvg(myAvConfig, 88, true);

    html += `
      <!-- Character Avatar Objection Rising Cut-In -->
      <div class="stg0-mobile-cutin-card by-me">
        <div class="stg0-mobile-avatar-rise">
          ${myAvHtml}
        </div>
        <div class="stg0-mobile-cutin-details">
          <div class="stg0-mobile-badge-objection">⚡ คุณลุกขึ้นคัดค้าน! (OBJECTION!)</div>
          <div class="stg0-mobile-quote">"${gameState.stg0.objectionQuote || '⚡ นั่นผิดแล้ว!'}"</div>
          <div class="stg0-mobile-hint">📢 อธิบายเหตุผลที่โต๊ะ แล้วเลือกกระสุนความจริงยิงขึ้นจอ:</div>
        </div>
      </div>

      <div class="stg0-objector-action-card">
        <div style="margin-bottom:10px;">
          <label style="font-size:0.8rem; color:#ffe600; font-weight:bold;">🎯 กระสุนความจริงที่คุณครอบครอง (${myClues.length} ชิ้น):</label>
          <select id="stg0MobileClueSelect" class="stg0-clue-select" style="width:100%; margin-top:4px;">
            ${optionsHtml}
          </select>
        </div>
        <button class="p-task-btn" onclick="stg0ShootClue()" style="background:linear-gradient(135deg,#ffe600,#ff0055); color:#000; font-weight:900; font-size:1rem; border:none; padding:12px; width:100%; border-radius:8px; box-shadow:0 0 15px rgba(255,230,0,0.5); cursor:pointer;">
          🎯 ยิงกระสุนความจริง (FIRE TRUTH BULLET!)
        </button>
      </div>
    `;
  } else {
    const otherAvConfig = gameState.stg0.buzzedAvatarConfig;
    const otherAvHtml = otherAvConfig ? renderAvatarSvg(otherAvConfig, 88) : `<div style="font-size:3rem; line-height:88px; text-align:center;">${gameState.stg0.buzzedAvatar || '👤'}</div>`;

    html += `
      <!-- Other Player Objection Rising Cut-In -->
      <div class="stg0-mobile-cutin-card by-other">
        <div class="stg0-mobile-avatar-rise">
          ${otherAvHtml}
        </div>
        <div class="stg0-mobile-cutin-details">
          <div class="stg0-mobile-badge-locked">🔒 [${escapeHtml(gameState.stg0.buzzedBy)}] ลุกขึ้นคัดค้าน!</div>
          <div style="font-size:0.8rem; color:var(--mono-cyan); font-weight:700; margin-bottom:2px;">${escapeHtml(gameState.stg0.buzzedRole || 'ผู้ร่วมอภิปราย')}</div>
          <div class="stg0-mobile-quote">"${escapeHtml(gameState.stg0.objectionQuote || 'ขอคัดค้าน!')}"</div>
          <div class="stg0-mobile-hint">โปรดฟังเหตุผลการหักล้างของเพื่อนที่โต๊ะจริง และรอผลการตัดสินจาก DM</div>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  area.innerHTML = html;
}

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
      const isCorrect = (s.clueId === target);
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
    if (s.clueId === target) {
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
    showMinigameResult(
      false,
      "OBJECTION FAILED!",
      `หลักฐานที่ส่งเข้ามาไม่ตรงกับจุดพิรุธ`,
      `ไม่มีใครส่งหลักฐาน [${target}] เลย`
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
  return Object.values(gameState.players || {}).filter(p => !p.isAdmin && p.role !== 'DM' && p.name !== 'DM');
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
    updateHangmanHealthDisplay();
    playSfx('wrong');

    if (gameState.stg2Mistakes >= (gameState.stg2MaxMistakes || 5)) {
      stopTimer();
      showMinigameResult(
        false,
        "INTEGRITY EXHAUSTED!",
        "เดาตัวอักษรผิดพลาดจนหมดโควตา!",
        "ไม่สามารถถอดรหัสคำศัพท์เพื่อเปิดโปงกลไกได้"
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
    nameEl.innerText = activeP ? activeP.name : 'กำลังเชื่อมต่อผู้เล่น...';
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

function triggerRebuttalVerdict(isWin, skipBroadcast = false, meta = null) {
  stopTimer();
  const challenger = (meta && meta.challenger) || gameState.stg3Challenger || 'ฝ่ายโจมตี';
  const opponent = (meta && meta.opponent) || gameState.stg3Opponent || 'ฝ่ายรับมือ';
  const stmtEl = document.getElementById('rebuttalStatement');
  const topic = (meta && meta.topic) || gameState.stg3Topic || (stmtEl ? stmtEl.innerText.replace(/^"|"$/g, '').trim() : 'ข้ออ้างที่อยู่เวลาเกิดเหตุ');

  if (isWin) {
    const winnerName = (meta && meta.winner) || challenger;
    const clueText = (meta && meta.clue) || gameState.stg3LeftClue || 'หลักฐานหักล้างข้ออ้าง';
    playSfx('counter');
    setTimeout(() => {
      showMinigameResult(
        true,
        "BLADE OF TRUTH!",
        `[${winnerName}] ชนะเรื่อง: "${topic}" ด้วยหลักฐาน: ${clueText}!`,
        "ข้ออ้างของฝ่ายรับมือถูกฟันทำลายอย่างราบคาบ ความจริงกระจ่างขึ้นแล้ว!"
      );
    }, 400);
    if (!skipBroadcast) {
      broadcast({
        type: 'rebuttal_verdict',
        isWin: true,
        winner: winnerName,
        topic: topic,
        clue: clueText,
        challenger: challenger,
        opponent: opponent
      });
    }
  } else {
    const winnerName = (meta && meta.winner) || opponent;
    const clueText = (meta && meta.clue) || gameState.stg3RightClue || 'หลักฐานยืนยันความบริสุทธิ์';
    playSfx('counter');
    setTimeout(() => {
      showMinigameResult(
        true,
        "COUNTER SHIELD DEFENSE!",
        `[${winnerName}] ชนะเรื่อง: "${topic}" ด้วยหลักฐาน: ${clueText}!`,
        "ฝ่ายรับมือสามารถปัดป้องและยืนยันข้อโต้แย้งของตนได้สำเร็จ!"
      );
    }, 400);
    if (!skipBroadcast) {
      broadcast({
        type: 'rebuttal_verdict',
        isWin: false,
        winner: winnerName,
        topic: topic,
        clue: clueText,
        challenger: challenger,
        opponent: opponent
      });
    }
  }
}

function adminRebuttalVerdict(isWin) {
  triggerRebuttalVerdict(isWin, false);
}


function populateAllConfigStageSelects() {
  const connectedPlayers = Object.values(gameState.players || {});
  
  // Standard canonical courtroom characters for Danganronpa TTRPG
  const standardCharacters = [
    { name: 'ฮิฟุมิ ยามาดะ', role: 'PC 5 - สุดยอดนักเขียนโดจิน [Blackened/คนร้าย]' },
    { name: 'นาเอกิ มาโคโตะ', role: 'PC 1 - สุดยอดนักเรียนดวงดี' },
    { name: 'คิริกิริ เคียวโกะ', role: 'PC 2 - สุดยอดนักสืบ' },
    { name: 'โทกามิ เบียคุยะ', role: 'PC 3 - สุดยอดทายาทตระกูลดัง' },
    { name: 'อาซาฮินะ อาโออิ', role: 'PC 4 - สุดยอดนักว่ายน้ำ' },
  ];

  const npcCharacters = [
    { name: 'โมโนคุมะ (Monokuma)', role: 'NPC ผู้อำนวยการโรงเรียน' },
    { name: 'ผู้บงการปริศนา (Mastermind)', role: 'NPC ปริศนาเบื้องหลัง' }
  ];

  const buildOptionsHtml = (isAccused = false, allowBlank = false) => {
    let html = '';
    if (allowBlank) {
      html += `<option value="">${isAccused ? '-- เลือกฝ่ายตรงข้าม / ผู้ถูกกล่าวหา --' : '(ทุกคนในห้อง / อิสระ)'}</option>`;
    }
    const onlineAccused = isAccused ? connectedPlayers.find(p => p.isKiller || parseInt(p.pcSlot, 10) === 5 || (p.name && (p.name.includes('ฮิฟุมิ') || p.name.includes('Hifumi')))) : null;

    if (connectedPlayers.length > 0) {
      html += '<optgroup label="🟢 ผู้เล่นที่เชื่อมต่ออยู่ (Online Players)">';
      connectedPlayers.forEach(p => {
        const charSuffix = p.characterName ? ` (${p.characterName})` : '';
        const isSelected = Boolean(onlineAccused && p.id === onlineAccused.id);
        html += `<option value="${escapeHtml(p.name)}"${isSelected ? ' selected' : ''}>${escapeHtml(p.name)}${escapeHtml(charSuffix)}</option>`;
      });
      html += '</optgroup>';
    }
    
    html += '<optgroup label="👤 ตัวละครประจำห้องพิจารณาคดี (PC 1 - PC 5)">';
    standardCharacters.forEach(c => {
      const isDefault = isAccused && !onlineAccused && c.name.includes('ฮิฟุมิ');
      html += `<option value="${escapeHtml(c.name)}"${isDefault ? ' selected' : ''}>${escapeHtml(c.name)} - ${escapeHtml(c.role)}</option>`;
    });
    html += '</optgroup>';

    html += '<optgroup label="🐻 ตัวละครพิเศษ / NPC">';
    npcCharacters.forEach(n => {
      html += `<option value="${escapeHtml(n.name)}">${escapeHtml(n.name)} - ${escapeHtml(n.role)}</option>`;
    });
    html += '</optgroup>';

    html += '<option value="__custom__">✏️ [พิมพ์ชื่อกำหนดเอง...]</option>';
    return html;
  };

  // 1. Stage 6 Accused Selects (Config modal & Admin panel)
  const cfg6Sel = document.getElementById('cfgStg6TargetSelect');
  const adm6Sel = document.getElementById('adminArmamentTargetSelect');
  [cfg6Sel, adm6Sel].forEach(sel => {
    if (!sel) return;
    const curVal = sel.value;
    sel.innerHTML = buildOptionsHtml(true, false);
    if (curVal && curVal !== '__custom__') {
      for (let opt of sel.options) {
        if (opt.value === curVal || (curVal && opt.text.includes(curVal))) {
          sel.value = opt.value;
          break;
        }
      }
    }
  });

  // 2. Stage 3 Rebuttal Selects (Challenger & Opponent)
  const chalSel = document.getElementById('cfgStg3ChallengerSelect');
  const oppSel = document.getElementById('cfgStg3OpponentSelect');
  const admChalSel = document.getElementById('adminRebuttalChallengerSelect');
  const admOppSel = document.getElementById('adminRebuttalOpponentSelect');

  if (chalSel) {
    const curVal = chalSel.value;
    chalSel.innerHTML = buildOptionsHtml(false, false);
    if (curVal && curVal !== '__custom__') {
      for (let opt of chalSel.options) {
        if (opt.value === curVal || (curVal && opt.text.includes(curVal))) {
          chalSel.value = opt.value;
          break;
        }
      }
    } else if (!curVal) {
      if (connectedPlayers.length > 0) chalSel.value = connectedPlayers[0].name;
      else chalSel.value = 'นาเอกิ มาโคโตะ';
    }
  }

  if (oppSel) {
    const curVal = oppSel.value;
    oppSel.innerHTML = buildOptionsHtml(true, false);
    if (curVal && curVal !== '__custom__') {
      for (let opt of oppSel.options) {
        if (opt.value === curVal || (curVal && opt.text.includes(curVal))) {
          oppSel.value = opt.value;
          break;
        }
      }
    } else if (!curVal) {
      oppSel.value = 'ฮิฟุมิ ยามาดะ';
    }
  }

  // Admin panel rebuttal selects
  if (admChalSel) {
    const curVal = admChalSel.value;
    admChalSel.innerHTML = buildOptionsHtml(false, true);
    if (curVal) {
      for (let opt of admChalSel.options) {
        if (opt.value === curVal || opt.text.includes(curVal)) {
          admChalSel.value = opt.value;
          break;
        }
      }
    }
  }
  if (admOppSel) {
    const curVal = admOppSel.value;
    admOppSel.innerHTML = buildOptionsHtml(true, true);
    if (curVal) {
      for (let opt of admOppSel.options) {
        if (opt.value === curVal || opt.text.includes(curVal)) {
          admOppSel.value = opt.value;
          break;
        }
      }
    }
  }
}

function handleStageConfigCustomSelectToggle(selectId, customWrapId) {
  const sel = document.getElementById(selectId);
  const wrap = document.getElementById(customWrapId);
  if (!sel || !wrap) return;
  if (sel.value === '__custom__') {
    wrap.classList.remove('hidden');
    const input = wrap.querySelector('input');
    if (input) {
      input.focus();
    }
  } else {
    wrap.classList.add('hidden');
  }
}

function setSelectOrCustom(selectEl, customWrapEl, customInputEl, value) {
  if (!selectEl || !value) return;
  let found = false;
  for (let opt of selectEl.options) {
    if (opt.value === value || (value && opt.text && (opt.text === value || opt.text.includes(value) || opt.value.includes(value)))) {
      selectEl.value = opt.value;
      found = true;
      break;
    }
  }
  if (found) {
    if (customWrapEl) customWrapEl.classList.add('hidden');
  } else {
    selectEl.value = '__custom__';
    if (customWrapEl) customWrapEl.classList.remove('hidden');
    if (customInputEl) customInputEl.value = value;
  }
}

function getSelectOrCustomValue(selectEl, customInputEl) {
  if (!selectEl) return '';
  if (selectEl.value === '__custom__') {
    return customInputEl ? customInputEl.value.trim() : '';
  }
  return selectEl.value;
}

function populateArmamentTargetSelect() {
  populateAllConfigStageSelects();
}

function populateRebuttalSelects() {
  populateAllConfigStageSelects();
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
      question: "ร่างของเรียวตะถูกดึงขึ้นไปแขวนติดเพดานห้องซักผ้าได้อย่างไร?",
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
      question: "สาเหตุการเสียชีวิตที่แท้จริงของเรียวตะคืออะไร?",
      choices: {
        A: "จมน้ำขาดอากาศหายใจในถัง",
        B: "ถูกกะโหลกแตกด้วยหม้อสตูว์",
        C: "ขาดอากาศหายใจจากการถูกเชือกดึงแขวนติดเพดาน"
      },
      correct: "C"
    }
  ],
  twist: [
    {
      step: 1,
      question: "มีดพกในกระเป๋าเสื้อของเรียวตะกับรอยตัดที่เชือกไนลอน หมายความว่าอย่างไร?",
      choices: {
        A: "คนร้ายใช้มีดของเรียวตะตัดเชือกเพื่ออำพราง",
        B: "เรียวตะฟื้นสติขึ้นมา และใช้มีดพกตัดเชือกตัวเองจนรอดแล้ว!",
        C: "เชือกขาดเองเพราะรับน้ำหนักไม่ไหว"
      },
      correct: "B"
    },
    {
      step: 2,
      question: "ถ้าเรียวตะรอดแล้ว ทำไมถึงมีเงื่อนโบว์ไลน์ผูกติดอยู่กับสายรัดลำตัวใต้เสื้อ?",
      choices: {
        A: "เรียวตะพยายามปีนหนีออกไปทางเพดาน",
        B: "เรียวตะผูกสายรัดลำตัวเพื่อแกล้งจัดฉากว่าตัวเองถูกแขวนคอหลอก!",
        C: "คนร้ายกลับเข้ามาผูกเชือกให้ใหม่"
      },
      correct: "B"
    },
    {
      step: 3,
      question: "แล้วทำไมเรียวตะถึงคอหักตายจริงๆ และศพยังค้างอยู่บนเพดาน ทั้งที่ถังน้ำตกแตกแล้ว!?",
      choices: {
        A: "แรงกระชาก Shock Load ดึงเงื่อนหลุดมารัดคอ และปมเชือกขัดติดแน่นคาราวท่อเพดาน (Stopper Knot)!",
        B: "เรียวตะถูกวางยาพิษไซยาไนด์จนหมดแรง",
        C: "มีคนแอบมาดึงเชือกซ้ำตอน 21:00 น."
      },
      correct: "A"
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
    playSfx('wrong');

    const crashNotice = document.getElementById('diveCrashNotice');
    if (crashNotice) {
      crashNotice.classList.remove('hidden');
      crashNotice.style.display = 'block';
      crashNotice.innerText = `💥 ชนผนังอุโมงค์! เสียงข้างมากเลือกข้อ [${winningChoice}] ซึ่งเป็นทางตัน`;
    }

    const lane = document.getElementById('lane' + winningChoice);
    if (lane) lane.classList.add('mismatch');

    gameState.stg4Evaluating = false;
    logCourt(`⚠️ [LOGIC DIVE CRASH]: เสียงข้างมากเลือกข้อ [${winningChoice}] ผิดทาง! ชนผนังอุโมงค์`);
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

// 4.5. FLASH DECISION: QUICK QUESTION (คำถามตรรกะสั้น 1 ข้อ)
// ==========================================================
const QUICK_QUESTION_PRESETS = {
  attack_time: {
    question: "เวลาที่เหยื่อเรียวตะถูกลอบทำร้ายจนสลบในครัวคือช่วงเวลาใด!?",
    choices: {
      A: "17:30 น. (ช่วงเตรียมอาหารเย็น)",
      B: "19:00 น. (ช่วงเริ่มรับประทานอาหาร)",
      C: "20:30 น. (ช่วงหลังมื้ออาหารค่ำ)"
    },
    correct: "A"
  },
  death_cause: {
    question: "สาเหตุการเสียชีวิตที่แท้จริงของเรียวตะคืออะไร!?",
    choices: {
      A: "กะโหลกศีรษะแตกจากกระดูกหมู",
      B: "ขาดอากาศหายใจจากการถูกแขวนคอ",
      C: "พิษจากสารเคมีในน้ำยาซักผ้า"
    },
    correct: "B"
  },
  auto_pulley: {
    question: "กลไกใดที่ทำให้ร่างของเหยื่อถูกดึงขึ้นแขวนเพดานโดยที่คนร้ายไม่ต้องอยู่ในห้องซักรีด!?",
    choices: {
      A: "สวิตช์เครื่องซักผ้าอัตโนมัติ",
      B: "รอกถ่วงน้ำหนักด้วยถังน้ำนอกหน้าต่าง",
      C: "ระบบสปริงเกลอร์ดับเพลิง"
    },
    correct: "B"
  },
  dryer_sound: {
    question: "เสียงกระแทกตึงตังเวลา 21:00 น. ในห้องซักรีดแท้จริงแล้วเกิดจากสิ่งใด!?",
    choices: {
      A: "การต่อสู้ระหว่างคนร้ายกับเหยื่อ",
      B: "รองเท้าผ้าใบที่ถูกตั้งเวลาหมุนในเครื่องอบผ้า",
      C: "ถังน้ำภายนอกหล่นกระแทกพื้น"
    },
    correct: "B"
  },
  blackened_truth: {
    question: "ตามกฎของ Monokuma ใครคือผู้กระทำการชี้ขาด (Blackened) ที่ต้องถูกโหวตประหาร!?",
    choices: {
      A: "Trapper ผู้วางแผนและเซ็ตกับดักน้ำ",
      B: "เรียวตะ ผู้ตัดเชือกรอดแล้วจัดฉากผูกบ่วงรัดคอตัวเอง",
      C: "ไม่มีใครผิด เป็นเหตุสุดวิสัยจากอาคารเรียน"
    },
    correct: "B"
  }
};

function applyPresetQuickQuestion(presetId, isSilent) {
  if (presetId === '__custom__') return;
  if (gameState.customStages && gameState.customStages['quick_question'] && !isSilent) {
    delete gameState.customStages['quick_question'];
  }
  const p = QUICK_QUESTION_PRESETS[presetId];
  if (!p) return;
  const qEl = document.getElementById('cfgQqQuestion');
  const aEl = document.getElementById('cfgQqChoiceA');
  const bEl = document.getElementById('cfgQqChoiceB');
  const cEl = document.getElementById('cfgQqChoiceC');
  const corrEl = document.getElementById('cfgQqCorrect');
  if (qEl) qEl.value = p.question;
  if (aEl) aEl.value = p.choices.A;
  if (bEl) bEl.value = p.choices.B;
  if (cEl) cEl.value = p.choices.C;
  if (corrEl) corrEl.value = p.correct;

  const sel = document.getElementById('adminQqPresetSelect');
  if (sel && sel.value !== presetId) sel.value = presetId;

  const badge = document.getElementById('qqCardDesc');
  const labels = {
    attack_time: '⏱️ เวลาทำร้ายในครัว (17:30)',
    death_cause: '💀 เหตุตายจริง (ขาดอากาศ)',
    auto_pulley: '🛢️ กลไกชักรอก (ถังน้ำหนัก)',
    dryer_sound: '👟 เสียง 21:00 น. (รองเท้าบูท)',
    blackened_truth: '⚖️ กฎ Blackened ตัวจริง (โหวตเรียวตะ)'
  };
  const badgeText = labels[presetId] || `⚡ ${p.question.slice(0, 30)}...`;
  if (badge) {
    badge.innerText = badgeText;
    if (!isSilent && typeof flashPresetBadge === 'function') flashPresetBadge('qqCardDesc');
  }
  if (!isSilent) showToast(`⚡ Quick Question: ${badgeText}`);
}

function adminStartQuickQuestion() {
  if (gameState.customStages && gameState.customStages['quick_question']) {
    const config = gameState.customStages['quick_question'];
    setStage('quick_question', config);
    broadcast({ type: 'set_stage', stage: 'quick_question', config: config });
    closeAdminMinigameModal();
    logCourt(`⚡ [FLASH DECISION]: DM เริ่มต้นช่วงตอบคำถามสั้น 1 ข้อ (Custom): "${config.question}"`);
    return;
  }
  const q = document.getElementById('cfgQqQuestion')?.value || 'เวลาที่เหยื่อเรียวตะถูกลอบทำร้ายจนสลบในครัวคือช่วงเวลาใด!?';
  const cA = document.getElementById('cfgQqChoiceA')?.value || '17:30 น. (ช่วงเตรียมอาหารเย็น)';
  const cB = document.getElementById('cfgQqChoiceB')?.value || '19:00 น. (ช่วงเริ่มรับประทานอาหาร)';
  const cC = document.getElementById('cfgQqChoiceC')?.value || '20:30 น. (ช่วงหลังมื้ออาหารค่ำ)';
  const corr = document.getElementById('cfgQqCorrect')?.value || 'A';
  const config = {
    id: 'qq_' + Date.now(),
    question: q,
    choices: { A: cA, B: cB, C: cC },
    correct: corr
  };
  setStage('quick_question', config);
  broadcast({ type: 'set_stage', stage: 'quick_question', config: config });
  closeAdminMinigameModal();
  logCourt(`⚡ [FLASH DECISION]: DM เริ่มต้นช่วงตอบคำถามสั้น 1 ข้อ: "${config.question}"`);
}

function adminRevealQuickQuestion() {
  if (!gameState.qqData) return;
  gameState.qqData.revealed = true;
  gameState.qqData.revealing = false;

  const qq = gameState.qqData;
  const votes = qq.votes || {};
  const counts = { A: 0, B: 0, C: 0 };
  Object.values(votes).forEach(v => {
    if (counts[v] !== undefined) counts[v]++;
  });

  // Calculate majority choice
  let majorityChoice = 'A';
  let maxVotes = -1;
  ['A', 'B', 'C'].forEach(ch => {
    if (counts[ch] > maxVotes) {
      maxVotes = counts[ch];
      majorityChoice = ch;
    }
  });

  const isMajorityCorrect = (majorityChoice === qq.correct);

  updateQuickQuestionDisplay();
  if (currentView === 'player' && gameState.stage === 'quick_question') {
    renderMobileTask('quick_question');
  }

  broadcast({
    type: 'qq_reveal',
    majorityChoice: majorityChoice,
    isMajorityCorrect: isMajorityCorrect
  });

  playSfx(isMajorityCorrect ? 'correct' : 'wrong');
  const correctTxt = qq.choices && qq.choices[qq.correct] ? qq.choices[qq.correct] : '';
  logCourt(`🏁 [FLASH DECISION REVEAL]: เฉลยคำตอบข้อ [${qq.correct}] ${correctTxt} | มติเสียงข้างมากเลือกข้อ [${majorityChoice}] (${isMajorityCorrect ? 'ถูกต้อง ✅' : 'ขัดแย้ง ❌'})`);
}

function sendQuickQuestionVote(choice) {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิ์ตอบคำถามเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  const voterId = (myPlayer && (myPlayer.id || myPlayer.userHash || myPlayer.name)) || currentUserHash || 'pc';
  const playerName = myPlayer ? myPlayer.name : 'ผู้เล่น';
  if (!gameState.qqData) gameState.qqData = { votes: {} };
  if (!gameState.qqData.votes) gameState.qqData.votes = {};
  gameState.qqData.votes[voterId] = choice;
  playSfx('button');
  broadcast({ type: 'qq_vote', choice: choice, voterId: voterId, playerName: playerName });
  updateQuickQuestionDisplay();
  if (currentView === 'player' && gameState.stage === 'quick_question') {
    renderMobileTask('quick_question');
  }
  checkQuickQuestionAutoReveal();
}

function checkQuickQuestionAutoReveal() {
  if (!gameState.qqData || gameState.qqData.revealed || gameState.qqData.revealing) return;
  if (!isHost && currentView !== 'admin') return;

  const votes = gameState.qqData.votes || {};
  const votedCount = Object.keys(votes).length;
  const eligiblePlayers = Object.values(gameState.players || {}).filter(p => {
    const cred = p.credibility !== undefined ? p.credibility : 100;
    return cred > 0;
  });
  const activePlayers = eligiblePlayers.length || Object.keys(gameState.players || {}).length;

  if (activePlayers > 0 && votedCount >= activePlayers) {
    gameState.qqData.revealing = true;
    setTimeout(() => {
      if (gameState.qqData && !gameState.qqData.revealed) {
        adminRevealQuickQuestion();
      }
    }, 500);
  }
}

function updateQuickQuestionDisplay() {
  const qq = gameState.qqData;
  if (!qq) return;
  const qTextEl = document.getElementById('qqQuestionText');
  if (qTextEl) qTextEl.innerText = `"${qq.question}"`;

  const votes = qq.votes || {};
  const isRevealed = Boolean(qq.revealed);
  const eligiblePlayers = Object.values(gameState.players || {}).filter(p => {
    const cred = p.credibility !== undefined ? p.credibility : 100;
    return cred > 0;
  });
  const activePlayers = eligiblePlayers.length || Object.keys(gameState.players || {}).length || 4;
  const votedCount = Object.keys(votes).length;

  const countEl = document.getElementById('qqVotedCount');
  const totalEl = document.getElementById('qqTotalVoters');
  if (countEl) countEl.innerText = votedCount;
  if (totalEl) totalEl.innerText = activePlayers;

  // Count choices
  const counts = { A: 0, B: 0, C: 0 };
  Object.values(votes).forEach(v => {
    if (counts[v] !== undefined) counts[v]++;
  });

  // Determine majority choice
  let majorityChoice = 'A';
  let maxVotes = -1;
  ['A', 'B', 'C'].forEach(ch => {
    if (counts[ch] > maxVotes) {
      maxVotes = counts[ch];
      majorityChoice = ch;
    }
  });

  ['A', 'B', 'C'].forEach(ch => {
    const lane = document.getElementById('qqLane' + ch);
    if (!lane) return;
    const txt = qq.choices && qq.choices[ch] ? qq.choices[ch] : `ตัวเลือก ${ch}`;
    lane.classList.remove('active-match', 'mismatch');
    lane.style.borderColor = '';
    lane.style.background = '';

    if (isRevealed) {
      const isCorrect = (ch === qq.correct);
      if (isCorrect) {
        lane.classList.add('active-match');
        lane.innerHTML = `
          <div class="qq-badge-circle correct">✓</div>
          <div class="qq-choice-label"><strong>ข้อ ${ch}:</strong> ${escapeHtml(txt)}</div>
          <div class="qq-vote-pill correct">✅ คำตอบที่ถูกต้อง (${counts[ch]} โหวต)</div>
        `;
      } else {
        lane.classList.add('mismatch');
        lane.innerHTML = `
          <div class="qq-badge-circle" style="background:#334155; opacity:0.6;">${ch}</div>
          <div class="qq-choice-label" style="opacity:0.6;"><strong>ข้อ ${ch}:</strong> ${escapeHtml(txt)}</div>
          <div class="qq-vote-pill" style="opacity:0.6; border-color:#475569; color:#94a3b8;">${counts[ch]} โหวต</div>
        `;
      }
    } else {
      lane.innerHTML = `
        <div class="qq-badge-circle">${ch}</div>
        <div class="qq-choice-label"><strong>ข้อ ${ch}:</strong> ${escapeHtml(txt)}</div>
        <div class="qq-vote-pill">🗳️ ${counts[ch]} โหวต</div>
      `;
    }
  });

  const tallyBox = document.getElementById('qqVoteTally');
  if (tallyBox) {
    if (isRevealed) {
      tallyBox.innerHTML = `🏁 สรุปผลการลงมติเรียบร้อยแล้ว (${votedCount} จาก ${activePlayers} คนลงคะแนน)`;
      tallyBox.style.color = '#34d399';
    } else {
      tallyBox.innerHTML = `⏳ รอผลการลงมติจากนักเรียนทุกคน... (<span id="qqVotedCount">${votedCount}</span> / <span id="qqTotalVoters">${activePlayers}</span> คนตอบแล้ว)`;
      tallyBox.style.color = '#94a3b8';
    }
  }

  const resNotice = document.getElementById('qqResultNotice');
  if (resNotice) {
    if (isRevealed) {
      resNotice.classList.remove('hidden');
      resNotice.style.display = 'block';
      const correctTxt = qq.choices && qq.choices[qq.correct] ? qq.choices[qq.correct] : '';
      const isMajorityCorrect = (majorityChoice === qq.correct);
      resNotice.className = 'qq-verdict-card';
      resNotice.style.borderColor = isMajorityCorrect ? '#10b981' : '#ef4444';
      resNotice.style.boxShadow = isMajorityCorrect ? '0 0 25px rgba(16, 185, 129, 0.4)' : '0 0 25px rgba(239, 68, 68, 0.4)';
      resNotice.innerHTML = `
        <div style="font-size:1.3rem; font-weight:900; margin-bottom:6px; color:${isMajorityCorrect ? '#34d399' : '#f87171'};">
          ${isMajorityCorrect ? '✨ มติที่ประชุมสรุปได้อย่างถูกต้อง!' : '💥 มติที่ประชุมขัดแย้งกับความเป็นจริง!'}
        </div>
        <div style="font-size:1.05rem; color:#f1f5f9;">
          เฉลยคำตอบที่ถูกต้องคือ: <strong style="color:#00ffff; font-size:1.15rem;">ข้อ [${qq.correct}] ${escapeHtml(correctTxt)}</strong>
        </div>
        <div style="font-size:0.85rem; color:#94a3b8; margin-top:6px;">
          (เสียงข้างมากเลือกข้อ [${majorityChoice}] ทั้งหมด ${counts[majorityChoice]} จาก ${votedCount} เสียง)
        </div>
      `;
    } else {
      resNotice.classList.add('hidden');
      resNotice.style.display = 'none';
    }
  }
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

function playerScrumPush(delta, btnEl) {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิ์ออกแรงดันเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  playSfx('rebuttal_slash');
  broadcast({ type: 'stg5_scrum', delta: delta });
  if (btnEl) {
    btnEl.classList.remove('scrum-tap-active');
    void btnEl.offsetWidth; // trigger reflow
    btnEl.classList.add('scrum-tap-active');
  }
}

// ==========================================================
// 6. ARGUMENT ARMAMENT (RHYTHM BATTLESHIP OVERHAUL)
// ==========================================================

function formatStg6Coord(idx) {
  const row = Math.floor(idx / 4);
  const col = idx % 4;
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

function areStg6CellsAdjacent(c1, c2) {
  if (typeof c1 !== 'number' || typeof c2 !== 'number') return false;
  const min = Math.min(c1, c2);
  const max = Math.max(c1, c2);
  // Horizontal adjacency: same row and difference of 1
  const isHoriz = (max === min + 1) && (Math.floor(min / 4) === Math.floor(max / 4));
  // Vertical adjacency: difference of 4
  const isVert = (max === min + 4);
  return isHoriz || isVert;
}

function generateRandomStg6Placements() {
  for (let attempt = 0; attempt < 300; attempt++) {
    const occupied = new Set();

    function placeShip(size) {
      const isHorizontal = Math.random() < 0.5;
      const rMax = isHorizontal ? 4 : 4 - size + 1;
      const cMax = isHorizontal ? 4 - size + 1 : 4;
      const r = Math.floor(Math.random() * rMax);
      const c = Math.floor(Math.random() * cMax);
      const cells = [];
      for (let i = 0; i < size; i++) {
        const idx = isHorizontal ? (r * 4 + (c + i)) : ((r + i) * 4 + c);
        if (occupied.has(idx)) return null;
        cells.push(idx);
      }
      cells.forEach(idx => occupied.add(idx));
      return cells;
    }

    const arm = placeShip(2);
    if (!arm) continue;

    const leg = placeShip(2);
    if (!leg) continue;

    const core = placeShip(1);
    if (!core) continue;

    const remaining = [];
    for (let i = 0; i < 16; i++) {
      if (!occupied.has(i)) remaining.push(i);
    }
    if (remaining.length < 2) continue;
    remaining.sort(() => Math.random() - 0.5);
    const traps = [remaining[0], remaining[1]];

    return { arm, leg, core, traps, shoulder: leg };
  }

  return {
    arm: [0, 1],
    leg: [8, 12],
    core: [5],
    traps: [10, 15],
    shoulder: [8, 12]
  };
}

function handleStg6SetupSecret(secret, pName) {
  if (gameState.stage !== 'stage6') return;
  // Ensure leg and shoulder compatibility
  if (secret) {
    if (!secret.leg && secret.shoulder) secret.leg = secret.shoulder;
    if (!secret.shoulder && secret.leg) secret.shoulder = secret.leg;
  }
  gameState.stg6Secret = secret;
  gameState.stg6Phase = 'shooting';
  logCourt(`🛡️ [ARMAMENT]: ${pName || gameState.stg6TargetPlayer || 'ผู้ถูกกล่าวหา'} ยืนยันตำแหน่งเกราะ 3 ส่วน (แขน, ขา, แกนหัวใจ) และกับดักสะท้อนเรียบร้อย! เริ่มต้นการระดมยิง!`);
  playSfx('gavel');
  updateStage6Displays();
  renderMobileTask('stage6');
  if (isHost) broadcast({ type: 'sync_state', state: gameState });
}

function handleStg6Shot(shooter, cellIndex, timing) {
  if (gameState.stage !== 'stage6' || gameState.stg6Finished) return;
  if (gameState.stg6Phase === 'placement') {
    gameState.stg6Secret = generateRandomStg6Placements();
    gameState.stg6Phase = 'shooting';
  }

  if (!gameState.stg6Secret) {
    gameState.stg6Secret = generateRandomStg6Placements();
  }

  const sPlayer = shooter || (gameState.stg6Accusers && gameState.stg6Accusers[gameState.stg6CurrentTurnIndex]) || 'ผู้เล่น';

  if (typeof gameState.stg6PoolAmmo !== 'number') {
    gameState.stg6PoolAmmo = 8;
  }

  // Deduct 1 ammo from court shared pool
  gameState.stg6PoolAmmo = Math.max(0, gameState.stg6PoolAmmo - 1);

  // Check Perfect Timing Bonus (+1 Ammo into shared pool, capped at 8)
  if (timing === 'perfect') {
    gameState.stg6PoolAmmo = Math.min(8, gameState.stg6PoolAmmo + 1);
    playSfx('counter');
    logCourt(`🌟 [PERFECT TIMING!]: ${sPlayer} จับจังหวะเพอร์เฟกต์! ได้รับกระสุนความจริงคืนเข้ากองกลาง +1 นัด! (คงเหลือกองกลาง ${gameState.stg6PoolAmmo}/8 นัด)`);
  }

  // Check Miss Timing
  if (timing === 'miss') {
    playSfx('wrong');
    logCourt(`❌ [MISS TIMING!]: ${sPlayer} เล็งพลาดจังหวะ! กระสุนขัดลำกล้อง เสียกระสุนกองกลาง 1 นัด (คงเหลือกองกลาง ${gameState.stg6PoolAmmo}/8 นัด)!`);
  } else {
    // Timing is 'good' or 'perfect'
    let targetIdx = cellIndex;
    if (typeof targetIdx !== 'number' || targetIdx < 0 || targetIdx > 15) {
      const unrevealed = [];
      for (let i = 0; i < 16; i++) {
        if (!gameState.stg6Grid || !gameState.stg6Grid[i]) unrevealed.push(i);
      }
      targetIdx = unrevealed.length > 0 ? unrevealed[0] : 0;
    }

    const coordStr = formatStg6Coord(targetIdx);
    const sec = gameState.stg6Secret || generateRandomStg6Placements();
    let hitType = 'miss';
    let shipKey = null;

    const armCells = sec.arm || [];
    const legCells = sec.leg || sec.shoulder || [];
    const coreCells = sec.core || [];
    const trapCells = sec.traps || [];

    if (armCells.includes(targetIdx)) {
      hitType = 'hit';
      shipKey = 'arm';
    } else if (legCells.includes(targetIdx)) {
      hitType = 'hit';
      shipKey = 'leg';
    } else if (coreCells.includes(targetIdx)) {
      hitType = 'hit';
      shipKey = 'core';
    } else if (trapCells.includes(targetIdx)) {
      hitType = 'trap';
    }

    if (!gameState.stg6Grid) gameState.stg6Grid = Array(16).fill(null);
    gameState.stg6Grid[targetIdx] = hitType;

    if (hitType === 'hit') {
      gameState.stg6BlocksRemaining = Math.max(0, (gameState.stg6BlocksRemaining || 5) - 1);
      if (!gameState.stg6Ships) {
        gameState.stg6Ships = {
          arm: { name: 'เกราะแขน', size: 2, hits: 0, sunk: false },
          leg: { name: 'เกราะขา', size: 2, hits: 0, sunk: false },
          core: { name: 'แกนหัวใจ', size: 1, hits: 0, sunk: false }
        };
      }
      gameState.stg6Ships.shoulder = gameState.stg6Ships.leg;

      if (shipKey && gameState.stg6Ships[shipKey]) {
        gameState.stg6Ships[shipKey].hits = (gameState.stg6Ships[shipKey].hits || 0) + 1;
        if (gameState.stg6Ships[shipKey].hits >= gameState.stg6Ships[shipKey].size) {
          gameState.stg6Ships[shipKey].sunk = true;
          playSfx('break');
          logCourt(`💥 [ARMOR DESTROYED]: ${sPlayer} ยิงเจาะพิกัด [${coordStr}]! เกราะส่วน [${gameState.stg6Ships[shipKey].name}] พังทลายสิ้นเชิง!!`);
        } else {
          playSfx('blade');
          logCourt(`🎯 [DIRECT HIT!]: ${sPlayer} ยิงโดน [${gameState.stg6Ships[shipKey].name}] ที่พิกัด [${coordStr}]! (เกราะรวมเหลือ ${gameState.stg6BlocksRemaining} ช่อง)`);
        }
      }
      gameState.stg6TrapPenaltyActive = false;
    } else if (hitType === 'trap') {
      gameState.stg6TrapPenaltyActive = true;
      playSfx('wrong');
      logCourt(`⚡ [COUNTER-TRAP TRIGGERED!]: ${sPlayer} ยิงโดนกับดักสะท้อนที่พิกัด [${coordStr}]! คนยิงถัดไปจะเจอเข็มสวิงเร็วขึ้น 1.5x และโซนแคบลง 30%!`);
    } else {
      playSfx('splash');
      logCourt(`💦 [SPLASH MISS]: ${sPlayer} ยิงพิกัด [${coordStr}] กระทบพื้นที่ว่างเปล่า!`);
      gameState.stg6TrapPenaltyActive = false;
    }
  }

  // Check Victory Condition (All parts must be destroyed: arm, leg, core)
  const sShips = gameState.stg6Ships || {};
  const isArmSunk = Boolean(sShips.arm?.sunk);
  const isLegSunk = Boolean(sShips.leg?.sunk || sShips.shoulder?.sunk);
  const isCoreSunk = Boolean(sShips.core?.sunk);
  const allShipsSunk = isArmSunk && isLegSunk && isCoreSunk;

  if (allShipsSunk || (gameState.stg6BlocksRemaining <= 0 && isArmSunk && isLegSunk && isCoreSunk)) {
    gameState.stg6FinalReady = true;
    playSfx('break');
    const banner = document.getElementById('armamentFinalBlowBanner');
    if (banner) banner.classList.remove('hidden');
    logCourt(`💥 [ARMAMENT ALL BROKEN]: เกราะการปฏิเสธของคนร้ายพังทลายสิ้นเชิงทั้ง 3 ส่วน (แขน, ขา, แกนหัวใจ)! เล็งยิงกระสุนความจริงนัดสุดท้ายเพื่อปิดฉาก!`);
    if (isHost) broadcast({ type: 'armament_final_ready' });
    updateStage6Displays();
    renderMobileTask('stage6');
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
    return;
  }

  // Check Defeat Condition (Court shared pool out of ammo)
  if (gameState.stg6PoolAmmo <= 0) {
    gameState.stg6Defeat = true;
    playSfx('wrong');
    logCourt(`💀 [OUT OF AMMO]: ฝ่ายศาลใช้กระสุนความจริงกองกลางหมดเกลี้ยงแล้ว! รอ DM รีเซ็ต (Retry) หรือกดบังคับผ่าน (OK)`);
    showMinigameResult(
      false,
      "❌ ไม่สามารถเอาผิดได้!",
      "กระสุนความจริงกองกลางหมดเกลี้ยง ไม่สามารถทลายเกราะของผู้ถูกกล่าวหาได้ทันเวลา",
      "รอผู้ดูแลศาล (DM) ตัดสินใจเริ่มใหม่ (Retry) หรือปรับบทลงโทษ"
    );
    updateStage6Displays();
    renderMobileTask('stage6');
    if (isHost) broadcast({ type: 'sync_state', state: gameState });
    return;
  }

  // Advance turn to next accuser
  const accusers = gameState.stg6Accusers || [];
  if (accusers.length > 0) {
    let curIdx = typeof gameState.stg6CurrentTurnIndex === 'number' ? gameState.stg6CurrentTurnIndex : 0;
    gameState.stg6CurrentTurnIndex = (curIdx + 1) % accusers.length;
    // Safety guard: ensure turn never lands on defendant!
    let skipCount = 0;
    while (skipCount < accusers.length) {
      const nextShooter = accusers[gameState.stg6CurrentTurnIndex] || '';
      const tgt = gameState.stg6TargetPlayer || '';
      if (nextShooter && tgt && (nextShooter === tgt || tgt.includes(nextShooter) || nextShooter.includes(tgt))) {
        gameState.stg6CurrentTurnIndex = (gameState.stg6CurrentTurnIndex + 1) % accusers.length;
        skipCount++;
      } else {
        break;
      }
    }
  }
  stg6AccuserSelectedCoord = null;

  updateStage6Displays();
  renderMobileTask('stage6');
  if (isHost) broadcast({ type: 'sync_state', state: gameState });
}

function handleStg6LegacyHit(pName) {
  if (gameState.stage !== 'stage6' || gameState.stg6Finished) return;
  if (!gameState.stg6Secret) {
    gameState.stg6Secret = generateRandomStg6Placements();
  }
  const sec = gameState.stg6Secret;
  const shipCells = [...(sec.arm || []), ...(sec.leg || sec.shoulder || []), ...(sec.core || [])];
  let targetIdx = shipCells.find(idx => !gameState.stg6Grid || !gameState.stg6Grid[idx]);
  if (targetIdx === undefined) {
    for (let i = 0; i < 16; i++) {
      if (!gameState.stg6Grid || !gameState.stg6Grid[i]) {
        targetIdx = i;
        break;
      }
    }
  }
  if (targetIdx === undefined) targetIdx = 0;
  handleStg6Shot(pName || 'ผู้เล่น', targetIdx, 'good');
}

function handleStg6Counter(pName) {
  playSfx('blade');
}

function handleStg6FinalBlow(pName) {
  if (gameState.stg6Finished) return;
  gameState.stg6Finished = true;
  stopTimer();
  playSfx('counter');
  setTimeout(() => {
    playSfx('point_break');
    logCourt(`💥 [SURRENDER]: ${pName || 'ผู้เล่น'} ลั่นไกกระสุนความจริงนัดสุดท้าย ผู้ถูกกล่าวหายอมจำนนแล้ว!`);
    const scream = document.getElementById('culpritScreamText');
    if (scream) scream.innerText = `"อ๊ากกกกกกกกกกก!! แผนการของฉัน... พังหมดแล้ว...!!"`;

    showMinigameResult(
      true,
      "💥 ผู้ถูกกล่าวหายอมจำนน!",
      "กระสุนความจริงนัดสุดท้ายเจาะทะลวงเกราะทั้งหมดสำเร็จ!",
      `${pName || 'ผู้เล่น'} ยิงทลายเกราะสุดท้ายสำเร็จ ผู้ถูกกล่าวหายอมจำนนต่อศาล!`
    );
  }, 400);
}

function adminStg6Retry() {
  if (gameState.stage !== 'stage6') return;
  handleStg6DmRetry();
  broadcast({ type: 'stg6_dm_retry' });
}

function handleStg6DmRetry() {
  gameState.stg6Phase = 'placement';
  gameState.stg6Grid = Array(16).fill(null);
  gameState.stg6Secret = null;
  gameState.stg6Ships = {
    arm: { name: 'เกราะแขน', size: 2, hits: 0, sunk: false },
    leg: { name: 'เกราะขา', size: 2, hits: 0, sunk: false },
    core: { name: 'แกนหัวใจ', size: 1, hits: 0, sunk: false }
  };
  gameState.stg6Ships.shoulder = gameState.stg6Ships.leg;
  gameState.stg6BlocksRemaining = 5;
  gameState.stg6PoolAmmo = 8;
  gameState.stg6Finished = false;
  gameState.stg6FinalReady = false;
  gameState.stg6Defeat = false;
  gameState.stg6TrapPenaltyActive = false;
  gameState.stg6CurrentTurnIndex = 0;
  (gameState.stg6Accusers || []).forEach(p => {
    gameState.stg6PlayerAmmo[p] = 2;
  });
  const banner = document.getElementById('armamentFinalBlowBanner');
  if (banner) banner.classList.add('hidden');
  playSfx('gavel');
  logCourt(`🔄 [DM RETRY]: ผู้ดูแลศาลรีเซ็ต Stage 6 (Argument Armament) เริ่มต้นรอบใหม่! กระสุนกองกลางรีเซ็ตเป็น 8/8!`);
  updateStage6Displays();
  renderMobileTask('stage6');
}

function adminStg6ForcePass() {
  if (gameState.stage !== 'stage6') return;
  handleStg6DmForcePass();
  broadcast({ type: 'stg6_dm_force_pass' });
}

function handleStg6DmForcePass() {
  gameState.stg6BlocksRemaining = 0;
  gameState.stg6FinalReady = true;
  gameState.stg6Defeat = false;
  gameState.stg6Ships = {
    arm: { name: 'เกราะแขน', size: 2, hits: 2, sunk: true },
    leg: { name: 'เกราะขา', size: 2, hits: 2, sunk: true },
    core: { name: 'แกนหัวใจ', size: 1, hits: 1, sunk: true }
  };
  gameState.stg6Ships.shoulder = gameState.stg6Ships.leg;
  const banner = document.getElementById('armamentFinalBlowBanner');
  if (banner) banner.classList.remove('hidden');
  playSfx('break');
  logCourt(`⏩ [DM FORCE PASS]: ผู้ดูแลศาลทลายเกราะคนร้ายโดยตรง! ปปลดล็อกกระสุนความจริงนัดสุดท้าย!`);
  updateStage6Displays();
  renderMobileTask('stage6');
}

function adminStartArmament() {
  if (gameState.customStages && gameState.customStages['stage6']) {
    adminSetGame('stage6', gameState.customStages['stage6']);
    return;
  }
  const sel = document.getElementById('adminArmamentTargetSelect');
  let target = sel ? sel.value : '';
  if (!target) {
    const cfgSel = document.getElementById('cfgStg6TargetSelect');
    target = cfgSel ? cfgSel.value : '';
  }
  const allPlayers = Object.values(gameState.players || {});
  const matchedPlayer = allPlayers.find(p => p.name === target) ||
    allPlayers.find(p => p.name && target && (p.name.includes(target) || target.includes(p.name))) ||
    allPlayers.find(p => (p.isKiller || parseInt(p.pcSlot, 10) === 5) && (target.includes('ฮิฟุมิ') || target.includes('Hifumi')));
  if (matchedPlayer) {
    target = matchedPlayer.name;
  }
  if (!target) {
    if (allPlayers.length > 0) {
      const killerP = allPlayers.find(p => p.isKiller || parseInt(p.pcSlot, 10) === 5);
      target = killerP ? killerP.name : allPlayers[allPlayers.length - 1].name;
    } else {
      target = 'ฮิฟุมิ ยามาดะ';
    }
  }
  const scream = document.getElementById('cfgStg6Scream')?.value || 'ไม่มีทาง! รอกเชือกกับถังน้ำอะไรกัน... ฉันไม่เคยรู้เรื่องกลไกบ้าๆ นั่นเลยสักนิด!!';
  adminSetGame('stage6', { targetPlayer: target, opponent: target, scream: scream });
}

function updateStage6Displays() {
  const targetName = gameState.stg6TargetPlayer || 'ผู้ถูกกล่าวหา';
  const targetEl = document.getElementById('armamentTargetName');
  if (targetEl) targetEl.innerText = targetName;

  const screamEl = document.getElementById('culpritScreamText');
  if (screamEl && gameState.stg6Statement) screamEl.innerText = `"${gameState.stg6Statement}"`;

  // Phase Badge
  const badgeEl = document.getElementById('stg6PhaseBadge');
  if (badgeEl) {
    if (gameState.stg6FinalReady) {
      badgeEl.innerText = 'FINAL BLOW!';
      badgeEl.style.background = '#eab308';
    } else if (gameState.stg6Defeat) {
      badgeEl.innerText = 'กระสุนหมด!';
      badgeEl.style.background = '#ef4444';
    } else if (gameState.stg6Phase === 'shooting') {
      badgeEl.innerText = 'PHASE: ระดมยิง';
      badgeEl.style.background = '#10b981';
    } else {
      badgeEl.innerText = 'PHASE: วางเกราะ';
      badgeEl.style.background = '#dc2626';
    }
  }

  // Turn indicator
  const turnEl = document.getElementById('stg6TurnIndicatorTxt');
  if (turnEl) {
    if (gameState.stg6FinalReady) {
      turnEl.innerText = '💥 เกราะพังทลายหมดแล้ว! ยิงกระสุนความจริงนัดสุดท้าย!';
    } else if (gameState.stg6Defeat) {
      turnEl.innerText = '💀 กระสุนฝ่ายศาลหมดเกลี้ยง! รอคำสั่งจาก DM...';
    } else if (gameState.stg6Phase === 'shooting') {
      // Auto-skip if shooter matches target
      const accs = gameState.stg6Accusers || [];
      let curIdx = typeof gameState.stg6CurrentTurnIndex === 'number' ? gameState.stg6CurrentTurnIndex : 0;
      let checkCount = 0;
      while (accs.length > 0 && checkCount < accs.length) {
        const testShooter = accs[curIdx] || '';
        const tgt = gameState.stg6TargetPlayer || '';
        if (testShooter && tgt && (testShooter === tgt || tgt.includes(testShooter) || testShooter.includes(tgt))) {
          curIdx = (curIdx + 1) % accs.length;
          gameState.stg6CurrentTurnIndex = curIdx;
          checkCount++;
        } else {
          break;
        }
      }
      const curShooter = (accs && accs[curIdx]) || 'ผู้เล่น';
      const poolAmmo = (typeof gameState.stg6PoolAmmo === 'number') ? gameState.stg6PoolAmmo : 8;
      turnEl.innerHTML = `🎯 ตาของ: <strong style="color:#38bdf8;">${escapeHtml(curShooter)}</strong> (กระสุนกองกลางเหลือ ${poolAmmo}/8 นัด)`;
    } else {
      turnEl.innerText = `รอ ${targetName} ติดตั้งเกราะจิตวิทยา...`;
    }
  }

  // Blocks remaining counter
  const blocksEl = document.getElementById('stg6BlocksRemainingTxt');
  if (blocksEl) {
    blocksEl.innerText = typeof gameState.stg6BlocksRemaining === 'number' ? gameState.stg6BlocksRemaining : 5;
  }

  // Trap alert banner
  const trapAlertEl = document.getElementById('stg6TrapAlert');
  if (trapAlertEl) {
    trapAlertEl.style.display = gameState.stg6TrapPenaltyActive ? 'inline-block' : 'none';
  }

  // 4x4 Grid rendering on Court Screen
  const gridEl = document.getElementById('courtStg6Grid');
  if (gridEl) {
    gridEl.innerHTML = '';
    const gridData = gameState.stg6Grid || Array(16).fill(null);
    for (let i = 0; i < 16; i++) {
      const cell = document.createElement('div');
      const coord = formatStg6Coord(i);
      const state = gridData[i];
      cell.className = 'stg6-grid-cell';

      let contentHtml = `<span class="stg6-coord-label">${coord}</span>`;
      if (state === 'hit') {
        cell.classList.add('revealed-hit');
        contentHtml += `<span style="font-size:1.1rem;">💥</span><span style="font-size:0.65rem; color:#fca5a5;">HIT</span>`;
      } else if (state === 'miss') {
        cell.classList.add('revealed-miss');
        contentHtml += `<span style="font-size:1.1rem;">💦</span><span style="font-size:0.65rem; color:#bae6fd;">MISS</span>`;
      } else if (state === 'trap') {
        cell.classList.add('revealed-trap');
        contentHtml += `<span style="font-size:1.1rem;">⚡</span><span style="font-size:0.65rem; color:#e9d5ff;">TRAP</span>`;
      } else {
        contentHtml += `<span style="font-size:0.9rem; color:#475569;">?</span>`;
      }
      cell.innerHTML = contentHtml;
      gridEl.appendChild(cell);
    }
  }

  // Fleet cards (Arm, Leg, Core)
  const sShips = gameState.stg6Ships || {
    arm: { name: 'เกราะแขน', size: 2, hits: 0, sunk: false },
    leg: { name: 'เกราะขา', size: 2, hits: 0, sunk: false },
    core: { name: 'แกนหัวใจ', size: 1, hits: 0, sunk: false }
  };
  const legShip = sShips.leg || sShips.shoulder || { name: 'เกราะขา', size: 2, hits: 0, sunk: false };

  const cardA = document.getElementById('courtShipCardArm');
  const txtA = document.getElementById('courtShipStatusArm');
  if (cardA && txtA) {
    txtA.innerText = sShips.arm.sunk ? '💥 พังทลาย!' : `${sShips.arm.hits || 0} / 2`;
    cardA.className = 'stg6-ship-card' + (sShips.arm.sunk ? ' destroyed' : '');
  }

  const cardL = document.getElementById('courtShipCardLeg') || document.getElementById('courtShipCardShoulder');
  const txtL = document.getElementById('courtShipStatusLeg') || document.getElementById('courtShipStatusShoulder');
  if (cardL && txtL) {
    txtL.innerText = legShip.sunk ? '💥 พังทลาย!' : `${legShip.hits || 0} / 2`;
    cardL.className = 'stg6-ship-card' + (legShip.sunk ? ' destroyed' : '');
  }

  const cardC = document.getElementById('courtShipCardCore');
  const txtC = document.getElementById('courtShipStatusCore');
  if (cardC && txtC) {
    txtC.innerText = sShips.core.sunk ? '💥 พังทลาย!' : `${sShips.core.hits || 0} / 1`;
    cardC.className = 'stg6-ship-card' + (sShips.core.sunk ? ' destroyed' : '');
  }

  // Shared Pool Ammo Tracker on Court
  const poolAmmo = (typeof gameState.stg6PoolAmmo === 'number') ? gameState.stg6PoolAmmo : 8;
  const poolTxt = document.getElementById('courtStg6PoolAmmoTxt');
  if (poolTxt) poolTxt.innerText = poolAmmo;
  const poolTrack = document.getElementById('courtStg6PoolAmmoTrack');
  if (poolTrack) {
    let trackHtml = '';
    for (let i = 0; i < 8; i++) {
      const isFull = i < poolAmmo;
      trackHtml += `<span style="display:inline-block; width:16px; height:20px; border-radius:3px; background:${isFull ? 'linear-gradient(180deg, #fde047, #ca8a04)' : '#1e293b'}; border:1px solid ${isFull ? '#eab308' : '#334155'}; text-align:center; line-height:20px; font-size:0.6rem; color:#000; font-weight:bold;">${isFull ? '●' : '○'}</span>`;
    }
    poolTrack.innerHTML = trackHtml;
  }

  // Accusers Ammo List
  const ammoListEl = document.getElementById('courtStg6AmmoList');
  if (ammoListEl) {
    ammoListEl.innerHTML = '';
    const accusers = gameState.stg6Accusers || [];
    const curShooterIdx = gameState.stg6CurrentTurnIndex || 0;
    accusers.forEach((pName, idx) => {
      const isCur = idx === curShooterIdx && gameState.stg6Phase === 'shooting' && !gameState.stg6FinalReady && !gameState.stg6Defeat;
      const item = document.createElement('div');
      item.style.cssText = `display:flex; justify-content:space-between; align-items:center; padding:3px 6px; border-radius:4px; font-size:0.78rem; background:${isCur ? 'rgba(56,189,248,0.2)' : 'rgba(0,0,0,0.2)'}; border:${isCur ? '1px solid #38bdf8' : '1px solid transparent'};`;
      item.innerHTML = `
        <span>${isCur ? '👉 ' : ''}<strong>${escapeHtml(pName)}</strong></span>
        <span style="font-weight:bold; color:${isCur ? '#38bdf8' : '#64748b'}; font-size:0.72rem;">${isCur ? 'กำลังเล็ง' : 'รอตา'}</span>
      `;
      ammoListEl.appendChild(item);
    });
  }

  // Final blow banner
  const banner = document.getElementById('armamentFinalBlowBanner');
  if (banner) {
    if (gameState.stg6FinalReady) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
  }
}

// 7. Closing Argument (Mini-Game 7) - 5-Page Airtight Manga Overhaul
function getTrapperName() {
  const p5Name = getPlayerNameByPcSlot(5);
  if (p5Name) return p5Name;
  if (gameState && gameState.trapperName) return gameState.trapperName;
  if (gameState && gameState.players) {
    const trapperPlayer = Object.values(gameState.players).find(p => p.isKiller || parseInt(p.pcSlot, 10) === 5);
    if (trapperPlayer && trapperPlayer.name) return trapperPlayer.name;
  }
  if (myPlayer && (myPlayer.isKiller || parseInt(myPlayer.pcSlot, 10) === 5) && myPlayer.name) {
    return myPlayer.name;
  }
  return 'ฮิฟุมิ';
}

function formatClosingText(str) {
  if (!str) return '';
  const pc5Name = getTrapperName();
  let res = str.replace(/\[TRAPPER\]/g, pc5Name);
  res = res.replace(/ฮิฟุมิ/g, pc5Name);
  // เรียวตะ ใช้คำว่า คนร้าย
  res = res.replace(/คนร้ายเรียวตะ/g, 'คนร้าย');
  res = res.replace(/สึกิชิมะ\s*เรียวตะ/g, 'คนร้าย');
  res = res.replace(/เรียวตะ/g, 'คนร้าย');
  res = res.replace(/PC\s*1/g, getPlayerNameByPcSlot(1));
  res = res.replace(/PC\s*2/g, getPlayerNameByPcSlot(2));
  res = res.replace(/PC\s*3/g, getPlayerNameByPcSlot(3));
  res = res.replace(/PC\s*4/g, getPlayerNameByPcSlot(4));
  res = res.replace(/PC\s*5/g, pc5Name);
  return res;
}

const CLOSING_PAGES_DATA = [
  {
    page: 1,
    title: 'แผนการในครัว & อาวุธท่อนกระดูกหมู (17:00 – 17:30 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🥩',
        desc: '[TRAPPER] ซึ่งมีหน้าที่เตรียมอาหารเย็น แอบนำท่อนกระดูกหมูแช่แข็งชิ้นใหญ่ออกจากช่องฟรีซในครัวมาเตรียมไว้'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 1,
        pageSlot: 1,
        acceptedIds: ['CARD-P1-S1', 'EVD-14', 'EVD-12', 'ACTION-CUT'],
        art: '🍖',
        title: 'ช่องว่างที่ 1: การลงมือจู่โจม',
        desc: '[TRAPPER] ดักซุ่มในห้องซักรีด ใช้ท่อนกระดูกหมูแช่แข็งฟาดท้ายทอยคนร้ายจนสลบแน่นิ่งเวลา 17:30 น.'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 2,
        pageSlot: 2,
        acceptedIds: ['CARD-P1-S2', 'EVD-11', 'EVD-09', 'ACTION-NOOSE'],
        art: '🍲',
        title: 'ช่องว่างที่ 2: การทำลายหลักฐานและอาวุธ',
        desc: '[TRAPPER] โยนท่อนกระดูกหมูเปื้อนเลือดลงก้นหม้อสตูว์เนื้อที่กำลังเดือดในครัวเพื่อต้มล้างคราบและซ่อนอาวุธ'
      },
      {
        num: 4,
        type: 'story',
        art: '🥘',
        desc: 'ไขมันและกลิ่นเครื่องเทศของสตูว์เนื้อกลบคราบเลือดจนมิด กลายเป็นอาหารเย็นที่ทุกคนทานร่วมกัน'
      }
    ]
  },
  {
    page: 2,
    title: 'การติดตั้งรอกเชือกและจัดวางร่างในห้องซักรีด (17:45 – 18:30 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🚪',
        desc: 'คนร้ายสลบแน่นิ่งอยู่บนพื้นห้องซักรีด [TRAPPER] จึงเริ่มติดตั้งกลไกเชือกและรอกตามแผนการวางกับดัก'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 3,
        pageSlot: 1,
        acceptedIds: ['CARD-P2-S1'],
        art: '🪢',
        title: 'ช่องว่างที่ 1: การมัดร่างและคล้องเชือก',
        desc: '[TRAPPER] ใช้เชือกตากผ้าไนลอนสีชมพูร้อยผูกมัดลำตัวและคล้องหลวมๆ รอบคอของคนร้าย'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 4,
        pageSlot: 2,
        acceptedIds: ['CARD-P2-S2'],
        art: '⚙️',
        title: 'ช่องว่างที่ 2: การทำรอกชักร่างขึ้นเพดาน',
        desc: '[TRAPPER] พาดปลายเชือกไนลอนข้ามราวท่อสแตนเลสบนเพดานห้องซักรีดเพื่อทำหน้าที่เป็นรอกชักน้ำหนัก'
      },
      {
        num: 4,
        type: 'story',
        art: '🪟',
        desc: '[TRAPPER] โยนปลายเชือกอีกด้านออกนอกหน้าต่างระบายอากาศสูง 3.5 เมตร สู่ลานคอร์ทยาร์ดภายนอก'
      }
    ]
  },
  {
    page: 3,
    title: 'กลไกสายยาง & ถังน้ำถ่วงน้ำหนักคอร์ทยาร์ด (18:30 – 19:00 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🏢',
        desc: 'ที่ลานคอร์ทยาร์ดนอกอาคาร [TRAPPER] วางถังน้ำพลาสติก 80 ลิตรไว้ตรงกับแนวหน้าต่างห้องซักรีด'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 5,
        pageSlot: 1,
        acceptedIds: ['CARD-P3-S1'],
        art: '🪣',
        title: 'ช่องว่างที่ 1: การผูกถังถ่วงน้ำหนัก',
        desc: '[TRAPPER] ผูกปลายเชือกไนลอนที่หย่อนลงมาเข้ากับหูหิ้วของถังน้ำ เพื่อทำหน้าที่เป็นน้ำหนักถ่วง (Counterweight)'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 6,
        pageSlot: 2,
        acceptedIds: ['CARD-P3-S2'],
        art: '🚰',
        title: 'ช่องว่างที่ 2: กลไกนาฬิกาน้ำตั้งเวลา',
        desc: '[TRAPPER] ต่อสายยางน้ำประปาเข้าก๊อก เปิดน้ำให้ไหลเติมลงถังอย่างช้าๆ 0.4 ลิตร/นาที (กลไกนาฬิกาน้ำ)'
      },
      {
        num: 4,
        type: 'story',
        art: '⏳',
        desc: 'กลไกนาฬิกาน้ำเริ่มทำงาน ระดับน้ำจะค่อยๆ เพิ่มขึ้นจนมีน้ำหนักมากพอที่จะกระชากเชือกเมื่อครบกำหนดเวลา 21:00 น.'
      }
    ]
  },
  {
    page: 4,
    title: 'การตั้งเวลากลลวง & คนร้ายซ้อนแผนตัดเชือก (18:45 – 20:55 น.)',
    panels: [
      {
        num: 1,
        type: 'slot',
        slotId: 7,
        pageSlot: 1,
        acceptedIds: ['CARD-P4-S1'],
        art: '⏱️',
        title: 'ช่องว่างที่ 1: การตั้งเวลาเครื่องอบผ้าล่วงหน้า',
        desc: 'ก่อนออกจากห้องซักรีด [TRAPPER] แอบตั้งเวลาเครื่องอบผ้า DRY-1 ล่วงหน้า (Delay Timer) ให้เริ่มทำงานตอน 21:00 น.'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 8,
        pageSlot: 2,
        acceptedIds: ['CARD-P4-S2'],
        art: '👢',
        title: 'ช่องว่างที่ 2: วัตถุสร้างเสียงต่อสู้หลอก',
        desc: '[TRAPPER] ใส่รองเท้าบูทหนังหนาเข้าไปในเครื่องอบผ้า DRY-1 เพื่อให้เกิดเสียงกระแทกเลียนแบบการต่อสู้หลอกตอน 21:00 น.'
      },
      {
        num: 3,
        type: 'story',
        art: '🕯️',
        desc: '[TRAPPER] กลับไปร่วมโต๊ะอาหารค่ำเวลา 19:00 น. และนั่งคุยกับทุกคนในห้องนั่งเล่นจนถึง 21:00 น. เพื่อสร้าง Alibi ว่าตนไม่ได้อยู่ในที่เกิดเหตุ'
      },
      {
        num: 4,
        type: 'story',
        art: '🔪',
        desc: 'แต่ก่อน 21:00 น. คนร้ายฟื้นสติขึ้นมา! เมื่อพบว่าตนถูกลอบทำร้ายใน Killing Game คนร้ายไม่ยอมหนี แต่ชักมีดพับออกมาตัดเชือกเพื่อ "ซ้อนแผน" วางกับดักย้อนกลับใส่ผู้ที่ทำร้ายตน!'
      }
    ]
  },
  {
    page: 5,
    title: 'ความผิดพลาดของคนร้าย & มวลน้ำกระชากร่าง (21:00 – 21:05 น.)',
    panels: [
      {
        num: 1,
        type: 'story',
        art: '🪢',
        desc: 'คนร้ายรีบผูกต่อเชือกใหม่และปีนขึ้นไปดัดแปลงบ่วงบนเพดานเพื่อจัดฉากฆาตกรรมย้อนกลับ แต่ในความมืดและความลนลาน เงื่อนบ่วงใหม่กลับคล้องรัดคอของคนร้ายเองจนแน่นหนาและปลดไม่ออก!'
      },
      {
        num: 2,
        type: 'slot',
        slotId: 9,
        pageSlot: 1,
        acceptedIds: ['CARD-P5-S1'],
        art: '💥',
        title: 'ช่องว่างที่ 1: จังหวะถังน้ำร่วงกระแทกพื้น',
        desc: 'เวลา 21:00 น. น้ำในถังคอร์ทยาร์ดสะสมจนหนักทะลุ 70 กก. ดึงถังร่วงกระแทกพื้นแตกกระจายตามเวลา'
      },
      {
        num: 3,
        type: 'slot',
        slotId: 10,
        pageSlot: 2,
        acceptedIds: ['CARD-P5-S2'],
        art: '⛓️',
        title: 'ช่องว่างที่ 2: บ่วงเชือกกระชากร่างคนร้าย',
        desc: 'แรงกระชากดึงเชือกเส้นใหม่ที่คนร้ายผูกพลาด ยกร่างคนร้ายลอยขึ้นไปแขวนตรึงติดราวท่อเพดานจนกระดูกคอหักเสียชีวิตทันที!'
      },
      {
        num: 4,
        type: 'story',
        art: '⚖️',
        desc: 'เครื่องอบผ้าทำงานเกิดเสียงรองเท้าบูทกระแทกโครมครามตามที่ [TRAPPER] ตั้งเวลาไว้ หลอกให้ทุกคนพังประตูเข้ามาพบศพ! แต่แท้จริงแล้วผู้ที่ผูกเงื่อนเชือกเส้นตายที่สังหารตนเองก็คือ "คนร้าย (The Blackened)" นั่นเอง!'
      }
    ]
  }
];

const CLOSING_CARDS_DATA = [
  { id: 'CARD-P1-S1', page: 1, slot: 1, title: '[TRAPPER] ใช้ท่อนกระดูกหมูแช่แข็งฟาดท้ายทอยคนร้ายจนสลบในห้องซักรีด (17:30 น.)', icon: '🍖' },
  { id: 'CARD-P1-S2', page: 1, slot: 2, title: '[TRAPPER] โยนท่อนกระดูกหมูเปื้อนเลือดลงไปต้มในหม้อสตูว์เนื้อเพื่อทำลายหลักฐาน', icon: '🍲' },
  { id: 'CARD-P2-S1', page: 2, slot: 3, title: '[TRAPPER] ใช้เชือกตากผ้าไนลอนสีชมพูผูกมัดลำตัวและคล้องคอคนร้าย', icon: '🪢' },
  { id: 'CARD-P2-S2', page: 2, slot: 4, title: '[TRAPPER] พาดปลายเชือกไนลอนข้ามราวท่อสแตนเลสบนเพดานห้องซักรีดเพื่อทำหน้าที่เป็นรอก', icon: '⚙️' },
  { id: 'CARD-P3-S1', page: 3, slot: 5, title: '[TRAPPER] ผูกปลายเชือกไนลอนเข้ากับหูหิ้วถังน้ำพลาสติก 80 ลิตรที่ลานคอร์ทยาร์ด', icon: '🪣' },
  { id: 'CARD-P3-S2', page: 3, slot: 6, title: '[TRAPPER] ต่อสายยางเปิดน้ำประปาไหลเติมลงถังทีละน้อย 0.4 ลิตร/นาที (นาฬิกาน้ำ)', icon: '🚰' },
  { id: 'CARD-P4-S1', page: 4, slot: 7, title: '[TRAPPER] แอบตั้งเวลาเครื่องอบผ้า DRY-1 ล่วงหน้าให้เริ่มทำงานตอน 21:00 น. ก่อนไปทานอาหาร', icon: '⏱️' },
  { id: 'CARD-P4-S2', page: 4, slot: 8, title: '[TRAPPER] ใส่รองเท้าบูทหนังหนาเข้าไปในเครื่องอบผ้าเพื่อสร้างเสียงต่อสู้หลอกเวลา 21:00 น.', icon: '👢' },
  { id: 'CARD-P5-S1', page: 5, slot: 9, title: 'น้ำในถังหนักเกิน 70 กก. ดึงถังร่วงกระแทกพื้นคอร์ทยาร์ดแตกกระจาย (21:00 น.)', icon: '💥' },
  { id: 'CARD-P5-S2', page: 5, slot: 10, title: 'แรงฉุดกระชากดึงบ่วงเชือกที่คนร้ายผูกพลาด ยกร่างคนร้ายขึ้นแขวนติดท่อเพดานจนเสียชีวิต', icon: '⛓️' },
  // 15 unique decoy cards
  { id: 'DECOY-KNIFE', page: 0, slot: 0, title: 'คนร้ายแกล้งสลบแล้วชักมีดพับออกมาแทงสวน [TRAPPER] ในห้องครัว', icon: '🔪', decoy: true },
  { id: 'DECOY-LADDER', page: 0, slot: 0, title: '[TRAPPER] ปีนบันไดออกไปทางหน้าต่างสูงเพื่อผูกเชือกภายนอกอาคาร', icon: '🪜', decoy: true },
  { id: 'DECOY-VALVE', page: 0, slot: 0, title: '[TRAPPER] แอบไปปิดวาล์วน้ำหลักทั้งอาคารเพื่อไม่ให้มีใครใช้น้ำได้', icon: '🔧', decoy: true },
  { id: 'DECOY-WASH', page: 0, slot: 0, title: '[TRAPPER] นำเสื้อผ้าเปื้อนเลือดของตนเองใส่ลงไปปั่นซักในเครื่องซักผ้า', icon: '🫧', decoy: true },
  { id: 'DECOY-DOOR', page: 0, slot: 0, title: '[TRAPPER] ใช้โซ่เหล็กคล้องล็อกประตูด้านนอกของห้องซักรีดไว้', icon: '🔒', decoy: true },
  { id: 'DECOY-POISON', page: 0, slot: 0, title: '[TRAPPER] แอบหยอดยาพิษร้ายแรงลงในแก้วน้ำชาของคนร้ายก่อนลงมือ', icon: '🧪', decoy: true },
  { id: 'DECOY-VENT', page: 0, slot: 0, title: '[TRAPPER] มุดท่อระบายอากาศจากห้องครัวตรงไปยังห้องซักรีดโดยไม่ผ่านโถงทางเดิน', icon: '🕳️', decoy: true },
  { id: 'DECOY-FREEZER', page: 0, slot: 0, title: '[TRAPPER] ซ่อนร่างของคนร้ายไว้ในตู้แช่แข็งขนาดใหญ่จนตัวแข็งก่อนนำไปแขวน', icon: '🧊', decoy: true },
  { id: 'DECOY-WEIGHTS', page: 0, slot: 0, title: '[TRAPPER] ใช้ดัมเบลและแผ่นเหล็กยกน้ำหนักจากยิมมาถ่วงน้ำหนักแทนถังน้ำ', icon: '🏋️', decoy: true },
  { id: 'DECOY-GLOVES', page: 0, slot: 0, title: '[TRAPPER] สวมถุงมือยางและโยนทิ้งลงในเตาเผาขยะเพื่อไม่ให้ทิ้งรอยนิ้วมือ', icon: '🧤', decoy: true },
  { id: 'DECOY-CLOCK', page: 0, slot: 0, title: '[TRAPPER] หมุนเข็มนาฬิกาแขวนผนังในห้องซักรีดให้เร็วขึ้น 30 นาทีเพื่อลวงเวลา', icon: '⏰', decoy: true },
  { id: 'DECOY-WINDOW', page: 0, slot: 0, title: '[TRAPPER] ใช้ค้อนทุบกระจกหน้าต่างห้องซักรีดให้แตกเพื่อแกล้งทำเป็นทางหลบหนี', icon: '🪟', decoy: true },
  { id: 'DECOY-CURTAIN', page: 0, slot: 0, title: '[TRAPPER] ใช้ผ้าม่านห้องอาบน้ำห่อหุ้มร่างคนร้ายเพื่อป้องกันเลือดเปรอะเปื้อนพื้น', icon: '🚿', decoy: true },
  { id: 'DECOY-CLEANER', page: 0, slot: 0, title: '[TRAPPER] ใช้น้ำยาฟอกขาวเข้มข้นราดขัดพื้นห้องซักรีดเพื่อกำจัดรอยรองเท้า', icon: '🧴', decoy: true },
  { id: 'DECOY-FIRE', page: 0, slot: 0, title: '[TRAPPER] จุดไฟเผากองเศษผ้าเพื่อเปิดระบบสปริงเกลอร์ฉีดน้ำล้างห้อง', icon: '🔥', decoy: true }
];

// Dynamic getters for CLOSING_PAGES_DATA and CLOSING_CARDS_DATA
CLOSING_PAGES_DATA.forEach(p => {
  p.rawTitle = p.title;
  Object.defineProperty(p, 'title', {
    get() { return formatClosingText(this.rawTitle); },
    set(v) { this.rawTitle = v; },
    configurable: true,
    enumerable: true
  });
  p.panels.forEach(pan => {
    pan.rawDesc = pan.desc;
    Object.defineProperty(pan, 'desc', {
      get() { return formatClosingText(this.rawDesc); },
      set(v) { this.rawDesc = v; },
      configurable: true,
      enumerable: true
    });
    if (pan.title) {
      pan.rawTitle = pan.title;
      Object.defineProperty(pan, 'title', {
        get() { return formatClosingText(this.rawTitle); },
        set(v) { this.rawTitle = v; },
        configurable: true,
        enumerable: true
      });
    }
  });
});

CLOSING_CARDS_DATA.forEach(c => {
  c.rawTitle = c.title;
  Object.defineProperty(c, 'title', {
    get() { return formatClosingText(this.rawTitle); },
    set(v) { this.rawTitle = v; },
    configurable: true,
    enumerable: true
  });
});

const CLOSING_UNLOCK_ORDER = [1, 5, 3, 7, 2, 6, 8, 4, 9, 10];
const PC_CLOSING_SLOTS = {
  1: [1, 6],
  2: [4, 7],
  3: [2, 9],
  4: [3, 8],
  5: [5, 10]
};

const CLOSING_SLOT_TO_CARD = {
  1: 'CARD-P1-S1',
  2: 'CARD-P1-S2',
  3: 'CARD-P2-S1',
  4: 'CARD-P2-S2',
  5: 'CARD-P3-S1',
  6: 'CARD-P3-S2',
  7: 'CARD-P4-S1',
  8: 'CARD-P4-S2',
  9: 'CARD-P5-S1',
  10: 'CARD-P5-S2'
};

function getClosingPlayersList() {
  const list = typeof getActivePlayersList === 'function' ? getActivePlayersList() : [];
  if (list && list.length >= 2) {
    const copy = [...list];
    copy.sort((a, b) => (parseInt(a.pcSlot, 10) || 1) - (parseInt(b.pcSlot, 10) || 1));
    return copy;
  }
  const simRoster = [
    { id: 'sim_naegi', userHash: 'sim_naegi', name: 'นาเอกิ', role: 'สุดยอดนักเรียนโชคดี', pcSlot: 1 },
    { id: 'sim_kyoko', userHash: 'sim_kyoko', name: 'เคียวโกะ', role: 'สุดยอดนักสืบ', pcSlot: 2 },
    { id: 'sim_byakuya', userHash: 'sim_byakuya', name: 'เบียคุยะ', role: 'สุดยอดทายาทมหาเศรษฐี', pcSlot: 3 },
    { id: 'sim_aoi', userHash: 'sim_aoi', name: 'อาโออิ', role: 'สุดยอดนักว่ายน้ำ', pcSlot: 4 },
    { id: 'sim_hifumi', userHash: 'sim_hifumi', name: 'ฮิฟุมิ', role: 'สุดยอดนักเขียนโดจิน (The Blackened)', pcSlot: 5 }
  ];
  if (list && list.length > 0) {
    const merged = [...list];
    simRoster.forEach(sp => {
      if (!merged.some(p => p.id === sp.id || p.userHash === sp.userHash || p.name === sp.name)) {
        merged.push(sp);
      }
    });
    merged.sort((a, b) => (parseInt(a.pcSlot, 10) || 1) - (parseInt(b.pcSlot, 10) || 1));
    return merged;
  }
  return simRoster;
}

function distributeClosingCards() {
  const playersList = getClosingPlayersList();
  const hands = {};

  // Separate correct cards and decoy cards
  const correctCards = CLOSING_CARDS_DATA.filter(c => !c.decoy).map(c => {
    const copy = JSON.parse(JSON.stringify(c));
    copy.title = formatClosingText(copy.title || c.title);
    return copy;
  });
  const decoyCards = CLOSING_CARDS_DATA.filter(c => c.decoy).map(c => {
    const copy = JSON.parse(JSON.stringify(c));
    copy.title = formatClosingText(copy.title || c.title);
    return copy;
  });

  const numPlayers = Math.max(1, playersList.length);
  const playerBuckets = Array.from({ length: numPlayers }, () => []);

  // Scatter non-sequential starting unlocked correct slots across all pages (Slots: 1, 7, 9, 3, 5)
  // Ensures cards are spread out across Page 1, 2, 3, 4, 5 so players CANNOT just place 1, 2, 3...
  const startingUnlockedSlots = new Set([1, 7, 9, 3, 5]);

  if (numPlayers >= 5) {
    // Exact PC 1..5 distribution: 2 correct + 3 decoys = 5 cards each
    Object.entries(PC_CLOSING_SLOTS).forEach(([slotStr, slots]) => {
      const pIdx = parseInt(slotStr, 10) - 1;
      slots.forEach(slotNum => {
        const card = correctCards.find(c => c.slot === slotNum);
        if (card && playerBuckets[pIdx]) {
          // Unlock 1 correct card per player from startingUnlockedSlots
          card.locked = !startingUnlockedSlots.has(slotNum);
          playerBuckets[pIdx].push(card);
        }
      });
      const decoysForP = decoyCards.slice(pIdx * 3, (pIdx + 1) * 3);
      decoysForP.forEach((d, dIdx) => {
        // Unlock 1 decoy per player so ~50% of hand is unlocked
        d.locked = (dIdx !== 0);
        if (playerBuckets[pIdx]) playerBuckets[pIdx].push(d);
      });
    });
  } else {
    // Fallback for fewer than 5 players: unlock ~50%
    correctCards.forEach((card, idx) => {
      card.locked = !startingUnlockedSlots.has(card.slot);
      playerBuckets[idx % numPlayers].push(card);
    });
    decoyCards.forEach((card, idx) => {
      card.locked = (idx % 2 !== 0);
      playerBuckets[idx % numPlayers].push(card);
    });
  }

  // Shuffle cards within each player's bucket so correct cards and decoys are thoroughly randomized!
  playerBuckets.forEach(bucket => {
    for (let i = bucket.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = bucket[i];
      bucket[i] = bucket[j];
      bucket[j] = temp;
    }
    // Ensure the top card is not always a correct card (addressing user request)
    if (bucket.length > 2 && !bucket[0].decoy) {
      const decoyIdx = bucket.findIndex(c => c.decoy);
      if (decoyIdx > 0) {
        const temp = bucket[0];
        bucket[0] = bucket[decoyIdx];
        bucket[decoyIdx] = temp;
      }
    }
  });

  // Map buckets to player hands with multi-key indexing (id, userHash, name, pcSlot)
  playersList.forEach((p, idx) => {
    const bucket = playerBuckets[idx] || [];
    if (p.id) hands[p.id] = bucket;
    if (p.userHash && p.userHash !== p.id) hands[p.userHash] = bucket;
    if (p.name) hands[p.name] = bucket;
    if (p.pcSlot) {
      hands['pc_' + p.pcSlot] = bucket;
      hands['pc' + p.pcSlot] = bucket;
    }
    hands['pc_' + (idx + 1)] = bucket;
  });

  // Local fallback
  if (playerBuckets.length > 0) {
    hands['local'] = playerBuckets[0];
  }

  gameState.closingPlayerHands = hands;
  broadcast({ type: 'closing_hands_sync', hands: hands });
}

function unlockNextClosingCard() {
  if (!gameState.closingPlayerHands) return;

  // Non-linear remaining unlock order
  const nonLinearOrder = [2, 6, 8, 4, 10, 1, 5, 3, 7, 9];
  
  // Find up to 2 locked cards across player hands to unlock simultaneously
  let unlockedCards = [];
  const seenHands = new Set();

  // 1. First search for locked correct cards for unsolved slots
  for (const s of nonLinearOrder) {
    if (unlockedCards.length >= 2) break;
    if (!gameState.closingSlots || !gameState.closingSlots[s]) {
      const targetCardId = CLOSING_SLOT_TO_CARD[s];
      seenHands.clear();
      Object.keys(gameState.closingPlayerHands).forEach(pKey => {
        if (unlockedCards.length >= 2) return;
        const hand = gameState.closingPlayerHands[pKey];
        if (Array.isArray(hand) && !seenHands.has(hand)) {
          seenHands.add(hand);
          hand.forEach(card => {
            if (card.id === targetCardId && card.locked && unlockedCards.length < 2) {
              card.locked = false;
              unlockedCards.push({ card, playerKey: pKey, slot: s });
            }
          });
        }
      });
    }
  }

  // 2. If still fewer than 2 cards, unlock a decoy card to maintain mystery & deduction
  if (unlockedCards.length < 2) {
    seenHands.clear();
    Object.keys(gameState.closingPlayerHands).forEach(pKey => {
      if (unlockedCards.length >= 2) return;
      const hand = gameState.closingPlayerHands[pKey];
      if (Array.isArray(hand) && !seenHands.has(hand)) {
        seenHands.add(hand);
        hand.forEach(card => {
          if (card.decoy && card.locked && unlockedCards.length < 2) {
            card.locked = false;
            unlockedCards.push({ card, playerKey: pKey, slot: null });
          }
        });
      }
    });
  }

  if (unlockedCards.length > 0) {
    playSfx('correct');
    unlockedCards.forEach(item => {
      const slotText = item.slot ? `ช่องที่ ${item.slot}` : 'ตัวเลือกเสริม';
      logCourt(`🔓 [CARD UNLOCKED]: การ์ด (${slotText}: "${item.card.title}") ถูกปลดล็อกแล้ว!`);
      broadcast({
        type: 'closing_card_unlocked',
        playerId: item.playerKey,
        cardId: item.card.id,
        cardTitle: item.card.title,
        hands: gameState.closingPlayerHands
      });
    });
    showToast(`🔓 ปลดล็อกการ์ดใหม่ ${unlockedCards.length} ใบในมือผู้เล่นเรียบร้อย!`);
  }
}

function showBonusTimePopup(seconds) {
  if (currentView === 'admin' || currentView === 'simulation' || (gameState && gameState.stage !== 'closing')) return;
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

let playerPreviewClosingPage = 1;

function adminSetClosingPage(page) {
  if (page < 1 || page > 5) return;
  gameState.closingCurrentPage = page;
  playerPreviewClosingPage = page;
  updateClosingDisplay();
  broadcast({ type: 'closing_page_change', page: page });
  renderMobileTask('closing');
}

function playerSetClosingPage(page) {
  if (page < 1 || page > 5) return;
  playerPreviewClosingPage = page;
  renderMobileTask('closing');
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

    // Sequentially unlock next required card
    unlockNextClosingCard();

    logCourt(`📖 [CLOSING PAGE ${targetPage}]: ${pName} เติมมังงะช่องที่ ${slotNum} สำเร็จ! (+20s โบนัส)`);
    updateClosingDisplay();

    // Check if current page is complete -> auto-advance page to next unsolved page after short delay
    const curPageSlots = (CLOSING_PAGES_DATA.find(p => p.page === targetPage)?.panels || [])
      .filter(pan => pan.type === 'slot')
      .map(pan => pan.slotId);
    const curPageComplete = curPageSlots.length > 0 && curPageSlots.every(sId => gameState.closingSlots[sId]);
    if (curPageComplete) {
      let nextUnsolvedPage = 0;
      for (let p = 1; p <= 5; p++) {
        const pSlots = (CLOSING_PAGES_DATA.find(x => x.page === p)?.panels || [])
          .filter(pan => pan.type === 'slot')
          .map(pan => pan.slotId);
        if (pSlots.some(sId => !gameState.closingSlots[sId])) {
          nextUnsolvedPage = p;
          break;
        }
      }
      if (nextUnsolvedPage > 0 && nextUnsolvedPage !== targetPage) {
        setTimeout(() => {
          adminSetClosingPage(nextUnsolvedPage);
          logCourt(`📄 [CLOSING AUTO-PAGE]: มังงะหน้าที่ ${targetPage} สมบูรณ์แล้ว! กำลังเปิดไปยังหน้าที่ ${nextUnsolvedPage}...`);
        }, 1000);
      }
    }

    // Check if all 10 slots are solved
    let solvedCount = 0;
    for (let s = 1; s <= 10; s++) {
      if (gameState.closingSlots[s]) solvedCount++;
    }

    if (solvedCount >= 10) {
      stopTimer();
      setTimeout(() => {
        playSfx('point_break');
        logCourt(`🎉 [CLIMAX COMPLETE]: วางการ์ดครบ 10 ช่องสมบูรณ์! เริ่มฉายมังงะบทสรุปคดี (Climax Inference Storyboard)...`);
        startClosingClimaxPlayback();
        if (typeof isHost !== 'undefined' && isHost) {
          broadcast({ type: 'start_closing_climax' });
        }
      }, 400);
    }

    if (typeof isHost !== 'undefined' && isHost) {
      broadcast({ type: 'sync_state', state: gameState });
    }
    renderMobileTask('closing');
  } else {
    playSfx('wrong');
    logCourt(`❌ [CLOSING MISMATCH]: ${pName} วางการ์ดไม่ตรงกับช่องว่าง`);
    showToast(`❌ วางการ์ดไม่ตรงกับช่องว่าง`);
    if (typeof isHost !== 'undefined' && isHost) {
      broadcast({ type: 'sync_state', state: gameState });
    }
    renderMobileTask('closing');
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
    const pData = CLOSING_PAGES_DATA.find(x => x.page === p);
    const pSlots = pData ? pData.panels.filter(x => x.type === 'slot').map(x => x.slotId) : [];
    const pSolved = pSlots.length > 0 && pSlots.every(sId => gameState.closingSlots && gameState.closingSlots[sId]);

    const dot = document.getElementById(`dotP${p}`);
    if (dot) {
      dot.className = 'page-dot';
      if (p === curPage) dot.classList.add('active');
      if (pSolved) dot.classList.add('solved');
    }
    const dmDot = document.getElementById(`dmDotP${p}`);
    if (dmDot) {
      dmDot.className = 'page-dot';
      if (p === curPage) dmDot.classList.add('active');
      if (pSolved) dmDot.classList.add('solved');
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

let climaxAutoPlayTimer = null;
let currentClimaxViewPage = 1;

function startClosingClimaxPlayback() {
  if (currentView === 'admin' || currentView === 'simulation') return;
  const modal = document.getElementById('closingClimaxModal');
  const container = document.getElementById('climaxStoryboardContent');
  const navRow = document.getElementById('climaxPageNavRow');
  if (!modal || !container) return;

  modal.classList.remove('hidden');
  currentClimaxViewPage = 1;
  try {
    playSfx('point_break');
  } catch(e) {}

  // Render top page navigation chips inside cutscene
  if (navRow) {
    const pageTitles = [
      '1. ครัว & หม้อสตูว์',
      '2. เชือก & ท่อเพดาน',
      '3. นาฬิกาน้ำ 80L',
      '4. บูท & เครื่องอบผ้า',
      '5. เสี้ยววินาทีสังหาร',
      '👉 ชี้ตัวคนร้าย 💀'
    ];
    navRow.innerHTML = pageTitles.map((title, idx) => {
      const pNum = idx + 1;
      return `
        <button type="button" class="preset-chip" id="climaxNavChip_${pNum}" onclick="jumpClimaxPage(${pNum})" style="white-space:nowrap; padding:6px 12px; font-size:0.8rem; font-weight:800; cursor:pointer;">
          ${title}
        </button>
      `;
    }).join('');
  }

  // Render all 5 pages + Finale card
  const pagesHtml = CLOSING_PAGES_DATA.map(p => {
    const panelsHtml = p.panels.map(pan => {
      const isSlot = pan.type === 'slot';
      return `
        <div class="climax-panel-item" style="background:#151525; border:2px solid ${isSlot ? 'var(--court-gold)' : '#3d3d5c'}; border-radius:8px; padding:12px; display:flex; align-items:center; gap:14px; box-shadow:${isSlot ? '0 0 12px rgba(255,215,0,0.25)' : 'none'};">
          <div style="font-size:2.2rem; min-width:52px; text-align:center;">${pan.art}</div>
          <div style="flex:1;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span style="background:#000; color:var(--court-gold); padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:900;">ช่องที่ ${pan.num}</span>
              ${isSlot ? '<span style="background:#143522; color:#00ff88; border:1px solid #00ff88; font-size:0.7rem; font-weight:800; padding:1px 6px; border-radius:3px;">✓ การ์ดที่ถูกเติมสำเร็จ</span>' : '<span style="color:#94a3b8; font-size:0.75rem;">[ภาพเหตุการณ์]</span>'}
            </div>
            <div style="color:#fff; font-size:0.92rem; line-height:1.45; font-weight:600;">${pan.desc}</div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div id="climaxPageCard_${p.page}" class="climax-page-card" style="background:#0a0a14; border:1.5px solid #282845; border-radius:10px; padding:16px; margin-bottom:14px;">
        <h4 style="color:var(--mono-pink); margin:0 0 12px 0; font-size:1.05rem; font-weight:900; border-bottom:1px solid #222238; padding-bottom:8px; display:flex; align-items:center; gap:8px;">
          <span>📖 หน้าที่ ${p.page}:</span>
          <span style="color:#fff;">${p.title}</span>
        </h4>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${panelsHtml}
        </div>
      </div>
    `;
  }).join('');

  // Dramatic Finale Card
  const trapperName = getTrapperName();
  const finaleHtml = `
    <div id="climaxPageCard_6" class="climax-page-card" style="background:linear-gradient(135deg, #1c0512, #29081a); border:2px solid var(--mono-pink); box-shadow:0 0 35px rgba(255,0,85,0.4); border-radius:12px; padding:24px 20px; text-align:center; margin-top:8px;">
      <div style="font-size:3.5rem; margin-bottom:8px; animation:pulse 1.2s infinite alternate;">💀</div>
      <div class="slanted-banner pink" style="display:inline-block; font-size:0.9rem; padding:4px 18px; margin-bottom:10px;">THIS IS THE TRUTH OF THE CASE!</div>
      <h3 style="color:#ff2a8d; font-size:clamp(1.25rem, 3.2vw, 1.85rem); font-weight:900; margin:6px 0 12px 0; text-shadow:0 0 20px rgba(255,42,141,0.8);">
        "คนร้าย (The Blackened) ตัวจริงของคดีนี้... ก็คือ เรียวตะ!"
      </h3>
      <p style="color:#f1f5f9; font-size:0.95rem; line-height:1.65; max-width:720px; margin:0 auto 20px auto;">
        แม้ว่า <strong style="color:var(--court-gold);">${trapperName}</strong> จะเป็นผู้วางแผนและจัดวางกลไกกับดักน้ำหนักถ่วงและตั้งเวลาเครื่องอบผ้าไว้ก่อนมื้ออาหาร แต่ <strong>เรียวตะ</strong> ที่ฟื้นคืนสติขึ้นมาก่อนกลับใช้มีดพับตัดเชือกแล้วพยายามผูกเงื่อนเชือกเส้นใหม่เพื่อดักสังหารย้อนศร ทว่าความผิดพลาดในความมืดและความลนลานทำให้บ่วงเชือกเส้นนั้นรัดคอตนเองจนเสียชีวิต!
      </p>
      <button class="small-btn yellow" onclick="closeClosingClimaxModal(); adminSetGame('stage7');" style="font-size:1.05rem; font-weight:900; padding:12px 30px; box-shadow:0 0 25px var(--court-gold); cursor:pointer;">
        🗳️ เข้าสู่ช่วงเวลาโหวตตัดสิน (Voting Time) ▶
      </button>
    </div>
  `;

  container.innerHTML = pagesHtml + finaleHtml;
  jumpClimaxPage(1);
}

function jumpClimaxPage(pNum) {
  currentClimaxViewPage = Math.max(1, Math.min(6, pNum));
  const target = document.getElementById('climaxPageCard_' + currentClimaxViewPage);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  // Highlight active chip
  for (let i = 1; i <= 6; i++) {
    const chip = document.getElementById('climaxNavChip_' + i);
    if (chip) {
      if (i === currentClimaxViewPage) {
        chip.style.borderColor = 'var(--court-gold)';
        chip.style.background = 'rgba(255, 215, 0, 0.2)';
        chip.style.color = '#fff';
      } else {
        chip.style.borderColor = '#444';
        chip.style.background = '#222232';
        chip.style.color = '#e2e8f0';
      }
    }
  }
}

function scrollClimaxPage(delta) {
  jumpClimaxPage(currentClimaxViewPage + delta);
}

function toggleClimaxAutoPlay() {
  const btn = document.getElementById('btnClimaxAutoPlay');
  if (climaxAutoPlayTimer) {
    clearInterval(climaxAutoPlayTimer);
    climaxAutoPlayTimer = null;
    if (btn) {
      btn.innerText = '▶ เล่นอัตโนมัติ (Auto-Play)';
      btn.classList.remove('green');
      btn.classList.add('pink');
    }
    showToast('⏹️ หยุดเล่นอัตโนมัติ');
  } else {
    let curP = 1;
    jumpClimaxPage(curP);
    if (btn) {
      btn.innerText = '⏹️ หยุดเล่น (Pause)';
      btn.classList.remove('pink');
      btn.classList.add('green');
    }
    showToast('▶ เริ่มเล่นคัตซีนอัตโนมัติ...');
    climaxAutoPlayTimer = setInterval(() => {
      curP++;
      if (curP > 6) {
        clearInterval(climaxAutoPlayTimer);
        climaxAutoPlayTimer = null;
        if (btn) {
          btn.innerText = '▶ เล่นอีกครั้ง (Replay)';
          btn.classList.remove('green');
          btn.classList.add('pink');
        }
        playSfx('point_break');
      } else {
        jumpClimaxPage(curP);
        playSfx('chime');
      }
    }, 4500);
  }
}

function closeClosingClimaxModal() {
  if (climaxAutoPlayTimer) {
    clearInterval(climaxAutoPlayTimer);
    climaxAutoPlayTimer = null;
  }
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

  const roleInput = document.getElementById('mobileRoleInput');
  const role = (roleInput ? roleInput.value.trim() : '') || (new URLSearchParams(window.location.search).get('role') || '');

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

  const isHifumiJoin = Boolean(name && (name.includes('ฮิฟุมิ') || name.toLowerCase().includes('hifumi') || name.includes('ยามาดะ')));
  const pcSlotSelect = document.getElementById('mobilePcSlotSelect');
  let pcSlotVal = pcSlotSelect ? parseInt(pcSlotSelect.value, 10) : parseInt(new URLSearchParams(window.location.search).get('pc') || '1', 10);
  if (isHifumiJoin) {
    pcSlotVal = 5;
    if (pcSlotSelect) pcSlotSelect.value = '5';
  }

  const claimPacket = {
    type: 'request_claim_character',
    role: role || `สุดยอดนักเรียนมัธยมปลาย (PC ${pcSlotVal})`,
    playerName: name,
    userHash: currentUserHash,
    pcSlot: pcSlotVal,
    avatarConfig: currentAvatarConfig,
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

function getMyCredibility() {
  if (myPlayer && typeof myPlayer.credibility === 'number') return myPlayer.credibility;
  if (gameState && gameState.players) {
    const p = (myPlayer ? Object.values(gameState.players).find(x => x.id === myPlayer.id || x.name === myPlayer.name) : null)
      || (currentUserHash ? gameState.players[currentUserHash] : null);
    if (p && typeof p.credibility === 'number') return p.credibility;
  }
  return 5;
}

function submitStg1FromDropdown() {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิยื่นหลักฐานเนื่องจากแต้มความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  const sel = document.getElementById('stg1ClueSelect');
  if (!sel || !sel.value) {
    showToast('⚠️ กรุณาเลือกหลักฐานก่อนกดยืนยัน');
    playSfx('wrong');
    return;
  }
  sendStg1(sel.value);
}

function renderMobileTask(stage) {
  if (currentView === 'admin' || currentView === 'court') return;
  if (stage !== 'stage7') {
    myPlayerVoted = false;
  }
  const area = document.getElementById('mobileTaskArea');
  if (!area) return;
  area.innerHTML = '';
  updateSaboteurPanelVisibility();

  // Auto-switch to game tab if stage is active
  if (stage !== 'lobby') {
    switchPlayerTab('game');
  }

  // Check credibility = 0 Disqualification (Panic State Spectator Mode)
  const isMiniGameStage = ['stage0', 'stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7', 'closing', 'quick_question'].includes(stage);
  if (isMiniGameStage && getMyCredibility() <= 0) {
    area.innerHTML = `
      <div class="disqualified-card" style="background:rgba(30,10,15,0.95); border:2px solid #ef4444; border-radius:10px; padding:20px; text-align:center;">
        <div style="font-size:3rem; margin-bottom:10px; animation:bounce 1.5s infinite;">🖤</div>
        <h3 style="color:#ef4444; font-weight:900; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">⚠️ หมดสิทธิเข้าร่วมกิจกรรม (DISQUALIFIED)</h3>
        <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); border-radius:6px; padding:10px; margin-bottom:14px;">
          <p style="color:#fca5a5; font-size:0.9rem; margin:0; line-height:1.4; font-weight:bold;">
            แต้มความน่าเชื่อถือของคุณเหลือ 0 (Panic State / หมดสภาพ)
          </p>
          <p style="color:#cbd5e1; font-size:0.8rem; margin:6px 0 0 0;">
            คุณสูญเสียสิทธิในการส่งหลักฐาน โหวต หรือดำเนินการใดๆ ในมินิเกมนี้ จนกว่าผู้ดูแลศาล (DM) จะฟื้นฟูแต้มความน่าเชื่อถือให้คุณ
          </p>
        </div>
        <div style="font-size:0.8rem; color:#94a3b8;">
          👁️ อยู่ในสถานะผู้สังเกตการณ์ชั่วคราว (Spectator Mode)
        </div>
      </div>
    `;
    return;
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
  } else if (stage === 'stage0') {
    renderMobileStage0Task();
    return;
  } else if (stage === 'stage1') {
    const target = gameState.stg1TargetClue || 'EVD-01';
    const unlockedClueIds = getUnlockedClues();
    // Only display clues the PC actually has unlocked in their Monopad!
    let chosenIds = (Array.isArray(unlockedClueIds) && unlockedClueIds.length > 0)
      ? [...unlockedClueIds]
      : [];

    // Sort numerically by clue id (EVD-01 to EVD-31)
    chosenIds.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
      const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
      return numA - numB;
    });

    const pName = myPlayer ? myPlayer.name : 'ผู้เล่น';
    const existingSub = (gameState.stg1SubmissionsList || []).find(s => s.pName === pName);
    const hasChosen = Boolean(existingSub);
    const chosenClueId = existingSub ? existingSub.clueId : null;
    const chosenObj = chosenClueId ? (ALL_CLUES_DATA.find(c => c.id === chosenClueId) || { id: chosenClueId, name: chosenClueId }) : null;

    let formContent = '';
    if (chosenIds.length === 0) {
      formContent = `
        <div style="padding:16px; text-align:center; color:#ffe600; background:rgba(255,230,0,0.08); border:1px solid rgba(255,230,0,0.3); border-radius:8px;">
          ⚠️ คุณยังไม่มีหลักฐานใน Monopad (โปรดสำรวจเก็บหลักฐานก่อนเริ่มคดี)
        </div>
      `;
    } else {
      const optionsHtml = chosenIds.map(cid => {
        const clue = ALL_CLUES_DATA.find(c => c.id === cid) || { id: cid, name: cid };
        const cName = getClueDisplayName(clue);
        const isSelected = (chosenClueId === cid);
        return `<option value="${clue.id}" ${isSelected ? 'selected' : ''}>[${clue.id}] ${escapeHtml(cName)}</option>`;
      }).join('');

      formContent = `
        <div style="margin-bottom:14px; text-align:left;">
          <label style="font-size:0.85rem; color:#aaa; font-weight:700; display:block; margin-bottom:6px;">
            เลือกหลักฐานจากรายการที่คุณค้นพบ (${chosenIds.length} ชิ้น เรียงตามรหัส EVD):
          </label>
          <select id="stg1ClueSelect" style="width:100%; background:#1a1a2e; color:#fff; border:2px solid var(--court-gold); padding:10px; border-radius:8px; font-size:0.9rem;" ${hasChosen ? 'disabled' : ''}>
            ${optionsHtml}
          </select>
        </div>
        ${hasChosen ? `
          <div id="stg1MobileFeedback" style="margin-top:10px; padding:12px; background:rgba(0,255,136,0.15); border:1px solid #00ff88; border-radius:8px; color:#00ff88; font-weight:bold; text-align:center;">
            ✅ คุณยื่น [${chosenClueId}: ${chosenObj ? getClueDisplayName(chosenObj) : ''}] เรียบร้อยแล้ว (รอผลสรุปพร้อมเพื่อน)
          </div>
        ` : `
          <button type="button" class="p-task-btn big-action-btn" onclick="submitStg1FromDropdown()" style="background:linear-gradient(135deg, #854d0e, #ca8a04); border:2px solid var(--court-gold); color:#fff; font-weight:900; font-size:1.02rem; padding:12px; width:100%;">
            📤 ยืนยันการยื่นหลักฐาน
          </button>
        `}
      `;
    }

    area.innerHTML = `
      <h3 style="color:var(--court-gold); margin-bottom:8px; font-weight:900;">เลือกการ์ดหลักฐานที่ตรงกับอาวุธ/ปริศนา:</h3>
      <p style="color:#aaa; font-size:0.85rem; margin-bottom:12px;">(เลือกจากหลักฐานที่คุณค้นพบใน Monopad)</p>
      ${formContent}
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

    const renderRow = (keys) => `
      <div class="hangman-keyboard-row">
        ${keys.map(k => {
          const used = gameState.stg2GuessedLetters && gameState.stg2GuessedLetters.includes(k);
          return `<button class="hangman-key ${used ? 'used' : ''}" 
                    onclick="sendStg2Char('${k}')" 
                    ${used || !isMyTurn ? 'disabled' : ''}>
                    ${k}
                  </button>`;
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

    // Clues available for truth blade: ONLY from this player's unlocked inventory
    const myClueIds = getUnlockedClues();
    const activeBullets = (Array.isArray(myClueIds) && myClueIds.length > 0)
      ? myClueIds
      : ((gameState.discoveredClues && gameState.discoveredClues.length) ? gameState.discoveredClues.filter(id => id !== 'CORE-01') : ['EVD-07']);

    let bulletOptions = activeBullets.map(cid => {
      const c = ALL_CLUES_DATA.find(x => x.id === cid) || { id: cid, name: cid };
      return `<option value="${c.id}">[${c.id}] ${getClueDisplayName(c)}</option>`;
    }).join('');

    if (isChallenger) {
      area.innerHTML = `
        <h3 style="color:var(--mono-pink); margin-bottom:12px; font-weight:900;">⚔️ คุณคือ: ฝ่ายโจมตี (Truth Blade Duelist)!</h3>
        <p style="color:#aaa; font-size:0.85rem; margin-bottom:10px;">vs <strong style="color:#ffe600;">${opponent || 'ฝ่ายรับมือ'}</strong></p>
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
          <p style="color:#ddd; font-size:0.95rem; margin-top:8px;"><strong style="color:var(--court-gold);">${challenger || 'ฝ่ายโจมตี'}</strong> vs <strong style="color:#ffe600;">${opponent || 'ฝ่ายรับมือ'}</strong></p>
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
    const leftLabel = gameState.stg5LeftTeam || '🔵 ข้อสันนิษฐานคนร้ายวางกับดัก';
    const rightLabel = gameState.stg5RightTeam || '🟣 ข้อสันนิษฐานอุบัติเหตุ/เหยื่อทำตัวเอง';
    const topicLabel = gameState.stg5Topic || 'ศึกสองขั้วความคิด';

    area.innerHTML = `
      <h3 style="color:var(--mono-yellow); margin-bottom:6px; font-weight:900;">Debate Scrum: เลือกดันฝั่งที่คุณเชื่อมั่น!</h3>
      <p style="font-size:0.88rem; color:#ccc; margin-bottom:14px;">หัวข้อ: "${topicLabel}"</p>
      <div style="display:flex; flex-direction:column; gap:12px;">
        <button class="p-task-btn big-action-btn" style="background:#092537; border:3px solid #00f0ff; color:#00f0ff; box-shadow:4px 4px 0 #000; font-size:1.02rem; font-weight:900; transition:all 0.1s ease;" onclick="playerScrumPush(-4, this)">
          👈 ดัน ${leftLabel}
        </button>
        <button class="p-task-btn big-action-btn" style="background:#370e28; border:3px solid #ff2b6d; color:#ff2b6d; box-shadow:4px 4px 0 #000; font-size:1.02rem; font-weight:900; transition:all 0.1s ease;" onclick="playerScrumPush(4, this)">
          👉 ดัน ${rightLabel}
        </button>
      </div>
    `;
  } else if (stage === 'stage6') {
    const targetName = gameState.stg6TargetPlayer || 'ผู้ถูกกล่าวหา';
    const isTarget = Boolean(myPlayer && (
      myPlayer.name === targetName ||
      targetName.includes(myPlayer.name) ||
      myPlayer.name.includes(targetName) ||
      ((myPlayer.isKiller || parseInt(myPlayer.pcSlot, 10) === 5) && (targetName.includes('ฮิฟุมิ') || targetName.includes('Hifumi') || targetName.includes('คนร้าย') || targetName.includes('Blackened')))
    ));

    const isShootingPhase = gameState.stg6Phase === 'shooting';
    const isFinalReady = Boolean(gameState.stg6FinalReady);
    const isDefeat = Boolean(gameState.stg6Defeat);

    if (isTarget) {
      // VIEW FOR ACCUSED (คนโดนรุมวางเกราะ)
      if (!isShootingPhase) {
        if (!stg6AccusedPlacement) {
          stg6AccusedPlacement = { arm: [], leg: [], core: [], traps: [] };
        }
        if (!stg6AccusedPlacement.arm) stg6AccusedPlacement.arm = [];
        if (!stg6AccusedPlacement.leg) stg6AccusedPlacement.leg = stg6AccusedPlacement.shoulder || [];
        if (!stg6AccusedPlacement.core) stg6AccusedPlacement.core = [];
        if (!stg6AccusedPlacement.traps) stg6AccusedPlacement.traps = [];

        const curType = (stg6AccusedPlacingType === 'shoulder') ? 'leg' : (stg6AccusedPlacingType || 'arm');
        const p = stg6AccusedPlacement;
        const armCnt = p.arm?.length || 0;
        const legCnt = (p.leg?.length || p.shoulder?.length) || 0;
        const coreCnt = p.core?.length || 0;
        const trapsCnt = p.traps?.length || 0;
        const totalPlaced = armCnt + legCnt + coreCnt + trapsCnt;

        const armAdj = armCnt === 2 && areStg6CellsAdjacent(p.arm[0], p.arm[1]);
        const legAdj = legCnt === 2 && areStg6CellsAdjacent((p.leg || p.shoulder)[0], (p.leg || p.shoulder)[1]);
        const canConfirm = (armCnt === 2 && armAdj) && (legCnt === 2 && legAdj) && (coreCnt === 1) && (trapsCnt === 2);

        let gridCellsHtml = '';
        for (let i = 0; i < 16; i++) {
          const coord = formatStg6Coord(i);
          let assignedType = null;
          let label = '?';
          let bg = 'rgba(15,23,42,0.85)';
          let border = '1px solid #334155';
          let textColor = '#64748b';

          if (p.arm?.includes(i)) {
            assignedType = 'arm'; label = '🛡️ แขน'; bg = 'rgba(56,189,248,0.3)'; border = '2px solid #38bdf8'; textColor = '#38bdf8';
          } else if (p.leg?.includes(i) || p.shoulder?.includes(i)) {
            assignedType = 'leg'; label = '🛡️ ขา'; bg = 'rgba(56,189,248,0.3)'; border = '2px solid #38bdf8'; textColor = '#38bdf8';
          } else if (p.core?.includes(i)) {
            assignedType = 'core'; label = '⚡ แกน'; bg = 'rgba(250,204,21,0.35)'; border = '2px solid #facc15'; textColor = '#facc15';
          } else if (p.traps?.includes(i)) {
            assignedType = 'traps'; label = '⚠️ กับดัก'; bg = 'rgba(168,85,247,0.35)'; border = '2px solid #a855f7'; textColor = '#c084fc';
          }

          gridCellsHtml += `
            <div onclick="stg6TogglePlaceCell(${i})" style="position:relative; aspect-ratio:1; background:${bg}; border:${border}; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; user-select:none; transition:all 0.15s;">
              <span style="position:absolute; top:2px; left:4px; font-size:0.6rem; color:#64748b; font-family:monospace;">${coord}</span>
              <span style="font-size:0.75rem; font-weight:bold; color:${textColor}; margin-top:6px;">${label}</span>
            </div>
          `;
        }

        area.innerHTML = `
          <div style="background:rgba(20,10,30,0.95); border:2px solid var(--mono-pink); border-radius:10px; padding:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:0.8rem; background:var(--mono-pink); color:#fff; font-weight:900; padding:2px 8px; border-radius:4px;">🛡️ ติดตั้งเกราะลับ</span>
              <span style="font-size:0.78rem; color:#fca5a5;">วางแล้ว: <strong>${totalPlaced} / 7 ช่อง</strong></span>
            </div>
            <p style="font-size:0.78rem; color:#cbd5e1; margin-bottom:10px; line-height:1.3;">
              คุณกำลังถูกทั้งศาลระดมยิง! เลือกชิ้นส่วนด้านล่าง แล้วแตะตาราง 4x4 เพื่อแอบติดตั้งตำแหน่งเกราะและกับดัก:
            </p>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px;">
              <button type="button" class="p-task-btn" onclick="stg6SelectPlaceType('arm')" style="padding:6px; font-size:0.78rem; background:${curType === 'arm' ? '#0369a1' : '#0f172a'}; border:2px solid ${curType === 'arm' ? '#38bdf8' : '#334155'}; color:#fff;">
                🛡️ เกราะแขน (${armCnt}/2) ${armCnt === 2 ? (armAdj ? '✓ ติดกัน' : '⚠️ ไม่ติดกัน') : ''}
              </button>
              <button type="button" class="p-task-btn" onclick="stg6SelectPlaceType('leg')" style="padding:6px; font-size:0.78rem; background:${curType === 'leg' ? '#0369a1' : '#0f172a'}; border:2px solid ${curType === 'leg' ? '#38bdf8' : '#334155'}; color:#fff;">
                🛡️ เกราะขา (${legCnt}/2) ${legCnt === 2 ? (legAdj ? '✓ ติดกัน' : '⚠️ ไม่ติดกัน') : ''}
              </button>
              <button type="button" class="p-task-btn" onclick="stg6SelectPlaceType('core')" style="padding:6px; font-size:0.78rem; background:${curType === 'core' ? '#854d0e' : '#0f172a'}; border:2px solid ${curType === 'core' ? '#facc15' : '#334155'}; color:#fff;">
                ⚡ แกนหัวใจ (${coreCnt}/1)
              </button>
              <button type="button" class="p-task-btn" onclick="stg6SelectPlaceType('traps')" style="padding:6px; font-size:0.78rem; background:${curType === 'traps' ? '#6b21a8' : '#0f172a'}; border:2px solid ${curType === 'traps' ? '#c084fc' : '#334155'}; color:#fff;">
                ⚠️ กับดัก (${trapsCnt}/2)
              </button>
            </div>

            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-bottom:10px;">
              ${gridCellsHtml}
            </div>

            <div style="display:flex; gap:8px;">
              <button type="button" class="p-task-btn" onclick="stg6AccusedAutoPlace()" style="flex:1; padding:8px; font-size:0.85rem; background:#334155; border:1px solid #64748b; color:#f8fafc;">
                🎲 สุ่มวางอัตโนมัติ
              </button>
              <button type="button" class="p-task-btn" onclick="stg6ConfirmPlacement()" style="flex:1.2; padding:8px; font-size:0.88rem; font-weight:900; background:${canConfirm ? '#15803d' : '#1e293b'}; border:2px solid ${canConfirm ? '#22c55e' : '#475569'}; color:${canConfirm ? '#fff' : '#94a3b8'};" ${canConfirm ? '' : 'disabled'}>
                ✅ ยืนยันตำแหน่งเกราะ
              </button>
            </div>
          </div>
        `;
      } else {
        // Shooting Phase (Accused Spectator Grid)
        const p = gameState.stg6Secret || { arm: [], leg: [], core: [], traps: [] };
        const legCells = p.leg || p.shoulder || [];
        const gridData = gameState.stg6Grid || Array(16).fill(null);

        let defenseCellsHtml = '';
        for (let i = 0; i < 16; i++) {
          const coord = formatStg6Coord(i);
          const state = gridData[i];
          let bg = 'rgba(15,23,42,0.85)';
          let border = '1px solid #334155';
          let icon = '·';
          let textColor = '#475569';

          if (p.arm?.includes(i) || legCells.includes(i)) {
            border = '1px dashed #38bdf8'; icon = '🛡️';
          } else if (p.core?.includes(i)) {
            border = '1px dashed #facc15'; icon = '⚡';
          } else if (p.traps?.includes(i)) {
            border = '1px dashed #c084fc'; icon = '⚠️';
          }

          if (state === 'hit') {
            bg = 'radial-gradient(circle, #b91c1c, #450a0a)'; border = '2px solid #ef4444'; icon = '💥'; textColor = '#fca5a5';
          } else if (state === 'miss') {
            bg = 'radial-gradient(circle, #0369a1, #082f49)'; border = '2px solid #38bdf8'; icon = '💦'; textColor = '#bae6fd';
          } else if (state === 'trap') {
            bg = 'radial-gradient(circle, #9333ea, #3b0764)'; border = '2px solid #c084fc'; icon = '⚡'; textColor = '#e9d5ff';
          }

          defenseCellsHtml += `
            <div style="position:relative; aspect-ratio:1; background:${bg}; border:${border}; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
              <span style="position:absolute; top:2px; left:4px; font-size:0.58rem; color:#64748b; font-family:monospace;">${coord}</span>
              <span style="font-size:0.95rem; color:${textColor}; margin-top:6px;">${icon}</span>
            </div>
          `;
        }

        area.innerHTML = `
          <div style="background:rgba(20,10,30,0.95); border:2px solid var(--mono-pink); border-radius:10px; padding:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:0.8rem; background:#dc2626; color:#fff; font-weight:900; padding:2px 8px; border-radius:4px;">🚨 กำลังถูกระดมยิง!</span>
              <span style="font-size:0.82rem; color:var(--court-gold); font-weight:bold;">เกราะเหลือ: ${gameState.stg6BlocksRemaining} / 5</span>
            </div>
            <p style="font-size:0.78rem; color:#cbd5e1; margin-bottom:8px;">
              ศาลกำลังระดมยิงเกราะของคุณ! ดูความเคลื่อนไหวสดจากจอเรดาร์ลับ:
            </p>
            <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-bottom:10px;">
              ${defenseCellsHtml}
            </div>
            <div style="background:rgba(0,0,0,0.4); padding:8px; border-radius:6px; font-size:0.75rem; color:#94a3b8; text-align:center;">
              ตาของ: <strong style="color:#38bdf8;">${(gameState.stg6Accusers && gameState.stg6Accusers[gameState.stg6CurrentTurnIndex]) || 'ฝ่ายศาล'}</strong> กำลังเล็งยิง...
            </div>
          </div>
        `;
      }
    } else {
      // VIEW FOR ACCUSERS (ฝ่ายศาลที่เหลือ)
      if (!isShootingPhase) {
        area.innerHTML = `
          <div style="background:rgba(15,23,42,0.95); border:2px solid #38bdf8; border-radius:10px; padding:18px; text-align:center;">
            <div style="font-size:2rem; margin-bottom:8px; animation:spin 3s infinite linear;">🛰️</div>
            <h3 style="color:#38bdf8; margin-bottom:6px; font-weight:900;">Argument Armament: Rhythm Battleship</h3>
            <p style="font-size:0.88rem; color:#cbd5e1; line-height:1.4; margin-bottom:12px;">
              กำลังรอผู้ถูกกล่าวหา <strong style="color:var(--mono-pink);">[${targetName}]</strong> ติดตั้งเกราะลับและกับดักสะท้อน...
            </p>
            <div style="font-size:0.78rem; color:#94a3b8; background:rgba(0,0,0,0.3); padding:8px; border-radius:6px;">
              ระดมยิงกระสุนความจริงกองกลาง 8 นัด เพื่อทำลายเกราะ 3 ส่วนให้สิ้นซาก!
            </div>
          </div>
        `;
      } else if (isFinalReady) {
        area.innerHTML = `
          <div style="background:rgba(40,10,20,0.95); border:3px solid var(--court-gold); border-radius:10px; padding:16px; text-align:center; box-shadow:0 0 20px rgba(250,204,21,0.6);">
            <div style="font-size:2.2rem; margin-bottom:6px;">💥</div>
            <h3 style="color:var(--court-gold); margin-bottom:6px; font-weight:900;">เกราะการปฏิเสธพังทลายสิ้นเชิงแล้ว!</h3>
            <p style="font-size:0.85rem; color:#f8fafc; margin-bottom:14px;">
              เปิดช่องว่างหัวใจคนร้าย! ลั่นไกกระสุนความจริงนัดสุดท้ายเพื่อปิดฉาก!
            </p>
            <button class="p-task-btn big-action-btn" style="background:linear-gradient(135deg, #991b1b, #dc2626); border:3px solid var(--court-gold); box-shadow:0 0 16px var(--court-gold); font-size:1.1rem; color:#fff; font-weight:900;" onclick="sendStg6FinalBlow()">
              🎯 ยิงกระสุนความจริงนัดสุดท้าย!
            </button>
          </div>
        `;
      } else if (isDefeat) {
        area.innerHTML = `
          <div style="background:rgba(30,10,10,0.95); border:2px solid #ef4444; border-radius:10px; padding:16px; text-align:center;">
            <div style="font-size:2rem; margin-bottom:6px;">💀</div>
            <h3 style="color:#ef4444; margin-bottom:6px; font-weight:900;">กระสุนกองกลางหมดเกลี้ยง!</h3>
            <p style="font-size:0.85rem; color:#cbd5e1;">
              ไม่สามารถทลายเกราะคนร้ายได้ทัน... รอผู้ดูแลศาล (DM) ตัดสินใจเริ่มใหม่ (Retry) หรือทลายเกราะ (OK)
            </p>
          </div>
        `;
      } else {
        const curShooter = (gameState.stg6Accusers && gameState.stg6Accusers[gameState.stg6CurrentTurnIndex]) || '';
        const isMyTurn = Boolean(myPlayer && myPlayer.name === curShooter);
        const poolAmmo = (typeof gameState.stg6PoolAmmo === 'number') ? gameState.stg6PoolAmmo : 8;
        const gridData = gameState.stg6Grid || Array(16).fill(null);

        let shooterGridHtml = '';
        for (let i = 0; i < 16; i++) {
          const coord = formatStg6Coord(i);
          const state = gridData[i];
          const isSelected = (stg6AccuserSelectedCoord === i);

          let bg = 'rgba(15,23,42,0.85)';
          let border = '1px solid #334155';
          let content = `<span style="font-size:0.9rem; color:#475569;">?</span>`;
          let cursor = isMyTurn && !state ? 'cursor:pointer;' : 'cursor:default;';

          if (state === 'hit') {
            bg = 'radial-gradient(circle, #b91c1c, #450a0a)'; border = '2px solid #ef4444';
            content = `<span style="font-size:1.1rem;">💥</span><span style="font-size:0.6rem; color:#fca5a5;">HIT</span>`;
          } else if (state === 'miss') {
            bg = 'radial-gradient(circle, #0369a1, #082f49)'; border = '2px solid #38bdf8';
            content = `<span style="font-size:1.1rem;">💦</span><span style="font-size:0.6rem; color:#bae6fd;">MISS</span>`;
          } else if (state === 'trap') {
            bg = 'radial-gradient(circle, #9333ea, #3b0764)'; border = '2px solid #c084fc';
            content = `<span style="font-size:1.1rem;">⚡</span><span style="font-size:0.6rem; color:#e9d5ff;">TRAP</span>`;
          } else if (isSelected) {
            bg = 'rgba(0, 240, 255, 0.25)'; border = '2px solid #00ffff';
            content = `<span style="font-size:1.1rem; color:#00ffff;">🎯</span>`;
          }

          shooterGridHtml += `
            <div onclick="${isMyTurn && !state ? `stg6SelectCoord(${i})` : ''}" style="position:relative; aspect-ratio:1; background:${bg}; border:${border}; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; ${cursor} transition:all 0.15s; ${isSelected ? 'box-shadow:0 0 14px #00ffff;' : ''}">
              <span style="position:absolute; top:2px; left:4px; font-size:0.6rem; color:#64748b; font-family:monospace;">${coord}</span>
              ${content}
            </div>
          `;
        }

        const hasSelectedCoord = (typeof stg6AccuserSelectedCoord === 'number' && stg6AccuserSelectedCoord >= 0 && stg6AccuserSelectedCoord <= 15 && (!gameState.stg6Grid || !gameState.stg6Grid[stg6AccuserSelectedCoord]));
        const selectedCoordStr = hasSelectedCoord ? formatStg6Coord(stg6AccuserSelectedCoord) : 'ยังไม่ได้เลือก';
        const hasPenalty = Boolean(gameState.stg6TrapPenaltyActive);
        const needleClass = hasSelectedCoord
          ? `stg6-reticle-needle oscillating ${hasPenalty ? 'penalty' : ''}`
          : 'stg6-reticle-needle stationary';

        if (isMyTurn) {
          if (stg6ShotPending) {
            // Keep needle frozen and feedback visible during pause
            return;
          }
          area.innerHTML = `
            <div style="background:rgba(10,20,35,0.95); border:2px solid #38bdf8; border-radius:10px; padding:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.8rem; background:#0284c7; color:#fff; font-weight:900; padding:2px 8px; border-radius:4px; animation:pulseGlow 1.2s infinite alternate;">🎯 ตาของคุณเล็งยิง!</span>
                <span style="font-size:0.82rem; color:#facc15; font-weight:bold;">กระสุนกองกลาง: ${poolAmmo}/8 นัด</span>
              </div>
              <p style="font-size:0.78rem; color:#94a3b8; margin-bottom:8px;">
                1. แตะเลือกตำแหน่งเป้าหมายในตาราง 2. ตัวจับจังหวะจะเริ่มขยับ 3. กดยิงให้ตรงโซน!
              </p>

              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-bottom:10px;">
                ${shooterGridHtml}
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; font-size:0.82rem;">
                <span style="color:#94a3b8;">เป้าหมายที่เล็ง: <strong style="color:${hasSelectedCoord ? '#00ffff' : '#f59e0b'}; font-size:0.95rem;">[ ${selectedCoordStr} ]</strong></span>
                ${hasPenalty ? '<span style="color:#c084fc; font-weight:bold; font-size:0.75rem;">⚡ TRAP ACTIVE (เข็มเร็ว 1.5x)</span>' : ''}
              </div>

              <div class="stg6-reticle-container" style="margin-top:4px; margin-bottom:10px; padding:8px; position:relative;">
                <div id="stg6MobileTrack" class="stg6-reticle-track" style="height:38px; position:relative; overflow:hidden;">
                  <div class="reticle-zone-miss"></div>
                  <div class="reticle-zone-good" style="color:#00ff88;">GOOD</div>
                  <div class="reticle-zone-perfect" style="color:#000;">PERFECT</div>
                  <div class="reticle-zone-good" style="color:#00ff88;">GOOD</div>
                  <div class="reticle-zone-miss"></div>
                  <div id="stg6MobileNeedle" class="${needleClass}"></div>
                  ${!hasSelectedCoord ? `
                    <div style="position:absolute; inset:0; background:rgba(15,23,42,0.85); display:flex; align-items:center; justify-content:center; color:#facc15; font-size:0.78rem; font-weight:bold; z-index:15; letter-spacing:0.5px; border-radius:4px;">
                      🔒 เลือกตำแหน่งในตารางก่อน ตัวจับจังหวะจึงจะขยับ
                    </div>
                  ` : ''}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.68rem; color:#64748b; margin-top:4px; padding:0 4px;">
                  <span>MISS (เสียกระสุน)</span>
                  <span style="color:#00ff88;">GOOD (ยิงโดน)</span>
                  <span style="color:#facc15;">PERFECT (+1 คืนกองกลาง)</span>
                  <span style="color:#00ff88;">GOOD (ยิงโดน)</span>
                  <span>MISS (เสียกระสุน)</span>
                </div>
              </div>

              ${hasSelectedCoord ? `
                <button id="stg6FireBtn" type="button" class="p-task-btn big-action-btn" style="background:linear-gradient(135deg, #0369a1, #0284c7); border:3px solid #38bdf8; box-shadow:0 0 16px rgba(56,189,248,0.7); font-size:1.15rem; font-weight:900; color:#fff; cursor:pointer;" onclick="stg6FireShot()">
                  🎯 FIRE! ลั่นไกพิกัด [${selectedCoordStr}]
                </button>
              ` : `
                <button id="stg6FireBtn" type="button" class="p-task-btn big-action-btn" style="background:#1e293b; border:2px solid #475569; color:#94a3b8; font-size:1.02rem; font-weight:bold; cursor:not-allowed; opacity:0.8;" onclick="stg6FireShot()">
                  👆 กรุณาเลือกตำแหน่งในตารางก่อนจึงจะยิงได้
                </button>
              `}
            </div>
          `;
        } else {
          area.innerHTML = `
            <div style="background:rgba(15,23,42,0.95); border:2px solid #334155; border-radius:10px; padding:12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <span style="font-size:0.8rem; background:#334155; color:#cbd5e1; font-weight:bold; padding:2px 8px; border-radius:4px;">⏳ รอตาเพื่อนยิง</span>
                <span style="font-size:0.82rem; color:#facc15; font-weight:bold;">กระสุนกองกลาง: ${poolAmmo}/8 นัด</span>
              </div>
              <p style="font-size:0.82rem; color:#f8fafc; margin-bottom:8px; text-align:center;">
                ตาของ: <strong style="color:#38bdf8; font-size:0.95rem;">[${curShooter}]</strong> กำลังเล็งยิง...
              </p>
              <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; margin-bottom:10px;">
                ${shooterGridHtml}
              </div>
              <div style="font-size:0.75rem; color:#94a3b8; text-align:center; background:rgba(0,0,0,0.3); padding:6px; border-radius:4px;">
                เกราะคงเหลือ: <strong style="color:var(--court-gold);">${gameState.stg6BlocksRemaining} / 5 ช่อง</strong>
              </div>
            </div>
          `;
        }
      }
    }
  } else if (stage === 'quick_question') {
    const qq = gameState.qqData || QUICK_QUESTION_PRESETS[0];
    const myId = myPlayer ? myPlayer.id : (currentUserHash || 'p_anon');
    const myVote = (qq.votes && (qq.votes[myId] || (myPlayer && qq.votes[myPlayer.name])));
    const hasVoted = Boolean(myVote);
    const isRevealed = Boolean(qq.revealed);
    const choices = qq.choices || { A: '', B: '', C: '' };
    const votes = qq.votes || {};
    const totalVotes = Object.keys(votes).length;

    const counts = { A: 0, B: 0, C: 0 };
    Object.values(votes).forEach(v => {
      if (counts[v] !== undefined) counts[v]++;
    });

    const choicesHtml = ['A', 'B', 'C'].map(ch => {
      const isSelected = (myVote === ch);
      const isCorrect = isRevealed && (qq.correct === ch);
      const isWrongSelection = isRevealed && isSelected && !isCorrect;
      const count = counts[ch] || 0;
      const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

      let cardClass = 'qq-mob-card';
      if (isRevealed) {
        if (isCorrect) {
          cardClass += ' correct';
        } else if (isWrongSelection) {
          cardClass += ' wrong';
        } else {
          cardClass += ' dimmed';
        }
      } else if (isSelected) {
        cardClass += ' selected';
      }

      let badgeContent = ch;
      if (isRevealed && isCorrect) badgeContent = '✓';

      let statusBadge = '';
      if (isRevealed) {
        if (isCorrect) {
          statusBadge = `<span class="qq-mob-status" style="color:#34d399;">✅ คำตอบที่ถูก (${count})</span>`;
        } else if (isSelected) {
          statusBadge = `<span class="qq-mob-status" style="color:#f87171;">❌ ตัวเลือกของคุณ (${count})</span>`;
        } else {
          statusBadge = `<span class="qq-mob-status" style="color:#64748b;">${count} โหวต (${pct}%)</span>`;
        }
      } else if (isSelected) {
        statusBadge = `<span class="qq-mob-status" style="color:#00f0ff;">✓ ที่คุณเลือก</span>`;
      }

      const clickAction = (!hasVoted && !isRevealed) ? `sendQuickQuestionVote('${ch}')` : '';

      return `
        <div class="${cardClass}" onclick="${clickAction}">
          <div class="qq-mob-badge">${badgeContent}</div>
          <div class="qq-mob-text">
            <div style="font-weight:700; color:#fff;">ข้อ ${ch}</div>
            <div style="font-size:0.88rem; color:#cbd5e1; margin-top:2px;">${escapeHtml(choices[ch] || '')}</div>
          </div>
          ${statusBadge}
        </div>
      `;
    }).join('');

    let summaryCard = '';
    if (isRevealed) {
      const isMyChoiceCorrect = (myVote === qq.correct);
      summaryCard = `
        <div class="qq-mob-summary" style="margin-top:12px; padding:10px 14px; border-radius:8px; background:${isMyChoiceCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}; border:1.5px solid ${isMyChoiceCorrect ? '#10b981' : '#ef4444'}; text-align:center;">
          <div style="font-weight:900; font-size:0.95rem; color:${isMyChoiceCorrect ? '#34d399' : '#f87171'};">
            ${isMyChoiceCorrect ? '🎉 คุณตอบคำถามถูกต้อง!' : '⚠️ คำตอบของคุณยังไม่ถูกต้อง'}
          </div>
          <div style="font-size:0.82rem; color:#cbd5e1; margin-top:4px;">
            เฉลยคำตอบคือข้อ <strong>[${qq.correct}] ${escapeHtml(choices[qq.correct] || '')}</strong>
          </div>
        </div>
      `;
    } else {
      summaryCard = `
        <div style="font-size:0.8rem; color:${hasVoted ? '#00ff88' : '#94a3b8'}; text-align:center; padding:8px; background:rgba(0,0,0,0.3); border-radius:6px; margin-top:10px;">
          ${hasVoted
            ? `✅ คุณลงมติข้อ [${myVote}] แล้ว (รอผู้เล่นคนอื่นโหวตครบเพื่อสรุปผล)`
            : 'แตะเลือกคำตอบที่คุณคิดว่าถูกต้อง 1 ข้อ'}
        </div>
      `;
    }

    area.innerHTML = `
      <div style="background:rgba(15,23,42,0.95); border:2px solid #00f0ff; border-radius:10px; padding:14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="background:#0284c7; color:#fff; font-size:0.75rem; font-weight:900; padding:2px 8px; border-radius:4px;">⚡ FLASH QUESTION</span>
          <span style="font-size:0.75rem; color:#94a3b8;">${isRevealed ? '🏁 เฉลยแล้ว' : (hasVoted ? '✓ ลงมติแล้ว' : '⏳ รอการตอบ')}</span>
        </div>
        <h3 style="color:#00f0ff; font-size:1.02rem; font-weight:900; margin-bottom:12px; line-height:1.4;">
          ${escapeHtml(qq.question)}
        </h3>
        <div style="display:flex; flex-direction:column;">
          ${choicesHtml}
        </div>
        ${summaryCard}
      </div>
    `;
  } else if (stage === 'closing') {
    const courtPage = gameState.closingCurrentPage || 1;
    const curPage = playerPreviewClosingPage || courtPage;
    const isViewingCourtPage = (curPage === courtPage);
    const pageData = CLOSING_PAGES_DATA.find(p => p.page === curPage) || CLOSING_PAGES_DATA[0];
    const pageSlots = pageData.panels.filter(p => p.type === 'slot');

    // Retrieve my hand with robust multi-key resolution
    const myCards = getMyClosingCards();

    // Slots HTML on viewed page
    const slotsHtml = pageSlots.map(s => {
      const isSolved = gameState.closingSlots && gameState.closingSlots[s.slotId];
      if (isSolved) {
        return `
          <div style="background:#0d2616; border:2px solid #00ff88; border-radius:8px; padding:10px 12px; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
            <div>
              <span style="color:#00ff88; font-weight:900; font-size:0.85rem;">✅ ช่องที่ ${s.pageSlot} (เติมถูกต้องแล้ว):</span>
              <div style="color:#fff; font-size:0.8rem; margin-top:2px; line-height:1.3;">${s.desc}</div>
            </div>
            <span style="font-size:1.4rem; margin-left:8px; color:#00ff88;">✓</span>
          </div>
        `;
      } else if (isViewingCourtPage) {
        const hasSelected = Boolean(selectedClosingCardId);
        const slotBorder = hasSelected ? '2px dashed #ff2b6d' : '2px dashed #475569';
        const slotBg = hasSelected ? '#2a112d' : '#141426';
        const slotActionColor = hasSelected ? '#ff2b6d' : '#94a3b8';
        const slotActionTxt = hasSelected ? '👈 วางการ์ดที่เลือก!' : 'แตะเพื่อวาง';
        const pulseStyle = hasSelected ? 'animation: pulseGlow 1.5s infinite alternate;' : '';
        return `
          <button class="p-task-btn" onclick="submitSelectedClosingCard(${s.slotId})" style="background:${slotBg}; border:${slotBorder}; border-radius:8px; padding:12px; margin-bottom:8px; width:100%; text-align:left; cursor:pointer; transition:all 0.2s ease; ${pulseStyle}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="color:${slotActionColor}; font-weight:900; font-size:0.9rem;">📥 ช่องที่ ${s.pageSlot}:</span>
                <div style="color:#e2e8f0; font-size:0.82rem; margin-top:3px; line-height:1.3;">${s.title}</div>
              </div>
              <span style="font-size:0.85rem; color:${slotActionColor}; font-weight:900; white-space:nowrap; margin-left:8px; padding:4px 8px; background:rgba(0,0,0,0.3); border-radius:4px;">${slotActionTxt}</span>
            </div>
          </button>
        `;
      } else {
        return `
          <div style="background:#141426; border:2px dashed #334155; border-radius:8px; padding:12px; margin-bottom:8px; opacity:0.85;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="color:#94a3b8; font-weight:900; font-size:0.9rem;">🔒 ช่องที่ ${s.pageSlot} (ดูตัวอย่าง):</span>
                <div style="color:#cbd5e1; font-size:0.82rem; margin-top:3px; line-height:1.3;">${s.title}</div>
              </div>
              <button type="button" onclick="showToast('👀 คุณกำลังดูตัวอย่างหน้าที่ ${curPage} — ต้องวางตามหน้าที่จอหลักเปิดอยู่ (หน้า ${courtPage}) เท่านั้น'); playSfx('wrong');" style="font-size:0.75rem; color:#f87171; font-weight:800; padding:4px 8px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); border-radius:4px; cursor:pointer;">
                👀 ดูเฉยๆ (ห้ามวาง)
              </button>
            </div>
          </div>
        `;
      }
    }).join('');

    // Cards HTML in player hand
    const cardsHtml = myCards.map(c => {
      const isPlaced = Boolean(c.slot && gameState.closingSlots && gameState.closingSlots[c.slot]);
      const cardTitle = formatClosingText(c.title);
      if (isPlaced) {
        return `
          <div class="p-closing-card placed" style="background:#0d1d16; border:1px solid #1e5238; border-radius:8px; padding:10px; margin-bottom:8px; opacity:0.65; cursor:default; display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.5rem; filter:grayscale(0.5);">✅</span>
            <div style="flex:1;">
              <div style="font-size:0.85rem; color:#86efac; font-weight:700; text-decoration:line-through;">
                <span style="background:#166534; color:#dcfce7; font-size:0.7rem; font-weight:900; padding:1px 6px; border-radius:3px; margin-right:6px;">✓ วางในมังงะแล้ว</span>${cardTitle}
              </div>
              <div style="font-size:0.75rem; color:#4ade80; margin-top:2px;">(บรรจุลงในหน้ามังงะเรียบร้อยแล้ว)</div>
            </div>
          </div>
        `;
      }
      const isSelected = selectedClosingCardId === c.id;
      if (c.locked) {
        return `
          <div class="p-closing-card locked" onclick="showToast('🔒 การ์ดใบนี้ถูกล็อกอยู่! ต้องรอให้เพื่อนช่วยกันไขช่องก่อนหน้าให้สำเร็จก่อน'); playSfx('wrong');" style="background:#0f111a; border:2px dashed #2e2e42; border-radius:8px; padding:10px; margin-bottom:8px; opacity:0.6; cursor:not-allowed; display:flex; align-items:center; gap:10px;">
            <span style="font-size:1.5rem; filter:grayscale(1);">🔒</span>
            <div style="flex:1;">
              <span style="font-size:0.85rem; color:#94a3b8; font-weight:700;">🔒 การ์ดปริศนา [ยังไม่ถูกปลดล็อก]</span>
              <div style="font-size:0.75rem; color:#64748b; margin-top:2px;">(แลกเปลี่ยนและปรึกษากับเพื่อนในศาลที่มีการ์ดปลดล็อก)</div>
            </div>
          </div>
        `;
      } else {
        const borderStyle = isSelected ? '3px solid #ff2b6d' : '2px solid #444466';
        const bgStyle = isSelected ? 'rgba(255, 43, 109, 0.28)' : '#19192e';
        const shadowStyle = isSelected ? 'box-shadow: 0 0 16px rgba(255, 43, 109, 0.85); transform: scale(1.02);' : '';
        return `
          <div class="p-closing-card ${isSelected ? 'selected' : ''}" onclick="selectClosingCard('${c.id}')" style="background:${bgStyle}; border:${borderStyle}; border-radius:8px; padding:12px; margin-bottom:10px; cursor:pointer; display:flex; align-items:center; gap:10px; ${shadowStyle} transition:all 0.2s ease;">
            <span style="font-size:1.6rem;">${c.icon || '📄'}</span>
            <div style="flex:1;">
              <div style="font-size:0.88rem; color:#fff; font-weight:${isSelected ? '900' : 'bold'}; line-height:1.35;">${cardTitle}</div>
              <div style="font-size:0.78rem; color:${isSelected ? 'var(--court-gold)' : 'var(--mono-cyan)'}; margin-top:4px; font-weight:${isSelected ? '800' : 'normal'};">
                ${isSelected ? '👉 [เลือกการ์ดใบนี้แล้ว!] แตะปุ่มช่องว่างด้านบนเพื่อวาง' : '👆 แตะเพื่อเลือกการ์ดใบนี้'}
              </div>
            </div>
          </div>
        `;
      }
    }).join('');

    const returnCourtBtn = !isViewingCourtPage ? `
      <div style="margin-bottom:8px;">
        <button type="button" onclick="playerSetClosingPage(${courtPage})" class="small-btn yellow" style="font-size:0.78rem; padding:6px 12px; width:100%; font-weight:800; cursor:pointer;">
          📌 กลับไปยังหน้าที่จอหลักเปิดอยู่ (หน้า ${courtPage}) เพื่อวางการ์ด
        </button>
      </div>
    ` : '';

    area.innerHTML = `
      <div style="margin-bottom:12px; border-bottom:1px solid #333348; padding-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="color:var(--mono-pink); font-weight:900; font-size:0.95rem;">📖 มังงะสรุปคดี (หน้า ${curPage} / 5)</span>
          <span style="color:${isViewingCourtPage ? '#00ff88' : '#f59e0b'}; font-size:0.75rem; font-weight:700;">
            ${isViewingCourtPage ? `🟢 ซิงค์กับจอหลัก (หน้า ${courtPage})` : `👀 ดูตัวอย่าง (จอหลัก: หน้า ${courtPage})`}
          </span>
        </div>
        ${returnCourtBtn}
        <!-- Mobile Page Navigator -->
        <div style="display:flex; align-items:center; justify-content:space-between; gap:4px; margin-bottom:8px; background:#121324; padding:5px 8px; border-radius:6px; border:1px solid #2a2a44;">
          <button type="button" onclick="playerSetClosingPage(${Math.max(1, curPage - 1)})" style="background:#222238; border:1px solid #444; color:#fff; border-radius:4px; padding:4px 8px; font-size:0.75rem; cursor:pointer;" ${curPage === 1 ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>◀ ก่อนหน้า</button>
          <div style="display:flex; gap:4px;">
            ${[1, 2, 3, 4, 5].map(p => {
              const isActive = (p === curPage);
              const pData = CLOSING_PAGES_DATA.find(x => x.page === p);
              const pSlots = pData ? pData.panels.filter(x => x.type === 'slot').map(x => x.slotId) : [];
              const pSolved = pSlots.length > 0 && pSlots.every(sId => gameState.closingSlots && gameState.closingSlots[sId]);
              const isCourtCurrent = (p === courtPage);
              const bg = isActive ? 'var(--mono-pink)' : (pSolved ? '#00ff88' : '#22223a');
              const color = (isActive || pSolved) ? '#000' : '#aaa';
              const border = isCourtCurrent ? '2px solid var(--court-gold)' : (isActive ? '1px solid #fff' : '1px solid #444');
              return `<span onclick="playerSetClosingPage(${p})" style="cursor:pointer; width:24px; height:24px; line-height:22px; text-align:center; font-size:0.75rem; font-weight:900; border-radius:4px; display:inline-block; background:${bg}; color:${color}; border:${border};" title="${isCourtCurrent ? 'หน้าที่จอหลักกำลังเปิด' : ''}">${p}</span>`;
            }).join('')}
          </div>
          <button type="button" onclick="playerSetClosingPage(${Math.min(5, curPage + 1)})" style="background:#222238; border:1px solid #444; color:#fff; border-radius:4px; padding:4px 8px; font-size:0.75rem; cursor:pointer;" ${curPage === 5 ? 'disabled style="opacity:0.4; pointer-events:none;"' : ''}>ถัดไป ▶</button>
        </div>
        <div style="color:#fff; font-size:0.85rem; font-weight:700; line-height:1.3;">${pageData.title}</div>
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
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิยื่นหลักฐานเนื่องจากแต้มความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
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
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิเล่นมินิเกมเนื่องจากแต้มความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  broadcast({ type: 'stg2_char', char: char });
}

function sendStg2(idx, char) {
  sendStg2Char(char);
}

function sendRebuttalSlash() {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิ์ฟันข้อโต้แย้งเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  const sel = document.getElementById('rebuttalEquippedBullet');
  const bullet = sel ? sel.value : 'EVD-01';
  broadcast({ type: 'rebuttal_slash', bullet: bullet, playerName: myPlayer ? myPlayer.name : 'ผู้เล่น' });
}

function sendLogicDiveChoice(ch) {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิ์ตอบคำถามเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
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

function getMyClosingCards() {
  if (currentView === 'admin' || currentView === 'court') return [];
  if (!gameState.closingPlayerHands) return [];

  // 1. Try myPlayer object
  if (typeof myPlayer !== 'undefined' && myPlayer) {
    if (myPlayer.id && gameState.closingPlayerHands[myPlayer.id]) return gameState.closingPlayerHands[myPlayer.id];
    if (myPlayer.userHash && gameState.closingPlayerHands[myPlayer.userHash]) return gameState.closingPlayerHands[myPlayer.userHash];
    if (myPlayer.name && gameState.closingPlayerHands[myPlayer.name]) return gameState.closingPlayerHands[myPlayer.name];
    if (myPlayer.pcSlot && gameState.closingPlayerHands['pc_' + myPlayer.pcSlot]) return gameState.closingPlayerHands['pc_' + myPlayer.pcSlot];
    if (myPlayer.pcSlot && gameState.closingPlayerHands['pc' + myPlayer.pcSlot]) return gameState.closingPlayerHands['pc' + myPlayer.pcSlot];
  }
  // 2. Try currentUserHash
  if (typeof currentUserHash !== 'undefined' && currentUserHash && gameState.closingPlayerHands[currentUserHash]) {
    return gameState.closingPlayerHands[currentUserHash];
  }
  // 3. Try URL params
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const qPc = urlParams.get('pc');
    if (qPc) {
      if (gameState.closingPlayerHands['pc_' + qPc]) return gameState.closingPlayerHands['pc_' + qPc];
      if (gameState.closingPlayerHands['pc' + qPc]) return gameState.closingPlayerHands['pc' + qPc];
    }
    const qUser = urlParams.get('user');
    if (qUser && gameState.closingPlayerHands[qUser]) return gameState.closingPlayerHands[qUser];
    const qName = urlParams.get('name');
    if (qName && gameState.closingPlayerHands[qName]) return gameState.closingPlayerHands[qName];
  } catch(e) {}

  // 4. Try local fallback
  if (gameState.closingPlayerHands['local']) return gameState.closingPlayerHands['local'];

  // 5. Fallback first key
  const keys = Object.keys(gameState.closingPlayerHands);
  if (keys.length > 0) return gameState.closingPlayerHands[keys[0]];

  return [];
}

function selectClosingCard(cardId) {
  const cardObj = CLOSING_CARDS_DATA.find(c => c.id === cardId);
  if (cardObj && cardObj.slot && gameState.closingSlots && gameState.closingSlots[cardObj.slot]) {
    showToast('✓ การ์ดใบนี้ถูกนำไปวางในมังงะเรียบร้อยแล้ว!');
    return;
  }
  if (selectedClosingCardId === cardId) {
    selectedClosingCardId = null; // deselect
  } else {
    selectedClosingCardId = cardId;
    playSfx('menu_select');
  }
  renderMobileTask('closing');
}

function submitSelectedClosingCard(slotId) {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิ์วางการ์ดสรุปคดีเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }

  const courtPage = gameState.closingCurrentPage || 1;
  let targetPage = 1;
  for (const p of CLOSING_PAGES_DATA) {
    if (p.panels.some(pan => pan.type === 'slot' && pan.slotId === Number(slotId))) {
      targetPage = p.page;
      break;
    }
  }
  if (targetPage !== courtPage) {
    showToast(`⚠️ ช่องนี้อยู่ในหน้าที่ ${targetPage} แต่จอหลักกำลังเปิดหน้าที่ ${courtPage}! ต้องวางตามหน้าที่จอหลักเปิดอยู่เท่านั้น`);
    playSfx('wrong');
    return;
  }

  let cardToSubmit = selectedClosingCardId;
  // Smart fallback: If no card currently selected, check if player holds an unlocked card for this slot
  if (!cardToSubmit) {
    const myCards = getMyClosingCards();
    const availableCards = myCards.filter(c => !c.locked && !(c.slot && gameState.closingSlots && gameState.closingSlots[c.slot]));
    const targetCardId = CLOSING_SLOT_TO_CARD[slotId];
    const matchingCard = availableCards.find(c => c.id === targetCardId);
    if (matchingCard) {
      cardToSubmit = matchingCard.id;
    } else if (availableCards.length === 1) {
      cardToSubmit = availableCards[0].id;
    }
  }

  if (!cardToSubmit) {
    showToast('⚠️ กรุณาแตะเลือกการ์ดในมือก่อน แล้วค่อยกดวางลงช่องนี้!');
    playSfx('wrong');
    return;
  }

  sendClosingCard(slotId, cardToSubmit);
  selectedClosingCardId = null;
  renderMobileTask('closing');
}

function sendClosingCard(slot, cardId) {
  const pName = (typeof myPlayer !== 'undefined' && myPlayer && myPlayer.name) ? myPlayer.name : 'ผู้เล่น';
  broadcast({
    type: 'closing_submit',
    slot: slot,
    cardId: cardId,
    playerName: pName
  });
  if (typeof isHost !== 'undefined' && isHost) {
    handleClosingSubmit(slot, cardId, pName);
  }
}

// ==========================================================
// STAGE 6 RHYTHM BATTLESHIP INTERACTION HELPERS (MOBILE)
// ==========================================================
let stg6AccusedPlacingType = 'shoulder';
let stg6AccusedPlacement = { shoulder: [], arm: [], core: [], traps: [] };
let stg6AccuserSelectedCoord = null;
let stg6ShotPending = false;

function stg6SelectPlaceType(type) {
  stg6AccusedPlacingType = type;
  renderMobileTask('stage6');
}

function stg6TogglePlaceCell(idx) {
  if (!stg6AccusedPlacement) {
    stg6AccusedPlacement = { shoulder: [], arm: [], core: [], traps: [] };
  }
  const curType = stg6AccusedPlacingType || 'shoulder';
  const limits = { shoulder: 2, arm: 2, core: 1, traps: 2 };
  const maxLimit = limits[curType] || 2;

  // Remove idx from other categories if present
  ['shoulder', 'arm', 'core', 'traps'].forEach(k => {
    if (k !== curType && stg6AccusedPlacement[k]) {
      stg6AccusedPlacement[k] = stg6AccusedPlacement[k].filter(i => i !== idx);
    }
  });

  if (!stg6AccusedPlacement[curType]) stg6AccusedPlacement[curType] = [];
  const list = stg6AccusedPlacement[curType];
  const exists = list.indexOf(idx);
  if (exists >= 0) {
    list.splice(exists, 1);
  } else {
    if (list.length >= maxLimit) {
      list.shift(); // rotate out oldest
    }
    list.push(idx);
  }
  renderMobileTask('stage6');
}

function stg6AccusedAutoPlace() {
  stg6AccusedPlacement = generateRandomStg6Placements();
  renderMobileTask('stage6');
}

function stg6ConfirmPlacement() {
  if (getMyCredibility() <= 0) {
    showToast('⚠️ คุณหมดสิทธิ์เข้าร่วมกิจกรรมเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  if (!stg6AccusedPlacement) return;
  const p = stg6AccusedPlacement;
  const arm = p.arm || [];
  const leg = p.leg || p.shoulder || [];
  const core = p.core || [];
  const traps = p.traps || [];

  if (arm.length !== 2) {
    showToast('⚠️ กรุณาวาง เกราะแขน ให้ครบ 2 ช่องติดกัน');
    return;
  }
  if (!areStg6CellsAdjacent(arm[0], arm[1])) {
    showToast('⚠️ เกราะแขน ต้องวาง 2 ช่องติดกัน (แนวนอนหรือแนวตั้ง)');
    return;
  }
  if (leg.length !== 2) {
    showToast('⚠️ กรุณาวาง เกราะขา ให้ครบ 2 ช่องติดกัน');
    return;
  }
  if (!areStg6CellsAdjacent(leg[0], leg[1])) {
    showToast('⚠️ เกราะขา ต้องวาง 2 ช่องติดกัน (แนวนอนหรือแนวตั้ง)');
    return;
  }
  if (core.length !== 1) {
    showToast('⚠️ กรุณาวาง แกนหัวใจ ให้ครบ 1 ช่อง');
    return;
  }
  if (traps.length !== 2) {
    showToast('⚠️ กรุณาวาง กับดักสะท้อน ให้ครบ 2 ช่อง');
    return;
  }

  p.leg = leg;
  p.shoulder = leg;
  p.arm = arm;
  p.core = core;
  p.traps = traps;

  const pName = myPlayer ? myPlayer.name : (gameState.stg6TargetPlayer || 'ผู้ถูกกล่าวหา');
  broadcast({
    type: 'stg6_setup_secret',
    secret: p,
    playerName: pName
  });
  if (typeof isHost !== 'undefined' && isHost) {
    handleStg6SetupSecret(p, pName);
  }
}

function stg6SelectCoord(idx) {
  if (gameState.stg6Grid && gameState.stg6Grid[idx]) return;
  if (stg6AccuserSelectedCoord === idx) {
    stg6AccuserSelectedCoord = null;
  } else {
    stg6AccuserSelectedCoord = idx;
    playSfx('menu_select');
  }
  renderMobileTask('stage6');
}

function getStg6NeedlePosition(needleEl, trackEl) {
  if (needleEl && trackEl) {
    const nRect = needleEl.getBoundingClientRect();
    const tRect = trackEl.getBoundingClientRect();
    if (tRect.width > 0) {
      const leftRel = (nRect.left + nRect.width / 2) - tRect.left;
      return Math.max(0, Math.min(100, (leftRel / tRect.width) * 100));
    }
  }
  const period = gameState.stg6TrapPenaltyActive ? 800 : 1200;
  const phase = (Date.now() % period) / period;
  return Math.abs((phase * 2) - 1) * 100;
}

function stg6FireShot() {
  if (stg6ShotPending) return;
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิยิงกระสุนเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  if (!myPlayer) return;
  const pName = myPlayer.name;
  const poolAmmo = gameState.stg6PoolAmmo !== undefined ? gameState.stg6PoolAmmo : ((gameState.stg6PlayerAmmo && gameState.stg6PlayerAmmo[pName]) || 0);
  if (poolAmmo <= 0) {
    showToast('⚠️ กระสุนกองกลางหมดแล้ว!');
    return;
  }

  const hasSelected = (typeof stg6AccuserSelectedCoord === 'number' && stg6AccuserSelectedCoord >= 0 && stg6AccuserSelectedCoord <= 15 && (!gameState.stg6Grid || !gameState.stg6Grid[stg6AccuserSelectedCoord]));
  if (!hasSelected) {
    showToast('⚠️ กรุณาเลือกตำแหน่งในตารางก่อน ตัวจับจังหวะจึงจะเริ่มขยับและสามารถยิงได้!');
    playSfx('wrong');
    return;
  }

  const targetIdx = stg6AccuserSelectedCoord;
  const needle = document.getElementById('stg6MobileNeedle');
  const track = document.getElementById('stg6MobileTrack');
  const pos = getStg6NeedlePosition(needle, track);

  const isPenalty = Boolean(gameState.stg6TrapPenaltyActive);
  let timing = 'miss';
  if (isPenalty) {
    if (pos >= 47 && pos <= 53) timing = 'perfect';
    else if ((pos >= 35 && pos < 47) || (pos > 53 && pos <= 65)) timing = 'good';
    else timing = 'miss';
  } else {
    if (pos >= 44 && pos <= 56) timing = 'perfect';
    else if ((pos >= 25 && pos < 44) || (pos > 56 && pos <= 75)) timing = 'good';
    else timing = 'miss';
  }

  // Freeze needle in place immediately to show player where they fired!
  stg6ShotPending = true;
  if (needle) {
    needle.classList.remove('oscillating', 'penalty');
    needle.style.animation = 'none';
    needle.style.left = `${pos}%`;
    needle.style.transition = 'none';
    if (timing === 'perfect') {
      needle.style.background = '#facc15';
      needle.style.boxShadow = '0 0 16px #facc15';
    } else if (timing === 'good') {
      needle.style.background = '#00ff88';
      needle.style.boxShadow = '0 0 16px #00ff88';
    } else {
      needle.style.background = '#ef4444';
      needle.style.boxShadow = '0 0 16px #ef4444';
    }
  }

  // Visual feedback on the fire button
  const fireBtn = document.getElementById('stg6FireBtn');
  const missDist = Math.abs(Math.round(pos - 50));
  if (fireBtn) {
    fireBtn.disabled = true;
    if (timing === 'perfect') {
      fireBtn.innerHTML = `⭐ PERFECT! (แม่นยำ 100% กึ่งกลาง)`;
      fireBtn.style.background = 'linear-gradient(135deg, #ca8a04, #eab308)';
      fireBtn.style.borderColor = '#fde047';
      playSfx('counter');
    } else if (timing === 'good') {
      fireBtn.innerHTML = `✅ GOOD! (ห่างศูนย์กลาง ${missDist}%)`;
      fireBtn.style.background = 'linear-gradient(135deg, #15803d, #22c55e)';
      fireBtn.style.borderColor = '#86efac';
      playSfx('blade');
    } else {
      fireBtn.innerHTML = `❌ MISS! (ห่างศูนย์กลาง ${missDist}%)`;
      fireBtn.style.background = 'linear-gradient(135deg, #b91c1c, #dc2626)';
      fireBtn.style.borderColor = '#fca5a5';
      playSfx('wrong');
    }
  } else {
    if (timing === 'miss') playSfx('wrong');
    else if (timing === 'perfect') playSfx('counter');
    else playSfx('blade');
  }

  // Hold frozen state for 900ms so player clearly perceives the needle stop position
  setTimeout(() => {
    stg6ShotPending = false;
    stg6AccuserSelectedCoord = null;

    broadcast({
      type: 'stg6_shot_fired',
      shooter: pName,
      cellIndex: targetIdx,
      timing: timing
    });
    if (typeof isHost !== 'undefined' && isHost) {
      handleStg6Shot(pName, targetIdx, timing);
    }
    renderMobileTask('stage6');
  }, 900);
}

function sendStg6FinalBlow() {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิ์ยิงกระสุนความจริงเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
  broadcast({ type: 'stg6_final_blow', playerName: myPlayer ? myPlayer.name : 'ผู้เล่น' });
  const box = document.getElementById('finalBlowMobileBox');
  if (box) box.innerHTML = '<div style="color:#00ff88; font-weight:900; font-size:1.1rem;">🎯 ยิงกระสุนความจริงเข้าเป้าหมายสำเร็จ!</div>';
}

let myPlayerVoted = false;

function submitPlayerVote(cand) {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณไม่มีสิทธิ์ลงมติเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    playSfx('wrong');
    return;
  }
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
function isCurrentPlayerSaboteur() {
  const urlParams = new URLSearchParams(window.location.search);
  const qPc = urlParams.get('pc');
  const qUser = (urlParams.get('user') || '').toLowerCase();
  const qName = (urlParams.get('name') || '').toLowerCase();

  if (qPc === '5' || qUser.includes('hifumi') || qName.includes('ฮิฟุมิ') || qName.includes('hifumi')) {
    return true;
  }

  // Check myPlayer
  if (myPlayer) {
    if (parseInt(myPlayer.pcSlot, 10) === 5 || myPlayer.isKiller === true) return true;
    if (myPlayer.name && (myPlayer.name.includes('ฮิฟุมิ') || myPlayer.name.toLowerCase().includes('hifumi') || myPlayer.name.includes('ยามาดะ'))) return true;
    if (myPlayer.role === 'ช่างกล' || myPlayer.role === 'นักเขียนการ์ตูน') return true;
  }

  // Check in gameState.players
  if (gameState && gameState.players) {
    const pList = Object.values(gameState.players);
    const p = pList.find(x => 
      (myPlayer && (x.id === myPlayer.id || x.name === myPlayer.name || (x.userHash && x.userHash === myPlayer.userHash))) ||
      (currentUserHash && x.userHash === currentUserHash) ||
      (qUser && (x.userHash === qUser || x.id === qUser))
    );
    if (p) {
      if (parseInt(p.pcSlot, 10) === 5 || p.isKiller === true) return true;
      if (p.name && (p.name.includes('ฮิฟุมิ') || p.name.toLowerCase().includes('hifumi') || p.name.includes('ยามาดะ'))) return true;
      if (p.role === 'ช่างกล' || p.role === 'นักเขียนการ์ตูน') return true;
    }
  }

  return false;
}

function updateSaboteurPanelVisibility() {
  const fab = document.getElementById('mobileSaboteurTrigger');
  const sheet = document.getElementById('mobileSaboteurPanel');
  const isSab = isCurrentPlayerSaboteur();

  // Sabotage panel is available starting from investigation phase onwards (investigation, trial, and all minigames)
  const currentStage = gameState ? gameState.stage : '';
  const isStageActive = (
    currentStage === 'investigation' ||
    currentStage === 'trial' ||
    (currentStage && currentStage.startsWith('stage')) ||
    currentStage === 'closing' ||
    currentStage === 'quick_question'
  );

  if (fab) {
    // Discreet stealth FAB: visible only to PC 5 starting from investigation onwards
    if (isSab && isStageActive) {
      fab.classList.remove('hidden');
    } else {
      fab.classList.add('hidden');
    }
  }

  if ((!isSab || !isStageActive) && sheet) {
    sheet.classList.add('hidden');
  }
}

function toggleSaboteurDock() {
  const sheet = document.getElementById('mobileSaboteurPanel');
  if (!sheet) return;
  if (sheet.classList.contains('hidden')) {
    sheet.classList.remove('hidden');
    playSfx('click');
  } else {
    sheet.classList.add('hidden');
  }
}

let isSaboteurCamouflaged = false;
function toggleSaboteurCamouflage() {
  isSaboteurCamouflaged = !isSaboteurCamouflaged;
  const titleEl = document.getElementById('sabHeaderTitle');
  const camoBtn = document.getElementById('sabCamoBtn');
  const dotEl = document.getElementById('sabStatusDot');

  if (isSaboteurCamouflaged) {
    if (titleEl) titleEl.innerText = 'MONOPAD // SYS_DIAGNOSTICS';
    if (camoBtn) camoBtn.innerText = '⚡ ถอดพราง';
    if (dotEl) {
      dotEl.style.background = '#3498db';
      dotEl.style.boxShadow = '0 0 6px #3498db';
    }
    const disguises = {
      sabBtnGlitch: ['เครือข่ายสัญญาณ', 'ทดสอบคลื่นความถี่'],
      sabBtnTimer: ['ซิงค์เวลาเครื่อง', 'ปรับเทียบเวลาท้องถิ่น'],
      sabBtnCorrupt: ['ล้างแคชข้อมูล', 'ฟลัชหน่วยความจำ'],
      sabBtnSound: ['ทดสอบลำโพง', 'ตรวจจับสัญญาณเสียง'],
      sabBtnScramble: ['อัปเดตสารบบ', 'จัดเรียงดัชนีใหม่'],
      sabBtnSmoke: ['เซ็นเซอร์ระบายควัน', 'ตรวจจับก๊าซในระบบ'],
      sabBtnRumor: ['บรอดแคสต์สถานะ', 'ตรวจเช็กข่าวประกาศ'],
      sabBtnShock: ['ทดสอบการสั่น', 'ทดสอบแรงสะเทือน']
    };
    Object.keys(disguises).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        const nameEl = btn.querySelector('.sab-card-name');
        const descEl = btn.querySelector('.sab-card-desc');
        if (nameEl) nameEl.innerText = disguises[id][0];
        if (descEl) descEl.innerText = disguises[id][1];
      }
    });
    showToast('🕶️ เปิดโหมดพรางตา: สลับเป็นเมนูตรวจสอบเครื่องทันที');
  } else {
    if (titleEl) titleEl.innerText = 'SYS_OVERRIDE // TACTICAL';
    if (camoBtn) camoBtn.innerText = '🕶️ พรางตา';
    if (dotEl) {
      dotEl.style.background = '#2ecc71';
      dotEl.style.boxShadow = '0 0 6px #2ecc71';
    }
    const originals = {
      sabBtnGlitch: ['ก่อกวนสัญญาณ', 'จอเพื่อนเบลอ 4s'],
      sabBtnTimer: ['เร่งเวลาศาล', 'ตัดเวลาทันที -10s'],
      sabBtnCorrupt: ['แทรกแซงข้อมูล', 'ลดเกจศาล -10%'],
      sabBtnSound: ['ตัดเสียงคัดค้าน', 'สัญญาณเสียงศาลดับ 6s'],
      sabBtnScramble: ['ป่วน Monopad', 'สั่นจอหลักฐานเพื่อน 6s'],
      sabBtnSmoke: ['ม่านควันบังตา', 'ควันดำบังจอมินิเกม 5s'],
      sabBtnRumor: ['ปล่อยข่าวลวง', 'ขึ้นข่าวลือโมโนคุมะลวง'],
      sabBtnShock: ['ทลายสมาธิ', 'เขย่าจอ + หัวเราะ อุ๊ปุ๊ๆๆๆ']
    };
    Object.keys(originals).forEach(id => {
      const btn = document.getElementById(id);
      if (btn) {
        const nameEl = btn.querySelector('.sab-card-name');
        const descEl = btn.querySelector('.sab-card-desc');
        if (nameEl) nameEl.innerText = originals[id][0];
        if (descEl) descEl.innerText = originals[id][1];
      }
    });
  }
}

const sabotageCooldowns = {
  glitch: 45,
  drain_time: 40,
  corrupt_data: 40,
  sound_jammer: 50,
  clue_scramble: 50,
  smoke_blind: 60,
  fake_rumor: 60,
  panic_shock: 35
};

const sabotageActiveCooldowns = {};

function sendSabotage(type) {
  if (getMyCredibility() <= 0) {
    showToast('❌ คุณหมดสิทธิ์ก่อกวนเนื่องจากค่าความน่าเชื่อถือเหลือ 0 (Panic State)');
    return;
  }
  if (sabotageActiveCooldowns[type]) {
    showToast(`⏳ ความสามารถนี้กำลังติดคูลดาวน์ (${sabotageActiveCooldowns[type]}s)`);
    return;
  }

  playSfx('glitch');

  const myHash = currentUserHash || (myPlayer && myPlayer.userHash) || (myPlayer && myPlayer.id) || (myPlayer && myPlayer.name);
  const myName = (myPlayer && myPlayer.name) ? myPlayer.name : 'คนร้าย';

  // Broadcast sabotage packet with senderHash for sender immunity
  broadcast({
    type: 'sabotage',
    sabType: type,
    playerName: myName,
    senderHash: myHash
  });

  const cd = sabotageCooldowns[type] || 45;
  sabotageActiveCooldowns[type] = cd;

  const btnMap = {
    glitch: 'sabBtnGlitch',
    drain_time: 'sabBtnTimer',
    corrupt_data: 'sabBtnCorrupt',
    sound_jammer: 'sabBtnSound',
    clue_scramble: 'sabBtnScramble',
    smoke_blind: 'sabBtnSmoke',
    fake_rumor: 'sabBtnRumor',
    panic_shock: 'sabBtnShock'
  };

  const tagMap = {
    glitch: 'cd_glitch',
    drain_time: 'cd_drain_time',
    corrupt_data: 'cd_corrupt_data',
    sound_jammer: 'cd_sound_jammer',
    clue_scramble: 'cd_clue_scramble',
    smoke_blind: 'cd_smoke_blind',
    fake_rumor: 'cd_fake_rumor',
    panic_shock: 'cd_panic_shock'
  };

  const btn = document.getElementById(btnMap[type]);
  const tag = document.getElementById(tagMap[type]);
  if (btn) btn.disabled = true;

  const timerId = setInterval(() => {
    if (!sabotageActiveCooldowns[type]) {
      clearInterval(timerId);
      return;
    }
    sabotageActiveCooldowns[type]--;
    const rem = sabotageActiveCooldowns[type];
    if (tag) tag.innerText = `${rem}s`;
    if (rem <= 0) {
      clearInterval(timerId);
      delete sabotageActiveCooldowns[type];
      if (btn) btn.disabled = false;
      if (tag) tag.innerText = `${cd}s`;
    }
  }, 1000);

  showToast(`⚡ ส่งคำสั่งแทรกแซง [${type}] แล้ว (คุณได้รับการยกเว้นผลกระทบ)`);
}

function handleSabotage(type, pName, senderHash) {
  const myHash = currentUserHash || (myPlayer && myPlayer.userHash) || (myPlayer && myPlayer.id) || (myPlayer && myPlayer.name);
  const isMe = Boolean(myHash && senderHash && (myHash === senderHash || (myPlayer && myPlayer.name === pName)));

  // CRITICAL: Sabotage Isolation for DM/Admin View
  if (currentView === 'admin') {
    logCourt(`[DM LOG] ⚡ ตรวจพบการแทรกแซงจากคนร้าย: ${type} (${pName || 'Saboteur'})`);
    return;
  }

  // System status adjustments (apply to Court screen & state)
  if (type === 'drain_time') {
    gameState.timeRemaining = Math.max(5, (gameState.timeRemaining || 0) - 10);
    updateTimerDisplay();
    logCourt(`⏱️ [TIME GLITCH]: เวลาศาลชั้นเรียนถูกเร่งรัดกะทันหัน! (-10s)`);
    playSfx('wrong');
    return;
  } else if (type === 'corrupt_data') {
    gameState.influence = Math.max(0, (gameState.influence || 100) - 10);
    updateInfluenceDisplay();
    logCourt(`⚠️ [DATA CORRUPT]: เกจความน่าเชื่อถือศสารถูกแทรกแซงลดลง! (-10%)`);
    playSfx('wrong');
    return;
  }

  // SABOTEUR CAMOUFLAGE (PC 5 / Blackened):
  // Show fake visual disruption on PC 5's screen too so table neighbors sitting beside PC 5 don't suspect them!
  // Displays a discreet badge allowing PC 5 to tap anywhere to dismiss immediately.
  if (isMe) {
    applySaboteurCamouflage(type);
    return;
  }

  if (type === 'glitch') {
    playSfx('glitch');
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
  } else if (type === 'sound_jammer') {
    playSfx('glitch');
    const banner = document.getElementById('audioJammerBanner');
    if (banner) {
      banner.classList.remove('hidden');
      setTimeout(() => {
        banner.classList.add('hidden');
      }, 6000);
    }
    logCourt(`🔇 [AUDIO JAMMER]: สัญญาณเสียงคัดค้านและลำโพงศสารถูกตัดชั่วคราว (6 วินาที)`);
  } else if (type === 'clue_scramble') {
    playSfx('break');
    const clueSec = document.getElementById('playerSectionClues') || document.getElementById('mobileCluesList');
    if (clueSec) {
      clueSec.classList.add('clue-scramble-jam');
      setTimeout(() => {
        clueSec.classList.remove('clue-scramble-jam');
      }, 6000);
    }
    logCourt(`🌀 [EMP PULSE]: ระบบบันทึกหลักฐาน Monopad ถูกคลื่นแม่เหล็กรบกวน (6 วินาที)`);
  } else if (type === 'smoke_blind') {
    playSfx('wrong');
    const smoke = document.getElementById('screenSmoke');
    if (smoke) {
      smoke.classList.remove('hidden');
      smoke.style.display = 'flex';
      setTimeout(() => {
        smoke.classList.add('hidden');
        smoke.style.display = 'none';
      }, 5000);
    }
    logCourt(`💨 [SMOKE BOMB]: ม่านควันหนาทึบบดบังทัศนวิสัยศาลชั้นเรียน! (5 วินาที)`);
  } else if (type === 'fake_rumor') {
    playSfx('laugh');
    const rumor = document.getElementById('fakeRumorBanner');
    const rumorTxt = document.getElementById('fakeRumorText');
    const rumors = [
      'มีรายงานลับว่าคำให้การหรือหลักฐานชิ้นล่าสุดถูกสับเปลี่ยนโดยบุคคลปริศนา!?',
      'ระบบรักษาความปลอดภัยแจ้งเตือน: อาจมีผู้บริสุทธิ์ถูกป้ายสีในรอบโต้เถียงนี้!',
      'คำใบ้ลับจาก Monokuma: สิ่งที่เห็นในกระเป๋าเสื้อเหยื่อ อาจไม่ใช่ของเหยื่อตั้งแต่แรก...?',
      'บันทึก Monopad มีความผิดปกติ! กระสุนความจริงบางนัดอาจสูญเสียพลัง!'
    ];
    if (rumorTxt) {
      rumorTxt.innerText = rumors[Math.floor(Math.random() * rumors.length)];
    }
    if (rumor) {
      rumor.classList.remove('hidden');
      setTimeout(() => {
        rumor.classList.add('hidden');
      }, 6000);
    }
    logCourt(`📢 [BREAKING RUMOR]: ข่าวลือปั่นป่วนถูกแพร่กระจายในศาล!`);
  } else if (type === 'panic_shock') {
    playSfx('laugh');
    document.body.classList.add('sabotage-screen-shake');
    setTimeout(() => {
      document.body.classList.remove('sabotage-screen-shake');
    }, 1200);
    logCourt(`💥 [PANIC SHOCK]: จิตใจของผู้เข้าร่วมศาลสั่นคลอนกะทันหัน!`);
  }
}

function applySaboteurCamouflage(type) {
  let badge = document.getElementById('sabotageCamouflageBadge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'sabotageCamouflageBadge';
    badge.className = 'sabotage-camouflaged-badge';
    badge.innerHTML = '🕶️ ระบบพรางตัว (ตบตาเพื่อน) • [แตะเพื่อปลดทันที]';
    badge.onclick = dismissSabotageCamouflage;
    document.body.appendChild(badge);
  }

  if (type === 'glitch') {
    const overlay = document.getElementById('screenGlitch');
    if (overlay) {
      overlay.classList.remove('hidden');
      overlay.style.display = 'flex';
      overlay.onclick = dismissSabotageCamouflage;
      setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
        const b = document.getElementById('sabotageCamouflageBadge');
        if (b) b.remove();
      }, 4000);
    }
  } else if (type === 'smoke_blind') {
    const smoke = document.getElementById('screenSmoke');
    if (smoke) {
      smoke.classList.remove('hidden');
      smoke.style.display = 'flex';
      smoke.onclick = dismissSabotageCamouflage;
      setTimeout(() => {
        if (smoke) smoke.style.display = 'none';
        const b = document.getElementById('sabotageCamouflageBadge');
        if (b) b.remove();
      }, 5000);
    }
  } else if (type === 'sound_jammer') {
    const banner = document.getElementById('audioJammerBanner');
    if (banner) {
      banner.classList.remove('hidden');
      banner.onclick = dismissSabotageCamouflage;
      setTimeout(() => {
        if (banner) banner.classList.add('hidden');
        const b = document.getElementById('sabotageCamouflageBadge');
        if (b) b.remove();
      }, 6000);
    }
  } else if (type === 'clue_scramble') {
    const clueSec = document.getElementById('playerSectionClues') || document.getElementById('mobileCluesList');
    if (clueSec) {
      clueSec.classList.add('clue-scramble-jam');
      setTimeout(() => {
        if (clueSec) clueSec.classList.remove('clue-scramble-jam');
        const b = document.getElementById('sabotageCamouflageBadge');
        if (b) b.remove();
      }, 6000);
    }
  } else if (type === 'fake_rumor') {
    const rumor = document.getElementById('fakeRumorBanner');
    if (rumor) {
      rumor.classList.remove('hidden');
      setTimeout(() => {
        if (rumor) rumor.classList.add('hidden');
        const b = document.getElementById('sabotageCamouflageBadge');
        if (b) b.remove();
      }, 6000);
    }
  }

  document.body.classList.add('sabotage-screen-shake');
  setTimeout(() => {
    document.body.classList.remove('sabotage-screen-shake');
  }, 900);
}

function dismissSabotageCamouflage() {
  const badge = document.getElementById('sabotageCamouflageBadge');
  if (badge) badge.remove();
  const overlay = document.getElementById('screenGlitch');
  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
    overlay.onclick = null;
  }
  const smoke = document.getElementById('screenSmoke');
  if (smoke) {
    smoke.classList.add('hidden');
    smoke.style.display = 'none';
    smoke.onclick = null;
  }
  const banner = document.getElementById('audioJammerBanner');
  if (banner) {
    banner.classList.add('hidden');
    banner.onclick = null;
  }
  const rumor = document.getElementById('fakeRumorBanner');
  if (rumor) rumor.classList.add('hidden');
  const clueSec = document.getElementById('playerSectionClues') || document.getElementById('mobileCluesList');
  if (clueSec) clueSec.classList.remove('clue-scramble-jam');
  document.body.classList.remove('sabotage-screen-shake');
  showToast('🕶️ ปลดเอฟเฟกต์พรางตัวเรียบร้อย (เพื่อนโต๊ะข้างๆ ยังคิดว่าคุณโดนป่วน)');
}

// ==========================================================
// FAKE EMERGENCY ESCAPE PROTOCOL & PROXIMITY SENSOR
// ==========================================================
let currentEscapePin = '';
let escapeCountdownTimer = null;

function isMyEscapeProximityGranted() {
  if (!gameState) return false;
  if (!gameState.escapeProximity) gameState.escapeProximity = {};
  if (gameState.escapeProximity['*'] === true) return true;
  if (currentUserHash && gameState.escapeProximity[currentUserHash] === true) return true;
  if (myPlayer) {
    if (myPlayer.userHash && gameState.escapeProximity[myPlayer.userHash] === true) return true;
    if (myPlayer.id && gameState.escapeProximity[myPlayer.id] === true) return true;
    if (myPlayer.name && gameState.escapeProximity[myPlayer.name] === true) return true;
    if (myPlayer.pcSlot && (gameState.escapeProximity['pc_' + myPlayer.pcSlot] === true || gameState.escapeProximity[myPlayer.pcSlot] === true)) return true;
  }
  return false;
}

function updateEscapeProximityUI() {
  const card = document.getElementById('pSecretEscapeCard');
  const badge = document.getElementById('pEscapeProximityBadge');
  const btn = document.getElementById('btnStartEscapeBypass');
  if (!card && !btn) return;

  const isGranted = isMyEscapeProximityGranted();

  if (card) {
    card.classList.toggle('unlocked', isGranted);
    card.classList.toggle('locked', !isGranted);
  }

  if (badge) {
    if (isGranted) {
      badge.innerText = '🔓 พิกัดพร้อมถอดรหัส';
      badge.className = 'proximity-badge unlocked';
    } else {
      badge.innerText = '🔒 พิกัดถูกล็อก';
      badge.className = 'proximity-badge locked';
    }
  }

  if (btn) {
    if (isGranted) {
      btn.disabled = false;
      btn.className = 'dangan-action-btn red pulse-anim';
      btn.innerText = '🚨 เซนเซอร์ยืนยันพิกัดแล้ว! กดเพื่อเริ่มถอดรหัส (BYPASS)';
    } else {
      btn.disabled = true;
      btn.className = 'dangan-action-btn grey';
      btn.innerText = '🔒 เซนเซอร์ล็อก: ยังไม่ได้รับการยืนยันพิกัดหน้าประตูจาก DM';
    }
  }
}

function updateAdminEscapeProximityDisplay() {
  const select = document.getElementById('adminEscapePlayerSelect');
  const chips = document.getElementById('adminEscapeProximityStatusChips');
  if (!select && !chips) return;

  if (!gameState.escapeProximity) gameState.escapeProximity = {};
  const prox = gameState.escapeProximity;
  const players = gameState.players ? Object.values(gameState.players) : [];

  if (select) {
    const curVal = select.value;
    let html = '<option value="">-- เลือกผู้เล่นที่อยู่หน้าประตู --</option>';
    players.forEach(p => {
      const uKey = p.userHash || p.id || p.name;
      const isOk = (prox['*'] === true) || (prox[uKey] === true) || (prox[p.name] === true);
      html += `<option value="${escapeHtml(uKey)}">${escapeHtml(p.name)} (${p.role || 'PC ' + (p.pcSlot || '?')}) ${isOk ? ' [🔓 ปลดล็อก]' : ' [🔒 ล็อก]'}</option>`;
    });
    select.innerHTML = html;
    if (curVal) select.value = curVal;
  }

  if (chips) {
    let chipsHtml = '';
    if (prox['*'] === true) {
      chipsHtml = `<span class="proximity-badge unlocked" style="display:inline-block; margin:2px;">🌐 ทุกคน (All PCs): ยืนยันพิกัดแล้ว</span>`;
    } else if (players.length === 0) {
      chipsHtml = `<span style="font-size:0.75rem; color:#777;">(ยังไม่มีผู้เล่นออนไลน์)</span>`;
    } else {
      players.forEach(p => {
        const uKey = p.userHash || p.id || p.name;
        const isOk = (prox[uKey] === true) || (prox[p.name] === true);
        chipsHtml += `<span class="proximity-badge ${isOk ? 'unlocked' : 'locked'}" style="display:inline-block; margin:2px; font-size:0.75rem;">
          ${escapeHtml(p.name)}: ${isOk ? '🔓 หน้าประตู' : '🔒 ล็อก'}
        </span>`;
      });
    }
    chips.innerHTML = chipsHtml;
  }
}

function adminAuthorizeSelectedEscapePlayer(granted) {
  const select = document.getElementById('adminEscapePlayerSelect');
  if (!select) return;
  const target = select.value;
  if (!target) {
    showToast('⚠️ กรุณาเลือกผู้เล่นจากรายการก่อน');
    return;
  }
  if (!gameState.escapeProximity) gameState.escapeProximity = {};
  gameState.escapeProximity[target] = Boolean(granted);

  const packet = {
    type: 'admin_set_escape_proximity',
    targetUser: target,
    granted: Boolean(granted)
  };
  broadcast(packet);
  if (isHost) {
    broadcast({ type: 'sync_state', state: gameState });
  }
  updateAdminEscapeProximityDisplay();
  updateEscapeProximityUI();
  showToast(granted ? `🚪 ยืนยันพิกัดหน้าประตูสำเร็จ!` : `🔒 ล็อกพิกัดเรียบร้อย`);
  playSfx(granted ? 'correct' : 'wrong');
}

function adminAuthorizeAllEscapePlayers(granted) {
  if (!gameState.escapeProximity) gameState.escapeProximity = {};
  if (granted) {
    gameState.escapeProximity['*'] = true;
    if (gameState.players) {
      Object.keys(gameState.players).forEach(k => {
        gameState.escapeProximity[k] = true;
      });
    }
  } else {
    gameState.escapeProximity = {};
  }
  const packet = {
    type: 'admin_set_escape_proximity',
    targetUser: 'ALL',
    granted: Boolean(granted)
  };
  broadcast(packet);
  if (isHost) {
    broadcast({ type: 'sync_state', state: gameState });
  }
  updateAdminEscapeProximityDisplay();
  updateEscapeProximityUI();
  showToast(granted ? `🔓 ยืนยันพิกัดหน้าประตูให้ผู้เล่นทุกคนแล้ว!` : `🔒 รีเซ็ตล็อกพิกัดทั้งหมดแล้ว`);
  playSfx(granted ? 'correct' : 'wrong');
}

function attemptStartEmergencyEscape() {
  if (!isMyEscapeProximityGranted()) {
    showToast('⚠️ สัญญาณขัดข้อง: เซนเซอร์ประตูไม่พบคุณที่หน้าประตูทางออกฉุกเฉิน! (ต้องให้ DM ยืนยันพิกัดก่อน)');
    playSfx('wrong');
    return;
  }
  openEmergencyEscapeModal();
}

function openEmergencyEscapeModal() {
  const modal = document.getElementById('emergencyEscapeModal');
  if (!modal) return;
  currentEscapePin = '';
  const pinDisp = document.getElementById('escapePinDisplay');
  if (pinDisp) pinDisp.innerText = '------';

  const pKeypad = document.getElementById('escapePhaseKeypad');
  const pCountdown = document.getElementById('escapePhaseCountdown');
  const pTroll = document.getElementById('escapePhaseTroll');
  if (pKeypad) pKeypad.classList.remove('hidden');
  if (pCountdown) pCountdown.classList.add('hidden');
  if (pTroll) pTroll.classList.add('hidden');

  modal.classList.remove('hidden');
  playSfx('glitch');
}

function closeEmergencyEscapeModal() {
  if (escapeCountdownTimer) {
    clearInterval(escapeCountdownTimer);
    escapeCountdownTimer = null;
  }
  const modal = document.getElementById('emergencyEscapeModal');
  if (modal) modal.classList.add('hidden');
}

function pressEscapeKey(k) {
  playSfx('click');
  const pinDisp = document.getElementById('escapePinDisplay');
  if (k === 'CLR') {
    currentEscapePin = '';
  } else if (k === 'DEL') {
    currentEscapePin = currentEscapePin.slice(0, -1);
  } else if (currentEscapePin.length < 6) {
    currentEscapePin += k;
  }

  if (pinDisp) {
    let disp = currentEscapePin;
    while (disp.length < 6) disp += '-';
    pinDisp.innerText = disp;
  }
}

function submitEscapeKeypad() {
  if (currentEscapePin.length < 6) {
    showToast('⚠️ กรุณากรอกรหัสผ่านฉุกเฉินให้ครบ 6 หลัก');
    playSfx('wrong');
    return;
  }
  startEmergencyCountdown();
}

function forceHackOverride() {
  playSfx('glitch');
  const pinDisp = document.getElementById('escapePinDisplay');
  if (pinDisp) {
    pinDisp.innerText = '999999';
  }
  setTimeout(() => {
    startEmergencyCountdown();
  }, 400);
}

function startEmergencyCountdown() {
  playSfx('break');
  const pKeypad = document.getElementById('escapePhaseKeypad');
  const pCountdown = document.getElementById('escapePhaseCountdown');
  const pTroll = document.getElementById('escapePhaseTroll');
  if (pKeypad) pKeypad.classList.add('hidden');
  if (pCountdown) pCountdown.classList.remove('hidden');
  if (pTroll) pTroll.classList.add('hidden');

  let rem = 10;
  const numEl = document.getElementById('escapeCountdownNum');
  const barEl = document.getElementById('escapeProgressBar');
  const descEl = document.getElementById('escapeCountdownDesc');

  if (numEl) numEl.innerText = rem;
  if (barEl) barEl.style.width = '0%';

  if (escapeCountdownTimer) clearInterval(escapeCountdownTimer);

  escapeCountdownTimer = setInterval(() => {
    rem--;
    if (numEl) numEl.innerText = rem;
    if (barEl) barEl.style.width = `${((10 - rem) / 10) * 100}%`;

    if (rem > 0) {
      playSfx('chime');
      if (descEl) {
        if (rem === 7) descEl.innerText = 'กำลังส่งคลื่นแม่เหล็กปลดล็อกกลอนนิรภัยชั้นที่ 2...';
        if (rem === 4) descEl.innerText = 'ระบบระบายความร้อนทำงาน... ประตูกำลังเลื่อนเปิด!';
        if (rem === 2) descEl.innerText = 'ตรวจพบอุณหภูมิสูงผิดปกติในช่องทางเดิน...!?';
      }
    } else {
      clearInterval(escapeCountdownTimer);
      escapeCountdownTimer = null;
      triggerEmergencyTrollReveal();
    }
  }, 1000);
}

function triggerEmergencyTrollReveal() {
  playSfx('wrong');
  playSfx('laugh');

  const pCountdown = document.getElementById('escapePhaseCountdown');
  const pTroll = document.getElementById('escapePhaseTroll');
  if (pCountdown) pCountdown.classList.add('hidden');
  if (pTroll) pTroll.classList.remove('hidden');

  // Auto-reset this player's proximity lock so the troll isn't immediately repeated
  const myHash = currentUserHash || (myPlayer && myPlayer.userHash) || (myPlayer && myPlayer.id);
  if (myHash && gameState && gameState.escapeProximity) {
    gameState.escapeProximity[myHash] = false;
    delete gameState.escapeProximity['*'];
    broadcast({
      type: 'admin_set_escape_proximity',
      targetUser: myHash,
      granted: false
    });
    updateEscapeProximityUI();
    updateAdminEscapeProximityDisplay();
  }
}

function adminPreviewFakeEscape() {
  openEmergencyEscapeModal();
  showToast('👁️ กำลังพรีวิวระบบถอดรหัสทางออกฉุกเฉิน (DM Preview)');
}

// ==========================================================
// DM / ADMIN CONTROLS
// ==========================================================
function adminSetGame(stage, config) {
  dismissAllPreviousPhasePopups();
  if (!config && typeof getStageConfigFromInputs === 'function') {
    config = getStageConfigFromInputs(stage);
  }
  setStage(stage, config);
  broadcast({ type: 'set_stage', stage: stage, config: config });
  updateAdminActiveStageButtons(stage);
}

function updateAdminActiveStageButtons(stage) {
  if (typeof document === 'undefined') return;
  try {
    const btns = document.querySelectorAll('.minigame-btn-grid .dm-act-btn');
    if (!btns || btns.length === 0) return;
    const normalizedStage = (stage === 'daily') ? 'dailylife' : stage;
    btns.forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      if (
        onclickAttr.includes(`adminSetGame('${normalizedStage}')`) ||
        onclickAttr.includes(`adminSetGame("${normalizedStage}")`) ||
        (normalizedStage === 'dailylife' && onclickAttr.includes("adminSetGame('dailylife')"))
      ) {
        btn.classList.add('active-running-stage');
      } else {
        btn.classList.remove('active-running-stage');
      }
    });
  } catch (e) {
    // Non-blocking in headless/test environments
  }
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
  if (currentView === 'admin') {
    // Admin DM clicks: route to host/court screen (classroom speakers); NEVER play locally on DM device
    broadcast({ type: 'trigger_fx', fx: fx });
    showToast(`🔊 ส่งเสียง [${fx}] ขึ้นจอใหญ่ศาลเรียบร้อย`);
    return;
  }
  if (isHost || currentView === 'court') {
    playSfx(fx);
    broadcast({ type: 'trigger_fx', fx: fx });
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
  const topicEl = document.getElementById('courtRebuttalTopic');
  if (topicEl) {
    if (gameState.stg3Topic) {
      topicEl.innerText = `📌 ประเด็น: ${gameState.stg3Topic}`;
      topicEl.style.display = 'block';
    } else {
      topicEl.style.display = 'none';
    }
  }
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
  if (gameState.customStages && gameState.customStages['stage3']) {
    adminSetGame('stage3', gameState.customStages['stage3']);
    return;
  }
  const rebSel = document.getElementById('adminRebuttalChallengerSelect');
  const rebOppSel = document.getElementById('adminRebuttalOpponentSelect');
  const chal = rebSel ? rebSel.value : '';
  const opp = rebOppSel ? rebOppSel.value : '';
  const topic = document.getElementById('cfgStg3Topic')?.value || gameState.stg3Topic || 'ช่วงเวลาทำร้ายในครัว & ข้ออ้าง Alibi';
  const arg = document.getElementById('cfgStg3Arg')?.value || gameState.stg3Argument || 'ฉันอยู่แต่ในครัวคนเดียวตลอดช่วงเย็น จะไปเอาเวลาที่ไหนไปทำร้ายเรียวตะที่ห้องซักผ้าได้!?';
  adminSetGame('stage3', { challenger: chal, opponent: opp, topic: topic, argument: arg, statement: arg });
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
    const curVal = rebSel.value || gameState.stg3Challenger || '';
    rebSel.innerHTML = '<option value="">(ทุกคนในห้อง / อิสระ)</option>';
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.innerText = p.name;
      if (opt.value === curVal || p.name === curVal) opt.selected = true;
      rebSel.appendChild(opt);
    });
    if (curVal && !players.some(p => p.name === curVal)) {
      const opt = document.createElement('option');
      opt.value = curVal;
      opt.innerText = curVal;
      opt.selected = true;
      rebSel.appendChild(opt);
    }
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
    if (curOpp && !players.some(p => p.name === curOpp)) {
      const opt = document.createElement('option');
      opt.value = curOpp;
      opt.innerText = curOpp;
      opt.selected = true;
      rebOppSel.appendChild(opt);
    }
  }

  const armTargetSel = document.getElementById('adminArmamentTargetSelect');
  if (armTargetSel) {
    const curVal = armTargetSel.value || gameState.stg6TargetPlayer || '';
    armTargetSel.innerHTML = '<option value="">-- เลือกผู้ถูกกล่าวหา --</option>';
    players.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.name;
      opt.innerText = p.name;
      if (opt.value === curVal || p.name === curVal) opt.selected = true;
      armTargetSel.appendChild(opt);
    });
    if (curVal && !players.some(p => p.name === curVal)) {
      const opt = document.createElement('option');
      opt.value = curVal;
      opt.innerText = curVal;
      opt.selected = true;
      armTargetSel.appendChild(opt);
    }
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
        <button class="small-btn red admin-p-kick-btn" onclick="adminKickPlayer('${escapeHtml(p.userHash || p.id)}', '${escapeHtml(p.name)}')">❌ เตะ</button>
      </div>
    `;
    table.appendChild(row);
  });

  // Update Trapper name in verdict decision buttons
  const trapperName = getTrapperName();
  document.querySelectorAll('.trapper-name-label, .trapper-name-display').forEach(el => {
    el.innerText = trapperName;
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

  const rawPlayers = Object.values(gameState.players || {});
  // Deduplicate players by userHash, id, or name to prevent card multiplying
  const seenKeys = new Set();
  const players = [];
  rawPlayers.forEach(p => {
    if (!p || !p.name) return;
    const key = p.userHash || p.id || p.name.trim().toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      players.push(p);
    }
  });

  const courtPanel = document.getElementById('adminCourtCoreEvidencePanel');

  if (players.length === 0) {
    container.innerHTML = '<div style="text-align:center; padding:16px; color:#64748b; font-size:0.85rem;">ยังไม่มีผู้เล่นเชื่อมต่อในระบบ (0 คน)</div>';
    if (courtPanel) {
      courtPanel.innerHTML = '<div style="text-align:center; padding:12px; color:#64748b; font-size:0.82rem;">ยังไม่มีผู้เล่นในระบบ</div>';
    }
    return;
  }

  // Clear container before rendering player cards to avoid duplicates!
  container.innerHTML = '';

  // Court-wide Core Clues Aggregation (PC 1 - 5)
  const coreClues = ALL_CLUES_DATA.filter(c => c.importance === 'MUST' || c.secretType === 'CORE');
  
  const courtHeldMap = {}; // clueId -> [playerNames]
  players.forEach(p => {
    (p.clues || []).forEach(cid => {
      if (!courtHeldMap[cid]) courtHeldMap[cid] = [];
      if (!courtHeldMap[cid].includes(p.name)) {
        courtHeldMap[cid].push(p.name);
      }
    });
  });

  const foundCoreList = coreClues.filter(c => Boolean(courtHeldMap[c.id]));
  const missingCoreList = coreClues.filter(c => !courtHeldMap[c.id]);
  const foundCoreCount = foundCoreList.length;

  if (courtPanel) {
    courtPanel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
        <span style="font-weight:900; color:#facc15; font-size:0.92rem;">
          🌟 Core หลักฐานสำคัญของคดี (รวม PC 1-5): ${foundCoreCount} / ${coreClues.length} ชิ้น
        </span>
        <span style="font-size:0.75rem; color:#94a3b8; font-weight:bold;">
          ${foundCoreCount === coreClues.length ? '🟢 ครบถ้วนแล้ว' : `⚠️ ขาดอีก ${missingCoreList.length} ชิ้น`}
        </span>
      </div>
      <div style="height:6px; background:#1e293b; border-radius:3px; overflow:hidden; margin-bottom:10px;">
        <div style="width:${(foundCoreCount / coreClues.length) * 100}%; background:linear-gradient(90deg, #eab308, #10b981); height:100%; transition:width 0.3s ease;"></div>
      </div>
      
      <div style="font-size:0.75rem; color:#a7f3d0; font-weight:bold; margin-bottom:4px;">
        ✅ มีแล้วในศาล (${foundCoreCount} ชิ้น):
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px;">
        ${foundCoreList.length === 0 ? '<span style="font-size:0.75rem; color:#64748b;">(ยังไม่มีผู้เล่นใดค้นพบ)</span>' : foundCoreList.map(c => {
          const holders = courtHeldMap[c.id].join(', ');
          return `
            <div style="background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:4px; padding:3px 8px; font-size:0.74rem; color:#a7f3d0;" title="ผู้ถือ: ${escapeHtml(holders)}">
              ✓ [${c.id}] ${escapeHtml(c.name)} <span style="color:#6ee7b7; font-size:0.68rem; font-weight:bold;">(${escapeHtml(holders)})</span>
            </div>
          `;
        }).join('')}
      </div>

      <div style="font-size:0.75rem; color:#fca5a5; font-weight:bold; margin-bottom:4px;">
        ❌ ยังขาดอยู่ (${missingCoreList.length} ชิ้น):
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        ${missingCoreList.length === 0 ? '<span style="font-size:0.75rem; color:#34d399; font-weight:bold;">🎉 ศาลครอบครอง Core หลักฐานสำคัญครบทุกชิ้นแล้ว!</span>' : missingCoreList.map(c => `
          <button type="button" class="small-btn" onclick="adminBroadcastClue('${c.id}')" style="background:rgba(239,68,68,0.15); border:1px solid #ef4444; border-radius:4px; padding:3px 8px; font-size:0.74rem; color:#fca5a5; cursor:pointer;" title="คลิกเพื่อแจกหลักฐานนี้ให้ทุกคน">
            + [${c.id}] ${escapeHtml(c.name)} <span style="background:#dc2626; color:#fff; padding:1px 5px; border-radius:3px; font-size:0.62rem; margin-left:4px; font-weight:bold;">แจก</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  players.forEach((p, idx) => {
    const slot = resolvePlayerSlot(p, idx + 1);
    p.pcSlot = slot;
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
              const cName = getClueDisplayName(c);
              if (has) {
                return `
                  <div style="background:rgba(16,185,129,0.15); border:1px solid #10b981; border-radius:4px; padding:4px 6px; font-size:0.75rem; color:#a7f3d0; display:flex; align-items:center; justify-content:space-between;">
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(cName)}">✓ [${c.id}] ${escapeHtml(cName)}</span>
                    <span style="font-size:0.65rem; background:#065f46; color:#fff; padding:1px 4px; border-radius:3px; margin-left:4px;">มีแล้ว</span>
                  </div>
                `;
              } else {
                return `
                  <button type="button" class="small-btn" onclick="adminGrantClue('${pKey}', '${c.id}')" style="background:${isCore ? 'rgba(239,68,68,0.15)' : 'rgba(30,41,59,0.8)'}; border:1px solid ${isCore ? '#ef4444' : '#475569'}; border-radius:4px; padding:4px 6px; font-size:0.75rem; color:${isCore ? '#fca5a5' : '#cbd5e1'}; display:flex; align-items:center; justify-content:space-between; cursor:pointer; text-align:left;" title="คลิกเพื่อมอบหลักฐานนี้ให้ ${escapeHtml(p.name)}">
                    <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">+ [${c.id}] ${escapeHtml(cName)}</span>
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
          ${p.isKiller ? '<span style="font-size:0.7rem; background:#dc2626; color:#fff; padding:1px 6px; border-radius:4px; margin-left:6px; font-weight:bold;">SABOTEUR</span>' : ''}
          <span style="font-size:0.7rem; background:#0284c7; color:#fff; padding:1px 6px; border-radius:4px; margin-left:6px; font-weight:bold;">PC ${slot}</span>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.85rem; font-weight:bold; color:${percent >= 70 ? '#10b981' : percent >= 40 ? '#38bdf8' : '#eab308'};">
            ${pCount} / ${totalClues} ชิ้น (${percent}%)
          </span>
          <button type="button" class="small-btn yellow" onclick="adminGrantRoleCluesToPlayer('${pKey}')" style="padding:4px 8px; font-size:0.72rem; font-weight:800;" title="มอบชุดหลักฐานเฉพาะบทบาทของ PC นี้">
            🎯 มอบชุดบทบาท (PC ${slot})
          </button>
          <button type="button" class="small-btn ${isExpanded ? 'grey' : 'cyan'}" onclick="adminTogglePlayerCluesExpand('${pKey}')" style="padding:4px 10px; font-size:0.75rem; font-weight:800;">
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
  let targetPlayer = null;
  Object.values(gameState.players).forEach(p => {
    if ((p.userHash && p.userHash === targetKey) || (p.id && p.id === targetKey) || p.name === targetKey) {
      targetPlayer = p;
      if (!p.clues) p.clues = [];
      if (!p.clues.includes(clueId)) p.clues.push(clueId);
    }
  });

  const slot = targetPlayer ? resolvePlayerSlot(targetPlayer, 1) : 1;
  const tName = targetPlayer ? targetPlayer.name : '';

  broadcast({ type: 'sync_state', state: gameState });
  renderAdminEvidenceTracker();
  playSfx('correct');
  showToast(`🎁 มอบหลักฐาน [${clueId}: ${clueName}] ให้ผู้เล่นแล้ว`);

  broadcast({
    type: 'admin_grant_clue',
    targetKey: targetKey,
    targetSlot: slot,
    targetName: tName,
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

  if (!confirm(`ยืนยันการมอบหลักฐาน [${clue.id}: ${clue.name}] ให้กับผู้เล่น "ทุกคน" ในห้อง?\n(หมายเหตุ: การแจกให้ทุกคนจะทำให้ผู้เล่นทุกคนมีหลักฐานนี้เหมือนกัน)`)) return;

  // Add to all players in host memory
  Object.values(gameState.players).forEach(p => {
    if (!p.clues) p.clues = [];
    if (!p.clues.includes(clueId)) p.clues.push(clueId);
  });

  broadcast({ type: 'sync_state', state: gameState });
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

function adminDistributeRoleClues() {
  const players = Object.values(gameState.players);
  if (players.length === 0) {
    alert('ยังไม่มีผู้เล่นเชื่อมต่อในระบบ');
    return;
  }
  if (!confirm(`ยืนยันการมอบหลักฐานตามบทบาทของ PC แต่ละคน (ไม่ซ้ำกัน)?\nผู้เล่นแต่ละคนจะได้รับหลักฐานเฉพาะตัวตามบทบาทและที่ตั้งสืบสวน โดยไม่ได้รับข้อมูลซ้ำซ้อนกัน`)) return;

  let totalGranted = 0;
  players.forEach((p, idx) => {
    let slot = resolvePlayerSlot(p, idx + 1);
    p.pcSlot = slot;
    if (!PC_INVESTIGATION_CLUES[slot]) return;

    const roleClues = PC_INVESTIGATION_CLUES[slot];
    const pKey = p.userHash || p.id || p.name;
    if (!p.clues) p.clues = [];

    const newClues = [];
    roleClues.forEach(cid => {
      if (!p.clues.includes(cid)) {
        p.clues.push(cid);
        newClues.push(cid);
        totalGranted++;
      }
    });

    if (newClues.length > 0) {
      broadcast({
        type: 'admin_grant_batch_clues',
        targetKey: pKey,
        targetSlot: slot,
        targetName: p.name,
        clueIds: newClues
      });
      newClues.forEach(cid => {
        const cObj = ALL_CLUES_DATA.find(c => c.id === cid);
        broadcast({
          type: 'admin_grant_clue',
          targetKey: pKey,
          targetSlot: slot,
          targetName: p.name,
          clueId: cid,
          clueName: cObj ? cObj.name : cid
        });
      });
    }
  });

  broadcast({ type: 'sync_state', state: gameState });
  renderAdminEvidenceTracker();
  playSfx('correct');
  logCourt(`🎯 [DM มอบหลักฐานตามบทบาท]: แจกหลักฐานเฉพาะตัวให้ PC 1-5 สำเร็จ รวม ${totalGranted} รายการ (ไม่ซ้ำ)`);
  showToast(`🎯 มอบหลักฐานตามบทบาทสำเร็จ (${totalGranted} รายการ)`);
}

function adminDistributeMissingCoreFairly() {
  const players = Object.values(gameState.players);
  if (players.length === 0) {
    alert('ยังไม่มีผู้เล่นเชื่อมต่อในระบบ');
    return;
  }
  const coreClues = ALL_CLUES_DATA.filter(c => c.importance === 'MUST' || c.secretType === 'CORE');
  const courtHeldMap = {};
  players.forEach(p => {
    (p.clues || []).forEach(cid => {
      courtHeldMap[cid] = true;
    });
  });
  const missing = coreClues.filter(c => !courtHeldMap[c.id]);
  if (missing.length === 0) {
    alert('🎉 ศาลครอบครองหลักฐานสำคัญระดับ Core ครบทุกชิ้นแล้ว!');
    return;
  }

  if (!confirm(`พบหลักฐาน Core ที่ยังไม่มีใครพบ ${missing.length} ชิ้น\nต้องการเฉลี่ยแจกให้ผู้เล่นแต่ละคนแบบไม่ซ้ำกันใช่หรือไม่?`)) return;

  let playerIndex = 0;
  let grantedCount = 0;
  missing.forEach(clue => {
    const p = players[playerIndex % players.length];
    playerIndex++;
    const pKey = p.userHash || p.id || p.name;
    const slot = resolvePlayerSlot(p, 1);
    if (!p.clues) p.clues = [];
    if (!p.clues.includes(clue.id)) {
      p.clues.push(clue.id);
      grantedCount++;
      broadcast({
        type: 'admin_grant_clue',
        targetKey: pKey,
        targetSlot: slot,
        targetName: p.name,
        clueId: clue.id,
        clueName: clue.name
      });
    }
  });

  broadcast({ type: 'sync_state', state: gameState });
  renderAdminEvidenceTracker();
  playSfx('correct');
  logCourt(`✨ [DM เฉลี่ยหลักฐาน Core]: แจกจ่าย Core ที่ขาด ${grantedCount} ชิ้น ให้ผู้เล่นในศาลแบบไม่ซ้ำกัน`);
  showToast(`✨ เฉลี่ยหลักฐาน Core ให้ผู้เล่นครบถ้วนแล้ว (${grantedCount} ชิ้น)`);
}

function adminGrantRoleCluesToPlayer(pKey) {
  const p = Object.values(gameState.players).find(x => (x.userHash && x.userHash === pKey) || (x.id && x.id === pKey) || x.name === pKey);
  if (!p) return;
  let slot = resolvePlayerSlot(p, 1);
  p.pcSlot = slot;
  if (!slot || !PC_INVESTIGATION_CLUES[slot]) {
    alert(`ไม่สามารถระบุบทบาท PC ของ "${p.name}" ได้`);
    return;
  }
  const roleClues = PC_INVESTIGATION_CLUES[slot];
  if (!p.clues) p.clues = [];
  let added = 0;
  const newClues = [];
  roleClues.forEach(cid => {
    if (!p.clues.includes(cid)) {
      p.clues.push(cid);
      newClues.push(cid);
      added++;
    }
  });

  if (newClues.length > 0) {
    broadcast({
      type: 'admin_grant_batch_clues',
      targetKey: pKey,
      targetSlot: slot,
      targetName: p.name,
      clueIds: newClues
    });
    newClues.forEach(cid => {
      const cObj = ALL_CLUES_DATA.find(c => c.id === cid);
      broadcast({
        type: 'admin_grant_clue',
        targetKey: pKey,
        targetSlot: slot,
        targetName: p.name,
        clueId: cid,
        clueName: cObj ? cObj.name : cid
      });
    });
  }

  broadcast({ type: 'sync_state', state: gameState });
  renderAdminEvidenceTracker();
  playSfx('correct');
  logCourt(`🎯 [DM มอบหลักฐานบทบาท PC ${slot}]: มอบชุดหลักฐานให้ "${p.name}" สำเร็จ (+${added} ชิ้น)`);
  showToast(`🎯 มอบชุดหลักฐานบทบาท PC ${slot} ให้ ${p.name} แล้ว (+${added} ชิ้น)`);
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
      const avHtml = p.avatarConfig
        ? renderAvatarSvg(p.avatarConfig, 105)
        : `<div class="podium-emoji">${p.avatar || '👤'}</div>`;
      seat.innerHTML = `
        <div class="podium-character-layer">
          <div class="podium-avatar-sprite">${avHtml}</div>
        </div>
        <div class="podium-desk">
          <div class="podium-mic">🎙️</div>
          <div class="podium-plate" title="${escapeHtml(p.name)}">${escapeHtml(p.name)}</div>
          <div class="podium-cred-hearts" title="ความน่าเชื่อถือ: ${cred}/5">${heartsHtml}</div>
        </div>
      `;
      targetList.appendChild(seat);
    });
  });

  updateAdminDisplay();
  updateMobileCredDisplay();
  updateSaboteurPanelVisibility();
  updateEscapeProximityUI();
  updateAdminEscapeProximityDisplay();
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
function adminKickPlayer(peerId, explicitName) {
  if (!peerId && !explicitName) return;
  let targetKey = null;
  let target = null;
  if (peerId && gameState.players[peerId]) {
    targetKey = peerId;
    target = gameState.players[peerId];
  } else {
    for (const [k, p] of Object.entries(gameState.players)) {
      if (k === peerId || (p && (p.id === peerId || p.userHash === peerId || (explicitName && p.name === explicitName)))) {
        targetKey = k;
        target = p;
        break;
      }
    }
  }
  const name = explicitName || (target ? target.name : peerId);
  const role = target ? target.role : null;
  const userHash = target ? target.userHash : (String(peerId).startsWith('user_') ? peerId : null);
  const playerId = target ? target.id : peerId;

  if (!confirm(`คุณต้องการเตะผู้เล่น "${name}" ออกจากห้องใช่หรือไม่?`)) return;

  if (targetKey) {
    delete gameState.players[targetKey];
  }
  updatePlayerDisplays();
  if (typeof updateAdminDisplay === 'function') updateAdminDisplay();
  if (typeof renderAdminEvidenceTracker === 'function') renderAdminEvidenceTracker();

  broadcast({
    type: 'kick_player',
    targetKey: targetKey || peerId,
    playerId: playerId,
    userHash: userHash,
    playerName: name,
    role: role
  });

  if (role) {
    broadcast({ type: 'character_freed', role: role });
  }
  logCourt(`🚫 [KICK]: ผู้ดูแลระบบได้เตะ "${name}" ออกจากห้องแล้ว`);
  showToast(`🚫 เตะ "${name}" ออกจากห้องเรียบร้อย`);
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
  sel.innerHTML = ALL_CLUES_DATA.map(c => `<option value="${c.id}">[${c.id}] ${getClueDisplayName(c)} (${getClueDisplayLoc(c)})</option>`).join('');
  if (currentVal) sel.value = currentVal;
}

function openAdminMinigameModal(defaultTab) {
  const modal = document.getElementById('adminMinigameModal');
  if (!modal) return;
  try {
    populateStg1CluesDropdown();
  } catch (e) {
    console.warn('[openAdminMinigameModal] Error in populateStg1CluesDropdown:', e);
  }
  try {
    populateAllConfigStageSelects();
  } catch (e) {
    console.warn('[openAdminMinigameModal] Error in populateAllConfigStageSelects:', e);
  }
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  try {
    selectConfigTab(defaultTab || 'stage0');
  } catch (e) {
    console.warn('[openAdminMinigameModal] Error in selectConfigTab:', e);
  }
  try {
    const dialog = modal.querySelector('.admin-config-modal-dialog');
    if (dialog) dialog.scrollTop = 0;
  } catch (e) {}
}

function closeAdminMinigameModal() {
  const modal = document.getElementById('adminMinigameModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }
}

function onAdminPresetChange(stage, selectEl) {
  if (!selectEl) return;
  const val = selectEl.value;
  if (val === '__custom__') {
    openAdminMinigameModal(stage);
    return;
  }
  if (gameState.customStages && gameState.customStages[stage]) {
    delete gameState.customStages[stage];
  }
  if (stage === 'stage0') applyPresetStage0(val);
  else if (stage === 'stage1') applyPresetStage1(val);
  else if (stage === 'stage2') applyHangmanPresetFromDropdown(val);
  else if (stage === 'stage3') applyRebuttalPresetFromDropdown(val);
  else if (stage === 'stage4') applyPresetStage4(val);
  else if (stage === 'stage5') applyScrumPresetFromDropdown(val);
  else if (stage === 'stage6') applyArmamentPresetFromDropdown(val);
  else if (stage === 'quick_question') applyPresetQuickQuestion(val);
}

function selectConfigTab(stageKey) {
  currentSelectedConfigStage = stageKey;
  const stages = ['stage0', 'stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6', 'stage7', 'quick_question'];
  stages.forEach(stg => {
    const tabSuffix = stg === 'quick_question' ? 'Quick_question' : (stg.charAt(0).toUpperCase() + stg.slice(1));
    const tabBtn = document.getElementById('cfgTab' + tabSuffix);
    const pane = document.getElementById('cfgPane' + tabSuffix);
    if (tabBtn) {
      if (stg === stageKey) tabBtn.classList.add('active');
      else tabBtn.classList.remove('active');
    }
    if (pane) {
      if (stg === stageKey) pane.classList.remove('hidden');
      else pane.classList.add('hidden');
    }
  });

  // Update live stage title in bottom launch bar
  const stageTitles = {
    stage0: '🗣️ 0. Non-Stop Debate',
    stage1: '🔍 1. Evidence Linker',
    stage2: '🔤 2. Hangman\'s Gambit',
    stage3: '⚔️ 3. Rebuttal Showdown',
    stage4: '🛹 4. Logic Dive',
    stage5: '⚖️ 5. Debate Scrum',
    stage6: '🔨 6. Argument Armament',
    stage7: '📖 7. Closing Argument',
    quick_question: '⚡ Quick Question'
  };
  const launchTitleEl = document.getElementById('cfgLaunchStageName');
  if (launchTitleEl && stageTitles[stageKey]) {
    launchTitleEl.textContent = stageTitles[stageKey];
  }

  // Ensure dropdowns are fully populated if opening Stage 3 or Stage 6
  if (stageKey === 'stage3' || stageKey === 'stage6') {
    populateAllConfigStageSelects();
  }
}

function flashPresetBadge(badgeId) {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(badgeId);
  if (el) {
    el.classList.remove('preset-updated-flash');
    void el.offsetWidth;
    el.classList.add('preset-updated-flash');
  }
}

function initAdminPresetsDisplay() {
  if (typeof document === 'undefined') return;
  const stg0Sel = document.getElementById('adminStg0PresetSelect');
  if (stg0Sel && stg0Sel.value) applyPresetStage0(stg0Sel.value, true);

  const stg1Sel = document.getElementById('adminStg1PresetSelect');
  if (stg1Sel && stg1Sel.value) applyPresetStage1(stg1Sel.value, true);

  const stg2Sel = document.getElementById('adminStg2PresetSelect');
  if (stg2Sel && stg2Sel.value) applyHangmanPresetFromDropdown(stg2Sel.value, true);

  const stg3Sel = document.getElementById('adminStg3PresetSelect');
  if (stg3Sel && stg3Sel.value) applyRebuttalPresetFromDropdown(stg3Sel.value, true);

  const stg4Sel = document.getElementById('adminStg4PresetSelect');
  if (stg4Sel && stg4Sel.value) applyPresetStage4(stg4Sel.value, true);

  const qqSel = document.getElementById('adminQqPresetSelect');
  if (qqSel && qqSel.value) applyPresetQuickQuestion(qqSel.value, true);

  const stg5Sel = document.getElementById('adminStg5PresetSelect');
  if (stg5Sel && stg5Sel.value !== undefined) applyScrumPresetFromDropdown(stg5Sel.value, true);

  const stg6Sel = document.getElementById('adminStg6PresetSelect');
  if (stg6Sel && stg6Sel.value) applyArmamentPresetFromDropdown(stg6Sel.value, true);
}

function applyPresetStage0(presetKey, isSilent) {
  if (presetKey === '__custom__') return;
  if (gameState.customStages && gameState.customStages['stage0'] && !isSilent) {
    delete gameState.customStages['stage0'];
  }
  const topInput = document.getElementById('cfgStg0Topic');
  const stmtInput = document.getElementById('cfgStg0Statements');
  const badge = document.getElementById('stg0CardDesc');
  const sel = document.getElementById('adminStg0PresetSelect');
  if (sel && sel.value !== presetKey) sel.value = presetKey;

  let topic = "ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.";
  let badgeText = "⏱️ 1: ไทม์ไลน์เสียงกระแทก (21:00 น.)";
  let statements = [
    { speaker: 'ยูโตะ', text: 'ตอน 21:00 น. ทุกคนก็ได้ยินเสียงการต่อสู้ในห้องซักผ้าพร้อมกันไม่ใช่เหรอ!?' },
    { speaker: 'ซากุระ', text: 'ใช่แล้ว! เสียงทุบกระแทกดังตึงตังขนาดนั้น ต้องเป็นการดิ้นรนก่อนตายของเรียวตะแน่นอน!' },
    { speaker: 'ฮิคาริ', text: 'แต่ว่าสภาพห้องซักรีดมันไม่เห็นมีรอยการดิ้นรนหรือเลือดเปรอะเลยนะ...' },
    { speaker: 'ไคโตะ', text: 'จะไม่มีได้ยังไง ก็เรียวตะพกมีดพกไปด้วย เขาก็ต้องชักออกมาป้องกันตัวสิ!' },
    { speaker: 'เรนะ', text: 'ถ้าอย่างนั้น เสียงเหล็กกระแทกที่ดังสนั่น 2 ครั้งติดกันตอนนั้น มันมาจากไหนล่ะ!?' }
  ];

  if (presetKey === 'weapon') {
    topic = "การหมดสติของเหยื่อเรียวตะ & อาวุธในห้องครัว";
    badgeText = "🍖 2: การหมดสติ & อาวุธในครัว";
    statements = [
      { speaker: 'ไคโตะ', text: 'เรียวตะต้องถูกคนร้ายใช้มีดปลายแหลมในครัวแทงก่อนแน่นอน!' },
      { speaker: 'เรนะ', text: 'แต่ผลชันสูตรบอกว่ากะโหลกศีรษะด้านหลังมีรอยแตกร้าวจากของแข็งไม่มีคมนะ!' },
      { speaker: 'ยูโตะ', text: 'ในครัวมีกระทะและหม้อต้มสตูว์วางอยู่ อาจจะเป็นท่อนกระดูกขนาดใหญ่ก็ได้!' },
      { speaker: 'ซากุระ', text: 'อาวุธชิ้นนั้นต้องถูกคนร้ายโยนทิ้งไปนอกหน้าต่างหลังก่อเหตุแน่ๆ!' }
    ];
  } else if (presetKey === 'pulley') {
    topic = "รอยเชือกไนลอน & กลไกยกร่างขึ้นเพดาน";
    badgeText = "🪢 3: รอยเชือก & กลไกยกร่าง";
    statements = [
      { speaker: 'ซากุระ', text: 'คนร้ายต้องเป็นคนที่มีพละกำลังมหาศาลแน่ ถึงยกร่างผู้ชายขึ้นไปแขวนบนเพดานสูงได้!' },
      { speaker: 'ฮิคาริ', text: 'แต่คนร้ายจะปีนขึ้นไปมัดเชือกบนท่อเพดานสูง 3.5 เมตรในความมืดได้ยังไง?' },
      { speaker: 'ไคโตะ', text: 'แปลว่าคนร้ายต้องเตรียมบันไดลิงหรือใช้โต๊ะซ้อนกันหลายตัวในห้องซักผ้าสิ!' },
      { speaker: 'เรนะ', text: 'แต่รอบๆ จุดพบศพไม่มีเฟอร์นิเจอร์ตัวไหนถูกขยับเลยสักชิ้นเดียว!' },
      { speaker: 'ยูโตะ', text: 'หรือว่าร่างของเรียวตะไม่ได้ถูกคนดึงขึ้นไป แต่เป็นกลไกถ่วงน้ำหนักอัตโนมัติ!?' }
    ];
  } else if (presetKey === 'vending') {
    topic = "ข้ออ้างตู้กดน้ำ 17:45 น. & ไทม์ไลน์ช่วงเย็น";
    badgeText = "🥫 4: ข้ออ้างตู้กดน้ำ (17:45 น.)";
    statements = [
      { speaker: 'ยูโตะ', text: 'คนร้ายอ้างว่าช่วง 17:45 น. ยืนกดกาแฟกระป๋องอยู่ที่โถงทางเดินชั้นหนึ่ง!' },
      { speaker: 'ซากุระ', text: 'แต่ในถังขยะข้างตู้กดน้ำ มีใบเสร็จและกระป๋องเปล่าที่ทิ้งไว้ตั้งแต่เมื่อวานแล้วนะ!' },
      { speaker: 'ฮิคาริ', text: 'ถ้าอย่างนั้นช่วง 17:30 - 18:00 น. คนร้ายก็ไม่มีใครยืนยันที่อยู่เลยน่ะสิ!' },
      { speaker: 'ไคโตะ', text: 'อย่าลืมสิว่ามีคนเห็นเงาดำเดินลงบันไดไปชั้นใต้ดินช่วงนั้นด้วย!' }
    ];
  } else if (presetKey === 'twist') {
    topic = "รอยตัดบนเชือกไนลอน & มีดพับในกระเป๋าเสื้อ";
    badgeText = "🔪 5: รอยตัดเชือก & มีดพกในกระเป๋า";
    statements = [
      { speaker: 'ไคโตะ', text: 'เรียวตะถูกมัดมือมัดเท้าแขวนไว้ตั้งแต่แรกจนตายโดยขยับไม่ได้!' },
      { speaker: 'เรนะ', text: 'แต่ปลายเชือกไนลอนเส้นเดิมมีรอยถูกของมีคมเฉือนตัดขาดอย่างชัดเจนนะ!' },
      { speaker: 'ฮิคาริ', text: 'ในกระเป๋าเสื้อของเรียวตะก็มีมีดพับที่มีใยเชือกไนลอนสีชมพูติดอยู่ด้วย!' },
      { speaker: 'ยูโตะ', text: 'แปลว่าเรียวตะฟื้นสติขึ้นมาตัดเชือกตัวเองจนรอดแล้วงั้นเหรอ!?' }
    ];
  }

  if (topInput) topInput.value = topic;
  if (stmtInput) stmtInput.value = statements.map(s => `[${s.speaker}] ${s.text}`).join('\n');
  if (badge) {
    badge.innerText = badgeText;
    if (!isSilent) flashPresetBadge('stg0CardDesc');
  }

  if (gameState.stage === 'stage0') {
    if (!gameState.stg0) gameState.stg0 = {};
    gameState.stg0.topic = topic;
    gameState.stg0.statements = statements;
    gameState.stg0.currentIndex = 0;
    updateStg0CourtDisplay();
    updateAdminStg0Display();
    broadcast({ type: 'set_stage', stage: 'stage0', config: { topic, statements } });
  }
  if (!isSilent) showToast('🗣️ โหลดพรีเซ็ตดีเบต: ' + badgeText);
}

function applyPresetStage1(presetKey, isSilent) {
  if (presetKey === '__custom__') return;
  if (gameState.customStages && gameState.customStages['stage1'] && !isSilent) {
    delete gameState.customStages['stage1'];
  }
  populateStg1CluesDropdown();
  const pInput = document.getElementById('cfgStg1Prompt');
  const tSelect = document.getElementById('cfgStg1TargetClue');
  const badge = document.getElementById('stg1CardDesc');
  const sel = document.getElementById('adminStg1PresetSelect');
  if (sel && sel.value !== presetKey) sel.value = presetKey;

  let prompt = "อุปุ๊ปุ๊! อาวุธที่ใช้ฟาดหัว B จนสลบในครัวตอน 17:30 น. คืออะไร และถูกนำไปซ่อนที่ไหนกันแน่นะ!?";
  let targetClue = "EVD-02";
  let badgeText = "🍖 อาวุธทุบสลบ (EVD-02)";

  if (presetKey === 'bone') {
    prompt = "อุปุ๊ปุ๊! อาวุธที่ใช้ฟาดหัว B จนสลบในครัวตอน 17:30 น. คืออะไร และถูกนำไปซ่อนที่ไหนกันแน่นะ!?";
    targetClue = "EVD-02";
    badgeText = "🍖 อาวุธทุบสลบ (EVD-02)";
  } else if (presetKey === 'rope') {
    prompt = "หลักฐานชิ้นใดที่เชื่อมโยงร่างของเหยื่อเรียวตะจากท่อเพดานออกไปนอกหน้าต่างสูง 3.5 เมตร!?";
    targetClue = "EVD-09";
    badgeText = "🪢 เชือกยกร่าง (EVD-09)";
  } else if (presetKey === 'window' || presetKey === 'pipe') {
    prompt = "จุดใดในห้องซักรีดที่คนร้ายใช้พาดเชือกไนลอนเพื่อทำหน้าที่แทนรอกชักร่างขึ้นสู่ที่สูง!?";
    targetClue = "EVD-14";
    badgeText = "🪟 ราวท่อเพดาน (EVD-14)";
  } else if (presetKey === 'barrel') {
    prompt = "วัตถุชิ้นใดภายนอกอาคารที่ทำหน้าที่เป็นน้ำหนักถ่วง (Counterweight) ดึงร่างเหยื่อขึ้นแขวนเพดาน!?";
    targetClue = "EVD-19";
    badgeText = "🛢️ ซากถังน้ำ (EVD-19)";
  } else if (presetKey === 'meter' || presetKey === 'hose') {
    prompt = "อุปกรณ์ใดถูกปล่อยให้ทำงานอย่างต่อเนื่อง เพื่อค่อยๆ เติมน้ำหนักลงในถังถ่วงน้ำหนักจนถึงเวลาตาย!?";
    targetClue = "EVD-10";
    badgeText = "💧 มาตรวัดน้ำ (EVD-10)";
  } else if (presetKey === 'dryer' || presetKey === 'timer') {
    prompt = "อุปกรณ์ใดถูกตั้งเวลาล่วงหน้าเพื่อสร้างเสียงต่อสู้หลอกเวลา 21:00 น. ในห้องซักรีด!?";
    targetClue = "EVD-05";
    badgeText = "⏱️ เครื่องอบผ้า (EVD-05)";
  } else if (presetKey === 'knife') {
    prompt = "สิ่งใดอยู่ในกระเป๋าเสื้อของเรียวตะที่ยืนยันว่าไม่มีการต่อสู้ระยะประชิดในห้องซักรีด!?";
    targetClue = "EVD-12";
    badgeText = "🔪 มีดพับในกระเป๋า (EVD-12)";
  } else if (presetKey === 'harness') {
    prompt = "หลักฐานชิ้นใดที่แสดงว่าเรียวตะรอดจากกับดักแรก และพยายามผูกเชือกพยุงตัวเองหลอก!?";
    targetClue = "EVD-09";
    badgeText = "🪢 เงื่อนโบว์ไลน์ & เชือกตัด (EVD-09)";
  }

  if (pInput) pInput.value = prompt;
  if (tSelect) {
    tSelect.value = targetClue;
    if (tSelect.value !== targetClue && tSelect.querySelector(`option[value="${targetClue}"]`)) {
      tSelect.value = targetClue;
    }
  }
  if (badge) {
    badge.innerText = badgeText;
    if (!isSilent) flashPresetBadge('stg1CardDesc');
  }

  gameState.stg1Prompt = prompt;
  gameState.stg1TargetClue = targetClue;

  if (gameState.stage === 'stage1') {
    const pBox = document.getElementById('courtStage1Prompt');
    if (pBox) pBox.innerText = `"${prompt}"`;
    broadcast({ type: 'set_stage', stage: 'stage1', config: { prompt, correctClueId: targetClue } });
  }
  if (!isSilent) showToast('🔍 โหลดพรีเซ็ตโจทย์: ' + badgeText);
}

function applyPresetStage2(word, prompt) {
  const wInput = document.getElementById('cfgStg2Word');
  const pInput = document.getElementById('cfgStg2Prompt');
  if (wInput) wInput.value = word;
  if (pInput) pInput.value = prompt;
}

function applyHangmanPresetFromDropdown(word, isSilent) {
  if (word === '__custom__') return;
  if (gameState.customStages && gameState.customStages['stage2'] && !isSilent) {
    delete gameState.customStages['stage2'];
  }
  const prompts = {
    'WATER CLOCK': { text: 'ถอดรหัสกลไกตั้งเวลาที่กระชากเชือกรอกโดยอัตโนมัติ!', th: 'นาฬิกาน้ำ' },
    'BOWLINE KNOT': { text: 'ถอดรหัสเงื่อนเซฟตี้ฮาร์เนสที่เหยื่อเรียวตะใช้ผูกกับตัวเอง!', th: 'เงื่อนโบว์ไลน์' },
    'SHOCK LOAD': { text: 'ถอดรหัสแรงกระชากแบบไดนามิกจากมวลน้ำมหาศาลที่ทำให้เงื่อนหลุด!', th: 'แรงกระชาก' },
    'COUNTERWEIGHT': { text: 'หลักการทางฟิสิกส์ที่ใช้ถ่วงน้ำหนักเพื่อยกร่างเหยื่อขึ้นสู่เพดานคืออะไร!?', th: 'ถ่วงน้ำหนัก' },
    'PORK BONE': { text: 'อาวุธที่แท้จริงซึ่งใช้ฟาดหัวเหยื่อในครัวก่อนนำไปต้มคืออะไร!?', th: 'กระดูกหมู' },
    'CEILING PIPE': { text: 'จุดพาดเชือกบนเพดานสูงที่ทำหน้าที่เสมือนรอกคืออะไร!?', th: 'ท่อเพดาน' },
    'WATER HOSE': { text: 'อุปกรณ์ส่งน้ำจากก๊อกไปยังถังน้ำภายนอกคืออะไร!?', th: 'สายยางน้ำ' },
    'DRYER': { text: 'ถอดรหัสเครื่องใช้ไฟฟ้าที่ถูกตั้งเวลาล่วงหน้าเพื่อสร้างเสียงต่อสู้หลอก!', th: 'เครื่องอบผ้า' },
    'STAGING': { text: 'การจัดฉากสร้างหลักฐานเท็จและเวลาตายปลอมเรียกว่าอะไร!?', th: 'จัดฉากฆาตกรรม' }
  };
  const item = prompts[word] || { text: `ถอดรหัสคำศัพท์ "${word}"`, th: '' };
  const p = item.text;
  applyPresetStage2(word, p);

  const sel = document.getElementById('adminStg2PresetSelect');
  if (sel && sel.value !== word) sel.value = word;

  const badge = document.getElementById('stg2CardDesc');
  const badgeText = `🔤 ${word}${item.th ? ` (${item.th})` : ''}`;
  if (badge) {
    badge.innerText = badgeText;
    if (!isSilent) flashPresetBadge('stg2CardDesc');
  }

  gameState.stg2Word = word;
  gameState.stg2Target = word.split('');
  gameState.stg2Prompt = p;

  if (gameState.stage === 'stage2') {
    gameState.stg2Board = gameState.stg2Target.map(c => c === ' ' ? ' ' : '_');
    gameState.stg2Mistakes = 0;
    updateHangmanHealthDisplay();
    updateHangmanDisplay();
    broadcast({ type: 'set_stage', stage: 'stage2', config: { targetWord: word, prompt: p } });
  }
  if (!isSilent) showToast(`🔤 เลือกคำศัพท์: ${badgeText}`);
}

function applyPresetStage3(chal, opp, topic, arg) {
  populateAllConfigStageSelects();

  // Set Challenger
  const chalSel = document.getElementById('cfgStg3ChallengerSelect');
  const chalWrap = document.getElementById('cfgStg3ChallengerCustomWrap');
  const chalInput = document.getElementById('cfgStg3ChallengerCustom');
  setSelectOrCustom(chalSel, chalWrap, chalInput, chal);

  // Set Opponent
  const oppSel = document.getElementById('cfgStg3OpponentSelect');
  const oppWrap = document.getElementById('cfgStg3OpponentCustomWrap');
  const oppInput = document.getElementById('cfgStg3OpponentCustom');
  setSelectOrCustom(oppSel, oppWrap, oppInput, opp);

  // Set Topic & Statement
  const topInput = document.getElementById('cfgStg3Topic');
  if (topInput && topic) topInput.value = topic;
  const argInput = document.getElementById('cfgStg3Arg');
  if (argInput && arg) argInput.value = arg;

  // Sync admin card selects directly
  const admChalSel = document.getElementById('adminRebuttalChallengerSelect');
  const admOppSel = document.getElementById('adminRebuttalOpponentSelect');

  if (admChalSel && chal) {
    let found = false;
    for (let opt of admChalSel.options) {
      if (opt.value === chal || opt.text.includes(chal)) {
        admChalSel.value = opt.value;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = chal;
      opt.innerText = chal;
      admChalSel.appendChild(opt);
      admChalSel.value = chal;
    }
  }

  if (admOppSel && opp) {
    let found = false;
    for (let opt of admOppSel.options) {
      if (opt.value === opp || opt.text.includes(opp)) {
        admOppSel.value = opt.value;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = opp;
      opt.innerText = opp;
      admOppSel.appendChild(opt);
      admOppSel.value = opp;
    }
  }
}

function applyRebuttalPresetFromDropdown(val, isSilent) {
  if (val === '__custom__') return;
  if (gameState.customStages && gameState.customStages['stage3'] && !isSilent) {
    delete gameState.customStages['stage3'];
  }
  const presets = {
    kitchen: {
      chal: 'นาเอกิ มาโคโตะ',
      opp: 'ฮิฟุมิ ยามาดะ',
      topic: 'ช่วงเวลาทำร้ายในครัว & ข้ออ้าง Alibi',
      arg: 'ฉันอยู่แต่ในครัวคนเดียวตลอดช่วงเย็น จะไปเอาเวลาที่ไหนไปทำร้ายเรียวตะที่ห้องซักผ้าได้!?',
      badge: '🍳 ข้ออ้างครัว (17:30 น.)'
    },
    alibi: {
      chal: 'คิริกิริ เคียวโกะ',
      opp: 'ฮิฟุมิ ยามาดะ',
      topic: 'Alibi ตอนสามทุ่ม & เสียงเครื่องอบผ้า',
      arg: 'ตอน 21:00 น. ฉันก็นั่งคุยอยู่กับทุกคนในห้องนั่งเล่น! แล้วฉันจะไปอยู่ในห้องซักรีดเพื่อฆ่าเรียวตะได้ยังไงกัน!?',
      badge: '⏱️ ข้ออ้างสามทุ่ม (21:00 น.)'
    },
    window: {
      chal: 'โทกามิ เบียคุยะ',
      opp: 'ฮิฟุมิ ยามาดะ',
      topic: 'ความสูงหน้าต่าง 3.5 เมตร',
      arg: 'หน้าต่างห้องซักผ้าสูงตั้ง 3.5 เมตร แถมไม่มีบันได ใครจะปีนออกไปผูกเชือกข้างนอกได้กันล่ะ!?',
      badge: '🪟 ข้ออ้างหน้าต่าง (3.5 ม.)'
    },
    suicide: {
      chal: 'นาเอกิ มาโคโตะ',
      opp: 'ฮิฟุมิ ยามาดะ',
      topic: 'ข้อสันนิษฐานการฆ่าตัวตาย',
      arg: 'เรียวตะเป็นคนถือมีดและผูกเงื่อนบ่วงเชือกเอง นี่มันการฆ่าตัวตายชัดๆ ไม่เกี่ยวกับฉันสักหน่อย!',
      badge: '🔪 ข้ออ้างฆ่าตัวตาย'
    },
    victim_twist: {
      chal: 'นาเอกิ มาโคโตะ',
      opp: 'ฮิฟุมิ ยามาดะ',
      topic: 'ปัดความรับผิดชอบเรื่อง Blackened',
      arg: 'ฉันแค่จะสั่งสอนหมอนั่นเฉยๆ ไม่ได้กะให้ถึงตายสักหน่อย! คนที่ผูกคอตัวเองจนตายคือหมอนั่นเองนะ!',
      badge: '🌀 ปัดความรับผิดชอบ Blackened'
    }
  };
  const p = presets[val] || presets.kitchen;
  applyPresetStage3(p.chal, p.opp, p.topic, p.arg);

  const sel = document.getElementById('adminStg3PresetSelect');
  if (sel && sel.value !== val) sel.value = val;

  const badge = document.getElementById('stg3CardDesc');
  if (badge) {
    badge.innerText = p.badge;
    if (!isSilent) flashPresetBadge('stg3CardDesc');
  }

  gameState.stg3Challenger = p.chal;
  gameState.stg3Opponent = p.opp;
  gameState.stg3Topic = p.topic;
  gameState.stg3Argument = p.arg;

  if (gameState.stage === 'stage3') {
    updateRebuttalDisplay();
    broadcast({
      type: 'set_stage',
      stage: 'stage3',
      config: {
        challenger: p.chal,
        opponent: p.opp,
        topic: p.topic,
        argument: p.arg,
        statement: p.arg
      }
    });
  }
  if (!isSilent) showToast(`⚔️ Rebuttal: ${p.badge}`);
}

function applyPresetStage4(key, isSilent) {
  if (key === '__custom__') return;
  if (gameState.customStages && gameState.customStages['stage4'] && !isSilent) {
    delete gameState.customStages['stage4'];
  }
  const sel = document.getElementById('adminStg4PresetSelect');
  if (sel && sel.value !== key) sel.value = key;

  const badge = document.getElementById('stg4CardDesc');
  if (key === 'timeline') {
    LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES.timeline;
    gameState.stg4Route = 'timeline';
    if (badge) {
      badge.innerText = "⏱️ Route 3: เวลาตาย & แผนคนร้าย";
      if (!isSilent) flashPresetBadge('stg4CardDesc');
    }
    if (!isSilent) showToast("🛹 สลับ Logic Dive: Route 3 (The Blackened Timeline)");
  } else if (key === 'twist') {
    LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES.twist;
    gameState.stg4Route = 'twist';
    if (badge) {
      badge.innerText = "🌀 Route 2: ความจริงหักมุม (Shock Load)";
      if (!isSilent) flashPresetBadge('stg4CardDesc');
    }
    if (!isSilent) showToast("🛹 สลับ Logic Dive: Route 2 (The Climax Twist)");
  } else {
    LOGIC_DIVE_DATA = LOGIC_DIVE_ROUTES.pulley;
    gameState.stg4Route = 'pulley';
    if (badge) {
      badge.innerText = "🎯 Route 1: กลไกรอกเพดาน";
      if (!isSilent) flashPresetBadge('stg4CardDesc');
    }
    if (!isSilent) showToast("🛹 สลับ Logic Dive: Route 1 (The Ceiling Pulley Trap)");
  }

  if (gameState.stage === 'stage4') {
    gameState.stg4Step = 1;
    gameState.stg4Votes = {};
    updateLogicDiveDisplay();
    broadcast({ type: 'set_stage', stage: 'stage4', config: { route: gameState.stg4Route } });
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

function applyScrumPresetFromDropdown(val, isSilent) {
  if (val === '__custom__') return;
  if (gameState.customStages && gameState.customStages['stage5'] && !isSilent) {
    delete gameState.customStages['stage5'];
  }
  const presets = [
    {
      topic: 'ใครคือ Blackened ตัวจริง: โหวตผู้วางกับดัก (Trapper) หรือ โหวตเรียวตะ (ผู้จัดฉากผูกเชือกพลาดจนตายเอง)!?',
      left: '🔵 ทีมโหวต Trapper (ผู้วางแผนกับดักฆ่า)',
      right: '🟣 ทีมโหวตเรียวตะ (ผู้กระทำการชี้ขาดจนตาย)',
      badge: '⚖️ โหวต Trapper vs โหวตเรียวตะ'
    },
    {
      topic: 'การยกร่างเหยื่อขึ้นเพดาน เกิดจากแรงคนดึงสดๆ หรือกลไกถ่วงน้ำหนักอัตโนมัติ!?',
      left: '🔵 ข้อสันนิษฐานคนร้ายออกแรงดึงเชือก',
      right: '🟣 ข้อสันนิษฐานถังน้ำหนักกลไกอัตโนมัติ',
      badge: '⚖️ แรงคน vs ถังน้ำหนัก'
    },
    {
      topic: 'ช่วงเวลาเสียชีวิตที่แท้จริงของเรียวตะ: เกิดขึ้นตอน 17:30 น. ในครัว หรือ 21:00 น. ในห้องซักรีด!?',
      left: '🔵 ข้อสันนิษฐานตายในครัว (17:30 น.)',
      right: '🟣 ข้อสันนิษฐานตายในห้องซักรีด (21:00 น.)',
      badge: '⚖️ เวลาตาย 17:30 น. vs 21:00 น.'
    },
    {
      topic: 'สาเหตุการเสียชีวิตที่แท้จริง: กะโหลกศีรษะแตกจากท่อนกระดูก หรือ กระดูกคอหักจากเชือกกระชาก!?',
      left: '🔵 กะโหลกศีรษะแตกจากท่อนกระดูกหมู',
      right: '🟣 กระดูกคอหักจากแรงกระชาก Shock Load',
      badge: '⚖️ กะโหลกแตก vs กระดูกคอหัก'
    }
  ];
  const idx = parseInt(val, 10) || 0;
  const p = presets[idx] || presets[0];
  applyPresetStage5(p.topic, p.left, p.right);

  const sel = document.getElementById('adminStg5PresetSelect');
  if (sel && sel.value !== String(val)) sel.value = String(val);

  const badge = document.getElementById('stg5CardDesc');
  if (badge) {
    badge.innerText = p.badge;
    if (!isSilent) flashPresetBadge('stg5CardDesc');
  }

  gameState.stg5Topic = p.topic;
  gameState.stg5LeftTeam = p.left;
  gameState.stg5RightTeam = p.right;

  if (gameState.stage === 'stage5') {
    updateScrumDisplay();
    broadcast({
      type: 'set_stage',
      stage: 'stage5',
      config: {
        topic: p.topic,
        leftTeam: p.left,
        rightTeam: p.right
      }
    });
  }
  if (!isSilent) showToast(`⚖️ Scrum: ${p.badge}`);
}

function applyPresetStage6(opp, scream) {
  populateAllConfigStageSelects();

  const cfgSel = document.getElementById('cfgStg6TargetSelect');
  const cfgWrap = document.getElementById('cfgStg6TargetCustomWrap');
  const cfgInput = document.getElementById('cfgStg6CustomTarget');
  setSelectOrCustom(cfgSel, cfgWrap, cfgInput, opp);

  const admSel = document.getElementById('adminArmamentTargetSelect');
  if (admSel && opp) {
    let found = false;
    for (let opt of admSel.options) {
      if (opt.value === opp || opt.text.includes(opp)) {
        admSel.value = opt.value;
        found = true;
        break;
      }
    }
    if (!found) {
      const opt = document.createElement('option');
      opt.value = opp;
      opt.innerText = opp;
      admSel.appendChild(opt);
      admSel.value = opp;
    }
  }
  const sInput = document.getElementById('cfgStg6Scream');
  if (sInput && scream) sInput.value = scream;
}

function applyArmamentPresetFromDropdown(val, isSilent) {
  if (val === '__custom__') return;
  if (gameState.customStages && gameState.customStages['stage6'] && !isSilent) {
    delete gameState.customStages['stage6'];
  }
  const presets = {
    rope: {
      text: 'ไม่มีทาง! รอกเชือกกับถังน้ำอะไรกัน... ฉันไม่เคยรู้เรื่องกลไกบ้าๆ นั่นเลยสักนิด!!',
      badge: '🪢 ปฏิเสธกลไกเชือกและน้ำ'
    },
    bone: {
      text: 'กระดูกหมูในหม้อสตูว์ก็แค่ของทำอาหาร! จะมาปรักปรำว่าเป็นอาวุธฟาดหัวได้ยังไงกัน!?',
      badge: '🍖 ข้ออ้างกระดูกหมู'
    },
    blackened_panic: {
      text: 'ไม่จริง! ฉันต่างหากที่เป็นคนวางแผนทั้งหมด! ตำแหน่ง Blackened ต้องเป็นของฉัน ไม่ใช่ไอ้หมอนั่น!!',
      badge: '😱 กรีดร้องแย่งตำแหน่งคนร้าย'
    },
    final: {
      text: 'พวกแกไม่มีหลักฐานมัดตัวฉันหรอก! แผนการอันสมบูรณ์แบบของฉัน... ไม่มีวันพังทลายเด็ดขาด!!',
      badge: '💥 คำดิ้นรนสุดท้าย'
    }
  };
  const p = presets[val] || presets.rope;
  let opp = document.getElementById('adminArmamentTargetSelect')?.value || document.getElementById('cfgStg6TargetSelect')?.value || 'ฮิฟุมิ ยามาดะ';
  applyPresetStage6(opp, p.text);

  const sel = document.getElementById('adminStg6PresetSelect');
  if (sel && sel.value !== val) sel.value = val;

  const badge = document.getElementById('stg6CardDesc');
  if (badge) {
    badge.innerText = p.badge;
    if (!isSilent) flashPresetBadge('stg6CardDesc');
  }

  gameState.stg6Statement = p.text;

  if (gameState.stage === 'stage6') {
    updateStage6Displays();
    broadcast({
      type: 'stg6_state',
      targetPlayer: gameState.stg6TargetPlayer || opp,
      statement: p.text
    });
  }
  if (!isSilent) showToast(`💥 Argument: ${p.badge}`);
}

function applyPresetStage7(mode) {
  const badge = document.getElementById('stg7CardDesc');
  if (badge) {
    badge.innerText = "📖 มังงะสรุปคดี (The True Culprit Timeline)";
    flashPresetBadge('stg7CardDesc');
  }
  showToast("📖 โหลดพรีเซ็ตคดีห้องซักผ้าฉบับสมบูรณ์เรียบร้อย");
  logCourt("📖 [CLOSING PRESET]: DM โหลดพรีเซ็ตมังงะสรุปคดีห้องซักผ้าฉบับสมบูรณ์ (The True Culprit Timeline)");
}

function getStageConfigFromInputs(stage) {
  if (gameState.customStages && gameState.customStages[stage]) {
    return gameState.customStages[stage];
  }
  if (stage === 'stage0') {
    const pSel = document.getElementById('adminStg0PresetSelect');
    if (pSel && pSel.value && pSel.value !== '__custom__') {
      applyPresetStage0(pSel.value, true);
    }
    const topic = document.getElementById('cfgStg0Topic')?.value || 'ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.';
    const rawStmts = document.getElementById('cfgStg0Statements')?.value || '';
    const statements = rawStmts.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const match = line.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) return { speaker: match[1], text: match[2] };
      return { speaker: 'ผู้ร่วมอภิปราย', text: line };
    });
    return { topic, statements: statements.length > 0 ? statements : (DEFAULT_STG0_STATEMENTS || []) };
  } else if (stage === 'stage1') {
    const pSel = document.getElementById('adminStg1PresetSelect');
    if (pSel && pSel.value && pSel.value !== '__custom__') {
      applyPresetStage1(pSel.value, true);
    }
    const prompt = document.getElementById('cfgStg1Prompt')?.value || '';
    const target = document.getElementById('cfgStg1TargetClue')?.value || 'EVD-02';
    return { prompt, correctClueId: target };
  } else if (stage === 'stage2') {
    const pSel = document.getElementById('adminStg2PresetSelect');
    if (pSel && pSel.value && pSel.value !== '__custom__') {
      applyHangmanPresetFromDropdown(pSel.value, true);
    }
    const prompt = document.getElementById('cfgStg2Prompt')?.value || '';
    const word = document.getElementById('cfgStg2Word')?.value.trim().toUpperCase() || 'WATER CLOCK';
    return { prompt, targetWord: word };
  } else if (stage === 'stage3') {
    const pSel = document.getElementById('adminStg3PresetSelect');
    if (pSel && pSel.value && pSel.value !== '__custom__') {
      applyRebuttalPresetFromDropdown(pSel.value, true);
    }
    const chalSel = document.getElementById('cfgStg3ChallengerSelect');
    const chalInput = document.getElementById('cfgStg3ChallengerCustom');
    const chal = (typeof getSelectOrCustomValue === 'function' ? getSelectOrCustomValue(chalSel, chalInput) : null) || document.getElementById('adminRebuttalChallengerSelect')?.value || 'นาเอกิ มาโคโตะ';

    const oppSel = document.getElementById('cfgStg3OpponentSelect');
    const oppInput = document.getElementById('cfgStg3OpponentCustom');
    const opp = (typeof getSelectOrCustomValue === 'function' ? getSelectOrCustomValue(oppSel, oppInput) : null) || document.getElementById('adminRebuttalOpponentSelect')?.value || 'ฮิฟุมิ ยามาดะ';

    const topic = document.getElementById('cfgStg3Topic')?.value || 'ช่วงเวลาทำร้ายในครัว & ข้ออ้าง Alibi';
    const arg = document.getElementById('cfgStg3Arg')?.value || 'ฉันอยู่แต่ในครัวคนเดียวตลอดช่วงเย็น จะไปเอาเวลาที่ไหนไปทำร้ายเรียวตะที่ห้องซักผ้าได้!?';
    return { challenger: chal, opponent: opp, topic, argument: arg, statement: arg };
  } else if (stage === 'stage4') {
    const pSel = document.getElementById('adminStg4PresetSelect');
    const route = (pSel && pSel.value && pSel.value !== '__custom__') ? pSel.value : (gameState.stg4Route || 'pulley');
    return { route };
  } else if (stage === 'stage5') {
    const pSel = document.getElementById('adminStg5PresetSelect');
    if (pSel && pSel.value !== undefined && pSel.value !== '__custom__') {
      applyScrumPresetFromDropdown(pSel.value, true);
    }
    const topic = document.getElementById('cfgStg5Topic')?.value || 'ใครคือ Blackened ตัวจริง: โหวตผู้วางกับดัก (Trapper) หรือ โหวตเรียวตะ (ผู้จัดฉากผูกเชือกพลาดจนตายเอง)!?';
    const left = document.getElementById('cfgStg5Left')?.value || '🔵 ทีมโหวต Trapper (ผู้วางแผนกับดักฆ่า)';
    const right = document.getElementById('cfgStg5Right')?.value || '🟣 ทีมโหวตเรียวตะ (ผู้กระทำการชี้ขาดจนตาย)';
    return { topic, leftTeam: left, rightTeam: right };
  } else if (stage === 'stage6') {
    const pSel = document.getElementById('adminStg6PresetSelect');
    if (pSel && pSel.value && pSel.value !== '__custom__') {
      applyArmamentPresetFromDropdown(pSel.value, true);
    }
    let target = document.getElementById('adminArmamentTargetSelect')?.value || '';
    if (!target) {
      const tgtSel = document.getElementById('cfgStg6TargetSelect');
      const tgtInput = document.getElementById('cfgStg6CustomTarget');
      target = (typeof getSelectOrCustomValue === 'function' ? getSelectOrCustomValue(tgtSel, tgtInput) : null) || 'ฮิฟุมิ ยามาดะ';
    }
    const scream = document.getElementById('cfgStg6Scream')?.value || 'ไม่มีทาง! รอกเชือกกับถังน้ำอะไรกัน... ฉันไม่เคยรู้เรื่องกลไกบ้าๆ นั่นเลยสักนิด!!';
    return { targetPlayer: target, opponent: target, scream };
  } else if (stage === 'quick_question') {
    const pSel = document.getElementById('adminQqPresetSelect');
    if (pSel && pSel.value && pSel.value !== '__custom__') {
      applyPresetQuickQuestion(pSel.value);
    }
    const q = document.getElementById('cfgQqQuestion')?.value || 'เวลาที่เหยื่อเรียวตะถูกลอบทำร้ายจนสลบในครัวคือช่วงเวลาใด!?';
    const cA = document.getElementById('cfgQqChoiceA')?.value || '17:30 น. (ช่วงเตรียมอาหารเย็น)';
    const cB = document.getElementById('cfgQqChoiceB')?.value || '19:00 น. (ช่วงเริ่มรับประทานอาหาร)';
    const cC = document.getElementById('cfgQqChoiceC')?.value || '20:30 น. (ช่วงหลังมื้ออาหารค่ำ)';
    const corr = document.getElementById('cfgQqCorrect')?.value || 'A';
    return {
      id: 'qq_' + Date.now(),
      question: q,
      choices: { A: cA, B: cB, C: cC },
      correct: corr
    };
  }
  return {};
}

function adminSaveSelectedConfigGame(launchImmediately) {
  const stg = currentSelectedConfigStage || 'stage0';
  let config = {};
  let badgeText = '';

  const stageTitles = {
    stage0: '🗣️ 0. Non-Stop Debate',
    stage1: '🔍 1. Evidence Linker',
    stage2: '🔤 2. Hangman\'s Gambit',
    stage3: '⚔️ 3. Rebuttal Showdown',
    stage4: '🛹 4. Logic Dive',
    stage5: '⚖️ 5. Debate Scrum',
    stage6: '🔨 6. Argument Armament',
    stage7: '📖 7. Closing Argument',
    quick_question: '⚡ Quick Question'
  };

  const stageSelectMap = {
    stage0: 'adminStg0PresetSelect',
    stage1: 'adminStg1PresetSelect',
    stage2: 'adminStg2PresetSelect',
    stage3: 'adminStg3PresetSelect',
    stage4: 'adminStg4PresetSelect',
    quick_question: 'adminQqPresetSelect',
    stage5: 'adminStg5PresetSelect',
    stage6: 'adminStg6PresetSelect'
  };

  const stageBadgeMap = {
    stage0: 'stg0CardDesc',
    stage1: 'stg1CardDesc',
    stage2: 'stg2CardDesc',
    stage3: 'stg3CardDesc',
    stage4: 'stg4CardDesc',
    quick_question: 'qqCardDesc',
    stage5: 'stg5CardDesc',
    stage6: 'stg6CardDesc',
    stage7: 'stg7CardDesc'
  };

  if (stg === 'stage0') {
    const topic = document.getElementById('cfgStg0Topic')?.value?.trim() || 'ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.';
    const rawStmts = document.getElementById('cfgStg0Statements')?.value || '';
    const statements = rawStmts.split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const match = line.match(/^\[(.*?)\]\s*(.*)$/);
      if (match) return { speaker: match[1], text: match[2] };
      return { speaker: 'ผู้ร่วมอภิปราย', text: line };
    });
    const finalStmts = statements.length > 0 ? statements : (DEFAULT_STG0_STATEMENTS || []);
    config = { topic, statements: finalStmts, isCustom: true };
    badgeText = `✏️ กำหนดเอง: ${topic.slice(0, 24)}...`;
    gameState.stg0Topic = topic;
  } else if (stg === 'stage1') {
    const prompt = document.getElementById('cfgStg1Prompt')?.value?.trim() || '';
    const target = document.getElementById('cfgStg1TargetClue')?.value || 'EVD-02';
    config = { prompt, correctClueId: target, isCustom: true };
    badgeText = `✏️ กำหนดเอง: ${target} (${prompt.slice(0, 16)}...)`;
    gameState.stg1Prompt = prompt;
    gameState.stg1TargetClue = target;
  } else if (stg === 'stage2') {
    const prompt = document.getElementById('cfgStg2Prompt')?.value?.trim() || '';
    const word = (document.getElementById('cfgStg2Word')?.value || 'WATER CLOCK').trim().toUpperCase();
    config = { prompt, targetWord: word, isCustom: true };
    badgeText = `✏️ กำหนดเอง: ${word}`;
    gameState.stg2Word = word;
    gameState.stg2Target = word.split('');
    gameState.stg2Prompt = prompt;
  } else if (stg === 'stage3') {
    const chalSel = document.getElementById('cfgStg3ChallengerSelect');
    const chalInput = document.getElementById('cfgStg3ChallengerCustom');
    const chal = (typeof getSelectOrCustomValue === 'function' ? getSelectOrCustomValue(chalSel, chalInput) : null) || document.getElementById('adminRebuttalChallengerSelect')?.value || 'นาเอกิ มาโคโตะ';
    const oppSel = document.getElementById('cfgStg3OpponentSelect');
    const oppInput = document.getElementById('cfgStg3OpponentCustom');
    const opp = (typeof getSelectOrCustomValue === 'function' ? getSelectOrCustomValue(oppSel, oppInput) : null) || document.getElementById('adminRebuttalOpponentSelect')?.value || 'ฮิฟุมิ ยามาดะ';
    const topic = document.getElementById('cfgStg3Topic')?.value?.trim() || 'ช่วงเวลาทำร้ายในครัว & ข้ออ้าง Alibi';
    const arg = document.getElementById('cfgStg3Arg')?.value?.trim() || 'ฉันอยู่แต่ในครัวคนเดียวตลอดช่วงเย็น จะไปเอาเวลาที่ไหนไปทำร้ายเรียวตะที่ห้องซักผ้าได้!?';
    config = { challenger: chal, opponent: opp, topic, argument: arg, statement: arg, isCustom: true };
    badgeText = `✏️ กำหนดเอง: ${chal} VS ${opp}`;
    gameState.stg3Challenger = chal;
    gameState.stg3Opponent = opp;
    gameState.stg3Topic = topic;
    gameState.stg3Argument = arg;
  } else if (stg === 'stage4') {
    const pSel = document.getElementById('adminStg4PresetSelect');
    const route = (pSel && pSel.value && pSel.value !== '__custom__') ? pSel.value : (gameState.stg4Route || 'pulley');
    config = { route, isCustom: true };
    badgeText = `✏️ กำหนดเอง: Route ${route}`;
    gameState.stg4Route = route;
  } else if (stg === 'stage5') {
    const topic = document.getElementById('cfgStg5Topic')?.value?.trim() || 'ใครคือ Blackened ตัวจริง: โหวตผู้วางกับดัก (Trapper) หรือ โหวตเรียวตะ (ผู้จัดฉากผูกเชือกพลาดจนตายเอง)!?';
    const left = document.getElementById('cfgStg5Left')?.value?.trim() || '🔵 ทีมโหวต Trapper (ผู้วางแผนกับดักฆ่า)';
    const right = document.getElementById('cfgStg5Right')?.value?.trim() || '🟣 ทีมโหวตเรียวตะ (ผู้กระทำการชี้ขาดจนตาย)';
    config = { topic, leftTeam: left, rightTeam: right, isCustom: true };
    badgeText = `✏️ กำหนดเอง: ${topic.slice(0, 20)}...`;
    gameState.stg5Topic = topic;
    gameState.stg5LeftTeam = left;
    gameState.stg5RightTeam = right;
  } else if (stg === 'stage6') {
    const tgtSel = document.getElementById('cfgStg6TargetSelect');
    const tgtInput = document.getElementById('cfgStg6CustomTarget');
    let target = (typeof getSelectOrCustomValue === 'function' ? getSelectOrCustomValue(tgtSel, tgtInput) : null) || document.getElementById('adminArmamentTargetSelect')?.value || 'ฮิฟุมิ ยามาดะ';
    const scream = document.getElementById('cfgStg6Scream')?.value?.trim() || 'ไม่มีทาง! รอกเชือกกับถังน้ำอะไรกัน... ฉันไม่เคยรู้เรื่องกลไกบ้าๆ นั่นเลยสักนิด!!';
    config = { targetPlayer: target, opponent: target, scream, isCustom: true };
    badgeText = `✏️ กำหนดเอง: ${target}`;
    gameState.stg6TargetPlayer = target;
    gameState.stg6Statement = scream;
  } else if (stg === 'stage7') {
    config = { closing: 'full', isCustom: true };
    badgeText = '✏️ มังงะสรุปคดี (ฉบับสมบูรณ์)';
  } else if (stg === 'quick_question') {
    const q = document.getElementById('cfgQqQuestion')?.value?.trim() || 'เวลาที่เหยื่อเรียวตะถูกลอบทำร้ายจนสลบในครัวคือช่วงเวลาใด!?';
    const cA = document.getElementById('cfgQqChoiceA')?.value?.trim() || '17:30 น. (ช่วงเตรียมอาหารเย็น)';
    const cB = document.getElementById('cfgQqChoiceB')?.value?.trim() || '19:00 น. (ช่วงเริ่มรับประทานอาหาร)';
    const cC = document.getElementById('cfgQqChoiceC')?.value?.trim() || '20:30 น. (ช่วงหลังมื้ออาหารค่ำ)';
    const corr = document.getElementById('cfgQqCorrect')?.value || 'A';
    config = {
      id: 'qq_' + Date.now(),
      question: q,
      choices: { A: cA, B: cB, C: cC },
      correct: corr,
      isCustom: true
    };
    badgeText = `✏️ กำหนดเอง: ${q.slice(0, 20)}...`;
  }

  // Save into state
  if (!gameState.customStages) gameState.customStages = {};
  gameState.customStages[stg] = config;

  // Sync dropdown on card to show __custom__
  const selId = stageSelectMap[stg];
  if (selId) {
    const sel = document.getElementById(selId);
    if (sel) {
      let customOpt = sel.querySelector('option[value="__custom__"]');
      if (!customOpt) {
        customOpt = document.createElement('option');
        customOpt.value = '__custom__';
        customOpt.innerText = '✏️ ข้อมูลที่กำหนดเอง (Custom Edit)...';
        sel.prepend(customOpt);
      }
      sel.value = '__custom__';
    }
  }

  // Update card badge
  const badgeId = stageBadgeMap[stg];
  if (badgeId && badgeText) {
    const badge = document.getElementById(badgeId);
    if (badge) {
      badge.innerText = badgeText;
      if (typeof flashPresetBadge === 'function') flashPresetBadge(badgeId);
    }
  }

  if (launchImmediately) {
    if (stg === 'quick_question') {
      setStage('quick_question', config);
      broadcast({ type: 'set_stage', stage: 'quick_question', config: config });
    } else if (stg === 'stage3') {
      adminSetGame('stage3', config);
    } else if (stg === 'stage6') {
      adminSetGame('stage6', config);
    } else if (stg === 'stage7') {
      adminSetGame('closing', config);
    } else {
      adminSetGame(stg, config);
    }
    closeAdminMinigameModal();
    showToast(`🚀 เริ่ม ${stageTitles[stg] || stg} ด้วยข้อมูลที่กำหนดเองเรียบร้อย!`);
    logCourt(`🎮 [CUSTOM MINIGAME LAUNCH]: DM เริ่ม ${stageTitles[stg] || stg} ด้วยข้อมูลที่กำหนดเอง`);
  } else {
    closeAdminMinigameModal();
    showToast(`💾 บันทึกการแก้ไข [${stageTitles[stg] || stg}] เรียบร้อยแล้ว (กดเริ่มจากการ์ดได้ทันที)`);
    logCourt(`💾 [CUSTOM MINIGAME SAVED]: DM บันทึกการแก้ไข ${stageTitles[stg] || stg} เรียบร้อย (พร้อมเริ่มจากการ์ด)`);
  }
}

function adminLaunchSelectedConfigGame() {
  adminSaveSelectedConfigGame(true);
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
  const currentRoom = (typeof roomCode !== 'undefined' && roomCode)
    ? roomCode
    : (new URLSearchParams(window.location.search).get('room') || localStorage.getItem('dangan_current_room') || '');
  const roomParam = currentRoom ? `&room=${encodeURIComponent(currentRoom)}` : '';
  const url = window.location.origin + '/?view=court' + roomParam;
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
  updateSaboteurPanelVisibility();
  updateAvatarJoinPreview();
  initAdminPresetsDisplay();
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
      if (k && (k.includes('sim_') || k.toUpperCase().includes('SIM888') || k.startsWith('dangan_player_SIM') || k === 'dangan_player_SIM888' || k.startsWith('dangan_unlocked_SIM888') || k.startsWith('dangan_unlocked_sim_') || k === 'dangan_unlocked_guest')) {
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

  // 3. Load the 6 isolated viewports with universal ?view= URLs that work on ANY web host
  const fCourt = document.getElementById('simFrameCourt');
  const fAdmin = document.getElementById('simFrameAdmin');
  const fP1 = document.getElementById('simFramePlayer1');
  const fP2 = document.getElementById('simFramePlayer2');
  const fP3 = document.getElementById('simFramePlayer3');
  const fP4 = document.getElementById('simFramePlayer4');
  const fP5 = document.getElementById('simFramePlayer5');

  const loc = window.location;
  const baseUrl = loc.protocol + '//' + loc.host;
  const pathPrefix = loc.pathname.endsWith('.html') ? loc.pathname : (loc.pathname === '/' ? '/index.html' : loc.pathname.replace(/\/simulation\/?$/, '') + '/index.html');

  const courtUrl = baseUrl + pathPrefix + '?view=court&room=' + simRoomCode;
  const adminUrl = baseUrl + pathPrefix + '?view=admin&room=' + simRoomCode + '&pin=295437&muted=1';
  const p1Url = baseUrl + pathPrefix + '?view=player&user=sim_naegi&room=' + simRoomCode + '&name=' + encodeURIComponent('นาเอกิ') + '&role=' + encodeURIComponent('สุดยอดนักเรียนโชคดี') + '&pc=1&muted=1';
  const p2Url = baseUrl + pathPrefix + '?view=player&user=sim_kyoko&room=' + simRoomCode + '&name=' + encodeURIComponent('เคียวโกะ') + '&role=' + encodeURIComponent('สุดยอดนักสืบ') + '&pc=2&muted=1';
  const p3Url = baseUrl + pathPrefix + '?view=player&user=sim_byakuya&room=' + simRoomCode + '&name=' + encodeURIComponent('เบียคุยะ') + '&role=' + encodeURIComponent('สุดยอดทายาทมหาเศรษฐี') + '&pc=3&muted=1';
  const p4Url = baseUrl + pathPrefix + '?view=player&user=sim_aoi&room=' + simRoomCode + '&name=' + encodeURIComponent('อาโออิ') + '&role=' + encodeURIComponent('สุดยอดนักว่ายน้ำ') + '&pc=4&muted=1';
  const p5Url = baseUrl + pathPrefix + '?view=player&user=sim_hifumi&room=' + simRoomCode + '&name=' + encodeURIComponent('ฮิฟุมิ') + '&role=' + encodeURIComponent('สุดยอดนักเขียนโดจิน (The Blackened)') + '&pc=5&muted=1';

  if (fCourt && (!fCourt.src || fCourt.src === 'about:blank' || !fCourt.src.includes(simRoomCode))) fCourt.src = courtUrl;
  if (fAdmin && (!fAdmin.src || fAdmin.src === 'about:blank' || !fAdmin.src.includes(simRoomCode))) fAdmin.src = adminUrl;
  if (fP1 && (!fP1.src || fP1.src === 'about:blank' || !fP1.src.includes(simRoomCode) || fP1.src.includes('autoJoin=1'))) fP1.src = p1Url;
  if (fP2 && (!fP2.src || fP2.src === 'about:blank' || !fP2.src.includes(simRoomCode) || fP2.src.includes('autoJoin=1'))) fP2.src = p2Url;
  if (fP3 && (!fP3.src || fP3.src === 'about:blank' || !fP3.src.includes(simRoomCode) || fP3.src.includes('autoJoin=1'))) fP3.src = p3Url;
  if (fP4 && (!fP4.src || fP4.src === 'about:blank' || !fP4.src.includes(simRoomCode) || fP4.src.includes('autoJoin=1'))) fP4.src = p4Url;
  if (fP5 && (!fP5.src || fP5.src === 'about:blank' || !fP5.src.includes(simRoomCode) || fP5.src.includes('autoJoin=1'))) fP5.src = p5Url;

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
      document.getElementById('simFramePlayer4'),
      document.getElementById('simFramePlayer5')
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

async function simSetPhase(phase) {
  return runSimGuarded(`เปลี่ยน Phase: ${phase}`, async () => {
    logSimEvent({ type: 'sim_info', text: `🔄 [ACTION]: สั่งเปลี่ยน Phase ของคดีเป็น "${phase}"...` });
    await simPost({ type: 'set_stage', stage: phase });
  });
}

async function simCollectClues() {
  return runSimGuarded('จำลองเก็บหลักฐานเข้า Monopad', async () => {
    logSimEvent({ type: 'sim_info', text: '📷 [ACTION]: จำลองผู้เล่น (PC 1-5) สแกน/รับหลักฐานประจำตัวเข้า Monopad...' });
    const simPList = [
      { user: 'sim_naegi', name: 'นาเอกิ', pc: 1 },
      { user: 'sim_kyoko', name: 'เคียวโกะ', pc: 2 },
      { user: 'sim_byakuya', name: 'เบียคุยะ', pc: 3 },
      { user: 'sim_aoi', name: 'อาโออิ', pc: 4 },
      { user: 'sim_hifumi', name: 'ฮิฟุมิ', pc: 5 }
    ];
    for (const sp of simPList) {
      const clues = PC_INVESTIGATION_CLUES[sp.pc] || ['EVD-07'];
      try {
        localStorage.setItem('dangan_unlocked_SIM888_' + sp.user, JSON.stringify(clues));
        localStorage.setItem('dangan_unlocked_' + sp.user, JSON.stringify(clues));
        localStorage.setItem('dangan_unlocked_SIM888_name_' + sp.name.trim().toLowerCase(), JSON.stringify(clues));
        localStorage.setItem('dangan_unlocked_name_' + sp.name.trim().toLowerCase(), JSON.stringify(clues));
      } catch(e) {}
      for (const cid of clues) {
        await simPost({
          type: 'clue_discovered',
          clueId: cid,
          playerName: sp.name,
          userHash: sp.user
        });
      }
      await new Promise(r => setTimeout(r, 80));
    }
    await simPost({ type: 'refresh_clues' });
    logSimEvent({ type: 'sim_info', text: '✅ [DONE]: จำลองเก็บหลักฐานประจำตัวละครครบทั้ง 5 คนเรียบร้อยแล้ว!' });
  });
}

async function simJoinPlayersRaw() {
  logSimEvent({ type: 'sim_info', text: '👤 [ACTION]: จำลองส่งคำขอสวมบทบาท 5 คน: นาเอกิ (PC1), เคียวโกะ (PC2), เบียคุยะ (PC3), อาโออิ (PC4), ฮิฟุมิ (PC5 Blackened)...' });
  await simPost({
    type: 'request_claim_character',
    role: 'สุดยอดนักเรียนโชคดี',
    playerName: 'นาเอกิ',
    pcSlot: 1,
    userHash: 'sim_naegi',
    avatarConfig: { skin: 0, hairStyle: 0, hairColor: 1, eyes: 0, outfit: 2, acc: 0 }
  });
  await new Promise(r => setTimeout(r, 200));
  await simPost({
    type: 'request_claim_character',
    role: 'สุดยอดนักสืบ',
    playerName: 'เคียวโกะ',
    pcSlot: 2,
    userHash: 'sim_kyoko',
    avatarConfig: { skin: 3, hairStyle: 2, hairColor: 3, eyes: 1, outfit: 0, acc: 4 }
  });
  await new Promise(r => setTimeout(r, 200));
  await simPost({
    type: 'request_claim_character',
    role: 'สุดยอดทายาทมหาเศรษฐี',
    playerName: 'เบียคุยะ',
    pcSlot: 3,
    userHash: 'sim_byakuya',
    avatarConfig: { skin: 0, hairStyle: 1, hairColor: 2, eyes: 1, outfit: 3, acc: 1 }
  });
  await new Promise(r => setTimeout(r, 200));
  await simPost({
    type: 'request_claim_character',
    role: 'สุดยอดนักว่ายน้ำ',
    playerName: 'อาโออิ',
    pcSlot: 4,
    userHash: 'sim_aoi',
    avatarConfig: { skin: 2, hairStyle: 4, hairColor: 1, eyes: 2, outfit: 4, acc: 3 }
  });
  await new Promise(r => setTimeout(r, 200));
  await simPost({
    type: 'request_claim_character',
    role: 'สุดยอดนักเขียนโดจิน (The Blackened)',
    playerName: 'ฮิฟุมิ',
    pcSlot: 5,
    userHash: 'sim_hifumi',
    avatarConfig: { skin: 1, hairStyle: 5, hairColor: 0, eyes: 3, outfit: 0, acc: 2 }
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
  logSimEvent({ type: 'sim_info', text: '🗡️ [ACTION]: เริ่ม Stage 3 (Rebuttal Showdown) นาเอกิ VS ฮิฟุมิ...' });
  await simPost({
    type: 'set_stage',
    stage: 'stage3',
    config: {
      challenger: 'นาเอกิ มาโคโตะ',
      opponent: 'ฮิฟุมิ ยามาดะ',
      topic: 'ช่วงเวลาทำร้ายในครัว & ข้ออ้าง Alibi',
      argument: 'ฉันอยู่แต่ในครัวคนเดียวตลอดช่วงเย็น จะไปเอาเวลาที่ไหนไปทำร้ายเรียวตะที่ห้องซักผ้าได้!?'
    }
  });
  await new Promise(r => setTimeout(r, 450));
  await simPost({ type: 'rebuttal_slash', bullet: 'EVD-02', playerName: 'นาเอกิ' });
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
  logSimEvent({ type: 'sim_info', text: '🔨 [ACTION]: เริ่ม Stage 6 (Argument Armament: Rhythm Battleship)...' });
  await simPost({ type: 'set_stage', stage: 'stage6', config: { targetPlayer: 'ฮิฟุมิ' } });
  await new Promise(r => setTimeout(r, 200));

  const secretLayout = {
    shoulder: [0, 1],
    arm: [4, 5],
    core: [10],
    traps: [8, 15]
  };
  await simPost({ type: 'stg6_setup_secret', secret: secretLayout, playerName: 'ฮิฟุมิ' });
  await new Promise(r => setTimeout(r, 200));

  const targetCells = [0, 1, 4, 5, 10];
  for (let idx of targetCells) {
    await simPost({ type: 'stg6_shot_fired', shooter: 'นาเอกิ', cellIndex: idx, timing: 'good' });
    await new Promise(r => setTimeout(r, 180));
  }

  await new Promise(r => setTimeout(r, 350));
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
  logSimEvent({ type: 'sim_info', text: '🗳️ [ACTION]: เริ่ม Voting Time ผู้เล่น 5 คนลงคะแนนโหวตชี้ตัวฮิฟุมิ (Blackened)...' });
  await simPost({ type: 'set_stage', stage: 'stage7' });
  await new Promise(r => setTimeout(r, 450));
  const targetSuspect = 'ฮิฟุมิ';
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_naegi' });
  await new Promise(r => setTimeout(r, 120));
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_kyoko' });
  await new Promise(r => setTimeout(r, 120));
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_byakuya' });
  await new Promise(r => setTimeout(r, 120));
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_aoi' });
  await new Promise(r => setTimeout(r, 120));
  await simPost({ type: 'submit_vote', candidate: targetSuspect, voterId: 'sim_hifumi' });
  await new Promise(r => setTimeout(r, 600));
  await simPost({ type: 'reveal_votes' });
}

async function simStage7Vote() {
  return runSimGuarded('สเตจ 7: Voting Time', simStage7VoteRaw);
}

async function simStage0DebateRaw() {
  logSimEvent({ type: 'sim_info', text: '🗣️ [ACTION]: เริ่ม Stage 0 (Non-Stop Debate) พร้อมบทพูดสด...' });
  const statements = generateDynamicDebateStatements();
  await simPost({
    type: 'set_stage',
    stage: 'stage0',
    config: {
      topic: 'ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.',
      statements: statements
    }
  });
  await new Promise(r => setTimeout(r, 600));

  logSimEvent({ type: 'sim_info', text: '⚡ [ACTION]: นาเอกิ กดแย่งจังหวะคัดค้าน (Buzzer Objection)...' });
  await simPost({
    type: 'stg0_buzz',
    player: 'นาเอกิ',
    avatar: '🧑‍🎓',
    avatarConfig: { skin: 1, hairStyle: 1, hairColor: 2, eyes: 1, outfit: 1, acc: 0 },
    role: 'สุดยอดนักเรียนโชคดี',
    quote: '⚡ นั่นมันผิดแล้วล่ะ! (SORE WA CHIGAU YO!)'
  });
  await new Promise(r => setTimeout(r, 700));

  logSimEvent({ type: 'sim_info', text: '🎯 [ACTION]: นาเอกิ ยิงกระสุนความจริง EVD-02 (ท่อนกระดูกหมู)...' });
  await simPost({
    type: 'stg0_shoot',
    player: 'นาเอกิ',
    clueId: 'EVD-02',
    clueName: 'ท่อนกระดูกหมูในหม้อสตูว์'
  });
  await new Promise(r => setTimeout(r, 700));

  logSimEvent({ type: 'sim_info', text: '💥 [ACTION]: DM ตัดสินอนุมัติข้อคัดค้าน (BREAK!)...' });
  await simPost({
    type: 'stg0_verdict',
    approved: true,
    objector: 'นาเอกิ'
  });
}

async function simStage0Debate() {
  return runSimGuarded('สเตจ 0: Non-Stop Debate', simStage0DebateRaw);
}

async function runSimFullSequence() {
  return runSimGuarded('Full Auto (Stage 0 ถึง 8)', async () => {
    logSimEvent({ type: 'sim_info', text: '🚀 [FULL AUTO]: เริ่มการทดสอบอัตโนมัติครบทุกสเตจ (Stage 0 ถึง 8) ต่อเนื่อง...' });

    await simJoinPlayersRaw();
    await new Promise(r => setTimeout(r, 1000));

    await simStage0DebateRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simStage1EvidenceRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simStage2HangmanRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simStage3RebuttalRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simStage4LogicDiveRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simStage5ScrumRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simStage6ArmamentRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simClosingArgumentRaw();
    await new Promise(r => setTimeout(r, 1600));

    await simStage7VoteRaw();
    await new Promise(r => setTimeout(r, 1400));

    logSimEvent({ type: 'sim_info', text: '🎉 [COMPLETE]: การจำลอง Full Sequence (Stage 0 ถึง 8) เสร็จสมบูรณ์ ทุกมินิเกมตอบสนอง 100%!' });
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
    timeline: '• <strong>18:10 น.:</strong> Trapper ปล่อยน้ำไหลเอื่อยๆ กะเวลาให้เต็มตอน 21:00 น.<br>• <strong>21:00 น.:</strong> น้ำหนักเกินสมดุล ถังร่วงดึงร่างของเรียวตะขึ้นแขวนคอ'
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
      '<strong>ห้องพักเรียวตะ:</strong> เรียวตะไม่ได้กลับมาที่ห้องพักตั้งแต่ช่วงบ่าย เพราะเก็บตัวอยู่ที่ห้องซักรีด',
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
    spec: "ขนาด: 8.0m x 6.5m // ปีกบริการชั้น 1 // ประตู D-101",
    desc: "ห้องซักรีดมาตรฐานประจำปีกบริการชั้น 1 เรียงรายด้วยเครื่องซักผ้าอัตโนมัติ เครื่องอบผ้า และอ่างก๊อกน้ำซักล้างสำหรับทำความสะอาดชุดนักเรียน เป็นพื้นที่อำนวยความสะดวกทั่วไปของทุกคน"
  },
  courtyard: {
    name: "EXT-101: ลานปูนซักล้างปิดตายด้านหลัง (Rear Service Courtyard)",
    tag: "🌿 พื้นที่บริการกลางแจ้งปิดตาย",
    image: "assets/room_courtyard.jpg",
    spec: "ขนาด: 18.0m x 6.5m // กำแพง ค.ส.ล. สูง 5.0m รอบด้าน // ปิดตายไร้ทางออก",
    desc: "ลานคอนกรีตกลางแจ้งสำหรับงานบริการ ตากล้าง และระบายน้ำ โอบล้อมด้วยกำแพงคอนกรีตเสริมเหล็กสูง 5 เมตรที่ปิดตาย ไร้บันไดหนีไฟหรือประตูทะลุออกไปนอกโรงเรียน"
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

  const trapper = getTrapperName();

  if (phase === 1) {
    if (badge) badge.innerText = 'เฟส 1: การเซ็ตกลไกเชือกและถังน้ำถ่วงน้ำหนัก (18:10 น.)';
    if (title) title.innerText = `${trapper} ลอบวางกับดักน้ำถ่วงเวลาในห้องซักรีด`;
    if (desc) desc.innerText = `${trapper} คล้องเชือกตากผ้าไนลอนที่คอเรียวตะ พาดผ่านราวท่อสแตนเลสเพดาน หย่อนถังเปล่า (2 กก.) ออกนอกหน้าต่างสูง 3.5 ม. ต่อสายยางเปิดน้ำ 0.4 ลิตร/นาที และตั้งเวลาเครื่องอบผ้าล่วงหน้าก่อนไปกินอาหารค่ำ!`;
    
    if (victimAvatar) {
      victimAvatar.style.bottom = '25px';
      victimAvatar.style.top = 'auto';
    }
    if (victimIcon) victimIcon.innerText = '😴';
    if (victimTag) victimTag.innerText = 'เรียวตะ (หมดสติที่พื้น)';
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
    if (badge) badge.innerText = 'เฟส 2: แผนดัดหลังของเรียวตะที่ผิดพลาด (20:45 น.)';
    if (title) title.innerText = 'เรียวตะ ฟื้นขึ้นมาตัดเชือก แต่ผูกเงื่อนย้อนศรพลาด!';
    if (desc) desc.innerText = 'เรียวตะ ฟื้นสติขึ้นมา รู้ตัวว่าโดนลอบวางกับดัก จึงควักมีดพกตัดเชือกขาดสะบั้น! เรียวตะ รอดตายแล้ว 100%! แต่ด้วยความโลภอยากชนะเกมฆาตกรรม เรียวตะจึงนำเศษเชือกมาผูกกับดักย้อนศรหมายสังหารคนวางกับดัก ทว่าในความมืดและความลนลาน ทำให้ผูกเงื่อนเชือกพลาดกลายเป็นรัดคอตนเอง!';
    
    if (victimAvatar) {
      victimAvatar.style.bottom = '25px';
      victimAvatar.style.top = 'auto';
    }
    if (victimIcon) victimIcon.innerText = '😏';
    if (victimTag) victimTag.innerText = 'เรียวตะ (ตัดเชือกสำเร็จ!)';
    if (victimStatus) {
      victimStatus.innerText = '✂️ ผูกเชือกย้อนศร';
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
    if (title) title.innerText = 'ถังน้ำ 70 กก. ร่วงกระแทกพื้น กระชากร่างเรียวตะคอหักตายคาที่!';
    if (desc) desc.innerText = `21:00 น. เครื่องอบผ้าหมุนเสียงดังตึงตังตามที่ ${trapper} ตั้งเวลาไว้ ถังน้ำหนักสะสมเกิน 70 กก. จึงร่วงวูบ 3.5 ม. กระแทกพื้นลานปูนดัง "โครม!!" แรงกระชากดึงร่างเรียวตะลอยหวือขึ้นเพดาน บ่วงเชือกที่ผูกพลาดรูดขึ้นรัดคอกระแทกราวสแตนเลสจนคอหักเสียชีวิตทันที! เรียวตะ จึงกลายเป็น Blackened ปลิดชีพตนเอง!`;
    
    if (victimAvatar) {
      victimAvatar.style.bottom = 'auto';
      victimAvatar.style.top = '70px'; // Pulled up to ceiling!
    }
    if (victimIcon) victimIcon.innerText = '💀';
    if (victimTag) victimTag.innerText = 'เรียวตะ (The Blackened)';
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

// ==========================================================
// DYNAMIC ROOM BANTER FOR NON-STOP DEBATE (STAGE 0)
// ==========================================================
function generateDynamicDebateStatements() {
  let speakers = [];
  if (gameState && gameState.players && Object.keys(gameState.players).length > 0) {
    speakers = Object.values(gameState.players).map(p => ({
      name: p.name,
      avatar: p.avatarConfig || p.avatar || '👤'
    }));
  }
  
  if (speakers.length === 0) {
    speakers = [
      { name: 'นาเอกิ มาโคโตะ', avatar: { skin: 1, hairStyle: 1, hairColor: 2, eyes: 1, outfit: 1, acc: 0 } },
      { name: 'คิริกิริ เคียวโกะ', avatar: { skin: 0, hairStyle: 4, hairColor: 4, eyes: 0, outfit: 3, acc: 0 } },
      { name: 'โทกามิ เบียคุยะ', avatar: { skin: 1, hairStyle: 2, hairColor: 3, eyes: 2, outfit: 2, acc: 1 } },
      { name: 'อาซาฮินะ อาโออิ', avatar: { skin: 2, hairStyle: 3, hairColor: 2, eyes: 0, outfit: 0, acc: 0 } },
      { name: 'ฮิฟุมิ ยามาดะ', avatar: { skin: 1, hairStyle: 5, hairColor: 0, eyes: 3, outfit: 0, acc: 2 } }
    ];
  }

  // Authentic courtroom noise deliberation pool (non-spoiling general courtroom banter)
  const noisePool = [
    "เดี๋ยวก่อนสิ ทุกคนอย่าเพิ่งด่วนสรุป ลองตั้งสติแล้วนึกดูใหม่อีกที!",
    "ตอนนั้นฉันกำลังมัวแต่วุ่นวายอยู่ ไม่ทันสังเกตเห็นอะไรผิดปกติเลย...",
    "จุดสำคัญคือความขัดแย้งระหว่างช่วงเวลากับร่องรอยในที่เกิดเหตุไม่ใช่เหรอ?",
    "ถ้าคิดไม่ออกก็เงียบปาก แล้วลองดูหลักฐานที่พวกเราพบให้ละเอียดก่อน!",
    "แต่ว่าตอนที่เกิดเรื่อง ทุกคนก็กำลังตกใจกันอยู่นี่นา ใครจะไปจำเวลาได้เป๊ะๆ ล่ะ!?",
    "โธ่เอ๊ย! แผนการซับซ้อนขนาดนั้น ใครมันจะไปเตรียมการได้ในเวลาสั้นๆ กันเล่า!?",
    "หรือว่า... สิ่งที่พวกเราเห็น อาจจะถูกใครบางคนจงใจจัดฉากขึ้นมาเพื่อเบี่ยงเบนสายตา!?",
    "พยานหลักฐานที่มีตอนนี้ มันยังดูมีช่องโหว่ที่ปะติดปะต่อกันไม่ลงตัวเลยนะ!"
  ];

  const count = Math.max(speakers.length, 5);
  const statements = [];
  for (let i = 0; i < count; i++) {
    const sp = speakers[i % speakers.length];
    const text = noisePool[i % noisePool.length];
    statements.push({
      speaker: sp.name,
      avatar: sp.avatar,
      text: text
    });
  }
  return statements;
}

function applyDynamicRoomBanterStage0() {
  const topInput = document.getElementById('cfgStg0Topic');
  const stmtInput = document.getElementById('cfgStg0Statements');
  if (topInput) topInput.value = "ช่วงเวลาเกิดเหตุ & เสียงกระแทกปริศนาตอน 21:00 น.";
  if (stmtInput) {
    const stmts = generateDynamicDebateStatements();
    stmtInput.value = stmts.map(s => `[${s.speaker}] ${s.text}`).join('\n');
  }
  showToast("🔄 ดึงรายชื่อตัวละครในห้องปัจจุบันเข้ามาเป็นบทพูดเรียบร้อย!");
}

// ==========================================================
// SCENARIO MANAGER & EXTENSIBILITY ARCHITECTURE (FUTURE CASES)
// ==========================================================
const TrialEventBus = {
  listeners: {},
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  },
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try { cb(data); } catch(err) { console.error('[TrialEventBus Error]:', err); }
      });
    }
  }
};

const ScenarioManager = {
  cases: {},
  activeCaseId: 'case1',

  registerCase(caseId, caseData) {
    this.cases[caseId] = caseData;
  },

  getActiveCase() {
    return this.cases[this.activeCaseId] || this.cases['case1'];
  },

  loadCase(caseId) {
    if (!this.cases[caseId]) {
      console.warn(`[ScenarioManager] Case '${caseId}' not found. Defaulting to case1.`);
      this.activeCaseId = 'case1';
    } else {
      this.activeCaseId = caseId;
    }
    const cData = this.getActiveCase();
    if (cData) {
      if (cData.clues) ALL_CLUES_DATA = cData.clues;
      if (cData.logicDive) LOGIC_DIVE_ROUTES = cData.logicDive;
      if (cData.closingPages) CLOSING_PAGES_DATA = cData.closingPages;
      if (cData.closingCards) CLOSING_CARDS_DATA = cData.closingCards;
      logCourt(`📂 [SCENARIO LOADED]: โหลดข้อมูลคดี "${cData.title || caseId}" เรียบร้อย`);
      TrialEventBus.emit('case_loaded', { caseId, data: cData });
    }
  }
};

// Register Case 1 (The Staged Hanging in the Laundry Room)
ScenarioManager.registerCase('case1', {
  id: 'case1',
  chapter: 1,
  title: 'คดีห้องซักรีดและกับดักรอกเพดาน (The Staged Laundry Room Trap)',
  victim: 'เรียวตะ เซ็นโงคุ (Ryota Sengoku - PC B)',
  culprit: 'ฮิฟุมิ ยามาดะ (Hifumi Yamada - PC 5)',
  clues: ALL_CLUES_DATA,
  logicDive: LOGIC_DIVE_ROUTES,
  closingPages: CLOSING_PAGES_DATA,
  closingCards: CLOSING_CARDS_DATA
});
