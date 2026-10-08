import React from 'react';
import { CAMPAIGN_URL_TEXT } from '../constants/brand';
import { CardData, CardSvgArtboard, CardSvgArtboardProps, getAttributeConfig, wrapText } from './CardSvgArtboard';

export type CardStyle = 'classic' | 'warm' | 'bold' | 'oxblood' | 'purple';

/** Default style for new cards (Navy). 'classic' remains only so older drafts still render. */
export const DEFAULT_CARD_STYLE: CardStyle = 'bold';

/** Styles exported with square corners. */
export const SQUARE_STYLES: string[] = ['bold', 'oxblood', 'purple'];

/** Styles that have the intro animation. */
export const ANIMATED_STYLES: string[] = ['bold', 'oxblood', 'purple'];

export const CARD_STYLES: { id: CardStyle; label: string; description: string; swatch: string[] }[] = [
  { id: 'bold', label: 'Navy', description: 'Confident and made to share', swatch: ['#071A3A', '#00E5A3', '#2563EB'] },
  { id: 'oxblood', label: 'Oxblood', description: 'Rich and refined', swatch: ['#3B0A14', '#F2B8C6', '#8E1B33'] },
  { id: 'purple', label: 'Purple', description: 'Pluto purple, modern and bright', swatch: ['#1D1650', '#C7B8FF', '#5B4BFF'] },
  { id: 'warm', label: 'Warm', description: 'Like a handwritten note', swatch: ['#FBF6EE', '#C9A227', '#7A4E1D'] },
];

const HASHTAG = '#ThoseWhoWentTheExtraMile';

/** Shared content rules, kept identical to the Classic card. */
const prepare = (data: CardData) => {
  const recipientName = (data.recipientName || 'Their Name').trim() || 'Their Name';
  const rawRel = (data.relationship || 'Colleague').trim().replace(/\.$/, '');
  const relationship = rawRel.toLowerCase().startsWith('my ') ? rawRel : `My ${rawRel}`;
  const photoUrl = data.photoUrl || '/african_executive_portrait.jpg';
  const traits =
    data.selectedTraits && data.selectedTraits.length >= 2
      ? data.selectedTraits.slice(0, 5)
      : ['Challenged me to grow', 'Opened new opportunities'];
  const traitLabels = traits
    .map((t) => {
      const c = getAttributeConfig(t);
      return { label: `${c.line1} ${c.line2}`, color: c.color };
    })
    .filter((t, i, all) => all.findIndex((o) => o.label === t.label) === i);
  const message =
    (data.message || '').trim() ||
    'You didn’t just give direction. You gave me opportunity, challenged me to grow, and believed in me when I doubted myself.';
  const senderName =
    [data.creatorFirstName, data.creatorLastName].filter(Boolean).join(' ').trim() || 'Your Name';
  const senderRole = (data.creatorJobTitle || 'Your Role').trim();
  return { recipientName, relationship, photoUrl, traitLabels, message, senderName, senderRole };
};

/** Lay out pill labels left-to-right, wrapping within maxWidth. */
const flowPills = (labels: string[], maxWidth: number, fontSize: number, padX: number, gap: number, maxRows: number) => {
  const charW = fontSize * 0.56;
  const rows: { label: string; x: number; w: number; row: number }[] = [];
  let x = 0;
  let row = 0;
  for (const label of labels) {
    const w = Math.round(label.length * charW + padX * 2);
    if (x > 0 && x + w > maxWidth) {
      row += 1;
      x = 0;
    }
    if (row >= maxRows) break;
    rows.push({ label, x, w, row });
    x += w + gap;
  }
  return { pills: rows, rowCount: rows.length ? rows[rows.length - 1].row + 1 : 0 };
};

/** Message sizing: longer messages get a smaller size and more lines so nothing is cut off. */
const messageLayout = (message: string, baseChars: number) => {
  const len = message.length;
  if (len > 200) return { size: 22, lineH: 34, lines: wrapText(message, baseChars + 8, 7) };
  if (len > 150) return { size: 24, lineH: 36, lines: wrapText(message, baseChars + 4, 6) };
  return { size: 26, lineH: 38, lines: wrapText(message, baseChars, 5) };
};

const fitFont = (text: string, maxWidth: number, maxSize: number, minSize: number, ratio = 0.6) =>
  Math.max(minSize, Math.min(maxSize, Math.floor(maxWidth / Math.max(1, text.length * ratio))));

const FontDefs = () => (
  <style type="text/css">
    {`
      @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400;1,500&display=swap');
      .svg-sans { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
      .svg-script { font-family: 'Caveat', cursive, system-ui; }
    `}
  </style>
);

