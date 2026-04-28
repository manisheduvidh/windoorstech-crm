// Hardcoded users (will later sync with Supabase)
export const USERS = [
  {
    id: 'admin26-id',
    username: 'ADMIN26',
    password: 'ADMIN@123',
    role: 'admin',
    displayName: 'Admin (Full Access)',
    email: 'manishcode6@gmail.com',
    isFrozen: false,
  },
  {
    id: 'adminv26-id',
    username: 'ADMINV26',
    password: 'ADMINV@123',
    role: 'admin_view',
    displayName: 'Admin (View Only)',
    email: 'manishcode6@gmail.com',
    isFrozen: false,
  },
  {
    id: 'sam2026-id',
    username: 'SAM2026',
    password: 'SAM@123',
    role: 'manager',
    displayName: 'Manager Sales 1',
    email: '',
    isFrozen: false,
  },
  {
    id: 'sam22026-id',
    username: 'SAM22026',
    password: 'SAM2@123',
    role: 'manager',
    displayName: 'Manager Sales 2',
    email: '',
    isFrozen: false,
  },
  {
    id: 'se001-id',
    username: 'SE001',
    password: 'SE@2026',
    role: 'employee',
    displayName: 'Sales Employee 1',
    email: '',
    isFrozen: false,
  },
];

export function getUsersFromStorage() {
  if (typeof window === 'undefined') return USERS;
  const stored = localStorage.getItem('wt_users');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('wt_users', JSON.stringify(USERS));
  return USERS;
}

export function saveUsersToStorage(users) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wt_users', JSON.stringify(users));
}

export function login(username, password) {
  const users = getUsersFromStorage();
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return { error: 'Invalid username or password.' };
  if (user.isFrozen) return { error: 'Your account has been frozen. Contact admin.' };
  return { user };
}

export function getSession() {
  if (typeof window === 'undefined') return null;
  const s = localStorage.getItem('wt_session');
  return s ? JSON.parse(s) : null;
}

export function setSession(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('wt_session', JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('wt_session');
}

export function generatePassKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 7; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export function getNextEmployeeUsername() {
  const users = getUsersFromStorage();
  const employees = users.filter((u) => u.username.startsWith('SE'));
  const nums = employees.map((u) => parseInt(u.username.replace('SE', ''), 10)).filter(Boolean);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `SE${String(max + 1).padStart(3, '0')}`;
}
