import React, {createContext, useContext} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {findCue, toFrame} from './timeline';
import type {Cue, Word} from './types';

/** `frame` = frame ABSOLUE d'apparition du beat ; `sceneFrom` = début de la séquence. */
type BeatCtx = {words: Word[]; wordIndex: number; frame: number; sceneFrom: number};

const Ctx = createContext<BeatCtx | null>(null);

export const BeatProvider: React.FC<BeatCtx & {children: React.ReactNode}> = ({children, ...value}) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
);

const useBeat = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('Bloc rendu hors d’un beat');
  return ctx;
};

/** Frame locale au beat (négative avant son apparition). */
export const useBeatFrame = () => {
  const {frame, sceneFrom} = useBeat();
  return useCurrentFrame() + sceneFrom - frame;
};

/** Frame locale (relative au beat) où la voix prononce `phrase`. */
export const useCue = (phrase: Cue | undefined, fallback = 0): number => {
  const {words, wordIndex, frame} = useBeat();
  const {fps} = useVideoConfig();
  if (!phrase) return fallback;
  const i = findCue(words, phrase, wordIndex);
  return toFrame(words[i].start, fps) - frame;
};
