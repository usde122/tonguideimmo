export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const colors = {
  bg: '#F6F4EF',
  card: '#FFFFFF',
  accent: '#0B1F3A',
  accentSoft: '#C9D2DF',
  ink: '#0B1F3A',
  muted: '#6B7686',
  loss: '#D62828',
};

export const font = "'Montserrat', 'Inter', system-ui, sans-serif";

/**
 * Zones sûres TikTok/Reels (en px sur 1080×1920) :
 * rien d'important dans les 10 % du haut (192 px), les 20 % du bas (384 px)
 * ni dans la bande de droite des boutons (~160 px).
 */
export const safe = {
  top: 192,
  bottom: H - 384, // 1536
  left: 70,
  right: W - 170, // 910
};

export const layout = {
  signatureTop: 206,
  contentTop: 290,
  contentBottom: 1215,
  subtitleTop: 1240,
  subtitleBottom: 1455,
  sourceTop: 1474,
  sourceBottom: 1526,
};

export const toneColor = (tone?: 'accent' | 'loss' | 'ink') =>
  tone === 'loss' ? colors.loss : tone === 'accent' ? colors.accent : colors.ink;

/** 250000 -> "250 000" (espaces insécables). */
export const formatNumber = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
