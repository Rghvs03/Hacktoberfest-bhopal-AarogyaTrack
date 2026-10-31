import os
import subprocess
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
WORK_DIR = os.path.join(OUTPUT_DIR, "work")
os.makedirs(WORK_DIR, exist_ok=True)

W, H = 1920, 1080

def get_font(name="segoeuib.ttf", size=32):
    path = os.path.join("C:/Windows/Fonts", name)
    if os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except:
            pass
    return ImageFont.load_default()

font_title_huge = get_font("segoeuib.ttf", 64)
font_title = get_font("segoeuib.ttf", 52)
font_sub = get_font("segoeui.ttf", 30)
font_bold = get_font("segoeuib.ttf", 28)
font_regular = get_font("segoeui.ttf", 24)
font_mono = get_font("consola.ttf", 24)
font_serif = get_font("georgia.ttf", 44)
font_serif_italic = get_font("georgiai.ttf", 36)

# Scene 1: The Problem
def make_scene_1():
    img = Image.new("RGB", (W, H), "#0B132B")
    draw = ImageDraw.Draw(img)
    
    # Top badge
    draw.rounded_rectangle([120, 120, 560, 180], radius=12, fill="#1E293B", outline="#E11D48", width=2)
    draw.text((150, 136), "CRITICAL RURAL HEALTH GAP", font=font_bold, fill="#FB7185")
    
    draw.text((120, 240), "Zero Internet Connectivity.", font=font_title_huge, fill="#FFFFFF")
    draw.text((120, 330), "Lost Paper Prescriptions.", font=font_title_huge, fill="#CBD5E1")
    draw.text((120, 420), "Broken Continuity of Care.", font=font_title_huge, fill="#94A3B8")
    
    # Problem cards
    card_y = 560
    cards = [
        ("No Cloud Access", "Medical camps in remote areas have zero cellular signal. Cloud apps simply fail.", "#EF4444"),
        ("Scattered Histories", "Patients carry crumpled slips from months ago. Doctors cannot see trends.", "#F59E0B"),
        ("Untracked Disease", "Chronic conditions like hypertension progress unseen without longitudinal logs.", "#64748B"),
    ]
    
    for i, (head, desc, col) in enumerate(cards):
        cx = 120 + i * 560
        draw.rounded_rectangle([cx, card_y, cx + 520, card_y + 360], radius=16, fill="#131C35", outline="#253252", width=2)
        draw.rounded_rectangle([cx + 30, card_y + 30, cx + 60, card_y + 60], radius=8, fill=col)
        draw.text((cx + 80, card_y + 32), head, font=font_bold, fill="#FFFFFF")
        
        # Word wrap desc
        words = desc.split()
        lines = []
        cur = ""
        for w in words:
            if len(cur + " " + w) > 28:
                lines.append(cur)
                cur = w
            else:
                cur = (cur + " " + w).strip()
        lines.append(cur)
        
        for li, line in enumerate(lines):
            draw.text((cx + 30, card_y + 110 + li * 40), line, font=font_sub, fill="#94A3B8")
            
    img.save(os.path.join(WORK_DIR, "scene1.png"))

# Scene 2: Solution & Offline PWA
def make_scene_2():
    img = Image.new("RGB", (W, H), "#FBFBFA")
    draw = ImageDraw.Draw(img)
    
    # Brand Bar
    draw.rectangle([0, 0, W, 90], fill="#FFFFFF", outline="#E2E8F0", width=1)
    draw.text((80, 24), "AarogyaTrack", font=font_bold, fill="#0F766E")
    draw.rounded_rectangle([280, 26, 620, 64], radius=20, fill="#ECFDF5", outline="#A7F3D0", width=1)
    draw.text((300, 32), "🟢 Offline Mode (Local Dexie Active)", font=font_regular, fill="#065F46")
    draw.rounded_rectangle([W - 320, 24, W - 80, 66], radius=10, fill="#0F766E")
    draw.text((W - 280, 32), "Dr. Priya Sharma, MD", font=font_regular, fill="#FFFFFF")
    
    draw.text((80, 160), "Engineered for Complete Offline Autonomy.", font=font_title, fill="#0F172A")
    draw.text((80, 235), "Record consultations in seconds. Zero lag. 100% locally persistent in IndexedDB.", font=font_sub, fill="#64748B")
    
    features = [
        ("Offline-First IndexedDB", "Local Dexie.js database stores patients, vitals & visits with client UUIDs. Zero cloud dependency during camp hours.", "#0F766E"),
        ("Idempotent Auto-Sync", "Changes queue in a background outbox. When cellular signal returns, updates reconcile seamlessly to Neon PostgreSQL.", "#0284C7"),
        ("Hallmark Anti-AI-Slop UI", "Calm, high-craft clinical aesthetic with zero layout shifts, accessible typography, and instant responsiveness.", "#475569"),
    ]
    
    for i, (title, desc, col) in enumerate(features):
        x = 80 + i * 590
        draw.rounded_rectangle([x, 340, x + 560, 940], radius=20, fill="#FFFFFF", outline="#E2E8F0", width=2)
        draw.rounded_rectangle([x + 40, 380, x + 100, 440], radius=14, fill="#F0FDFA", outline="#CCFBF1", width=2)
        draw.text((x + 55, 395), "✓", font=font_bold, fill=col)
        draw.text((x + 40, 470), title, font=font_bold, fill="#0F172A")
        
        words = desc.split()
        lines, cur = [], ""
        for w in words:
            if len(cur + " " + w) > 28:
                lines.append(cur)
                cur = w
            else:
                cur = (cur + " " + w).strip()
        lines.append(cur)
        for li, line in enumerate(lines):
            draw.text((x + 40, 540 + li * 42), line, font=font_sub, fill="#475569")
            
    img.save(os.path.join(WORK_DIR, "scene2.png"))

