import React from 'react';
import {Easing, interpolate, spring, useVideoConfig} from 'remotion';
import {useBeatFrame, useCue} from '../context';
import {colors, formatNumber, toneColor} from '../theme';
import type {Block} from '../types';
import {HouseIcon} from './icons';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Ressort rapide et net (0 → 1). */
const useSpring = (delay = 0, stiff = 260) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  return spring({frame: f - delay, fps, config: {damping: 18, stiffness: stiff, mass: 0.6}});
};

const appear = (p: number, dy = 40): React.CSSProperties => ({
  opacity: interpolate(p, [0, 0.4], [0, 1], clamp),
  transform: `translateY(${(1 - p) * dy}px)`,
});

// ------------------------------------------------------------------ kicker
const Kicker: React.FC<Extract<Block, {kind: 'kicker'}>> = ({text, tone}) => {
  const p = useSpring();
  return (
    <div
      style={{
        ...appear(p, 20),
        transform: `scale(${interpolate(p, [0, 1], [0.6, 1])})`,
        background: toneColor(tone ?? 'accent'),
        color: '#fff',
        fontSize: 46,
        fontWeight: 800,
        letterSpacing: 4,
        padding: '14px 34px',
        borderRadius: 16,
      }}
    >
      {text}
    </div>
  );
};

// ------------------------------------------------------------------ title
const Title: React.FC<Extract<Block, {kind: 'title'}>> = ({text, size = 110, tone, zoom}) => {
  const p = useSpring(0, zoom ? 320 : 260);
  const style: React.CSSProperties = zoom
    ? {
        opacity: interpolate(p, [0, 0.25], [0, 1], clamp),
        transform: `scale(${interpolate(p, [0, 1], [2.2, 1])})`,
      }
    : appear(p, 50);
  return (
    <div
      style={{
        ...style,
        fontSize: size,
        fontWeight: 900,
        lineHeight: 1.02,
        color: toneColor(tone),
        textAlign: 'center',
        textWrap: 'balance',
        letterSpacing: -1,
      }}
    >
      {text}
    </div>
  );
};