const svgStyle = (style: React.CSSProperties = {}): React.CSSProperties => ({
  width: '100%',
  height: '100%',
  display: 'block',
  aspectRatio: '1 / 1',
  borderRadius: '36px',
  overflow: 'hidden',
  ...style,
});

/* =========================================================================
   WARM: cream, gold accents, handwritten "Thank you", arch-framed photo
   ========================================================================= */
export const CardSvgWarm: React.FC<CardSvgArtboardProps> = ({ data, id = 'card-svg-warm', className = '', style = {} }) => {
  const c = prepare(data);
  const nameSize = fitFont(c.recipientName + '.', 560, 76, 40, 0.55);
  const { pills, rowCount } = flowPills(c.traitLabels.map((t) => t.label), 560, 15, 18, 10, 2);
  const pillsY = 345;
  const msgY = pillsY + rowCount * 50 + 70;
  const { size: msgSize, lineH, lines: msgLines } = messageLayout(c.message, 40);
  const senderY = msgY + (msgLines.length - 1) * lineH + 72;
  const arch = 'M 70 285 A 170 170 0 0 1 410 285 L 410 560 L 70 560 Z';

  return (
    <svg id={id} viewBox="0 0 1080 1080" width="1080" height="1080" xmlns="http://www.w3.org/2000/svg" className={className} style={svgStyle(style)}>
      <defs>
        <FontDefs />
        <filter id="warmBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="60" />
        </filter>
        <filter id="warmShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#7A4E1D" floodOpacity="0.16" />
        </filter>
        <clipPath id="warmArchClip">
          <path d={arch} />
        </clipPath>
      </defs>

      {/* Background */}
      <rect width="1080" height="1080" fill="#FBF6EE" />
      <circle cx="980" cy="90" r="200" fill="#F3DFB4" opacity="0.45" filter="url(#warmBlur)" />
      <circle cx="90" cy="700" r="180" fill="#F6E7C8" opacity="0.4" filter="url(#warmBlur)" />

      {/* Photo in arch frame */}
      <path d="M 54 285 A 186 186 0 0 1 426 285 L 426 576 L 54 576 Z" fill="none" stroke="#C9A227" strokeWidth="3" />
      <path d={arch} fill="#F3E6CC" filter="url(#warmShadow)" />
      <image href={c.photoUrl} x="70" y="115" width="340" height="445" preserveAspectRatio="xMidYMid slice" clipPath="url(#warmArchClip)" />
      {/* small gold sparkle */}
      <g stroke="#C9A227" strokeWidth="4" strokeLinecap="round">
        <line x1="440" y1="120" x2="440" y2="146" />
        <line x1="427" y1="133" x2="453" y2="133" />
      </g>

      {/* Headline */}
      <text x="470" y="200" fill="#9A6B12" className="svg-script" fontSize="96" fontWeight="700">
        Thank you,
      </text>
      <text x="470" y="282" fill="#2B1B0E" className="svg-sans" fontSize={nameSize} fontWeight="800" letterSpacing="-0.02em">
        {c.recipientName}
        <tspan fill="#C9A227">.</tspan>
      </text>
      <line x1="470" y1="311" x2="500" y2="311" stroke="#C9A227" strokeWidth="3" strokeLinecap="round" />
      <text x="512" y="318" fill="#B7791F" className="svg-sans" fontSize="18" fontWeight="700" letterSpacing="0.16em">
        {c.relationship.toUpperCase()}
      </text>

      {/* Traits */}
      {pills.map((p) => (
        <g key={p.label} transform={`translate(${470 + p.x}, ${pillsY + p.row * 50})`}>
          <rect width={p.w} height="38" rx="19" fill="#FFF8E7" stroke="#E8C77A" strokeWidth="1.5" />
          <text x={p.w / 2} y="25" textAnchor="middle" fill="#5B3A12" className="svg-sans" fontSize="15" fontWeight="700">
            {p.label}
          </text>
        </g>
      ))}

      {/* Message */}
      <text x="462" y={msgY + 12} fill="#E2B651" className="svg-sans" fontSize="84" fontWeight="800" opacity="0.55">
        “
      </text>
      <text x="470" y={msgY + 26} fill="#3F2A16" className="svg-sans" fontSize={msgSize} fontStyle="italic" fontWeight="500">
        {msgLines.map((l, i) => (
          <tspan key={i} x="470" dy={i === 0 ? 0 : lineH}>
            {l}
          </tspan>
        ))}
      </text>

      {/* Sender */}
      <text x="470" y={senderY + 26} fill="#2B1B0E" className="svg-sans" fontSize="30" fontWeight="800">
        — {c.senderName}
      </text>
      <text x="500" y={senderY + 56} fill="#8A6A4A" className="svg-sans" fontSize="19" fontWeight="500">
        {c.senderRole}
      </text>

      {/* Footer */}
      <rect x="0" y="880" width="1080" height="200" fill="#F4E9D6" />
      <line x1="0" y1="880" x2="1080" y2="880" stroke="#C9A227" strokeWidth="3" />
      <text x="60" y="945" fill="#7A4E1D" className="svg-script" fontSize="32" fontWeight="700">
        <tspan x="60">Some people are part of your</tspan>
        <tspan x="60" dy="38">career history. Make sure they know.</tspan>
      </text>
      <text x="530" y="930" fill="#7A4E1D" className="svg-sans" fontSize="15" fontWeight="600">
        Who went the extra mile for you?
      </text>
      <g transform="translate(530, 946)">
        <rect width="320" height="46" rx="23" fill="#FFFFFF" stroke="#C9A227" strokeWidth="1.5" />
        <text x="160" y="29" textAnchor="middle" fill="#9A6B12" className="svg-sans" fontSize="14.5" fontWeight="800">
          {CAMPAIGN_URL_TEXT}
        </text>
      </g>
      <PlutoMark x={886} y={908} scale={0.8} idPrefix="warm" />
      <text x="952" y="975" textAnchor="middle" fill="#2B1B0E" className="svg-sans" fontSize="13" fontWeight="700">
        by VerifyMe
      </text>
      <text x="1018" y="1032" textAnchor="end" fill="#B7791F" className="svg-sans" fontSize="14" fontWeight="800">
        {HASHTAG}
      </text>
    </svg>
  );
};

