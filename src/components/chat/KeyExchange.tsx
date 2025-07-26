/**
 * Key Exchange Setup Component
 * 
 * Handles initial setup and management of encryption keys
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Key, 
  Check, 
  AlertTriangle, 
  Loader2, 
  Copy, 
  Download,
  Users,
  Lock
} from 'lucide-react';
import { encryptionService } from '@/lib/encryption/e2e-chat';
import { toast } from 'react-hot-toast';

interface KeyExchangeProps {
  onSetupComplete?: () => void;
  className?: string;
}

export function KeyExchange({ onSetupComplete, className }: KeyExchangeProps) {
  const { data: session } = useSession();
  const [setupStatus, setSetupStatus] = useState<{
    hasKeys: boolean;
    publicKey: string | null;
    contactsWithKeys: number;
  }>({ hasKeys: false, publicKey: null, contactsWithKeys: 0 });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.uid) {
      loadEncryptionStatus();
    }
  }, [session?.user?.uid]);

  const loadEncryptionStatus = async () => {
    try {
      const status = await encryptionService.getEncryptionStatus();
      setSetupStatus(status);
      
      if (status.hasKeys) {
        setSetupProgress(100);
      }
    } catch (error) {
      console.error('Failed to load encryption status:', error);
      setError('Failed to load encryption status');
    }
  };

  const generateKeys = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      setSetupProgress(25);

      // Generate key pair
      const keyPair = await encryptionService.generateKeyPair();
      setSetupProgress(50);

      // Upload public key to server
      setIsUploading(true);
      const response = await fetch('/api/chat/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicKey: keyPair.publicKey,
          keyVersion: 1,
          algorithm: 'x25519-xsalsa20-poly1305'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to upload public key');
      }

      setSetupProgress(100);
      await loadEncryptionStatus();
      onSetupComplete?.();

      toast.success('Encryption setup complete!');
    } catch (error: any) {
      console.error('Key generation failed:', error);
      setError(error.message || 'Failed to generate encryption keys');
      setSetupProgress(0);
    } finally {
      setIsGenerating(false);
      setIsUploading(false);
    }
  };

  const copyPublicKey = async () => {
    if (setupStatus.publicKey) {
      try {
        await navigator.clipboard.writeText(setupStatus.publicKey);
        toast.success('Public key copied to clipboard');
      } catch (error) {
        toast.error('Failed to copy public key');
      }
    }
  };

  const downloadBackup = () => {
    if (setupStatus.publicKey) {
      const backupData = {
        publicKey: setupStatus.publicKey,
        userId: session?.user?.uid,
        timestamp: new Date().toISOString(),
        version: 1
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoryx-encryption-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Encryption backup downloaded');
    }
  };

  const revokeKeys = async () => {
    if (!confirm('Are you sure you want to revoke your encryption keys? This will disable encrypted messaging.')) {
      return;
    }

    try {
      const response = await fetch('/api/chat/keys', {
        method: 'DELETE'
      });

      if (response.ok) {
        await encryptionService.clearAllKeys();
        await loadEncryptionStatus();
        setSetupProgress(0);
        toast.success('Encryption keys revoked');
      } else {
        throw new Error('Failed to revoke keys');
      }
    } catch (error: any) {
      console.error('Failed to revoke keys:', error);
      setError(error.message || 'Failed to revoke encryption keys');
    }
  };

  const renderSetupStep = () => {
    if (!setupStatus.hasKeys) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Set Up End-to-End Encryption
            </CardTitle>
            <CardDescription>
              Enable secure messaging with end-to-end encryption. Your messages will be protected with military-grade cryptography.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Military-Grade Security</h4>
                  <p className="text-sm text-slate-600">Uses X25519 key exchange and XSalsa20-Poly1305 encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Key className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Zero-Knowledge</h4>
                  <p className="text-sm text-slate-600">AuditoryX cannot read your encrypted messages</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Contact Verification</h4>
                  <p className="text-sm text-slate-600">Verify message authenticity with public key signatures</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Forward Secrecy</h4>
                  <p className="text-sm text-slate-600">Past messages remain secure even if keys are compromised</p>
                </div>
              </div>
            </div>

            {/* Setup Progress */}
            {setupProgress > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Setup Progress</span>
                  <span>{setupProgress}%</span>
                </div>
                <Progress value={setupProgress} className="h-2" />
                <div className="text-xs text-slate-500">
                  {isGenerating && 'Generating encryption keys...'}
                  {isUploading && 'Uploading public key...'}
                  {setupProgress === 100 && 'Setup complete!'}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Setup Button */}
            <Button 
              onClick={generateKeys}
              disabled={isGenerating || isUploading}
              className="w-full"
              size="lg"
            >
              {isGenerating || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isGenerating ? 'Generating Keys...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Enable Encryption
                </>
              )}
            </Button>

            <div className="text-xs text-slate-500 text-center">
              Your private key never leaves your device. AuditoryX only stores your public key for contact discovery.
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Encryption Enabled
          </CardTitle>
          <CardDescription>
            End-to-end encryption is active. Your messages are secure.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                <Shield className="h-8 w-8 mx-auto mb-2" />
                Active
              </div>
              <div className="text-sm text-slate-600">Encryption Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {setupStatus.contactsWithKeys}
              </div>
              <div className="text-sm text-slate-600">Secure Contacts</div>
            </div>
            <div className="text-center">
              <Badge variant="default" className="text-xs">
                Version 1
              </Badge>
              <div className="text-sm text-slate-600 mt-1">Key Version</div>
            </div>
          </div>

          {/* Public Key Management */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Your Public Key</h4>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-slate-100 rounded text-xs font-mono break-all">
                  {setupStatus.publicKey?.substring(0, 64)}...
                </code>
                <Button
                  onClick={copyPublicKey}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Share this key with contacts to enable encrypted messaging
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={downloadBackup}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Backup
              </Button>
              <Button
                onClick={revokeKeys}
                variant="destructive"
                size="sm"
                className="flex-1"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Revoke Keys
              </Button>
            </div>
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Keep your backup safe:</strong> If you lose your device, you'll need the backup to restore your encryption keys. Without it, you won't be able to read your encrypted messages.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-slate-500">Please sign in to set up encryption</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {renderSetupStep()}
    </div>
  );
}