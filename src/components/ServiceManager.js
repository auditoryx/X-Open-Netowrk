useEffect(() => {
  fetchServices();
}, []); // Removed 'fetchServices' from dependency array