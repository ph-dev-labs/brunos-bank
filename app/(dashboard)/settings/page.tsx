"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);
  
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your app preferences and notifications</p>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold mb-6">Notifications</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Email Alerts</p>
              <p className="text-sm text-gray-400">Receive transaction receipts and security alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={emailAlerts} onChange={(e) => setEmailAlerts(e.target.checked)} />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">SMS Alerts</p>
              <p className="text-sm text-gray-400">Get text messages for large transfers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={smsAlerts} onChange={(e) => setSmsAlerts(e.target.checked)} />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold mb-6">Security Preferences</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Two-Factor Authentication (OTP)</p>
              <p className="text-sm text-gray-400">Require an email code when signing in</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} disabled />
              <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          <p className="text-xs text-primary-400">OTP is currently enforced for all accounts for maximum security.</p>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-display font-semibold mb-6">Appearance</h2>
        <div className="flex items-center gap-4">
          <button className="flex-1 py-4 border-2 border-primary-500 bg-primary-500/10 rounded-xl text-center">
            <span className="block text-xl mb-2">🌙</span>
            <span className="text-sm font-medium">Dark Mode</span>
          </button>
          <button className="flex-1 py-4 border-2 border-transparent bg-dark-700 opacity-50 cursor-not-allowed rounded-xl text-center">
            <span className="block text-xl mb-2">☀️</span>
            <span className="text-sm font-medium">Light Mode (Soon)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
