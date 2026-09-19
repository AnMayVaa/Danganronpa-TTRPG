import os
import math
import random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageEnhance

TARGET_WIDTH = 1376
TARGET_HEIGHT = 768
ASSETS_DIR = os.path.abspath('assets/manga')
os.makedirs(ASSETS_DIR, exist_ok=True)

def get_font(font_name, size):
    try:
        return ImageFont.truetype(f"C:/Windows/Fonts/{font_name}.ttf", size)
    except Exception:
        return ImageFont.load_default()

FONT_IMPACT_XL = get_font("impact", 90)
FONT_IMPACT_LG = get_font("impact", 72)
FONT_IMPACT_MD = get_font("impact", 48)
FONT_IMPACT_SM = get_font("impact", 32)
FONT_ARIAL_BOLD = get_font("arialbd", 24)
FONT_ARIAL_SM = get_font("arialbd", 18)

def create_manga_base(bg_image_path, contrast_factor=2.0, brightness_factor=0.85):
    """Converts a base photo into high-contrast black and white manga screentone art"""
    full_path = os.path.join(ASSETS_DIR, bg_image_path) if not os.path.isabs(bg_image_path) else bg_image_path
    if os.path.exists(full_path):
        bg = Image.open(full_path).convert('RGB')
        bg = ImageOps.fit(bg, (TARGET_WIDTH, TARGET_HEIGHT), method=Image.Resampling.LANCZOS)
    else:
        bg = Image.new('RGB', (TARGET_WIDTH, TARGET_HEIGHT), color=(20, 22, 28))
    
    gray = bg.convert('L')
    edges = gray.filter(ImageFilter.FIND_EDGES)
    edges = ImageOps.invert(edges)
    edges = ImageEnhance.Contrast(edges).enhance(2.8)
    
    gray = ImageEnhance.Contrast(gray).enhance(contrast_factor)
    gray = ImageEnhance.Brightness(gray).enhance(brightness_factor)
    
    manga_l = Image.blend(gray, edges, 0.40)
    
    # Comic Screentone dot simulation (subtle line raster)
    manga_rgb = Image.merge('RGB', (
        manga_l,
        manga_l,
        ImageEnhance.Brightness(manga_l).enhance(1.02)
    ))
    return manga_rgb

def add_speed_lines(draw, center_x, center_y, num_lines=50, inner_r=150, outer_r=950, color=(255, 255, 255, 130)):
    for i in range(num_lines):
        angle = (2 * math.pi / num_lines) * i + random.uniform(-0.03, 0.03)
        r1 = inner_r + random.uniform(0, 80)
        r2 = outer_r + random.uniform(40, 180)
        x1 = int(center_x + r1 * math.cos(angle))
        y1 = int(center_y + r1 * math.sin(angle))
        x2 = int(center_x + r2 * math.cos(angle))
        y2 = int(center_y + r2 * math.sin(angle))
        draw.line([(x1, y1), (x2, y2)], fill=color, width=random.randint(2, 5))

def add_shadow_culprit(draw, x, y, scale=1.0, facing="right", eye_color=(255, 255, 255), pose="normal"):
    shadow_col = (15, 17, 22)
    highlight_col = (50, 55, 70)
    
    head_r = int(52 * scale)
    draw.ellipse([
        (x - head_r, y - head_r),
        (x + head_r, y + head_r)
    ], fill=shadow_col, outline=(0, 0, 0), width=4)
    
    # Sharp glowing eyes (Detective Conan Shadow Culprit style)
    eye_w = int(15 * scale)
    eye_h = int(6 * scale)
    eye_y = y - int(5 * scale)
    if facing == "right":
        eye_x1 = x + int(8 * scale)
        eye_x2 = x + int(28 * scale)
    else:
        eye_x1 = x - int(28 * scale)
        eye_x2 = x - int(8 * scale)
        
    draw.ellipse([(eye_x1 - eye_w, eye_y - eye_h), (eye_x1 + eye_w, eye_y + eye_h)], fill=eye_color)
    draw.ellipse([(eye_x2 - eye_w, eye_y - eye_h), (eye_x2 + eye_w, eye_y + eye_h)], fill=eye_color)
    
    torso_top = y + head_r - int(6 * scale)
    torso_bottom = torso_top + int(260 * scale)
    sh_w = int(120 * scale)
    
    body_poly = [
        (x - sh_w, torso_top + int(35 * scale)),
        (x - int(sh_w * 0.75), torso_top),
        (x + int(sh_w * 0.75), torso_top),
        (x + sh_w, torso_top + int(35 * scale)),
        (x + int(sh_w * 0.85), torso_bottom),
        (x - int(sh_w * 0.85), torso_bottom)
    ]
    draw.polygon(body_poly, fill=shadow_col, outline=(0, 0, 0), width=3)
    draw.line([(x - sh_w, torso_top + int(35 * scale)), (x - int(sh_w * 0.75), torso_top)], fill=highlight_col, width=4)

