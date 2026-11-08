import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import React from 'react';
import {cancelRender, Composition, continueRender, delayRender, staticFile} from 'remotion';
import {VideoComposition, type VideoProps} from './engine/VideoComposition';
import {FPS, H, W} from './engine/theme';
import type {WordsFile} from './engine/types';
import {videos} from './videos';

// Attend que la police soit chargée avant de rendre la moindre image.
const fontHandle = delayRender('Chargement de Montserrat');
Promise.all(['600', '800', '900'].map((w) => document.fonts.load(`${w} 40px Montserrat`)))
  .then(() => continueRender(fontHandle))
  .catch((e) => cancelRender(e));

export const Root: React.FC = () => (
  <>
    {videos.map((video) => (
      <Composition<any, VideoProps>
        key={video.id}
        id={video.id}
        component={VideoComposition}
        width={W}
        height={H}
        fps={FPS}
        durationInFrames={FPS * 60}
        defaultProps={{video, words: null, music: false}}
        calculateMetadata={async ({props}) => {
          const res = await fetch(staticFile(`${props.video.id}/words.json`));
          if (!res.ok) return {props};
          const words = (await res.json()) as WordsFile;
          // Durée calée sur la voix off.
          return {durationInFrames: Math.ceil(words.duration * FPS), props: {...props, words}};
        }}
      />
    ))}
  </>
);
