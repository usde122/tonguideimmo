/**
 * npm run check -- <id>
 * Vérifie out/<id>.mp4 (ffprobe) et extrait une image au milieu de chaque séquence
 * dans out/frames/.
 */
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {resolveTimeline} from '../src/engine/timeline';
import {FPS, H, W} from '../src/engine/theme';
import type {WordsFile} from '../src/engine/types';
import {getVideo} from './video-arg';

const video = getVideo();
const mp4 = path.join('out', `${video.id}.mp4`);
const words: WordsFile = JSON.parse(fs.readFileSync(path.join('public', video.id, 'words.json'), 'utf8'));

const probe = JSON.parse(
  execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', mp4]).toString(),
);
const v = probe.streams.find((s: any) => s.codec_type === 'video');
const a = probe.streams.find((s: any) => s.codec_type === 'audio');
const [num, den] = v.r_frame_rate.split('/').map(Number);
const duration = Number(probe.format.duration);
const checks: [string, boolean, string][] = [
  ['Résolution 1080×1920', v.width === W && v.height === H, `${v.width}×${v.height}`],
  ['30 fps', num / den === FPS, v.r_frame_rate],
  ['Vidéo H.264', v.codec_name === 'h264', v.codec_name],
  ['Piste audio AAC', !!a && a.codec_name === 'aac', a ? a.codec_name : 'absente'],
  ['Durée = voix ± 0,5 s', Math.abs(duration - words.duration) <= 0.5, `${duration.toFixed(2)} s vs voix ${words.duration.toFixed(2)} s`],
];
let ok = true;
for (const [label, pass, detail] of checks) {
  console.log(`${pass ? '✔' : '✘'} ${label} (${detail})`);
  ok &&= pass;
}

const total = Math.round(duration * FPS);
const scenes = resolveTimeline(video, words.words, FPS, total);
const dir = path.join('out', 'frames');
fs.mkdirSync(dir, {recursive: true});
scenes.forEach((s, i) => {
  const mid = (s.from + s.to) / 2 / FPS;
  const file = path.join(dir, `${video.id}-${i + 1}-${s.id}.png`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', mid.toFixed(3), '-i', mp4, '-frames:v', '1', file]);
  console.log(`Image ${i + 1} : ${file} (t = ${mid.toFixed(2)} s, séquence ${(s.from / FPS).toFixed(2)}–${(s.to / FPS).toFixed(2)} s)`);
});
process.exit(ok ? 0 : 1);
