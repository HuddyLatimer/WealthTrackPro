import { useState } from 'react';
import { Upload, Download, Trash2, Database, AlertTriangle, LogOut, User } from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useStore } from '../store/useSupabaseStore';
import { supabase } from '../lib/supabase';
import { downloadJSON } from '../lib/utils';
import { format } from 'date-fns';

export function Settings() {
  const { exportData, importData, clearAllData, accounts, transactions, categories } = useStore();
  const [importing, setImporting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  });

  const handleExport = async () => {
    const data = await exportData();
    downloadJSON(data, `wealthtrack-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = event.target?.result as string;
        await importData(jsonData);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Failed to import data. Please check the file format.');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (
      confirm(
        'Are you sure you want to clear all data? This action cannot be undone. Make sure to export your data first!'
      )
    ) {
      const confirmed = confirm('This will delete ALL accounts, transactions, categories, and budgets. Are you absolutely sure?');
      if (confirmed) {
        await clearAllData();
        alert('All data has been cleared.');
        window.location.reload();
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Settings</h2>
        <p className="text-gray-400 mt-1">Manage your application settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <User className="w-6 h-6 text-purple-500" />
            <h3 className="text-lg font-bold text-white">Account</h3>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <p className="text-white font-medium">{user?.email || 'Loading...'}</p>
            </div>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-bold text-white">Database Statistics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Accounts</span>
              <span className="font-bold text-white">{accounts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Categories</span>
              <span className="font-bold text-white">{categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transactions</span>
              <span className="font-bold text-white">{transactions.length}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Download className="w-6 h-6 text-green-500" />
          <h3 className="text-lg font-bold text-white">Export Data</h3>
        </div>
        <p className="text-gray-400 mb-4">
          Download all your financial data as a JSON file. This includes accounts, transactions,
          categories, budgets, and recurring transactions.
        </p>
        <Button onClick={handleExport} variant="secondary">
          <Download className="w-5 h-5 mr-2" />
          Export All Data
        </Button>
      </Card>

      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Upload className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-bold text-white">Import Data</h3>
        </div>
        <p className="text-gray-400 mb-4">
          Restore your data from a previously exported JSON file. This will add to your current data.
        </p>
        <div className="bg-orange-900/20 border border-orange-700 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-300 mb-1">Warning</p>
              <p className="text-sm text-orange-200">
                Importing data will add all items from the file to your existing data.
              </p>
            </div>
          </div>
        </div>
        <label className="inline-block">
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
          />
          <span className="inline-block">
            <Button variant="secondary" disabled={importing}>
              <Upload className="w-5 h-5 mr-2" />
              {importing ? 'Importing...' : 'Choose File to Import'}
            </Button>
          </span>
        </label>
      </Card>

      <Card>
        <div className="flex items-center space-x-3 mb-4">
          <Trash2 className="w-6 h-6 text-red-500" />
          <h3 className="text-lg font-bold text-white">Danger Zone</h3>
        </div>
        <p className="text-gray-400 mb-4">
          Clear all data from the application. This action is irreversible.
        </p>
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-300 mb-1">Danger</p>
              <p className="text-sm text-red-200">
                This will permanently delete all accounts, transactions, categories, budgets, and
                recurring transactions. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <Button variant="danger" onClick={handleClearData}>
          <Trash2 className="w-5 h-5 mr-2" />
          Clear All Data
        </Button>
      </Card>

      <Card>
        <h3 className="text-lg font-bold text-white mb-4">About WealthTrack Pro</h3>
        <div className="space-y-2 text-sm text-gray-400">
          <p>
            WealthTrack Pro is a comprehensive personal finance management application designed to
            help you track income, expenses, budgets, and savings goals.
          </p>
          <p className="pt-2">
            <strong className="text-white">Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Multiple account management</li>
            <li>Transaction tracking with categories</li>
            <li>Budget planning and monitoring</li>
            <li>Financial reports and analytics</li>
            <li>Data export and import</li>
            <li>Secure cloud storage with Supabase</li>
          </ul>
          <p className="pt-4 text-xs text-gray-500">
            Version 2.0.0 • Data securely stored in the cloud
          </p>
        </div>
      </Card>
    </div>
  );
}
