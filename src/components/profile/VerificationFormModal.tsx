import React, { useState } from 'react';
import { X, ExternalLink, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { submitVerificationRequest, VerificationFormData } from '@/lib/firestore/submitVerificationRequest';

interface VerificationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userData: {
    name: string;
    role: string;
  };
  onSuccess?: () => void;
}

const VerificationFormModal: React.FC<VerificationFormModalProps> = ({
  isOpen,
  onClose,
  userId,
  userData,
  onSuccess
}) => {
  const [statement, setStatement] = useState('');
  const [links, setLinks] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setStatement('');
      setLinks(['', '', '']);
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  const addLinkField = () => {
    if (links.length < 5) {
      setLinks([...links, '']);
    }
  };

  const removeLinkField = (index: number) => {
    if (links.length > 1) {
      const newLinks = links.filter((_, i) => i !== index);
      setLinks(newLinks);
    }
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const validateForm = (): string | null => {
    if (!statement.trim()) {
      return 'Please provide a statement about why you should be verified.';
    }

    if (statement.trim().length < 50) {
      return 'Statement must be at least 50 characters long.';
    }

    const validLinks = links.filter(link => {
      if (!link.trim()) return false;
      try {
        new URL(link);
        return true;
      } catch {
        return false;
      }
    });

    if (validLinks.length === 0) {
      return 'Please provide at least one valid URL.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData: VerificationFormData = {
        statement: statement.trim(),
        links: links.filter(link => link.trim()).map(link => link.trim())
      };

      await submitVerificationRequest(userId, userData, formData);
      setSuccess(true);
      
      // Show success message briefly, then close
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit verification request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Apply for Verification</h2>
            <p className="text-sm text-gray-600 mt-1">
              Submit your application to get verified on the platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          /* Success State */
          <div className="p-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Application Submitted!
              </h3>
              <p className="text-gray-600">
                Your verification request has been submitted successfully. We'll review it and get back to you soon.
              </p>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-6">
            {/* User Info */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Applicant Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">{userData.name || 'Not provided'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Role:</span>
                  <span className="ml-2 font-medium">{userData.role || 'Not specified'}</span>
                </div>
              </div>
            </div>

            {/* Statement Field */}
            <div className="mb-6">
              <label htmlFor="statement" className="block text-sm font-medium text-gray-700 mb-2">
                Why should you be verified? *
              </label>
              <textarea
                id="statement"
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="Tell us about your professional experience, achievements, and why you deserve verification. Include details about your work, credentials, and contribution to the community..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
                maxLength={1000}
                disabled={loading}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Minimum 50 characters</span>
                <span>{statement.length}/1000</span>
              </div>
            </div>

            {/* Links Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Supporting Links *
                </label>
                {links.length < 5 && (
                  <button
                    type="button"
                    onClick={addLinkField}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                    disabled={loading}
                  >
                    <Plus className="h-4 w-4" />
                    Add Link
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Provide links to your portfolio, social media profiles, previous work, or professional websites
              </p>
              
              <div className="space-y-3">
                {links.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        placeholder={`Link ${index + 1} (e.g., https://portfolio.com, https://instagram.com/username)`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={loading}
                      />
                    </div>
                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Preview link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {links.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLinkField(index)}
                        className="p-2 text-red-400 hover:text-red-600"
                        disabled={loading}
                        title="Remove link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !statement.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VerificationFormModal;
