import { render } from '@testing-library/react';
import { PointsBadge } from '@/components/profile/PointsBadge';

test('renders XP text', () => {
  const { getByLabelText } = render(<PointsBadge points={123} />);
  expect(getByLabelText('123 XP')).toBeInTheDocument();
});
