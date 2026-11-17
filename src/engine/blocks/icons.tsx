import React from 'react';

/** Icône maison simple (pas de logo). */
export const HouseIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
    <path d="M50 8 L94 46 L84 46 L84 92 L16 92 L16 46 L6 46 Z" fill={color} strokeLinejoin="round" />
    <rect x="41" y="62" width="18" height="30" rx="3" fill="#F6F4EF" />
  </svg>
);

import type {IconName} from '../types';

const BG = '#F6F4EF';

/** Pictogrammes simples, une seule couleur, viewBox 100×100. */
export const Icon: React.FC<{name: IconName; size: number; color: string}> = ({name, size, color}) => {
  const svg = (children: React.ReactNode) => (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
      {children}
    </svg>
  );
  switch (name) {
    case 'shield':
      return svg(
        <>
          <path d="M50 6 L88 20 V48 C88 72 70 88 50 95 C30 88 12 72 12 48 V20 Z" fill={color} />
          <path d="M33 50 L45 62 L68 38" stroke={BG} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>,
      );
    case 'receipt':
      return svg(
        <>
          <path d="M18 6 H82 V94 L72 87 L61 94 L50 87 L39 94 L28 87 L18 94 Z" fill={color} />
          <rect x="30" y="24" width="40" height="7" rx="3.5" fill={BG} />
          <rect x="30" y="40" width="40" height="7" rx="3.5" fill={BG} />
          <rect x="30" y="56" width="26" height="7" rx="3.5" fill={BG} />
        </>,
      );
    case 'building':
      return svg(
        <>
          <rect x="20" y="8" width="60" height="86" rx="4" fill={color} />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <rect key={`${r}-${c}`} x={30 + c * 15} y={18 + r * 15} width="10" height="9" rx="1.5" fill={BG} />
            )),
          )}
          <rect x="42" y="76" width="16" height="18" rx="2" fill={BG} />
        </>,
      );
    case 'key':
      return svg(
        <>
          <circle cx="32" cy="50" r="22" fill={color} />
          <circle cx="32" cy="50" r="9" fill={BG} />
          <rect x="48" y="44" width="44" height="12" rx="4" fill={color} />
          <rect x="74" y="54" width="9" height="16" rx="2" fill={color} />
          <rect x="60" y="54" width="8" height="11" rx="2" fill={color} />
        </>,
      );
    case 'calendar':
      return svg(
        <>
          <rect x="10" y="16" width="80" height="76" rx="8" fill={color} />
          <rect x="10" y="16" width="80" height="18" rx="8" fill={color} />
          <rect x="26" y="6" width="9" height="20" rx="4" fill={color} />
          <rect x="65" y="6" width="9" height="20" rx="4" fill={color} />
          {[0, 1, 2].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}-${c}`} x={19 + c * 17} y={42 + r * 15} width="11" height="9" rx="2" fill={BG} />
            )),
          )}
        </>,
      );
    case 'bank':
      return svg(
        <>
          <path d="M50 6 L94 30 H6 Z" fill={color} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={16 + i * 20} y="36" width="10" height="40" rx="2" fill={color} />
          ))}
          <rect x="6" y="82" width="88" height="12" rx="3" fill={color} />
        </>,
      );
    case 'coins':
      return svg(
        <>
          {[0, 1, 2, 3].map((i) => (
            <ellipse key={i} cx="50" cy={80 - i * 16} rx="36" ry="12" fill={color} stroke={BG} strokeWidth="4" />
          ))}
        </>,
      );
    case 'arrow':
      return svg(
        <path d="M22 78 L72 28 M38 26 H74 V62" stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
      );
  }
};
