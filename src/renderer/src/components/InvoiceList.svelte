<script lang="ts">
  import { onMount } from 'svelte'
  import { useNavigate } from '@dvcol/svelte-simple-router'
  import { formatter } from '$lib/utils/formatting'
  import { toasts } from '$lib/Toast'
  import Button from '$lib/Button.svelte'
  import { Edit, Trashcan, CheckCircled, CrossCircled, Plus, EyeCircled } from '$lib/icons'

  const { push } = useNavigate()

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
    push({ path: `/invoice/:id`, params: { id } })
  }

  function editInvoice(id: number): void {
    push({ path: `/create-invoice`, query: { id, edit: true } })
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

<svelte:head>
  <title>Invoices</title>
</svelte:head>

<div class="bg-white shadow-lg rounded-xl p-6">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-semibold">Invoices</h2>
    <Button href="/create-invoice" class="flex items-center gap-2" asAnchorTag={true}>
      <Plus />
      Create New Invoice
    </Button>
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
        <label for="from-date" class="block text-sm font-medium text-gray-700 mb-1">
          From Date
        </label>
        <input
          id="from-date"
          type="date"
          bind:value={filters.fromDate}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onchange={() => loadInvoices()}
        />
      </div>
      <div>
        <label for="to-date" class="block text-sm font-medium text-gray-700 mb-1">To Date</label>
        <input
          id="to-date"
          type="date"
          bind:value={filters.toDate}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onchange={() => loadInvoices()}
        />
      </div>

      <!-- Amount Range -->
      <div>
        <label for="min-amount" class="block text-sm font-medium text-gray-700 mb-1">
          Min Amount
        </label>
        <input
          id="min-amount"
          type="number"
          bind:value={filters.minAmount}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Min amount"
          onchange={() => loadInvoices()}
        />
      </div>
      <div>
        <label for="max-amount" class="block text-sm font-medium text-gray-700 mb-1">
          Max Amount
        </label>
        <input
          id="max-amount"
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

  <div class="table-container overflow-auto">
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
            <td class="px-6 py-4 whitespace-nowrap" title={invoice.company_name}>
              {invoice.company_name.length > 25
                ? invoice.company_name.slice(0, 25) + '...'
                : invoice.company_name}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{invoice.gstin}</td>
            <td class="px-6 py-4 whitespace-nowrap">{formatter.format(invoice.grand_total)}</td>
            <td class="px-6 py-4 whitespace-nowrap w-32">{invoice.is_paid ? 'Paid' : 'Unpaid'}</td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onclick={() => togglePaid(invoice)}
                title={`Mark as ${invoice.is_paid ? 'Unpaid' : 'Paid'}`}
              >
                {#if invoice.is_paid}
                  <CrossCircled />
                {:else}
                  <CheckCircled />
                {/if}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onclick={() => viewInvoice(invoice.id)}
                title="View"
              >
                <EyeCircled />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onclick={() => editInvoice(invoice.id)}
                title="Edit"
              >
                <Edit />
              </Button>
              <Button
                size="sm"
                variant="danger"
                onclick={() => deleteInvoice(invoice.id, invoice.invoice_number)}
                title="Delete"
              >
                <Trashcan />
              </Button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
