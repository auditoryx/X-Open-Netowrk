/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import CollabDashboard from '@/components/dashboard/collab/CollabDashboard';

describe('Collab Dashboard Integration', () => {
  it('renders CollabDashboard without crashing', () => {
    render(<CollabDashboard />);
    expect(screen.getByText(/Collaboration Dashboard/i)).toBeInTheDocument();
  });
});
