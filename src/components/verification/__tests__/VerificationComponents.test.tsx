/**
 * Verification UI Components Tests
 * Comprehensive test suite for verification UI components
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VerificationProgress } from '../VerificationProgress';
import { VerificationStatusWidget } from '../VerificationStatusWidget';
import { VerificationNotification } from '../VerificationNotification';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  XCircle: () => <div data-testid="x-circle-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Trophy: () => <div data-testid="trophy-icon" />,
  User: () => <div data-testid="user-icon" />,
  Star: () => <div data-testid="star-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  X: () => <div data-testid="x-icon" />
}));

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: any) => (
    <span className={`badge ${variant} ${className}`}>{children}</span>
  )
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className }: any) => (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`button ${variant} ${size} ${className}`}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) => (
    <div className={`progress ${className}`} data-value={value}>
      <div style={{ width: `${value}%` }} />
    </div>
  )
}));

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' ')
}));

describe('VerificationProgress', () => {
  const mockCriteria = {
    xp: { met: true, current: 1200, required: 1000 },
    profileCompleteness: { met: true, current: 95, required: 90 },
    completedBookings: { met: true, current: 5, required: 3 },
    averageRating: { met: true, current: 4.8, required: 4.0 },
    violations: { met: true, current: 0, allowed: 0 }
  };

  it('renders verified state correctly', () => {
    render(
      <VerificationProgress 
        isVerified={true}
        overallScore={100}
      />
    );

    expect(screen.getByText('Verified Creator')).toBeInTheDocument();
    expect(screen.getByText('You have successfully completed the verification process')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('renders eligible state with apply button', () => {
    const mockOnApply = jest.fn();
    
    render(
      <VerificationProgress 
        isEligible={true}
        criteria={mockCriteria}
        overallScore={100}
        applicationStatus="none"
        onApply={mockOnApply}
      />
    );

    expect(screen.getByText('Verification Progress')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    
    const applyButton = screen.getByText('Apply for Verification');
    expect(applyButton).toBeInTheDocument();
    
    fireEvent.click(applyButton);
    expect(mockOnApply).toHaveBeenCalledTimes(1);
  });

  it('renders pending application state', () => {
    render(
      <VerificationProgress 
        isEligible={true}
        criteria={mockCriteria}
        overallScore={100}
        applicationStatus="pending"
      />
    );

    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('Application Under Review')).toBeInTheDocument();
    expect(screen.getByText('We\'ll notify you once your application has been reviewed')).toBeInTheDocument();
  });

  it('renders ineligible state with next steps', () => {
    const ineligibleCriteria = {
      ...mockCriteria,
      xp: { met: false, current: 500, required: 1000 }
    };
    
    const nextSteps = ['Earn 500 more XP (complete 5 more bookings)'];

    render(
      <VerificationProgress 
        isEligible={false}
        criteria={ineligibleCriteria}
        overallScore={80}
        nextSteps={nextSteps}
        applicationStatus="none"
      />
    );

    expect(screen.getByText('Next Steps')).toBeInTheDocument();
    expect(screen.getByText('Earn 500 more XP (complete 5 more bookings)')).toBeInTheDocument();
  });

  it('renders criteria breakdown correctly', () => {
    render(
      <VerificationProgress 
        criteria={mockCriteria}
        overallScore={100}
      />
    );

    expect(screen.getByText('Experience Points')).toBeInTheDocument();
    expect(screen.getByText('Profile Completion')).toBeInTheDocument();
    expect(screen.getByText('Completed Bookings')).toBeInTheDocument();
    expect(screen.getByText('Average Rating')).toBeInTheDocument();
    expect(screen.getByText('Good Standing')).toBeInTheDocument();

    // Check that all criteria show as met
    expect(screen.getAllByTestId('check-circle-icon')).toHaveLength(5);
  });

  it('shows loading state correctly', () => {
    render(
      <VerificationProgress 
        isLoading={true}
        onApply={jest.fn()}
      />
    );

    const button = screen.getByText('Submitting...');
    expect(button).toBeDisabled();
  });
});

describe('VerificationStatusWidget', () => {
  it('renders verified state', () => {
    render(<VerificationStatusWidget isVerified={true} />);

    expect(screen.getByText('Verified Creator')).toBeInTheDocument();
    expect(screen.getByText('You\'re a verified member of AuditoryX')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders pending state', () => {
    const mockOnViewDetails = jest.fn();
    
    render(
      <VerificationStatusWidget 
        applicationStatus="pending"
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Under Review')).toBeInTheDocument();
    expect(screen.getByText('Your verification application is being reviewed')).toBeInTheDocument();
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('renders eligible state', () => {
    const mockOnViewDetails = jest.fn();
    
    render(
      <VerificationStatusWidget 
        isEligible={true}
        applicationStatus="none"
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Ready for Verification')).toBeInTheDocument();
    expect(screen.getByText('You\'re eligible to become a verified creator')).toBeInTheDocument();
    
    const applyButton = screen.getByText('Apply Now');
    fireEvent.click(applyButton);
    expect(mockOnViewDetails).toHaveBeenCalledTimes(1);
  });

  it('renders progress state', () => {
    render(
      <VerificationStatusWidget 
        overallScore={75}
      />
    );

    expect(screen.getByText('Verification Progress')).toBeInTheDocument();
    expect(screen.getByText('75% complete')).toBeInTheDocument();
    
    const progress = screen.getByRole('generic', { name: /progress/i });
    expect(progress).toHaveAttribute('data-value', '75');
  });
});

describe('VerificationNotification', () => {
  it('renders eligible notification', () => {
    const mockOnAction = jest.fn();
    const mockOnDismiss = jest.fn();
    
    render(
      <VerificationNotification
        type="eligible"
        title="Ready for Verification!"
        message="You can now apply for verification."
        actionLabel="Apply Now"
        onAction={mockOnAction}
        onDismiss={mockOnDismiss}
      />
    );

    expect(screen.getByText('Ready for Verification!')).toBeInTheDocument();
    expect(screen.getByText('You can now apply for verification.')).toBeInTheDocument();
    
    const actionButton = screen.getByText('Apply Now');
    fireEvent.click(actionButton);
    expect(mockOnAction).toHaveBeenCalledTimes(1);
    
    const dismissButton = screen.getByTestId('x-icon').closest('button');
    fireEvent.click(dismissButton!);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders approved notification with badge', () => {
    render(
      <VerificationNotification
        type="approved"
        title="Verification Approved!"
        message="You're now verified!"
      />
    );

    expect(screen.getByText('Verification Approved!')).toBeInTheDocument();
    expect(screen.getByText('You\'re now verified!')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument();
  });

  it('auto-hides notification when autoHide is true', async () => {
    const mockOnDismiss = jest.fn();
    
    render(
      <VerificationNotification
        type="reminder"
        title="Test"
        message="Test message"
        autoHide={true}
        autoHideDelay={100}
        onDismiss={mockOnDismiss}
      />
    );

    // Should be visible initially
    expect(screen.getByText('Test')).toBeInTheDocument();

    // Should auto-dismiss after delay
    await waitFor(() => {
      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    }, { timeout: 500 });
  });

  it('handles different notification types correctly', () => {
    const types = ['eligible', 'applied', 'approved', 'rejected', 'reminder'] as const;
    
    types.forEach((type) => {
      const { unmount } = render(
        <VerificationNotification
          type={type}
          title={`${type} notification`}
          message={`This is a ${type} message`}
        />
      );
      
      expect(screen.getByText(`${type} notification`)).toBeInTheDocument();
      expect(screen.getByText(`This is a ${type} message`)).toBeInTheDocument();
      
      unmount();
    });
  });
});

describe('Pre-configured Notifications', () => {
  // Import the pre-configured components
  const {
    VerificationEligibleNotification,
    VerificationAppliedNotification,
    VerificationApprovedNotification,
    VerificationRejectedNotification,
    VerificationReminderNotification
  } = require('../VerificationNotification');

  it('renders pre-configured eligible notification', () => {
    render(<VerificationEligibleNotification />);
    expect(screen.getByText('Ready for Verification!')).toBeInTheDocument();
  });

  it('renders pre-configured applied notification', () => {
    render(<VerificationAppliedNotification />);
    expect(screen.getByText('Application Submitted')).toBeInTheDocument();
  });

  it('renders pre-configured approved notification', () => {
    render(<VerificationApprovedNotification />);
    expect(screen.getByText('Verification Approved!')).toBeInTheDocument();
  });

  it('renders pre-configured rejected notification', () => {
    render(<VerificationRejectedNotification />);
    expect(screen.getByText('Application Needs Improvement')).toBeInTheDocument();
  });

  it('renders pre-configured reminder notification', () => {
    render(<VerificationReminderNotification />);
    expect(screen.getByText('Verification Available')).toBeInTheDocument();
  });
});
