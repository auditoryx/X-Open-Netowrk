'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2, CheckCircle, Package, ArrowRight, ArrowLeft } from 'lucide-react';
import { OfferTemplate, OfferRole } from '@/types/offer';
import offersConfig from '@/../config/offers.json';

interface SelectedTemplate {
  template: OfferTemplate;
  customizations: Record<string, any>;
}

export default function RoleKitWizard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userRoles, setUserRoles] = useState<OfferRole[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<Record<OfferRole, SelectedTemplate[]>>({
    artist: [],
    producer: [],
    engineer: [],
    videographer: [],
    studio: []
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin?callbackUrl=/onboarding/role-kit');
      return;
    }

    // Get user roles from profile
    if (user && (user as any).roles) {
      const roles = (user as any).roles as string[];
      const offerRoles = roles.filter(role => 
        ['artist', 'producer', 'engineer', 'videographer', 'studio'].includes(role)
      ) as OfferRole[];
      setUserRoles(offerRoles);
    }
  }, [user, loading, router]);

  const steps = [
    'Welcome',
    ...userRoles.map(role => `${role.charAt(0).toUpperCase() + role.slice(1)} Templates`),
    'Review & Create'
  ];

  const handleTemplateToggle = (role: OfferRole, template: OfferTemplate) => {
    setSelectedTemplates(prev => {
      const existing = prev[role].find(t => t.template.id === template.id);
      if (existing) {
        return {
          ...prev,
          [role]: prev[role].filter(t => t.template.id !== template.id)
        };
      } else {
        return {
          ...prev,
          [role]: [...prev[role], { template, customizations: {} }]
        };
      }
    });
  };

  const handleCreateOffers = async () => {
    setIsCreating(true);
    
    try {
      const promises = [];
      
      for (const role of userRoles) {
        for (const selected of selectedTemplates[role]) {
          const offerData = {
            role,
            title: selected.template.name,
            description: selected.template.description,
            price: selected.template.defaultPrice,
            currency: selected.template.currency,
            turnaroundDays: selected.template.defaultTurnaround,
            revisions: selected.template.defaultRevisions,
            deliverables: selected.template.defaultDeliverables,
            addons: selected.template.defaultAddons || [],
            usagePolicy: selected.template.usagePolicyTemplate,
            media: [],
            templateId: selected.template.id,
            isCustom: false,
            roleSpecific: {
              ...selected.template.roleSpecific,
              ...selected.customizations
            }
          };

          promises.push(
            fetch('/api/offers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(offerData)
            })
          );
        }
      }

      await Promise.all(promises);
      router.push('/dashboard/offers?created=true');
    } catch (error) {
      console.error('Error creating offers:', error);
      // TODO: Show error message
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (userRoles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No Applicable Roles</h2>
          <p className="text-gray-600 mb-4">
            You need to have creator roles to set up offers.
          </p>
          <button
            onClick={() => router.push('/onboarding')}
            className="btn btn-primary"
          >
            Complete Profile Setup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Set Up Your Role Kits
          </h1>
          <p className="text-gray-600">
            Choose from professional templates to quickly create your service offerings
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    h-1 w-16 mx-2
                    ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step, index) => (
              <span 
                key={step}
                className={`text-xs ${index <= currentStep ? 'text-blue-600' : 'text-gray-500'}`}
              >
                {step}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {currentStep === 0 && (
            <WelcomeStep 
              userRoles={userRoles}
              onNext={() => setCurrentStep(1)}
            />
          )}

          {currentStep > 0 && currentStep <= userRoles.length && (
            <TemplateSelectionStep
              role={userRoles[currentStep - 1]}
              templates={offersConfig.templates[userRoles[currentStep - 1]] || []}
              selectedTemplates={selectedTemplates[userRoles[currentStep - 1]]}
              onToggleTemplate={(template) => handleTemplateToggle(userRoles[currentStep - 1], template)}
              onNext={() => setCurrentStep(currentStep + 1)}
              onBack={() => setCurrentStep(currentStep - 1)}
            />
          )}

          {currentStep === steps.length - 1 && (
            <ReviewStep
              selectedTemplates={selectedTemplates}
              userRoles={userRoles}
              isCreating={isCreating}
              onBack={() => setCurrentStep(currentStep - 1)}
              onCreateOffers={handleCreateOffers}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({ userRoles, onNext }: { 
  userRoles: OfferRole[]; 
  onNext: () => void; 
}) {
  return (
    <div className="text-center">
      <Package className="w-16 h-16 mx-auto mb-6 text-blue-600" />
      <h2 className="text-2xl font-bold mb-4">Welcome to Role Kits</h2>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        Role Kits help you quickly set up professional service offerings based on your roles. 
        We'll walk you through selecting templates for each of your roles and you can customize them later.
      </p>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Roles:</h3>
        <div className="flex flex-wrap justify-center gap-3">
          {userRoles.map(role => (
            <span 
              key={role}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
            >
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 text-sm text-gray-600 mb-8">
        <div className="flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          All templates are available to all users (no tier restrictions)
        </div>
        <div className="flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          You can have up to 5 active offers
        </div>
        <div className="flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          Templates can be customized after creation
        </div>
      </div>

      <button
        onClick={onNext}
        className="btn btn-primary inline-flex items-center"
      >
        Get Started
        <ArrowRight className="w-4 h-4 ml-2" />
      </button>
    </div>
  );
}

function TemplateSelectionStep({ 
  role, 
  templates, 
  selectedTemplates,
  onToggleTemplate,
  onNext, 
  onBack 
}: { 
  role: OfferRole;
  templates: any[];
  selectedTemplates: SelectedTemplate[];
  onToggleTemplate: (template: OfferTemplate) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">
          {role.charAt(0).toUpperCase() + role.slice(1)} Templates
        </h2>
        <p className="text-gray-600">
          Choose templates that match your services. You can customize them later.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {templates.map(template => {
          const isSelected = selectedTemplates.some(t => t.template.id === template.id);
          
          return (
            <div 
              key={template.id}
              className={`border rounded-lg p-6 cursor-pointer transition-colors ${
                isSelected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onToggleTemplate(template)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    {template.isPopular && (
                      <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        Popular
                      </span>
                    )}
                    {template.isRecommended && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Price:</span> ${template.defaultPrice} {template.currency}
                    </div>
                    <div>
                      <span className="font-medium">Turnaround:</span> {template.defaultTurnaround} days
                    </div>
                    <div>
                      <span className="font-medium">Revisions:</span> {template.defaultRevisions}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {template.category}
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="font-medium text-sm">Includes:</span>
                    <ul className="text-sm text-gray-600 mt-1">
                      {template.defaultDeliverables.slice(0, 3).map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                      {template.defaultDeliverables.length > 3 && (
                        <li>• +{template.defaultDeliverables.length - 3} more...</li>
                      )}
                    </ul>
                  </div>
                </div>
                
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
                }`}>
                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <button
          onClick={onNext}
          className="btn btn-primary inline-flex items-center"
        >
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

function ReviewStep({ 
  selectedTemplates, 
  userRoles, 
  isCreating,
  onBack, 
  onCreateOffers 
}: {
  selectedTemplates: Record<OfferRole, SelectedTemplate[]>;
  userRoles: OfferRole[];
  isCreating: boolean;
  onBack: () => void;
  onCreateOffers: () => void;
}) {
  const totalSelected = userRoles.reduce((total, role) => 
    total + selectedTemplates[role].length, 0
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Review Your Selections</h2>
        <p className="text-gray-600">
          You're about to create {totalSelected} offers. They'll start as drafts and you can activate them when ready.
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {userRoles.map(role => {
          const templates = selectedTemplates[role];
          if (templates.length === 0) return null;

          return (
            <div key={role} className="border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {role} Offers ({templates.length})
              </h3>
              
              <div className="grid gap-4">
                {templates.map(({ template }) => (
                  <div key={template.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${template.defaultPrice} {template.currency}</div>
                      <div className="text-sm text-gray-600">{template.defaultTurnaround} days</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {totalSelected === 0 && (
        <div className="text-center mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            No templates selected. You can skip this step and create custom offers later.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn btn-secondary inline-flex items-center"
          disabled={isCreating}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <div className="space-x-3">
          {totalSelected === 0 && (
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-secondary"
              disabled={isCreating}
            >
              Skip for Now
            </button>
          )}
          
          <button
            onClick={onCreateOffers}
            className="btn btn-primary inline-flex items-center"
            disabled={isCreating || totalSelected === 0}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Offers...
              </>
            ) : (
              <>
                Create {totalSelected} Offers
                <CheckCircle className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}