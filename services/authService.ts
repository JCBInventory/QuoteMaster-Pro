import { User, AppConfig, UserStatus } from '../types';
import { ADMIN_CREDENTIALS } from '../constants';

// In-memory storage (browser-safe)
const memoryStorage: Record<string, string> = {};

const STORAGE_KEYS = {
  USERS: 'qm_users',
  CONFIG: 'qm_config',
  CURRENT_USER: 'qm_current_user',
};

// Safe localStorage wrapper
const safeStorage = {
  getItem: (key: string) => {
    try {
      return typeof window !== 'undefined' && localStorage 
        ? localStorage.getItem(key) 
        : memoryStorage[key] || null;
    } catch {
      return memoryStorage[key] || null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.setItem(key, value);
      }
    } catch {
      // Fallback to memory
    }
    memoryStorage[key] = value;
  },
  removeItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem(key);
      }
    } catch {
      // Fallback to memory
    }
    delete memoryStorage[key];
  }
};

// --- Config Management ---
export const getAppConfig = (): AppConfig => {
  const saved = safeStorage.getItem(STORAGE_KEYS.CONFIG);
  return saved ? JSON.parse(saved) : { 
    sheetUrl: '', 
    usersSheetUrl: '', 
    quotationsUrl: '', 
    googleScriptUrl: '',
    lastUpdated: '' 
  };
};

export const saveAppConfig = (config: AppConfig) => {
  safeStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
};

// --- User Management ---
export const getUsers = (): User[] => {
  const saved = safeStorage.getItem(STORAGE_KEYS.USERS);
  return saved ? JSON.parse(saved) : [];
};

const saveUsers = (users: User[]) => {
  safeStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
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
  safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
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
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
    return true;
  }
  return false;
};

export const logout = () => {
  safeStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

export const getCurrentUser = (): User | null => {
  const saved = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return saved ? JSON.parse(saved) : null;
};

export const updateUserStatus = (mobile: string, status: UserStatus) => {
  const users = getUsers();
  const updatedUsers = users.map(u => u.mobile === mobile ? { ...u, status } : u);
  saveUsers(updatedUsers);
};
