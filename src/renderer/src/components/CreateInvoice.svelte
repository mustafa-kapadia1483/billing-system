<script lang="ts">
  import { onMount } from 'svelte'
  import { formatter } from '$lib/utils/formatting'
  import sellerDetails from '../config/seller.json'
  import { toasts } from '$lib/Toast'
  import UnitSelect from '$lib/unit-select.svelte'
  import Button from '$lib/Button.svelte'
  import CompanyDialog from '$lib/company-dialog.svelte'
  import ToggleButton from '$lib/toggle-button.svelte'
  import { Trashcan, Plus, Check, Document } from '$lib/icons'
  import { useRoute, useNavigate } from '@dvcol/svelte-simple-router'
  import type { InvoiceItem } from 'src/shared/types'

  const { location } = $derived(useRoute())
  const { push } = useNavigate()

  const queryParams = $derived(location.query)

  let showCompanyDialog = $state(false)
  let companies = $state([])
  let selectedCompany = $state(null)
  let selectedCompanyData = $state(null)
  let items: InvoiceItem[] = $state([
    {
      description: '',
      hsn_code: '',
      quantity: 1,
      rate: 0,
      amount: 0,
      tax_rate: 18,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      per: 'PCS',
      discount: 0
    }
  ])
  let invoiceNumber = $state('')
  let invoiceDate = $state(new Date().toISOString().split('T')[0])
  let sameAsBillTo = $state(true)
  let shipToName = $state('')
  let shipToAddress = $state('')
  let shipToCity = $state('')
  let shipToPostalCode = $state('')
  let shipToState = $state('')

  let { id: invoiceId = undefined, edit: isEditMode = false } = $derived.by(() => {
    return {
      id: parseInt(queryParams.id as string) || undefined,
      edit: queryParams.edit === 'true'
    }
  })

  let totalAmount = $derived(items.reduce((sum, item) => sum + item.amount, 0))
  let totalCgst = $derived(items.reduce((sum, item) => sum + item.cgst_amount, 0))
  let totalSgst = $derived(items.reduce((sum, item) => sum + item.sgst_amount, 0))
  let totalIgst = $derived(items.reduce((sum, item) => sum + item.igst_amount, 0))
  let grandTotal = $derived(totalAmount + totalCgst + totalSgst + totalIgst)

  onMount(async () => {
    companies = await window.api.getCompanies()

    if (isEditMode && invoiceId) {
      const { invoice, items: invoiceItems } = await window.api.getInvoiceDetails(invoiceId)

      // Populate form with invoice details
      invoiceNumber = invoice.invoice_number
      invoiceDate = invoice.date
      selectedCompany = invoice.company_id
      selectedCompanyData = companies.find((c) => c.id === invoice.company_id)

      shipToName = invoice.ship_to_name || ''
      shipToAddress = invoice.ship_to_address || ''
      shipToCity = invoice.ship_to_city || ''
      shipToPostalCode = invoice.ship_to_postal_code || ''
      shipToState = invoice.ship_to_state || ''

      // Populate items
      items = invoiceItems.map((item) => ({
        description: item.description,
        hsn_code: item.hsn_code,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
        tax_rate: item.tax_rate,
        cgst_amount: item.cgst_amount,
        sgst_amount: item.sgst_amount,
        igst_amount: item.igst_amount,
        per: item.per,
        discount: item.discount
      }))
    }
  })

  function updateItemAmount(index: number): void {
    const item = items[index]
    const discountAmount = item.rate * (item.discount / 100)
    const rateAfterDiscount = item.rate - discountAmount
    item.amount = item.quantity * rateAfterDiscount

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
      igst_amount: 0,
      per: 'PCS',
      discount: 0
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
      igstAmount: $state.snapshot(totalIgst),
      shipToName: $state.snapshot(shipToName),
      shipToAddress: $state.snapshot(shipToAddress),
      shipToCity: $state.snapshot(shipToCity),
      shipToPostalCode: $state.snapshot(shipToPostalCode),
      shipToState: $state.snapshot(shipToState)
    }

    try {
      if (isEditMode) {
        await window.api.updateInvoiceData(invoiceId, invoice)
        toasts.success(`Invoice No. ${invoiceNumber} updated successfully`)
      } else {
        await window.api.createInvoice(invoice)
        toasts.success(`Invoice No. ${invoiceNumber} created successfully`)
      }
      push({ path: '/invoices' })
    } catch (error) {
      console.error('Failed to create invoice:', error)
      toasts.error(`Failed to ${isEditMode ? 'update' : 'create'} invoice`)
    }
  }

  let searchResults = $state([])
  let showDropdown = $state(false)
  let searchTimeout

  async function searchInventory(query: string): Promise<void> {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      if (query.length < 2) {
        searchResults = []
        showDropdown = false
        return
      }

      try {
        const results = await window.api.getInventory({
          name: query,
          sortBy: 'name',
          sortOrder: 'asc',
          limit: 5
        })
        searchResults = results
        showDropdown = true
      } catch (error) {
        toasts.error('Failed to search inventory')
      }
    }, 300)
  }

  function selectInventoryItem(item, index: number): void {
    items[index] = {
      ...items[index],
      description: (item.name + (item.description ? ` - ${item.description}` : '')).trim(),
      hsn_code: item.hsn_code,
      rate: item.rate,
      tax_rate: item.tax_rate
    }
    showDropdown = false
    searchResults = []
    updateItemAmount(index)
  }

  async function handleCompanyDialogSuccess(companyId: number): Promise<void> {
    const updatedCompanies = await window.api.getCompanies()
    companies = updatedCompanies
    // Select the last added company
    selectedCompanyData = companies.find(({ id }) => id == companyId)
    selectedCompany = selectedCompanyData.id
  }

  $effect(() => {
    if (sameAsBillTo) {
      shipToName = selectedCompanyData?.name || ''
      shipToAddress = selectedCompanyData?.address || ''
      shipToCity = selectedCompanyData?.city || ''
      shipToPostalCode = selectedCompanyData?.postal_code || ''
      shipToState = selectedCompanyData?.state || ''
    }
  })
