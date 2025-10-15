import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Accounts } from './pages/Accounts';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Documentation } from './pages/Documentation';
import { AIAssistant } from './pages/AIAssistant';
import { LandingPage } from './pages/LandingPage';
import { WelcomeModal } from './components/WelcomeModal';
import { AuthForm } from './components/AuthForm';
import { useStore } from './store/useSupabaseStore';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { initialize, initialized, loading, accounts } = useStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user && !initialized) {
      initialize();
    }
  }, [user, initialized, initialize]);

  useEffect(() => {
    if (initialized && user) {
      const hasCompletedWelcome = localStorage.getItem(`wealthtrack_welcome_completed_${user.id}`);
      if (!hasCompletedWelcome && accounts.length === 0) {
        setShowWelcome(true);
      }
    }
  }, [initialized, accounts, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !showAuth) {
    return (
      <LandingPage
        onGetStarted={() => {
          setAuthMode('signup');
          setShowAuth(true);
        }}
        onLogin={() => {
          setAuthMode('login');
          setShowAuth(true);
        }}
      />
    );
  }

  if (!user && showAuth) {
    return (
      <AuthForm
        onSuccess={() => {}}
        initialMode={authMode}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  if (loading || !initialized) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading WealthTrack Pro...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'accounts':
        return <Accounts />;
      case 'transactions':
        return <Transactions />;
      case 'budgets':
        return <Budgets />;
      case 'reports':
        return <Reports />;
      case 'ai-assistant':
        return <AIAssistant />;
      case 'settings':
        return <Settings />;
      case 'documentation':
        return <Documentation />;
      default:
        return <Dashboard />;
    }
  };

  const handleWelcomeComplete = async () => {
    if (user) {
      localStorage.setItem(`wealthtrack_welcome_completed_${user.id}`, 'true');
    }
    await initialize();
    setShowWelcome(false);
  };

  return (
    <>
      <WelcomeModal isOpen={showWelcome} onComplete={handleWelcomeComplete} />
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </Layout>
    </>
  );
}

export default App;
