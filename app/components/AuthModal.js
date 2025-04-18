'use client';

import { useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('artist');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(email, password, name, role);
      }
      // Close modal or redirect after successful login/registration
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? 'Login' : 'Sign Up'}
      </h2>
      
      {error && (
        <div className="bg-red-900 text-white p-2 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              required
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-400 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-400 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
            required
          />
        </div>
        
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
            >
              <option value="artist">Artist</option>
              <option value="producer">Producer</option>
              <option value="studio">Studio</option>
              <option value="engineer">Engineer</option>
            </select>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition duration-300"
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-400 hover:text-blue-300"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
