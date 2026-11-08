import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {colors, layout, safe} from './theme';
import type {Word} from './types';

type Group = {words: Word[]; start: number; end: number};

const MAX_WORDS = 4;
const MAX_CHARS = 18;

/** Texte affiché : sans la ponctuation de fin (sauf ? et !). */
const clean = (t: string) => t.replace(/\s*[,.:;]+$/u, '').replace(/\s+:/u, '');

export const buildGroups = (words: Word[]): Group[] => {
  const groups: Group[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) groups.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
    cur = [];
  };
  words.forEach((w, i) => {
    const chars = cur.map((c) => clean(c.text)).join(' ').length + clean(w.text).length;
    if (cur.length && (cur.length >= MAX_WORDS || chars > MAX_CHARS)) flush();
    cur.push(w);
    const next = words[i + 1];
    const pause = next ? next.start - w.end > 0.25 : true;
    if (/[.,:;?!]$/u.test(w.text) || pause) flush();
  });
  flush();
  // Chaque groupe reste affiché jusqu'au suivant (si la pause est courte).
  groups.forEach((g, i) => {
    const next = groups[i + 1];
    g.end = next && next.start - g.end < 0.7 ? next.start : g.end + 0.35;
  });
  return groups;
};

export const Subtitles: React.FC<{words: Word[]}> = ({words}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const groups = useMemo(() => buildGroups(words), [words]);
  const g = groups.find((x) => t >= x.start && t < x.end);
  if (!g) return null;
  const local = t - g.start;
  const pop = interpolate(local, [0, 0.1], [0.88, 1], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        left: safe.left,
        width: safe.right - safe.left,
        top: layout.subtitleTop,
        height: layout.subtitleBottom - layout.subtitleTop,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '4px 2px',
          transform: `scale(${pop})`,
          fontSize: 72,
          fontWeight: 900,
          lineHeight: 1.12,
          textAlign: 'center',
        }}
      >
        {g.words.map((w, i) => {
          const next = g.words[i + 1];
          const active = t >= w.start && (next ? t < next.start : true);
          return (
            <span
              key={i}
              style={{
                padding: '2px 14px 6px',
                borderRadius: 16,
                background: active ? colors.accent : 'transparent',
                color: active ? '#fff' : colors.ink,
                whiteSpace: 'nowrap',
              }}
            >
              {clean(w.text)}
            </span>
          );
        })}
      </div>
    </div>
  );
};
