import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import ServiceForm from "./pages/ServiceForm";
import ServiceList from "./pages/ServiceList";

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">View Services</Link></li>
          <li><Link to="/list-service">List a Service</Link></li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<ServiceList />} />
        <Route path="/list-service" element={<ServiceForm />} />
      </Routes>
    </Router>
  );
}

export default App;
