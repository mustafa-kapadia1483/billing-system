import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      createCompany: (company: any) => Promise<number>
      getCompanies: () => Promise<any[]>
      editCompany: (companyId, company) => Promise<any[]>
      deleteCompany: (companyId: number) => Promise<number>
      createInvoice: (invoice: any) => Promise<number>
      getInvoices: () => Promise<any[]>
      getInvoiceDetails: (id: number) => Promise<any>
      updateInvoicePaidStatus: (id: number, isPaid: boolean) => Promise<any>
      deleteInvoice: (id: number) => Promise<any>
      downloadPdf: (fileName: string) => Promise<string>
    }
  }
}
