<script lang="ts">
  import { onMount } from 'svelte'
  import { formatter } from './../utils/formatting'

  let companies = $state([])
  let selectedCompany = $state(null)
  let selectedCompanyData = $state(null)
  let items = $state([{ description: '', quantity: 1, rate: 0, amount: 0 }])
  let invoiceNumber = $state('')
  let invoiceDate = $state(new Date().toISOString().split('T')[0])
  let selectedTaxRate = $state(18) // Default to 18%

  let totalAmount = $derived(items.reduce((sum, item) => sum + item.amount, 0))
  let cgstAmount = $derived(
    selectedCompanyData?.state === 'Maharashtra' ? totalAmount * (selectedTaxRate / 200) : 0
  )
  let sgstAmount = $derived(
    selectedCompanyData?.state === 'Maharashtra' ? totalAmount * (selectedTaxRate / 200) : 0
  )
  let igstAmount = $derived(
    selectedCompanyData?.state !== 'Maharashtra' ? totalAmount * (selectedTaxRate / 100) : 0
  )
  let grandTotal = $derived(totalAmount + cgstAmount + sgstAmount + igstAmount)

  onMount(async () => {
    companies = await window.api.getCompanies()
  })

  function updateItemAmount(index: number) {
    items[index].amount = items[index].quantity * items[index].rate
    items = [...items]
  }

  function addItem() {
    items = [...items, { description: '', quantity: 1, rate: 0, amount: 0 }]
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index)
  }

  function handleCompanyChange(event) {
    const companyId = event.target.value
    selectedCompanyData = companies.find((c) => c.id === parseInt(companyId))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selectedCompany) return

    const invoice = {
      invoiceNumber,
      date: $state.snapshot(invoiceDate),
      companyId: $state.snapshot(selectedCompany),
      items: $state.snapshot(items),
      totalAmount: $state.snapshot(totalAmount),
      cgstAmount: $state.snapshot(cgstAmount),
      sgstAmount: $state.snapshot(sgstAmount),
      igstAmount: $state.snapshot(igstAmount),
      tax_rate: $state.snapshot(selectedTaxRate)
    }

    await window.api.createInvoice(invoice)
    window.location.href = '/invoices'
  }
</script>

<div class="bg-white shadow rounded-lg p-6">
  <h2 class="text-2xl font-semibold mb-6">Create New Invoice</h2>
  <form onsubmit={handleSubmit} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Invoice Number</label>
        <input type="text" bind:value={invoiceNumber} class="input w-full" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Date</label>
        <input type="date" bind:value={invoiceDate} class="input w-full" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Company</label>
        <select
          bind:value={selectedCompany}
          onchange={handleCompanyChange}
          class="input w-full"
          required
        >
          <option value={null}>Select a company</option>
          {#each companies as company}
            <option value={company.id}>{company.name}</option>
          {/each}
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Tax Rate</label>
        <select bind:value={selectedTaxRate} class="input w-full" required>
          <option value={18}>18%</option>
          <option value={5}>5%</option>
        </select>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">Items</h3>
        <button type="button" class="btn" onclick={addItem}>Add Item</button>
      </div>

      {#each items as item, i}
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div class="md:col-span-5">
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <input type="text" bind:value={item.description} class="input w-full" required />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              bind:value={item.quantity}
              oninput={() => updateItemAmount(i)}
              class="input w-full"
              min="1"
              required
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Rate</label>
            <input
              type="number"
              bind:value={item.rate}
              oninput={() => updateItemAmount(i)}
              class="input w-full"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <input type="number" value={item.amount} class="input w-full" readonly />
          </div>
          <div class="md:col-span-1">
            {#if items.length > 1}
              <button
                type="button"
                class="text-red-600 hover:text-red-800"
                onclick={() => removeItem(i)}
              >
                Remove
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <div class="border-t pt-4">
      <div class="flex justify-end space-y-2">
        <div class="w-64 space-y-2">
          <div class="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatter.format(totalAmount)}</span>
          </div>
          {#if selectedCompanyData?.state === 'Maharashtra'}
            <div class="flex justify-between">
              <span>CGST ({selectedTaxRate / 2}%):</span>
              <span>{formatter.format(cgstAmount)}</span>
            </div>
            <div class="flex justify-between">
              <span>SGST ({selectedTaxRate / 2}%):</span>
              <span>{formatter.format(sgstAmount)}</span>
            </div>
          {:else}
            <div class="flex justify-between">
              <span>IGST ({selectedTaxRate}%):</span>
              <span>{formatter.format(igstAmount)}</span>
            </div>
          {/if}
          <div class="flex justify-between font-bold">
            <span>Total:</span>
            <span>{formatter.format(grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button type="submit" class="btn">Create Invoice</button>
    </div>
  </form>
</div>
