/**
 * npm run rythme -- <id>
 * Vérifie les règles de montage AVANT le rendu (à partir de words.json) :
 * affiche « TROP LONG » si plus de 1,5 s passe sans nouvel élément à l'écran.
 */
import fs from 'node:fs';
import path from 'node:path';
import type {WordsFile} from '../src/engine/types';
import {checkRules, printReport} from './rules';
import {getVideo} from './video-arg';

const video = getVideo();
const file = path.join('public', video.id, 'words.json');
if (!fs.existsSync(file)) {
  console.error(`Voix off absente. Lance d'abord : npm run voice -- ${video.id}`);
  process.exit(1);
}
const words: WordsFile = JSON.parse(fs.readFileSync(file, 'utf8'));
const report = checkRules(video, words);
printReport(report);
process.exit(report.errors.length ? 1 : 0);
