import React from 'react';

/** Icône maison simple (pas de logo). */
export const HouseIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{display: 'block'}}>
    <path d="M50 8 L94 46 L84 46 L84 92 L16 92 L16 46 L6 46 Z" fill={color} strokeLinejoin="round" />
    <rect x="41" y="62" width="18" height="30" rx="3" fill="#F6F4EF" />
  </svg>
);
