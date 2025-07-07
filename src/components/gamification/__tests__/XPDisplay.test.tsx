import React from 'react';
import { render, screen } from '@testing-library/react';
import XPDisplay from '../XPDisplay';

describe('XPDisplay Component', () => {
  const defaultProps = {
    totalXP: 150,
    dailyXP: 50,
    dailyCapRemaining: 250,
    tier: 'standard' as const
  };

  it('renders XP information correctly', () => {
    render(<XPDisplay {...defaultProps} />);
    
    expect(screen.getByText('Experience Points')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('+50 today')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });

  it('shows daily progress correctly', () => {
    render(<XPDisplay {...defaultProps} />);
    
    expect(screen.getByText('Daily Progress')).toBeInTheDocument();
    expect(screen.getByText('50/300 XP')).toBeInTheDocument();
    expect(screen.getByText('250 XP remaining')).toBeInTheDocument();
  });

  it('hides details when showDetails is false', () => {
    render(<XPDisplay {...defaultProps} showDetails={false} />);
    
    expect(screen.queryByText('Daily Progress')).not.toBeInTheDocument();
    expect(screen.queryByText('50/300 XP')).not.toBeInTheDocument();
  });

  it('shows daily cap reached message when appropriate', () => {
    const propsWithCapReached = {
      ...defaultProps,
      dailyXP: 300,
      dailyCapRemaining: 0
    };
    
    render(<XPDisplay {...propsWithCapReached} />);
    
    expect(screen.getByText('Daily cap reached')).toBeInTheDocument();
  });

  it('displays different tier colors correctly', () => {
    const { rerender } = render(<XPDisplay {...defaultProps} tier="verified" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
    
    rerender(<XPDisplay {...defaultProps} tier="signature" />);
    expect(screen.getByText('Signature')).toBeInTheDocument();
  });

  it('formats large XP numbers with commas', () => {
    const propsWithLargeXP = {
      ...defaultProps,
      totalXP: 12500
    };
    
    render(<XPDisplay {...propsWithLargeXP} />);
    
    expect(screen.getByText('12,500')).toBeInTheDocument();
  });
});
