import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Company, CompanyFilters, Invoice, InvoiceFilters } from '../shared/types'

const api = {
  createCompany: (company: Company) => ipcRenderer.invoke('create-company', company),
  getCompanies: (options: CompanyFilters) => ipcRenderer.invoke('get-companies', options),
  editCompany: (id: Company['id'], company: Company) =>
    ipcRenderer.invoke('edit-company', id, company),
  deleteCompany: (id: Company['id']) => ipcRenderer.invoke('delete-company', id),
  createInvoice: (invoice: Invoice) => ipcRenderer.invoke('create-invoice', invoice),
  getInvoices: (options: InvoiceFilters) => ipcRenderer.invoke('get-invoices', options),
  getInvoiceDetails: (id: Invoice['id']) => ipcRenderer.invoke('get-invoice-details', id),
  updateInvoiceData: (invoiceId: Invoice['id'], invoice: Invoice) =>
    ipcRenderer.invoke('update-invoice-data', invoiceId, invoice),
  updateInvoicePaidStatus: (id: Invoice['id'], isPaid: Invoice['is_paid']) =>
    ipcRenderer.invoke('update-invoice-paid-status', id, isPaid),
  deleteInvoice: (id: Invoice['id']) => ipcRenderer.invoke('delete-invoice', id),
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
