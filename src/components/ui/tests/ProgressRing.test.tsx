import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressRing from '../ProgressRing';

describe('ProgressRing', () => {
  it('renders the SVG with correct radius and progress', () => {
    render(<ProgressRing radius={40} stroke={4} progress={75} />);
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
  });

  it('shows tooltip if provided', () => {
    render(<ProgressRing radius={40} stroke={4} progress={50} tooltip="XP Progress" />);
    const div = screen.getByTitle('XP Progress');
    expect(div).toBeInTheDocument();
  });

  it('renders with custom color', () => {
    render(<ProgressRing radius={40} stroke={4} progress={60} color="#f59e42" />);
    const circles = screen.getAllByRole('presentation');
    expect(circles[1]).toHaveAttribute('stroke', '#f59e42');
  });
});
