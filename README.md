# Danganronpa TTRPG: คดีสตูว์มรณะแห่งความสิ้นหวัง
*(The Despair Stew & The Counter-Hanging Mystery)*

ชุดบทและคู่มือการเล่น TRPG สไตล์ Danganronpa ฉบับปรับปรุงความสมเหตุสมผลของตรรกะคดีและหลักฟิสิกส์ รองรับผู้เล่น 4-6 คน พร้อมระบบสืบสวนสุ่มเก็บการ์ด 4 ประเภท (สำคัญแก่หลัก, เสริม, หลอก, ขยะ), ไทม์ไลน์ความทรงจำเฉพาะบุคคล และ **Web Application มินิเกมศาลชั้นเรียน Real-Time พร้อมระบบ DM Admin Dashboard และคนร้ายแอบก่อกวน (Secret Saboteur)** 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/AnMayVaa/Danganronpa-TTRPG)

---

## 🌐 การติดตั้งและเปิดใช้งานผ่าน Vercel / GitHub

- **GitHub Repository:** [https://github.com/AnMayVaa/Danganronpa-TTRPG](https://github.com/AnMayVaa/Danganronpa-TTRPG)
- **Deploy ขึ้น Vercel:**
  1. ไปที่ [vercel.com/new](https://vercel.com/new)
  2. เลือก Import repository: **`AnMayVaa/Danganronpa-TTRPG`**
  3. กดปุ่ม **Deploy** ได้ทันที (ระบบมีไฟล์ `vercel.json` ชี้ไปที่ `web-minigame/public` พร้อมระบบ WebRTC P2P แบบเรียลไทม์ โดยไม่ต้องตั้งค่าใดๆ เพิ่มเติม!)

---

## 🚀 การเปิดใช้งานแบบ Local บนเครื่องคอมพิวเตอร์

1. ดับเบิ้ลคลิกไฟล์ **`START_MINIGAME.bat`** ที่โฟลเดอร์นี้
2. ระบบจะเปิดหน้าต่างเซิร์ฟเวอร์ และเปิดหน้าเว็บ `http://localhost:3000` บนโน้ตบุ๊กของ DM ทันที
3. ส่งลิงก์หรือให้เพื่อนสแกน QR Code เข้าจากโทรศัพท์มือถือ

---

## 🕹️ โครงสร้างระบบ Web Mini-Game และหน้าจอควบคุม

หน้าเว็บออกแบบในสไตล์ **Danganronpa Pop-Art & Neon Cyberpunk** เต็มรูปแบบ รองรับ 3 มุมมอง:

### 1. 🏛️ จอหลักศาลชั้นเรียน (Courtroom Main Screen)
- สำหรับเปิดขึ้นโปรเจกเตอร์หรือทีวีหน้าโต๊ะ
- แสดง Influence Gauge (หลอดเลือดความน่าเชื่อถือแบบเส้นเตือนภัย), นาฬิกานับถอยหลัง Monokuma, แท่นโพเดียม 3D ของผู้เล่นทุกคน
- หน้าจอมินิเกมแต่ละด่านแบบไดนามิก และ Terminal แจ้งเตือนคลื่นสัญญาณรบกวน (Anomaly Event Stream)
- หน้าต่างห้องลงคะแนน (Voting Time) แสดงผลกราฟแท่งคะแนนโหวตสดๆ ในศาล!

### 2. 🎛️ ผู้ดูแลศาล (DM Admin Dashboard)
- **Mini-Game Selector:** กดเลือกเปิดมินิเกมด่านใดก็ได้ทันที:
  1. `Evidence Linker` (นำเสนอหลักฐานทลายข้ออ้าง)
  2. `Hangman's Gambit` (ถอดรหัสคำสำคัญ "นาฬิกาน้ำ")
  3. `Rebuttal Showdown` (ดวลดาบคำพูด 1 ต่อ 1)
  4. `Logic Dive` (สเก็ตบอร์ดดำดิ่งตรรกะ 3 ด่าน)
  5. `Debate Scrum` (ศึกสองขั้วความคิด ดันเกจ Scrum)
  6. `Argument Armament` (ทุบเกราะความจริงคนร้าย)
  7. `Voting Time` (ส่งหน้าจอโหวตเข้ามือถือทุกคน)
- **Timer & HP Controls:** ปรับเพิ่ม/ลดเวลา (+30s, -15s), ปรับหลอดเลือดศาล (+20%, -20%, Reset 100%)
- **Verdict Execution Buttons:** สั่งประหารและเปิดผลลัพธ์:
  - 🟢 **ตัดสินถูก (B คือ Blackened):** ทุกคนรอดชีวิต! A แผนพังยับเยิน (True Ending)
  - 🔴 **ตัดสินผิด (โหวต A):** ประหารชีวิตหมู่นักเรียนทุกคน! (Bad Ending)
- **Monokuma Soundboard & FX:** เคาะค้อนศาล (Gavel), เสียงหัวเราะ Monokuma, ไซเรนเตือนภัย, สัญญาณ Glitch

### 3. 📱 จอมือถือผู้เล่น (Mobile Player View)
- ผู้เล่นเลือกตัวละคร (PC 1 ถึง PC 6) และร่วมมือกันทำภารกิจตามแต่ละมินิเกม
- **☠️ เมนูลับคนร้าย (Secret Saboteur Panel - เฉพาะนักมายากล):**
  - แอบกดก่อกวนสัญญาณ (Signal Glitch ทำให้จอเพื่อนเบลอและสั่น 4 วินาที)
  - แอบลดเวลา Monokuma (-10 วินาที)
  - แทรกแซงข้อมูลเท็จ (-10% เลือดศาล)
  - แอบดึงเกจ Scrum กลับ (-6%)

---

## 📁 สารบัญไฟล์และเอกสารในโปรเจกต์

1. **[`START_MINIGAME.bat`](file:///c:/Antigravity/Danganronpa-TTRPG/START_MINIGAME.bat)**
   - สคริปต์ 1-Click สำหรับเปิดเซิร์ฟเวอร์มินิเกมและหน้าจอควบคุมของ DM
2. **[`01_DM_Scenario_Flow.md`](file:///c:/Antigravity/Danganronpa-TTRPG/01_DM_Scenario_Flow.md)**
   - สรุปเบื้องหลังคดี (Master Solution & Timeline 17:30 - 21:00 น.)
   - สคริปต์การรันเกมตั้งแต่ Scene 1 (The Awakening) จนถึง Scene 10 (The Verdict) เชื่อมโยงกับเว็บมินิเกม
3. **[`02_Character_Sheets_and_Handouts.md`](file:///c:/Antigravity/Danganronpa-TTRPG/02_Character_Sheets_and_Handouts.md)**
   - แผ่นตัวละคร PC 1-6 และ NPC B (เหยื่อ)
   - เอกสารแจกแยก **Phase 1 (ข้อมูลเริ่มเกม)** และ **Phase 2 (ไทม์ไลน์ความทรงจำเฉพาะบุคคล + บทบาท Saboteur)**
4. **[`03_Investigation_Clues_Cards.md`](file:///c:/Antigravity/Danganronpa-TTRPG/03_Investigation_Clues_Cards.md)**
   - ระบบการสุ่มจั่วการ์ดตาม 5 จุดสำรวจ
   - สำรับการ์ดหลักฐาน 16 ใบ แบ่งเป็น 4 ประเภทชัดเจน: Core, Supporting, Red Herrings, Trash Items
5. **[`04_Class_Trial_Debate_Guide.md`](file:///c:/Antigravity/Danganronpa-TTRPG/04_Class_Trial_Debate_Guide.md)**
   - ผังศาลชั้นเรียนเชื่อมโยงกับมินิเกม
   - Weak Points และ Truth Bullets ในแต่ละช่วงการถกเถียง
6. **[`05_Class_Trial_Mini_Games.md`](file:///c:/Antigravity/Danganronpa-TTRPG/05_Class_Trial_Mini_Games.md)**
   - คู่มือกติกาสำหรับเล่นมินิเกมทั้งแบบแอนะล็อกหน้าโต๊ะ และแบบดิจิทัลบนเว็บ
7. **[`web-minigame/`](file:///c:/Antigravity/Danganronpa-TTRPG/web-minigame)**
   - โค้ดเต็มของ Web Mini-Game ระบบ WebRTC (PeerJS) และ Socket.io พร้อม Deploy บน Vercel
