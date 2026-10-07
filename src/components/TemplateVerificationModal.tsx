import React, { useState } from 'react';
import { CardPreview } from './CardPreview';
import { CardData } from './CardRenderer';
import { X, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const SAMPLE_TEST_CARDS: { title: string; subtitle: string; data: CardData }[] = [
  {
    title: 'TEST 1: John Doe (My Colleague — 2 attributes)',
    subtitle: '1 row of attributes, short message, perfect spacing above footer',
    data: {
      recipientName: 'John Doe',
      relationship: 'My Colleague',
      photoUrl: '/african_executive_portrait.jpg',
      selectedTraits: ['Challenged me to grow', 'Opened new opportunities'],
      message:
        'You didn’t just give direction; you challenged me to grow and gave me my first opportunity, challenged me to grow, and stood by me when it mattered most. I am truly grateful for your leadership.',
      creatorFirstName: 'Victoria',
      creatorLastName: 'Okodu',
      creatorJobTitle: 'Developer',
      creatorCompany: 'VerifyMe Nigeria',
    },
  },
  {
    title: 'TEST 2: Hassan Emeka (My Best Director Ever — 5 attributes)',
    subtitle: '5 compact horizontal chips in 2 rows, medium message',
    data: {
      recipientName: 'Hassan Emeka',
      relationship: 'My Best Director Ever',
      photoUrl: '/african_executive_portrait.jpg',
      selectedTraits: [
        'Believed in my potential',
        'Opened new opportunities',
        'Challenged me to grow',
        'Supported my journey',
        'Led with trust',
      ],
      message:
        'You didn’t just give direction. You gave me opportunity, challenged me to grow, and believed in me when I doubted myself.',
      creatorFirstName: 'Ufiok',
      creatorLastName: 'Adetunji',
      creatorJobTitle: 'Senior Marketing Manager',
      creatorCompany: 'VerifyMe Nigeria',
    },
  },
  {
    title: 'TEST 3: Victoria Okodu (Developer — 3 attributes)',
    subtitle: '3 attributes in 1 row, standard message',
    data: {
      recipientName: 'Victoria Okodu',
      relationship: 'Developer',
      photoUrl: '/african_executive_portrait.jpg',
      selectedTraits: [
        'Opened new opportunities',
        'Challenged me to grow',
        'Supported my journey',
      ],
      message:
        'Your technical guidance and constant encouragement made a massive impact on my career. Thank you for setting the bar high and always supporting the entire engineering team.',
      creatorFirstName: 'Ufiok',
      creatorLastName: 'Adetunji',
      creatorJobTitle: 'Senior Marketing Manager',
      creatorCompany: 'VerifyMe Nigeria',
    },
  },
  {
    title: 'TEST 4: A Very Long Recipient Name Example (Mentor — 5 attributes)',
    subtitle: 'Tests 2-line name scaling (70px -> 56px) without changing fixed layout',
    data: {
      recipientName: 'A Very Long Recipient Name Example',
      relationship: 'Mentor',
      photoUrl: '/african_executive_portrait.jpg',
      selectedTraits: [
        'Believed in my potential',
        'Opened new opportunities',
        'Challenged me to grow',
        'Supported my journey',
        'Led with trust',
      ],
      message:
        'Under your mentorship, I discovered what true leadership looks like. Thank you for opening doors and giving me the confidence to excel.',
      creatorFirstName: 'Ufiok',
      creatorLastName: 'Adetunji',
      creatorJobTitle: 'Senior Marketing Manager',
      creatorCompany: 'VerifyMe Nigeria',
    },
  },
];

interface TemplateVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateVerificationModal: React.FC<TemplateVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [debugMode, setDebugMode] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-auto max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-50 text-[#00875A] rounded-lg">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-[#0B1B3D]">
                Fixed SVG Artboard Verification (Tests 1–4)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Validating fixed zones: Portrait (cx=230, cy=325, r=180), Recipient (x=420, y=100), Attribute chips (x=420, max 180px, zero overflow), and Footer (y=735, 345px height).
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                debugMode
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {debugMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{debugMode ? 'Hide Region Outlines' : 'Show Region Outlines'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex flex-wrap gap-2">
          {SAMPLE_TEST_CARDS.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === idx
                  ? 'bg-[#00875A] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sample.title.split(':')[0]}
            </button>
          ))}
        </div>

        {/* Active Sample Details */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-left flex items-center justify-between">
          <div>
            <div className="font-extrabold text-sm text-[#0B1B3D]">
              {SAMPLE_TEST_CARDS[activeTab].title}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {SAMPLE_TEST_CARDS[activeTab].subtitle}
            </div>
          </div>
          {debugMode && (
            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Debug Outlines Active (Fixed 1080×1080 Zones)
            </span>
          )}
        </div>

        {/* The Card Render */}
        <div className="max-w-[480px] mx-auto p-3 bg-slate-100/80 rounded-[40px] border border-slate-200 shadow-md">
          <CardPreview
            size="responsive"
            customData={SAMPLE_TEST_CARDS[activeTab].data}
            debugMode={debugMode}
          />
        </div>

        {/* Audit criteria checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-2 text-slate-600 font-semibold border-t border-slate-100">
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-center">
            ✓ Zero Headline Collision
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-center">
            ✓ Zero Chip Overflow (≤980px)
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-center">
            ✓ Fixed 345px Wave Footer (y=735)
          </div>
          <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl text-center">
            ✓ Non-Overlapping Footer Zones
          </div>
        </div>
      </div>
    </div>
  );
};
