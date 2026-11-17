import type {VideoData} from '../engine/types';
import {bonneAffaire} from './bonne-affaire';
import {fraisCaches} from './frais-caches';

/** Registre des vidéos : ajoute ici chaque nouveau fichier de données. */
export const videos: VideoData[] = [bonneAffaire, fraisCaches];
