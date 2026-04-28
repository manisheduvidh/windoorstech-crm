'use client';
import { useState, useEffect } from 'react';
import { getSession, getUsersFromStorage, saveUsersToStorage, generatePassKey, getNextEmployeeUsername } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AddEmployeePage() {
  const [user, setUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [success, setSuccess] = useState('');
  const [passKey, setPassKey] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUser(session);
    setNewUsername(getNextEmployeeUsername());
  }, [router]);

  function handleAddEmployee(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setPassKey('');

    const key = generatePassKey();
    const newUser = {
      id: crypto.randomUUID(),
      username: newUsername,
      password: `SE@${new Date().getFullYear()}`, // Default password pattern
      role: 'employee',
      displayName: `Sales Employee ${newUsername.replace('SE', '')}`,
      email: '',
      isFrozen: false,
    };

    const users = getUsersFromStorage();
    users.push(newUser);
    saveUsersToStorage(users);

    setPassKey(key);
    setSuccess(`Employee ${newUsername} added successfully! Pass Key sent to Admin Gmail: manishcode6@gmail.com`);
    setNewUsername(getNextEmployeeUsername());
    setLoading(false);
  }

  if (!user) return null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">👤 Add Sales Employee</div>
      </div>
      <div className="page-body">
        <div className="card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <div className="card-header">
            <div className="card-title">New Employee Details</div>
          </div>
          <form onSubmit={handleAddEmployee}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" className="form-control" value={newUsername} disabled />
              <small style={{ color: 'var(--text-muted)' }}>Auto-incremented ID</small>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Gmail</label>
              <input type="email" className="form-control" value="manishcode6@gmail.com" disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Default Password Pattern</label>
              <input type="text" className="form-control" value={`SE@${new Date().getFullYear()}`} disabled />
            </div>
            
            {success && <div className="alert alert-success mt-4">{success}</div>}
            
            {passKey && (
              <div className="passkey-box animate-slide">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Activation Pass Key</div>
                <div className="passkey-key">{passKey}</div>
                <div className="passkey-note">Provide this key to the new employee.</div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg w-full mt-4" disabled={loading}>
              {loading ? 'Adding...' : '🚀 Submit Request Pass Key'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
