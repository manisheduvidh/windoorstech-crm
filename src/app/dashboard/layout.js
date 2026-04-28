'use client';
import { useEffect, useState } from 'react';
import { getSession, clearSession } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', roles: ['admin', 'admin_view', 'manager', 'employee'] },
  { key: 'add-lead', label: 'Add New Lead', icon: '➕', href: '/dashboard/add-lead', roles: ['admin', 'manager', 'employee'] },
  { key: 'view-leads', label: 'View Leads', icon: '📋', href: '/dashboard/view-leads', roles: ['admin', 'admin_view', 'manager', 'employee'] },
  { key: 'report', label: 'Employee Report', icon: '📈', href: '/dashboard/report', roles: ['admin', 'admin_view', 'manager', 'employee'] },
  { key: 'add-employee', label: 'Add Employee', icon: '👤', href: '/dashboard/add-employee', roles: ['admin'] },
  { key: 'user-access', label: 'User Access', icon: '🔒', href: '/dashboard/user-access', roles: ['admin'] },
];

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/');
      return;
    }
    setUser(session);
    setLoading(false);
  }, [router]);

  function handleLogout() {
    clearSession();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="login-page">
        <div className="spinner" style={{ width: 40, height: 40 }}></div>
      </div>
    );
  }

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

  const roleLabels = {
    admin: 'Admin (Full Access)',
    admin_view: 'Admin (View Only)',
    manager: 'Sales Manager',
    employee: 'Sales Employee',
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">W</div>
          <div>
            <div className="sidebar-logo-name">Windoorstech</div>
            <div className="sidebar-logo-sub">CRM System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">Navigation</div>
          {filteredNav.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              onClick={() => router.push(item.href)}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.username?.charAt(0)}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">{user?.username}</div>
              <div className="sidebar-role">{roleLabels[user?.role] || user?.role}</div>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm w-full mt-4"
            onClick={handleLogout}
            id="logout-btn"
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