def add_sfx_text(draw, text, x, y, size="lg", color=(255, 20, 147), bg_border=(0, 0, 0)):
    font = FONT_IMPACT_XL if size == "xl" else (FONT_IMPACT_LG if size == "lg" else (FONT_IMPACT_MD if size == "md" else FONT_IMPACT_SM))
    # Double outline
    for r in [8, 6, 4, 2]:
        for dx in range(-r, r + 1):
            for dy in range(-r, r + 1):
                if dx*dx + dy*dy <= r*r:
                    draw.text((x + dx, y + dy), text, font=font, fill=bg_border)
    draw.text((x, y), text, font=font, fill=color)

def add_manga_frame(img, panel_badge, time_badge):
    draw = ImageDraw.Draw(img)
    draw.rectangle([(0, 0), (TARGET_WIDTH - 1, TARGET_HEIGHT - 1)], outline=(0, 0, 0), width=14)
    draw.rectangle([(14, 14), (TARGET_WIDTH - 15, TARGET_HEIGHT - 15)], outline=(255, 255, 255, 70), width=2)
    
    # Manga Panel Number Tag
    draw.rectangle([(22, 22), (230, 64)], fill=(0, 0, 0), outline=(255, 20, 147), width=3)
    draw.text((34, 30), panel_badge, font=FONT_ARIAL_BOLD, fill=(255, 255, 255))
    
    # Manga Time Tag
    if time_badge:
        draw.rectangle([(TARGET_WIDTH - 200, 22), (TARGET_WIDTH - 24, 64)], fill=(0, 0, 0), outline=(0, 240, 255), width=3)
        draw.text((TARGET_WIDTH - 186, 30), f"🕒 {time_badge}", font=FONT_ARIAL_BOLD, fill=(0, 240, 255))

def add_pink_rope(draw, points, width=8):
    for i in range(len(points) - 1):
        p1, p2 = points[i], points[i+1]
        draw.line([p1, p2], fill=(0, 0, 0), width=width + 6)
        draw.line([p1, p2], fill=(255, 42, 133), width=width)
        draw.line([p1, p2], fill=(255, 175, 215), width=int(width / 3))

# -------------------------------------------------------------
# SPECIFIC MANGA PANEL GENERATORS
# -------------------------------------------------------------

