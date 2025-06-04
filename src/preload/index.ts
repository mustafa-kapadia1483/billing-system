import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  createCompany: (company) => ipcRenderer.invoke('create-company', company),
  getCompanies: (options) => ipcRenderer.invoke('get-companies', options),
  editCompany: (id: number, company) => ipcRenderer.invoke('edit-company', id, company),
  deleteCompany: (id: number) => ipcRenderer.invoke('delete-company', id),
  createInvoice: (invoice) => ipcRenderer.invoke('create-invoice', invoice),
  getInvoices: (options) => ipcRenderer.invoke('get-invoices', options),
  getInvoiceDetails: (id: number) => ipcRenderer.invoke('get-invoice-details', id),
  updateInvoiceData: (invoiceId: number, invoice: any) =>
    ipcRenderer.invoke('update-invoice-data', invoiceId, invoice),
  updateInvoicePaidStatus: (id: number, isPaid: boolean) =>
    ipcRenderer.invoke('update-invoice-paid-status', id, isPaid),
  deleteInvoice: (id: number) => ipcRenderer.invoke('delete-invoice', id),
  downloadPdf: (fileName: string) => ipcRenderer.invoke('download-pdf', fileName),
  getGstCaptcha: () => ipcRenderer.invoke('get-gst-capctha'),
  fetchGstDetails: (gst_number: string, captcha: string, captcha_cookie: string) =>
    ipcRenderer.invoke('fetch-gst-details', gst_number, captcha, captcha_cookie),
  // Inventory Management
  createInventoryItem: (item) => ipcRenderer.invoke('create-inventory-item', item),
  getInventory: (options) => ipcRenderer.invoke('get-inventory', options),
  getInventoryItem: (id: number) => ipcRenderer.invoke('get-inventory-item', id),
  updateInventoryItem: (id: number, item) => ipcRenderer.invoke('update-inventory-item', id, item),
  deleteInventoryItem: (id: number) => ipcRenderer.invoke('delete-inventory-item', id)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
