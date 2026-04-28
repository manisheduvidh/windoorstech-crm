'use client';
import { useState, useEffect } from 'react';
import { getSession, getUsersFromStorage, saveUsersToStorage } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function UserAccessPage() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session || session.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setUser(session);
    setUsers(getUsersFromStorage());
  }, [router]);

  function toggleFreeze(targetUserId) {
    const updatedUsers = users.map(u => {
      if (u.id === targetUserId) {
        return { ...u, isFrozen: !u.isFrozen };
      }
      return u;
    });
    setUsers(updatedUsers);
    saveUsersToStorage(updatedUsers);
  }

  if (!user) return null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">🔒 User Access Management</div>
      </div>
      <div className="page-body">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Manage Employee Access</div>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            Freeze accounts to prevent login, or unfreeze to restore access.
          </p>
          
          <div className="user-list">
            {users.filter(u => u.role !== 'admin').map(u => (
              <div key={u.id} className="user-card">
                <div className="user-card-info">
                  <div className="user-card-avatar">{u.username.charAt(0)}</div>
                  <div>
                    <div className="user-card-name">{u.username}</div>
                    <div className="user-card-role">{u.displayName}</div>
                  </div>
                  {u.isFrozen && <span className="frozen-banner">FROZEN</span>}
                </div>
                
                <label className="toggle-switch">
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{u.isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                  <input 
                    type="checkbox" 
                    checked={!u.isFrozen} 
                    onChange={() => toggleFreeze(u.id)} 
                  />
                  <div className="toggle-track"></div>
                </label>
              </div>
            ))}
          </div>
          
          {users.filter(u => u.role !== 'admin').length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">No employees found to manage.</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
