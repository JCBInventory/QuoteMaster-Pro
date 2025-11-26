
import React, { useState } from 'react';
import { User, AccountType } from '../types';
import { loginUser, registerUser, adminLogin, getAppConfig } from '../services/authService';
import { sendDataToScript } from '../services/googleSheetService';
import { Lock, User as UserIcon, LogIn, ChevronRight, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: (user: User) => void;
}

export const LandingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-blue-900 to-black text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_rgba(30,64,175,0.2),transparent_70%)] pointer-events-none" />

      <div className="z-10 w-full max-w-sm flex flex-col gap-6 text-center">
        <div className="mb-4">
            <h1 className="text-4xl font-bold text-yellow-400 tracking-tight">QuoteMaster <span className="text-white">Pro</span></h1>
            <p className="text-blue-200 mt-2">Professional Quotation Builder</p>
        </div>

        <button 
          onClick={() => onNavigate('signup')}
          className="bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <UserIcon size={20} />
          New User Sign Up
        </button>

        <button 
          onClick={() => onNavigate('login')}
          className="bg-blue-800 hover:bg-blue-700 text-white font-bold py-4 rounded-xl border border-blue-600 shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <LogIn size={20} />
          Existing User Login
        </button>

        <div className="mt-8 flex justify-end">
            <button 
                onClick={() => onNavigate('admin')}
                className="text-xs text-blue-400 hover:text-white flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity"
            >
                <Lock size={12} /> Admin
            </button>
        </div>
      </div>
    </div>
  );
};

export const SignupForm: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [formData, setFormData] = useState({ mobile: '', name: '', accountType: 'Customer' as AccountType });
  const [msg, setMsg] = useState({ text: '', isError: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mobile || !formData.name) {
        setMsg({ text: 'All fields required', isError: true });
        return;
    }
    
    setIsSubmitting(true);
    const result = registerUser(formData);
    
    // Auto-send to Google Sheet if configured
    if (result.success) {
        const config = getAppConfig();
        if (config.googleScriptUrl) {
            await sendDataToScript(config.googleScriptUrl, {
                type: 'signup',
                ...formData
            });
        }
    }

    setIsSubmitting(false);
    setMsg({ text: result.message, isError: !result.success });
    if (result.success) {
        setTimeout(onBack, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-950">
      <div className="w-full max-w-md bg-blue-900/50 p-6 rounded-2xl border border-blue-700 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm text-blue-200 mb-1">Full Name</label>
                <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-blue-950 border border-blue-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                    placeholder="Enter your name"
                />
            </div>
            <div>
                <label className="block text-sm text-blue-200 mb-1">Mobile Number</label>
                <input 
                    type="tel" 
                    value={formData.mobile}
                    onChange={e => setFormData({...formData, mobile: e.target.value})}
                    className="w-full bg-blue-950 border border-blue-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                    placeholder="Enter mobile number"
                />
            </div>
            <div>
                <label className="block text-sm text-blue-200 mb-1">Account Type</label>
                <select 
                    value={formData.accountType}
                    onChange={e => setFormData({...formData, accountType: e.target.value as AccountType})}
                    className="w-full bg-blue-950 border border-blue-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none appearance-none"
                >
                    <option value="Customer">Customer</option>
                    <option value="Retailer">Retailer</option>
                </select>
            </div>
            
            {msg.text && (
                <div className={`text-sm p-3 rounded ${msg.isError ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'}`}>
                    {msg.text}
                </div>
            )}

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-yellow-500 text-blue-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50"
            >
                {isSubmitting ? 'Submitting...' : 'Sign Up'}
            </button>
            <button type="button" onClick={onBack} className="w-full text-blue-300 py-2 text-sm hover:text-white">
                Back to Home
            </button>
        </form>
      </div>
    </div>
  );
};

export const LoginForm: React.FC<AuthProps & { onBack: () => void }> = ({ onLoginSuccess, onBack }) => {
  const [mobile, setMobile] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginUser(mobile);
    if (result.success && result.user) {
        onLoginSuccess(result.user);
    } else {
        setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-blue-950">
      <div className="w-full max-w-md bg-blue-900/50 p-6 rounded-2xl border border-blue-700 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6">User Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm text-blue-200 mb-1">Mobile Number</label>
                <input 
                    type="tel" 
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    className="w-full bg-blue-950 border border-blue-700 rounded-lg p-3 text-white focus:border-yellow-500 outline-none"
                    placeholder="Enter registered mobile"
                />
            </div>
            
            {error && (
                <div className="text-sm p-3 rounded bg-red-900/50 text-red-200 border border-red-700">
                    {error}
                </div>
            )}

            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                Login <ChevronRight size={16} />
            </button>
            <button type="button" onClick={onBack} className="w-full text-blue-300 py-2 text-sm hover:text-white">
                Back to Home
            </button>
        </form>
      </div>
    </div>
  );
};

export const AdminLogin: React.FC<AuthProps & { onBack: () => void }> = ({ onLoginSuccess, onBack }) => {
    const [creds, setCreds] = useState({ id: '', pass: '' });
    const [error, setError] = useState('');
  
    const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if (adminLogin(creds.id, creds.pass)) {
          // Manually construct admin user object since authService just stores it
          onLoginSuccess({ 
              mobile: 'admin', 
              name: 'Administrator', 
              accountType: 'Admin', 
              status: 'Approved', 
              signupDate: '' 
          });
      } else {
          setError('Invalid credentials');
      }
    };
  
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-black">
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800">
          <div className="flex justify-center mb-6">
              <div className="p-3 bg-red-900/20 rounded-full">
                  <ShieldCheck size={32} className="text-red-500" />
              </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
              <div>
                  <label className="block text-sm text-gray-400 mb-1">Admin ID</label>
                  <input 
                      type="text" 
                      value={creds.id}
                      onChange={e => setCreds({...creds, id: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                  />
              </div>
              <div>
                  <label className="block text-sm text-gray-400 mb-1">Password</label>
                  <input 
                      type="password" 
                      value={creds.pass}
                      onChange={e => setCreds({...creds, pass: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 outline-none"
                  />
              </div>
              
              {error && (
                  <div className="text-sm p-3 rounded bg-red-900/50 text-red-200 border border-red-700">
                      {error}
                  </div>
              )}
  
              <button type="submit" className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-500 transition-colors">
                  Access Dashboard
              </button>
              <button type="button" onClick={onBack} className="w-full text-gray-500 py-2 text-sm hover:text-white">
                  Back to Home
              </button>
          </form>
        </div>
      </div>
    );
  };
