import React, { useState, useEffect, useRef } from 'react';
import { useWizard } from '../context/WizardContext';
import { PlutoLogo } from './PlutoLogo';
import { ProgressBar } from './ProgressBar';
import { StartOverModal } from './StartOverModal';
import {
  ArrowLeft,
  ArrowRight,
  User,
  Users,
  Briefcase,
  Award,
  UsersRound,
  Smile,
  Building,
  MoreHorizontal,
  Check,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface StepOneProps {
  onBackToHome?: () => void;
}

export const StepOne: React.FC<StepOneProps> = ({ onBackToHome }) => {
  const { state, updateData, nextStep, resetWizard } = useWizard();

  // Local state initialized from persistent context (normalized to max 13 chars)
  const initialName = state.data.recipientName || '';
  const [recipientName, setRecipientName] = useState(
    initialName.length > 13 ? initialName.slice(0, 13) : initialName
  );
  const [selectedRel, setSelectedRel] = useState(state.data.relationship || '');
  const STANDARD_RELATIONSHIPS = [
    'First Boss',
    'Mentor',
    'Manager',
    'Director',
    'Colleague',
    'Team Member',
    'Former Employer',
    'Customer',
    'Friend',
  ];

  const [customRel, setCustomRel] = useState(
    state.data.relationship && !STANDARD_RELATIONSHIPS.includes(state.data.relationship)
      ? state.data.relationship
      : ''
  );
  const [isOther, setIsOther] = useState(
    state.data.relationship === 'Other' ||
      (Boolean(state.data.relationship) && !STANDARD_RELATIONSHIPS.includes(state.data.relationship))
  );

  // Validation & UI states
  const [submitted, setSubmitted] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [relError, setRelError] = useState<string | null>(null);
  const [customRelError, setCustomRelError] = useState<string | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showStartOverModal, setShowStartOverModal] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Relationship options configuration matching UI reference exactly
  const relationshipCards = [
    { id: 'First Boss', label: 'First Boss', icon: User },
    { id: 'Mentor', label: 'Mentor', icon: Users },
    { id: 'Manager', label: 'Manager', icon: Briefcase },
    { id: 'Director', label: 'Director', icon: Award },
    { id: 'Colleague', label: 'Colleague', icon: UsersRound },
    { id: 'Team Member', label: 'Team Member', icon: Smile },
    { id: 'Former Employer', label: 'Former Employer', icon: Building },
    { id: 'Customer', label: 'Customer', icon: Briefcase },
    { id: 'Friend', label: 'Friend', icon: Smile },
    { id: 'Other', label: 'Other', icon: MoreHorizontal },
  ];

  // Sync to context whenever values change
  useEffect(() => {
    updateData({
      recipientName: recipientName.trim(),
      relationship: isOther ? customRel || 'Other' : selectedRel,
      isCustomRelationship: isOther,
    });
  }, [recipientName, selectedRel, isOther, customRel]);

  // Handle name input with max 13 characters & whitespace normalization
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\s+/g, ' ');
    if (val.length > 13) {
      val = val.slice(0, 13);
    }
    setRecipientName(val);
    const trimmed = val.trim();
    if (nameError && trimmed.length >= 2 && trimmed.length <= 13) {
      setNameError(null);
    }
  };

  // Handle relationship selection
  const handleSelectRelationship = (id: string) => {
    if (id === 'Other') {
      setIsOther(true);
      setSelectedRel('Other');
    } else {
      setIsOther(false);
      setSelectedRel(id);
    }
    if (relError) {
      setRelError(null);
    }
  };

  // Handle custom relationship text input
  const handleCustomRelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomRel(val);
    if (customRelError && val.trim().length > 0) {
      setCustomRelError(null);
    }
  };

  // Back button click with confirmation check
  const handleBackClick = () => {
    const hasData =
      recipientName.trim().length > 0 ||
      Boolean(selectedRel) ||
      (isOther && customRel.trim().length > 0);

    if (hasData) {
      setShowExitModal(true);
    } else if (onBackToHome) {
      onBackToHome();
    }
  };

  // Confirm leave
  const handleConfirmExit = () => {
    setShowExitModal(false);
    if (onBackToHome) {
      onBackToHome();
    }
  };

  // Continue validation & submission
  const handleContinue = () => {
    setSubmitted(true);
    let valid = true;

    const trimmedName = recipientName.trim();

    if (!trimmedName) {
      setNameError('Who are you thanking? Add their name to continue.');
      valid = false;
      nameInputRef.current?.focus();
    } else if (trimmedName.length < 2) {
      setNameError('Please enter at least 2 characters.');
      valid = false;
      nameInputRef.current?.focus();
    } else if (trimmedName.length > 13) {
      setNameError('Please keep the name to 13 characters or fewer.');
      valid = false;
      nameInputRef.current?.focus();
    } else {
      setNameError(null);
    }

    if (!selectedRel) {
      setRelError('Please select your relationship with them.');
      valid = false;
    } else {
      setRelError(null);
    }

    if (isOther && !customRel.trim()) {
      setCustomRelError('Please tell us what to call this relationship.');
      valid = false;
    } else {
      setCustomRelError(null);
    }

    if (valid) {
      setIsExiting(true);
      setTimeout(() => {
        nextStep();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 relative overflow-hidden font-sans selection:bg-teal-100 selection:text-teal-900 flex flex-col justify-between">
      {/* Ambient background soft pastel organic shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute -top-[10%] right-[-5%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full blur-[110px] opacity-40"
          style={{ background: 'radial-gradient(circle, #D8E7FF 0%, rgba(216,231,255,0) 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] -left-[10%] w-[50vw] h-[50vw] max-w-[650px] max-h-[650px] rounded-full blur-[120px] opacity-35"
          style={{ background: 'radial-gradient(circle, #CCFBF1 0%, rgba(204,251,241,0) 70%)' }}
        />
      </div>

      {/* TOP HEADER & PROGRESS NAVIGATION */}
      <header className="relative z-20 pt-6 pb-4 px-4 sm:px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackClick}
              className="focus:outline-none flex items-center group cursor-pointer"
              aria-label="Pluto home"
            >
              <PlutoLogo size="md" />
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-[#00875A] bg-[#F0FDF4] border border-[#A7F3D0] shadow-xs">
              #ThoseWhoWentTheExtraMile
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowStartOverModal(true)}
            title="Start a new card"
            className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-[#00875A] bg-white border border-slate-200 hover:border-[#00875A] hover:bg-emerald-50/50 transition-all duration-200 flex items-center space-x-1.5 cursor-pointer group shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform duration-200" />
            <span>Start Over</span>
          </button>
        </div>

        <div className="w-full md:w-auto flex-1 flex justify-center">
          <ProgressBar />
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main
        className={`relative z-10 flex-1 max-w-[940px] mx-auto w-full px-4 sm:px-8 pt-6 pb-16 transition-all duration-300 ${
          isExiting
            ? 'opacity-0 -translate-x-8'
            : 'opacity-100 translate-x-0 animate-fadeIn'
        }`}
      >
        <div className="mb-6">
          <button
            type="button"
            onClick={handleBackClick}
            className="w-13 h-13 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-800 hover:border-[#00875A] hover:bg-[#F0FDF9] hover:text-[#00875A] transition-all duration-200 shadow-xs group cursor-pointer"
            aria-label="Go back to homepage"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="space-y-2 mb-10">
          <div className="relative inline-block">
            <div className="absolute -top-6 -left-6 sm:-left-8 text-[#00875A] select-none pointer-events-none">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M6 26L12 18" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M14 20L20 9" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
                <path d="M21 22L27 16" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-[#0F172A] tracking-[-0.03em] leading-tight">
              Who are you thanking?
            </h1>
          </div>

          <p className="text-lg sm:text-xl text-[#64748B] font-normal">
            Let’s start with their name (maximum 13 characters).
          </p>
        </div>

        {/* FORM CONTAINER */}
        <div className="space-y-8">
          {/* SECTION 1: Recipient Name Field */}
          <div className="space-y-2.5">
            <label
              htmlFor="recipient-name"
              className="block text-sm font-bold text-[#0F172A]"
            >
              Recipient Name <span className="text-[#00875A]">*</span>
            </label>

            <div
              className={`relative rounded-2xl bg-white border transition-all duration-200 shadow-xs flex items-center px-5 h-[64px] ${
                nameError
                  ? 'border-rose-400 ring-4 ring-rose-50'
                  : isInputFocused
                  ? 'border-[#00875A] ring-4 ring-emerald-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <User
                className={`w-5 h-5 mr-3.5 transition-colors shrink-0 ${
                  isInputFocused ? 'text-[#00875A]' : 'text-slate-400'
                }`}
              />
              <input
                ref={nameInputRef}
                id="recipient-name"
                type="text"
                value={recipientName}
                onChange={handleNameChange}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="e.g. Oyin Emmanuel"
                maxLength={13}
                aria-required="true"
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? 'recipient-name-error' : undefined}
                className="w-full bg-transparent text-[#0F172A] text-base sm:text-lg font-medium placeholder:text-slate-400 focus:outline-none"
                autoComplete="off"
              />
            </div>

            {/* Error & Live Character Counter */}
            <div className="flex items-center justify-between text-xs pt-1 px-1">
              <div>
                {nameError && (
                  <div id="recipient-name-error" className="flex items-center space-x-1.5 font-semibold text-rose-600 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{nameError}</span>
                  </div>
                )}
              </div>
              <div className={`font-bold ${recipientName.length > 13 ? 'text-rose-600' : 'text-slate-400'}`}>
                {recipientName.length} / 13
              </div>
            </div>
          </div>

          {/* SECTION 2: Relationship Visual Selection Cards */}
          <div className="space-y-3 pt-2">
            <label className="block text-sm font-bold text-[#0F172A]">
              What’s your relationship with them? <span className="text-[#00875A]">*</span>
            </label>

            <div
              role="radiogroup"
              aria-label="What’s your relationship with them?"
              className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
            >
              {relationshipCards.map((card) => {
                const Icon = card.icon;
                const isSelected =
                  card.id === 'Other' ? isOther : selectedRel === card.id && !isOther;

                return (
                  <button
                    key={card.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleSelectRelationship(card.id)}
                    className={`relative p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-[#00875A] bg-[#F0FDF9] ring-2 ring-[#00875A]/20 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#00875A] text-white' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-[#00875A] bg-[#00875A] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <span
                      className={`text-sm font-bold transition-colors ${
                        isSelected ? 'text-[#00875A]' : 'text-slate-800'
                      }`}
                    >
                      {card.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {relError && (
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 pt-1 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{relError}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: Custom Relationship Input if Other */}
          {isOther && (
            <div className="space-y-2 pt-2 animate-fadeIn">
              <label htmlFor="custom-relationship" className="block text-sm font-bold text-[#0F172A]">
                Please specify relationship <span className="text-[#00875A]">*</span>
              </label>
              <input
                id="custom-relationship"
                type="text"
                value={customRel}
                onChange={handleCustomRelChange}
                placeholder="e.g. Life Coach"
                className={`w-full bg-white border rounded-2xl px-5 h-[56px] text-base font-medium text-[#0F172A] focus:outline-none transition-all shadow-xs ${
                  customRelError ? 'border-rose-400 ring-4 ring-rose-50' : 'border-slate-200 focus:border-[#00875A] focus:ring-4 focus:ring-emerald-50'
                }`}
              />
              {customRelError && (
                <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 pt-1">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{customRelError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* NAVIGATION FOOTER BUTTONS */}
        <div className="pt-12 flex items-center justify-between border-t border-slate-200 mt-12">
          <button
            type="button"
            onClick={handleBackClick}
            className="px-7 py-3.5 border border-slate-200 rounded-full text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="px-8 py-3.5 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-full flex items-center space-x-2 transition-all shadow-md text-sm cursor-pointer group"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </main>

      {/* CONFIRMATION MODAL ON EXIT */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-[#0F172A]">Leave card creation?</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your progress so far will be lost if you return to the homepage. Are you sure you want to leave?
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-sm transition-colors cursor-pointer"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full text-sm transition-colors cursor-pointer shadow-md"
              >
                Yes, leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* START OVER MODAL */}
      <StartOverModal
        isOpen={showStartOverModal}
        onClose={() => setShowStartOverModal(false)}
        onConfirm={() => {
          setShowStartOverModal(false);
          resetWizard();
        }}
      />
    </div>
  );
};
