/**
 * npm run render -- <id>
 * Rend out/<id>.mp4 puis normalise le son à -14 LUFS (ffmpeg loudnorm, 2 passes,
 * image copiée sans réencodage). Si assets/music.mp3 existe, il est mixé très bas.
 */
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {getVideo} from './video-arg';

export const TARGET_LUFS = -14;

const video = getVideo();
const extra = process.argv.slice(3);
const words = path.resolve('public', video.id, 'words.json');
if (!fs.existsSync(words)) {
  console.error(`Voix off absente. Lance d'abord : npm run voice -- ${video.id}`);
  process.exit(1);
}

const musicSrc = path.resolve('assets/music.mp3');
const musicDst = path.resolve('public/shared/music.mp3');
const music = fs.existsSync(musicSrc);
fs.mkdirSync(path.dirname(musicDst), {recursive: true});
if (music) fs.copyFileSync(musicSrc, musicDst);
else fs.rmSync(musicDst, {force: true});
console.log(music ? 'Musique : assets/music.mp3 (volume très bas)' : 'Musique : aucune');

fs.mkdirSync('out', {recursive: true});
const out = path.join('out', `${video.id}.mp4`);
const raw = path.join('out', `.${video.id}.raw.mp4`);
const props = path.resolve('out', `.${video.id}.props.json`);
fs.writeFileSync(props, JSON.stringify({music}));

// Remotion lancé directement avec Node (pas de npx : fonctionne pareil sous Windows).
const cli = path.resolve('node_modules', '@remotion', 'cli', 'remotion-cli.js');
const r = spawnSync(process.execPath, [cli, 'render', video.id, raw, `--props=${props}`, '--concurrency=50%', ...extra], {
  stdio: 'inherit',
});
fs.rmSync(props, {force: true});
if (r.status !== 0) process.exit(r.status ?? 1);

// Normalisation -14 LUFS, passe 1 : mesure.
console.log(`\nSon : normalisation à ${TARGET_LUFS} LUFS…`);
const filter = `loudnorm=I=${TARGET_LUFS}:TP=-1.5:LRA=11`;
const p1 = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', raw, '-af', `${filter}:print_format=json`, '-f', 'null', '-'], {
  encoding: 'utf8',
});
const m = JSON.parse(p1.stderr.slice(p1.stderr.lastIndexOf('{'), p1.stderr.lastIndexOf('}') + 1));
// Passe 2 : application linéaire avec les mesures.
execFileSync('ffmpeg', [
  '-v', 'error', '-y', '-i', raw,
  '-af',
  `${filter}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  '-ar', '48000', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out,
]);
fs.rmSync(raw, {force: true});
console.log(`Son : ${m.input_i} LUFS → ${TARGET_LUFS} LUFS`);
console.log(`\nVidéo : ${out}`);
