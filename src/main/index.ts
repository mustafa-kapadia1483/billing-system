import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { db } from './database'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Database operations
  ipcMain.handle('create-company', async (_, company) => {
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
  })

  ipcMain.handle('get-companies', () => {
    const stmt = db.prepare('SELECT * FROM companies ORDER BY name')
    return stmt.all()
  })

  ipcMain.handle('create-invoice', async (_, invoice) => {
    const { companyId, items, ...invoiceData } = invoice

    const result = db.transaction(() => {
      const invoiceStmt = db.prepare(`
        INSERT INTO invoices (
          invoice_number, date, company_id, total_amount,
          cgst_amount, sgst_amount, igst_amount, tax_rate
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const invoiceResult = invoiceStmt.run(
        invoiceData.invoiceNumber,
        invoiceData.date,
        companyId,
        invoiceData.totalAmount,
        invoiceData.cgstAmount,
        invoiceData.sgstAmount,
        invoiceData.igstAmount,
        invoiceData.tax_rate
      )

      const itemStmt = db.prepare(`
        INSERT INTO invoice_items (
          invoice_id, hsn_code, description, quantity, rate, amount
        ) VALUES (?, ?, ?, ?, ?, ?)
      `)

      for (const item of items) {
        itemStmt.run(
          invoiceResult.lastInsertRowid,
          item.description,
          item.hsn_code,
          item.quantity,
          item.rate,
          item.amount
        )
      }

      return invoiceResult.lastInsertRowid
    })()

    return result
  })

  ipcMain.handle('get-invoices', () => {
    const stmt = db.prepare(`
      SELECT i.*, c.name as company_name, c.gstin
      FROM invoices i
      JOIN companies c ON i.company_id = c.id
      ORDER BY i.date DESC
    `)
    return stmt.all()
  })

  ipcMain.handle('get-invoice-details', (_, invoiceId) => {
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
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
