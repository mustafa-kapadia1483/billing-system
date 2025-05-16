<script lang="ts">
  import { onMount } from 'svelte'
  import { formatter } from './../utils/formatting'
  import sellerDetails from '../config/seller.json'
  import { goto } from '@mateothegreat/svelte5-router'
  import { toasts } from './Toast'

  let companies = $state([])
  let selectedCompany = $state(null)
  let selectedCompanyData = $state(null)
  let items = $state([
    {
      description: '',
      hsn_code: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      tax_rate: 18,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0
    }
  ])
  let invoiceNumber = $state('')
  let invoiceDate = $state(new Date().toISOString().split('T')[0])

  let totalAmount = $derived(items.reduce((sum, item) => sum + item.amount, 0))
  let totalCgst = $derived(items.reduce((sum, item) => sum + item.cgst_amount, 0))
  let totalSgst = $derived(items.reduce((sum, item) => sum + item.sgst_amount, 0))
  let totalIgst = $derived(items.reduce((sum, item) => sum + item.igst_amount, 0))
  let grandTotal = $derived(totalAmount + totalCgst + totalSgst + totalIgst)

  onMount(async () => {
    companies = await window.api.getCompanies()
  })

  function updateItemAmount(index: number): void {
    const item = items[index]
    item.amount = item.quantity * item.rate

    // Calculate tax amounts based on company state
    if (selectedCompanyData?.state === sellerDetails.state) {
      item.cgst_amount = item.amount * (item.tax_rate / 200) // Half of tax rate for CGST
      item.sgst_amount = item.amount * (item.tax_rate / 200) // Half of tax rate for SGST
      item.igst_amount = 0
    } else {
      item.cgst_amount = 0
      item.sgst_amount = 0
      item.igst_amount = item.amount * (item.tax_rate / 100) // Full tax rate for IGST
    }

    items = [...items]
  }

  function addItem(): void {
    items.push({
      description: '',
      hsn_code: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      tax_rate: 18,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0
    })
  }

  function removeItem(index: number): void {
    items = items.filter((_, i) => i !== index)
  }

  function handleCompanyChange(event): void {
    const companyId = event.target.value
    selectedCompanyData = companies.find((c) => c.id === parseInt(companyId))
  }

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault()
    if (!selectedCompany) return

    const invoice = {
      invoiceNumber,
      date: $state.snapshot(invoiceDate),
      companyId: $state.snapshot(selectedCompany),
      items: $state.snapshot(items),
      totalAmount: $state.snapshot(totalAmount),
      cgstAmount: $state.snapshot(totalCgst),
      sgstAmount: $state.snapshot(totalSgst),
      igstAmount: $state.snapshot(totalIgst)
    }

    await window.api.createInvoice(invoice)
    toasts.success(`Invoice No. ${invoiceNumber} created successfully`)
    goto('/invoices')
  }
</script>

<div class="card bg-white shadow-lg rounded-lg p-8 border border-gray-100">
  <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
    <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    Create New Invoice
  </h2>
  <form onsubmit={handleSubmit} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="group">
        <label class="block text-sm font-semibold text-gray-800 mb-1.5">Invoice Number</label>
        <input
          type="text"
          bind:value={invoiceNumber}
          class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required
        />
      </div>
      <div class="group">
        <label class="block text-sm font-semibold text-gray-800 mb-1.5">Date</label>
        <input
          type="date"
          bind:value={invoiceDate}
          class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required
        />
      </div>
      <div class="group">
        <label class="block text-sm font-semibold text-gray-800 mb-1.5">Company</label>
        <select
          bind:value={selectedCompany}
          onchange={handleCompanyChange}
          class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
          required
        >
          <option value={null} class="text-gray-500">Select a company</option>
          {#each companies as company (company.id)}
            <option value={company.id}>{company.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">Items</h3>
        <button
          type="button"
          class="btn btn-secondary px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
          onclick={addItem}
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Item
        </button>
      </div>

      {#each items as item, i (i)}
        <div
          class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200"
        >
          <div class="md:col-span-4">
            <label class="block text-sm font-semibold text-gray-800 mb-1.5">Description</label>
            <input
              type="text"
              bind:value={item.description}
              class="input w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-800 mb-1.5">HSN/SAC</label>
            <input
              type="text"
              bind:value={item.hsn_code}
              class="input w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              placeholder="e.g. 8471"
            />
          </div>
          <div class="md:col-1">
            <label class="block text-sm font-semibold text-gray-800 mb-1.5">Quantity</label>
            <input
              type="number"
              bind:value={item.quantity}
              oninput={() => updateItemAmount(i)}
              class="input w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              min="1"
              required
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-800 mb-1.5">Rate</label>
            <input
              type="number"
              bind:value={item.rate}
              oninput={() => updateItemAmount(i)}
              class="input w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="md:col-span-1">
            <label class="block text-sm font-semibold text-gray-800 mb-1.5">Tax Rate</label>
            <select
              bind:value={item.tax_rate}
              onchange={() => updateItemAmount(i)}
              class="input w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
            >
              <option value={3}>3%</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-800 mb-1.5">Amount</label>
            <input
              type="number"
              value={item.amount}
              class="input w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg"
              readonly
            />
          </div>
          <div class="md:col-span-1 flex justify-end">
            {#if items.length > 1}
              <button
                type="button"
                class="btn btn-danger px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors text-sm"
                onclick={() => removeItem(i)}
              >
                Remove
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="border-t pt-6">
      <div class="flex justify-end">
        <div class="w-80 space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span class="font-medium text-gray-800">{formatter.format(totalAmount)}</span>
          </div>
          {#if selectedCompanyData?.state === sellerDetails.state}
            <div class="flex justify-between text-gray-600">
              <span>Total CGST:</span>
              <span class="font-medium text-gray-800">{formatter.format(totalCgst)}</span>
            </div>
            <div class="flex justify-between text-gray-600">
              <span>Total SGST:</span>
              <span class="font-medium text-gray-800">{formatter.format(totalSgst)}</span>
            </div>
          {:else}
            <div class="flex justify-between text-gray-600">
              <span>Total IGST:</span>
              <span class="font-medium text-gray-800">{formatter.format(totalIgst)}</span>
            </div>
          {/if}
          <div class="flex justify-between text-gray-800 font-bold pt-2 border-t border-gray-200">
            <span>Total:</span>
            <span>{formatter.format(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end pt-4">
      <button
        type="submit"
        class="btn btn-primary px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Create Invoice
      </button>
    </div>
  </form>
</div>
