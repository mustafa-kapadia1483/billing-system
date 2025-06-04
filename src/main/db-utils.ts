import { db } from './database'

export const dbUtils = {
  createCompany: (company: any) => {
    const stmt = db.prepare(
      'INSERT INTO companies (name, gstin, address, postal_code, city, state) VALUES (?, ?, ?, ?, ?, ?)'
    )
    const result = stmt.run(
      company.name,
      company.gstin,
      company.address,
      company.postal_code,
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
          cgst_amount, sgst_amount, igst_amount,
          ship_to_name, ship_to_address, ship_to_city, ship_to_postal_code, ship_to_state
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const invoiceResult = invoiceStmt.run(
        invoiceData.invoiceNumber,
        invoiceData.date,
        companyId,
        invoiceData.totalAmount,
        invoiceData.cgstAmount,
        invoiceData.sgstAmount,
        invoiceData.igstAmount,
        invoiceData.shipToName || null,
        invoiceData.shipToAddress || null,
        invoiceData.shipToCity || null,
        invoiceData.shipToPostalCode || null,
        invoiceData.shipToState || null
      )

      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, description, hsn_code, quantity, per, rate, amount,
          discount, tax_rate, cgst_amount, sgst_amount, igst_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const item of items) {
        itemStmt.run(
          invoiceResult.lastInsertRowid,
          item.description,
          item.hsn_code,
          item.quantity,
          item.per,
          item.rate,
          item.amount,
          item.discount,
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

  updateInvoiceData: (invoiceId: number, invoice: any) => {
    const { companyId, items, ...invoiceData } = invoice

    const result = db.transaction(() => {
      // Update invoice header
      const invoiceStmt = db.prepare(`
        UPDATE invoices SET
          invoice_number = ?,
          date = ?,
          company_id = ?,
          total_amount = ?,
          cgst_amount = ?,
          sgst_amount = ?,
          igst_amount = ?,
          ship_to_name = ?,
          ship_to_address = ?,
          ship_to_city = ?,
          ship_to_postal_code = ?,
          ship_to_state = ?
        WHERE id = ?
      `)

      invoiceStmt.run(
        invoiceData.invoiceNumber,
        invoiceData.date,
        companyId,
        invoiceData.totalAmount,
        invoiceData.cgstAmount,
        invoiceData.sgstAmount,
        invoiceData.igstAmount,
        invoiceData.shipToName || null,
        invoiceData.shipToAddress || null,
        invoiceData.shipToCity || null,
        invoiceData.shipToPostalCode || null,
        invoiceData.shipToState || null,
        invoiceId
      )

      // Delete existing items
      const deleteItemsStmt = db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?')
      deleteItemsStmt.run(invoiceId)

      // Insert updated items
      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, description, hsn_code, quantity, per, rate, amount,
          discount, tax_rate, cgst_amount, sgst_amount, igst_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const item of items) {
        itemStmt.run(
          invoiceId,
          item.description,
          item.hsn_code,
          item.quantity,
          item.per,
          item.rate,
          item.amount,
          item.discount,
          item.tax_rate,
          item.cgst_amount,
          item.sgst_amount,
          item.igst_amount
        )
      }

      return invoiceId
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
      SELECT i.*, c.name as company_name, c.gstin,
             (i.total_amount + COALESCE(i.cgst_amount, 0) + COALESCE(i.sgst_amount, 0) + COALESCE(i.igst_amount, 0)) as grand_total
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
      query +=
        ' AND (i.total_amount + COALESCE(i.cgst_amount, 0) + COALESCE(i.sgst_amount, 0) + COALESCE(i.igst_amount, 0)) >= ?'
      params.push(options.minAmount)
    }

    if (options.maxAmount !== undefined) {
      query +=
        ' AND (i.total_amount + COALESCE(i.cgst_amount, 0) + COALESCE(i.sgst_amount, 0) + COALESCE(i.igst_amount, 0)) <= ?'
      params.push(options.maxAmount)
    }

    if (options.invoiceNumber) {
      query += ' AND i.invoice_number LIKE ?'
      params.push(`%${options.invoiceNumber}%`)
    }

    // Sorting
    const validSortColumns = ['date', 'invoice_number', 'grand_total', 'company_name', 'is_paid']
    const sortBy = validSortColumns.includes(options.sortBy || '') ? options.sortBy : 'date'

    const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC'

    // Handle special cases for sorting
    if (sortBy === 'company_name') {
      query += ` ORDER BY c.name ${sortOrder}`
    } else if (sortBy === 'grand_total') {
      query += ` ORDER BY grand_total ${sortOrder}`
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
      SET name = ?, gstin = ?, address = ?, postal_code = ?, city = ?, state = ?
      WHERE id = ?
    `)
    const result = stmt.run(
      company.name,
      company.gstin,
      company.address,
      company.postal_code,
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
  },

  createInventoryItem: (item: any) => {
    const stmt = db.prepare(`
      INSERT INTO inventory (name, description, hsn_code, rate, tax_rate)
      VALUES (?, ?, ?, ?, ?)
    `)
    const result = stmt.run(item.name, item.description, item.hsn_code, item.rate, item.tax_rate)
    return result.lastInsertRowid
  },

  getInventory: (
    options: {
      name?: string
      hsn_code?: string
      minRate?: number
      maxRate?: number
      tax_rate?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
      limit?: number
      offset?: number
    } = {}
  ) => {
    let query = 'SELECT * FROM inventory WHERE 1=1'
    const params: any[] = []

    if (options.name) {
      query += ' AND name LIKE ?'
      params.push(`%${options.name}%`)
    }

    if (options.hsn_code) {
      query += ' AND hsn_code LIKE ?'
      params.push(`%${options.hsn_code}%`)
    }

    if (options.minRate !== undefined) {
      query += ' AND rate >= ?'
      params.push(options.minRate)
    }

    if (options.maxRate !== undefined) {
      query += ' AND rate <= ?'
      params.push(options.maxRate)
    }

    if (options.tax_rate !== undefined) {
      query += ' AND tax_rate = ?'
      params.push(options.tax_rate)
    }

    // Sorting
    const validSortColumns = ['name', 'rate', 'tax_rate', 'created_at']
    const sortBy = validSortColumns.includes(options.sortBy || '') ? options.sortBy : 'name'
    const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC'
    query += ` ORDER BY ${sortBy} ${sortOrder}`

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

  getInventoryItem: (id: number) => {
    const stmt = db.prepare('SELECT * FROM inventory WHERE id = ?')
    return stmt.get(id)
  },

  updateInventoryItem: (id: number, item: any) => {
    const stmt = db.prepare(`
      UPDATE inventory 
      SET name = ?, description = ?, hsn_code = ?, rate = ?, tax_rate = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    const result = stmt.run(
      item.name,
      item.description,
      item.hsn_code,
      item.rate,
      item.tax_rate,
      id
    )
    return result.changes > 0
  },

  deleteInventoryItem: (id: number) => {
    const stmt = db.prepare('DELETE FROM inventory WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }
}