// ------------------------------------------------------------------ priceTag
const PriceTag: React.FC<Extract<Block, {kind: 'priceTag'}>> = ({price, strikeAt}) => {
  const f = useBeatFrame();
  const p = useSpring(0, 200);
  const strike = useCue(strikeAt, 1e9);
  const s = interpolate(f, [strike, strike + 6], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  return (
    <div style={{...appear(p, 80), position: 'relative', marginTop: 40, transform: `${appear(p, 80).transform} rotate(-5deg)`}}>
      <div
        style={{
          background: s > 0 ? '#5E6B7D' : colors.accent,
          color: '#fff',
          fontSize: 110,
          fontWeight: 900,
          padding: '28px 60px 28px 100px',
          clipPath: 'polygon(70px 0, 100% 0, 100% 100%, 70px 100%, 0 50%)',
          borderRadius: 18,
          position: 'relative',
          whiteSpace: 'nowrap',
        }}
      >
        {price}
      </div>
      <div
        style={{
          position: 'absolute',
          left: -20,
          right: -20,
          top: '50%',
          height: 18,
          marginTop: -9,
          background: colors.loss,
          borderRadius: 9,
          transformOrigin: 'left center',
          transform: `rotate(-8deg) scaleX(${s})`,
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------ bars
const Bars: React.FC<Extract<Block, {kind: 'bars'}>> = ({bars}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const max = Math.max(...bars.map((b) => b.value));
  const MAXH = 560;
  const cues = bars.map((b) => useCue(b.at)); // eslint-disable-line react-hooks/rules-of-hooks
  const enter = useSpring();
  // Moment où la plus grosse barre atterrit : les autres s'écrasent.
  const bigIdx = bars.findIndex((b) => b.value === max);
  const land = cues[bigIdx] + 8;
  return (
    <div style={{...appear(enter), display: 'flex', gap: 90, alignItems: 'flex-end', height: MAXH + 260}}>
      {bars.map((b, i) => {
        const g = spring({frame: f - cues[i], fps, config: {damping: 11, stiffness: 170, mass: 0.7}});
        const isBig = i === bigIdx;
        const squash =
          !isBig && f > land
            ? 1 - 0.35 * Math.exp(-(f - land) / 5) * Math.abs(Math.cos((f - land) / 2.2))
            : 1;
        const h = Math.max(10, g * (b.value / max) * MAXH);
        return (
          <div key={b.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: 280}}>
            <div
              style={{
                fontSize: isBig ? 110 : 84,
                fontWeight: 900,
                color: isBig ? colors.accent : colors.muted,
                opacity: interpolate(g, [0, 0.3], [0, 1], clamp),
                transform: `scale(${interpolate(g, [0, 1], [0.5, 1])})`,
                marginBottom: 16,
                whiteSpace: 'nowrap',
              }}
            >
              {b.display}
            </div>
            <div
              style={{
                width: 240,
                height: h,
                background: isBig ? colors.accent : colors.accentSoft,
                borderRadius: '22px 22px 6px 6px',
                transformOrigin: 'bottom',
                transform: `scaleY(${squash})`,
              }}
            />
            <div style={{fontSize: 58, fontWeight: 800, color: colors.ink, marginTop: 22}}>{b.label}</div>
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ iconGrid
const IconGrid: React.FC<Extract<Block, {kind: 'iconGrid'}>> = ({count, highlighted, label, highlightAt}) => {
  const f = useBeatFrame();
  const start = useCue(highlightAt, 8);
  const lp = useSpring(start + highlighted * 3);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 140px)', gap: '34px 26px'}}>
        {Array.from({length: count}).map((_, i) => {
          const pIn = spring({frame: f - i * 1.5, fps: 30, config: {damping: 14, stiffness: 240, mass: 0.5}});
          const on = i < highlighted && f >= start + i * 3;
          const flash = on ? interpolate(f - (start + i * 3), [0, 4, 8], [1, 1.18, 1], clamp) : 1;
          return (
            <div key={i} style={{transform: `scale(${pIn * flash})`, opacity: pIn}}>
              <HouseIcon size={140} color={on ? colors.accent : colors.accentSoft} />
            </div>
          );
        })}
      </div>
      <div
        style={{
          ...appear(lp, 30),
          fontSize: 80,
          fontWeight: 900,
          color: colors.ink,
          textAlign: 'center',
          lineHeight: 1.05,
          textWrap: 'balance',
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ calc
const Calc: React.FC<Extract<Block, {kind: 'calc'}>> = ({base, operation, operationAt}) => {
  const p = useSpring();
  const op = useCue(operationAt, 15);
  const q = useSpring(op);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{...appear(p), fontSize: 130, fontWeight: 900, color: colors.ink, whiteSpace: 'nowrap'}}>{base}</div>
      <div
        style={{
          ...appear(q, 30),
          fontSize: 110,
          fontWeight: 900,
          color: colors.accent,
          background: colors.accentSoft,
          padding: '4px 36px',
          borderRadius: 18,
          marginTop: 10,
          whiteSpace: 'nowrap',
        }}
      >
        {operation}
      </div>
      <div
        style={{
          width: 640 * q,
          height: 10,
          background: colors.ink,
          borderRadius: 5,
          marginTop: 40,
        }}
      />
    </div>
  );
};

// ------------------------------------------------------------------ counter
const Counter: React.FC<Extract<Block, {kind: 'counter'}>> = ({from, to, suffix = '', label, reachAt, tone, size = 160}) => {
  const f = useBeatFrame();
  const reach = Math.max(12, useCue(reachAt, 30));
  const p = useSpring();
  const v = interpolate(f, [0, reach], [from, to], {...clamp, easing: Easing.out(Easing.cubic)});
  const done = f >= reach;
  const bump = done ? interpolate(f - reach, [0, 4, 9], [1, 1.12, 1], clamp) : 1;
  return (
    <div style={{...appear(p), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div
        style={{
          fontSize: size,
          fontWeight: 900,
          color: toneColor(tone ?? 'accent'),
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          transform: `scale(${bump})`,
          lineHeight: 1.05,
        }}
      >
        {formatNumber(v)}
        {suffix.replace(' ', ' ')}
      </div>
      {label ? <div style={{fontSize: 60, fontWeight: 800, color: colors.ink, marginTop: 6}}>{label}</div> : null}
    </div>
  );
};

// ------------------------------------------------------------------ statement
const Statement: React.FC<Extract<Block, {kind: 'statement'}>> = ({lines}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
      {lines.map((l, i) => {
        const p = spring({frame: f - i * 4, fps, config: {damping: 18, stiffness: 260, mass: 0.6}});
        return (
          <div
            key={i}
            style={{
              ...appear(p, 40),
              fontSize: l.size ?? 84,
              fontWeight: 900,
              lineHeight: 1.08,
              color: toneColor(l.tone),
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ energyScale
const DPE_COLORS: Record<string, string> = {
  A: '#009C6D',
  B: '#52B153',
  C: '#A5CC74',
  D: '#F4E70F',
  E: '#F0B40F',
  F: '#EB8235',
  G: '#D7221F',
};
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

const EnergyScale: React.FC<Extract<Block, {kind: 'energyScale'}>> = ({highlights, badge}) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const hl = highlights.map((h) => ({...h, frame: useCue(h.at)})); // eslint-disable-line react-hooks/rules-of-hooks
  const firstHl = Math.min(...hl.map((h) => h.frame));
  const badgeFrame = useCue(badge?.at, 1e9);
  const dim = interpolate(f, [firstHl, firstHl + 6], [1, 0.25], clamp);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 14, width: 820}}>
      {LETTERS.map((L, i) => {
        const pIn = spring({frame: f - i * 2, fps, config: {damping: 16, stiffness: 260, mass: 0.5}});
        const h = hl.find((x) => x.letter === L);
        const on = h ? f >= h.frame : false;
        const pop = h ? spring({frame: f - h.frame, fps, config: {damping: 10, stiffness: 220, mass: 0.6}}) : 0;
        const width = 250 + i * 56;
        const showBadge = badge && badge.near === L;
        const bp = spring({frame: f - badgeFrame, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
        return (
          <div key={L} style={{display: 'flex', alignItems: 'center', gap: 20, height: 92}}>
            <div
              style={{
                width,
                height: on ? 92 : 80,
                background: DPE_COLORS[L],
                clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 50%, calc(100% - 40px) 100%, 0 100%)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 26,
                fontSize: on ? 66 : 54,
                fontWeight: 900,
                color: L === 'D' || L === 'C' ? colors.ink : '#fff',
                opacity: pIn * (on ? 1 : dim),
                transform: `translateX(${(1 - pIn) * -60}px) scale(${on ? 1 + 0.06 * pop : 1})`,
                transformOrigin: 'left center',
                boxSizing: 'border-box',
              }}
            >
              {L}
            </div>
            {on ? (
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: colors.ink,
                  opacity: pop,
                  transform: `translateX(${(1 - pop) * -20}px)`,
                }}
              >
                {showBadge ? null : 'Maison ' + L}
              </div>
            ) : null}
            {showBadge && f >= badgeFrame ? (
              <div
                style={{
                  background: colors.loss,
                  color: '#fff',
                  fontSize: 54,
                  fontWeight: 900,
                  padding: '6px 22px',
                  borderRadius: 14,
                  transform: `scale(${bp})`,
                  whiteSpace: 'nowrap',
                }}
              >
                {badge.text}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ priceDrop
const PriceDrop: React.FC<Extract<Block, {kind: 'priceDrop'}>> = (b) => {
  const f = useBeatFrame();
  const {fps} = useVideoConfig();
  const p = useSpring();
  const drop = useCue(b.dropAt);
  const reach = Math.max(drop + 10, useCue(b.reachAt) + 8);
  const delta = useCue(b.deltaAt);
  const v = interpolate(f, [drop, reach], [b.from, b.to], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const dropped = f >= drop;
  const letter = dropped ? b.toLabel : b.fromLabel;
  const swap = spring({frame: f - drop, fps, config: {damping: 10, stiffness: 240, mass: 0.5}});
  const dp = spring({frame: f - delta, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
  return (
    <div style={{...appear(p), display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative'}}>
        <HouseIcon size={250} color={colors.accent} />
        <div
          style={{
            position: 'absolute',
            right: -40,
            top: -10,
            width: 120,
            height: 120,
            borderRadius: 24,
            background: DPE_COLORS[letter],
            color: letter === 'D' ? colors.ink : '#fff',
            fontSize: 84,
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${dropped ? 0.7 + 0.3 * swap : 1})`,
            boxShadow: '0 6px 0 rgba(11,31,58,0.15)',
          }}
        >
          {letter}
        </div>
      </div>
      <div
        style={{
          fontSize: 150,
          fontWeight: 900,
          color: colors.ink,
          fontVariantNumeric: 'tabular-nums',
          marginTop: 30,
          whiteSpace: 'nowrap',
        }}
      >
        {formatNumber(v)}&nbsp;€
      </div>
      <div
        style={{
          fontSize: 130,
          fontWeight: 900,
          color: colors.loss,
          opacity: f >= delta ? 1 : 0,
          transform: `scale(${f >= delta ? interpolate(dp, [0, 1], [0.4, 1]) : 0.4})`,
          whiteSpace: 'nowrap',
          marginTop: 10,
        }}
      >
        {b.delta}
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ cta
const Cta: React.FC<Extract<Block, {kind: 'cta'}>> = ({button, caption}) => {
  const f = useBeatFrame();
  const p = useSpring(0, 200);
  const pulse = f > 10 ? 1 + 0.05 * Math.sin((f - 10) / 3.2) : 1;
  const ring = ((f % 24) / 24);
  return (
    <div style={{...appear(p, 80), display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 30}}>
      <div style={{position: 'relative', transform: `scale(${interpolate(p, [0, 1], [0.6, 1]) * pulse})`}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            border: `6px solid ${colors.accent}`,
            transform: `scale(${1 + ring * 0.25})`,
            opacity: f > 10 ? 1 - ring : 0,
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            background: colors.accent,
            color: '#fff',
            fontSize: 78,
            fontWeight: 900,
            padding: '30px 64px',
            borderRadius: 999,
            boxShadow: '0 14px 0 rgba(11,31,58,0.18)',
          }}
        >
          <span
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              background: '#fff',
              color: colors.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 64,
              lineHeight: 1,
            }}
          >
            +
          </span>
          {button}
        </div>
      </div>
      <div style={{fontSize: 56, fontWeight: 800, color: colors.ink, marginTop: 44}}>{caption}</div>
    </div>
  );
};

export const BlockView: React.FC<{block: Block}> = ({block}) => {
  switch (block.kind) {
    case 'kicker':
      return <Kicker {...block} />;
    case 'title':
      return <Title {...block} />;
    case 'priceTag':
      return <PriceTag {...block} />;
    case 'bars':
      return <Bars {...block} />;
    case 'iconGrid':
      return <IconGrid {...block} />;
    case 'calc':
      return <Calc {...block} />;
    case 'counter':
      return <Counter {...block} />;
    case 'statement':
      return <Statement {...block} />;
    case 'energyScale':
      return <EnergyScale {...block} />;
    case 'priceDrop':
      return <PriceDrop {...block} />;
    case 'cta':
      return <Cta {...block} />;
  }
};
