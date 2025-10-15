import { ReactNode, useState } from 'react';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Target,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard' },
    { name: 'Accounts', icon: Wallet, page: 'accounts' },
    { name: 'Transactions', icon: ArrowLeftRight, page: 'transactions' },
    { name: 'Budgets', icon: Target, page: 'budgets' },
    { name: 'Reports', icon: BarChart3, page: 'reports' },
    { name: 'AI Assistant', icon: Sparkles, page: 'ai-assistant' },
    { name: 'Settings', icon: Settings, page: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="flex h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">WealthTrack</h1>
                  <p className="text-xs text-gray-400">Pro</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.page;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      onNavigate(item.page);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-4 border-t border-gray-800">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                <p className="text-sm font-medium text-white mb-1">Need help?</p>
                <p className="text-xs text-blue-100 mb-3">Check out our documentation</p>
                <button
                  onClick={() => {
                    onNavigate('documentation');
                    setSidebarOpen(false);
                  }}
                  className="w-full bg-white/20 hover:bg-white/30 text-white text-sm py-2 rounded-lg transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-white capitalize">
                {currentPage}
              </h2>
              <div className="w-6 lg:hidden" />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-950 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
