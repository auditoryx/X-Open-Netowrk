import React from 'react';
import { render, screen } from '@testing-library/react';
import TierBadge from '../TierBadge';

describe('TierBadge', () => {
  it('renders the correct tier label', () => {
    render(<TierBadge tier="gold" />);
    expect(screen.getByText(/gold/i)).toBeInTheDocument();
  });

  it('shows frozen state if frozen', () => {
    render(<TierBadge tier="blue" frozen />);
    expect(screen.getByText(/frozen/i)).toBeInTheDocument();
  });
});
