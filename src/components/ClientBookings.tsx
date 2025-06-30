import React, { useEffect } from 'react';

const MyComponent = ({ fetch }) => {
  useEffect(() => {
    fetch();
  }, []);

  return <div>My Component</div>;
};

export default MyComponent;