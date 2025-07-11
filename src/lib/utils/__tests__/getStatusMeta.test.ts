import { describe, it, expect } from 'vitest';
import { getStatusMeta } from '../getStatusMeta';

describe('getStatusMeta', () => {
  it('should return correct metadata for known statuses', () => {
    const pendingMeta = getStatusMeta('pending');
    expect(pendingMeta).toEqual({
      label: 'PENDING',
      color: 'text-yellow-500'
    });

    const confirmedMeta = getStatusMeta('confirmed');
    expect(confirmedMeta).toEqual({
      label: 'CONFIRMED',
      color: 'text-green-500'
    });

    const completedMeta = getStatusMeta('completed');
    expect(completedMeta).toEqual({
      label: 'COMPLETED',
      color: 'text-blue-500'
    });

    const canceledMeta = getStatusMeta('canceled');
    expect(canceledMeta).toEqual({
      label: 'CANCELED',
      color: 'text-red-500'
    });
  });

  it('should handle unknown statuses with default gray color', () => {
    const unknownMeta = getStatusMeta('unknown');
    expect(unknownMeta).toEqual({
      label: 'UNKNOWN',
      color: 'text-gray-500'
    });

    const customMeta = getStatusMeta('custom_status');
    expect(customMeta).toEqual({
      label: 'CUSTOM_STATUS',
      color: 'text-gray-500'
    });
  });

  it('should convert labels to uppercase', () => {
    expect(getStatusMeta('pending').label).toBe('PENDING');
    expect(getStatusMeta('Confirmed').label).toBe('CONFIRMED');
    expect(getStatusMeta('COMPLETED').label).toBe('COMPLETED');
    expect(getStatusMeta('CaNcElEd').label).toBe('CANCELED');
  });

  it('should handle empty and null inputs', () => {
    const emptyMeta = getStatusMeta('');
    expect(emptyMeta).toEqual({
      label: '',
      color: 'text-gray-500'
    });
  });

  it('should return consistent color classes', () => {
    const statusColors = [
      'text-yellow-500',
      'text-green-500',
      'text-blue-500',
      'text-red-500',
      'text-gray-500'
    ];

    const pendingColor = getStatusMeta('pending').color;
    const unknownColor = getStatusMeta('unknown').color;
    
    expect(statusColors).toContain(pendingColor);
    expect(statusColors).toContain(unknownColor);
  });
});