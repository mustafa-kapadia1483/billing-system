<script lang="ts">
  import { onMount } from 'svelte'
  import { formatter } from './../utils/formatting'
  import html2pdf from 'html2pdf.js'

  let { route } = $props()
  let invoiceData = $state(null)

  console.log(route.result.path.params.id)

  onMount(async () => {
    if (route.result.path.params.id) {
      invoiceData = await window.api.getInvoiceDetails(parseInt(route.result.path.params.id))
    }
  })

  function printInvoice() {
    // Print the document
    window.print()
  }

  function downloadPDF() {
    const element = document.querySelector('#invoice-content')
    const date = new Date(invoiceData.invoice.date).toISOString().split('T')[0]
    const filename = `${invoiceData.invoice.name}-${invoiceData.invoice.invoice_number}-${date}.pdf`

    // Hide buttons before generating PDF
    const buttons = document.querySelectorAll('.action-button')
    buttons.forEach((button) => (button.style.display = 'none'))

    const options = {
      margin: 1,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    }

    html2pdf()
      .set(options)
      .from(element)
      .save()
      .then(() => {
        // Restore buttons after PDF generation
        buttons.forEach((button) => (button.style.display = ''))
      })
  }
</script>

{#if invoiceData}
  <div
    id="invoice-content"
    class="bg-white shadow-lg rounded-lg p-8 print:shadow-none max-w-4xl mx-auto"
  >
    <div class="flex justify-between items-start mb-12">
      <h1 class="text-3xl font-bold text-gray-800">TAX INVOICE</h1>
      <div class="text-right space-y-2">
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p class="text-gray-600 text-sm">
            Invoice No: <span class="text-gray-800 font-semibold ml-2"
              >{invoiceData.invoice.invoice_number}</span
            >
          </p>
          <p class="text-gray-600 text-sm mt-1">
            Date: <span class="text-gray-800 font-semibold ml-2"
              >{new Date(invoiceData.invoice.date).toLocaleDateString()}</span
            >
          </p>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            class="btn bg-gray-100 hover:bg-gray-200 text-gray-700 print:hidden action-button px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            onclick={printInvoice}
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </span>
          </button>
          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white print:hidden action-button px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            onclick={downloadPDF}
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </span>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-12 mb-12">
      <div class="border-l-4 border-blue-600 pl-4 bg-gray-50 rounded-r-lg p-4">
        <h2 class="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          From
        </h2>
        <div class="space-y-2">
          <p class="font-bold text-gray-800 text-lg">TAHERALLYS & CO</p>
          <p class="text-gray-600 leading-relaxed">
            26/28 Mutton Street, Near JJ Hospital,<br />
            Mumbai - 400003<br />
            165 Tulsi Pipe road, Kohinoor Estate,<br />
            Lower Parel - 400013
          </p>
          <p class="font-medium text-gray-700 mt-2 flex items-center gap-2">
            <span class="text-sm text-gray-500">GSTIN:</span>
            <span class="font-mono">27ATQPJ9644J1ZW</span>
          </p>
        </div>
      </div>
      <div class="border-l-4 border-gray-300 pl-4 bg-gray-50 rounded-r-lg p-4">
        <h2 class="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Bill To
        </h2>
        <div class="space-y-2">
          <p class="font-bold text-gray-800 text-lg">{invoiceData.invoice.name}</p>
          <p class="text-gray-600 leading-relaxed">
            {invoiceData.invoice.address_line1}
            {#if invoiceData.invoice.address_line2}
              <br />{invoiceData.invoice.address_line2}
            {/if}
            <br />{invoiceData.invoice.city}, {invoiceData.invoice.state}
          </p>
          <p class="font-medium text-gray-700 mt-2 flex items-center gap-2">
            <span class="text-sm text-gray-500">GSTIN:</span>
            <span class="font-mono">{invoiceData.invoice.gstin}</span>
          </p>
        </div>
      </div>
    </div>

    <div class="mb-12 overflow-hidden rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/2"
              >Description</th
            >
            <th
              class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >Quantity</th
            >
            <th
              class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >Rate</th
            >
            <th
              class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >Amount</th
            >
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each invoiceData.items as item}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm text-gray-800">{item.description}</td>
              <td class="px-6 py-4 text-sm text-gray-600 text-right">{item.quantity}</td>
              <td class="px-6 py-4 text-sm text-gray-600 text-right"
                >{formatter.format(item.rate)}</td
              >
              <td class="px-6 py-4 text-sm text-gray-800 text-right font-medium"
                >{formatter.format(item.amount)}</td
              >
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="flex justify-end">
      <div class="w-80 space-y-3">
        <div class="flex justify-between items-center py-3 border-b border-gray-200">
          <span class="text-gray-600">Subtotal</span>
          <span class="text-gray-800 font-medium"
            >{formatter.format(invoiceData.invoice.total_amount)}</span
          >
        </div>
        {#if invoiceData.invoice.state === 'Maharashtra'}
          <div class="flex justify-between items-center py-3 border-b border-gray-200">
            <span class="text-gray-600">CGST ({invoiceData.invoice.tax_rate / 2}%)</span>
            <span class="text-gray-800 font-medium"
              >{formatter.format(invoiceData.invoice.cgst_amount)}</span
            >
          </div>
          <div class="flex justify-between items-center py-3 border-b border-gray-200">
            <span class="text-gray-600">SGST ({invoiceData.invoice.tax_rate / 2}%)</span>
            <span class="text-gray-800 font-medium"
              >{formatter.format(invoiceData.invoice.sgst_amount)}</span
            >
          </div>
        {:else}
          <div class="flex justify-between items-center py-3 border-b border-gray-200">
            <span class="text-gray-600">IGST ({invoiceData.invoice.tax_rate}%)</span>
            <span class="text-gray-800 font-medium"
              >{formatter.format(invoiceData.invoice.igst_amount)}</span
            >
          </div>
        {/if}
        <div class="flex justify-between items-center py-4 border-t-2 border-gray-800">
          <span class="text-gray-800 font-bold text-lg">Total</span>
          <span class="text-gray-800 font-bold text-lg">
            {formatter.format(
              parseFloat(
                (
                  parseFloat(invoiceData.invoice.total_amount) +
                  parseFloat(invoiceData.invoice.cgst_amount) +
                  parseFloat(invoiceData.invoice.sgst_amount) +
                  parseFloat(invoiceData.invoice.igst_amount)
                ).toFixed(2)
              )
            )}
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  @media print {
    @page {
      margin: 1cm;
      size: A4;
    }
  }
</style>