def gen_p1_kitchen_shadow():
    img = create_manga_base("Rooms/room_kitchen.jpg", 2.2, 0.75)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 400, 420, 30, 200, 800, (255, 255, 255, 90))
    add_shadow_culprit(draw, 420, 360, 1.25, "right")
    add_sfx_text(draw, "*RUMMAGE... FREEZER*", 520, 120, "lg", (0, 240, 255))
    add_sfx_text(draw, "ゴゴゴ...", 280, 220, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 1 • PANEL 1", "17:30 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p1_kitchen_shadow.jpg"), quality=95)

def gen_p1_wipe_traces():
    img = create_manga_base("Crime_Scene/crime_scene_kitchen_stew.jpg", 1.9, 0.8)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 450, 35, 180, 850, (255, 255, 255, 100))
    add_shadow_culprit(draw, 980, 380, 1.15, "left")
    # Blood spots getting wiped
    for (bx, by) in [(620, 520), (660, 540), (590, 490)]:
        draw.ellipse([(bx-12, by-8), (bx+12, by+8)], fill=(255, 20, 147), outline=(0,0,0), width=2)
    add_sfx_text(draw, "*WIPE... SILENCE*", 350, 140, "lg", (255, 20, 147))
    add_sfx_text(draw, "スッ...", 820, 200, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 1 • PANEL 4", "17:40 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p1_wipe_traces.jpg"), quality=95)

def gen_p2_drag_victim():
    img = create_manga_base("Crime_Scene/crime_scene_laundry.jpg", 2.0, 0.8)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 500, 500, 35, 150, 800, (255, 255, 255, 110))
    add_shadow_culprit(draw, 750, 320, 1.2, "left")
    # Unconscious shadow victim on floor
    draw.ellipse([(320, 520), (440, 580)], fill=(12, 14, 18), outline=(0,0,0), width=4)
    draw.polygon([(400, 540), (680, 570), (660, 640), (380, 610)], fill=(12, 14, 18), outline=(0,0,0), width=3)
    add_sfx_text(draw, "*CREAK... DRAG!*", 280, 130, "lg", (255, 20, 147))
    add_sfx_text(draw, "ズリズリ...", 480, 420, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 2 • PANEL 1", "17:45 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p2_drag_victim.jpg"), quality=95)

def gen_p2_pulley_pipe():
    img = create_manga_base("item/item_ceiling_pipe.jpg", 2.1, 0.85)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 320, 45, 140, 900, (255, 255, 255, 140))
    # Pink rope loop over ceiling pipe
    add_pink_rope(draw, [(200, 750), (580, 340), (740, 330), (1150, 750)], width=10)
    add_sfx_text(draw, "*SLIDE... HOIST!*", 420, 140, "xl", (255, 20, 147))
    add_sfx_text(draw, "キュルルッ!", 780, 260, "md", (0, 240, 255))
    add_manga_frame(img, "PAGE 2 • PANEL 3", "18:15 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p2_pulley_pipe.jpg"), quality=95)

def gen_p2_toss_window():
    img = create_manga_base("item/item_laundry_window.jpg", 2.0, 0.8)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 800, 360, 40, 160, 900, (255, 255, 255, 120))
    add_shadow_culprit(draw, 380, 380, 1.15, "right")
    # Rope thrown through window
    add_pink_rope(draw, [(440, 420), (620, 320), (820, 330), (1050, 520)], width=8)
    add_sfx_text(draw, "*TOSS... OUTSIDE!*", 480, 120, "lg", (0, 240, 255))
    add_sfx_text(draw, "ヒュッ!", 720, 240, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 2 • PANEL 4", "18:30 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p2_toss_window.jpg"), quality=95)

def gen_p3_barrel_position():
    img = create_manga_base("Rooms/room_courtyard.jpg", 2.0, 0.8)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 500, 35, 180, 850, (255, 255, 255, 100))
    add_shadow_culprit(draw, 880, 360, 1.2, "left")
    # Blue barrel silhouette
    draw.polygon([(520, 420), (660, 420), (670, 640), (510, 640)], fill=(20, 40, 80), outline=(0, 240, 255), width=3)
    add_sfx_text(draw, "*THUD... BLINDSPOT*", 320, 130, "lg", (0, 240, 255))
    add_manga_frame(img, "PAGE 3 • PANEL 1", "18:35 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p3_barrel_position.jpg"), quality=95)

def gen_p3_tie_barrel():
    img = create_manga_base("item/item_shattered_barrel.jpg", 2.2, 0.85)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 420, 40, 150, 850, (255, 255, 255, 120))
    # Tying pink rope tightly to handle
    add_pink_rope(draw, [(300, 100), (560, 380), (680, 430), (620, 480), (740, 460)], width=10)
    add_sfx_text(draw, "*BIND... DOUBLE KNOT!*", 340, 120, "lg", (255, 20, 147))
    add_sfx_text(draw, "ギュッ!", 720, 280, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 3 • PANEL 2", "18:45 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p3_tie_barrel.jpg"), quality=95)

def gen_p3_water_hose():
    img = create_manga_base("item/item_water_hose.jpg", 2.0, 0.9)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 450, 40, 140, 850, (255, 255, 255, 110))
    # Green hose and water trickle
    draw.line([(280, 680), (650, 440)], fill=(0, 200, 100), width=12)
    for (wx, wy) in [(680, 460), (700, 520), (710, 580), (725, 650)]:
        draw.ellipse([(wx-8, wy-8), (wx+8, wy+8)], fill=(0, 240, 255), outline=(0,0,0), width=2)
    add_sfx_text(draw, "*DRIP... TRICKLE 0.4L/M*", 360, 120, "lg", (0, 240, 255))
    add_sfx_text(draw, "チョロチョロ...", 740, 320, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 3 • PANEL 3", "18:50 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p3_water_hose.jpg"), quality=95)

def gen_p3_water_timer():
    img = create_manga_base("item/item_water_drops.jpg", 2.1, 0.85)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 380, 45, 140, 900, (255, 255, 255, 130))
    # Ominous countdown clock overlay
    draw.ellipse([(530, 230), (830, 530)], outline=(0, 240, 255), width=6)
    draw.line([(680, 380), (680, 270)], fill=(255, 20, 147), width=6)
    draw.line([(680, 380), (760, 380)], fill=(0, 240, 255), width=5)
    add_sfx_text(draw, "*TICK-TOCK... TO 21:00*", 340, 110, "xl", (255, 20, 147))
    add_sfx_text(draw, "カチ... カチ...", 380, 580, "md", (0, 240, 255))
    add_manga_frame(img, "PAGE 3 • PANEL 4", "19:00 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p3_water_timer.jpg"), quality=95)

