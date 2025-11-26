import React from 'react';
import { PackageSearch, FileText } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'inventory' | 'quotation';
  onTabChange: (tab: 'inventory' | 'quotation') => void;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, cartCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a] border-t border-blue-900 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        <button 
          onClick={() => onTabChange('inventory')}
          className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'inventory' ? 'text-yellow-400' : 'text-blue-400'}`}
        >
          <PackageSearch size={24} />
          <span className="text-xs font-medium">Inventory</span>
        </button>

        <button 
          onClick={() => onTabChange('quotation')}
          className={`relative flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'quotation' ? 'text-yellow-400' : 'text-blue-400'}`}
        >
          <div className="relative">
            <FileText size={24} />
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-black">
                    {cartCount}
                </span>
            )}
          </div>
          <span className="text-xs font-medium">Quotation</span>
        </button>
      </div>
    </div>
  );
};