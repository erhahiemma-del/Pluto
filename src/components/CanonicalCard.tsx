import React from 'react';
import {
  Users,
  Mountain,
  Lightbulb,
  HeartHandshake,
  Star,
  Award,
  Link as LinkIcon,
  ArrowRight
} from 'lucide-react';

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

interface CanonicalCardProps {
  data: CardData;
  id?: string;
}

// Canonical attribute configuration matching Section 8 & Section 15
export const getCanonicalAttributeConfig = (attr: string) => {
  const norm = (attr || '').toLowerCase().trim();

  if (norm.includes('potential')) {
    return { icon: Users, color: '#00B884', label: 'Believed in my potential' };
  }
  if (norm.includes('opportunities') || norm.includes('door') || norm.includes('first')) {
    return { icon: Mountain, color: '#1264E8', label: 'Opened new opportunities' };
  }
  if (norm.includes('grow') || norm.includes('challenge') || norm.includes('lesson') || norm.includes('teach')) {
    return { icon: Lightbulb, color: '#009688', label: 'Challenged me to grow' };
  }
  if (norm.includes('journey') || norm.includes('support') || norm.includes('difficult') || norm.includes('help')) {
    return { icon: HeartHandshake, color: '#5B6BF5', label: 'Supported my journey' };
  }
  if (norm.includes('trust') || norm.includes('example') || norm.includes('lead') || norm.includes('inspire') || norm.includes('idea')) {
    return { icon: Star, color: '#00B4D8', label: 'Led with trust' };
  }

  // Fallback approved standard chip
  return { icon: Award, color: '#00B884', label: 'A true people leader' };
};

/**
 * FIXED ART-DIRECTED 1080 × 1080 MASTER CANVAS
 * 
 * 1. Master Canvas: 1080 × 1080 px, 1:1 Aspect Ratio, 50px safe margins.
 * 2. Background Layer: Very light warm white with subtle organic pastel gradients (10-25% opacity).
 * 3. Primary Grid:
 *    - Left Visual Zone (~42%): Large Circular Portrait (400px diameter, x: 60px, y: 140px).
 *    - Right Content Zone (~54%): x: 485px, w: 535px, locked vertical positions.
 * 4. Typography:
 *    - "Thank You," (68px navy)
 *    - "[Recipient Name]." (70px Pluto blue)
 *    - "My [Relationship]." (42px handwriting script + green brush underline)
 *    - 2–5 Horizontal Attribute Chips (height: 50px, width: ~160–210px)
 *    - Appreciation Message (25px, left-aligned, line-height 1.4)
 *    - Sender (Green bar + 30px bold navy name + 20px slate role)
 * 5. Wave Footer (Y: 760–1080 px, height 320px):
 *    - Left: Green capsule mark + "Some people are part of your career history. Make sure they know."
 *            + "Want to thank someone who went the extra mile?" + White CTA Pill "pluto.verifyme.ng/ExtraMile →"
 *    - Right: 3D Isometric Pluto Cube Logo + "PLUTO by VerifyMe" + "#ThoseWhoWentTheExtraMile" (mint green)
 */