def gen_p4_delay_dryer():
    img = create_manga_base("item/item_dryer_dry1.jpg", 2.2, 0.85)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 720, 340, 45, 120, 900, (255, 255, 255, 140))
    # Digital timer glow
    draw.rectangle([(560, 250), (880, 350)], fill=(0, 0, 0), outline=(255, 20, 147), width=4)
    draw.text((580, 270), "DELAY: 2:00 -> 21:00", font=FONT_IMPACT_MD, fill=(0, 240, 255))
    add_sfx_text(draw, "*BEEP... PROGRAMMED!*", 380, 120, "lg", (0, 240, 255))
    add_sfx_text(draw, "ピッ!", 840, 420, "md", (255, 20, 147))
    add_manga_frame(img, "PAGE 4 • PANEL 1", "18:55 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p4_delay_dryer.jpg"), quality=95)

def gen_p4_boots_dryer():
    img = create_manga_base("item/item_dryer_dry1.jpg", 2.0, 0.8)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 440, 40, 140, 850, (255, 255, 255, 130))
    # Silhouette of heavy leather boot tossed into drum
    draw.polygon([(560, 360), (660, 320), (740, 420), (700, 520), (540, 460)], fill=(15, 15, 18), outline=(255, 255, 255), width=3)
    add_sfx_text(draw, "*CLATTER & STAMP!*", 420, 120, "lg", (255, 20, 147))
    add_sfx_text(draw, "ガタゴト!", 320, 460, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 4 • PANEL 2", "18:58 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p4_boots_dryer.jpg"), quality=95)

def gen_p4_dining_alibi():
    img = create_manga_base("Rooms/room_dining_hall.jpg", 1.9, 0.9)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 450, 30, 220, 800, (255, 255, 255, 80))
    add_shadow_culprit(draw, 680, 360, 1.15, "right")
    add_sfx_text(draw, "*IRONCLAD ALIBI*", 440, 120, "lg", (0, 240, 255))
    add_sfx_text(draw, "ワイワイ...", 300, 280, "md", (255, 255, 255))
    add_manga_frame(img, "PAGE 4 • PANEL 3", "19:00 - 21:00 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p4_dining_alibi.jpg"), quality=95)

def gen_p4_knife_cut():
    img = create_manga_base("item/item_pocket_knife.jpg", 2.2, 0.85)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 380, 55, 100, 950, (255, 255, 255, 160))
    # Knife blade slash line across severed rope
    add_pink_rope(draw, [(200, 260), (580, 380)], width=10)
    add_pink_rope(draw, [(760, 420), (1150, 540)], width=10)
    # Bright slash spark
    draw.line([(520, 240), (840, 520)], fill=(255, 255, 255), width=8)
    draw.line([(520, 240), (840, 520)], fill=(0, 240, 255), width=3)
    add_sfx_text(draw, "*SLASH!! SEVERED!*", 380, 110, "xl", (255, 20, 147))
    add_sfx_text(draw, "ザシュッ!!", 780, 260, "lg", (0, 240, 255))
    add_manga_frame(img, "PAGE 4 • PANEL 4", "20:45 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p4_knife_cut.jpg"), quality=95)

