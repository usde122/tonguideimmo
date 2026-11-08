import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BlockView} from './blocks';
import {BeatProvider} from './context';
import {Subtitles} from './Subtitles';
import {colors, font, layout, safe} from './theme';
import {resolveTimeline, type ResolvedScene} from './timeline';
import type {VideoData, WordsFile} from './types';

export type VideoProps = {
  video: VideoData;
  words: WordsFile | null;
  music: boolean;
};

const SceneView: React.FC<{scene: ResolvedScene; words: WordsFile}> = ({scene, words}) => {
  const frame = useCurrentFrame();
  const absolute = frame + scene.from;
  const duration = scene.to - scene.from;
  const enter = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const exit = interpolate(frame, [duration - 5, duration], [1, 0], {extrapolateLeft: 'clamp'});
  // Groupe visible = celui du dernier beat apparu.
  const started = scene.beats.filter((b) => absolute >= b.frame);
  const group = started.length ? started[started.length - 1].group : 0;
  const beats = scene.beats.filter((b) => b.group === group);
  return (
    <AbsoluteFill style={{opacity: Math.min(enter, exit)}}>
      <div
        style={{
          position: 'absolute',
          left: safe.left,
          width: safe.right - safe.left,
          top: layout.contentTop,
          height: layout.contentBottom - layout.contentTop,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 46,
        }}
      >
        {beats.map((b, i) => (
          // Les beats pas encore apparus sont déjà en place (invisibles) : pas de saut de mise en page.
          <div key={`${group}-${i}`} style={{visibility: absolute >= b.frame ? 'visible' : 'hidden'}}>
            <BeatProvider words={words.words} wordIndex={b.wordIndex} frame={b.frame} sceneFrom={scene.from}>
              <BlockView block={b.block} />
            </BeatProvider>
          </div>
        ))}
      </div>
      {scene.source ? (
        <div
          style={{
            position: 'absolute',
            left: safe.left,
            width: safe.right - safe.left,
            top: layout.sourceTop,
            height: layout.sourceBottom - layout.sourceTop,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 25,
            fontWeight: 600,
            whiteSpace: 'nowrap',
            color: colors.muted,
            textAlign: 'center',
          }}
        >
          Source : {scene.source}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const VideoComposition: React.FC<VideoProps> = ({video, words, music}) => {
  const {fps, durationInFrames} = useVideoConfig();
  const scenes = useMemo(
    () => (words ? resolveTimeline(video, words.words, fps, durationInFrames) : []),
    [video, words, fps, durationInFrames],
  );
  return (
    <AbsoluteFill style={{background: colors.bg, fontFamily: font}}>
      {/* Signature */}
      <div
        style={{
          position: 'absolute',
          top: layout.signatureTop,
          left: safe.left,
          width: safe.right - safe.left,
          textAlign: 'center',
          fontSize: 30,
          fontWeight: 800,
          letterSpacing: 6,
          color: colors.accent,
          opacity: 0.75,
          textTransform: 'uppercase',
        }}
      >
        Ton Guide Immo
      </div>

      {words ? (
        <>
          {scenes.map((s) => (
            <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id} layout="none">
              <SceneView scene={s} words={words} />
            </Sequence>
          ))}
          <Subtitles words={words.words} />
          <Audio src={staticFile(`${video.id}/voiceover.mp3`)} />
          {music ? <Audio src={staticFile('shared/music.mp3')} volume={0.06} loop /> : null}
        </>
      ) : (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontSize: 50, padding: 120, textAlign: 'center'}}>
          Voix off manquante : lance « npm run voice -- {video.id} »
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
