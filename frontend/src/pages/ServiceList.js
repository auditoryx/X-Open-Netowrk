import React, { useEffect, useState } from "react";

function ServiceList() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/services")
      .then((response) => response.json())
      .then((data) => setServices(data))
      .catch((error) => console.error("Error fetching services:", error));
  }, []);

  return (
    <div>
      <h2>Available Services</h2>
      {services.length === 0 ? (
        <p>No services listed yet.</p>
      ) : (
        <ul>
          {services.map((service) => (
            <li key={service._id}>
              <h3>{service.serviceName}</h3>
              <p><strong>Category:</strong> {service.category}</p>
              <p><strong>Price:</strong> ${service.price}</p>
              <p><strong>Location:</strong> {service.location}</p>
              <p><strong>Description:</strong> {service.description}</p>
              {service.portfolioLink && (
                <p><a href={service.portfolioLink} target="_blank" rel="noopener noreferrer">Portfolio</a></p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ServiceList;
