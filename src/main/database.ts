import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

// Type declarations for database tables
const dbPath = join(app.getPath('userData'), 'invoices.db')
const db = new Database(dbPath)

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gstin TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    date DATE NOT NULL,
    company_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    cgst_amount DECIMAL(10,2) NULL,
    sgst_amount DECIMAL(10,2) NULL,
    igst_amount DECIMAL(10,2) NULL,
    tax_rate DECIMAL(10,0) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    hsn_code TEXT,
    quantity INTEGER NOT NULL,
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );
`)

export { db }
