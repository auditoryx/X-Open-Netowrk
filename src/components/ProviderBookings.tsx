import React, { useEffect, useCallback } from 'react';

const ProviderBookings = ({ fetchBookings, fetchProvider }) => {
  const stableFetchBookings = useCallback(fetchBookings, []);
  const stableFetchProvider = useCallback(fetchProvider, []);

  useEffect(() => {
    stableFetchBookings();
    stableFetchProvider();
  }, [stableFetchBookings, stableFetchProvider]);

  return <div>Provider Bookings</div>;
};

export default ProviderBookings;