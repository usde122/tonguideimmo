# Ton Guide Immo — reels TikTok / Instagram / Snapchat / Facebook

Remotion (React + TypeScript), 1080×1920, 30 i/s, H.264 + AAC. Voix off edge-tts `fr-FR-DeniseNeural` (+14 %),
minutage mot par mot (WordBoundary). Règles de montage : `.claude/skills/monteur-reels/SKILL.md`.

## Faire un reel

1. Copier `src/videos/frais-caches.ts` en `src/videos/<id>.ts` (texte exact, séquences, sources) et l'ajouter
   dans `src/videos/index.ts`.
2. `npm run voice -- <id>` → `public/<id>/voiceover.mp3` + `words.json`
3. `npm run rythme -- <id>` → règles avant rendu (« TROP LONG » si > 1,5 s sans nouvel élément)
4. `npm run render -- <id>` → `out/<id>.mp4`, son normalisé à -14 LUFS
5. `npm run check -- <id>` → contrôle format/son/règles, planche `out/<id>-planche.jpg`, `out/<id>-sources.md`

Prévisualiser : `npm run studio`.

## Installation (Windows)

Outils globaux (à installer une fois, si absents) :

```
winget install OpenJS.NodeJS.LTS
winget install Python.Python.3.12
winget install Gyan.FFmpeg
```

Puis, dans ce dossier uniquement :

```
npm ci
py -m venv .venv
.venv\Scripts\pip install edge-tts
```
