/**
 * Security Indicator Component
 * 
 * Shows encryption status and security information for chat
 */

'use client';

import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldX, Info, Key, Lock, AlertTriangle } from 'lucide-react';

interface SecurityIndicatorProps {
  encryptionStatus: 'enabled' | 'disabled' | 'error' | 'initializing';
  sessionId?: string;
  keyRotationEnabled?: boolean;
  onRotateKeys?: () => Promise<void>;
  showDetails?: boolean;
}

const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({
  encryptionStatus,
  sessionId,
  keyRotationEnabled = true,
  onRotateKeys,
  showDetails = false,
}) => {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);

  const getStatusConfig = () => {
    switch (encryptionStatus) {
      case 'enabled':
        return {
          icon: ShieldCheck,
          text: 'End-to-end encrypted',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          description: 'Your messages are secured with end-to-end encryption. Only you and the recipient can read them.',
        };
      case 'disabled':
        return {
          icon: Shield,
          text: 'Encryption disabled',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          description: 'Messages are not encrypted. Consider enabling encryption for better security.',
        };
      case 'error':
        return {
          icon: ShieldX,
          text: 'Encryption error',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          description: 'There was an error with encryption. Please refresh the page or contact support.',
        };
      case 'initializing':
        return {
          icon: Shield,
          text: 'Initializing encryption...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          description: 'Setting up secure encryption for your conversation.',
        };
      default:
        return {
          icon: Shield,
          text: 'Unknown status',
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          description: 'Encryption status unknown.',
        };
    }
  };

  const handleRotateKeys = async () => {
    if (!onRotateKeys || isRotatingKeys) return;

    setIsRotatingKeys(true);
    try {
      await onRotateKeys();
    } catch (error) {
      console.error('Key rotation failed:', error);
    } finally {
      setIsRotatingKeys(false);
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className="relative">
      {/* Main Status Indicator */}
      <div 
        className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}
      >
        <IconComponent className={`w-4 h-4 ${config.color} ${encryptionStatus === 'initializing' ? 'animate-spin' : ''}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        
        {showDetails && (
          <button
            onClick={() => setShowInfoModal(true)}
            className={`p-1 rounded-full hover:bg-gray-200 ${config.color}`}
          >
            <Info className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Detailed Security Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                Security Information
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Encryption Status */}
              <div className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <IconComponent className={`w-5 h-5 ${config.color}`} />
                  <span className={`font-medium ${config.color}`}>
                    {config.text}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {config.description}
                </p>
              </div>

              {/* Technical Details */}
              {encryptionStatus === 'enabled' && (
                <div className="space-y-3">
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Technical Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Algorithm:</span>
                        <span className="font-mono">ECDH-P256 + AES-256-GCM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Key Exchange:</span>
                        <span className="font-mono">Elliptic Curve Diffie-Hellman</span>
                      </div>
                      {sessionId && (
                        <div className="flex justify-between">
                          <span>Session ID:</span>
                          <span className="font-mono text-xs">{sessionId.substring(0, 12)}...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-gray-900 mb-2">Security Features</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Perfect Forward Secrecy</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Message Authentication</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Key Rotation Support</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Client-Side Encryption</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Management */}
                  {keyRotationEnabled && onRotateKeys && (
                    <div className="border-t pt-3">
                      <h4 className="font-medium text-gray-900 mb-2">Key Management</h4>
                      <button
                        onClick={handleRotateKeys}
                        disabled={isRotatingKeys}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Key className={`w-4 h-4 ${isRotatingKeys ? 'animate-spin' : ''}`} />
                        <span>
                          {isRotatingKeys ? 'Rotating Keys...' : 'Rotate Encryption Keys'}
                        </span>
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        Generates new encryption keys for enhanced security
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Security Warning for Disabled/Error States */}
              {(encryptionStatus === 'disabled' || encryptionStatus === 'error') && (
                <div className="border-t pt-3">
                  <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Security Notice
                      </p>
                      <p className="text-sm text-yellow-700">
                        {encryptionStatus === 'disabled' 
                          ? 'Your messages are not encrypted and may be visible to third parties.'
                          : 'Encryption is not working properly. Please refresh the page or contact support.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowInfoModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityIndicator;