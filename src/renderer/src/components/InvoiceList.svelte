<script lang="ts">
  import { onMount } from 'svelte'
  import { goto } from '@mateothegreat/svelte5-router'

  let invoices = []

  onMount(async () => {
    invoices = await window.api.getInvoices()
  })

  function viewInvoice(id: number) {
    console.log('Viewing invoice with ID:', id)
    goto(`/invoice/${id}`)
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
            >Actions</th
          >
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each invoices as invoice}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">{invoice.invoice_number}</td>
            <td class="px-6 py-4 whitespace-nowrap"
              >{new Date(invoice.date).toLocaleDateString()}</td
            >
            <td class="px-6 py-4 whitespace-nowrap">{invoice.company_name}</td>
            <td class="px-6 py-4 whitespace-nowrap">{invoice.gstin}</td>
            <td class="px-6 py-4 whitespace-nowrap">₹{invoice.total_amount}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button class="btn btn-secondary text-sm" onclick={() => viewInvoice(invoice.id)}>
                View
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
