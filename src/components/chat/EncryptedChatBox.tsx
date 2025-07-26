/**
 * Encrypted Chat Box Component
 * 
 * Provides end-to-end encrypted messaging interface
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Lock, LockOpen, Send, AlertTriangle, Check, Shield } from 'lucide-react';
import { encryptionService, type EncryptedMessage, type DecryptedMessage } from '@/lib/encryption/e2e-chat';
import { cn } from '@/lib/utils';

interface EncryptedChatBoxProps {
  contactId: string;
  contactName: string;
  threadId?: string;
  className?: string;
  onEncryptionStatusChange?: (isEncrypted: boolean) => void;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
  isEncrypted: boolean;
  isVerified?: boolean;
  isOwn: boolean;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

export function EncryptedChatBox({
  contactId,
  contactName,
  threadId,
  className,
  onEncryptionStatusChange
}: EncryptedChatBoxProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [keyExchangeStatus, setKeyExchangeStatus] = useState<'none' | 'pending' | 'complete' | 'failed'>('none');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize encryption and load messages
  useEffect(() => {
    if (session?.user?.uid && contactId) {
      initializeEncryption();
      loadMessages();
    }
  }, [session?.user?.uid, contactId, threadId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeEncryption = async () => {
    try {
      setIsLoading(true);
      
      // Check if encryption is available for this contact
      const canEncrypt = await encryptionService.canEncryptTo(contactId);
      
      if (canEncrypt) {
        setEncryptionEnabled(true);
        setKeyExchangeStatus('complete');
      } else {
        // Try to get contact's public key from server
        const response = await fetch(`/api/chat/keys?userIds=${contactId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.keys[contactId]) {
            await encryptionService.storeContactPublicKey(contactId, data.keys[contactId].publicKey);
            setEncryptionEnabled(true);
            setKeyExchangeStatus('complete');
          } else {
            setKeyExchangeStatus('none');
          }
        }
      }

      onEncryptionStatusChange?.(encryptionEnabled);
    } catch (error) {
      console.error('Encryption initialization failed:', error);
      setError('Failed to initialize encryption');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (threadId) {
        queryParams.set('threadId', threadId);
      } else {
        queryParams.set('contactId', contactId);
      }

      const response = await fetch(`/api/chat/encrypted?${queryParams}`);
      if (response.ok) {
        const data = await response.json();
        
        // Decrypt messages
        const decryptedMessages: Message[] = [];
        
        for (const encryptedMsg of data.messages) {
          try {
            if (encryptedMsg.isEncrypted) {
              const decrypted = await encryptionService.decryptMessage(
                {
                  encryptedContent: encryptedMsg.encryptedContent,
                  nonce: encryptedMsg.nonce,
                  senderPublicKey: encryptedMsg.senderPublicKey,
                  timestamp: new Date(encryptedMsg.createdAt).getTime(),
                  messageId: encryptedMsg.messageId
                },
                encryptedMsg.senderId
              );

              decryptedMessages.push({
                id: encryptedMsg.messageId,
                content: decrypted.content,
                senderId: encryptedMsg.senderId,
                timestamp: decrypted.timestamp,
                isEncrypted: true,
                isVerified: decrypted.isVerified,
                isOwn: encryptedMsg.senderId === session?.user?.uid
              });
            } else {
              // Handle non-encrypted messages (fallback)
              decryptedMessages.push({
                id: encryptedMsg.messageId || encryptedMsg.id,
                content: encryptedMsg.content || '[Encrypted message - unable to decrypt]',
                senderId: encryptedMsg.senderId,
                timestamp: new Date(encryptedMsg.createdAt).getTime(),
                isEncrypted: false,
                isOwn: encryptedMsg.senderId === session?.user?.uid
              });
            }
          } catch (decryptError) {
            console.error('Failed to decrypt message:', decryptError);
            // Show encrypted message placeholder
            decryptedMessages.push({
              id: encryptedMsg.messageId || encryptedMsg.id,
              content: '[Unable to decrypt this message]',
              senderId: encryptedMsg.senderId,
              timestamp: new Date(encryptedMsg.createdAt).getTime(),
              isEncrypted: false,
              isOwn: encryptedMsg.senderId === session?.user?.uid,
              status: 'failed'
            });
          }
        }

        setMessages(decryptedMessages.reverse()); // Messages come in desc order
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    }
  };

  const initiateKeyExchange = async () => {
    try {
      setKeyExchangeStatus('pending');
      
      // Generate our key pair if we don't have one
      let myPublicKey = await encryptionService.getPublicKey();
      if (!myPublicKey) {
        const keyPair = await encryptionService.generateKeyPair();
        myPublicKey = keyPair.publicKey;
        
        // Store our public key on server
        await fetch('/api/chat/keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicKey: myPublicKey })
        });
      }

      // Initiate key exchange
      const response = await fetch('/api/chat/keys', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientUserId: contactId,
          publicKey: myPublicKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        await encryptionService.storeContactPublicKey(contactId, data.recipientPublicKey);
        setEncryptionEnabled(true);
        setKeyExchangeStatus('complete');
        onEncryptionStatusChange?.(true);
      } else {
        setKeyExchangeStatus('failed');
        const errorData = await response.json();
        setError(errorData.error || 'Key exchange failed');
      }
    } catch (error) {
      console.error('Key exchange failed:', error);
      setKeyExchangeStatus('failed');
      setError('Key exchange failed');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);
    setError(null);

    // Add optimistic message
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      senderId: session!.user!.uid,
      timestamp: Date.now(),
      isEncrypted: encryptionEnabled,
      isOwn: true,
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);

    try {
      if (encryptionEnabled) {
        // Encrypt and send
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const encryptedMessage = await encryptionService.encryptMessage(
          messageContent,
          contactId,
          messageId
        );

        const response = await fetch('/api/chat/encrypted', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientId: contactId,
            encryptedContent: encryptedMessage.encryptedContent,
            nonce: encryptedMessage.nonce,
            senderPublicKey: encryptedMessage.senderPublicKey,
            threadId,
            messageType: 'text'
          })
        });

        if (response.ok) {
          const data = await response.json();
          
          // Update optimistic message
          setMessages(prev => prev.map(msg => 
            msg.id === optimisticMessage.id 
              ? { ...msg, id: data.messageId, status: 'sent' }
              : msg
          ));
        } else {
          throw new Error('Failed to send encrypted message');
        }
      } else {
        // Fallback to unencrypted message (if supported)
        throw new Error('Encryption not available');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      
      // Update optimistic message to failed
      setMessages(prev => prev.map(msg => 
        msg.id === optimisticMessage.id 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'sent':
      case 'delivered':
        return <Check className="h-3 w-3" />;
      case 'failed':
        return <AlertTriangle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white border rounded-lg", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-semibold">{contactName}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              {encryptionEnabled ? (
                <>
                  <Lock className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">End-to-end encrypted</span>
                </>
              ) : (
                <>
                  <LockOpen className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-600">Not encrypted</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Encryption Status Badge */}
        <Badge variant={encryptionEnabled ? "default" : "secondary"}>
          <Shield className="h-3 w-3 mr-1" />
          {encryptionEnabled ? 'Secure' : 'Standard'}
        </Badge>
      </div>

      {/* Key Exchange Section */}
      {keyExchangeStatus === 'none' && (
        <div className="p-4 border-b bg-amber-50">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Enable end-to-end encryption for secure messaging with {contactName}.
              <Button 
                onClick={initiateKeyExchange}
                size="sm"
                className="ml-2"
                disabled={keyExchangeStatus === 'pending'}
              >
                {keyExchangeStatus === 'pending' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Enable Encryption'
                )}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {keyExchangeStatus === 'failed' && (
        <div className="p-4 border-b bg-red-50">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to set up encryption. {contactName} may not have encryption enabled.
              <Button 
                onClick={initiateKeyExchange}
                size="sm"
                variant="outline"
                className="ml-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 border-b bg-red-50">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading messages...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.isOwn ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words",
                    message.isOwn
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900",
                    message.status === 'failed' && "bg-red-100 border border-red-200"
                  )}
                >
                  <div className="text-sm">{message.content}</div>
                  <div 
                    className={cn(
                      "flex items-center justify-between gap-2 mt-1 text-xs",
                      message.isOwn ? "text-blue-100" : "text-slate-500"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      <span>{formatTime(message.timestamp)}</span>
                      {message.isEncrypted && (
                        <Lock className="h-3 w-3" title="Encrypted" />
                      )}
                      {message.isVerified === false && (
                        <AlertTriangle className="h-3 w-3 text-amber-500" title="Unverified sender" />
                      )}
                    </div>
                    {message.isOwn && getMessageStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="flex items-center gap-2 p-4 border-t">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            encryptionEnabled 
              ? "Type an encrypted message..." 
              : "Type a message..."
          }
          disabled={isSending || isLoading}
          className="flex-1"
        />
        <Button
          onClick={sendMessage}
          disabled={!newMessage.trim() || isSending || isLoading}
          size="sm"
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}