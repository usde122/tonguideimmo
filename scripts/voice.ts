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
const r = spawnSync('python3', ['scripts/tts.py', jobPath], {stdio: 'inherit'});
process.exit(r.status ?? 1);
