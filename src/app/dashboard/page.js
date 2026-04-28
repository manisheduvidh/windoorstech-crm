'use client';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import { getLeadsForUser } from '@/lib/leads';
import { useRouter } from 'next/navigation';

export default function DashboardHome() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) { router.push('/'); return; }
    setUser(session);
    setLeads(getLeadsForUser(session));
  }, [router]);

  if (!user) return null;

  const total = leads.length;
  const valid = leads.filter(l => l.leadQuality === 'Valid').length;
  const notValid = leads.filter(l => l.leadQuality === 'Not Valid').length;
  const below = leads.filter(l => l.leadQuality === 'Below 100sqft').length;
  const withQuote = leads.filter(l => l.quoteBrand).length;
  const totalSqft = leads.reduce((s, l) => s + (parseFloat(l.quoteSqft) || 0), 0);
  const totalValue = leads.reduce((s, l) => s + (parseFloat(l.quoteValue) || 0), 0);

  const recentLeads = [...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const roleLabel = { admin: 'Admin (Full Access)', admin_view: 'Admin (View Only)', manager: 'Sales Manager', employee: 'Sales Employee' };

  return (
    <>
      <div className="page-header">
        <div className="page-title">📊 Dashboard</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user.username}</strong>
        </div>
      </div>
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card accent">
            <div className="stat-icon">📋</div>
            <div className="stat-label">Total Leads</div>
            <div className="stat-value">{total}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">✅</div>
            <div className="stat-label">Valid Leads</div>
            <div className="stat-value">{valid}</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-icon">❌</div>
            <div className="stat-label">Not Valid</div>
            <div className="stat-value">{notValid}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">📐</div>
            <div className="stat-label">Below 100sqft</div>
            <div className="stat-value">{below}</div>
          </div>
          <div className="stat-card accent">
            <div className="stat-icon">💼</div>
            <div className="stat-label">Quotes Given</div>
            <div className="stat-value">{withQuote}</div>
          </div>
          <div className="stat-card success">
            <div className="stat-icon">📏</div>
            <div className="stat-label">Total Sqft</div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>{totalSqft.toLocaleString()}</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-icon">💰</div>
            <div className="stat-label">Total Quote Value</div>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>₹{totalValue.toLocaleString()}</div>
          </div>
        </div>

        {/* Quick Actions */}
        {user.role !== 'admin_view' && (
          <div className="card mb-4" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <div className="card-title">⚡ Quick Actions</div>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => router.push('/dashboard/add-lead')} id="qa-add-lead">➕ Add New Lead</button>
              <button className="btn btn-secondary" onClick={() => router.push('/dashboard/view-leads')} id="qa-view-leads">📋 View All Leads</button>
              <button className="btn btn-secondary" onClick={() => router.push('/dashboard/report')} id="qa-report">📈 View Report</button>
              {user.role === 'admin' && (
                <>
                  <button className="btn btn-secondary" onClick={() => router.push('/dashboard/add-employee')} id="qa-add-emp">👤 Add Employee</button>
                  <button className="btn btn-secondary" onClick={() => router.push('/dashboard/user-access')} id="qa-user-access">🔒 User Access</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Recent Leads */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🕒 Recent Leads</div>
            <button className="btn btn-secondary btn-sm" onClick={() => router.push('/dashboard/view-leads')}>View All</button>
          </div>
          {recentLeads.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No leads yet. {user.role !== 'admin_view' ? 'Add your first lead!' : ''}</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Primary Name</th>
                    <th>Quality</th>
                    <th>Category</th>
                    <th>Contact</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map(lead => (
                    <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/dashboard/view-leads?id=${lead.id}`)}>
                      <td><strong>{lead.primaryName || '—'}</strong></td>
                      <td>
                        <span className={`badge ${lead.leadQuality === 'Valid' ? 'badge-success' : lead.leadQuality === 'Not Valid' ? 'badge-danger' : 'badge-warning'}`}>
                          {lead.leadQuality}
                        </span>
                      </td>
                      <td><span className="tag">{lead.leadCategory || '—'}</span></td>
                      <td>{lead.primaryContact || '—'}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(lead.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
