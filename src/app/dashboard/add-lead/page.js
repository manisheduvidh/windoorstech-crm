'use client';
import { useState, useEffect, useRef } from 'react';
import { getSession } from '@/lib/auth';
import { addLead } from '@/lib/leads';
import { useRouter } from 'next/navigation';

const LEAD_CATS = ['Social Media','Google Form lead Web','Google Call lead Web','GMB','Other'];
const PERSON_CATS = ['Owner','Architect','Contractor','Other'];
const BRANDS = ['Sudhakar','Cardinal','Veka','Hormann','Schuco'];

export default function AddLeadPage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ leadQuality:'', leadCategory:'', primaryName:'', primaryCategory:'', primaryContact:'', secondaryName:'', secondaryCategory:'', secondaryContact:'', location:'', quoteBrand:'', quoteName:'', quoteSqft:'', quoteValue:'' });
  const [images, setImages] = useState([]);
  const [quoteFile, setQuoteFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const imgRef = useRef();
  const qRef = useRef();
  const router = useRouter();

  useEffect(() => {
    const s = getSession();
    if (!s) { router.push('/'); return; }
    if (s.role === 'admin_view') { router.push('/dashboard'); return; }
    setUser(s);
  }, [router]);

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setErrors(e => ({...e,[k]:''})); };
  const isOpt = form.leadQuality === 'Not Valid' || form.leadQuality === 'Below 100sqft';

  function validate() {
    const e = {};
    if (!form.leadQuality) e.leadQuality = 'Required';
    if (!isOpt) {
      if (!form.leadCategory) e.leadCategory = 'Required';
      if (!form.primaryName) e.primaryName = 'Required';
      if (!form.primaryCategory) e.primaryCategory = 'Required';
      if (!form.primaryContact) e.primaryContact = 'Required';
      if (!form.location) e.location = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    addLead({ ...form, createdBy: user.id, createdByUsername: user.username, imageNames: images.map(f=>f.name), quoteFileName: quoteFile?.name||'' });
    setSuccess('Lead added successfully!');
    setForm({ leadQuality:'', leadCategory:'', primaryName:'', primaryCategory:'', primaryContact:'', secondaryName:'', secondaryCategory:'', secondaryContact:'', location:'', quoteBrand:'', quoteName:'', quoteSqft:'', quoteValue:'' });
    setImages([]); setQuoteFile(null);
    setTimeout(() => setSuccess(''), 3000);
  }

  if (!user) return null;
  const R = !isOpt ? <span className="req">*</span> : null;

  return (
    <>
      <div className="page-header"><div className="page-title">➕ Add New Lead</div></div>
      <div className="page-body">
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="card" style={{marginBottom:20}}>
            <div className="card-header"><div className="card-title">Lead Information</div></div>
            <p style={{fontSize:'0.82rem',color:'var(--text-muted)',marginBottom:18}}>Fields marked with <span style={{color:'var(--accent)'}}>*</span> are required.</p>
            <div className="form-group">
              <label className="form-label">Lead Quality Status<span className="req">*</span></label>
              <select className={`form-control ${errors.leadQuality?'error':''}`} value={form.leadQuality} onChange={e=>set('leadQuality',e.target.value)} id="lead-quality">
                <option value="">-- Select --</option>
                <option>Valid</option><option>Not Valid</option><option>Below 100sqft</option>
              </select>
              {errors.leadQuality && <div className="form-error">{errors.leadQuality}</div>}
            </div>
            {isOpt && <div className="alert alert-warning">Lead marked as <strong>{form.leadQuality}</strong> — all other fields are optional.</div>}
            <div className="form-group">
              <label className="form-label">Lead Category {R}</label>
              <select className={`form-control ${errors.leadCategory?'error':''}`} value={form.leadCategory} onChange={e=>set('leadCategory',e.target.value)} id="lead-category">
                <option value="">-- Select --</option>
                {LEAD_CATS.map(c=><option key={c}>{c}</option>)}
              </select>
              {errors.leadCategory && <div className="form-error">{errors.leadCategory}</div>}
            </div>
          </div>

          <div className="card" style={{marginBottom:20}}>
            <div className="card-header"><div className="card-title">Primary Contact</div></div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Primary Name 1 {R}</label>
                <input className={`form-control ${errors.primaryName?'error':''}`} placeholder="Enter primary name" value={form.primaryName} onChange={e=>set('primaryName',e.target.value)} id="primary-name"/>
                {errors.primaryName && <div className="form-error">{errors.primaryName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Category {R}</label>
                <select className={`form-control ${errors.primaryCategory?'error':''}`} value={form.primaryCategory} onChange={e=>set('primaryCategory',e.target.value)} id="primary-category">
                  <option value="">-- Select --</option>
                  {PERSON_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
                {errors.primaryCategory && <div className="form-error">{errors.primaryCategory}</div>}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Info {R}</label>
              <input className={`form-control ${errors.primaryContact?'error':''}`} placeholder="Phone / Email" value={form.primaryContact} onChange={e=>set('primaryContact',e.target.value)} id="primary-contact"/>
              {errors.primaryContact && <div className="form-error">{errors.primaryContact}</div>}
            </div>
          </div>

          <div className="card" style={{marginBottom:20}}>
            <div className="card-header"><div className="card-title">Secondary Contact <span style={{fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:400}}>(Optional)</span></div></div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Secondary Name 2</label>
                <input className="form-control" placeholder="Enter name" value={form.secondaryName} onChange={e=>set('secondaryName',e.target.value)} id="sec-name"/>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.secondaryCategory} onChange={e=>set('secondaryCategory',e.target.value)} id="sec-cat">
                  <option value="">-- Select --</option>
                  {PERSON_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Contact Info</label>
              <input className="form-control" placeholder="Phone / Email" value={form.secondaryContact} onChange={e=>set('secondaryContact',e.target.value)} id="sec-contact"/>
            </div>
          </div>

          <div className="card" style={{marginBottom:20}}>
            <div className="card-header"><div className="card-title">📍 Location {R}</div></div>
            <div className="form-group">
              <textarea className={`form-control ${errors.location?'error':''}`} placeholder="Enter full location / address" value={form.location} onChange={e=>set('location',e.target.value)} rows={3} id="location"/>
              {errors.location && <div className="form-error">{errors.location}</div>}
            </div>
          </div>

          <div className="card" style={{marginBottom:20}}>
            <div className="card-header"><div className="card-title">📷 Images</div></div>
            <div className="upload-area" onClick={()=>imgRef.current.click()}>
              <div style={{fontSize:'2rem',marginBottom:6}}>🖼️</div>
              <div style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>Click to upload images</div>
            </div>
            <input ref={imgRef} type="file" accept="image/*" multiple hidden onChange={e=>setImages(p=>[...p,...Array.from(e.target.files)])}/>
            {images.length>0 && <div className="file-list">{images.map((f,i)=><div className="file-item" key={i}><span>🖼️</span><span className="file-item-name">{f.name}</span><button type="button" className="file-item-remove" onClick={()=>setImages(x=>x.filter((_,j)=>j!==i))}>✕</button></div>)}</div>}
          </div>

          <div className="card" style={{marginBottom:24}}>
            <div className="card-header"><div className="card-title">💼 Quote</div></div>
            <div className="grid-2">
              <div className="form-group"><label className="form-label">Brand</label><select className="form-control" value={form.quoteBrand} onChange={e=>set('quoteBrand',e.target.value)} id="q-brand"><option value="">-- Select --</option>{BRANDS.map(b=><option key={b}>{b}</option>)}</select></div>
              <div className="form-group"><label className="form-label">Quote Name</label><input className="form-control" placeholder="Name" value={form.quoteName} onChange={e=>set('quoteName',e.target.value)} id="q-name"/></div>
              <div className="form-group"><label className="form-label">Sqft</label><input type="number" className="form-control" placeholder="e.g. 250" value={form.quoteSqft} onChange={e=>set('quoteSqft',e.target.value)} id="q-sqft"/></div>
              <div className="form-group"><label className="form-label">Value (₹)</label><input type="number" className="form-control" placeholder="e.g. 150000" value={form.quoteValue} onChange={e=>set('quoteValue',e.target.value)} id="q-val"/></div>
            </div>
            <div className="form-group"><label className="form-label">Attach Quote</label><div className="upload-area" onClick={()=>qRef.current.click()}><div style={{fontSize:'0.875rem',color:'var(--text-secondary)'}}>📎 {quoteFile?quoteFile.name:'Click to attach'}</div></div><input ref={qRef} type="file" accept=".pdf,.xlsx,.xls" hidden onChange={e=>setQuoteFile(e.target.files[0])}/></div>
          </div>

          <div style={{display:'flex',gap:12}}>
            <button type="submit" className="btn btn-primary btn-lg" id="submit-lead">✅ Submit Lead</button>
            <button type="button" className="btn btn-secondary btn-lg" onClick={()=>router.push('/dashboard')}>Cancel</button>
          </div>
        </form>
      </div>
    </>
  );
}
