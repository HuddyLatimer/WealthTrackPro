import {
  Book,
  Wallet,
  ArrowLeftRight,
  Target,
  BarChart3,
  Settings,
  Download,
  Upload,
  Calendar,
  TrendingUp,
  Shield,
  Database
} from 'lucide-react';
import { Card } from '../components/Card';

export function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      icon: Book,
      color: 'text-blue-500',
      items: [
        {
          title: 'Create Your First Account',
          description: 'Start by adding a checking, savings, or emergency savings account with your current balance.',
        },
        {
          title: 'Set Up Categories',
          description: 'Organize your finances with income and expense categories. Customize icons and colors to match your style.',
        },
        {
          title: 'Add Transactions',
          description: 'Record income and expenses to track where your money comes from and where it goes.',
        },
      ],
    },
    {
      title: 'Accounts',
      icon: Wallet,
      color: 'text-green-500',
      items: [
        {
          title: 'Account Types',
          description: 'Choose from checking, savings, or emergency savings accounts. Each type helps you organize different financial goals.',
        },
        {
          title: 'Balance Tracking',
          description: 'Your account balance updates automatically as you add transactions. View real-time balances on your dashboard.',
        },
        {
          title: 'Savings Goals',
          description: 'Set target amounts for savings and emergency accounts to track progress toward your financial goals.',
        },
      ],
    },
    {
      title: 'Transactions',
      icon: ArrowLeftRight,
      color: 'text-purple-500',
      items: [
        {
          title: 'Adding Transactions',
          description: 'Record income and expenses with descriptions, amounts, categories, and dates. Add optional notes for additional details.',
        },
        {
          title: 'Recurring Transactions',
          description: 'Set up automatic recurring transactions for regular income or bills. Choose daily, weekly, monthly, or yearly frequencies.',
        },
        {
          title: 'Transaction History',
          description: 'View, search, and filter all your transactions. Sort by date, amount, or category to find what you need.',
        },
      ],
    },
    {
      title: 'Budgets',
      icon: Target,
      color: 'text-orange-500',
      items: [
        {
          title: 'Setting Budgets',
          description: 'Create monthly spending limits for each expense category to control your spending and reach financial goals.',
        },
        {
          title: 'Budget Tracking',
          description: 'Monitor your spending against budgets in real-time. Visual indicators show when you\'re approaching or exceeding limits.',
        },
        {
          title: 'Budget Alerts',
          description: 'Get visual warnings when you reach 80% or exceed 100% of your budget for any category.',
        },
      ],
    },
    {
      title: 'Reports & Analytics',
      icon: BarChart3,
      color: 'text-cyan-500',
      items: [
        {
          title: 'Income vs Expenses',
          description: 'View monthly trends comparing your total income to expenses. Identify patterns and opportunities to save.',
        },
        {
          title: 'Category Breakdown',
          description: 'See pie charts showing how your spending is distributed across categories. Understand where your money goes.',
        },
        {
          title: 'Spending Trends',
          description: 'Analyze spending patterns over time with interactive charts. Track your financial progress month by month.',
        },
      ],
    },
    {
      title: 'Settings & Data',
      icon: Settings,
      color: 'text-red-500',
      items: [
        {
          title: 'Export Data',
          description: 'Download all your financial data as a JSON file for backup or analysis in other tools.',
        },
        {
          title: 'Import Data',
          description: 'Restore previously exported data to migrate between devices or recover from backups.',
        },
        {
          title: 'Clear All Data',
          description: 'Reset the application by removing all accounts, transactions, and settings. Use with caution.',
        },
      ],
    },
  ];

  const features = [
    {
      icon: Database,
      title: 'Local Storage',
      description: 'All your data is stored securely on your device using IndexedDB. Your financial information never leaves your computer.',
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'No accounts, no cloud sync, no tracking. Your financial data is completely private and under your control.',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Updates',
      description: 'Balances, budgets, and reports update instantly as you add or modify transactions.',
    },
    {
      icon: Calendar,
      title: 'Recurring Automation',
      description: 'Set up recurring transactions once and let the app automatically create them on schedule.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/50">
          <Book className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Everything you need to know about managing your finances with WealthTrack Pro
        </p>
      </div>

      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-400">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {sections.map((section, sectionIndex) => {
        const SectionIcon = section.icon;
        return (
          <Card key={sectionIndex}>
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <SectionIcon className={`w-8 h-8 ${section.color}`} />
                <h2 className="text-2xl font-bold text-white">{section.title}</h2>
              </div>
              <div className="space-y-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}

      <Card>
        <div className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Tips for Success</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-400 text-sm font-bold">1</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Record Transactions Regularly</h3>
                <p className="text-gray-400 text-sm">Add transactions as they happen or review your accounts weekly to keep your data accurate.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-400 text-sm font-bold">2</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Set Realistic Budgets</h3>
                <p className="text-gray-400 text-sm">Review past spending in Reports to set achievable budget targets. Adjust monthly as needed.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-400 text-sm font-bold">3</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Use Recurring Transactions</h3>
                <p className="text-gray-400 text-sm">Set up recurring transactions for regular bills and income to automate tracking and never miss an entry.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-400 text-sm font-bold">4</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Export Regular Backups</h3>
                <p className="text-gray-400 text-sm">Download your data monthly from Settings as a backup. Store it securely in case you need to restore.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-400 text-sm font-bold">5</span>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Review Reports Monthly</h3>
                <p className="text-gray-400 text-sm">Check your spending trends and category breakdowns each month to identify areas for improvement.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-8 bg-gradient-to-br from-blue-600/10 to-purple-600/10">
          <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
          <p className="text-gray-400 mb-6">
            WealthTrack Pro is designed to be intuitive and easy to use. Explore the app and experiment with different features. Your data is stored locally, so you can always reset and start fresh from the Settings page if needed.
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <Download className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Export your data anytime</span>
            </div>
            <div className="inline-flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <Upload className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">Import to restore backups</span>
            </div>
            <div className="inline-flex items-center space-x-2 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-300">100% private and secure</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
