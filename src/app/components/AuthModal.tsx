'use client';

import { useState, FormEvent } from 'react';
import { loginUser, registerUser } from '../services/authService';

export default function AuthModal() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('artist');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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
      setError((error as Error).message);
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
            <label htmlFor="auth-name" className="block text-gray-400 mb-1">Name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
              required
            />
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="auth-email" className="block text-gray-400 mb-1">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="auth-password" className="block text-gray-400 mb-1">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 p-2 rounded"
            required
          />
        </div>
        
        {!isLogin && (
          <div className="mb-4">
            <label htmlFor="auth-role" className="block text-gray-400 mb-1">Role</label>
            <select
              id="auth-role"
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
