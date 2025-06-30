import React, { useEffect } from 'react';

const MyComponent = ({ fetchBookings, fetchProvider }) => {
  useEffect(() => {
    fetchBookings();
    fetchProvider();
  }, []); // Removed 'fetchBookings' and 'fetchProvider' from dependency array

  return (
    <div>
      {/* Component JSX goes here */}
    </div>
  );
};

export default MyComponent;