import React, { useState, useEffect } from 'react';
import { PlutoLogo } from './PlutoLogo';
import { CardPreview } from './CardPreview';

// Fixed sample for the homepage hero, so it never shows a visitor's half-finished card
const HERO_SAMPLE = {
  recipientName: 'Adaeze Okafor',
  relationship: 'My Manager',
  photoUrl: '/african_executive_portrait.jpg',
  selectedTraits: ['Believed in my potential', 'Opened new opportunities', 'Challenged me to grow'],
  message: 'You saw something in me before I did. Thank you for every push, every open door and every honest word along the way.',
  creatorFirstName: 'Tunde',
  creatorLastName: 'Bello',
  creatorJobTitle: 'Product Analyst',
};
import { TemplateVerificationModal } from './TemplateVerificationModal';
import {
  ArrowRight,
  User,
  Mail,
  Share2,
  Users,
  Flag,
  Lightbulb,
  Check,
  Copy
} from 'lucide-react';

interface HomepageProps {
  onStartCreation: () => void;
  onOpenAdmin?: () => void;
}

export const Homepage: React.FC<HomepageProps> = ({
  onStartCreation,
  onOpenAdmin,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [copiedSocial, setCopiedSocial] = useState<string | null>(null);
  const [arrowHovered, setArrowHovered] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const campaignUrl = typeof window !== 'undefined' ? window.location.origin : 'https://pluto.verifyme.ng';
  const campaignShareText = encodeURIComponent(
    'Some people are part of your career history. Make sure they know. Create a personalised thank-you card for someone who went the extra mile for you with Pluto by VerifyMe! #ThoseWhoWentTheExtraMile'
  );

  const handleShare = (platform: 'linkedin' | 'facebook' | 'whatsapp' | 'instagram') => {
    if (platform === 'linkedin') {
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(campaignUrl)}`,
        '_blank',
        'width=600,height=600'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(campaignUrl)}&quote=${campaignShareText}`,
        '_blank',
        'width=600,height=600'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://api.whatsapp.com/send?text=${campaignShareText}%20${encodeURIComponent(campaignUrl)}`,
        '_blank'
      );
    } else if (platform === 'instagram') {
      navigator.clipboard?.writeText(
        `Some people are part of your career history. Make sure they know. Create your card at ${campaignUrl} #ThoseWhoWentTheExtraMile`
      );
      setCopiedSocial('instagram');
      setTimeout(() => setCopiedSocial(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 relative overflow-hidden font-sans selection:bg-teal-100 selection:text-teal-900">
      {/* Ambient Background Wave & Gradient Shapes (Matching reference image) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft blue glow top-left */}
        <div
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full blur-[100px] opacity-45"
          style={{ background: 'radial-gradient(circle, #D8E7FF 0%, rgba(216,231,255,0) 70%)' }}
        />
        {/* Soft mint/teal wave bottom-left */}
        <div
          className="absolute top-[35%] -left-[12%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full blur-[120px] opacity-35"
          style={{ background: 'radial-gradient(circle, #CCFBF1 0%, rgba(204,251,241,0) 70%)' }}
        />
        {/* Soft pastel ambient wave on bottom right */}
        <div
          className="absolute -bottom-[10%] right-[5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full blur-[110px] opacity-25"
          style={{ background: 'radial-gradient(circle, #BAE6FD 0%, rgba(186,230,253,0) 70%)' }}
        />
      </div>

      {/* STICKY MINIMAL HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-100 py-3'
            : 'bg-transparent py-5 sm:py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo on top-left */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="focus:outline-none flex items-center group cursor-pointer"
            >
              <PlutoLogo size="md" />
            </button>
          </div>

          {/* Minimal Navigation Right */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            <button
              onClick={onStartCreation}
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors hidden sm:inline-block cursor-pointer"
            >
              Create a Card
            </button>

            <button
              onClick={() => setShowVerifyModal(true)}
              className="text-xs sm:text-sm font-semibold text-[#00875A] hover:text-[#00704A] transition-colors hidden md:inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Verify 5 Samples</span>
            </button>

            {onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors px-2 py-1 rounded-md"
                title="Internal Campaign Analytics"
              >
                Analytics
              </button>
            )}

            <button
              onClick={onStartCreation}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-md shadow-slate-900/10 hover:shadow-lg active:scale-95 group cursor-pointer"
            >
              <span>Create Your Card</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative z-10 pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* LEFT COLUMN: Campaign Messaging */}
            <div className="lg:col-span-6 space-y-7 sm:space-y-8 pr-0 lg:pr-4">
              {/* Eyebrow */}
              <div className="inline-block">
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.18em] text-[#1D4ED8]">
                  WHO HELPED YOU GET HERE?
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-[2.6rem] sm:text-[3.5rem] lg:text-[4.2rem] font-black text-[#0F172A] tracking-[-0.03em] leading-[1.07]">
                Some people are
                <br />
                part of your
                <br />
                career history.
                <br />
                <span className="text-[#1D4ED8]">Make sure they know.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl font-normal">
                Create a personalised thank-you card for someone who went the extra mile for you.
              </p>

              {/* Primary CTA Button */}
              <div className="pt-2">
                <button
                  onClick={onStartCreation}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-4.5 rounded-full bg-[#00875A] hover:bg-[#00704A] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg shadow-[#00875A]/25 hover:shadow-xl hover:shadow-[#00875A]/35 hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
                >
                  <span>CREATE MY CARD</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-200" />
                </button>
              </div>

              {/* Campaign Hashtag Lockup matching reference image */}
              <div className="pt-2 flex items-center">
                <div className="inline-flex flex-col">
                  <span className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
                    #ThoseWhoWent
                  </span>
                  <div className="relative -mt-1 sm:-mt-1.5">
                    <span className="font-handwriting text-3xl sm:text-4xl font-bold text-[#0D9488] tracking-wide inline-block transform -rotate-1">
                      The Extra Mile
                    </span>
                    {/* Organic brush underline */}
                    <svg
                      viewBox="0 0 170 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-2.5 -mt-2 text-[#0D9488]"
                    >
                      <path
                        d="M2 7C45 3 125 3 168 8"
                        stroke="currentColor"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Hero Demonstration Thank-You Card */}
            <div className="lg:col-span-6 relative flex justify-center lg:justify-end items-center">
              {/* Micro-interaction annotation note beside the card */}
              <div
                onMouseEnter={() => setArrowHovered(true)}
                onMouseLeave={() => setArrowHovered(false)}
                className="absolute -top-8 left-2 sm:left-6 lg:-left-12 z-20 hidden sm:flex flex-col items-start select-none cursor-default"
              >
                <span className="font-handwriting text-2xl lg:text-[1.75rem] font-bold text-[#0F172A] leading-tight transform -rotate-6">
                  A simple
                  <br />
                  way to say
                  <br />
                  thank you.
                </span>

                {/* Curved blue arrow pointing toward the card */}
                <svg
                  viewBox="0 0 60 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-14 h-10 mt-1 ml-4 text-[#1D4ED8] transition-transform duration-300 ${
                    arrowHovered ? 'scale-110 translate-x-1' : ''
                  }`}
                >
                  <path
                    d="M6 8 C 8 26, 32 30, 48 20"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M38 15 L 48 20 L 44 30"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </div>

              {/* The Hero Card Container */}
              <div className="relative w-full max-w-[480px] hero-card-animate hero-card-floating">
                {/* Subtle soft backdrop shadow blur */}
                <div className="absolute inset-0 bg-slate-900/10 blur-2xl rounded-[40px] transform translate-y-6 scale-95" />
                <CardPreview size="responsive" customData={HERO_SAMPLE} />
              </div>
            </div>
          </div>
        </div>

        {/* 3-STEP VISUAL STRIP ("HOW IT WORKS" WITHOUT NAV ITEM) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 sm:mt-28">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Step 1: Personalise */}
              <div className="flex items-center space-x-4 md:px-6 py-2 first:pt-0 md:first:pl-2">
                <div className="w-12 h-12 rounded-full bg-[#E6F7F0] text-[#00875A] flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Personalise
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Add their name, photo and message
                  </p>
                </div>
              </div>

              {/* Step 2: Send */}
              <div className="flex items-center space-x-4 md:px-8 py-2 pt-6 md:pt-2">
                <div className="w-12 h-12 rounded-full bg-[#E8F0FE] text-[#1D4ED8] flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Download
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Save it as an image or short video
                  </p>
                </div>
              </div>

              {/* Step 3: Share */}
              <div className="flex items-center space-x-4 md:px-8 py-2 pt-6 md:pt-2 last:pb-0 md:last:pr-2">
                <div className="w-12 h-12 rounded-full bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shrink-0 shadow-xs">
                  <Share2 className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Share
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Tag them and celebrate their impact
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SOCIAL SHARING PROMPT */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2">
            <div className="flex items-center space-x-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <span>Share their story</span>
            </div>

            {/* Social Icons row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* LinkedIn */}
              <button
                onClick={() => handleShare('linkedin')}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#0077B5]/10 border border-slate-200 text-slate-700 hover:text-[#0077B5] transition-all text-xs font-semibold shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="Share on LinkedIn"
              >
                <span className="w-4 h-4 rounded bg-[#0077B5] text-white flex items-center justify-center text-[10px] font-bold">
                  in
                </span>
                <span>LinkedIn</span>
              </button>

              {/* Instagram */}
              <button
                onClick={() => handleShare('instagram')}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-600 transition-all text-xs font-semibold shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="Copy caption and share to Instagram"
              >
                <div className="w-4 h-4 rounded-md bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white text-[10px]">
                  📷
                </div>
                <span>{copiedSocial === 'instagram' ? 'Caption Copied!' : 'Instagram'}</span>
              </button>

              {/* Facebook */}
              <button
                onClick={() => handleShare('facebook')}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#1877F2]/10 border border-slate-200 text-slate-700 hover:text-[#1877F2] transition-all text-xs font-semibold shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="Share on Facebook"
              >
                <span className="w-4 h-4 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[11px] font-bold">
                  f
                </span>
                <span>Facebook</span>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => handleShare('whatsapp')}
                className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#25D366]/10 border border-slate-200 text-slate-700 hover:text-[#25D366] transition-all text-xs font-semibold shadow-xs hover:-translate-y-0.5 cursor-pointer"
                title="Share via WhatsApp"
              >
                <span className="w-4 h-4 rounded-full bg-[#25D366] text-white flex items-center justify-center text-[11px] font-bold">
                  💬
                </span>
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Tag line */}
            <div className="text-xs text-slate-400 font-medium">
              Tag them. Celebrate them. Pass it on.
            </div>
          </div>
        </div>
      </main>

      {/* MINIMAL FOOTER */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/50 backdrop-blur-xs py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-slate-800">Pluto by VerifyMe</span>
            <span>•</span>
            <span className="font-semibold text-teal-800">#ThoseWhoWentTheExtraMile</span>
          </div>

          <div className="flex items-center space-x-6">
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="hover:text-slate-800 transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="hover:text-slate-800 transition-colors"
            >
              Terms
            </a>
            <span>© {new Date().getFullYear()} VerifyMe Nigeria</span>
          </div>
        </div>
      </footer>

      {/* 5-Sample Canonical Template Verification Modal */}
      <TemplateVerificationModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
      />
    </div>
  );
};
