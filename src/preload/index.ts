import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  createCompany: (company) => ipcRenderer.invoke('create-company', company),
  getCompanies: () => ipcRenderer.invoke('get-companies'),
  editCompany: (id: number, company) => ipcRenderer.invoke('edit-company', id, company),
  deleteCompany: (id: number) => ipcRenderer.invoke('delete-company', id),
  createInvoice: (invoice) => ipcRenderer.invoke('create-invoice', invoice),
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  getInvoiceDetails: (id: number) => ipcRenderer.invoke('get-invoice-details', id),
  updateInvoicePaidStatus: (id: number, isPaid: boolean) =>
    ipcRenderer.invoke('update-invoice-paid-status', id, isPaid),
  deleteInvoice: (id: number) => ipcRenderer.invoke('delete-invoice', id),
  downloadPdf: (fileName: string) => ipcRenderer.invoke('download-pdf', fileName)
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
