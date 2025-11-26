import React, { useState, useEffect } from 'react';
import { User, InventoryItem, CartItem } from './types';
import { getCurrentUser, getAppConfig } from './services/authService';
import { fetchSheetData } from './services/googleSheetService';
import { LandingPage, LoginForm, SignupForm, AdminLogin } from './components/AuthScreens';
import { AdminDashboard } from './components/AdminDashboard';
import { InventoryView } from './components/InventoryView';
import { QuotationView } from './components/QuotationView';
import { BottomNav } from './components/BottomNav';
import { WATERMARK_TEXT } from './constants';

type AppView = 'landing' | 'login' | 'signup' | 'admin' | 'app';
type Tab = 'inventory' | 'quotation';

function App() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>('inventory');
  
  // Data
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setView('app');
    }
  }, []);

  // Fetch inventory when entering app view
  useEffect(() => {
    if (view === 'app' || (user && user.accountType === 'Admin' && view === 'admin')) {
        loadInventory();
    }
  }, [view, user]);

  const loadInventory = async () => {
    const config = getAppConfig();
    if (!config.sheetUrl) {
        // Only warn if not admin (admin can set it)
        if (user?.accountType !== 'Admin') {
            setLoadingError("Inventory not configured by parent.");
        }
        return;
    }

    setIsLoading(true);
    setLoadingError(null);
    try {
        const items = await fetchSheetData(config.sheetUrl);
        setInventory(items);
    } catch (err) {
        setLoadingError("Failed to load inventory. Please contact admin.");
    } finally {
        setIsLoading(false);
    }
  };

  // Cart Logic
  const addToQuote = (item: InventoryItem) => {
    setCart(prev => {
        const exists = prev.find(i => i.id === item.id);
        if (exists) {
            alert('Item already in quotation. Check Quotation tab.');
            return prev;
        }
        return [...prev, { ...item, quantity: 1 }];
    });
    // Optional: Visual feedback or auto-switch tab
  };

  const updateCartQty = (id: string | number, qty: number) => {
    if (qty <= 0) {
        removeFromCart(id);
        return;
    }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id: string | number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // --- Render Logic ---

  if (view === 'landing') {
    return <LandingPage onNavigate={(page) => setView(page as AppView)} />;
  }

  if (view === 'signup') {
    return <SignupForm onBack={() => setView('landing')} />;
  }

  if (view === 'login') {
    return (
        <LoginForm 
            onBack={() => setView('landing')} 
            onLoginSuccess={(u) => { setUser(u); setView('app'); }} 
        />
    );
  }

  if (view === 'admin') {
      if (user?.accountType === 'Admin') {
          return <AdminDashboard onLogout={() => { setUser(null); setView('landing'); }} />;
      }
      return (
          <AdminLogin 
            onBack={() => setView('landing')}
            onLoginSuccess={(u) => { setUser(u); setView('admin'); }}
          />
      );
  }

  // --- Main App View ---
  return (
    <div className="min-h-screen bg-[#172554] text-white">
      {/* Header */}
      <header className="bg-[#0f172a] border-b border-blue-900 p-4 sticky top-0 z-40 flex justify-between items-center shadow-lg">
        <div>
            <h1 className="text-xl font-bold text-yellow-400">QuoteMaster Pro</h1>
            <p className="text-xs text-blue-400">Welcome, {user?.name}</p>
        </div>
        <div className="flex gap-3">
            {user?.accountType === 'Admin' && (
                <button 
                    onClick={() => setView('admin')}
                    className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded border border-red-700"
                >
                    Admin Dashboard
                </button>
            )}
            <button 
                onClick={() => { setUser(null); setView('landing'); }}
                className="text-xs text-blue-400 hover:text-white"
            >
                Logout
            </button>
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-md mx-auto min-h-screen relative">
        {loadingError && (
             <div className="m-4 p-4 bg-red-900/50 border border-red-700 text-red-200 rounded text-center text-sm">
                 {loadingError}
             </div>
        )}

        {tab === 'inventory' ? (
            <InventoryView 
                items={inventory} 
                isLoading={isLoading} 
                onAddToQuote={addToQuote} 
            />
        ) : (
            <QuotationView 
                cart={cart}
                user={user}
                onUpdateQty={updateCartQty}
                onRemove={removeFromCart}
            />
        )}

        {/* Watermark */}
        <div className="fixed bottom-16 left-0 right-0 text-center pointer-events-none z-0">
            <span className="text-[10px] text-white/10 uppercase tracking-widest">{WATERMARK_TEXT}</span>
        </div>
      </main>

      {/* Navigation */}
      <BottomNav 
        activeTab={tab} 
        onTabChange={setTab} 
        cartCount={cart.length} 
      />
    </div>
  );
}

export default App;