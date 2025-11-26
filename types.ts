
export type AccountType = 'Customer' | 'Retailer' | 'Admin';
export type UserStatus = 'Pending' | 'Approved' | 'Rejected';

export interface User {
  mobile: string;
  name: string;
  accountType: AccountType;
  status: UserStatus;
  signupDate: string;
}

export interface InventoryItem {
  id: string | number;
  itemNo: string;
  description: string;
  group: string;
  model: string;
  bhlHln: string;
  hsn: string;
  saleRate: number;
  mrp: number;
  [key: string]: any;
}

export interface CartItem extends InventoryItem {
  quantity: number;
}

export interface AppConfig {
  sheetUrl: string;       // Inventory CSV
  usersSheetUrl: string;  // Link to Users Google Sheet (for Admin reference)
  quotationsUrl: string;  // Link to Quotations Drive Folder (for Admin reference)
  googleScriptUrl: string; // URL of the deployed Google Apps Script Web App
  lastUpdated: string;
}
