import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      createCompany: (company: any) => Promise<number>
      getCompanies: () => Promise<any[]>
      createInvoice: (invoice: any) => Promise<number>
      getInvoices: () => Promise<any[]>
      getInvoiceDetails: (id: number) => Promise<any>
    }
  }
}
