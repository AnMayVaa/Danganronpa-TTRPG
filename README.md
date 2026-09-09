# Danganronpa TTRPG: คดีสตูว์มรณะแห่งความสิ้นหวัง
*(The Despair Stew & The Counter-Hanging Mystery)*

ชุดบทและคู่มือการเล่น TRPG สไตล์ Danganronpa ฉบับปรับปรุงความสมเหตุสมผลของตรรกะคดีและหลักฟิสิกส์ รองรับผู้เล่น 4-6 คน พร้อมระบบสืบสวนสุ่มเก็บการ์ด 4 ประเภท (สำคัญแก่หลัก, เสริม, หลอก, ขยะ), ไทม์ไลน์ความทรงจำเฉพาะบุคคล และ **Web Application มินิเกมศาลชั้นเรียนที่มีระบบแอบก่อกวน (Secret Saboteur)** สำหรับรันเล่นจริงหน้าโต๊ะ

---

## 🚀 วิธีเปิดใช้งาน Web Mini-Game สำหรับศาลชั้นเรียน

1. ดับเบิ้ลคลิกไฟล์ **`START_MINIGAME.bat`** ที่โฟลเดอร์นี้
2. ระบบจะเปิดหน้าต่างเซิร์ฟเวอร์ และเปิดหน้าเว็บ `http://localhost:3000` บนโน้ตบุ๊กของ DM ทันที (สามารถต่อจอแยก/โปรเจกเตอร์ได้)
3. ให้ผู้เล่นทุกคนใช้สมาร์ทโฟนที่ต่อ Wi-Fi วงเดียวกัน เปิดเบราว์เซอร์แล้วพิมพ์ URL ที่ปรากฏบนหน้าจอหลัก (เช่น `http://192.168.1.XX:3000`)
4. ผู้เล่นกรอกชื่อและเลือกอาชีพของตนเอง:
   - ผู้เล่นทั่วไป: ร่วมมือกันแก้ทาสก์บนหน้าจอมือถือ
   - ผู้เล่นที่เลือก **"นักมายากล" (คนร้าย A):** จะมี **"เมนูลับสีแดง (Sabotage Panel)"** ปรากฏขึ้นที่จอมือถือ สามารถแอบกดก่อกวนสัญญาณ (Glitch), แอบลดเวลา, หรือแอบดึงเกจดีเบตกลับแบบเนียนๆ ได้!

---

## 📁 สารบัญไฟล์และเอกสารในโปรเจกต์

1. **[`START_MINIGAME.bat`](file:///c:/Antigravity/Danganronpa-TTRPG/START_MINIGAME.bat)**
   - สคริปต์ 1-Click สำหรับเปิดเซิร์ฟเวอร์มินิเกมและหน้าจอควบคุมของ DM
2. **[`01_DM_Scenario_Flow.md`](file:///c:/Antigravity/Danganronpa-TTRPG/01_DM_Scenario_Flow.md)**
   - สรุปเบื้องหลังคดี (Master Solution & Timeline 17:30 - 21:00 น.)
   - ขั้นตอนการรันเกมตั้งแต่ Scene 1 (The Awakening) จนถึง Scene 10 (The Verdict) เชื่อมโยงกับเว็บมินิเกม
3. **[`02_Character_Sheets_and_Handouts.md`](file:///c:/Antigravity/Danganronpa-TTRPG/02_Character_Sheets_and_Handouts.md)**
   - แผ่นตัวละคร PC 1-6 และ NPC B (เหยื่อ)
   - เอกสารแจกแยก **Phase 1 (ข้อมูลเริ่มเกม)** และ **Phase 2 (ไทม์ไลน์ความทรงจำเฉพาะบุคคล + บทบาท Saboteur)**
4. **[`03_Investigation_Clues_Cards.md`](file:///c:/Antigravity/Danganronpa-TTRPG/03_Investigation_Clues_Cards.md)**
   - ระบบการสุ่มจั่วการ์ดตาม 5 จุดสำรวจ
   - สำรับการ์ดหลักฐาน 16 ใบ แบ่งเป็น 4 ประเภทชัดเจน:
     - 🔴 **สำคัญแก่หลัก (Core):** 4 ใบ (กระดูกหมูเปื้อนเลือด, มีดพก B, เงื่อนเซฟตี้, ซากถังน้ำ 100 ลิตร)
     - 🔵 **มีก็ดีช่วยเสริม (Supporting):** 4 ใบ (แผงตั้งเวลาเครื่องอบผ้า, วาล์วก๊อกน้ำ, รอยแผล 17:30 น., Monokuma File)
     - 🟡 **หลอก (Red Herrings):** 4 ใบ (หลอดไซยาไนด์เปล่า, รองเท้าสตั๊นต์, จดหมายขู่ 21:00 น., รอยงัดแงะหน้าต่าง)
     - ⚫ **ขยะ (Trash Items):** 4 ใบ (ชานมไข่มุกบูด, ดัมเบลเปื้อนซอส, ดาวห้าแฉก, ฟิวส์ไฟไหม้)
5. **[`04_Class_Trial_Debate_Guide.md`](file:///c:/Antigravity/Danganronpa-TTRPG/04_Class_Trial_Debate_Guide.md)**
   - ผังศาลชั้นเรียน 6 ช่วงที่เชื่อมโยงกับมินิเกมบนเว็บ
   - Weak Points และ Truth Bullets ในแต่ละช่วงการถกเถียง
   - คำตัดสินและการลงคะแนน (True Ending vs Bad Ending)
6. **[`05_Class_Trial_Mini_Games.md`](file:///c:/Antigravity/Danganronpa-TTRPG/05_Class_Trial_Mini_Games.md)**
   - คู่มือกติกาสำหรับเล่นมินิเกมทั้งแบบแอนะล็อกหน้าโต๊ะ และแบบดิจิทัลบนเว็บ
7. **[`web-minigame/`](file:///c:/Antigravity/Danganronpa-TTRPG/web-minigame)**
   - ซอร์สโค้ดเต็มของ Web Mini-Game (Node.js, Express, Socket.io, HTML5 Canvas/Audio)
