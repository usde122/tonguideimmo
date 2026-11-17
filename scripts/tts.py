"""Génère voiceover.mp3 + words.json à partir d'un job JSON.

Usage : python3 scripts/tts.py job.json

Le texte est découpé en segments (phrases, « : », et virgules qui suivent un
chiffre) générés séparément puis recollés. En fin de phrase, le silence est
coupé 0,2 s après le dernier mot ; après « : » ou un chiffre, une courte pause. Le timing de chaque mot vient du
fournisseur (WordBoundary edge-tts ou alignement ElevenLabs).

Fournisseur : ElevenLabs si ELEVENLABS_API_KEY existe, sinon edge-tts.
"""

import asyncio
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
import urllib.request
import wave

SAMPLE_RATE = 44100
# Règle de la skill : en fin de phrase (. ? ! et fin de paragraphe), on garde
# exactement 0,2 s après la fin du dernier mot (WordBoundary), puis on enchaîne.
SENTENCE_TAIL = 0.20
# Pauses internes à une phrase (après « : » ou après un chiffre suivi d'une virgule).
INNER_TAIL = 0.07
GAP_COLON = 0.15
GAP_NUMBER = 0.12
LOUDNESS_LUFS = -14  # voix normalisée à -14 LUFS (le rendu final est re-normalisé)

# Une virgule précédée (à 3 mots près) de l'un de ces mots = fin d'un chiffre.
NUMBER_WORDS = {"cent", "cents", "mille", "euros", "jours", "mois", "vingtsix"}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFC", s.lower())
    return "".join(ch for ch in s if ch.isalnum())


def segment(paragraphs):
    """Retourne [(texte, garde_apres_dernier_mot, silence_ajoute)]."""
    segs = []
    for para in paragraphs:
        sentences = re.split(r"(?<=[.?!:])\s+", para.strip())
        for sent in sentences:
            # Coupe aux virgules précédées d'un mot-chiffre (« neuf pour cent, »).
            parts = re.split(r"(?<=,)\s+", sent)
            buf = ""
            for part in parts:
                buf = (buf + " " + part).strip()
                last_words = {norm(w) for w in buf.rstrip(",").split()[-3:]}
                if part.endswith(",") and last_words & NUMBER_WORDS:
                    segs.append((buf, INNER_TAIL, GAP_NUMBER))
                    buf = ""
            if buf:
                if buf.endswith(":"):
                    segs.append((buf, INNER_TAIL, GAP_COLON))
                else:
                    segs.append((buf, SENTENCE_TAIL, 0.0))
    return segs


# ---------------------------------------------------------------- fournisseurs

async def edge_segment(text, voice, rate):
    import edge_tts

    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    comm = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary", proxy=proxy)
    audio = bytearray()
    words = []
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            audio += chunk["data"]
        elif chunk["type"] == "WordBoundary":
            start = chunk["offset"] / 1e7
            words.append({"text": chunk["text"], "start": start, "end": start + chunk["duration"] / 1e7})
    if not audio:
        raise RuntimeError(f"edge-tts n'a renvoyé aucun audio pour : {text!r}")
    return bytes(audio), words


def eleven_pick_voice(key):
    req = urllib.request.Request("https://api.elevenlabs.io/v1/voices", headers={"xi-api-key": key})
    voices = json.load(urllib.request.urlopen(req))["voices"]
    for v in voices:
        labels = {k: str(val).lower() for k, val in (v.get("labels") or {}).items()}
        if labels.get("gender") == "male" and (
            "fr" in labels.get("language", "") or "french" in labels.get("accent", "")
        ):
            return v["voice_id"]
    raise RuntimeError("Aucune voix masculine française trouvée : renseigne voice.elevenVoiceId.")


def eleven_segment(text, voice_id, key):
    body = json.dumps({
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True},
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128",
        data=body,
        headers={"xi-api-key": key, "Content-Type": "application/json"},
    )
    res = json.load(urllib.request.urlopen(req))
    al = res["alignment"]
    words, cur = [], None
    for ch, st, en in zip(al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]):
        if ch.isspace():
            if cur:
                words.append(cur)
            cur = None
            continue
        if cur is None:
            cur = {"text": ch, "start": st, "end": en}
        else:
            cur["text"] += ch
            cur["end"] = en
    if cur:
        words.append(cur)
    return base64.b64decode(res["audio_base64"]), words


# ---------------------------------------------------------------- alignement

def tokens_of(text):
    """Mots tels qu'affichés en sous-titres (ponctuation isolée recollée)."""
    toks = []
    for t in text.split():
        if not norm(t) and toks:
            toks[-1] += " " + t  # « : » français
        else:
            toks.append(t)
    return toks


