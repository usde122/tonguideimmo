# Ton Guide Immo — vidéos TikTok/Reels

Remotion (React + TypeScript), 1080×1920, 30 fps, H.264 + AAC. Durée calée sur la voix off.

## Faire une vidéo

1. Copier `src/videos/bonne-affaire.ts` en `src/videos/<id>.ts` : texte exact de la voix, séquences, chiffres, sources.
   Chaque séquence et chaque élément démarre sur un **cue** = extrait exact du texte.
2. L'ajouter dans `src/videos/index.ts`.
3. Générer la voix off (+ timing mot par mot) : `npm run voice -- <id>`
   → `public/<id>/voiceover.mp3` et `public/<id>/words.json`
   (ElevenLabs si `ELEVENLABS_API_KEY` existe, sinon edge-tts).
4. Rendre : `npm run render -- <id>` → `out/<id>.mp4`
   (si `assets/music.mp3` existe, il est mixé très bas sous la voix).
5. Vérifier : `npm run check -- <id>` (ffprobe + 1 image par séquence dans `out/frames/`).

Prévisualiser : `npm run studio`.

## Prérequis

Node ≥ 18, ffmpeg, Python 3 + `pip install edge-tts`. Pour edge-tts dans un environnement cloud, l'hôte
`speech.platform.bing.com` doit être autorisé.
