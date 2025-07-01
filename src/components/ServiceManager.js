import React, { useEffect, useCallback } from 'react';

const ServiceManager = ({ fetchServices }) => {
  const stableFetchServices = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    stableFetchServices();
  }, [stableFetchServices]);

  return <div>Service Manager</div>;
};

export default ServiceManager;