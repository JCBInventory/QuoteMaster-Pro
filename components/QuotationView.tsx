
import React, { useState } from 'react';
import { CartItem, User } from '../types';
import { Trash2, FileDown, Percent } from 'lucide-react';
import { QuantitySelector } from './QuantitySelector';
import { generateQuotationPDF } from '../services/pdfService';
import { getAppConfig } from '../services/authService';
import { sendDataToScript } from '../services/googleSheetService';

interface QuotationViewProps {
  cart: CartItem[];
  user: User | null;
  onUpdateQty: (id: string | number, qty: number) => void;
  onRemove: (id: string | number) => void;
}

export const QuotationView: React.FC<QuotationViewProps> = ({ cart, user, onUpdateQty, onRemove }) => {
  const [discountMode, setDiscountMode] = useState<'fixed' | 'percent'>('fixed');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'fail'>('idle');

  const subTotal = cart.reduce((acc, item) => acc + (item.mrp * item.quantity), 0);

  // Calculate derived values based on mode
  let discountAmount = 0;
  let discountPercent = 0;

  if (discountMode === 'fixed') {
    discountAmount = discountValue;
    discountPercent = subTotal > 0 ? (discountValue / subTotal) * 100 : 0;
  } else {
    discountPercent = discountValue;
    discountAmount = (discountValue / 100) * subTotal;
  }

  // Cap discount at subtotal to prevent negative total
  if (discountAmount > subTotal) {
    discountAmount = subTotal;
  }

  const finalTotal = subTotal - discountAmount;

  const handlePercentChange = (val: string) => {
    const num = parseFloat(val);
    setDiscountMode('percent');
    setDiscountValue(isNaN(num) ? 0 : num);
  };

  const handleAmountChange = (val: string) => {
    const num = parseFloat(val);
    setDiscountMode('fixed');
    setDiscountValue(isNaN(num) ? 0 : num);
  };

  const handleDownload = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    setUploadStatus('idle');

    // 1. Generate and Download PDF
    const pdfBase64 = generateQuotationPDF(cart, discountAmount, user?.name || 'Guest');
    
    // 2. Auto-Upload to Drive if script is configured
    const config = getAppConfig();
    if (config.googleScriptUrl && user) {
        try {
            await sendDataToScript(config.googleScriptUrl, {
                type: 'quotation',
                pdf: pdfBase64,
                user: { name: user.name, mobile: user.mobile },
                itemCount: cart.length,
                total: finalTotal,
                fileName: `Quote_${user.name.replace(/\s/g, '_')}_${Date.now()}.pdf`
            });
            setUploadStatus('success');
        } catch (e) {
            setUploadStatus('fail');
        }
    }
    
    setIsProcessing(false);
  };

  if (cart.length === 0) {
      return (
          <div className="h-full flex flex-col items-center justify-center text-blue-300 p-8 pt-20">
              <p className="text-xl font-bold mb-2">Quotation Empty</p>
              <p className="text-sm opacity-60 text-center">Switch to Inventory tab to add items.</p>
          </div>
      );
  }

  return (
    <div className="pb-24 px-4 pt-4">
      <h2 className="text-xl font-bold text-yellow-400 mb-4 border-b border-blue-800 pb-2">Current Quotation</h2>
      
      <div className="space-y-4">
        {cart.map(item => (
            <div key={item.id} className="bg-blue-900/40 p-3 rounded-lg border border-blue-800 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="text-yellow-500 text-xs font-mono">{item.itemNo}</div>
                        <div className="text-white font-medium text-sm leading-tight">{item.description}</div>
                        <div className="text-blue-300 text-xs mt-1">MRP: {item.mrp.toFixed(2)}</div>
                    </div>
                    <button onClick={() => onRemove(item.id)} className="text-red-400 p-1">
                        <Trash2 size={18} />
                    </button>
                </div>
                
                <div className="flex justify-between items-center bg-blue-950/50 p-2 rounded">
                    <QuantitySelector 
                        quantity={item.quantity} 
                        onChange={(q) => onUpdateQty(item.id, q)} 
                        min={1} 
                    />
                    <div className="text-white font-bold font-mono">
                        {(item.mrp * item.quantity).toFixed(2)}
                    </div>
                </div>
            </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-900/80 p-4 rounded-xl border border-blue-700">
        <div className="flex justify-between mb-2 text-sm">
            <span className="text-blue-200">Subtotal</span>
            <span className="font-bold text-white">{subTotal.toFixed(2)}</span>
        </div>
        
        <div className="py-2">
            <label className="text-blue-200 text-xs mb-1 block">Less Discount</label>
            <div className="flex gap-2">
                <div className="relative w-1/3">
                    <input 
                        type="number" 
                        value={discountPercent > 0 ? parseFloat(discountPercent.toFixed(2)) : ''}
                        onChange={e => handlePercentChange(e.target.value)}
                        placeholder="0"
                        className={`w-full bg-blue-950 border ${discountMode === 'percent' ? 'border-yellow-500' : 'border-blue-700'} rounded p-2 pl-8 text-right text-white focus:outline-none focus:border-yellow-500 transition-colors`}
                    />
                    <Percent className="absolute left-2 top-2.5 text-blue-400" size={14} />
                </div>
                <div className="relative w-2/3">
                    <input 
                        type="number" 
                        value={discountAmount > 0 ? parseFloat(discountAmount.toFixed(2)) : ''}
                        onChange={e => handleAmountChange(e.target.value)}
                        placeholder="0.00"
                        className={`w-full bg-blue-950 border ${discountMode === 'fixed' ? 'border-yellow-500' : 'border-blue-700'} rounded p-2 pl-8 text-right text-yellow-400 focus:outline-none focus:border-yellow-500 font-bold transition-colors`}
                    />
                    <span className="absolute left-3 top-2.5 text-blue-400 text-xs font-bold">Amt</span>
                </div>
            </div>
        </div>
        
        <div className="border-t border-blue-700 mt-2 pt-3 flex justify-between items-center text-lg font-bold">
            <span className="text-white">Final Total</span>
            <span className="text-yellow-400">{finalTotal.toFixed(2)}</span>
        </div>

        <button 
            onClick={handleDownload}
            disabled={isProcessing}
            className="w-full mt-6 bg-yellow-500 hover:bg-yellow-400 text-blue-900 font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
        >
            <FileDown size={20} />
            {isProcessing ? 'Saving...' : 'Download PDF'}
        </button>
        {uploadStatus === 'success' && <p className="text-xs text-green-400 text-center mt-2">Saved to Cloud</p>}
      </div>
    </div>
  );
};
