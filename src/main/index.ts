import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import iconPng from '../../resources/icon.png?asset'
import iconIco from '../../resources/icon.ico?asset'
import { dbUtils } from './db-utils'
import { getGstCaptcha, fetchGstDetails } from './gst-fetch'
import fs from 'fs'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: process.platform === 'linux' ? iconPng : iconIco,
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
    return dbUtils.createCompany(company)
  })

  ipcMain.handle('get-companies', () => {
    return dbUtils.getCompanies()
  })

  ipcMain.handle('edit-company', (_, companyId, company) => {
    return dbUtils.editCompany(companyId, company)
  })

  ipcMain.handle('delete-company', (_, companyId) => {
    return dbUtils.deleteCompany(companyId)
  })

  ipcMain.handle('create-invoice', async (_, invoice) => {
    return dbUtils.createInvoice(invoice)
  })

  ipcMain.handle('update-invoice-data', async (_, invoiceId, invoice) => {
    return dbUtils.updateInvoiceData(invoiceId, invoice)
  })

  ipcMain.handle('get-invoices', (_, options) => {
    return dbUtils.getInvoices(options)
  })

  ipcMain.handle('get-invoice-details', (_, invoiceId) => {
    return dbUtils.getInvoiceDetails(invoiceId)
  })

  ipcMain.handle('update-invoice-paid-status', (_, invoiceId, isPaidStatus: boolean) => {
    return dbUtils.updateInvoicePaidStatus(invoiceId, isPaidStatus)
  })

  ipcMain.handle('delete-invoice', (_, invoiceId) => {
    return dbUtils.deleteInvoice(invoiceId)
  })

  ipcMain.handle('get-gst-capctha', () => {
    return getGstCaptcha()
  })

  ipcMain.handle(
    'fetch-gst-details',
    (_, gst_number: string, captcha: string, captcha_cookie: string) => {
      return fetchGstDetails(gst_number, captcha, captcha_cookie)
    }
  )

  ipcMain.handle('download-pdf', async (_, fileName) => {
    const downloadsPath = app.getPath('downloads')
    const pdfPath = join(downloadsPath, fileName)

    try {
      const data = await BrowserWindow.getAllWindows()[0].webContents.printToPDF({})
      await fs.promises.writeFile(pdfPath, data)
      console.log(`Wrote PDF successfully to ${pdfPath}`)
      return pdfPath
    } catch (error) {
      console.log(`Failed to write PDF to ${pdfPath}: `, error)
      throw error
    }
  })

  // Inventory Management
  ipcMain.handle('create-inventory-item', async (_, item) => {
    return dbUtils.createInventoryItem(item)
  })

  ipcMain.handle('get-inventory', async (_, filters) => {
    return dbUtils.getInventory(filters)
  })

  ipcMain.handle('get-inventory-item', async (_, id) => {
    return dbUtils.getInventoryItem(id)
  })

  ipcMain.handle('update-inventory-item', async (_, id, item) => {
    return dbUtils.updateInventoryItem(id, item)
  })

  ipcMain.handle('delete-inventory-item', async (_, id) => {
    return dbUtils.deleteInventoryItem(id)
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
