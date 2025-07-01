import React, { useEffect, useCallback } from 'react';

const MyComponent = ({ fetch }) => {
  const stableFetch = useCallback(() => {
    fetch();
  }, [fetch]);

  useEffect(() => {
    stableFetch();
  }, [stableFetch]);

  return <div>My Component</div>;
};

export default MyComponent;