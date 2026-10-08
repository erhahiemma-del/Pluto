import React from 'react';
import { PLUTO_LOGO_URL, CAMPAIGN_URL_TEXT } from '../constants/brand';

export interface CardData {
  recipientName?: string;
  relationship?: string;
  photoUrl?: string;
  selectedTraits?: string[];
  message?: string;
  creatorFirstName?: string;
  creatorLastName?: string;
  creatorJobTitle?: string;
  creatorCompany?: string;
}

export interface CardSvgArtboardProps {
  data: CardData;
  id?: string;
  debugMode?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

// Approved attribute chip definitions with 2-line stacked labels
export const getAttributeConfig = (trait: string) => {
  const norm = (trait || '').toLowerCase().trim();

  if (norm.includes('potential')) {
    return {
      color: '#00B884',
      line1: 'Believed in',
      line2: 'my potential',
      iconType: 'users',
    };
  }
  if (norm.includes('opportunities') || norm.includes('door') || norm.includes('first')) {
    return {
      color: '#1264E8',
      line1: 'Opened new',
      line2: 'opportunities',
      iconType: 'mountain',
    };
  }
  if (norm.includes('grow') || norm.includes('challenge') || norm.includes('lesson') || norm.includes('teach')) {
    return {
      color: '#009688',
      line1: 'Challenged',
      line2: 'me to grow',
      iconType: 'lightbulb',
    };
  }
  if (norm.includes('journey') || norm.includes('support') || norm.includes('difficult') || norm.includes('help')) {
    return {
      color: '#5B6BF5',
      line1: 'Supported',
      line2: 'my journey',
      iconType: 'heart',
    };
  }
  if (norm.includes('trust') || norm.includes('example') || norm.includes('lead') || norm.includes('inspire') || norm.includes('idea')) {
    return {
      color: '#00B4D8',
      line1: 'Led with',
      line2: 'trust',
      iconType: 'star',
    };
  }

  return {
    color: '#00B884',
    line1: 'A true',
    line2: 'people leader',
    iconType: 'award',
  };
};

// Word wrap helper for SVG text
export const wrapText = (text: string, maxCharsPerLine: number, maxLines: number = 4): string[] => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (!word) continue;
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) break;
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  return lines;
};

