import os
import sys
import re
import json
import subprocess
from datetime import datetime

# Ensure utf-8 stdout in Windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

VIDEOS_DIR = "videos"
THUMBNAILS_DIR = "thumbnails"
LARGE_DIR = "large_videos_ignored"

os.makedirs(VIDEOS_DIR, exist_ok=True)
os.makedirs(THUMBNAILS_DIR, exist_ok=True)
os.makedirs(LARGE_DIR, exist_ok=True)

THRESHOLD_BYTES = 100 * 1000 * 1000  # 100MB safety threshold

def to_gu_num(num_str):
    mapping = {'0':'૦', '1':'૧', '2':'૨', '3':'૩', '4':'૪', '5':'૫', '6':'૬', '7':'૭', '8':'૮', '9':'૯'}
    return ''.join(mapping.get(ch, ch) for ch in str(num_str))

def format_duration(seconds):
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins:02d}:{secs:02d}"

gu_months = {
    1: "જાન્યુઆરી", 2: "ફેબ્રુઆરી", 3: "માર્ચ", 4: "એપ્રિલ",
    5: "મે", 6: "જૂન", 7: "જુલાઈ", 8: "ઓગસ્ટ",
    9: "સપ્ટેમ્બર", 10: "ઓક્ટોબર", 11: "નવેમ્બર", 12: "ડિસેમ્બર"
}
en_months = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr",
    5: "May", 6: "Jun", 7: "Jul", 8: "Aug",
    9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
}

# 1. Check all mp4 files in videos/
all_mp4s = [f for f in os.listdir(VIDEOS_DIR) if f.endswith('.mp4')]
active_videos = []

for f in all_mp4s:
    fpath = os.path.join(VIDEOS_DIR, f)
    size = os.path.getsize(fpath)
    if size >= THRESHOLD_BYTES:
        dest = os.path.join(LARGE_DIR, f)
        print(f"[Warning] {f} is >= 100MB ({size/(1024*1024):.1f} MB). Moving to '{LARGE_DIR}/'.")
        os.rename(fpath, dest)
    else:
        active_videos.append(f)

active_videos.sort()
print(f"[OK] Total Active Videos in 'videos/': {len(active_videos)}")

# 2. Clean orphaned thumbnails
active_set = set(active_videos)
removed_thumbs = 0
for t in os.listdir(THUMBNAILS_DIR):
    if t.endswith('.webp'):
        base = os.path.splitext(t)[0]
        if (base + ".mp4") not in active_set:
            os.remove(os.path.join(THUMBNAILS_DIR, t))
            removed_thumbs += 1

if removed_thumbs > 0:
    print(f"[Clean] Removed {removed_thumbs} orphaned thumbnails.")