def gen_p5_rebind_noose():
    img = create_manga_base("item/item_pink_rope.jpg", 2.2, 0.8)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 380, 50, 120, 950, (255, 255, 255, 140))
    add_shadow_culprit(draw, 680, 380, 1.25, "right", eye_color=(255, 20, 147))
    # Fatal noose loop around neck
    draw.ellipse([(620, 370), (740, 490)], outline=(255, 20, 147), width=8)
    add_sfx_text(draw, "*CHOKE... TRAPPED!!*", 360, 110, "xl", (255, 20, 147))
    add_sfx_text(draw, "グギギッ!!", 280, 340, "lg", (255, 255, 255))
    add_manga_frame(img, "PAGE 5 • PANEL 1", "20:55 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p5_rebind_noose.jpg"), quality=95)

def gen_p5_barrel_crash():
    img = create_manga_base("Crime_Scene/crime_scene_courtyard_impact.jpg", 2.2, 0.9)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 520, 60, 80, 1000, (255, 255, 255, 170))
    add_sfx_text(draw, "*KRA-BOOM!! CRASH!!*", 280, 100, "xl", (0, 240, 255))
    add_sfx_text(draw, "ドカーーーン!!", 400, 320, "lg", (255, 20, 147))
    add_manga_frame(img, "PAGE 5 • PANEL 2", "21:00:00 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p5_barrel_crash.jpg"), quality=95)

def gen_p5_ryota_reveal():
    img = create_manga_base("character/ryota.jpg", 1.8, 0.95)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 360, 60, 100, 950, (255, 20, 147, 160))
    # Shatter glass lines across the face reveal
    for (x1, y1, x2, y2) in [
        (400, 150, 720, 420), (720, 420, 950, 200),
        (720, 420, 680, 700), (550, 420, 420, 650)
    ]:
        draw.line([(x1, y1), (x2, y2)], fill=(255, 255, 255), width=5)
        draw.line([(x1, y1), (x2, y2)], fill=(0, 240, 255), width=2)
    # Pink rope hoisting neck
    add_pink_rope(draw, [(680, 50), (680, 450)], width=10)
    add_sfx_text(draw, "*TRUE BLACKENED REVEAL!!*", 240, 90, "xl", (255, 20, 147))
    add_sfx_text(draw, "สึกิชิมะ เรียวตะ!", 460, 620, "lg", (0, 240, 255))
    add_manga_frame(img, "PAGE 5 • PANEL 3", "21:00:02 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p5_ryota_reveal.jpg"), quality=95)

def gen_p5_monokuma_guilty():
    img = create_manga_base("character/monokuma.jpg", 2.0, 0.95)
    draw = ImageDraw.Draw(img)
    add_speed_lines(draw, 680, 380, 55, 120, 950, (255, 20, 147, 150))
    # Large GUILTY Rubber Stamp
    stamp_rect = [(420, 260), (960, 420)]
    draw.rectangle(stamp_rect, fill=None, outline=(255, 20, 147), width=10)
    draw.rectangle([(428, 268), (952, 412)], fill=None, outline=(255, 20, 147), width=3)
    add_sfx_text(draw, "GUILTY!", 480, 280, "xl", (255, 20, 147))
    add_sfx_text(draw, "*PUNISHMENT TIME!!*", 360, 90, "xl", (0, 240, 255))
    add_manga_frame(img, "PAGE 5 • PANEL 4", "21:05 น.")
    img.save(os.path.join(ASSETS_DIR, "manga_p5_monokuma_guilty.jpg"), quality=95)

# Run all generators
generators = [
    gen_p1_kitchen_shadow, gen_p1_wipe_traces,
    gen_p2_drag_victim, gen_p2_pulley_pipe, gen_p2_toss_window,
    gen_p3_barrel_position, gen_p3_tie_barrel, gen_p3_water_hose, gen_p3_water_timer,
    gen_p4_delay_dryer, gen_p4_boots_dryer, gen_p4_dining_alibi, gen_p4_knife_cut,
    gen_p5_rebind_noose, gen_p5_barrel_crash, gen_p5_ryota_reveal, gen_p5_monokuma_guilty
]

for g in generators:
    g()
    print(f"Generated {g.__name__}")

print("All 17 manga panels generated successfully!")
