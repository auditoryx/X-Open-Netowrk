import React, { useEffect, useCallback } from 'react';

interface ServiceManagerProps {
  fetchServices: () => void;
}

const ServiceManager: React.FC<ServiceManagerProps> = ({ fetchServices }) => {
  const stableFetchServices = useCallback(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    stableFetchServices();
  }, [stableFetchServices]);

  return <div>Service Manager</div>;
};

export default ServiceManager;