</script>

<svelte:head>
  <title>{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</title>
</svelte:head>

<div class="card bg-white shadow-lg rounded-lg p-8 border border-gray-100">
  <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
    <Document />
    {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
  </h2>
  <form onsubmit={handleSubmit} class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="group">
        <label for="invoice-number" class="block text-sm font-semibold text-gray-800 mb-1.5">
          Invoice Number
        </label>
        <input
          id="invoice-number"
          type="text"
          bind:value={invoiceNumber}
          class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required
        />
      </div>
      <div class="group">
        <label for="invoice-date" class="block text-sm font-semibold text-gray-800 mb-1.5">
          Date
        </label>
        <input
          id="invoice-date"
          type="date"
          bind:value={invoiceDate}
          class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          required
        />
      </div>
      <div class="group">
        <label for="company" class="block text-sm font-semibold text-gray-800 mb-1.5">
          Company
        </label>
        <div class="flex gap-2">
          <div class="relative flex-1">
            <select
              id="company"
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
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onclick={() => (showCompanyDialog = true)}
            >
              <Plus />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add this after the company selection grid -->
    <div class="mt-6 space-y-6">
      {#if !isEditMode}
        <ToggleButton
          bind:checked={sameAsBillTo}
          label="Set Ship To Same as Bill To"
          labelPosition="right"
          size="md"
        />
      {/if}

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5" class:hidden={sameAsBillTo && !isEditMode}>
        <div class="group">
          <label for="ship-to-name" class="block text-sm font-semibold text-gray-800 mb-1.5">
            Name
          </label>
          <input
            id="ship-to-name"
            type="text"
            bind:value={shipToName}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            disabled={sameAsBillTo && !isEditMode}
            required
          />
        </div>
        <div class="group col-span-2">
          <label for="ship-to-address" class="block text-sm font-semibold text-gray-800 mb-1.5">
            Address
          </label>
          <input
            id="ship-to-address"
            type="text"
            bind:value={shipToAddress}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            disabled={sameAsBillTo && !isEditMode}
            required
          />
        </div>
        <div class="group">
          <label for="ship-to-postal-code" class="block text-sm font-semibold text-gray-800 mb-1.5">
            Postal Code
          </label>
          <input
            id="ship-to-postal-code"
            type="text"
            bind:value={shipToPostalCode}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            disabled={sameAsBillTo && !isEditMode}
            required
          />
        </div>
        <div class="group">
          <label for="ship-to-city" class="block text-sm font-semibold text-gray-800 mb-1.5">
            City
          </label>
          <input
            id="ship-to-city"
            type="text"
            bind:value={shipToCity}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            disabled={sameAsBillTo && !isEditMode}
            required
          />
        </div>
        <div class="group">
          <label for="ship-to-state" class="block text-sm font-semibold text-gray-800 mb-1.5">
            State
          </label>
          <input
            id="ship-to-state"
            type="text"
            bind:value={shipToState}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            disabled={sameAsBillTo && !isEditMode}
            required
          />
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-800">Items</h3>

        <Button class="flex items-center gap-2" type="button" variant="secondary" onclick={addItem}>
          <Plus />
          Add Item
        </Button>
      </div>

      {#each items as item, i (i)}
        <div
          class="grid grid-cols-1 md:grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded-lg border border-gray-200"
        >
          <div class="md:col-span-3 relative">
            <label for="name-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              Name
            </label>
            <input
              id="name-${i}"
              type="text"
              bind:value={item.description}
              oninput={() => searchInventory(item.description as string)}
              onblur={() => setTimeout(() => (showDropdown = false), 200)}
              class="input w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
              placeholder="Type to search inventory..."
            />
            {#if showDropdown && searchResults.length > 0}
              <div
                class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto"
              >
                {#each searchResults as result (result.id)}
                  <button
                    type="button"
                    class="w-full text-left px-4 py-2 hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden transition-colors"
                    onclick={() => selectInventoryItem(result, i)}
                  >
                    <div class="text-sm font-medium text-gray-800">{result.name}</div>
                    {#if result.description}
                      <div class="text-xs text-gray-500 mt-0.5">{result.description}</div>
                    {/if}
                    <div class="text-xs text-gray-600 mt-1 flex items-center justify-between">
                      <span>HSN: {result.hsn_code}</span>
                      <span class="font-medium">{formatter.format(result.rate)}</span>
                    </div>
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="md:col-span-1">
            <label for="hsn-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              HSN/SAC
            </label>
            <input
              id="hsn-${i}"
              type="text"
              bind:value={item.hsn_code}
              class="input w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              placeholder="8471"
            />
          </div>
          <div class="md:col-span-1">
            <label for="quantity-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              Qty
            </label>
            <input
              id="quantity-${i}"
              type="number"
              bind:value={item.quantity}
              oninput={() => updateItemAmount(i)}
              class="input w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              min="1"
              required
            />
          </div>
          <div class="md:col-span-1">
            <label for="per-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              Per
            </label>
            <UnitSelect id="per-${i}" bind:value={item.per} required />
          </div>
          <div class="md:col-span-1.5">
            <label for="rate-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              Rate
            </label>
            <input
              id="rate-${i}"
              type="number"
              bind:value={item.rate}
              oninput={() => updateItemAmount(i)}
              class="input w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div class="md:col-span-1">
            <label for="discount-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              Disc.
            </label>
            <div class="relative">
              <input
                id="discount-${i}"
                type="number"
                bind:value={item.discount}
                oninput={() => updateItemAmount(i)}
                class="input w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors pr-6"
                min="0"
                max="100"
                step="0.01"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">%</span>
            </div>
          </div>
          <div class="md:col-span-1">
            <label for="tax-rate-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              Tax
            </label>
            <select
              id="tax-rate-${i}"
              bind:value={item.tax_rate}
              onchange={() => updateItemAmount(i)}
              class="input w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
            >
              <option value={3}>3%</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          </div>
          <div class="md:col-span-1.5">
            <label for="amount-${i}" class="block text-xs font-semibold text-gray-800 mb-1">
              Amount
            </label>
            <input
              id="amount-${i}"
              type="number"
              value={item.amount}
              class="input w-full px-2 py-1.5 text-sm bg-gray-100 border border-gray-200 rounded-lg"
              readonly
            />
          </div>
          <div class="md:col-span-1 flex items-center">
            {#if items.length > 1}
              <Button type="button" variant="danger" size="sm" onclick={() => removeItem(i)}>
                <Trashcan />
              </Button>
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
      <Button type="submit" class="flex items-center gap-2">
        <Check />
        {isEditMode ? 'Update Invoice' : 'Create Invoice'}
      </Button>
    </div>
  </form>
</div>

<CompanyDialog
  isOpen={showCompanyDialog}
  company={null}
  onClose={() => (showCompanyDialog = false)}
  onSuccess={handleCompanyDialogSuccess}
/>
