import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [managementMode, setManagementMode] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      const isManager = ['admin', 'supervisor'].includes(response.data.user.role);
      if (managementMode && !isManager) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError('This account does not have management access.');
        return;
      }
      navigate(managementMode ? '/management' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>GCAA Attendance System</h1>
        <h2>Login</h2>
        <div className="login-mode-switcher" role="group" aria-label="Login type">
          <button
            type="button"
            className={!managementMode ? 'selected' : ''}
            onClick={() => setManagementMode(false)}
          >
            Personnel login
          </button>
          <button
            type="button"
            className={managementMode ? 'selected' : ''}
            onClick={() => setManagementMode(true)}
          >
            Admin / Supervisor login
          </button>
        </div>
        <p className="login-mode-help">
          {managementMode ? 'Use an admin or supervisor account to open management.' : 'Sign in to record and view your attendance.'}
        </p>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
