<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '@mateothegreat/svelte5-router'
  import { formatter } from '../utils/formatting'
  import { toasts } from './Toast'

  let invoices = $state([])
  let companies = $state([])

  // Filter states
  let filters = $state({
    companyId: undefined,
    isPaid: undefined,
    fromDate: '',
    toDate: '',
    minAmount: undefined,
    maxAmount: undefined,
    invoiceNumber: '',
    sortBy: 'date',
    sortOrder: 'desc' as 'asc' | 'desc',
    limit: 50,
    offset: 0
  })

  onMount(async () => {
    companies = await window.api.getCompanies()
    loadInvoices()
  })

  async function loadInvoices(): Promise<void> {
    invoices = await window.api.getInvoices($state.snapshot(filters))
  }

  function viewInvoice(id: number): void {
    goto(`/invoice/${id}`)
  }

  async function deleteInvoice(id: number, invoice_number: string): Promise<void> {
    await window.api.deleteInvoice(id)
    toasts.info(`Invoice No. ${invoice_number} deleted successfully`)
    await loadInvoices()
  }

  async function togglePaid(invoice): Promise<void> {
    await window.api.updateInvoicePaidStatus(invoice.id, !invoice.is_paid)
    toasts.success(
      `Invoice No. ${invoice.invoice_number} marked as ${invoice.is_paid ? 'Unpaid' : 'Paid'}`
    )
    await loadInvoices()
  }

  function resetFilters(): void {
    filters = {
      companyId: undefined,
      isPaid: undefined,
      fromDate: '',
      toDate: '',
      minAmount: undefined,
      maxAmount: undefined,
      invoiceNumber: '',
      sortBy: 'date',
      sortOrder: 'desc',
      limit: 50,
      offset: 0
    }
    loadInvoices()
  }
</script>

<div class="bg-white shadow-lg rounded-xl p-6">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-semibold">Invoices</h2>
    <a href="/create-invoice" class="btn btn-primary">Create New Invoice</a>
  </div>

  <div class="mb-6 bg-gray-50 p-4 rounded-lg space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Invoice Number Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
        <input
          type="text"
          bind:value={filters.invoiceNumber}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search invoice number"
          oninput={() => loadInvoices()}
        />
      </div>

      <!-- Company Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
        <select
          bind:value={filters.companyId}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onchange={() => loadInvoices()}
        >
          <option value={undefined}>All Companies</option>
          {#each companies as company (company.id)}
            <option value={company.id}>{company.name}</option>
          {/each}
        </select>
      </div>

      <!-- Payment Status Filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
        <select
          bind:value={filters.isPaid}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onchange={() => loadInvoices()}
        >
          <option value={undefined}>All</option>
          <option value={true}>Paid</option>
          <option value={false}>Unpaid</option>
        </select>
      </div>

      <!-- Sort Options -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <div class="flex gap-2">
          <select
            bind:value={filters.sortBy}
            class="input w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onchange={() => loadInvoices()}
          >
            <option value="date">Date</option>
            <option value="invoice_number">Invoice Number</option>
            <option value="total_amount">Amount</option>
            <option value="company_name">Company</option>
            <option value="is_paid">Payment Status</option>
          </select>
          <select
            bind:value={filters.sortOrder}
            class="input w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onchange={() => loadInvoices()}
          >
            <option value="desc">DESC</option>
            <option value="asc">ASC</option>
          </select>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Date Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">From Date</label>
        <input
          type="date"
          bind:value={filters.fromDate}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onchange={() => loadInvoices()}
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
        <input
          type="date"
          bind:value={filters.toDate}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onchange={() => loadInvoices()}
        />
      </div>

      <!-- Amount Range -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
        <input
          type="number"
          bind:value={filters.minAmount}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Min amount"
          onchange={() => loadInvoices()}
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
        <input
          type="number"
          bind:value={filters.maxAmount}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Max amount"
          onchange={() => loadInvoices()}
        />
      </div>
    </div>

    <div class="flex justify-end">
      <button class="btn btn-secondary px-4 py-2 text-sm" onclick={resetFilters}>
        Reset Filters
      </button>
    </div>
  </div>

  <div class="table-container">
    <table class="table">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Invoice No</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Date</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Company</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >GSTIN</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Amount</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Status</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Actions</th
          >
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each invoices as invoice (invoice.id)}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">{invoice.invoice_number}</td>
            <td class="px-6 py-4 whitespace-nowrap"
              >{new Date(invoice.date).toLocaleDateString()}</td
            >
            <td class="px-6 py-4 whitespace-nowrap">{invoice.company_name}</td>
            <td class="px-6 py-4 whitespace-nowrap">{invoice.gstin}</td>
            <td class="px-6 py-4 whitespace-nowrap">{formatter.format(invoice.total_amount)}</td>
            <td class="px-6 py-4 whitespace-nowrap w-32">{invoice.is_paid ? 'Paid' : 'Unpaid'}</td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
              <button class="btn btn-secondary text-sm" onclick={() => togglePaid(invoice)}>
                Mark as {invoice.is_paid ? 'Unpaid' : 'Paid'}
              </button>
              <button class="btn btn-secondary text-sm" onclick={() => viewInvoice(invoice.id)}>
                View
              </button>
              <button
                class="btn btn-danger text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                onclick={() => deleteInvoice(invoice.id, invoice.invoice_number)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