# Scene 3: Smart Rx Writepad
def make_scene_3():
    img = Image.new("RGB", (W, H), "#F4F6F8")
    draw = ImageDraw.Draw(img)
    
    draw.text((80, 70), "Smart Rx Writepad — Natural Dictation & Auto-Extraction", font=font_title, fill="#0F172A")
    draw.text((80, 135), "Physicians speak or type naturally. Live AI extraction structures symptoms into standard clinical sections.", font=font_sub, fill="#64748B")
    
    # Writepad Card
    draw.rounded_rectangle([80, 210, 1020, 980], radius=16, fill="#FFFFFF", outline="#0F766E", width=2)
    draw.rectangle([80, 210, 1020, 280], fill="#F0FDFA")
    draw.text((110, 230), "Rx Doctor's Freeform Writepad", font=font_bold, fill="#0F766E")
    draw.rounded_rectangle([780, 225, 990, 265], radius=20, fill="#0F766E")
    draw.text((805, 232), "🎙️ Mic Active", font=font_regular, fill="#FFFFFF")
    
    rx_notes = [
        "• Patient: Sunita Devi (AAR-2026-002)",
        "• Chief Complaint: Severe headache and fever from last 5 days",
        "• Vitals: BP 148/92 mmHg, Pulse 84 bpm, SpO2 98%",
        "• Assessment: Moderate hypertension with tension headache",
        "• Plan: Start Tab Paracetamol 650mg TDS, Telmisartan 40mg OD",
        "• Advice: Hydration, reduce dietary sodium, review in 5 days",
    ]
    for idx, note in enumerate(rx_notes):
        draw.text((110, 330 + idx * 75), note, font=font_mono, fill="#1E293B")
        
    # Extraction Preview Card
    draw.rounded_rectangle([1060, 210, W - 80, 980], radius=16, fill="#FFFFFF", outline="#E2E8F0", width=2)
    draw.rectangle([1060, 210, W - 80, 280], fill="#F8FAFC")
    draw.text((1090, 230), "⚡ Live Extracted Clinical Passport", font=font_bold, fill="#0284C7")
    
    extractions = [
        ("CHIEF COMPLAINTS", "Severe headache, acute fever (5 days duration)"),
        ("OBJECTIVE VITALS", "BP: 148/92 mmHg | HR: 84 bpm | SpO2: 98%"),
        ("CLINICIAN ASSESSMENT", "Essential Hypertension, Tension-type Cephalea"),
        ("TREATMENT PLAN", "Telmisartan 40mg daily, Paracetamol 650mg TDS"),
        ("FOLLOW-UP SCHEDULE", "Scheduled in 5 Days (Rural Health Camp Visit #2)"),
    ]
    
    for idx, (label, val) in enumerate(extractions):
        ey = 310 + idx * 125
        draw.text((1090, ey), label, font=font_regular, fill="#0284C7")
        draw.text((1090, ey + 38), val, font=font_bold, fill="#0F172A")
        draw.line([1090, ey + 95, W - 110, ey + 95], fill="#F1F5F9", width=1)
        
    img.save(os.path.join(WORK_DIR, "scene3.png"))