# 3. Process video metadata and generate missing thumbnails
data = []
for idx, fname in enumerate(active_videos, 1):
    fpath = os.path.join(VIDEOS_DIR, fname)
    size_bytes = os.path.getsize(fpath)
    size_mb = round(size_bytes / (1024 * 1024), 1)

    # Date parsing: video_YYYYMMDD_HHMMSS.mp4 or file timestamp
    m = re.match(r"video_(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})", fname)
    if m:
        year, month, day, hour, minute, second = map(int, m.groups())
        dt = datetime(year, month, day, hour, minute, second)
        date_iso = f"{year:04d}-{month:02d}-{day:02d}"
        time_iso = f"{hour:02d}:{minute:02d}:{second:02d}"
    else:
        dt = datetime.fromtimestamp(os.path.getmtime(fpath))
        year, month, day = dt.year, dt.month, dt.day
        hour, minute, second = dt.hour, dt.minute, dt.second
        date_iso = dt.strftime("%Y-%m-%d")
        time_iso = dt.strftime("%H:%M:%S")

    # Probe duration and dimensions
    duration_sec = 0.0
    width = 1080
    height = 1920
    try:
        probe_cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_streams', '-show_format', fpath]
        out = subprocess.check_output(probe_cmd)
        probe_info = json.loads(out)
        duration_sec = float(probe_info.get('format', {}).get('duration', 0.0))
        for stream in probe_info.get('streams', []):
            if stream.get('codec_type') == 'video':
                width = int(stream.get('width', 1080))
                height = int(stream.get('height', 1920))
                tags = stream.get('tags', {})
                rot = tags.get('rotate') or tags.get('rotation')
                if rot in ['90', '270', '-90']:
                    width, height = height, width
                break
    except Exception as e:
        print(f"Error probing {fname}: {e}")

    aspect = "vertical" if height > width else "horizontal"
    dur_str = format_duration(duration_sec)

    # Thumbnail generation if missing
    thumb_name = os.path.splitext(fname)[0] + ".webp"
    thumb_path = os.path.join(THUMBNAILS_DIR, thumb_name)
    if not os.path.exists(thumb_path) or os.path.getsize(thumb_path) == 0:
        ss = 2.0 if duration_sec >= 3.0 else (duration_sec * 0.5 if duration_sec > 0.5 else 0.2)
        scale_param = "scale=540:-1" if aspect == "vertical" else "scale=640:-1"
        thumb_cmd = ['ffmpeg', '-ss', str(ss), '-i', fpath, '-vframes', '1', '-vf', scale_param, '-q:v', '78', thumb_path, '-y']
        try:
            subprocess.run(thumb_cmd, capture_output=True, check=True)
            print(f"[New Thumbnail] Generated {thumb_name}")
        except Exception as e:
            print(f"Thumb error on {fname}: {e}")

    month_name_gu = gu_months.get(month, "")
    month_name_en = en_months.get(month, "")
    am_pm_en = "AM" if hour < 12 else "PM"
    h12 = hour if 1 <= hour <= 12 else (hour - 12 if hour > 12 else 12)
    am_pm_gu = "સવારે" if hour < 12 else ("બપોરે" if hour < 16 else "સાંજે")
    formatted_date_en = f"{day} {month_name_en} {year}, {h12:02d}:{minute:02d} {am_pm_en}"
    formatted_date_gu = f"{to_gu_num(day)} {month_name_gu} {to_gu_num(year)}, {am_pm_gu} {to_gu_num(f'{h12:02d}')}:{to_gu_num(f'{minute:02d}')}"

    title_gu = f"મરચીના ખેતરમાં વિડિયો દર્શન"
    title_en = f"Chilli Farm Video"

    data.append({
        "id": f"chilli_{idx:03d}",
        "index": idx,
        "filename": fname,
        "videoSrc": f"videos/{fname}",
        "thumbSrc": f"thumbnails/{thumb_name}",
        "date": date_iso,
        "time": time_iso,
        "year": year,
        "month": month,
        "monthKey": f"{year:04d}-{month:02d}",
        "monthNameGu": f"{month_name_gu} {to_gu_num(year)}",
        "monthNameEn": f"{month_name_en} {year}",
        "dateFormattedGu": formatted_date_gu,
        "dateFormattedEn": formatted_date_en,
        "sizeBytes": size_bytes,
        "sizeMb": f"{size_mb} MB",
        "durationSec": round(duration_sec, 1),
        "durationFormatted": dur_str,
        "width": width,
        "height": height,
        "aspect": aspect,
        "titleGu": f"{title_gu} #{to_gu_num(idx)}",
        "titleEn": f"{title_en} #{idx}"
    })

# Sort newest first
data.sort(key=lambda x: (x["date"], x["time"]), reverse=True)

# Re-number titles
for idx, item in enumerate(data, 1):
    item["index"] = idx
    item["id"] = f"chilli_{idx:03d}"
    item["titleGu"] = f"મરચીના ખેતરમાં વિડિયો દર્શન #{to_gu_num(idx)}"
    item["titleEn"] = f"Chilli Farm Video #{idx}"

# Write videos_data.js
js_content = f"// Chili Agro Farm - Automatically Updated ({len(data)} videos)\nwindow.VIDEOS_DATA = {json.dumps(data, indent=2, ensure_ascii=False)};\n"
with open("videos_data.js", "w", encoding="utf-8") as f:
    f.write(js_content)

# Write videos_data.json
with open("videos_data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("\n" + "="*50)
print(f"SUCCESS! Total {len(data)} videos updated in website data.")
print("Now simply refresh index.html in your browser.")
print("="*50)
