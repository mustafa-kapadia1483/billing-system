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

  getInvoices: (
    options: {
      companyId?: number
      isPaid?: boolean
      fromDate?: string
      toDate?: string
      minAmount?: number
      maxAmount?: number
      invoiceNumber?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      limit?: number
      offset?: number
    } = {}
  ) => {
    let query = `
      SELECT i.*, c.name as company_name, c.gstin
      FROM invoices i
      JOIN companies c ON i.company_id = c.id
      WHERE 1=1
    `
    const params: any[] = []

    // Apply filters if provided
    if (options.companyId !== undefined) {
      query += ' AND i.company_id = ?'
      params.push(options.companyId)
    }

    if (options.isPaid !== undefined) {
      query += ' AND i.is_paid = ?'
      params.push(options.isPaid ? 1 : 0)
    }

    if (options.fromDate) {
      query += ' AND i.date >= ?'
      params.push(options.fromDate)
    }

    if (options.toDate) {
      query += ' AND i.date <= ?'
      params.push(options.toDate)
    }

    if (options.minAmount !== undefined) {
      query += ' AND i.total_amount >= ?'
      params.push(options.minAmount)
    }

    if (options.maxAmount !== undefined) {
      query += ' AND i.total_amount <= ?'
      params.push(options.maxAmount)
    }

    if (options.invoiceNumber) {
      query += ' AND i.invoice_number LIKE ?'
      params.push(`%${options.invoiceNumber}%`)
    }

    // Sorting
    const validSortColumns = ['date', 'invoice_number', 'total_amount', 'company_name', 'is_paid']
    const sortBy = validSortColumns.includes(options.sortBy || '') ? options.sortBy : 'date'

    const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Handle special case for company_name which is from the joined table
    if (sortBy === 'company_name') {
      query += ` ORDER BY c.name ${sortOrder}`
    } else {
      query += ` ORDER BY i.${sortBy} ${sortOrder}`
    }

    // Pagination
    if (options.limit !== undefined) {
      query += ' LIMIT ?'
      params.push(options.limit)

      if (options.offset !== undefined) {
        query += ' OFFSET ?'
        params.push(options.offset)
      }
    }

    const stmt = db.prepare(query)
    return stmt.all(...params)
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
  },
  editCompany: (companyId: number, company: any) => {
    const stmt = db.prepare(`
      UPDATE companies 
      SET name = ?, gstin = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?
      WHERE id = ?
    `)
    const result = stmt.run(
      company.name,
      company.gstin,
      company.address_line1,
      company.address_line2,
      company.city,
      company.state,
      companyId
    )
    return result.changes > 0
  },

  updateInvoicePaidStatus: (invoiceId: number, isPaid: boolean) => {
    const stmt = db.prepare('UPDATE invoices SET is_paid = ? WHERE id = ?')
    const result = stmt.run(isPaid ? 1 : 0, invoiceId)
    return result.changes > 0
  }
}
