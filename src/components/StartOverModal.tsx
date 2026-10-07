import React from 'react';
import { RotateCcw } from 'lucide-react';

interface StartOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const StartOverModal: React.FC<StartOverModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6 text-center">
        <div className="w-14 h-14 bg-teal-50 text-[#00875A] rounded-2xl mx-auto flex items-center justify-center">
          <RotateCcw className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-extrabold text-[#0F172A]">Start over?</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your current card information will be cleared and you’ll start again from the beginning.
          </p>
        </div>
        <div className="flex items-center space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-sm transition-colors cursor-pointer"
          >
            KEEP EDITING
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#00875A] hover:bg-[#00704A] text-white font-bold rounded-full text-sm transition-colors cursor-pointer shadow-md"
          >
            START OVER
          </button>
        </div>
      </div>
    </div>
  );
};
