import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      createCompany: (company: any) => Promise<number>
      getCompanies: (options?: any) => Promise<any[]>
      editCompany: (companyId, company) => Promise<any[]>
      deleteCompany: (companyId: number) => Promise<number>
      createInvoice: (invoice: any) => Promise<number>
      updateInvoiceData: (invoiceId, invoice) => Promise<any>
      getInvoices: (options) => Promise<any[]>
      getInvoiceDetails: (id: number) => Promise<any>
      updateInvoicePaidStatus: (id: number, isPaid: boolean) => Promise<any>
      deleteInvoice: (id: number) => Promise<any>
      downloadPdf: (fileName: string) => Promise<string>
      getGstCaptcha: () => Promise<object>
      fetchGstDetails: (
        gst_number: string,
        captcha: string,
        captcha_cookie: string
      ) => Promise<object>
      // Inventory Management
      createInventoryItem: (item: {
        name: string
        description?: string
        hsn_code: string
        rate: number
        tax_rate: number
      }) => Promise<number>
      getInventory: (filters?: {
        name?: string
        hsn_code?: string
        minRate?: number
        maxRate?: number
        tax_rate?: number
        sortBy?: string
        sortOrder?: 'asc' | 'desc'
        page?: number
        limit?: number
      }) => Promise<any[]>
      getInventoryItem: (id: number) => Promise<any>
      updateInventoryItem: (
        id: number,
        item: {
          name?: string
          description?: string
          hsn_code?: string
          rate?: number
          tax_rate?: number
        }
      ) => Promise<any>
      deleteInventoryItem: (id: number) => Promise<any>
    }
  }
}
