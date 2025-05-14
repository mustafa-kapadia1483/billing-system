import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  createCompany: (company) => ipcRenderer.invoke('create-company', company),
  getCompanies: () => ipcRenderer.invoke('get-companies'),
  createInvoice: (invoice) => ipcRenderer.invoke('create-invoice', invoice),
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  getInvoiceDetails: (id) => ipcRenderer.invoke('get-invoice-details', id),
  deleteInvoice: (id) => ipcRenderer.invoke('delete-invoice', id)
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
