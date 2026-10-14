#!/usr/bin/env python3
"""扫描 files/：把 flac/wav/aac/ogg 转成 mp3，然后生成 songs.json。"""
import json
import os
import subprocess

from mutagen import File as MutaFile

ROOT = os.path.dirname(os.path.abspath(__file__))
FILES = os.path.join(ROOT, "files")
CONVERT = {".flac", ".wav", ".aac", ".ogg"}
KEEP = {".mp3", ".m4a"}


def convert():
    for name in sorted(os.listdir(FILES)):
        base, ext = os.path.splitext(name)
        if ext.lower() not in CONVERT:
            continue
        src = os.path.join(FILES, name)
        dst = os.path.join(FILES, base + ".mp3")
        if os.path.exists(dst):
            continue
        print("convert:", name, "->", base + ".mp3")
        subprocess.run(
            ["ffmpeg", "-y", "-i", src, "-codec:a", "libmp3lame", "-q:a", "0", dst],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def read_tags(path):
    base = os.path.splitext(os.path.basename(path))[0]
    title, artist, album, duration = base, "Unknown", "Unknown", 0
    try:
        m = MutaFile(path, easy=True)
        if m is not None:
            if m.tags:
                if "title" in m.tags:
                    title = m.tags["title"][0]
                if "artist" in m.tags:
                    artist = m.tags["artist"][0]
                if "album" in m.tags:
                    album = m.tags["album"][0]
            if m.info and getattr(m.info, "length", None):
                duration = round(m.info.length)
    except Exception:
        pass
    return title, artist, album, duration


def build():
    songs = []
    for name in sorted(os.listdir(FILES)):
        ext = os.path.splitext(name)[1].lower()
        if ext not in KEEP:
            continue
        title, artist, album, duration = read_tags(os.path.join(FILES, name))
        songs.append(
            {
                "title": title,
                "artist": artist,
                "album": album,
                "src": "files/" + name,
                "duration": duration,
            }
        )
    with open(os.path.join(ROOT, "songs.json"), "w", encoding="utf-8") as f:
        json.dump(songs, f, ensure_ascii=False, indent=2)
    print(f"songs.json: {len(songs)} songs")


if __name__ == "__main__":
    convert()
    build()
