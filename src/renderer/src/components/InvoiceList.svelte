<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '@mateothegreat/svelte5-router'
  import { formatter } from '../utils/formatting'
  import { toasts } from './Toast'

  let invoices = $state([])

  onMount(async () => {
    loadInvoices()
  })

  async function loadInvoices(): Promise<void> {
    invoices = await window.api.getInvoices()
  }

  function viewInvoice(id: number): void {
    console.log('Viewing invoice with ID:', id)
    goto(`/invoice/${id}`)
  }

  async function deleteInvoice(id: number, invoice_number: string): Promise<void> {
    await window.api.deleteInvoice(id)
    toasts.info(`Invoice No. ${invoice_number} deleted successfully`)
    await loadInvoices()
  }

  async function togglePaid(invoice): Promise<void> {
    if (invoice.is_paid) {
      await window.api.updateInvoicePaidStatus(invoice.id, false)
      toasts.success(`Invoice No. ${invoice.invoice_number} marked as Unpaid`)
    } else {
      await window.api.updateInvoicePaidStatus(invoice.id, true)
      toasts.success(`Invoice No. ${invoice.invoice_number} marked as Paid`)
    }
    await loadInvoices()
  }
</script>

<div class="bg-white shadow-lg rounded-xl p-6">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-semibold">Invoices</h2>
    <a href="/create-invoice" class="btn btn-primary">Create New Invoice</a>
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
