import React, { useState } from "react";

function ServiceForm() {
  const [formData, setFormData] = useState({
    serviceName: "",
    category: "",
    price: "",
    location: "",
    description: "",
    portfolioLink: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert("Service listed successfully!");
      setFormData({
        serviceName: "",
        category: "",
        price: "",
        location: "",
        description: "",
        portfolioLink: "",
      });
    } else {
      alert("Error listing service");
    }
  };

  return (
    <div>
      <h2>List Your Service</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="serviceName"
          placeholder="Service Name"
          value={formData.serviceName}
          onChange={handleChange}
          required
        />
        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select Category</option>
          <option value="Producer">Producer</option>
          <option value="Engineer">Engineer</option>
          <option value="Videographer">Videographer</option>
          <option value="Graphic Designer">Graphic Designer</option>
        </select>
        <input
          type="number"
          name="price"
          placeholder="Price ($)"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Describe your service"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="portfolioLink"
          placeholder="Portfolio Link (Optional)"
          value={formData.portfolioLink}
          onChange={handleChange}
        />
        <button type="submit">List Service</button>
      </form>
    </div>
  );
}

export default ServiceForm;
