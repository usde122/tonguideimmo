/**
 * npm run render -- <id>
 * Rend out/<id>.mp4. Si assets/music.mp3 existe, il est mixé très bas sous la voix.
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {getVideo} from './video-arg';

const video = getVideo();
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
const r = spawnSync(
  'npx',
  ['remotion', 'render', video.id, out, `--props=${JSON.stringify({music})}`, '--concurrency=50%'],
  {stdio: 'inherit'},
);
if (r.status === 0) console.log(`\nVidéo : ${out}`);
process.exit(r.status ?? 1);
