import { useState } from 'react';
import { Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from './Button';
import { Modal, FormField, Input, Select } from './Modal';
import { useStore } from '../store/useSupabaseStore';

interface WelcomeModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function WelcomeModal({ isOpen, onComplete }: WelcomeModalProps) {
  const [step, setStep] = useState(1);
  const { addAccount, addCategory } = useStore();

  const [accountData, setAccountData] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'emergency_savings',
    balance: '',
  });

  const defaultCategories = [
    { name: 'Salary', type: 'income' as const, icon: 'Briefcase', color: '#10b981' },
    { name: 'Freelance', type: 'income' as const, icon: 'Laptop', color: '#3b82f6' },
    { name: 'Investments', type: 'income' as const, icon: 'TrendingUp', color: '#8b5cf6' },
    { name: 'Groceries', type: 'expense' as const, icon: 'ShoppingCart', color: '#ef4444' },
    { name: 'Rent', type: 'expense' as const, icon: 'Home', color: '#f59e0b' },
    { name: 'Utilities', type: 'expense' as const, icon: 'Zap', color: '#eab308' },
    { name: 'Transportation', type: 'expense' as const, icon: 'Car', color: '#06b6d4' },
    { name: 'Entertainment', type: 'expense' as const, icon: 'Film', color: '#ec4899' },
    { name: 'Healthcare', type: 'expense' as const, icon: 'Heart', color: '#f43f5e' },
    { name: 'Dining', type: 'expense' as const, icon: 'Coffee', color: '#f97316' },
  ];

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    await addAccount({
      name: accountData.name,
      type: accountData.type,
      balance: parseFloat(accountData.balance) || 0,
      color: accountData.type === 'checking' ? '#3b82f6' : accountData.type === 'savings' ? '#10b981' : '#f59e0b',
    });

    setStep(2);
  };

  const handleSetupCategories = async () => {
    for (const cat of defaultCategories) {
      await addCategory(cat);
    }
    setStep(3);
  };

  const handleComplete = () => {
    onComplete();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="" maxWidth="lg">
      <div className="py-4">
        {step === 1 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/50">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Welcome to WealthTrack Pro</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Take control of your finances with powerful budgeting, tracking, and reporting tools. Let's get you started by creating your first account.
            </p>

            <form onSubmit={handleCreateAccount} className="max-w-md mx-auto text-left">
              <FormField label="Account Name">
                <Input
                  value={accountData.name}
                  onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                  placeholder="e.g., Main Checking"
                  required
                  autoFocus
                />
              </FormField>

              <FormField label="Account Type">
                <Select
                  value={accountData.type}
                  onChange={(e) => setAccountData({ ...accountData, type: e.target.value as any })}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                  <option value="emergency_savings">Emergency Savings</option>
                </Select>
              </FormField>

              <FormField label="Starting Balance">
                <Input
                  type="number"
                  step="0.01"
                  value={accountData.balance}
                  onChange={(e) => setAccountData({ ...accountData, balance: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </FormField>

              <Button type="submit" fullWidth size="lg" className="mt-2">
                Create Account <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-600/50">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Account Created!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Now let's set up categories to help you organize your income and expenses. We'll add some common categories to get you started.
            </p>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-white mb-4">Default Categories</h3>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <p className="text-sm font-medium text-green-400 mb-2">Income</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Salary</li>
                    <li>• Freelance</li>
                    <li>• Investments</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-red-400 mb-2">Expenses</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Groceries</li>
                    <li>• Rent</li>
                    <li>• Utilities</li>
                    <li>• Transportation</li>
                    <li>• Entertainment</li>
                    <li>• Healthcare</li>
                    <li>• Dining</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button onClick={handleSetupCategories} fullWidth size="lg" className="max-w-md mx-auto">
              Set Up Categories <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-600/50">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">All Set!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Your account and categories are ready. You can now start tracking your transactions, setting budgets, and analyzing your financial data.
            </p>

            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6 mb-8 max-w-md mx-auto text-left">
              <h3 className="text-lg font-bold text-white mb-3">Quick Tips</h3>
              <ul className="text-sm text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Add transactions from the Transactions page</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Set monthly budgets for each category</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>View detailed reports and analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Export your data anytime from Settings</span>
                </li>
              </ul>
            </div>

            <Button onClick={handleComplete} fullWidth size="lg" className="max-w-md mx-auto">
              Get Started <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
