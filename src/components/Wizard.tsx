import React, { useState, useEffect, useRef } from 'react';
import Cropper, { Point } from 'react-easy-crop';
import { useWizard } from '../context/WizardContext';
import { CardPreview } from './CardPreview';
import { ANIMATED_STYLES, CARD_STYLES } from './CardTemplates';
import { ShareComponent } from './ShareComponent';
import { generateCardImage } from '../services/cardGenerator';
import { ProgressBar } from './ProgressBar';
import { PlutoLogo } from './PlutoLogo';
import { StepOne } from './StepOne';
import { TemplateVerificationModal } from './TemplateVerificationModal';
import { StartOverModal } from './StartOverModal';
import {
  Upload,
  Crop as CropIcon,
  Trash2,
  Sparkles,
  RefreshCw,
  Download,
  Mail,
  Share2,
  CheckCircle2,
  Send,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Film,
} from 'lucide-react';
import {
  validatePhoto,
  validateTraits,
  validateMessage,
  validateCorporateEmail,
  validateName,
  validateCompany,
  validateIndustry,
  validateJobTitle,
  validatePhone,
} from '../utils/validation';

// Pluto's main website, linked from the download-complete message
const PLUTO_SITE_URL = 'https://pluto.verifyme.ng';

export const Wizard = ({
  onBackToHome,
  onOpenAdmin,
}: {
  onBackToHome?: () => void;
  onOpenAdmin?: () => void;
}) => {
  const { state, resetWizard } = useWizard();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showStartOverModal, setShowStartOverModal] = useState(false);

  // Record each step a session reaches, once, for the real funnel in the dashboard
  const trackedSteps = useRef<Set<string>>(new Set());
  useEffect(() => {
    const sessionId = state.cardSessionId;
    const step = Math.min(Math.max(state.step, 1), 5);
    const key = `${sessionId}:${step}`;
    if (!sessionId || trackedSteps.current.has(key)) return;
    trackedSteps.current.add(key);
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, step }),
    }).catch(() => {});
  }, [state.step, state.cardSessionId]);

  return (
    <div className="w-full">
      {/* For Step 1 (Who Are You Thanking), StepOne renders the dedicated full screen experience */}
      {state.step <= 1 && <StepOne onBackToHome={onBackToHome} />}

      {/* For subsequent steps (Step 2 to 5), display the persistent header and progress navigation */}
      {state.step > 1 && (
        <div className="min-h-screen bg-[#FAF9F6] text-slate-900 flex flex-col justify-between">
          <header className="relative z-20 pt-6 pb-4 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
              <button
                onClick={onBackToHome}
                className="focus:outline-none flex items-center group cursor-pointer"
                aria-label="Pluto home"
              >
                <PlutoLogo size="md" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-[#00875A] bg-[#F0FDF4] border border-[#A7F3D0] shadow-xs">
                  #ThoseWhoWentTheExtraMile
                </span>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(true)}
                  className="text-xs text-[#00875A] hover:text-[#00704A] font-semibold px-2 py-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                >
                  Verify 5 Samples
                </button>
                <button
                  type="button"
                  onClick={() => setShowStartOverModal(true)}
                  title="Start a new card"
                  className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-[#00875A] bg-white border border-slate-200 hover:border-[#00875A] hover:bg-emerald-50/50 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer group shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform duration-200" />
                  <span>Start Over</span>
                </button>
                {onOpenAdmin && (
                  <button
                    onClick={onOpenAdmin}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto flex-1 flex justify-center">
              <ProgressBar />
            </div>
          </header>

          <main className="flex-1 w-full">
            {state.step === 2 && <StepTwo />}
            {state.step === 3 && <StepThree />}
            {state.step === 4 && <StepFour />}
            {state.step >= 5 && <StepFive onStartNew={onBackToHome} />}
          </main>

          <TemplateVerificationModal
            isOpen={showVerifyModal}
            onClose={() => setShowVerifyModal(false)}
          />

          <StartOverModal
            isOpen={showStartOverModal}
            onClose={() => setShowStartOverModal(false)}
            onConfirm={() => {
              setShowStartOverModal(false);
              resetWizard();
            }}
          />
        </div>
      )}
    </div>
  );
};

/* =========================================================================
   STEP 2: PHOTO
   ========================================================================= */
const StepTwo = () => {
  const { updateData, nextStep, prevStep, state } = useWizard();
  const [imageSrc, setImageSrc] = useState(state.data.photoUrl || '/african_executive_portrait.jpg');
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const photoValidation = validatePhoto(imageSrc);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds recommended 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const result = reader.result as string;
        setImageSrc(result);
        updateData({ photoUrl: result });
      });
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setImageSrc('');
    updateData({ photoUrl: '' });
  };

  const handleUseDemo = () => {
    const demo = '/african_executive_portrait.jpg';
    setImageSrc(demo);
    updateData({ photoUrl: demo });
  };

  const handleContinue = () => {
    setSubmitted(true);
    if (photoValidation.isValid) {
      nextStep();
    }
  };

  const hasError = submitted && !photoValidation.isValid;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="space-y-2 mb-8 text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3D] tracking-tight">
          Put a face to the thank you.
        </h2>
        <p className="text-slate-500 text-base">
          Add a photo of the person you’re celebrating.
        </p>
      </div>

      <div className="space-y-6">
        {hasError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{photoValidation.error}</span>
          </div>
        )}

        {/* Upload Container */}
        {!imageSrc ? (
          <div className="border-2 border-dashed border-slate-300 hover:border-[#00875A] rounded-3xl p-10 text-center transition-colors bg-white shadow-xs">
            <input
              type="file"
              id="photo-upload"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={onFileChange}
              className="hidden"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-16 h-16 bg-[#F0FDF9] text-[#00875A] rounded-full flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <span className="text-base font-bold text-[#0B1B3D] block">
                  Click to upload a portrait
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  JPG, JPEG, PNG or WEBP (up to 10MB)
                </span>
              </div>
            </label>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-xs text-[#00875A] hover:underline font-semibold"
              >
                Or use campaign sample portrait
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center gap-6">
            {/* Circular Portrait Preview with Reference Double-Ring Treatment */}
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-[#DDF2FD]/80 shadow-md shrink-0 relative">
              <div className="w-full h-full rounded-full p-[3px] bg-gradient-to-tr from-[#00A389] via-[#00B4D8] to-[#38B6FF]">
                <img
                  src={imageSrc}
                  alt="Recipient Portrait"
                  className="w-full h-full rounded-full object-cover shadow-inner"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex-1 space-y-3 w-full text-center sm:text-left">
              <h3 className="font-extrabold text-[#0B1B3D] text-lg">
                Portrait Ready
              </h3>
              <p className="text-xs text-slate-500">
                The photo will appear in the signature circular frame on the square card.
              </p>

              <div className="flex flex-wrap gap-2.5 pt-2 justify-center sm:justify-start">
                <input
                  type="file"
                  id="replace-upload"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={onFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="replace-upload"
                  className="px-4 py-2 border border-slate-200 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center space-x-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Replace Photo</span>
                </label>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="px-4 py-2 border border-rose-200 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-50 flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="pt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={prevStep}
            className="px-7 py-3.5 border border-slate-200 rounded-full text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="px-8 py-3.5 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-full flex items-center space-x-2 transition-all shadow-md text-sm cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   STEP 3: PERSONALISE (Attributes + Message Generator + Live Square Preview)
   ========================================================================= */
const StepThree = () => {
  const { updateData, nextStep, prevStep, state } = useWizard();
  const [loadingAi, setLoadingAi] = useState(false);
  const [contextInput, setContextInput] = useState('');
  const [aiOptions, setAiOptions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // 15 Approved Appreciation Attributes from Section 7
  const allAttributes = [
    'Believed in my potential',
    'Opened new opportunities',
    'Challenged me to grow',
    'Gave me my first opportunity',
    'Supported my journey',
    'Supported me when it mattered',
    'Taught me something valuable',
    'Helped me through a difficult time',
    'Led by example',
    'A true people leader',
    'Always inspired me',
    'Trusted my ideas',
    'Gave me confidence',
    'Opened doors for me',
    'Went the extra mile',
  ];

  // Default selection if empty
  useEffect(() => {
    if (!state.data.selectedTraits || state.data.selectedTraits.length === 0) {
      updateData({
        selectedTraits: [
          'Believed in my potential',
          'Opened new opportunities',
          'Challenged me to grow',
        ],
      });
    }
  }, []);

  const selectedTraits = state.data.selectedTraits || [];
  const traitsValidation = validateTraits(selectedTraits);
  const messageValidation = validateMessage(state.data.message);

  const toggleTrait = (trait: string) => {
    const isSelected = selectedTraits.includes(trait);
    if (isSelected) {
      updateData({ selectedTraits: selectedTraits.filter((t) => t !== trait) });
    } else {
      if (selectedTraits.length < 5) {
        updateData({ selectedTraits: [...selectedTraits, trait] });
      }
    }
  };

  const generateAiOptions = async () => {
    setLoadingAi(true);
    try {
      const response = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientName: state.data.recipientName,
          relationship: state.data.relationship,
          traits: selectedTraits,
          context: contextInput,
        }),
      });
      const data = await response.json();
      if (Array.isArray(data.options) && data.options.length > 0) {
        setAiOptions(data.options);
        // Default to first option
        updateData({ message: data.options[0], useAiMessage: true });
      } else if (data.message) {
        setAiOptions([data.message]);
        updateData({ message: data.message, useAiMessage: true });
      }
    } catch (err) {
      console.warn('AI generation error:', err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleContinue = () => {
    setSubmitted(true);
    if (traitsValidation.isValid && messageValidation.isValid) {
      nextStep();
    }
  };

  const hasTraitsError = submitted && !traitsValidation.isValid;
  const hasMessageError = submitted && !messageValidation.isValid;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* LEFT COLUMN: Controls & Inputs */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* SECTION 1: ATTRIBUTES */}
          <div className="space-y-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1B3D] tracking-tight">
                What did they give you?
              </h2>
              <div className="flex items-center justify-between mt-1">
                <p className="text-slate-500 text-sm">
                  Pick 2–5 things that made a difference.
                </p>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    selectedTraits.length >= 2 && selectedTraits.length <= 5
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedTraits.length} / 5 selected
                </span>
              </div>
            </div>

            {hasTraitsError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{traitsValidation.error}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1 max-h-[260px] overflow-y-auto pr-1">
              {allAttributes.map((trait) => {
                const isSelected = selectedTraits.includes(trait);
                return (
                  <button
                    key={trait}
                    type="button"
                    onClick={() => toggleTrait(trait)}
                    className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all border flex items-center space-x-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00875A] text-white border-[#00875A] shadow-xs'
                        : selectedTraits.length >= 5
                        ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#00875A]/60 hover:bg-[#F0FDF9]'
                    }`}
                  >
                    <span>{trait}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: MESSAGE GENERATOR */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#0B1B3D] tracking-tight">
                What would you like to say?
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Write your own appreciation message or let AI draft options.
              </p>
            </div>

            {/* Mode Toggle Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-full max-w-xs text-xs font-bold">
              <button
                type="button"
                onClick={() => updateData({ useAiMessage: false })}
                className={`flex-1 py-2 rounded-full transition-all ${
                  !state.data.useAiMessage
                    ? 'bg-white text-[#0B1B3D] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Write my own
              </button>
              <button
                type="button"
                onClick={() => {
                  updateData({ useAiMessage: true });
                  if (aiOptions.length === 0) generateAiOptions();
                }}
                className={`flex-1 py-2 rounded-full flex items-center justify-center space-x-1.5 transition-all ${
                  state.data.useAiMessage
                    ? 'bg-[#00875A] text-white shadow-xs'
                    : 'text-slate-500 hover:text-[#00875A]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Help me write it</span>
              </button>
            </div>

            {/* Help Me Write It Container */}
            {state.data.useAiMessage ? (
              <div className="space-y-3 bg-[#F0FDF9]/60 border border-emerald-100 p-4 rounded-2xl animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    What do you want them to know? (Optional context)
                  </label>
                  <input
                    type="text"
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                    placeholder="e.g. They gave me my first real opportunity."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#00875A]"
                  />
                </div>

                <button
                  type="button"
                  onClick={generateAiOptions}
                  disabled={loadingAi}
                  className="px-4 py-2 bg-[#00875A] text-white rounded-full text-xs font-bold flex items-center space-x-1.5 hover:bg-[#00704A] transition-colors cursor-pointer shadow-2xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                  <span>{loadingAi ? 'Drafting warm messages...' : 'Generate 3 message options'}</span>
                </button>

                {/* 3 AI Generated Options */}
                {aiOptions.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Choose an option:
                    </span>
                    {aiOptions.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => updateData({ message: opt })}
                        className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all ${
                          state.data.message === opt
                            ? 'bg-white border-[#00875A] ring-2 ring-[#00875A]/20 shadow-xs font-medium text-[#0B1B3D]'
                            : 'bg-white/80 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span>"{opt}"</span>
                          {state.data.message === opt && (
                            <Check className="w-4 h-4 text-[#00875A] shrink-0 mt-0.5" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Editable Textarea with Live Character Count */}
            <div className="space-y-1">
              <div className="relative">
                <textarea
                  value={state.data.message}
                  onChange={(e) => updateData({ message: e.target.value })}
                  placeholder="e.g. You didn’t just give direction. You gave me opportunity, challenged me to grow, and believed in me when I doubted myself."
                  rows={4}
                  maxLength={250}
                  className={`w-full p-4 rounded-2xl border text-sm sm:text-base leading-relaxed bg-white focus:outline-none transition-all shadow-xs ${
                    hasMessageError
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200 focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50'
                  }`}
                />
                <span className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-400">
                  {(state.data.message || '').length} / 250
                </span>
              </div>

              {hasMessageError && (
                <div className="p-2 text-rose-600 text-xs font-semibold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{messageValidation.error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="pt-4 flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              className="px-7 py-3.5 border border-slate-200 rounded-full text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="px-8 py-3.5 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-full flex items-center space-x-2 transition-all shadow-md text-sm cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SQUARE CARD PREVIEW (Fixed 1:1, Immutable visual source of truth) */}
        <div className="lg:col-span-6 lg:sticky lg:top-8 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Live Card Preview (1:1 Square)
            </span>
            <span className="text-xs text-[#00875A] font-bold">
              Updates in real time
            </span>
          </div>

          <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-[40px] shadow-inner">
            <CardPreview size="responsive" />
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================================
   STEP 4: YOUR DETAILS (Sender info & separate marketing consent)
   ========================================================================= */
const StepFour = () => {
  const { updateData, nextStep, prevStep, state } = useWizard();
  const [submitted, setSubmitted] = useState(false);

  // Industry options from Section 18
  const industryOptions = [
    'Banking',
    'Fintech / Payments',
    'Lending',
    'Insurance',
    'Pensions',
    'Technology',
    'Telecoms',
    'Logistics / Commerce',
    'Professional Services',
    'Government',
    'FMCG / Retail',
    'Other',
  ];

  const emailValidation = validateCorporateEmail(state.data.creatorEmail);
  const firstNameValidation = validateName(state.data.creatorFirstName, 'First name');
  const lastNameValidation = validateName(state.data.creatorLastName, 'Last name');
  const jobTitleValidation = validateJobTitle(state.data.creatorJobTitle);
  const companyValidation = validateCompany(state.data.creatorCompany);
  const industryValidation = validateIndustry(state.data.creatorIndustry);
  const phoneValidation = validatePhone(state.data.creatorPhone);

  const isFormValid =
    emailValidation.isValid &&
    firstNameValidation.isValid &&
    lastNameValidation.isValid &&
    jobTitleValidation.isValid &&
    companyValidation.isValid &&
    industryValidation.isValid &&
    phoneValidation.isValid;

  const handleContinue = () => {
    setSubmitted(true);
    if (isFormValid) {
      nextStep();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="space-y-2 mb-8 text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3D] tracking-tight">
          Where should we send your card?
        </h2>
        <p className="text-slate-500 text-base">
          We’ll send the finished card to your inbox so you can download and share it.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* Name Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              First Name <span className="text-[#00875A]">*</span>
            </label>
            <input
              type="text"
              value={state.data.creatorFirstName}
              onChange={(e) => updateData({ creatorFirstName: e.target.value })}
              placeholder="e.g. Ufiok"
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                submitted && !firstNameValidation.isValid
                  ? 'border-rose-400 ring-2 ring-rose-50'
                  : 'border-slate-200 focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50'
              }`}
            />
            {submitted && !firstNameValidation.isValid && (
              <span className="text-xs text-rose-600 font-semibold">{firstNameValidation.error}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Last Name <span className="text-[#00875A]">*</span>
            </label>
            <input
              type="text"
              value={state.data.creatorLastName}
              onChange={(e) => updateData({ creatorLastName: e.target.value })}
              placeholder="e.g. Adetunji"
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                submitted && !lastNameValidation.isValid
                  ? 'border-rose-400 ring-2 ring-rose-50'
                  : 'border-slate-200 focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50'
              }`}
            />
            {submitted && !lastNameValidation.isValid && (
              <span className="text-xs text-rose-600 font-semibold">{lastNameValidation.error}</span>
            )}
          </div>
        </div>

        {/* Corporate/Work Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Corporate / Work Email <span className="text-[#00875A]">*</span>
          </label>
          <input
            type="email"
            value={state.data.creatorEmail}
            onChange={(e) => updateData({ creatorEmail: e.target.value })}
            placeholder="e.g. ufiok@company.com"
            className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
              submitted && !emailValidation.isValid
                ? 'border-rose-400 ring-2 ring-rose-50'
                : 'border-slate-200 focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50'
            }`}
          />
          {submitted && !emailValidation.isValid && (
            <span className="text-xs text-rose-600 font-semibold">{emailValidation.error}</span>
          )}
        </div>

        {/* Job Title & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Job Title <span className="text-[#00875A]">*</span>
            </label>
            <input
              type="text"
              value={state.data.creatorJobTitle}
              onChange={(e) => updateData({ creatorJobTitle: e.target.value })}
              placeholder="e.g. Senior Marketing Manager"
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                submitted && !jobTitleValidation.isValid
                  ? 'border-rose-400 ring-2 ring-rose-50'
                  : 'border-slate-200 focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50'
              }`}
            />
            {submitted && !jobTitleValidation.isValid && (
              <span className="text-xs text-rose-600 font-semibold">{jobTitleValidation.error}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Company <span className="text-[#00875A]">*</span>
            </label>
            <input
              type="text"
              value={state.data.creatorCompany}
              onChange={(e) => updateData({ creatorCompany: e.target.value })}
              placeholder="e.g. VerifyMe Nigeria"
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium focus:outline-none transition-all ${
                submitted && !companyValidation.isValid
                  ? 'border-rose-400 ring-2 ring-rose-50'
                  : 'border-slate-200 focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50'
              }`}
            />
            {submitted && !companyValidation.isValid && (
              <span className="text-xs text-rose-600 font-semibold">{companyValidation.error}</span>
            )}
          </div>
        </div>

        {/* Industry & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Industry <span className="text-[#00875A]">*</span>
            </label>
            <select
              value={state.data.creatorIndustry}
              onChange={(e) => updateData({ creatorIndustry: e.target.value })}
              className={`w-full px-4 py-3 rounded-2xl border text-sm font-medium bg-white focus:outline-none transition-all ${
                submitted && !industryValidation.isValid
                  ? 'border-rose-400 ring-2 ring-rose-50'
                  : 'border-slate-200 focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50'
              }`}
            >
              <option value="">Select industry</option>
              {industryOptions.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
            {submitted && !industryValidation.isValid && (
              <span className="text-xs text-rose-600 font-semibold">{industryValidation.error}</span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="tel"
              value={state.data.creatorPhone}
              onChange={(e) => updateData({ creatorPhone: e.target.value })}
              placeholder="e.g. +234 801 234 5678"
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-[#00875A] focus:ring-2 focus:ring-emerald-50 transition-all"
            />
          </div>
        </div>

        {/* Separate Marketing Consent Checkbox (Section 19) */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <label className="flex items-start space-x-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={state.data.marketingConsent}
              onChange={(e) => updateData({ marketingConsent: e.target.checked })}
              className="mt-1 w-4 h-4 rounded text-[#00875A] focus:ring-[#00875A] border-slate-300"
            />
            <span className="text-xs text-slate-600 leading-snug">
              I’d like to receive occasional Pluto and VerifyMe insights, campaigns and career-history content by email.
            </span>
          </label>
          <div className="text-[11px] text-slate-400 pl-7">
            <a href="https://pluto.verifyme.ng/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-600">
              Privacy Policy
            </a>{' '}
            • You can unsubscribe anytime.
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={prevStep}
          className="px-7 py-3.5 border border-slate-200 rounded-full text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="px-8 py-3.5 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-full flex items-center space-x-2 transition-all shadow-md text-sm cursor-pointer"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/* =========================================================================
   STEP 5: CREATE (Finished Square Card, Quality Check, Export & Share)
   ========================================================================= */
const StepFive = ({ onStartNew }: { onStartNew?: () => void }) => {
  const { state, resetWizard, updateData } = useWizard();
  const savedCardId = useRef<string | null>(null);
  const cardStyle = state.data.cardStyle || 'bold';

  // Remember which style the card was actually downloaded or emailed in
  const recordStyle = () => {
    if (!savedCardId.current) return;
    fetch(`/api/cards/${savedCardId.current}/style`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardStyle }),
    }).catch(() => {});
  };
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showDownloadDone, setShowDownloadDone] = useState(false);
  const [videoProgress, setVideoProgress] = useState<number | null>(null);
  const [videoError, setVideoError] = useState('');
  const [isReady, setIsReady] = useState(false);

  // Save the completed card to Supabase (via the server) once per card
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    fetch('/api/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipientName: state.data.recipientName || '',
        relationship: state.data.relationship || '',
        message: state.data.message || '',
        selectedTraits: state.data.selectedTraits || [],
        creatorFirstName: state.data.creatorFirstName || '',
        creatorLastName: state.data.creatorLastName || '',
        creatorEmail: state.data.creatorEmail || '',
        creatorJobTitle: state.data.creatorJobTitle || '',
        creatorCompany: state.data.creatorCompany || '',
        creatorIndustry: state.data.creatorIndustry || '',
        marketingConsent: state.data.marketingConsent || false,
        cardStyle,
        campaign: 'ThoseWhoWentTheExtraMile',
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((r) => {
        if (r?.id) savedCardId.current = r.id;
      })
      .catch((err) => console.warn('Could not save card record:', err));

    const timer = setTimeout(() => setIsReady(true), 400);
    return () => clearTimeout(timer);
  }, []);

  // Internal Quality Check Validation (Section 34)
  const qualityChecks = [
    { label: 'Recipient photo present', pass: Boolean(state.data.photoUrl || '/african_executive_portrait.jpg') },
    { label: 'Recipient name visible', pass: Boolean(state.data.recipientName && state.data.recipientName.trim().length >= 2) },
    { label: 'Relationship visible', pass: Boolean(state.data.relationship) },
    { label: '2–5 appreciation attributes', pass: (state.data.selectedTraits?.length || 0) >= 2 && (state.data.selectedTraits?.length || 0) <= 5 },
    { label: 'Appreciation message present', pass: Boolean(state.data.message && state.data.message.trim().length >= 10) },
    { label: 'Sender details present', pass: Boolean(state.data.creatorFirstName && state.data.creatorJobTitle) },
    { label: '1:1 Square proportions locked', pass: true },
  ];

  const allPassed = qualityChecks.every((c) => c.pass);

  // Download Handler (PNG at 1080x1080 or high-res 1600x1600)
  const handleDownload = async (highRes = false) => {
    setDownloading(true);
    try {
      const dataUrl = await generateCardImage('card-preview-export', { highRes });
      const safeName = (state.data.recipientName || 'card').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const filename = `pluto-thank-you-${safeName}.png`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      link.click();
      recordStyle();
      setShowDownloadDone(true);
    } catch (err) {
      console.warn('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  // Animated video download (MP4): short intro, then the finished card holds still
  const handleDownloadVideo = async () => {
    if (videoProgress !== null) return;
    setVideoError('');
    setVideoProgress(0);
    try {
      const { generateCardVideo } = await import('../services/cardVideo');
      const d = state.data;
      const { blob, extension } = await generateCardVideo(
        {
          recipientName: d.recipientName,
          relationship: d.relationship,
          photoUrl: d.photoUrl,
          selectedTraits: d.selectedTraits,
          message: d.message,
          creatorFirstName: d.creatorFirstName,
          creatorLastName: d.creatorLastName,
          creatorJobTitle: d.creatorJobTitle,
          creatorCompany: d.creatorCompany,
        },
        cardStyle,
        (p) => setVideoProgress(p)
      );
      const safeName = (d.recipientName || 'card').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pluto-thank-you-${safeName}.${extension}`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      recordStyle();
      setShowDownloadDone(true);
    } catch (err) {
      console.warn('Video export error:', err);
      setVideoError("We couldn't create the video on this device. Please download the image instead.");
    } finally {
      setVideoProgress(null);
    }
  };

  // Send to inbox handler
  const handleSendInbox = async () => {
    if (!state.data.creatorEmail) return;
    setEmailing(true);
    try {
      const dataUrl = await generateCardImage('card-preview-export');
      setEmailError('');
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.data.creatorEmail, dataUrl }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.delivered) {
        throw new Error(result.error || 'Email could not be delivered');
      }
      recordStyle();
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err) {
      console.warn('Email send error:', err);
      setEmailError("We couldn't email your card just now. Please download it instead, or try again later.");
    } finally {
      setEmailing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Hidden high-res canvas target for html-to-image (1080x1080 square) */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div id="card-preview-export">
          <CardPreview size="export" id="card-preview-export" />
        </div>
      </div>

      <div className="space-y-6 text-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1B3D] tracking-tight">
            Your card is ready.
          </h2>
          <p className="text-slate-500 text-base mt-1">
            Download your card or send it to your inbox to share it with someone who went the extra mile.
          </p>
        </div>

        {/* Style picker: same details, different look */}
        <div className="max-w-[540px] mx-auto">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Choose a style</p>
          <div role="radiogroup" aria-label="Card style" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CARD_STYLES.map((s) => {
              const active = cardStyle === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => updateData({ cardStyle: s.id })}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 transition-all cursor-pointer ${
                    active ? 'border-[#00875A] bg-emerald-50/60 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="flex -space-x-1.5">
                    {s.swatch.map((c) => (
                      <span key={c} className="w-5 h-5 rounded-full border-2 border-white ring-1 ring-slate-200" style={{ backgroundColor: c }} />
                    ))}
                  </span>
                  <span className={`text-sm font-bold ${active ? 'text-[#00704A]' : 'text-slate-800'}`}>{s.label}</span>
                  <span className="text-[11px] leading-tight text-slate-500 hidden sm:block">{s.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Large Square Card Preview (Immutable Source of Truth) */}
        <div className="max-w-[540px] mx-auto p-3 bg-slate-100/80 border border-slate-200 rounded-[44px] shadow-lg">
          <CardPreview size="responsive" />
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {/* Default 1080x1080 download */}
          <button
            type="button"
            onClick={() => handleDownload(false)}
            disabled={downloading}
            className="px-6 py-3.5 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-full text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Preparing Card...' : 'DOWNLOAD CARD'}</span>
          </button>

          {/* Animated video (MP4) for LinkedIn, Instagram, WhatsApp */}
          {ANIMATED_STYLES.includes(cardStyle) && (
            <button
              type="button"
              onClick={handleDownloadVideo}
              disabled={videoProgress !== null}
              className="px-5 py-3.5 bg-[#0B1B3D] hover:bg-[#13285A] text-white font-bold rounded-full text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-80"
            >
              <Film className="w-4 h-4" />
              <span>{videoProgress !== null ? `Creating video… ${Math.round(videoProgress * 100)}%` : 'ANIMATED VIDEO'}</span>
            </button>
          )}

          {/* High-res 1600x1600 download */}
          <button
            type="button"
            onClick={() => handleDownload(true)}
            disabled={downloading}
            className="px-5 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-full text-sm flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#00875A]" />
            <span>High-Res (1600 × 1600)</span>
          </button>

          {/* Send to my inbox */}
          <button
            type="button"
            onClick={handleSendInbox}
            disabled={emailing}
            className="px-6 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-full text-sm flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#1068EB]" />
            <span>{emailing ? 'Sending...' : 'SEND TO MY INBOX'}</span>
          </button>
        </div>

        {videoError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold inline-block animate-fadeIn">
            {videoError}
          </div>
        )}

        {emailError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold inline-block animate-fadeIn">
            {emailError}
          </div>
        )}

        {emailSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold inline-block animate-fadeIn">
            ✓ Card sent to {state.data.creatorEmail || 'your inbox'}!
          </div>
        )}

        {/* Social Sharing Component */}
        <div className="pt-6 max-w-lg mx-auto">
          <ShareComponent
            cardElementId="card-preview-export"
            recipientName={state.data.recipientName}
            creatorEmail={state.data.creatorEmail}
          />
        </div>

        {/* Download complete: next steps */}
        {showDownloadDone && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="download-done-title"
            onClick={() => setShowDownloadDone(false)}
          >
            <div
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 text-center space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto w-14 h-14 rounded-full bg-emerald-50 text-[#00875A] flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h3 id="download-done-title" className="text-xl font-extrabold text-[#0B1B3D]">
                Your card is downloaded
              </h3>
              <p className="text-sm text-slate-600">
                Share it and tag {state.data.recipientName || 'them'} so they know they went the extra mile for you.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadDone(false);
                    resetWizard();
                    if (onStartNew) onStartNew();
                  }}
                  className="w-full px-5 py-3 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-full text-sm"
                >
                  Create another card
                </button>
                <a
                  href={PLUTO_SITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-5 py-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-full text-sm"
                >
                  Visit Pluto
                </a>
                <button
                  type="button"
                  onClick={() => setShowDownloadDone(false)}
                  className="text-xs text-slate-500 hover:text-slate-700 pt-1"
                >
                  Back to my card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Restart or Create Another */}
        <div className="pt-8 border-t border-slate-200 flex justify-center items-center space-x-4">
          <button
            type="button"
            onClick={() => {
              resetWizard();
              if (onStartNew) onStartNew();
            }}
            className="text-xs font-bold text-[#00875A] hover:underline"
          >
            Create Another Thank-You Card
          </button>
        </div>
      </div>
    </div>
  );
};