export const CanonicalCard: React.FC<CanonicalCardProps> = ({ data, id }) => {
  // 1. Recipient Name
  const rawName = (data.recipientName || 'John Doe').trim();
  const recipientName = rawName || 'John Doe';

  // 2. Relationship Line
  const rawRel = (data.relationship || 'Colleague').trim();
  let relationshipText = rawRel;
  if (!relationshipText.toLowerCase().startsWith('my ')) {
    if (relationshipText.toLowerCase().includes('director')) {
      relationshipText = 'My Best Director Ever';
    } else {
      relationshipText = `My ${relationshipText}`;
    }
  }

  // 3. Recipient Photo
  const photoUrl = data.photoUrl || '/african_executive_portrait.jpg';

  // 4. Attributes (strictly 2 to 5)
  const rawTraits = data.selectedTraits && data.selectedTraits.length >= 2
    ? data.selectedTraits.slice(0, 5)
    : ['Challenged me to grow', 'Opened new opportunities'];

  // 5. Message (max 45 words)
  const message = (data.message || '').trim() ||
    'You didn’t just give direction; you challenged me to grow and gave me my first opportunity, challenged me to grow, and stood by me when it mattered most. I am truly grateful for your leadership.';

  // 6. Sender Name & Role
  const senderName = [data.creatorFirstName, data.creatorLastName].filter(Boolean).join(' ').trim() ||
    'Victoria Okodu';
  const senderRole = (data.creatorJobTitle || 'Developer').trim();

  // Controlled font sizing for long recipient names to guarantee fit in 2 lines
  const getRecipientNameFontSize = (name: string) => {
    if (name.length > 28) return '46px';
    if (name.length > 18) return '56px';
    if (name.length > 12) return '64px';
    return '70px';
  };

  return (
    <div
      id={id}
      style={{
        width: '1080px',
        height: '1080px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        borderRadius: '36px',
        boxShadow: '0 25px 60px -15px rgba(11, 27, 61, 0.25)',
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ==================================================================
          2. BACKGROUND LAYER — Subtle abstract shapes (10–25% opacity)
          ================================================================== */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {/* TOP LEFT: soft pale blue circular gradient */}
        <div
          style={{
            position: 'absolute',
            top: '-70px',
            left: '-70px',
            width: '440px',
            height: '440px',
            borderRadius: '50%',
            backgroundColor: '#D9F1FD',
            opacity: 0.22,
            filter: 'blur(75px)',
          }}
        />
        {/* TOP RIGHT: soft pale blue/teal circular gradient */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '480px',
            height: '480px',
            borderRadius: '50%',
            backgroundColor: '#E1F3FE',
            opacity: 0.18,
            filter: 'blur(85px)',
          }}
        />
        {/* MID LEFT: very light teal/blue organic shape */}
        <div
          style={{
            position: 'absolute',
            top: '360px',
            left: '-60px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            backgroundColor: '#E2F8F2',
            opacity: 0.16,
            filter: 'blur(70px)',
          }}
        />
        {/* MID RIGHT: very subtle pale blue shape */}
        <div
          style={{
            position: 'absolute',
            top: '280px',
            right: '-50px',
            width: '340px',
            height: '340px',
            borderRadius: '50%',
            backgroundColor: '#E8F4FD',
            opacity: 0.14,
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* ==================================================================
          4. RECIPIENT PORTRAIT (Left side: X = 60px, Y = 140px, Diameter ~400px)
          ================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: '60px',
          top: '140px',
          width: '400px',
          height: '400px',
          zIndex: 10,
        }}
      >
        {/* 5. DECORATIVE MARK: 3-stroke green accent above portrait */}
        <div
          style={{
            position: 'absolute',
            top: '-55px',
            right: '25px',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <line x1="12" y1="46" x2="22" y2="16" stroke="#00C48C" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="28" y1="40" x2="38" y2="8" stroke="#00C48C" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="44" y1="44" x2="54" y2="16" stroke="#00C48C" strokeWidth="5.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Circular Outer Frame with Soft Glow (~25–35px) */}
        <div
          style={{
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            padding: '16px',
            backgroundColor: '#D8F1FD',
            boxShadow: '0 16px 40px rgba(0, 77, 115, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner ring: 2–4px teal/blue */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              padding: '4px',
              background: 'linear-gradient(135deg, #00A389 0%, #00B4D8 50%, #38B6FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Real Uploaded Photo */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                backgroundColor: '#F1F5F9',
              }}
            >
              <img
                src={photoUrl}
                alt={recipientName}
                crossOrigin="anonymous"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  display: 'block',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================
          6–10. RIGHT CONTENT ZONE (X: 485px, Width: 535px, Y: 90px–750px)
          ================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: '485px',
          width: '535px',
          top: '90px',
          zIndex: 10,
          textAlign: 'left',
        }}
      >
        {/* 6. RECIPIENT HEADLINE */}
        <div style={{ marginBottom: '6px' }}>
          <div
            style={{
              fontSize: '68px',
              fontWeight: 900,
              color: '#0B1B3D',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
            }}
          >
            Thank You,
          </div>
          <div
            style={{
              fontSize: getRecipientNameFontSize(recipientName),
              fontWeight: 900,
              color: '#1068EB',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              marginTop: '2px',
              wordBreak: 'break-word',
            }}
          >
            {recipientName}.
          </div>
        </div>

        {/* 7. RELATIONSHIP LINE */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
          <span
            className="font-handwriting"
            style={{
              fontSize: '42px',
              fontWeight: 700,
              color: '#1068EB',
              lineHeight: 1.15,
              display: 'block',
            }}
          >
            {relationshipText}.
          </span>
          {/* Thin Pluto green brush stroke underline */}
          <div style={{ width: '300px', marginTop: '-6px', color: '#00A86B' }}>
            <svg viewBox="0 0 300 12" fill="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
              <path
                d="M4 8 C 75 2, 225 2, 296 7"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* 8. ATTRIBUTE CHIPS (Compact horizontal pills, max height ~120px) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            width: '535px',
            maxHeight: '130px',
            marginBottom: '20px',
          }}
        >
          {rawTraits.map((trait) => {
            const config = getCanonicalAttributeConfig(trait);
            const Icon = config.icon;

            return (
              <div
                key={trait}
                style={{
                  backgroundColor: '#EDF7FD',
                  border: '1.5px solid #DCEEFB',
                  borderRadius: '9999px',
                  padding: '7px 16px 7px 9px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  height: '50px',
                  boxSizing: 'border-box',
                }}
              >
                {/* Small circular icon: 26px */}
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: config.color,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} strokeWidth={2.4} />
                </div>

                {/* Readable label */}
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#0B1B3D',
                    lineHeight: 1.15,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* 9. APPRECIATION MESSAGE (25px, left-aligned, line-height 1.4, width: 525px) */}
        <div
          style={{
            width: '525px',
            fontSize: '25px',
            fontWeight: 400,
            color: '#1E293B',
            lineHeight: 1.4,
            marginBottom: '20px',
          }}
        >
          {message}
        </div>

        {/* 10. SENDER DETAILS (Directly beneath message) */}
        <div>
          {/* Short green horizontal accent bar */}
          <div
            style={{
              width: '48px',
              height: '5px',
              backgroundColor: '#00A86B',
              borderRadius: '9999px',
              marginBottom: '10px',
            }}
          />
          <div
            style={{
              fontSize: '30px',
              fontWeight: 900,
              color: '#0B1B3D',
              lineHeight: 1.1,
            }}
          >
            {senderName}
          </div>
          <div
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: '#64748B',
              marginTop: '4px',
            }}
          >
            {senderRole}
          </div>
        </div>
      </div>

      {/* ==================================================================
          11–14. FOOTER WAVE (Y: 760–1080 px, Height: 320 px)
          ================================================================== */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '320px',
          zIndex: 15,
        }}
      >
        {/* Layered Wave SVG (mint, teal, deep navy) */}
        <svg
          viewBox="0 0 1080 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%', display: 'block' }}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Luminous teal/cyan gradient for wave top edge */}
            <linearGradient id="canonWaveTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00C48C" />
              <stop offset="45%" stopColor="#00D2B4" />
              <stop offset="100%" stopColor="#00A389" />
            </linearGradient>

            {/* Deep ocean navy gradient for wave fill */}
            <linearGradient id="canonWaveBody" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#004B6E" />
              <stop offset="100%" stopColor="#00273B" />
            </linearGradient>

            {/* Soft subtle underwave */}
            <linearGradient id="canonUnderWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00D2B4" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#00B4D8" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Layer 1: Back subtle underwave */}
          <path
            d="M0 65 C 220 18, 480 100, 780 38 C 920 12, 1020 28, 1080 50 L 1080 320 L 0 320 Z"
            fill="url(#canonUnderWave)"
          />

          {/* Layer 2: Main sweeping deep navy wave */}
          <path
            d="M0 88 C 180 46, 420 125, 720 68 C 880 36, 990 54, 1080 72 L 1080 320 L 0 320 Z"
            fill="url(#canonWaveBody)"
          />

          {/* Layer 3: Luminous top stroke */}
          <path
            d="M0 88 C 180 46, 420 125, 720 68 C 880 36, 990 54, 1080 72"
            stroke="url(#canonWaveTop)"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </svg>

        {/* Footer Content: Exact Grid matching reference */}
        <div
          style={{
            position: 'absolute',
            left: '55px',
            right: '55px',
            bottom: '30px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            color: '#FFFFFF',
          }}
        >
          {/* 12. LEFT FOOTER ZONE: Green Capsule + Script Statement + CTA Link */}
          <div style={{ width: '560px' }}>
            {/* Statement Row with Vertical Green Capsule */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
              {/* Green capsule marker */}
              <div
                style={{
                  width: '8px',
                  height: '56px',
                  backgroundColor: '#00D2B4',
                  borderRadius: '9999px',
                  flexShrink: 0,
                  marginTop: '4px',
                }}
              />
              <div>
                <div
                  className="font-handwriting"
                  style={{
                    fontSize: '34px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    lineHeight: 1.15,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  Some people are part of your
                </div>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div
                    className="font-handwriting"
                    style={{
                      fontSize: '34px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      lineHeight: 1.15,
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    career history. Make sure they know.
                  </div>
                  {/* Subtle mint underline stroke */}
                  <div style={{ width: '100%', marginTop: '-4px', color: '#00E5A3', opacity: 0.9 }}>
                    <svg viewBox="0 0 200 8" fill="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
                      <path d="M2 5 C 40 2, 140 2, 198 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* 13. FOOTER CTA: Prompt + White Pill CTA */}
            <div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: 'rgba(255, 255, 255, 0.95)',
                  lineHeight: 1.2,
                  marginBottom: '10px',
                }}
              >
                Want to thank someone who went the extra mile?
              </div>

              {/* White CTA Pill Button with Visible URL */}
              <a
                href="http://pluto.verifyme.ng/ExtraMile"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '9999px',
                  height: '52px',
                  padding: '0 22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
                  textDecoration: 'none',
                }}
              >
                <LinkIcon size={18} color="#1068EB" strokeWidth={2.4} />
                <span
                  style={{
                    fontSize: '16.5px',
                    fontWeight: 800,
                    color: '#1068EB',
                    letterSpacing: '-0.01em',
                  }}
                >
                  pluto.verifyme.ng/ExtraMile
                </span>
                <ArrowRight size={18} color="#1068EB" strokeWidth={2.4} />
              </a>
            </div>
          </div>

          {/* 14. BRAND LOCKUP (FAR RIGHT FOOTER) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: '16px',
            }}
          >
            {/* Real Pluto Logo: 3D Isometric Cube + PLUTO by VerifyMe */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* 3D Isometric Cube Icon */}
              <svg width="50" height="50" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
                {/* Top face: light lavender */}
                <polygon points="16,3 29,10 16,17 3,10" fill="#B0C4DE" />
                {/* Left face: purple/blue */}
                <polygon points="3,10 16,17 16,30 3,23" fill="#6366F1" />
                {/* Right face: deep dark navy/indigo */}
                <polygon points="16,17 29,10 29,23 16,30" fill="#312E81" />
              </svg>
              <div style={{ lineHeight: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '30px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                  PLUTO
                </div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: '3px' }}>
                  by VerifyMe
                </div>
              </div>
            </div>

            {/* Campaign Hashtag under logo */}
            <div
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#00E5A3',
                letterSpacing: '-0.01em',
                marginTop: '16px',
                textAlign: 'center',
              }}
            >
              #ThoseWhoWentTheExtraMile
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