def align(text, provider_words):
    """Associe chaque mot du texte original à un temps, via les lettres."""
    stream = []  # (lettre, index du mot fournisseur)
    for i, w in enumerate(provider_words):
        for ch in norm(w["text"]):
            stream.append((ch, i))
    out, pos = [], 0
    for tok in tokens_of(text):
        letters = norm(tok)
        first = last = None
        for ch in letters:
            # avance jusqu'à la lettre correspondante (tolère de petits écarts)
            j = pos
            while j < len(stream) and j < pos + 6 and stream[j][0] != ch:
                j += 1
            if j < len(stream) and stream[j][0] == ch:
                pos = j + 1
                idx = stream[j][1]
                first = idx if first is None else first
                last = idx
        if first is None:
            out.append({"text": tok, "start": None, "end": None})
        else:
            out.append({
                "text": tok,
                "start": provider_words[first]["start"],
                "end": provider_words[last]["end"],
            })
    # Comble d'éventuels trous par interpolation.
    for i, w in enumerate(out):
        if w["start"] is None:
            prev = out[i - 1]["end"] if i else 0.0
            nxt = next((o["start"] for o in out[i + 1:] if o["start"] is not None), prev + 0.3)
            w["start"], w["end"] = prev, nxt
            print(f"  ! mot non aligné, interpolé : {w['text']}", file=sys.stderr)
    return out


# ---------------------------------------------------------------- audio

def decode_pcm(mp3_bytes, tmp):
    src = os.path.join(tmp, "seg.mp3")
    dst = os.path.join(tmp, "seg.wav")
    with open(src, "wb") as f:
        f.write(mp3_bytes)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-ac", "1", "-ar", str(SAMPLE_RATE), dst], check=True)
    with wave.open(dst) as w:
        return w.readframes(w.getnframes())


def main():
    job = json.load(open(sys.argv[1]))
    out_dir = job["outDir"]
    os.makedirs(out_dir, exist_ok=True)
    key = os.environ.get("ELEVENLABS_API_KEY")
    if key:
        voice_id = job.get("elevenVoiceId") or eleven_pick_voice(key)
        provider = f"elevenlabs:{voice_id}"
    else:
        provider = f"edge-tts:{job['edgeVoice']}:{job['rate']}"
    print(f"Voix : {provider}")

    segs = segment(job["script"])
    pcm = bytearray()
    all_words = []
    bps = 2  # 16 bits mono
    with tempfile.TemporaryDirectory() as tmp:
        for n, (text, keep, gap) in enumerate(segs):
            print(f"  [{n + 1}/{len(segs)}] {text}")
            if key:
                audio, pw = eleven_segment(text, voice_id, key)
            else:
                for attempt in range(4):
                    try:
                        audio, pw = asyncio.run(edge_segment(text, job["edgeVoice"], job["rate"]))
                        break
                    except Exception as e:  # réseau capricieux : on réessaie
                        if attempt == 3:
                            raise
                        print(f"    réessai ({e})", file=sys.stderr)
            raw = decode_pcm(audio, tmp)
            seg_words = align(text, pw)
            # Coupe le silence en tête (accroche immédiate) et en queue (0,2 s en fin de phrase).
            head = max(0.0, seg_words[0]["start"] - 0.03)
            tail = min(len(raw) / bps / SAMPLE_RATE, seg_words[-1]["end"] + keep)
            a, b = int(head * SAMPLE_RATE) * bps, int(tail * SAMPLE_RATE) * bps
            offset = len(pcm) / bps / SAMPLE_RATE - head
            pcm += raw[a:b]
            for w in seg_words:
                all_words.append({"text": w["text"], "start": round(w["start"] + offset, 3), "end": round(w["end"] + offset, 3)})
            pcm += b"\x00\x00" * int(gap * SAMPLE_RATE)

        wav_path = os.path.join(tmp, "voice.wav")
        with wave.open(wav_path, "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(SAMPLE_RATE)
            w.writeframes(bytes(pcm))
        mp3_path = os.path.join(out_dir, "voiceover.mp3")
        subprocess.run([
            "ffmpeg", "-v", "error", "-y", "-i", wav_path,
            "-af", f"loudnorm=I={LOUDNESS_LUFS}:TP=-1.5:LRA=9", "-ar", str(SAMPLE_RATE),
            "-c:a", "libmp3lame", "-b:a", "192k", mp3_path,
        ], check=True)

    duration = float(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp3_path,
    ]).decode().strip())
    with open(os.path.join(out_dir, "words.json"), "w") as f:
        json.dump({"duration": round(duration, 3), "voice": provider, "words": all_words}, f, ensure_ascii=False, indent=1)
    print(f"OK : {mp3_path} ({duration:.2f} s, {len(all_words)} mots)")


if __name__ == "__main__":
    main()
