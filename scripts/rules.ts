/**
 * Règles de la skill « monteur-reels », vérifiées à partir des données de la vidéo
 * et du minutage mot par mot (words.json). Utilisé par `npm run rythme` (avant
 * rendu) et `npm run check` (après rendu).
 */
import {buildGroups, MAX_WORDS} from '../src/engine/Subtitles';
import {FPS} from '../src/engine/theme';
import {findCue, resolveTimeline, toFrame} from '../src/engine/timeline';
import type {Block, VideoData, WordsFile} from '../src/engine/types';

export const MAX_GAP = 1.5; // s sans nouvel élément à l'écran
export const HOOK_MAX = 2.0; // s pour dire l'accroche
export const SENTENCE_SILENCE = 0.2; // s gardées après le dernier mot d'une phrase
export const ENDING = 'Recherche personnalisée gratuite, lien en bio.';

type Element = {t: number; label: string};
export type Report = {errors: string[]; elements: Element[]};

const fmt = (t: number) => `${t.toFixed(2).replace('.', ',')} s`;

/** Repères internes à un bloc qui font apparaître quelque chose de nouveau. */
const innerCues = (b: Block): {at: string; label: string}[] => {
  switch (b.kind) {
    case 'bars':
      return b.bars.map((x) => ({at: x.at, label: `barre « ${x.display} »`}));
    case 'priceTag':
      return b.strikeAt ? [{at: b.strikeAt, label: 'prix barré'}] : [];
    case 'iconGrid':
      return b.highlightAt ? [{at: b.highlightAt, label: 'icônes allumées'}] : [];
    case 'calc':
      return b.operationAt ? [{at: b.operationAt, label: `opération « ${b.operation} »`}] : [];
    case 'energyScale':
      return [
        ...b.highlights.map((h) => ({at: h.at, label: `DPE ${h.letter}`})),
        ...(b.badge ? [{at: b.badge.at, label: `badge « ${b.badge.text} »`}] : []),
      ];
    case 'line':
      return b.valueAt && b.value ? [{at: b.valueAt, label: `montant « ${b.value} »`}] : [];
    case 'priceDrop':
      return [{at: b.deltaAt, label: `écart « ${b.delta} »`}];
    default:
      return [];
  }
};

const blockLabel = (b: Block): string => {
  const o = b as Record<string, unknown>;
  const txt = o.text ?? o.label ?? o.price ?? o.button ?? o.base ?? o.name ?? (o.lines as {text: string}[] | undefined)?.map((l) => l.text).join(' / ');
  return `${b.kind}${txt ? ` « ${String(txt)} »` : ''}`;
};

/** Textes affichés d'un bloc (sans les cues, qui ne s'affichent pas). */
const displayedText = (b: Block): string =>
  JSON.stringify(b, (k, v) => (k === 'at' || k.endsWith('At') || k === 'kind' || k === 'tone' || k === 'size' || k === 'name' || k === 'symbol' || k === 'near' || typeof v === 'number' ? undefined : v));

export const checkRules = (video: VideoData, words: WordsFile, duration = words.duration): Report => {
  const errors: string[] = [];
  const w = words.words;
  const total = Math.round(duration * FPS);
  const scenes = resolveTimeline(video, w, FPS, total);

  // 1. Un nouvel élément au moins toutes les 1,5 s.
  const elements: Element[] = [];
  for (const s of scenes) {
    for (const b of s.beats) {
      elements.push({t: b.frame / FPS, label: `${s.id} › ${blockLabel(b.block)}`});
      for (const c of innerCues(b.block)) {
        const i = findCue(w, c.at, b.wordIndex);
        elements.push({t: Math.max(b.frame, toFrame(w[i].start, FPS)) / FPS, label: `${s.id} › ${c.label}`});
      }
    }
  }
  elements.sort((a, b) => a.t - b.t);
  const marks = [...elements, {t: duration, label: 'FIN DE LA VIDÉO'}];
  let prev: Element = {t: 0, label: 'DÉBUT'};
  for (const m of marks) {
    const gap = m.t - prev.t;
    if (gap > MAX_GAP + 1e-6) {
      errors.push(`TROP LONG : ${fmt(gap)} sans nouvel élément, de ${fmt(prev.t)} (${prev.label}) à ${fmt(m.t)} (${m.label})`);
    }
    prev = m;
  }

  // 2. Chaque apparition calée sur le mot prononcé (WordBoundary).
  for (const s of scenes) {
    for (const b of s.beats) {
      const expected = toFrame(w[b.wordIndex].start, FPS);
      const isVideoStart = b.frame === 0 && expected <= 3;
      if (b.frame !== expected && !isVideoStart) {
        errors.push(`DÉCALÉ : ${s.id} › ${blockLabel(b.block)} apparaît image ${b.frame}, le mot « ${w[b.wordIndex].text} » est dit image ${expected}`);
      }
    }
  }

  // 3. Accroche en moins de 2 s.
  const hookEnd = w.find((x) => /[.?!]$/u.test(x.text));
  if (!hookEnd || hookEnd.end > HOOK_MAX) {
    errors.push(`ACCROCHE TROP LONGUE : la 1re phrase finit à ${hookEnd ? fmt(hookEnd.end) : '?'} (max ${fmt(HOOK_MAX)})`);
  }

  // 4. Silence de fin de phrase ≈ 0,2 s.
  w.forEach((x, i) => {
    if (!/[.?!]$/u.test(x.text)) return;
    const next = w[i + 1];
    const silence = (next ? next.start : duration) - x.end;
    if (silence > SENTENCE_SILENCE + 0.15) {
      errors.push(`SILENCE TROP LONG : ${fmt(silence)} après « ${x.text} » (${fmt(x.end)})`);
    }
  });

  // 5. Sous-titres : 3 mots au plus.
  for (const g of buildGroups(w)) {
    if (g.words.length > MAX_WORDS) errors.push(`SOUS-TITRE TROP LONG : « ${g.words.map((x) => x.text).join(' ')} »`);
  }

  // 6. Aucun chiffre à l'écran sans source.
  for (const s of video.scenes) {
    const digits = s.beats.some((b) => /\d/.test(displayedText(b.block)));
    if (digits && !s.source) errors.push(`CHIFFRE SANS SOURCE : séquence « ${s.id} »`);
  }
  if (!video.sources?.length && video.scenes.some((s) => s.source)) {
    errors.push('SOURCES : renseigne video.sources (liens vérifiés) pour la liste à livrer');
  }

  // 7. Tutoiement et fin imposée.
  const text = video.script.join(' ');
  if (/\b(vous|votre|vos)\b/i.test(text)) errors.push('VOUVOIEMENT : le texte doit tutoyer');
  const last = video.script[video.script.length - 1].trim();
  if (!last.endsWith(ENDING)) errors.push(`FIN : la dernière phrase doit être « ${ENDING} »`);

  return {errors, elements};
};

export const printReport = (r: Report) => {
  console.log(`\nÉléments à l'écran (${r.elements.length}) :`);
  let prev = 0;
  for (const e of r.elements) {
    const gap = e.t - prev;
    console.log(`  ${fmt(e.t).padStart(8)}  +${gap.toFixed(2)}  ${e.label}`);
    prev = e.t;
  }
  if (r.errors.length) {
    console.log('\nProblèmes :');
    for (const e of r.errors) console.log(`  ✘ ${e}`);
  } else {
    console.log('\n✔ Règles respectées (rythme 1,5 s, calage, accroche, silences, sous-titres, sources, fin)');
  }
};
