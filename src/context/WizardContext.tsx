import type { CardStyle } from '../components/CardTemplates';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const INITIAL_CARD_STATE = {
  recipientName: 'John Doe',
  relationship: 'My Colleague.',
  isCustomRelationship: false,
  photoUrl: '/african_executive_portrait.jpg',
  selectedTraits: ['Challenged me to grow', 'Opened new opportunities'],
  message: 'You didn’t just give direction; you challenged me to grow and gave me my first opportunity, challenged me to grow, and stood by me when it mattered most. I am truly grateful for your leadership.',
  useAiMessage: false,
  creatorFirstName: 'Victoria',
  creatorLastName: 'Okodu',
  creatorEmail: '',
  creatorJobTitle: 'Developer',
  creatorCompany: '',
  creatorIndustry: '',
  creatorPhone: '',
  marketingConsent: false,
  cardStyle: 'classic' as CardStyle,
};

export type WizardState = {
  step: number;
  cardSessionId: string;
  data: typeof INITIAL_CARD_STATE;
};

const SESSION_PREFIX = 'pluto_card_draft_';
const SESSION_META_PREFIX = 'pluto_card_meta_';

const generateNewSessionId = () => {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
  } catch {
    // fallback
  }
  return 'session_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const getInitialWizardState = (): WizardState => {
  if (typeof window === 'undefined') {
    return {
      step: 1,
      cardSessionId: generateNewSessionId(),
      data: { ...INITIAL_CARD_STATE },
    };
  }

  try {
    // Check if there is an active session id in sessionStorage
    const activeSessionId = sessionStorage.getItem('pluto_active_card_session');
    if (activeSessionId) {
      const draftKey = SESSION_PREFIX + activeSessionId;
      const metaKey = SESSION_META_PREFIX + activeSessionId;
      const savedDraft = localStorage.getItem(draftKey);
      const savedMeta = localStorage.getItem(metaKey);

      if (savedDraft && savedMeta) {
        const meta = JSON.parse(savedMeta);
        const createdAt = meta.createdAt || 0;
        const twentyFourHours = 24 * 60 * 60 * 1000;

        // Check if draft is older than 24 hours or marked completed
        if (Date.now() - createdAt < twentyFourHours && !meta.completed) {
          const parsedData = JSON.parse(savedDraft);
          return {
            step: typeof parsedData.step === 'number' && parsedData.step >= 1 ? parsedData.step : 1,
            cardSessionId: activeSessionId,
            data: { ...INITIAL_CARD_STATE, ...parsedData.data },
          };
        } else {
          // Expired or completed, clean up
          localStorage.removeItem(draftKey);
          localStorage.removeItem(metaKey);
          sessionStorage.removeItem('pluto_active_card_session');
        }
      }
    }
  } catch (e) {
    console.warn('Error recovering active session:', e);
  }

  // Default fresh session
  const newId = generateNewSessionId();
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('pluto_active_card_session', newId);
      localStorage.setItem(
        SESSION_META_PREFIX + newId,
        JSON.stringify({ createdAt: Date.now(), completed: false })
      );
    } catch (e) {
      // ignore
    }
  }

  return {
    step: 1,
    cardSessionId: newId,
    data: { ...INITIAL_CARD_STATE },
  };
};

const WizardContext = createContext<{
  state: WizardState;
  updateData: (newData: Partial<WizardState['data']>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  resetWizard: () => void;
  createNewSession: () => void;
} | undefined>(undefined);

export const WizardProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<WizardState>(getInitialWizardState);

  // Sync state to namespaced localStorage draft on update
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const draftKey = SESSION_PREFIX + state.cardSessionId;
      localStorage.setItem(draftKey, JSON.stringify(state));
      sessionStorage.setItem('pluto_active_card_session', state.cardSessionId);
    } catch (e) {
      console.warn('Error saving session draft:', e);
    }
  }, [state]);

  const updateData = (newData: Partial<WizardState['data']>) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, ...newData },
    }));
  };

  const nextStep = () => setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 7) }));
  const prevStep = () => setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  const goToStep = (step: number) => setState((prev) => ({ ...prev, step: Math.max(1, Math.min(step, 7)) }));

  // Mark session as completed
  const markSessionCompleted = (sessionId: string) => {
    if (typeof window === 'undefined') return;
    try {
      const metaKey = SESSION_META_PREFIX + sessionId;
      const savedMeta = localStorage.getItem(metaKey);
      if (savedMeta) {
        const meta = JSON.parse(savedMeta);
        meta.completed = true;
        localStorage.setItem(metaKey, JSON.stringify(meta));
      }
      sessionStorage.removeItem('pluto_active_card_session');
    } catch {
      // ignore
    }
  };

  const createNewSession = () => {
    markSessionCompleted(state.cardSessionId);

    const newId = generateNewSessionId();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pluto_active_card_session', newId);
        localStorage.setItem(
          SESSION_META_PREFIX + newId,
          JSON.stringify({ createdAt: Date.now(), completed: false })
        );
      } catch {
        // ignore
      }
    }

    setState({
      step: 1,
      cardSessionId: newId,
      data: { ...INITIAL_CARD_STATE },
    });
  };

  const resetWizard = () => {
    createNewSession();
  };

  return (
    <WizardContext.Provider
      value={{
        state,
        updateData,
        nextStep,
        prevStep,
        goToStep,
        resetWizard,
        createNewSession,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) throw new Error('useWizard must be used within a WizardProvider');
  return context;
};
