
import React, { useState, useEffect } from 'react';
import { User, AppConfig } from '../types';
import { getUsers, updateUserStatus, getAppConfig, saveAppConfig, logout } from '../services/authService';
import { Check, X, LogOut, Save, FileSpreadsheet, ExternalLink, Download, CloudLightning } from 'lucide-react';

export const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<AppConfig>({ sheetUrl: '', usersSheetUrl: '', quotationsUrl: '', googleScriptUrl: '', lastUpdated: '' });
  
  // Local state for inputs
  const [invUrl, setInvUrl] = useState('');
  const [usersUrl, setUsersUrl] = useState('');
  const [quotesUrl, setQuotesUrl] = useState('');
  const [scriptUrl, setScriptUrl] = useState('');
  
  const [msg, setMsg] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setUsers(getUsers());
    const c = getAppConfig();
    setConfig(c);
    setInvUrl(c.sheetUrl || '');
    setUsersUrl(c.usersSheetUrl || '');
    setQuotesUrl(c.quotationsUrl || '');
    setScriptUrl(c.googleScriptUrl || '');
  };

  const handleApproval = (mobile: string, status: 'Approved' | 'Rejected') => {
    updateUserStatus(mobile, status);
    refreshData();
  };

  const handleSaveConfig = () => {
    saveAppConfig({ 
        sheetUrl: invUrl,
        usersSheetUrl: usersUrl,
        quotationsUrl: quotesUrl,
        googleScriptUrl: scriptUrl,
        lastUpdated: new Date().toISOString() 
    });
    refreshData();
    setMsg('Configuration Saved!');
    setTimeout(() => setMsg(''), 3000);
  };

  const exportUsersCSV = () => {
      const headers = ["Name", "Mobile", "Type", "Status", "Signup Date"];
      const rows = users.map(u => [u.name, u.mobile, u.accountType, u.status, u.signupDate]);
      const csvContent = "data:text/csv;charset=utf-8," 
          + [headers, ...rows].map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "users_list.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const pendingUsers = users.filter(u => u.status === 'Pending');

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-20">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <h1 className="text-xl font-bold text-red-500">Admin Dashboard</h1>
        <button onClick={() => { logout(); onLogout(); }} className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            <LogOut size={18} />
        </button>
      </div>

      {/* Configuration Section */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 mb-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <FileSpreadsheet className="text-yellow-500" /> 
            Data Connections
        </h2>

        {/* Inventory Source */}
        <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">Inventory CSV Source (Public)</label>
            <input 
                type="text" 
                value={invUrl}
                onChange={e => setInvUrl(e.target.value)}
                className="w-full bg-black border border-gray-700 p-2 rounded text-sm focus:border-yellow-500 outline-none text-blue-300"
                placeholder="https://docs.google.com/spreadsheets/d/.../export"
            />
        </div>
        
        {/* Apps Script URL */}
        <div className="border-t border-gray-800 pt-3">
             <label className="text-xs text-yellow-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                 <CloudLightning size={12} /> Google Apps Script Web App URL
             </label>
             <p className="text-[10px] text-gray-400 mb-1">Required for automatic Signup & PDF saving.</p>
             <input 
                type="text" 
                value={scriptUrl}
                onChange={e => setScriptUrl(e.target.value)}
                className="w-full bg-black border border-gray-700 p-2 rounded text-sm focus:border-yellow-500 outline-none text-green-300"
                placeholder="https://script.google.com/macros/s/..."
            />
        </div>

        {/* Users Sheet */}
        <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block flex justify-between">
                <span>Users Sheet Link (View Only)</span>
                {config.usersSheetUrl && (
                    <a href={config.usersSheetUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white flex items-center gap-1">
                        Open <ExternalLink size={10} />
                    </a>
                )}
            </label>
            <input 
                type="text" 
                value={usersUrl}
                onChange={e => setUsersUrl(e.target.value)}
                className="w-full bg-black border border-gray-700 p-2 rounded text-sm focus:border-yellow-500 outline-none text-blue-300"
                placeholder="Paste link to your Users Google Sheet"
            />
        </div>

        {/* Quotations Folder */}
        <div>
            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block flex justify-between">
                <span>Quotations Folder Link (View Only)</span>
                {config.quotationsUrl && (
                    <a href={config.quotationsUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white flex items-center gap-1">
                        Open <ExternalLink size={10} />
                    </a>
                )}
            </label>
            <input 
                type="text" 
                value={quotesUrl}
                onChange={e => setQuotesUrl(e.target.value)}
                className="w-full bg-black border border-gray-700 p-2 rounded text-sm focus:border-yellow-500 outline-none text-blue-300"
                placeholder="Paste link to Google Drive Folder for Quotes"
            />
        </div>

        <button 
            onClick={handleSaveConfig}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded font-bold flex items-center justify-center gap-2"
        >
            <Save size={16} /> Save Connections
        </button>
        {msg && <p className="text-xs text-yellow-500 text-center">{msg}</p>}
      </div>

      {/* Pending Approvals */}
      <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <div className="bg-blue-600 text-xs w-5 h-5 flex items-center justify-center rounded-full">{pendingUsers.length}</div>
                Pending Users
            </h2>
            <button 
                onClick={exportUsersCSV}
                className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded border border-gray-600 flex items-center gap-1"
            >
                <Download size={12} /> Export CSV
            </button>
        </div>
        
        {pendingUsers.length === 0 ? (
            <p className="text-gray-500 text-sm italic">No pending signups.</p>
        ) : (
            <div className="space-y-3">
                {pendingUsers.map(user => (
                    <div key={user.mobile} className="bg-black p-3 rounded border border-gray-800 flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="font-bold">{user.name}</span>
                            <span className="text-xs text-blue-400 border border-blue-900 px-1 rounded bg-blue-900/20">{user.accountType}</span>
                        </div>
                        <div className="text-xs text-gray-400">{user.mobile}</div>
                        <div className="text-xs text-gray-500">{new Date(user.signupDate).toLocaleDateString()}</div>
                        
                        <div className="flex gap-2 mt-2">
                            <button 
                                onClick={() => handleApproval(user.mobile, 'Approved')}
                                className="flex-1 bg-green-900/30 text-green-400 border border-green-800 py-1.5 rounded hover:bg-green-900/50 flex items-center justify-center gap-1"
                            >
                                <Check size={14} /> Approve
                            </button>
                            <button 
                                onClick={() => handleApproval(user.mobile, 'Rejected')}
                                className="flex-1 bg-red-900/30 text-red-400 border border-red-800 py-1.5 rounded hover:bg-red-900/50 flex items-center justify-center gap-1"
                            >
                                <X size={14} /> Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
