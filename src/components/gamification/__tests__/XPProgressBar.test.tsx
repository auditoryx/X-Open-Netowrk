import React from 'react';
import { render, screen } from '@testing-library/react';
import XPProgressBar from '../XPProgressBar';

describe('XPProgressBar Component', () => {
  const defaultProps = {
    currentXP: 250,
    targetXP: 500,
    targetLabel: 'Test Goal'
  };

  it('renders progress information correctly', () => {
    render(<XPProgressBar {...defaultProps} />);
    
    expect(screen.getByText('250 XP')).toBeInTheDocument();
    expect(screen.getByText('Goal: 500')).toBeInTheDocument();
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText('250 to go')).toBeInTheDocument();
  });

  it('calculates progress percentage correctly', () => {
    render(<XPProgressBar {...defaultProps} />);
    
    // 250/500 = 50%
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('50% complete')).toBeInTheDocument();
  });

  it('shows completion status when target is reached', () => {
    const completedProps = {
      ...defaultProps,
      currentXP: 500
    };
    
    render(<XPProgressBar {...completedProps} />);
    
    expect(screen.getByText('Completed!')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('handles overflowing progress correctly', () => {
    const overflowProps = {
      ...defaultProps,
      currentXP: 750 // More than target
    };
    
    render(<XPProgressBar {...overflowProps} />);
    
    expect(screen.getByText('Completed!')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('hides numbers when showNumbers is false', () => {
    render(<XPProgressBar {...defaultProps} showNumbers={false} />);
    
    expect(screen.queryByText('250 XP')).not.toBeInTheDocument();
    expect(screen.queryByText('Goal: 500')).not.toBeInTheDocument();
  });

  it('hides target when showTarget is false', () => {
    render(<XPProgressBar {...defaultProps} showTarget={false} />);
    
    expect(screen.getByText('250 XP')).toBeInTheDocument();
    expect(screen.queryByText('Goal: 500')).not.toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container, rerender } = render(<XPProgressBar {...defaultProps} size="sm" />);
    let progressBar = container.querySelector('.h-1\\.5');
    expect(progressBar).toBeInTheDocument();

    rerender(<XPProgressBar {...defaultProps} size="md" />);
    progressBar = container.querySelector('.h-2\\.5');
    expect(progressBar).toBeInTheDocument();

    rerender(<XPProgressBar {...defaultProps} size="lg" />);
    progressBar = container.querySelector('.h-3');
    expect(progressBar).toBeInTheDocument();
  });

  it('formats large numbers with commas', () => {
    const largeNumberProps = {
      ...defaultProps,
      currentXP: 1250,
      targetXP: 5000
    };
    
    render(<XPProgressBar {...largeNumberProps} />);
    
    expect(screen.getByText('1,250 XP')).toBeInTheDocument();
    expect(screen.getByText('Goal: 5,000')).toBeInTheDocument();
    expect(screen.getByText('3,750 to go')).toBeInTheDocument();
  });
});
