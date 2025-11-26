import React, { useMemo, useState } from 'react';
import { InventoryItem } from '../types';
import { Search, Plus } from 'lucide-react';
import { ITEMS_PER_PAGE } from '../constants';

interface InventoryViewProps {
  items: InventoryItem[];
  onAddToQuote: (item: InventoryItem) => void;
  isLoading: boolean;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onAddToQuote, isLoading }) => {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filtered = useMemo(() => {
    if (!search) return items;
    const lower = search.toLowerCase();
    // Fuzzy search for description, exact(ish) for Item No
    return items.filter(i => 
      i.itemNo.toLowerCase().includes(lower) || 
      i.description.toLowerCase().includes(lower) ||
      i.model.toLowerCase().includes(lower)
    );
  }, [items, search]);

  const visibleItems = filtered.slice(0, visibleCount);

  if (isLoading) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-blue-300 pt-20">
              <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full mb-4"></div>
              <p>Syncing with Parent Inventory...</p>
          </div>
      );
  }

  return (
    <div className="pb-24">
      {/* Search Bar */}
      <div className="sticky top-0 z-30 bg-[#172554] p-4 shadow-xl">
        <div className="relative">
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-blue-900" />
            <input 
                type="text" 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(ITEMS_PER_PAGE); }}
                placeholder="Search Item No, Description or Model..."
                className="w-full bg-yellow-400 placeholder-blue-900/60 text-blue-900 font-bold rounded-xl py-3 pl-10 pr-4 shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-200"
            />
        </div>
        <div className="text-right mt-1">
            <span className="text-xs text-blue-300">{filtered.length} items found</span>
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-4 mt-2">
        {visibleItems.length === 0 ? (
            <div className="text-center text-blue-400 py-10">
                No items match your search.
            </div>
        ) : (
            visibleItems.map(item => (
                <div key={item.id} className="bg-blue-800/40 border border-blue-700/50 rounded-xl p-4 backdrop-blur-sm shadow-sm hover:border-yellow-500/50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-blue-900 text-yellow-400 text-xs font-mono px-2 py-1 rounded border border-blue-700">
                            {item.itemNo}
                        </span>
                        <span className="text-blue-300 text-xs font-bold">{item.group}</span>
                    </div>
                    
                    <h3 className="text-white font-bold text-lg leading-tight mb-2">{item.description}</h3>
                    
                    <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-sm text-blue-200 mb-3">
                        <div className="flex justify-between">
                            <span className="opacity-60">Model:</span>
                            <span>{item.model}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="opacity-60">MRP:</span>
                            <span className="text-yellow-400 font-bold">{item.mrp.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="opacity-60">BHL/HLN:</span>
                            <span>{item.bhlHln}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="opacity-60">HSN:</span>
                            <span>{item.hsn}%</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => onAddToQuote(item)}
                        className="w-full bg-white hover:bg-gray-100 text-blue-900 font-bold py-2 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                        <Plus size={18} className="text-yellow-600" />
                        Add to Quotation
                    </button>
                </div>
            ))
        )}

        {filtered.length > visibleCount && (
            <button 
                onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                className="w-full py-4 text-blue-300 text-sm font-bold"
            >
                Load More Results...
            </button>
        )}
      </div>
    </div>
  );
};