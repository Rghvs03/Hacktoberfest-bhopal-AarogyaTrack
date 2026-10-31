import os
import subprocess

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__))
WORK_DIR = os.path.join(OUTPUT_DIR, "work")
MUSIC_SRC = "d:/Hacktoberfest/.agents/skills/brag/assets/music/happy-beats-business-moves-vol-11-by-ende-dot-app.mp3"
MP4_OUT = os.path.join(OUTPUT_DIR, "brag.mp4")
POSTER_OUT = os.path.join(OUTPUT_DIR, "brag.jpg")

# 1. Create individual video clips with durations
scenes = [
    ("scene1.png", 3.5),
    ("scene2.png", 4.0),
    ("scene3.png", 4.0),
    ("scene4.png", 4.5),
    ("scene5.png", 3.5),
    ("scene6.png", 3.5),
]

clip_files = []
for i, (s_img, dur) in enumerate(scenes):
    img_path = os.path.join(WORK_DIR, s_img)
    clip_path = os.path.join(WORK_DIR, f"clip{i}.mp4")
    clip_files.append(clip_path)
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1",
        "-i", img_path,
        "-t", str(dur),
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        clip_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 2. Concat video clips
concat_txt = os.path.join(WORK_DIR, "concat.txt")
with open(concat_txt, "w") as f:
    for c in clip_files:
        f.write(f"file '{c.replace(os.sep, '/')}'\n")

raw_video = os.path.join(WORK_DIR, "raw_video.mp4")
cmd_concat = [
    "ffmpeg", "-y",
    "-f", "concat",
    "-safe", "0",
    "-i", concat_txt,
    "-c", "copy",
    raw_video
]
subprocess.run(cmd_concat, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 3. Mux with trimmed music & audio fade out
total_dur = sum(d for _, d in scenes)
cmd_mux = [
    "ffmpeg", "-y",
    "-i", raw_video,
    "-i", MUSIC_SRC,
    "-t", str(total_dur),
    "-filter_complex", f"[1:a]afade=t=out:st={total_dur - 1.5}:d=1.5[a]",
    "-map", "0:v",
    "-map", "[a]",
    "-c:v", "copy",
    "-c:a", "aac",
    "-b:a", "192k",
    MP4_OUT
]
subprocess.run(cmd_mux, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

# 4. Extract poster frame at 5.0 seconds (settled Scene 2)
cmd_poster = [
    "ffmpeg", "-y",
    "-ss", "5.0",
    "-i", MP4_OUT,
    "-frames:v", "1",
    "-q:v", "2",
    POSTER_OUT
]
subprocess.run(cmd_poster, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print("Video successfully rendered to:", MP4_OUT)
print("Poster image saved to:", POSTER_OUT)

