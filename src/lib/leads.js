export function getLeads() {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('wt_leads');
  return stored ? JSON.parse(stored) : [];
}

export function saveLeads(leads) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wt_leads', JSON.stringify(leads));
}

export function addLead(lead) {
  const leads = getLeads();
  const newLead = {
    ...lead,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.push(newLead);
  saveLeads(leads);
  return newLead;
}

export function updateLead(id, updates) {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
  saveLeads(leads);
  return leads[idx];
}

export function deleteLead(id) {
  const leads = getLeads().filter((l) => l.id !== id);
  saveLeads(leads);
}

export function deleteMultipleLeads(ids) {
  const leads = getLeads().filter((l) => !ids.includes(l.id));
  saveLeads(leads);
}

export function getLeadById(id) {
  return getLeads().find((l) => l.id === id) || null;
}

export function getLeadsForUser(user) {
  const leads = getLeads();
  if (user.role === 'admin' || user.role === 'admin_view') return leads;
  return leads.filter((l) => l.createdBy === user.id);
}
