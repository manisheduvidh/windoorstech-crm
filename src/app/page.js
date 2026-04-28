'use client';
import { useState } from 'react';
import { login, setSession, getUsersFromStorage, generatePassKey } from '@/lib/auth';

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotUser, setForgotUser] = useState('');
  const [passKey, setPassKey] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const users = typeof window !== 'undefined' ? getUsersFromStorage() : [];

  function handleLogin(e) {
    e.preventDefault();
    setError('');
    const result = login(username, password);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSession(result.user);
    window.location.href = '/dashboard';
  }

  function handleForgotPassword(e) {
    e.preventDefault();
    setError('');
    setPassKey('');
    setSuccessMsg('');
    if (!forgotUser) {
      setError('Please select a username.');
      return;
    }
    const key = generatePassKey();
    setPassKey(key);
    setSuccessMsg(`Pass Key generated and sent to Admin Gmail: manishcode6@gmail.com`);
  }

  return (
    <div className="login-page">
      <div className="login-card animate-slide">
        <div className="login-logo">
          <div className="login-logo-icon">W</div>
          <h1>Windoorstech CRM</h1>
          <p>Sales Lead Management System</p>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); setPassKey(''); setSuccessMsg(''); }}>
            🔐 Sign In
          </button>
          <button className={`login-tab ${tab === 'forgot' ? 'active' : ''}`} onClick={() => { setTab('forgot'); setError(''); setPassKey(''); setSuccessMsg(''); }}>
            🔑 Forgot Password
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {successMsg && <div className="alert alert-success">{successMsg}</div>}

        {tab === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                id="login-username"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" id="login-submit">
              Sign In →
            </button>
          </form>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Select Username</label>
              <select className="form-control" value={forgotUser} onChange={(e) => setForgotUser(e.target.value)} id="forgot-user-select">
                <option value="">-- Select Username --</option>
                {users.map((u) => (
                  <option key={u.username} value={u.username}>{u.username}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Gmail</label>
              <input type="email" className="form-control" value="manishcode6@gmail.com" disabled />
            </div>
            <button type="submit" className="btn btn-primary btn-lg w-full" id="forgot-submit">
              🔑 Submit Request Pass Key
            </button>
            {passKey && (
              <div className="passkey-box animate-slide">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Generated Pass Key</div>
                <div className="passkey-key">{passKey}</div>
                <div className="passkey-note">This key has been sent to manishcode6@gmail.com<br />Get it from ADMIN</div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
