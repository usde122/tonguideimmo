import fs from 'node:fs';
import {Config} from '@remotion/cli/config';

Config.setEntryPoint('src/index.ts');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setAudioCodec('aac');
Config.setOverwriteOutput(true);

// Chromium préinstallé (évite un téléchargement). Surcharge possible via REMOTION_BROWSER.
const browser =
  process.env.REMOTION_BROWSER ??
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
if (fs.existsSync(browser)) Config.setBrowserExecutable(browser);
