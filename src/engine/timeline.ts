import type {Beat, Cue, Scene, VideoData, Word} from './types';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFC')
    .replace(/[^\p{L}\p{N}]/gu, '');

/**
 * Index du premier mot de `phrase` dans `words`, à partir de `from`.
 * Le dernier mot du cue peut être un préfixe (ex. « c » pour « c'est »).
 */
export const findCue = (words: Word[], phrase: Cue, from = 0): number => {
  const parts = phrase.split(/\s+/).map(norm).filter(Boolean);
  const toks = words.map((w) => norm(w.text));
  for (let i = Math.max(0, from); i <= toks.length - parts.length; i++) {
    let ok = true;
    for (let k = 0; k < parts.length; k++) {
      const t = toks[i + k];
      const p = parts[k];
      if (k === parts.length - 1 ? !t.startsWith(p) : t !== p) {
        ok = false;
        break;
      }
    }
    if (ok) return i;
  }
  throw new Error(
    `Cue introuvable dans la voix off : « ${phrase} » (après le mot n°${from}). ` +
      'Le cue doit être un extrait exact du texte.',
  );
};

export type ResolvedBeat = Beat & {
  wordIndex: number;
  /** Frame absolue d'apparition. */
  frame: number;
  /** Frame absolue de disparition (prochain `clear` ou fin de séquence). */
  until: number;
  group: number;
};

export type ResolvedScene = Omit<Scene, "beats"> & {
  wordIndex: number;
  from: number;
  to: number;
  beats: ResolvedBeat[];
};

export const toFrame = (seconds: number, fps: number) => Math.round(seconds * fps);

export const resolveTimeline = (
  video: VideoData,
  words: Word[],
  fps: number,
  totalFrames: number,
): ResolvedScene[] => {
  let cursor = 0;
  const scenes = video.scenes.map((scene) => {
    const wordIndex = findCue(words, scene.at, cursor);
    cursor = wordIndex;
    return {scene, wordIndex};
  });

  return scenes.map(({scene, wordIndex}, i) => {
    // La 1re séquence démarre à 0, les autres pile sur leur premier mot.
    const from = i === 0 ? 0 : toFrame(words[wordIndex].start, fps);
    const to = i < scenes.length - 1 ? toFrame(words[scenes[i + 1].wordIndex].start, fps) : totalFrames;

    let group = 0;
    let beatCursor = wordIndex;
    const beats = scene.beats.map((beat, b) => {
      const wi = findCue(words, beat.at, beatCursor);
      beatCursor = wi;
      if (beat.clear && b > 0) group++;
      const frame = b === 0 ? from : Math.max(from, toFrame(words[wi].start, fps));
      return {...beat, wordIndex: wi, frame, until: to, group};
    });
    // Un beat disparaît quand le groupe suivant commence.
    for (const beat of beats) {
      const next = beats.find((o) => o.group === beat.group + 1);
      if (next) beat.until = next.frame;
    }
    return {...scene, wordIndex, from, to, beats};
  });
};
