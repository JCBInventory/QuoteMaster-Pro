import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (newQty: number) => void;
  min?: number;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({ quantity, onChange, min = 0 }) => {
  return (
    <div className="flex items-center bg-neutral-800 rounded-lg border border-neutral-700">
      <button 
        onClick={() => onChange(Math.max(min, quantity - 1))}
        className="p-2 text-yellow-500 hover:text-yellow-400 transition-colors"
      >
        <Minus size={16} />
      </button>
      <input 
        type="number"
        value={quantity}
        onChange={(e) => onChange(Math.max(min, parseInt(e.target.value) || 0))}
        className="w-12 bg-transparent text-center text-white font-mono text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button 
        onClick={() => onChange(quantity + 1)}
        className="p-2 text-yellow-500 hover:text-yellow-400 transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
