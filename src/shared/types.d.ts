// DB Types
export interface Company {
  id?: number
  name: string
  gstin: string
  address: string
  postal_code: string
  city: string
  state: string
}

export interface CompanyFilters {
  name?: Company['name']
  gstin?: Company['gstin']
  state?: Company['state']
  city?: Company['city']
  sortBy?: 'name' | 'gstin' | 'state' | 'city'
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface Invoice {
  id?: number
  invoiceNumber: string
  date: string
  companyId: Company['id']
  totalAmount: number
  cgstAmount?: number
  sgstAmount?: number
  igstAmount?: number
  shipToName?: string
  shipToAddress?: string
  shipToCity?: string
  shipToPostalCode?: string
  shipToState?: string
  is_paid?: boolean
  created_at?: string
  items: InvoiceItem[]
}

export interface InvoiceFilters {
  companyId?: number
  isPaid?: boolean
  fromDate?: string
  toDate?: string
  minAmount?: number
  maxAmount?: number
  invoiceNumber?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
  offset?: number
}

export interface InvoiceItem {
  id?: number
  invoice_id?: number
  description: string
  hsn_code?: string
  quantity: number
  per?: string
  rate: number
  amount: number
  discount?: number
  tax_rate?: number
  cgst_amount?: number
  sgst_amount?: number
  igst_amount?: number
  created_at?: string
}

export interface GstCaptchaResponse {
  code: number
  data: {
    captcha_image: string
    captcha_cookie: string
  }
}

export interface GstDetailsResponse {
  code: number
  data?: {
    status: string
    legalName: string
    businessNature: string
    address: string
    companyType: string
    tradeName: string
  }
  error?: string
  error_description?: string
  error_code?: string
}
