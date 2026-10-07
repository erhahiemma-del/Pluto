import React from 'react';
import { useWizard } from '../context/WizardContext';
import { User, Camera, Sparkles, FileText, Send, Check } from 'lucide-react';

interface ProgressBarProps {
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ className = '' }) => {
  const { state, goToStep } = useWizard();

  // 5 Stages matching specification:
  // 1: Thank, 2: Photo, 3: Personalise, 4: Your Details, 5: Create
  const stages = [
    { label: 'Thank', icon: User, stepTarget: 1 },
    { label: 'Photo', icon: Camera, stepTarget: 2 },
    { label: 'Personalise', icon: Sparkles, stepTarget: 3 },
    { label: 'Your Details', icon: FileText, stepTarget: 4 },
    { label: 'Create', icon: Send, stepTarget: 5 },
  ];

  const activeIndex = Math.max(0, Math.min(state.step - 1, 4));

  return (
    <div className={`w-full max-w-2xl mx-auto px-4 ${className}`}>
      <div className="flex items-center justify-between relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isFuture = idx > activeIndex;

          return (
            <React.Fragment key={stage.label}>
              {/* Stage Node */}
              <div className="flex flex-col items-center relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    if (isCompleted) {
                      goToStep(stage.stepTarget);
                    }
                  }}
                  disabled={!isCompleted}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 select-none ${
                    isCompleted
                      ? 'bg-[#00875A] text-white hover:bg-[#00704A] cursor-pointer shadow-xs'
                      : isCurrent
                      ? 'bg-white border-2 border-[#00875A] text-[#00875A] ring-4 ring-emerald-50 cursor-default'
                      : 'bg-white border border-slate-200 text-slate-400 cursor-default'
                  }`}
                  title={
                    isCompleted
                      ? 'Return to this step'
                      : isCurrent
                      ? 'Current step'
                      : 'Available later'
                  }
                  aria-label={`${stage.label} stage ${
                    isCompleted ? '(Completed)' : isCurrent ? '(Current)' : '(Upcoming)'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        isCurrent ? 'text-[#0F172A] stroke-[2.2]' : 'text-slate-400 stroke-[1.8]'
                      }`}
                    />
                  )}
                </button>

                <span
                  className={`text-xs mt-2 transition-colors whitespace-nowrap ${
                    isCurrent
                      ? 'font-bold text-[#0F172A]'
                      : isCompleted
                      ? 'font-semibold text-[#00875A]'
                      : 'font-medium text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connecting Line between stages */}
              {idx < stages.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 h-[2px] relative -mt-5">
                  <div className="absolute inset-0 bg-slate-200" />
                  {/* Fill progress line */}
                  <div
                    className={`h-full transition-all duration-300 ${
                      idx < activeIndex
                        ? 'w-full bg-[#00875A]'
                        : idx === activeIndex
                        ? 'w-1/2 bg-[#00875A]'
                        : 'w-0'
                    }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
