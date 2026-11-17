/**
 * npm run voice -- <id>
 * Génère public/<id>/voiceover.mp3 et public/<id>/words.json.
 */
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {getVideo} from './video-arg';

const video = getVideo();
const outDir = path.resolve('public', video.id);
const job = {
  script: video.script,
  edgeVoice: video.voice.edgeVoice,
  rate: video.voice.rate,
  elevenVoiceId: video.voice.elevenVoiceId,
  outDir,
};
const jobPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tgi-')), 'job.json');
fs.writeFileSync(jobPath, JSON.stringify(job));
// Python de l'environnement local .venv (Windows : .venv\Scripts\python.exe).
const venvPython =
  process.platform === 'win32' ? path.resolve('.venv', 'Scripts', 'python.exe') : path.resolve('.venv', 'bin', 'python');
if (!fs.existsSync(venvPython)) {
  console.error('Environnement Python absent. Crée-le dans ce dossier :');
  console.error(process.platform === 'win32' ? '  py -m venv .venv && .venv\\Scripts\\pip install edge-tts' : '  python3 -m venv .venv && .venv/bin/pip install edge-tts');
  process.exit(1);
}
const r = spawnSync(venvPython, ['scripts/tts.py', jobPath], {stdio: 'inherit'});
process.exit(r.status ?? 1);
