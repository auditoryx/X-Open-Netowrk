'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MultiStepForm,
  StepConfig,
  StepComponentProps,
  ServiceSelector,
  ValidatedInput,
  AnimatedCheckbox
} from '@/components/forms';
import { ToggleSwitch, CustomSlider } from '@/components/ui';
import { useFormValidation, commonValidationRules } from '@/hooks/useFormValidation';

// Example step components
const ContactInfoStep: React.FC<StepComponentProps> = ({ data, updateData }) => {
  const validationConfig = {
    name: [
      commonValidationRules.required(),
      commonValidationRules.minLength(2)
    ],
    email: [
      commonValidationRules.required(),
      commonValidationRules.email()
    ],
    phone: [
      commonValidationRules.phone()
    ]
  };

  const { validationState, getFieldProps } = useFormValidation(validationConfig);

  return (
    <div className="space-y-6">
      <ValidatedInput
        label="Full Name"
        placeholder="Enter your full name"
        value={data.name || ''}
        onChange={(e) => updateData({ name: e.target.value })}
        validation={validationState.name}
        required
        {...getFieldProps('name')}
      />
      
      <ValidatedInput
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={data.email || ''}
        onChange={(e) => updateData({ email: e.target.value })}
        validation={validationState.email}
        required
        {...getFieldProps('email')}
      />
      
      <ValidatedInput
        type="tel"
        label="Phone Number"
        placeholder="Enter your phone number"
        value={data.phone || ''}
        onChange={(e) => updateData({ phone: e.target.value })}
        validation={validationState.phone}
        {...getFieldProps('phone')}
      />
    </div>
  );
};

const ServicesStep: React.FC<StepComponentProps> = ({ data, updateData }) => {
  const services = [
    {
      id: 'consultation',
      title: 'Strategy Consultation',
      description: 'One-on-one consultation to develop your business strategy',
      price: 150,
      duration: '1 hour',
      popular: true
    },
    {
      id: 'design',
      title: 'UI/UX Design',
      description: 'Complete design system and user interface creation',
      price: 500,
      duration: '2-3 days'
    },
    {
      id: 'development',
      title: 'Full-Stack Development',
      description: 'End-to-end web application development',
      price: 2000,
      duration: '2-4 weeks'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Select Services</h3>
        <ServiceSelector
          services={services}
          selectedServices={data.selectedServices || []}
          onSelectionChange={(services) => updateData({ selectedServices: services })}
          variant="grid"
          showPricing={true}
        />
      </div>
    </div>
  );
};

const PreferencesStep: React.FC<StepComponentProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-white mb-6">Communication Preferences</h3>
        <div className="space-y-4">
          <ToggleSwitch
            checked={data.emailNotifications || false}
            onChange={(checked) => updateData({ emailNotifications: checked })}
            label="Email Notifications"
            description="Receive updates and progress reports via email"
          />
          
          <ToggleSwitch
            checked={data.smsNotifications || false}
            onChange={(checked) => updateData({ smsNotifications: checked })}
            label="SMS Notifications"
            description="Get urgent updates via text messages"
            variant="success"
          />
          
          <ToggleSwitch
            checked={data.pushNotifications || false}
            onChange={(checked) => updateData({ pushNotifications: checked })}
            label="Push Notifications"
            description="Receive notifications in your browser"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-6">Project Preferences</h3>
        <div className="space-y-6">
          <CustomSlider
            label="Budget Range"
            value={data.budget || 1000}
            min={500}
            max={10000}
            step={100}
            onChange={(value) => updateData({ budget: value })}
            formatValue={(val) => `$${val.toLocaleString()}`}
            showValue={true}
            showTicks={true}
          />
          
          <CustomSlider
            label="Timeline (weeks)"
            value={data.timeline || 4}
            min={1}
            max={12}
            step={1}
            onChange={(value) => updateData({ timeline: value })}
            formatValue={(val) => `${val} week${val !== 1 ? 's' : ''}`}
            variant="success"
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Additional Options</h3>
        <div className="space-y-3">
          <AnimatedCheckbox
            id="priority-support"
            checked={data.prioritySupport || false}
            onChange={(checked) => updateData({ prioritySupport: checked })}
            label="Priority Support"
            description="Get faster response times and dedicated support"
          />
          
          <AnimatedCheckbox
            id="source-code"
            checked={data.sourceCode || false}
            onChange={(checked) => updateData({ sourceCode: checked })}
            label="Source Code Access"
            description="Receive full source code and documentation"
          />
          
          <AnimatedCheckbox
            id="maintenance"
            checked={data.maintenance || false}
            onChange={(checked) => updateData({ maintenance: checked })}
            label="Maintenance Package"
            description="3 months of free updates and bug fixes"
            variant="success"
          />
        </div>
      </div>
    </div>
  );
};

const MultiStepFormDemo: React.FC = () => {
  const [formData, setFormData] = useState<any>({});

  const steps: StepConfig[] = [
    {
      id: 'contact',
      title: 'Contact Information',
      description: 'Let us know how to reach you',
      component: ContactInfoStep,
      validation: (data) => !!(data.name && data.email)
    },
    {
      id: 'services',
      title: 'Select Services',
      description: 'Choose the services you need',
      component: ServicesStep,
      validation: (data) => !!(data.selectedServices?.length > 0)
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Customize your experience',
      component: PreferencesStep,
      validation: () => true // Always valid for demo
    }
  ];

  const handleComplete = async (data: any) => {
    console.log('Form completed with data:', data);
    alert('Form submitted successfully! Check the console for data.');
  };

  const handleStepChange = (step: number, data: any) => {
    console.log(`Step ${step + 1} data:`, data);
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Enhanced UI Components Demo</h1>
          <p className="text-xl text-gray-400">
            Showcasing the new multi-step forms and interactive UI controls
          </p>
        </motion.div>

        <MultiStepForm
          steps={steps}
          initialData={formData}
          onComplete={handleComplete}
          onStepChange={handleStepChange}
          submitLabel="Complete Order"
          loadingLabel="Processing Order..."
        />
      </div>
    </div>
  );
};

export default MultiStepFormDemo;