
import { User, AppConfig, UserStatus } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';

const STORAGE_KEYS = {
  USERS: 'qm_users',
  CONFIG: 'qm_config',
  CURRENT_USER: 'qm_current_user',
};

// --- Config Management ---
export const getAppConfig = (): AppConfig => {
  const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
  return saved ? JSON.parse(saved) : { 
    sheetUrl: '', 
    usersSheetUrl: '', 
    quotationsUrl: '', 
    googleScriptUrl: '',
    lastUpdated: '' 
  };
};

export const saveAppConfig = (config: AppConfig) => {
  localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

// --- User Management ---
export const getUsers = (): User[] => {
  const saved = localStorage.getItem(STORAGE_KEYS.USERS);
  return saved ? JSON.parse(saved) : [];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const registerUser = (user: Omit<User, 'status' | 'signupDate'>): { success: boolean, message: string } => {
  const users = getUsers();
  if (users.find(u => u.mobile === user.mobile)) {
    return { success: false, message: 'Mobile number already registered' };
  }

  const newUser: User = {
    ...user,
    status: 'Pending',
    signupDate: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);
  
  return { success: true, message: 'Signup successful. Pending approval.' };
};

export const loginUser = (mobile: string): { success: boolean, user?: User, message: string } => {
  // Admin Check
  if (mobile === 'admin') {
      return { success: false, message: 'Use Admin Login button' };
  }

  const users = getUsers();
  const user = users.find(u => u.mobile === mobile);

  if (!user) {
    return { success: false, message: 'User not found. Please sign up.' };
  }

  if (user.status === 'Pending') {
    return { success: false, message: 'Account pending approval.' };
  }

  if (user.status === 'Rejected') {
    return { success: false, message: 'Account has been rejected.' };
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return { success: true, user, message: 'Login successful' };
};

export const adminLogin = (id: string, pass: string) => {
  if (id === ADMIN_CREDENTIALS.id && pass === ADMIN_CREDENTIALS.password) {
    const adminUser: User = { 
        mobile: 'admin', 
        name: 'Administrator', 
        accountType: 'Admin', 
        status: 'Approved', 
        signupDate: new Date().toISOString() 
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return saved ? JSON.parse(saved) : null;
};

export const updateUserStatus = (mobile: string, status: UserStatus) => {
  const users = getUsers();
  const updatedUsers = users.map(u => u.mobile === mobile ? { ...u, status } : u);
  saveUsers(updatedUsers);
};
