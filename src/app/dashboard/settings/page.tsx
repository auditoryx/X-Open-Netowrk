'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { toggleMFA, getUserMFASettings, MFASettings } from '@/src/lib/firestore/toggleMFA';
import { Settings, Shield, CreditCard, Bell, User, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [mfaSettings, setMfaSettings] = useState<MFASettings | null>(null);
  const [mfaLoading, setMfaLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadMFASettings();
    }
  }, [user]);

  const loadMFASettings = async () => {
    if (!user?.uid) return;
    try {
      const settings = await getUserMFASettings(user.uid);
      setMfaSettings(settings);
    } catch (error) {
      console.error('Error loading MFA settings:', error);
    }
  };

  const handleStripeConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Failed to start Stripe onboarding.');
        setLoading(false);
      }
    } catch (error) {
      toast.error('Error connecting to Stripe');
      setLoading(false);
    }
  };

  const handleMFAToggle = async (enabled: boolean) => {
    if (!user?.uid) {
      toast.error('You must be logged in to change MFA settings');
      return;
    }

    setMfaLoading(true);
    try {
      await toggleMFA(user.uid, enabled);
      await loadMFASettings(); // Reload settings
      toast.success(
        enabled 
          ? 'Multi-factor authentication enabled successfully' 
          : 'Multi-factor authentication disabled'
      );
    } catch (error) {
      console.error('Error toggling MFA:', error);
      toast.error('Failed to update MFA settings');
    } finally {
      setMfaLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Please log in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="w-8 h-8 text-gray-700 dark:text-gray-300" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account preferences and security settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Protect your account with additional security measures
              </p>
            </div>

            <div className="p-6">
              {/* MFA Setting */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Multi-Factor Authentication (MFA)
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Add an extra layer of security to your account with TOTP authentication
                    </p>
                    {mfaSettings?.mfaEnabled && (
                      <div className="flex items-center space-x-2 mt-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600 dark:text-green-400">
                          MFA is enabled ({mfaSettings.mfaMethod?.toUpperCase()})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {mfaSettings?.mfaEnabled && mfaSettings.backupCodes && (
                    <button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Backup Codes
                    </button>
                  )}
                  
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mfaSettings?.mfaEnabled || false}
                      onChange={(e) => handleMFAToggle(e.target.checked)}
                      disabled={mfaLoading}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Backup Codes */}
              {showBackupCodes && mfaSettings?.backupCodes && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                        Backup Codes
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                        Store these codes securely. Each can only be used once to access your account if you lose your authenticator.
                      </p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                        {mfaSettings.backupCodes.map((code, index) => (
                          <div key={index} className="bg-white dark:bg-gray-800 p-2 rounded border">
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MFA Setup Instructions */}
              {mfaSettings?.mfaEnabled && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                    How to use MFA
                  </h4>
                  <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>1. Download an authenticator app (Google Authenticator, Authy, etc.)</li>
                    <li>2. Scan the QR code or enter the setup key when prompted</li>
                    <li>3. Enter the 6-digit code from your app when logging in</li>
                    <li>4. Keep your backup codes in a safe place</li>
                  </ol>
                </div>
              )}
            </div>
          </div>

          {/* Payment Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payments</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your payment methods and payout settings
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Stripe Connect</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect your Stripe account to receive payments
                  </p>
                </div>
                <button
                  onClick={handleStripeConnect}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Connect Stripe</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Update your profile and account preferences
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                    Change
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">••••••••</p>
                  </div>
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Control how you receive notifications
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive notifications about bookings and messages
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Push Notifications</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
