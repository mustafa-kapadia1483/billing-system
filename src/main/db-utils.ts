import { db } from './database'

export const dbUtils = {
  createCompany: (company: any) => {
    const stmt = db.prepare(
      'INSERT INTO companies (name, gstin, address_line1, address_line2, city, state) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const result = stmt.run(
      company.name,
      company.gstin,
      company.address_line1,
      company.address_line2,
      company.city,
      company.state
    )
    return result.lastInsertRowid
  },

  deleteCompany: (companyId: number) => {
    return db.transaction(() => {
      // Check if company has any invoices
      const hasInvoices = db
        .prepare('SELECT 1 FROM invoices WHERE company_id = ? LIMIT 1')
        .get(companyId)

      if (hasInvoices) {
        throw new Error('Cannot delete company with existing invoices')
      }

      // Delete the company
      const deleteCompanyStmt = db.prepare('DELETE FROM companies WHERE id = ?')
      const result = deleteCompanyStmt.run(companyId)

      return result.changes > 0
    })()
  },

  getCompanies: () => {
    const stmt = db.prepare('SELECT * FROM companies ORDER BY name')
    return stmt.all()
  },

  createInvoice: (invoice: any) => {
    const { companyId, items, ...invoiceData } = invoice

    const result = db.transaction(() => {
      const invoiceStmt = db.prepare(`
        INSERT INTO invoices (
          invoice_number, date, company_id, total_amount,
          cgst_amount, sgst_amount, igst_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)

      const invoiceResult = invoiceStmt.run(
        invoiceData.invoiceNumber,
        invoiceData.date,
        companyId,
        invoiceData.totalAmount,
        invoiceData.cgstAmount,
        invoiceData.sgstAmount,
        invoiceData.igstAmount
      )

      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, description, hsn_code, quantity, rate, amount,
          tax_rate, cgst_amount, sgst_amount, igst_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const item of items) {
        itemStmt.run(
          invoiceResult.lastInsertRowid,
          item.description,
          item.hsn_code,
          item.quantity,
          item.rate,
          item.amount,
          item.tax_rate,
          item.cgst_amount,
          item.sgst_amount,
          item.igst_amount
        )
      }

      return invoiceResult.lastInsertRowid
    })()

    return result
  },

  getInvoices: () => {
    const stmt = db.prepare(`
      SELECT i.*, c.name as company_name, c.gstin
      FROM invoices i
      JOIN companies c ON i.company_id = c.id
      ORDER BY i.date DESC
    `)
    return stmt.all()
  },

  getInvoiceDetails: (invoiceId: number) => {
    const invoice = db
      .prepare(
        `
      SELECT i.*, c.* 
      FROM invoices i
      JOIN companies c ON i.company_id = c.id
      WHERE i.id = ?
    `
      )
      .get(invoiceId)

    const items = db
      .prepare(
        `
      SELECT * FROM invoice_items WHERE invoice_id = ?
    `
      )
      .all(invoiceId)

    return { invoice, items }
  },

  deleteInvoice: (invoiceId: number) => {
    return db.transaction(() => {
      // Delete invoice items first due to foreign key constraint
      const deleteItemsStmt = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?')
      deleteItemsStmt.run(invoiceId)

      // Then delete the invoice
      const deleteInvoiceStmt = db.prepare('DELETE FROM invoices WHERE id = ?')
      const result = deleteInvoiceStmt.run(invoiceId)

      return result.changes > 0
    })()
  }
}