# Scene 4: Longitudinal Trajectory & Google Gemini
def make_scene_4():
    img = Image.new("RGB", (W, H), "#0F172A")
    draw = ImageDraw.Draw(img)
    
    draw.rounded_rectangle([80, 60, 480, 110], radius=12, fill="#1E293B", outline="#0F766E", width=1)
    draw.text((100, 72), "GOOGLE GEMINI 1.5 CLINICAL REVIEW", font=font_bold, fill="#2DD4BF")
    
    draw.text((80, 140), "Longitudinal Trajectory & Gap Detection", font=font_title, fill="#FFFFFF")
    draw.text((80, 205), "Gemini synthesizes multi-visit records to spot dangerous trends before they cause irreversible harm.", font=font_sub, fill="#94A3B8")
    
    # Left: Trend Graph Simulation
    draw.rounded_rectangle([80, 280, 840, 980], radius=16, fill="#1E293B", outline="#334155", width=2)
    draw.text((110, 310), "Systolic Blood Pressure Progression", font=font_bold, fill="#FFFFFF")
    draw.text((110, 350), "Patient: Ramesh Kumar (AAR-2026-001) across 3 rural camps", font=font_regular, fill="#94A3B8")
    
    # Graph Axes
    draw.line([150, 440, 150, 840], fill="#475569", width=2)
    draw.line([150, 840, 780, 840], fill="#475569", width=2)
    draw.text((90, 520), "160", font=font_mono, fill="#64748B")
    draw.text((90, 640), "140", font=font_mono, fill="#64748B")
    draw.text((90, 760), "120", font=font_mono, fill="#64748B")
    
    # Stage 2 Threshold line
    draw.line([150, 620, 780, 620], fill="#EF4444", width=2)
    draw.text((580, 580), "Stage 2 Alert (140)", font=font_regular, fill="#F87171")
    
    # Points
    pts = [(240, 720, "130 mmHg", "Visit 1"), (460, 610, "142 mmHg", "Visit 2"), (680, 540, "150 mmHg", "Visit 3")]
    for i in range(len(pts) - 1):
        draw.line([pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1]], fill="#2DD4BF", width=4)
    for px, py, val, vlabel in pts:
        draw.ellipse([px - 10, py - 10, px + 10, py + 10], fill="#0F766E", outline="#2DD4BF", width=3)
        draw.text((px - 50, py - 45), val, font=font_bold, fill="#FFFFFF")
        draw.text((px - 30, 860), vlabel, font=font_regular, fill="#94A3B8")
        
    # Right: Gemini Insight Card
    draw.rounded_rectangle([880, 280, W - 80, 980], radius=16, fill="#1E293B", outline="#0F766E", width=2)
    draw.text((920, 310), "Gemini 1.5 Synthesis Output", font=font_bold, fill="#2DD4BF")
    draw.rounded_rectangle([W - 380, 305, W - 110, 345], radius=10, fill="#065F46")
    draw.text((W - 360, 312), "✓ Clinician Approved", font=font_regular, fill="#A7F3D0")
    
    gemini_items = [
        ("1. CLINICAL TRAJECTORY", "Systolic BP has escalated 20 mmHg over 6 months despite medication. Patient in persistent Stage 2 category."),
        ("2. GAPS DETECTED", "No recorded HbA1c screening or renal panel in past 180 days. Medication compliance unconfirmed."),
        ("3. ACTION RECOMMENDATION", "Recommend intensification of antihypertensive therapy and scheduling village camp review within 30 days."),
        ("4. RESPONSIBLE AI POLICY", "Assistive synthesis only. All findings cite timestamped camp dates and require clinician sign-off."),
    ]
    
    for idx, (head, body) in enumerate(gemini_items):
        gy = 400 + idx * 135
        draw.text((920, gy), head, font=font_bold, fill="#38BDF8")
        words = body.split()
        lines, cur = [], ""
        for w in words:
            if len(cur + " " + w) > 42:
                lines.append(cur)
                cur = w
            else:
                cur = (cur + " " + w).strip()
        lines.append(cur)
        for li, line in enumerate(lines):
            draw.text((920, gy + 38 + li * 34), line, font=font_regular, fill="#E2E8F0")
            
    img.save(os.path.join(WORK_DIR, "scene4.png"))

