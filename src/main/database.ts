import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

// Type declarations for database tables
const dbPath = join(app.getPath('userData'), 'invoices.db')
const db = new Database(dbPath) as Database.Database

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    gstin TEXT NOT NULL,
    address TEXT NOT NULL,
    postal_code TEXT,
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
    ship_to_name TEXT NULL,
    ship_to_address TEXT NULL,
    ship_to_city TEXT NULL,
    ship_to_postal_code TEXT NULL,
    ship_to_state TEXT NULL,
    is_paid BOOLEAN NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    hsn_code TEXT,
    quantity INTEGER NOT NULL,
    per TEXT DEFAULT 'PCS',
    rate DECIMAL(10,2) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    tax_rate DECIMAL(10,2) DEFAULT 18.0,
    cgst_amount DECIMAL(10,2) DEFAULT 0,
    sgst_amount DECIMAL(10,2) DEFAULT 0,
    igst_amount DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    hsn_code TEXT,
    rate DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(10,2) DEFAULT 18.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`)

export { db }
