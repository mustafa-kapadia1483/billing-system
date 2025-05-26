<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '@mateothegreat/svelte5-router'
  import { formatter } from '$lib/utils/formatting'
  import { toasts } from '$lib/Toast'
  import Button from '$lib/Button.svelte'

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

  function editInvoice(id: number): void {
    goto(`/create-invoice`, { id, edit: true })
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
    <Button href="/create-invoice" asAnchorTag={true}>Create New Invoice</Button>
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
      <Button size="sm" variant="secondary" onclick={resetFilters}>Reset Filters</Button>
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
              <Button
                size="sm"
                variant="secondary"
                onclick={() => togglePaid(invoice)}
                title={`Mark as ${invoice.is_paid ? 'Unpaid' : 'Paid'}`}
              >
                {#if invoice.is_paid}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clip-rule="evenodd"
                    />
                  </svg>
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                      clip-rule="evenodd"
                    />
                  </svg>
                {/if}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onclick={() => viewInvoice(invoice.id)}
                title="View"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fill-rule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onclick={() => editInvoice(invoice.id)}
                title="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
              </Button>
              <Button
                size="sm"
                variant="danger"
                onclick={() => deleteInvoice(invoice.id, invoice.invoice_number)}
                title="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </Button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