# Scene 5: Printable Rx Slip
def make_scene_5():
    img = Image.new("RGB", (W, H), "#F1F5F9")
    draw = ImageDraw.Draw(img)
    
    draw.text((80, 60), "100% Offline Printable A5 Prescription Slip", font=font_title, fill="#0F172A")
    draw.text((80, 125), "Dispense physical prescriptions in remote villages. One click, watermarked, fully styled.", font=font_sub, fill="#64748B")
    
    # Centered A5 Paper Slip
    sx, sy, sw, sh = 420, 200, 1080, 820
    draw.rectangle([sx, sy, sx + sw, sy + sh], fill="#FFFFFF", outline="#0D9488", width=3)
    
    # Slip Header
    draw.text((sx + 50, sy + 40), "AarogyaTrack", font=font_bold, fill="#0D9488")
    draw.text((sx + 50, sy + 75), "Rural Health Programme • Village Clinical Slip", font=font_regular, fill="#64748B")
    draw.text((sx + sw - 280, sy + 40), "Date: 31 October 2026\nMRN: AAR-2026-001", font=font_mono, fill="#334155")
    draw.line([sx + 50, sy + 130, sx + sw - 50, sy + 130], fill="#0D9488", width=2)
    
    # Patient Band
    draw.rounded_rectangle([sx + 50, sy + 150, sx + sw - 50, sy + 230], radius=8, fill="#F0FDFA", outline="#99F6E4", width=1)
    draw.text((sx + 70, sy + 165), "Patient: Ramesh Kumar (58y / Male)", font=font_bold, fill="#0F172A")
    draw.text((sx + 70, sy + 195), "Village: Rampur  |  BP: 150/94 mmHg  |  HR: 78 bpm", font=font_regular, fill="#0F766E")
    
    # Rx Symbol
    draw.text((sx + 50, sy + 250), "℞", font=font_serif, fill="#0D9488")
    
    # Sections
    draw.text((sx + 50, sy + 320), "Diagnosis: Hypertension Stage 2 under clinical review", font=font_bold, fill="#0F172A")
    draw.text((sx + 50, sy + 370), "Rx / Treatment Plan:", font=font_bold, fill="#0D9488")
    draw.text((sx + 50, sy + 410), "1. Tab Amlodipine 5mg OD (Morning)\n2. Tab Telmisartan 40mg OD (Evening)\n3. Dietary sodium restriction & daily walking advised", font=font_regular, fill="#1E293B")
    
    draw.text((sx + 50, sy + 530), "📅 Follow-up: In 1 Month at Rampur Village Camp", font=font_bold, fill="#0F766E")
    
    # Signature
    draw.line([sx + sw - 320, sy + 680, sx + sw - 70, sy + 680], fill="#0F172A", width=2)
    draw.text((sx + sw - 300, sy + 695), "Dr. Priya Sharma, MD\nAttending Physician", font=font_regular, fill="#334155")
    
    img.save(os.path.join(WORK_DIR, "scene5.png"))

# Scene 6: Outro
def make_scene_6():
    img = Image.new("RGB", (W, H), "#0B132B")
    draw = ImageDraw.Draw(img)
    
    draw.text((W // 2 - 280, 240), "AarogyaTrack", font=font_title_huge, fill="#2DD4BF")
    draw.text((W // 2 - 380, 350), "Every Visit Matters. Even When the Internet Doesn't.", font=font_title, fill="#FFFFFF")
    draw.text((W // 2 - 420, 440), "Offline-First Clinical PWA • Google Gemini 1.5 • Neon PostgreSQL", font=font_sub, fill="#94A3B8")
    
    # Tech badges
    badges = ["React 19 & Vite", "Dexie.js IndexedDB", "Neon Serverless Postgres", "Google Gemini 1.5 Flash", "Printable Rx Slips"]
    bx_start = 220
    for i, b in enumerate(badges):
        bw = len(b) * 16 + 40
        draw.rounded_rectangle([bx_start, 560, bx_start + bw, 620], radius=12, fill="#1E293B", outline="#2DD4BF", width=1)
        draw.text((bx_start + 20, 576), b, font=font_regular, fill="#E2E8F0")
        bx_start += bw + 20
        
    draw.rounded_rectangle([W // 2 - 350, 720, W // 2 + 350, 800], radius=16, fill="#0F766E")
    draw.text((W // 2 - 320, 742), "github.com/Rghvs03/Hacktoberfest-bhopal-AarogyaTrack", font=font_bold, fill="#FFFFFF")
    
    draw.text((W // 2 - 210, 850), "Built with ❤️ for Hacktoberfest Bhopal 2026", font=font_regular, fill="#64748B")
    
    img.save(os.path.join(WORK_DIR, "scene6.png"))

print("Generating 6 scene frames...")
make_scene_1()
make_scene_2()
make_scene_3()
make_scene_4()
make_scene_5()
make_scene_6()
print("All frames rendered successfully.")
