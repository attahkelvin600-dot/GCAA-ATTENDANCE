import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/api';
import '../styles/Auth.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(searchParams.get('token')));

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    authService.verifyEmail(token)
      .then((response) => setStatus(response.data.message))
      .catch((requestError) => setError(requestError.response?.data?.message || 'Verification failed.'))
      .finally(() => setLoading(false));
  }, [searchParams]);

  const resend = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus('');
    setError('');
    try {
      const response = await authService.resendVerification(email);
      setStatus(response.data.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to resend verification email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>GCAA Attendance System</h1>
        <h2>{searchParams.get('token') ? 'Verify email' : 'Check your email'}</h2>
        {loading && <p className="login-mode-help">Verifying your email...</p>}
        {status && <div className="success-message">{status}</div>}
        {error && <div className="error-message">{error}</div>}
        {!searchParams.get('token') && (
          <form onSubmit={resend}>
            <div className="form-group">
              <label htmlFor="verification-email">Email</label>
              <input id="verification-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="Enter your email" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Sending...' : 'Resend verification email'}</button>
          </form>
        )}
        <p className="auth-link"><Link to="/login">Return to login</Link></p>
      </div>
    </div>
  );
}

export default VerifyEmail;