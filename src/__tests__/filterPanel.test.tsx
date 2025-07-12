import { render, screen } from '@testing-library/react';
import FilterPanel from '../components/explore/FilterPanel';

test('renders genre chips & BPM inputs', () => {
  const filters = { role: '', location: '', service: '', genres: [], sort:SCHEMA_FIELDS.REVIEW.RATING };
  render(<FilterPanel filters={filters as any} setFilters={() => {}} />);
  expect(screen.getByLabelText(/Genres/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Min BPM/i)).toBeInTheDocument();
});
