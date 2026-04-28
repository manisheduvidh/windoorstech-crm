'use client';
import { useState, useEffect } from 'react';
import { getSession, getUsersFromStorage } from '@/lib/auth';
import { getLeadsForUser, updateLead } from '@/lib/leads';
import { useRouter, useSearchParams } from 'next/navigation';

const LEAD_CATS = ['Social Media','Google Form lead Web','Google Call lead Web','GMB','Other'];
const PERSON_CATS = ['Owner','Architect','Contractor','Other'];
const BRANDS = ['Sudhakar','Cardinal','Veka','Hormann','Schuco'];

export default function ViewLeadsPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [fCat, setFCat] = useState('');
  const [fEmp, setFEmp] = useState('');
  const [fYear, setFYear] = useState('');
  const [fMonth, setFMonth] = useState('');
  const [fDay, setFDay] = useState('');
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saveMsg, setSaveMsg] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteMsg, setDeleteMsg] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const users = typeof window !== 'undefined' ? getUsersFromStorage() : [];

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/'); return; }
    setUser(s);
    const l = getLeadsForUser(s);
    setLeads(l);
    setFiltered(l);
    const id = searchParams.get('id');
    if (id) { const found = l.find(x => x.id === id); if (found) setSelected(found); }
  }, [router, searchParams]);

  useEffect(() => {
    let r = [...leads];
    if (search) { const s = search.toLowerCase(); r = r.filter(l => (l.primaryName||'').toLowerCase().includes(s) || (l.primaryContact||'').toLowerCase().includes(s) || (l.secondaryName||'').toLowerCase().includes(s)); }
    if (fCat) r = r.filter(l => l.leadCategory === fCat);
    if (fEmp) r = r.filter(l => l.createdByUsername === fEmp);
    if (fYear) r = r.filter(l => new Date(l.createdAt).getFullYear().toString() === fYear);
    if (fMonth) r = r.filter(l => (new Date(l.createdAt).getMonth()+1).toString() === fMonth);
    if (fDay) r = r.filter(l => new Date(l.createdAt).toISOString().split('T')[0] === fDay);
    setFiltered(r);
  }, [search, fCat, fEmp, fYear, fMonth, fDay, leads]);

  function resetFilters() { setSearch(''); setFCat(''); setFEmp(''); setFYear(''); setFMonth(''); setFDay(''); setSelectedIds([]); }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(l => l.id));
    }
  }

  function toggleSelect(id) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  function handleDeleteBulk() {
    if (selectedIds.length === 0) return;
    
    // Rule: Can only delete leads up to 1 month old
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const leadsToDelete = leads.filter(l => selectedIds.includes(l.id));
    const tooOld = leadsToDelete.filter(l => new Date(l.createdAt) < oneMonthAgo);

    if (tooOld.length > 0) {
      alert(`Cannot delete ${tooOld.length} selected lead(s) because they are older than 1 month.`);
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected lead(s)?`)) {
      import('@/lib/leads').then(lib => {
        lib.deleteMultipleLeads(selectedIds);
        const l = lib.getLeadsForUser(user);
        setLeads(l);
        setSelectedIds([]);
        setDeleteMsg(`${selectedIds.length} leads deleted.`);
        setTimeout(() => setDeleteMsg(''), 3000);
      });
    }
  }

  function openDetail(lead) { setSelected(lead); setEditing(false); setSaveMsg(''); }
  function closeDetail() { setSelected(null); setEditing(false); setSaveMsg(''); }

  function startEdit() {
    setEditForm({ ...selected });
    setEditing(true);
  }

  function saveEdit() {
    const updated = updateLead(editForm.id, editForm);
    if (updated) {
      setSelected(updated);
      setLeads(getLeadsForUser(user));
      setEditing(false);
      setSaveMsg('Lead updated successfully!');
      setTimeout(() => setSaveMsg(''), 3000);
    }
  }

  const canEdit = user && user.role !== 'admin_view';
  const years = [...new Set(leads.map(l => new Date(l.createdAt).getFullYear()))].sort((a,b) => b-a);

  if (!user) return null;

  return (
    <>
      <div className="page-header">
        <div className="page-title">📋 View Leads</div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {user.role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(59,130,246,0.1)', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)' }}>
                {selectedIds.length > 0 ? `Selected: ${selectedIds.length}` : 'Selection Mode Active'}
              </span>
              {selectedIds.length > 0 && (
                <button className="btn btn-danger btn-sm" onClick={handleDeleteBulk} style={{ padding: '4px 10px' }}>
                  🗑️ Delete Permanently
                </button>
              )}
            </div>
          )}
          <span className="badge badge-info">{filtered.length} leads</span>
        </div>
      </div>
      <div className="page-body">
        <div className="filter-bar">
          <input className="form-control filter-search" placeholder="🔍 Search by Name or Contact..." value={search} onChange={e => setSearch(e.target.value)} id="search-leads"/>
          <select className="form-control" value={fCat} onChange={e => setFCat(e.target.value)} id="filter-cat">
            <option value="">All Categories</option>
            {LEAD_CATS.map(c => <option key={c}>{c}</option>)}
          </select>
          {(user.role === 'admin' || user.role === 'admin_view') && (
            <select className="form-control" value={fEmp} onChange={e => setFEmp(e.target.value)} id="filter-emp">
              <option value="">All Employees</option>
              {users.map(u => <option key={u.username} value={u.username}>{u.username}</option>)}
            </select>
          )}
          <select className="form-control" value={fYear} onChange={e => setFYear(e.target.value)} id="filter-year">
            <option value="">All Years</option>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
          <select className="form-control" value={fMonth} onChange={e => setFMonth(e.target.value)} id="filter-month">
            <option value="">All Months</option>
            {[...Array(12)].map((_,i) => <option key={i+1} value={i+1}>{new Date(2000,i).toLocaleString('en',{month:'long'})}</option>)}
          </select>
          <input type="date" className="form-control" value={fDay} onChange={e => setFDay(e.target.value)} id="filter-day"/>
          <button className="btn btn-secondary btn-sm" onClick={resetFilters}>🔄 Reset</button>
        </div>

        {deleteMsg && <div className="alert alert-success">{deleteMsg}</div>}

        {filtered.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📭</div><div>No leads found.</div></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {user.role === 'admin' && (
                    <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} /></th>
                  )}
                  <th>Name</th><th>Quality</th><th>Category</th><th>Contact</th><th>By</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} style={{cursor:'pointer'}} onClick={() => openDetail(l)}>
                    {user.role === 'admin' && (
                      <td onClick={e => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleSelect(l.id)} />
                      </td>
                    )}
                    <td><span className="click-link">{l.primaryName||'—'}</span></td>
                    <td><span className={`badge ${l.leadQuality==='Valid'?'badge-success':l.leadQuality==='Not Valid'?'badge-danger':'badge-warning'}`}>{l.leadQuality}</span></td>
                    <td><span className="tag">{l.leadCategory||'—'}</span></td>
                    <td>{l.primaryContact||'—'}</td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{l.createdByUsername||'—'}</td>
                    <td style={{color:'var(--text-muted)',fontSize:'0.8rem'}}>{new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail / Edit Modal */}
        {selected && (
          <div className="modal-overlay" onClick={closeDetail}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:720}}>
              <div className="modal-header">
                <div className="modal-title">{editing ? '✏️ Edit Lead' : '📄 Lead Details'}</div>
                <button className="modal-close" onClick={closeDetail}>✕</button>
              </div>
              <div className="modal-body">
                {saveMsg && <div className="alert alert-success">{saveMsg}</div>}
                {!editing ? (
                  <div className="lead-detail-grid">
                    <D l="Quality" v={selected.leadQuality}/>
                    <D l="Category" v={selected.leadCategory}/>
                    <D l="Primary Name" v={selected.primaryName}/>
                    <D l="Primary Type" v={selected.primaryCategory}/>
                    <D l="Primary Contact" v={selected.primaryContact}/>
                    <D l="Secondary Name" v={selected.secondaryName}/>
                    <D l="Secondary Type" v={selected.secondaryCategory}/>
                    <D l="Secondary Contact" v={selected.secondaryContact}/>
                    <D l="Location" v={selected.location}/>
                    <D l="Quote Brand" v={selected.quoteBrand}/>
                    <D l="Quote Name" v={selected.quoteName}/>
                    <D l="Quote Sqft" v={selected.quoteSqft}/>
                    <D l="Quote Value" v={selected.quoteValue ? `₹${Number(selected.quoteValue).toLocaleString()}` : ''}/>
                    <D l="Created By" v={selected.createdByUsername}/>
                    <D l="Created" v={new Date(selected.createdAt).toLocaleString('en-IN')}/>
                  </div>
                ) : (
                  <>
                    <EF l="Lead Quality" k="leadQuality" f={editForm} s={setEditForm} type="select" opts={['Valid','Not Valid','Below 100sqft']}/>
                    <EF l="Lead Category" k="leadCategory" f={editForm} s={setEditForm} type="select" opts={LEAD_CATS}/>
                    <div className="grid-2">
                      <EF l="Primary Name" k="primaryName" f={editForm} s={setEditForm}/>
                      <EF l="Primary Category" k="primaryCategory" f={editForm} s={setEditForm} type="select" opts={PERSON_CATS}/>
                    </div>
                    <EF l="Primary Contact" k="primaryContact" f={editForm} s={setEditForm}/>
                    <div className="grid-2">
                      <EF l="Secondary Name" k="secondaryName" f={editForm} s={setEditForm}/>
                      <EF l="Secondary Category" k="secondaryCategory" f={editForm} s={setEditForm} type="select" opts={PERSON_CATS}/>
                    </div>
                    <EF l="Secondary Contact" k="secondaryContact" f={editForm} s={setEditForm}/>
                    <EF l="Location" k="location" f={editForm} s={setEditForm} type="textarea"/>
                    <div className="grid-2">
                      <EF l="Quote Brand" k="quoteBrand" f={editForm} s={setEditForm} type="select" opts={BRANDS}/>
                      <EF l="Quote Name" k="quoteName" f={editForm} s={setEditForm}/>
                      <EF l="Quote Sqft" k="quoteSqft" f={editForm} s={setEditForm} type="number"/>
                      <EF l="Quote Value" k="quoteValue" f={editForm} s={setEditForm} type="number"/>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                {!editing && canEdit && <button className="btn btn-primary" onClick={startEdit}>✏️ Edit Lead</button>}
                {editing && <><button className="btn btn-success" onClick={saveEdit}>💾 Save</button><button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button></>}
                <button className="btn btn-secondary" onClick={closeDetail}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function D({ l, v }) {
  return <div className="lead-detail-item"><div className="lead-detail-label">{l}</div><div className="lead-detail-value">{v || '—'}</div></div>;
}

function EF({ l, k, f, s, type, opts }) {
  const val = f[k] || '';
  const onChange = e => s(prev => ({ ...prev, [k]: e.target.value }));
  return (
    <div className="form-group">
      <label className="form-label">{l}</label>
      {type === 'select' ? (
        <select className="form-control" value={val} onChange={onChange}><option value="">-- Select --</option>{(opts||[]).map(o => <option key={o}>{o}</option>)}</select>
      ) : type === 'textarea' ? (
        <textarea className="form-control" value={val} onChange={onChange} rows={3}/>
      ) : (
        <input type={type||'text'} className="form-control" value={val} onChange={onChange}/>
      )}
    </div>
  );
}
