import React from 'react';
import { PLUTO_LOGO_URL } from '../constants/brand';
import { CardData, CardSvgArtboard, CardSvgArtboardProps, getAttributeConfig, wrapText } from './CardSvgArtboard';

export type CardStyle = 'classic' | 'warm' | 'bold';

export const CARD_STYLES: { id: CardStyle; label: string; description: string; swatch: string[] }[] = [
  { id: 'classic', label: 'Classic', description: 'Clean and confident', swatch: ['#FFFFFF', '#1068EB', '#00273B'] },
  { id: 'warm', label: 'Warm', description: 'Heartfelt, like a handwritten note', swatch: ['#FBF6EE', '#C9A227', '#7A4E1D'] },
  { id: 'bold', label: 'Bold', description: 'Big, bright and made to share', swatch: ['#071A3A', '#00E5A3', '#2563EB'] },
];

const CAMPAIGN_URL_TEXT = 'pluto.verifyme.ng/ExtraMile';
const HASHTAG = '#ThoseWhoWentTheExtraMile';

/** Shared content rules, kept identical to the Classic card. */
const prepare = (data: CardData) => {
  const recipientName = (data.recipientName || 'John Doe').trim() || 'John Doe';
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
    [data.creatorFirstName, data.creatorLastName].filter(Boolean).join(' ').trim() || 'Victoria Okodu';
  const senderRole = (data.creatorJobTitle || 'Developer').trim();
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
        Want to thank someone who went the extra mile?
      </text>
      <g transform="translate(530, 946)">
        <rect width="270" height="46" rx="23" fill="#FFFFFF" stroke="#C9A227" strokeWidth="1.5" />
        <text x="135" y="29" textAnchor="middle" fill="#9A6B12" className="svg-sans" fontSize="16" fontWeight="800">
          {CAMPAIGN_URL_TEXT}
        </text>
      </g>
      <image href={PLUTO_LOGO_URL} x="840" y="902" width="180" height="52" preserveAspectRatio="xMaxYMid meet" />
      <text x="1018" y="974" textAnchor="end" fill="#2B1B0E" className="svg-sans" fontSize="14" fontWeight="700">
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
export const CardSvgBold: React.FC<CardSvgArtboardProps> = ({ data, id = 'card-svg-bold', className = '', style = {} }) => {
  const c = prepare(data);
  const nameSize = fitFont(c.recipientName + '.', 520, 84, 40, 0.55);
  const { size: msgSize, lineH, lines: msgLines } = messageLayout(c.message, 36);
  const msgY = 395;
  const { pills, rowCount } = flowPills(c.traitLabels.map((t) => t.label), 505, 15, 16, 10, 2);
  const pillsY = msgY + (msgLines.length - 1) * lineH + 40;
  const senderY = pillsY + rowCount * 48 + 44;

  return (
    <svg id={id} viewBox="0 0 1080 1080" width="1080" height="1080" xmlns="http://www.w3.org/2000/svg" className={className} style={svgStyle(style)}>
      <defs>
        <FontDefs />
        <linearGradient id="boldPhotoFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor="#071A3A" stopOpacity="0" />
          <stop offset="1" stopColor="#071A3A" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="boldEdgeFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#071A3A" stopOpacity="0" />
          <stop offset="1" stopColor="#071A3A" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Background + photo */}
      <rect width="1080" height="1080" fill="#071A3A" />
      <image href={c.photoUrl} x="0" y="0" width="480" height="1080" preserveAspectRatio="xMidYMid slice" />
      <rect x="0" y="0" width="480" height="1080" fill="url(#boldPhotoFade)" />
      <rect x="400" y="0" width="80" height="1080" fill="url(#boldEdgeFade)" />
      <circle cx="1040" cy="60" r="230" fill="#2563EB" opacity="0.18" />
      <circle cx="1060" cy="40" r="120" fill="#00E5A3" opacity="0.12" />

      {/* Photo-side footer */}
      <text x="48" y="930" fill="#FFFFFF" className="svg-script" fontSize="34" fontWeight="700">
        <tspan x="48">Some people are part of your</tspan>
        <tspan x="48" dy="40">career history. Make sure they know.</tspan>
      </text>
      <text x="48" y="1035" fill="#00E5A3" className="svg-sans" fontSize="18" fontWeight="800">
        {HASHTAG}
      </text>

      {/* Headline */}
      <text x="520" y="140" fill="#00E5A3" className="svg-sans" fontSize="28" fontWeight="800" letterSpacing="0.22em">
        THANK YOU,
      </text>
      <text x="518" y={140 + nameSize * 0.98} fill="#FFFFFF" className="svg-sans" fontSize={nameSize} fontWeight="900" letterSpacing="-0.03em">
        {c.recipientName}
        <tspan fill="#00E5A3">.</tspan>
      </text>
      <g transform={`translate(520, ${178 + nameSize})`}>
        <rect width={Math.round(c.relationship.length * 13.4 + 40)} height="40" rx="20" fill="#2563EB" />
        <text x="18" y="26" fill="#FFFFFF" className="svg-sans" fontSize="16" fontWeight="800" letterSpacing="0.12em">
          {c.relationship.toUpperCase()}
        </text>
      </g>

      {/* Message with oversized quote marks */}
      <text x="512" y={msgY + 36} fill="#00E5A3" className="svg-sans" fontSize="120" fontWeight="900">
        “
      </text>
      <text x="520" y={msgY + 30} fill="#FFFFFF" className="svg-sans" fontSize={msgSize} fontWeight="500">
        {msgLines.map((l, i) => (
          <tspan key={i} x="520" dy={i === 0 ? 0 : lineH}>
            {l}
          </tspan>
        ))}
      </text>

      {/* Traits */}
      {pills.map((p) => (
        <g key={p.label} transform={`translate(${520 + p.x}, ${pillsY + 30 + p.row * 48})`}>
          <rect width={p.w} height="36" rx="18" fill="none" stroke="#00E5A3" strokeWidth="1.8" />
          <text x={p.w / 2} y="24" textAnchor="middle" fill="#E6FFF7" className="svg-sans" fontSize="15" fontWeight="700" letterSpacing="0.01em">
            {p.label}
          </text>
        </g>
      ))}

      {/* Sender */}
      <rect x="520" y={senderY + 22} width="40" height="4" rx="2" fill="#00E5A3" />
      <text x="520" y={senderY + 62} fill="#FFFFFF" className="svg-sans" fontSize="30" fontWeight="800">
        {c.senderName}
      </text>
      <text x="520" y={senderY + 92} fill="#94A3B8" className="svg-sans" fontSize="19" fontWeight="500">
        {c.senderRole}
      </text>

      {/* Right footer: link + logo */}
      <text x="520" y="945" fill="#CBD5E1" className="svg-sans" fontSize="15" fontWeight="600">
        Who went the extra mile for you?
      </text>
      <g transform="translate(520, 962)">
        <rect width="290" height="48" rx="24" fill="#FFFFFF" />
        <text x="145" y="30" textAnchor="middle" fill="#071A3A" className="svg-sans" fontSize="16" fontWeight="800">
          {CAMPAIGN_URL_TEXT}
        </text>
      </g>
      <rect x="830" y="932" width="200" height="86" rx="18" fill="#FFFFFF" />
      <image href={PLUTO_LOGO_URL} x="846" y="940" width="168" height="50" preserveAspectRatio="xMaxYMid meet" />
      <text x="1012" y="1006" textAnchor="end" fill="#071A3A" className="svg-sans" fontSize="13" fontWeight="700">
        by VerifyMe
      </text>
    </svg>
  );
};

/** Renders the card in the chosen style. */
export const CardArtboard: React.FC<CardSvgArtboardProps & { cardStyle?: string }> = ({ cardStyle, ...props }) => {
  if (cardStyle === 'warm') return <CardSvgWarm {...props} />;
  if (cardStyle === 'bold') return <CardSvgBold {...props} />;
  return <CardSvgArtboard {...props} />;
};