/* =========================================================================
   BOLD: full-height photo, deep navy panel, huge name, mint and blue accents
   ========================================================================= */
/** Vector Pluto mark (open box + wordmark). Native width 165, height 54 at scale 1. */
export const PlutoMark: React.FC<{ x: number; y: number; scale?: number; wordColor?: string; idPrefix: string }> = ({
  x,
  y,
  scale = 1,
  wordColor = '#4356FF',
  idPrefix,
}) => (
  <g transform={`translate(${x}, ${y}) scale(${scale})`}>
    <defs>
      <clipPath id={`${idPrefix}-opening`}>
        <polygon points="0,17 17,0 43,8 27,26" />
      </clipPath>
      <linearGradient id={`${idPrefix}-front`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#4C5DFF" />
        <stop offset="1" stopColor="#3A4BF0" />
      </linearGradient>
    </defs>
    <polygon points="0,17 17,0 43,8 27,26" fill="#2F3DC4" />
    <polygon points="0,17 17,0 17,13 7,21" fill="#8C98FA" clipPath={`url(#${idPrefix}-opening)`} />
    <circle cx="20" cy="23" r="7.5" fill="#E4E7FF" clipPath={`url(#${idPrefix}-opening)`} />
    <polygon points="0,17 27,26 27,52 0,43" fill={`url(#${idPrefix}-front)`} />
    <polygon points="27,26 43,8 43,34 27,52" fill="#A7B0FC" />
    <text x="58" y="38" fill={wordColor} className="svg-sans" fontSize="24" fontWeight="500" letterSpacing="4.5">
      PLUTO
    </text>
  </g>
);

type BoldTheme = {
  key: string;
  bg: string;
  accent: string;
  pillBg: string;
  pillText: string;
  msg: string;
  role: string;
  label: string;
  traitText: string;
};

const BOLD_THEMES: Record<'navy' | 'oxblood' | 'purple', BoldTheme> = {
  navy: {
    key: 'navy',
    bg: '#071A3A',
    accent: '#00E5A3',
    pillBg: '#2563EB',
    pillText: '#FFFFFF',
    msg: '#FFFFFF',
    role: '#94A3B8',
    label: '#CBD5E1',
    traitText: '#E6FFF7',
  },
  oxblood: {
    key: 'oxblood',
    bg: '#3B0A14',
    accent: '#F2B8C6',
    pillBg: '#F2B8C6',
    pillText: '#3B0A14',
    msg: '#FFF4F6',
    role: '#D8A7B3',
    label: '#E9C7CF',
    traitText: '#FFE9EE',
  },
  purple: {
    key: 'purple',
    bg: '#1D1650',
    accent: '#C7B8FF',
    pillBg: '#5B4BFF',
    pillText: '#FFFFFF',
    msg: '#F5F3FF',
    role: '#B3ABD9',
    label: '#DCD6FF',
    traitText: '#EFEAFF',
  },};

/** Intro animation timing. Total build ≈ 1.5s, then the card holds still like a banner. */
export const CARD_ANIMATION_SECONDS = 1.5;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
/** Progress 0→1 of a step that starts at `start` and lasts `dur` seconds. No time given = finished (static card). */
const step = (t: number | undefined, start: number, dur: number) =>
  t === undefined ? 1 : easeOut(Math.min(1, Math.max(0, (t - start) / dur)));

export type AnimatedCardProps = CardSvgArtboardProps & { animT?: number };

const CardSvgBoldThemed: React.FC<AnimatedCardProps & { theme: BoldTheme }> = ({ data, id, className = '', style = {}, theme: t, animT }) => {
  const c = prepare(data);
  const p = `bold-${t.key}`;
  const nameSize = fitFont(c.recipientName + '.', 520, 84, 40, 0.55);
  const relW = Math.round(c.relationship.length * 13.4 + 40);
  const relY = 178 + nameSize;
  const msgY = relY + 135;
  const { size: msgSize, lineH, lines: msgLines } = messageLayout(c.message, 36);
  const { pills, rowCount } = flowPills(c.traitLabels.map((x) => x.label), 505, 15, 16, 10, 2);
  const pillsY = msgY + (msgLines.length - 1) * lineH + 40;
  const senderY = pillsY + rowCount * 48 + 44;

  // Animation steps (all 1 when static)
  const aPhoto = step(animT, 0, 0.55);
  const aThank = step(animT, 0.15, 0.4);
  const aName = step(animT, 0.25, 0.45);
  const aRel = step(animT, 0.45, 0.35);
  const aMsg = step(animT, 0.55, 0.45);
  const aSender = step(animT, 0.95, 0.4);
  const aFooter = step(animT, 1.05, 0.45);
  const rise = (a: number, d: number) => `translate(0, ${((1 - a) * d).toFixed(2)})`;

  return (
    <svg id={id} viewBox="0 0 1080 1080" width="1080" height="1080" xmlns="http://www.w3.org/2000/svg" className={className} style={svgStyle({ borderRadius: 0, ...style })}>
      <defs>
        <FontDefs />
        <linearGradient id={`${p}-photoFade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor={t.bg} stopOpacity="0" />
          <stop offset="1" stopColor={t.bg} stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={`${p}-edgeFade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={t.bg} stopOpacity="0" />
          <stop offset="1" stopColor={t.bg} stopOpacity="1" />
        </linearGradient>
        <clipPath id={`${p}-photoClip`}>
          <rect x="0" y="0" width="480" height="1080" />
        </clipPath>
      </defs>

      {/* Background + photo */}
      <rect width="1080" height="1080" fill={t.bg} />
      <g opacity={aPhoto} clipPath={`url(#${p}-photoClip)`}>
        <g transform={`translate(${((1 - aPhoto) * -60).toFixed(2)}, 0)`}>
          <image href={c.photoUrl} x="0" y="0" width="480" height="1080" preserveAspectRatio="xMidYMid slice" />
        </g>
        <rect x="0" y="0" width="480" height="1080" fill={`url(#${p}-photoFade)`} />
        <rect x="400" y="0" width="80" height="1080" fill={`url(#${p}-edgeFade)`} />
      </g>

      {/* Headline */}
      <g opacity={aThank} transform={rise(aThank, 18)}>
        <text x="520" y="140" fill={t.accent} className="svg-sans" fontSize="28" fontWeight="800" letterSpacing="0.22em">
          THANK YOU,
        </text>
      </g>
      <g opacity={aName} transform={rise(aName, 30)}>
        <text x="518" y={140 + nameSize * 0.98} fill="#FFFFFF" className="svg-sans" fontSize={nameSize} fontWeight="800" letterSpacing="-0.03em">
          {c.recipientName}
          <tspan fill={t.accent}>.</tspan>
        </text>
      </g>
      <g opacity={aRel} transform={`translate(520, ${relY + 20}) scale(${(0.7 + 0.3 * aRel).toFixed(3)}) translate(0, -20)`}>
        <rect width={relW} height="40" rx="20" fill={t.pillBg} />
        <text x="20" y="26" fill={t.pillText} className="svg-sans" fontSize="16" fontWeight="800" letterSpacing="0.12em">
          {c.relationship.toUpperCase()}
        </text>
      </g>

      {/* Message */}
      <g opacity={aMsg} transform={rise(aMsg, 22)}>
        <text x="512" y={msgY + 36} fill={t.accent} className="svg-sans" fontSize="120" fontWeight="800">
          “
        </text>
        <text x="520" y={msgY + 30} fill={t.msg} className="svg-sans" fontSize={msgSize} fontWeight="500">
          {msgLines.map((l, i) => (
            <tspan key={i} x="520" dy={i === 0 ? 0 : lineH}>
              {l}
            </tspan>
          ))}
        </text>
      </g>

      {/* Traits pop in one after another */}
      {pills.map((x, i) => {
        const a = step(animT, 0.75 + i * 0.07, 0.3);
        const s = (0.6 + 0.4 * a).toFixed(3);
        return (
          <g key={x.label} opacity={a} transform={`translate(${520 + x.x + x.w / 2}, ${pillsY + 48 + x.row * 48}) scale(${s}) translate(${-x.w / 2}, -18)`}>
            <rect width={x.w} height="36" rx="18" fill="none" stroke={t.accent} strokeWidth="1.8" />
            <text x={x.w / 2} y="24" textAnchor="middle" fill={t.traitText} className="svg-sans" fontSize="15" fontWeight="700" letterSpacing="0.01em">
              {x.label}
            </text>
          </g>
        );
      })}

      {/* Sender */}
      <g opacity={aSender} transform={rise(aSender, 16)}>
        <text x="520" y={senderY + 30} fill={t.accent} className="svg-sans" fontSize="13" fontWeight="800" letterSpacing="0.2em">
          WITH GRATITUDE,
        </text>
        <text x="520" y={senderY + 66} fill="#FFFFFF" className="svg-sans" fontSize="30" fontWeight="800">
          {c.senderName}
        </text>
        <text x="520" y={senderY + 96} fill={t.role} className="svg-sans" fontSize="19" fontWeight="500">
          {c.senderRole}
        </text>
      </g>

      {/* Footers */}
      <g opacity={aFooter} transform={rise(aFooter, 24)}>
        <text x="48" y="930" fill="#FFFFFF" className="svg-script" fontSize="34" fontWeight="700">
          <tspan x="48">Some people are part of your</tspan>
          <tspan x="48" dy="40">career history. Make sure they know.</tspan>
        </text>
        <text x="48" y="1035" fill={t.accent} className="svg-sans" fontSize="18" fontWeight="800">
          {HASHTAG}
        </text>
        <line x1="520" y1="890" x2="1032" y2="890" stroke={t.accent} strokeOpacity="0.3" strokeWidth="1.5" />
        <text x="520" y="930" fill={t.label} className="svg-sans" fontSize="15" fontWeight="600">
          Who went the extra mile for you?
        </text>
        <g transform="translate(520, 948)">
          <rect width="330" height="50" rx="25" fill="#FFFFFF" />
          <text x="165" y="31" textAnchor="middle" fill={t.bg} className="svg-sans" fontSize="15" fontWeight="800">
            {CAMPAIGN_URL_TEXT}
          </text>
        </g>
        <rect x="868" y="908" width="164" height="104" rx="10" fill="#FFFFFF" />
        <PlutoMark x={950 - 66} y={926} scale={0.8} idPrefix={p} />
        <text x="950" y="990" textAnchor="middle" fill={t.bg} className="svg-sans" fontSize="13" fontWeight="700">
          by VerifyMe
        </text>
      </g>
    </svg>
  );
};

export const CardSvgBold: React.FC<AnimatedCardProps> = ({ id = 'card-svg-bold', ...props }) => (
  <CardSvgBoldThemed {...props} id={id} theme={BOLD_THEMES.navy} />
);

export const CardSvgOxblood: React.FC<AnimatedCardProps> = ({ id = 'card-svg-oxblood', ...props }) => (
  <CardSvgBoldThemed {...props} id={id} theme={BOLD_THEMES.oxblood} />
);

export const CardSvgPurple: React.FC<AnimatedCardProps> = ({ id = 'card-svg-purple', ...props }) => (
  <CardSvgBoldThemed {...props} id={id} theme={BOLD_THEMES.purple} />
);

/** Renders the card in the chosen style. */
export const CardArtboard: React.FC<AnimatedCardProps & { cardStyle?: string }> = ({ cardStyle, animT, ...props }) => {
  if (cardStyle === 'classic') return <CardSvgArtboard {...props} />;
  if (cardStyle === 'warm') return <CardSvgWarm {...props} />;
  if (cardStyle === 'oxblood') return <CardSvgOxblood {...props} animT={animT} />;
  if (cardStyle === 'purple') return <CardSvgPurple {...props} animT={animT} />;
  return <CardSvgBold {...props} animT={animT} />;
};
