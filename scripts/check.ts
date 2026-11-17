/**
 * npm run check -- <id>
 * Contrôle final de out/<id>.mp4 avant livraison :
 *  - format (ffprobe) : 1080×1920, 30 fps, H.264 + AAC, durée = voix ;
 *  - son : -14 LUFS intégrés (mesure EBU R128) ;
 *  - règles de montage (rythme 1,5 s « TROP LONG », calage, accroche, silences…) ;
 *  - planche d'une image par seconde : out/<id>-planche.jpg (à relire avant de livrer) ;
 *  - liste des chiffres et de leurs sources : out/<id>-sources.md.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {FPS, H, W} from '../src/engine/theme';
import type {WordsFile} from '../src/engine/types';
import {checkRules, printReport} from './rules';
import {getVideo} from './video-arg';

const TARGET_LUFS = -14;
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

// Loudness intégrée (EBU R128).
const ebu = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', mp4, '-map', '0:a', '-af', 'ebur128=peak=true', '-f', 'null', '-'], {
  encoding: 'utf8',
}).stderr;
const summary = ebu.slice(ebu.lastIndexOf('Summary:'));
const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]);
const peak = /Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1];

const checks: [string, boolean, string][] = [
  ['Résolution 1080×1920', v.width === W && v.height === H, `${v.width}×${v.height}`],
  ['30 fps', num / den === FPS, v.r_frame_rate],
  ['Vidéo H.264', v.codec_name === 'h264', v.codec_name],
  ['Piste audio AAC', !!a && a.codec_name === 'aac', a ? a.codec_name : 'absente'],
  ['Durée = voix ± 0,5 s', Math.abs(duration - words.duration) <= 0.5, `${duration.toFixed(2)} s vs voix ${words.duration.toFixed(2)} s`],
  [`Son à ${TARGET_LUFS} LUFS (± 1)`, Math.abs(lufs - TARGET_LUFS) <= 1, `${lufs} LUFS, crête ${peak ?? '?'} dBFS`],
];
let ok = true;
for (const [label, pass, detail] of checks) {
  console.log(`${pass ? '✔' : '✘'} ${label} (${detail})`);
  ok &&= pass;
}

const report = checkRules(video, words, duration);
printReport(report);
ok &&= report.errors.length === 0;

// Planche : une image par seconde, exactement aux images 15, 45, 75… (t = 0,5 s, 1,5 s, 2,5 s…),
// 6 par ligne, lecture gauche → droite.
const n = Math.floor(duration);
const cols = 6;
const rows = Math.ceil(n / cols);
const sheet = path.join('out', `${video.id}-planche.jpg`);
execFileSync('ffmpeg', [
  '-v', 'error', '-y', '-i', mp4,
  '-vf', `select=not(mod(n+${FPS / 2}\\,${FPS})),scale=360:-1,tile=${cols}x${rows}:padding=8:margin=8:color=0x888888`,
  '-frames:v', '1', '-q:v', '3', sheet,
]);
console.log(`\nPlanche : ${sheet} (${n} images, ${cols} par ligne ; case k = seconde k + 0,5)`);

// Liste des chiffres et sources.
if (video.sources?.length) {
  const md = [
    `# Sources — ${video.title}`,
    '',
    ...video.sources.flatMap((s, i) => [
      `${i + 1}. **${s.claim}**`,
      `   - Source : [${s.source}](${s.url}) — ${s.checked}`,
      `   - Extrait : « ${s.quote} »`,
    ]),
    '',
  ].join('\n');
  const file = path.join('out', `${video.id}-sources.md`);
  fs.writeFileSync(file, md);
  console.log(`Sources : ${file}`);
}
process.exit(ok ? 0 : 1);
