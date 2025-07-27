import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  Company,
  CompanyFilters,
  GstCaptchaResponse,
  GstDetailsResponse,
  Invoice,
  InvoiceFilters
} from 'src/shared/types'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      createCompany: (company: Company) => Promise<number>
      getCompanies: (options?: CompanyFilters) => Promise<any[]>
      editCompany: (companyId: Company['id'], company: Company) => Promise<any[]>
      deleteCompany: (companyId: Company['id']) => Promise<number>
      createInvoice: (invoice: Invoice) => Promise<number>
      updateInvoiceData: (invoiceId: Invoice['id'], invoice: Invoice) => Promise<any>
      getInvoices: (options: InvoiceFilters) => Promise<any[]>
      getInvoiceDetails: (id: Invoice['id']) => Promise<any>
      updateInvoicePaidStatus: (id: Invoice['id'], isPaid: Invoice['is_paid']) => Promise<any>
      deleteInvoice: (id: Invoice['id']) => Promise<any>
      downloadPdf: (fileName: string) => Promise<string>
      getGstCaptcha: () => Promise<GstCaptchaResponse>
      fetchGstDetails: (
        gst_number: string,
        captcha: string,
        captcha_cookie: string
      ) => Promise<GstDetailsResponse>
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
