/**
 * Modèle de données d'une vidéo « Ton Guide Immo ».
 *
 * Un « Cue » est un extrait EXACT du texte de la voix off (quelques mots
 * consécutifs). Le moteur le retrouve dans words.json pour caler l'animation
 * sur l'instant où la voix le prononce. La casse et la ponctuation sont ignorées.
 */
export type Cue = string;

export type Tone = 'accent' | 'loss' | 'ink';

export type Block =
  /** Petite étiquette au-dessus d'un titre, ex. « SIGNAL N°1 ». */
  | {kind: 'kicker'; text: string; tone?: Tone}
  /** Gros titre. `zoom` = entrée en zoom rapide. */
  | {kind: 'title'; text: string; size?: number; tone?: Tone; zoom?: boolean}
  /** Étiquette de prix, barrée en rouge au moment `strikeAt`. */
  | {kind: 'priceTag'; price: string; strikeAt?: Cue}
  /** Barres verticales comparées. Chaque barre pousse quand on dit `at`. */
  | {
      kind: 'bars';
      bars: {label: string; display: string; value: number; at: Cue}[];
    }
  /** Grille d'icônes de maisons, `highlighted` passent en bleu. */
  | {kind: 'iconGrid'; count: number; highlighted: number; label: string; highlightAt?: Cue}
  /** Calcul : une base puis une opération qui apparaît à `operationAt`. */
  | {kind: 'calc'; base: string; operation: string; operationAt?: Cue}
  /** Compteur animé de `from` à `to`, qui atteint la cible à `reachAt`. */
  | {
      kind: 'counter';
      from: number;
      to: number;
      suffix?: string;
      label?: string;
      reachAt?: Cue;
      tone?: Tone;
      size?: number;
    }
  /** Phrase-choc sur plusieurs lignes. */
  | {
      kind: 'statement';
      lines: {text: string; tone?: Tone; size?: number}[];
    }
  /** Échelle énergie DPE A→G. Les classes listées s'allument à leur cue. */
  | {
      kind: 'energyScale';
      highlights: {letter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'; at: Cue}[];
      badge?: {text: string; at: Cue; near: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'};
    }
  /** Prix d'un bien qui chute, puis l'écart en rouge. */
  | {
      kind: 'priceDrop';
      from: number;
      to: number;
      fromLabel: string;
      toLabel: string;
      dropAt: Cue;
      reachAt: Cue;
      delta: string;
      deltaAt: Cue;
    }
  /** Bouton d'abonnement animé. */
  | {kind: 'cta'; button: string; caption: string};

export type Beat = {
  /** Instant d'apparition. */
  at: Cue;
  block: Block;
  /** Efface les éléments précédents de la séquence quand celui-ci apparaît. */
  clear?: boolean;
};

export type Scene = {
  id: string;
  /** La séquence démarre quand la voix prononce ce passage. */
  at: Cue;
  /** Source affichée en petit en bas (obligatoire si la séquence a un chiffre). */
  source?: string;
  beats: Beat[];
};

export type VideoData = {
  /** Identifiant : nom du dossier public/<id>/ et du fichier out/<id>.mp4. */
  id: string;
  title: string;
  voice: {
    /** Voix edge-tts (utilisée sans clé ElevenLabs). */
    edgeVoice: string;
    /** Débit edge-tts, ex. "+8%". */
    rate: string;
    /** Voix ElevenLabs (utilisée si ELEVENLABS_API_KEY existe). */
    elevenVoiceId?: string;
  };
  /** Texte EXACT de la voix off, un paragraphe par entrée. */
  script: string[];
  scenes: Scene[];
};

export type Word = {text: string; start: number; end: number};
export type WordsFile = {duration: number; voice: string; words: Word[]};
