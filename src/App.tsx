/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { WizardProvider, useWizard } from './context/WizardContext';
import { Homepage } from './components/Homepage';
import { Wizard } from './components/Wizard';
import { AdminDashboard } from './components/AdminDashboard';

const WizardWrapper = ({
  onBackToHome,
  onOpenAdmin,
}: {
  onBackToHome: () => void;
  onOpenAdmin: () => void;
}) => {
  const { state } = useWizard();
  return (
    <Wizard
      key={state.cardSessionId}
      onBackToHome={onBackToHome}
      onOpenAdmin={onOpenAdmin}
    />
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'wizard' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin') return 'admin';
      if (window.location.hash === '#create' || window.location.hash === '#wizard') return 'wizard';
    }
    return 'home';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#admin') {
        setCurrentView('admin');
      } else if (hash === '#create' || hash === '#wizard') {
        setCurrentView('wizard');
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const switchView = (view: 'home' | 'wizard' | 'admin') => {
    setCurrentView(view);
    if (view === 'admin') {
      window.location.hash = 'admin';
    } else if (view === 'wizard') {
      window.location.hash = 'create';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.hash = '';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <WizardProvider>
      <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-sans antialiased selection:bg-teal-100 selection:text-teal-900 flex flex-col">
        <main className="w-full flex-1">
          {currentView === 'home' && (
            <Homepage
              onStartCreation={() => switchView('wizard')}
              onOpenAdmin={() => switchView('admin')}
            />
          )}

          {currentView === 'wizard' && (
            <div className="animate-fadeIn">
              <WizardWrapper
                onBackToHome={() => switchView('home')}
                onOpenAdmin={() => switchView('admin')}
              />
            </div>
          )}

          {currentView === 'admin' && (
            <div className="animate-fadeIn">
              <AdminDashboard
                onBackToWizard={() => switchView('wizard')}
                onBackToHome={() => switchView('home')}
              />
            </div>
          )}
        </main>
      </div>
    </WizardProvider>
  );
}
