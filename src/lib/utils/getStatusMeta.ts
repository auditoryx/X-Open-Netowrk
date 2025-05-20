export const getStatusMeta = (status: string) => {
  const colorMap: Record<string, string> = {
    pending: 'text-yellow-500',
    confirmed: 'text-green-500',
    completed: 'text-blue-500',
    canceled: 'text-red-500',
  };

  return {
    label: status.toUpperCase(),
    color: colorMap[status] || 'text-gray-500',
  };
};