// Render SVG icon paths for chips
const renderChipIcon = (type: string, cx: number, cy: number) => {
  switch (type) {
    case 'mountain':
      return (
        <path
          d={`M ${cx - 7} ${cy + 6} L ${cx - 1} ${cy - 5} L ${cx + 3} ${cy + 1} L ${cx + 7} ${cy - 4} L ${cx + 9} ${cy + 6} Z`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      );
    case 'lightbulb':
      return (
        <g stroke="#FFFFFF" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <circle cx={cx} cy={cy - 2} r="5" />
          <line x1={cx - 3} y1={cy + 5} x2={cx + 3} y2={cy + 5} />
          <line x1={cx - 2} y1={cy + 8} x2={cx + 2} y2={cy + 8} />
        </g>
      );
    case 'heart':
      return (
        <path
          d={`M ${cx} ${cy + 6} C ${cx - 7} ${cy + 1} ${cx - 7} ${cy - 5} ${cx} ${cy - 2} C ${cx + 7} ${cy - 5} ${cx + 7} ${cy + 1} ${cx} ${cy + 6} Z`}
          fill="#FFFFFF"
        />
      );
    case 'star':
      return (
        <polygon
          points={`${cx},${cy - 7} ${cx + 2},${cy - 2} ${cx + 7},${cy - 2} ${cx + 3},${cy + 1} ${cx + 5},${cy + 7} ${cx},${cy + 3} ${cx - 5},${cy + 7} ${cx - 3},${cy + 1} ${cx - 7},${cy - 2} ${cx - 2},${cy - 2}`}
          fill="#FFFFFF"
        />
      );
    case 'award':
      return (
        <g stroke="#FFFFFF" strokeWidth="1.8" fill="none">
          <circle cx={cx} cy={cy - 2} r="5" />
          <path d={`M ${cx - 3} ${cy + 3} L ${cx - 5} ${cy + 8} L ${cx} ${cy + 6} L ${cx + 5} ${cy + 8} L ${cx + 3} ${cy + 3}`} />
        </g>
      );
    case 'users':
    default:
      return (
        <g stroke="#FFFFFF" strokeWidth="1.8" fill="none">
          <circle cx={cx - 3} cy={cy - 2} r="3" />
          <circle cx={cx + 4} cy={cy - 3} r="2.5" />
          <path d={`M ${cx - 7} ${cy + 6} C ${cx - 7} ${cy + 2} ${cx + 1} ${cy + 2} ${cx + 1} ${cy + 6}`} />
        </g>
      );
  }
};

/**
 * FIXED ART-DIRECTED MASTER SVG ARTBOARD (1080 × 1080) — USING CENTRAL PLUTO_LOGO_URL
 */
export const CardSvgArtboard: React.FC<CardSvgArtboardProps> = ({
  data,
  id = 'card-svg-master',
  debugMode = false,
  className = '',
  style = {},
}) => {
  // Recipient Name
  const rawName = (data.recipientName || 'John Doe').trim();
  const recipientName = rawName || 'John Doe';

  // Relationship
  const rawRel = (data.relationship || 'Colleague').trim();
  let relationshipText = rawRel;
  if (!relationshipText.toLowerCase().startsWith('my ')) {
    if (relationshipText.toLowerCase().includes('director')) {
      relationshipText = 'My Best Director Ever';
    } else {
      relationshipText = `My ${relationshipText}`;
    }
  }

  // Photo URL
  const photoUrl = data.photoUrl || '/african_executive_portrait.jpg';

  // Attributes (strictly 2 to 5)
  const rawTraits =
    data.selectedTraits && data.selectedTraits.length >= 2
      ? data.selectedTraits.slice(0, 5)
      : ['Challenged me to grow', 'Opened new opportunities'];

  // Message (max 40 words)
  const message =
    (data.message || '').trim() ||
    'You didn’t just give direction. You gave me opportunity, challenged me to grow, and believed in me when I doubted myself.';

  // Sender Name & Role
  const senderName =
    [data.creatorFirstName, data.creatorLastName].filter(Boolean).join(' ').trim() ||
    'Victoria Okodu';
  const senderRole = (data.creatorJobTitle || 'Developer').trim();

  // Font sizing for Recipient Name (74px -> min 58px)
  let nameFontSize = 74;
  let nameLines = [recipientName];
  if (recipientName.length > 22) {
    nameFontSize = 58;
    nameLines = wrapText(recipientName, 18, 2);
  } else if (recipientName.length > 15) {
    nameFontSize = 65;
    nameLines = wrapText(recipientName, 15, 2);
  }

  // Message lines (26px, wrap ~40 chars per line, max 4 lines)
  const messageFontSize = message.length > 160 ? 24 : 26;
  const messageLines = wrapText(message, 40, 4);

  let row1Chips: string[] = [];
  let row2Chips: string[] = [];

  if (rawTraits.length <= 3) {
    row1Chips = rawTraits;
  } else if (rawTraits.length === 4) {
    row1Chips = rawTraits.slice(0, 2);
    row2Chips = rawTraits.slice(2, 4);
  } else {
    row1Chips = rawTraits.slice(0, 3);
    row2Chips = rawTraits.slice(3, 5);
  }

  return (
    <svg
      id={id}
      viewBox="0 0 1080 1080"
      width="1080"
      height="1080"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        aspectRatio: '1 / 1',
        borderRadius: '36px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(11, 27, 61, 0.22)',
        ...style,
      }}
    >
      <defs>
        <style type="text/css">
          {`
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Plus+Jakarta+Sans:wght@400;500;700;800;900&display=swap');
            .svg-sans { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; }
            .svg-script { font-family: 'Caveat', cursive, system-ui; }
          `}
        </style>

        <filter id="bgBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="65" />
        </filter>
        <filter id="portraitShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="16" stdDeviation="18" floodColor="#004D73" floodOpacity="0.12" />
        </filter>

        <linearGradient id="portraitBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A389" />
          <stop offset="50%" stopColor="#00B4D8" />
          <stop offset="100%" stopColor="#38B6FF" />
        </linearGradient>

        <linearGradient id="waveTopGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00C48C" />
          <stop offset="45%" stopColor="#00D2B4" />
          <stop offset="100%" stopColor="#00A389" />
        </linearGradient>
        <linearGradient id="waveBodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#004B6E" />
          <stop offset="100%" stopColor="#00273B" />
        </linearGradient>

        <clipPath id="portraitCircleClip">
          <circle cx="230" cy="325" r="165" />
        </clipPath>
      </defs>

      {/* A. BACKGROUND */}
      <rect x="0" y="0" width="1080" height="1080" fill="#FDFDFC" />

      <g opacity="0.85">
        <circle cx="100" cy="100" r="220" fill="#D9F1FD" opacity="0.18" filter="url(#bgBlur)" />
        <circle cx="960" cy="120" r="240" fill="#E1F3FE" opacity="0.16" filter="url(#bgBlur)" />
        <circle cx="80" cy="500" r="160" fill="#E2F8F2" opacity="0.14" filter="url(#bgBlur)" />
        <circle cx="980" cy="450" r="180" fill="#E8F4FD" opacity="0.12" filter="url(#bgBlur)" />
      </g>

      {/* B. PORTRAIT */}
      <circle cx="230" cy="325" r="180" fill="#D8F1FD" filter="url(#portraitShadow)" />
      <circle cx="230" cy="325" r="168" fill="#FFFFFF" stroke="url(#portraitBorderGrad)" strokeWidth="4" />
      <image href={photoUrl} x="65" y="160" width="330" height="330" preserveAspectRatio="xMidYMid slice" clipPath="url(#portraitCircleClip)" />

      {/* DECORATIVE ACCENT */}
      <g stroke="#00C48C" strokeWidth="5.5" strokeLinecap="round">
        <line x1="285" y1="122" x2="295" y2="92" />
        <line x1="302" y1="116" x2="312" y2="86" />
        <line x1="319" y1="120" x2="329" y2="92" />
      </g>

      {/* C. RECIPIENT TEXT ZONE */}
      <text x="420" y="130" fill="#0B1E49" className="svg-sans" fontSize="74" fontWeight="800" letterSpacing="-0.025em">
        Thank You,
      </text>

      <text x="420" y={nameLines.length > 1 ? 190 : 202} fill="#1068EB" className="svg-sans" fontSize={nameFontSize} fontWeight="800" letterSpacing="-0.025em">
        {nameLines.map((line, idx) => (
          <tspan key={idx} x="420" dy={idx === 0 ? 0 : nameFontSize * 1.04}>
            {line}{idx === nameLines.length - 1 ? '.' : ''}
          </tspan>
        ))}
      </text>

      {/* RELATIONSHIP */}
      <text x="420" y="260" fill="#1068EB" className="svg-script" fontSize="42" fontWeight="700">
        {relationshipText}.
      </text>
      <path d="M 420 270 Q 540 266 660 270" stroke="#00A86B" strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* D. ATTRIBUTE CHIPS (h = 52px) */}
      <g>
        {row1Chips.map((trait, idx) => {
          const config = getAttributeConfig(trait);
          const chipX = 420 + idx * 190;

          return (
            <g key={trait} transform={`translate(${chipX}, 302)`}>
              <rect x="0" y="0" width="180" height="52" rx="26" ry="26" fill="#EDF7FD" stroke="#DCEEFB" strokeWidth="1.5" />
              <circle cx="25" cy="26" r="15" fill={config.color} />
              {renderChipIcon(config.iconType, 25, 26)}
              <text x="48" y="22" fill="#0B1B3D" className="svg-sans" fontSize="13.5" fontWeight="800">
                {config.line1}
              </text>
              <text x="48" y="37" fill="#0B1B3D" className="svg-sans" fontSize="13.5" fontWeight="800">
                {config.line2}
              </text>
            </g>
          );
        })}

        {row2Chips.map((trait, idx) => {
          const config = getAttributeConfig(trait);
          const chipX = 420 + idx * 190;

          return (
            <g key={trait} transform={`translate(${chipX}, 362)`}>
              <rect x="0" y="0" width="180" height="52" rx="26" ry="26" fill="#EDF7FD" stroke="#DCEEFB" strokeWidth="1.5" />
              <circle cx="25" cy="26" r="15" fill={config.color} />
              {renderChipIcon(config.iconType, 25, 26)}
              <text x="48" y="22" fill="#0B1B3D" className="svg-sans" fontSize="13.5" fontWeight="800">
                {config.line1}
              </text>
              <text x="48" y="37" fill="#0B1B3D" className="svg-sans" fontSize="13.5" fontWeight="800">
                {config.line2}
              </text>
            </g>
          );
        })}
      </g>

      {/* E. MESSAGE ZONE (26px) */}
      <text x="420" y="442" fill="#1E293B" className="svg-sans" fontSize={messageFontSize} fontWeight="400">
        {messageLines.map((line, idx) => (
          <tspan key={idx} x="420" dy={idx === 0 ? 0 : 35}>
            {line}
          </tspan>
        ))}
      </text>

      {/* F. SENDER ZONE (32px name, 20px role) */}
      <rect x="420" y="582" width="45" height="4" rx="2" fill="#00A86B" />
      <text x="420" y="622" fill="#0B1E49" className="svg-sans" fontSize="32" fontWeight="800">
        {senderName}
      </text>
      <text x="420" y="654" fill="#64748B" className="svg-sans" fontSize="20" fontWeight="500">
        {senderRole}
      </text>

      {/* G. FOOTER WAVES (y = 735 → 1080) */}
      <g transform="translate(0, 735)">
        <path d="M 0 55 C 240 10, 500 85, 780 30 C 920 8, 1020 22, 1080 40 L 1080 345 L 0 345 Z" fill="#00D2B4" opacity="0.4" />
        <path d="M 0 75 C 180 35, 420 105, 720 52 C 880 26, 990 42, 1080 58 L 1080 345 L 0 345 Z" fill="url(#waveBodyGrad)" />
        <path d="M 0 75 C 180 35, 420 105, 720 52 C 880 26, 990 42, 1080 58" stroke="url(#waveTopGrad)" strokeWidth="8" strokeLinecap="round" fill="none" />
      </g>

      {/* FOOTER CONTENT (Vertically centered) */}
      {/* LEFT FOOTER */}
      <text x="65" y="855" fill="#FFFFFF" className="svg-script" fontSize="34" fontWeight="700">
        <tspan x="65">Some people are part of your</tspan>
        <tspan x="65" dy="40">career history. Make sure they know.</tspan>
      </text>
      <path d="M 65 908 Q 220 904 410 908" stroke="#00E5A3" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* CENTRE FOOTER */}
      <text x="515" y="828" fill="#FFFFFF" fillOpacity="0.95" className="svg-sans" fontSize="17" fontWeight="500">
        Want to thank someone who went the extra mile?
      </text>
      <g transform="translate(510, 850)">
        <rect x="0" y="0" width="318" height="52" rx="26" fill="#FFFFFF" filter="url(#portraitShadow)" />
        <g transform="translate(16, 19)" stroke="#1068EB" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M 6 3 A 3 3 0 0 1 10 7 L 8 9 A 3 3 0 0 1 4 5" />
          <path d="M 8 11 A 3 3 0 0 1 4 7 L 6 5 A 3 3 0 0 1 10 9" />
          <line x1="5" y1="9" x2="9" y2="5" />
        </g>
        <text x="38" y="32" fill="#1068EB" className="svg-sans" fontSize="14" fontWeight="800" letterSpacing="-0.01em">
          {CAMPAIGN_URL_TEXT}
        </text>
      </g>

      {/* RIGHT FOOTER — USING CENTRAL PLUTO_LOGO_URL */}
      <image
        href={PLUTO_LOGO_URL}
        x="845"
        y="830"
        width="170"
        height="55"
        preserveAspectRatio="xMidYMid meet"
      />
      <text x="1015" y="902" textAnchor="end" fill="#E2E8F0" className="svg-sans" fontSize="15" fontWeight="700" letterSpacing="0.01em">
        by VerifyMe
      </text>
      <text x="835" y="930" fill="#00E5A3" className="svg-sans" fontSize="15" fontWeight="800" letterSpacing="-0.01em">
        #ThoseWhoWentTheExtraMile
      </text>

      {/* DEBUG MODE */}
      {debugMode && (
        <g pointerEvents="none">
          <rect x="50" y="145" width="360" height="360" fill="none" stroke="#EF4444" strokeWidth="2" strokeDasharray="6,4" />
          <rect x="420" y="100" width="590" height="195" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6,4" />
          <rect x="420" y="302" width="590" height="120" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="6,4" />
          <rect x="420" y="442" width="580" height="135" fill="none" stroke="#8B5CF6" strokeWidth="2" strokeDasharray="6,4" />
          <rect x="420" y="582" width="580" height="90" fill="none" stroke="#EC4899" strokeWidth="2" strokeDasharray="6,4" />
          <rect x="0" y="735" width="1080" height="345" fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="6,4" />
        </g>
      )}
    </svg>
  );
};
