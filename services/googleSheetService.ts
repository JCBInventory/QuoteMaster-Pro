
import * as XLSX from 'xlsx';
import { InventoryItem } from '../types';

export const extractSheetId = (url: string): string | null => {
  const matches = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return matches ? matches[1] : null;
};

export const fetchSheetData = async (url: string): Promise<InventoryItem[]> => {
  const sheetId = extractSheetId(url);
  if (!sheetId) {
    throw new Error("Invalid Google Sheet URL");
  }

  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch sheet. Ensure it is public (Anyone with link can view).");
    }
    const csvText = await response.text();
    const workbook = XLSX.read(csvText, { type: 'string' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

    // Map columns loosely to our internal structure
    return jsonData.map((row, index) => {
      // Helper to find key case-insensitively
      const findVal = (keys: string[]) => {
        for (const k of keys) {
            const foundKey = Object.keys(row).find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
            if (foundKey) return row[foundKey];
        }
        return '';
      };

      const mrp = parseFloat(findVal(['mrp', 'price', 'amount']));
      const saleRate = parseFloat(findVal(['sale rate', 'rate', 'salerate']));

      return {
        id: `item-${index}`,
        itemNo: String(findVal(['item no', 'itemno', 'code', 'sku']) || `UNK-${index}`),
        description: String(findVal(['item description', 'description', 'desc', 'name']) || 'No Description'),
        group: String(findVal(['item group', 'group', 'category']) || '-'),
        model: String(findVal(['model']) || '-'),
        bhlHln: String(findVal(['bhl/hln flag', 'bhl', 'hln', 'flag']) || '-'),
        hsn: String(findVal(['hsn tax %', 'hsn', 'tax']) || '0'),
        saleRate: isNaN(saleRate) ? 0 : saleRate,
        mrp: isNaN(mrp) ? 0 : mrp,
      };
    }).filter((item, index) => item.itemNo !== 'UNK-' + index && item.description !== 'No Description');

  } catch (error) {
    console.error("Sheet Fetch Error", error);
    throw error;
  }
};

export const sendDataToScript = async (scriptUrl: string, payload: any) => {
    if (!scriptUrl) return;

    // We use mode: 'no-cors' because Google Apps Script Web Apps usually don't send CORS headers
    // unless you wrap the output in JSONP, which fetch doesn't support directly.
    // With 'no-cors', the request IS sent, but we get an opaque response (we can't read the result).
    // This is "fire and forget" for the frontend.
    
    try {
        await fetch(scriptUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain', // Must be text/plain for no-cors
            },
            body: JSON.stringify(payload)
        });
        console.log("Data sent to Google Script");
    } catch (e) {
        console.error("Failed to send data to script", e);
    }
};
