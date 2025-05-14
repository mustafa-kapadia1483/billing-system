<script lang="ts">
  import { onMount } from 'svelte'
  import { formatter } from './../utils/formatting'
  import html2pdf from 'html2pdf.js'
  import { ToWords } from 'to-words'
  import sellerDetails from '../config/seller.json'

  let { route } = $props()
  let invoiceData = $state(null)

  onMount(async () => {
    if (route.result.path.params.id) {
      invoiceData = await window.api.getInvoiceDetails(parseInt(route.result.path.params.id))
    }
  })

  function printInvoice(): void {
    // Print the document
    window.print()
  }

  function downloadPDF(): void {
    const element = document.querySelector('#invoice-content')
    const date = new Date(invoiceData.invoice.date).toISOString().split('T')[0]
    const filename = `${invoiceData.invoice.name}-${invoiceData.invoice.invoice_number}-${date}.pdf`

    // Hide buttons before generating PDF
    const buttons = document.querySelectorAll('.action-button')
    buttons.forEach((button) => ((button as HTMLElement).style.display = 'none'))

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
        buttons.forEach((button) => ((button as HTMLElement).style.display = ''))
      })
  }

  const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
      currency: true,
      ignoreDecimal: false,
      ignoreZeroCurrency: false,
      doNotAddOnly: false,
      currencyOptions: {
        // can be used to override defaults for the selected locale
        name: 'Rupee',
        plural: 'Rupees',
        symbol: '₹',
        fractionalUnit: {
          name: 'Paisa',
          plural: 'Paise',
          symbol: ''
        }
      }
    }
  })

  let totalTaxAmount = $derived(
    invoiceData.items?.reduce(
      (acc, item) => acc + item.igst_amount + item.cgst_amount + item.sgst_amount,
      0
    )
  )
  let totalIgstAmount = $derived(
    invoiceData.items?.reduce((acc, item) => acc + item.igst_amount, 0)
  )
  let totalCgstAmount = $derived(
    invoiceData.items?.reduce((acc, item) => acc + item.cgst_amount, 0)
  )
  let totalSgstAmount = $derived(
    invoiceData.items?.reduce((acc, item) => acc + item.sgst_amount, 0)
  )
</script>

<div class="flex justify-center gap-4 mb-4 print:hidden">
  <button
    class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 action-button"
    on:click={downloadPDF}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clip-rule="evenodd"
      />
    </svg>
    Download PDF
  </button>
  <button
    class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 action-button"
    on:click={printInvoice}
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
        clip-rule="evenodd"
      />
    </svg>
    Print
  </button>
</div>
{#if invoiceData}
  <div
    id="invoice-content"
    class="bg-white p-8 print:p-0 print:shadow-none max-w-5xl mx-auto text-sm"
  >
    <h1 class="text-xl font-bold text-center mb-4">Tax Invoice</h1>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <div class="border border-gray-300">
        <div class="border-b p-3">
          <p class="font-bold mb-1">{sellerDetails.name}</p>
          <p class="text-xs leading-relaxed">
            {sellerDetails.address_line1}<br />
            {#if sellerDetails.address_line2}
              {sellerDetails.address_line2}<br />
            {/if}
            {sellerDetails.city}<br />
            GSTIN/UIN: {sellerDetails.gstin}<br />
            State Name: {sellerDetails.state}
          </p>
        </div>
        <div class=" p-3 mb-6 h-max">
          <p class="font-semibold mb-2">Buyer (Bill to)</p>
          <p class="font-bold">{invoiceData.invoice.name}</p>
          <p class="text-xs leading-relaxed">
            {invoiceData.invoice.address_line1}<br />
            {#if invoiceData.invoice.address_line2}
              {invoiceData.invoice.address_line2}<br />
            {/if}
            {invoiceData.invoice.city}<br />
            GSTIN/UIN: {invoiceData.invoice.gstin}<br />
            State Name: {invoiceData.invoice.state}
          </p>
        </div>
      </div>

      <table class="border border-gray-300 border-collapse w-full h-full text-xs">
        <tbody class="divide-y divide-gray-300">
          <tr class="h-[52px]">
            <td class="border-r border-gray-300 p-2 align-top">
              <p class="font-medium">Invoice No.</p>
              <p class="mt-1">{invoiceData.invoice.invoice_number}</p>
            </td>
            <td class="p-1 align-top">
              <p class="font-medium">Dated</p>
              <p class="mt-1">{new Date(invoiceData.invoice.date).toLocaleDateString('en-IN')}</p>
            </td>
          </tr>
          <tr class="h-[52px]">
            <td class="border-r border-gray-300 p-2 align-top">
              <p class="font-medium">Delivery Note</p>
              <p class="mt-1">{invoiceData.invoice.delivery_note || ''}</p>
            </td>
            <td class="p-1 align-top">
              <p class="font-medium">Mode/Terms of Payment</p>
              <p class="mt-1">{invoiceData.invoice.payment_terms || ''}</p>
            </td>
          </tr>
          <tr class="h-[52px]">
            <td class="border-r border-gray-300 p-2 align-top">
              <p class="font-medium">Reference No. & Date</p>
              <p class="mt-1">{invoiceData.invoice.reference_no || ''}</p>
            </td>
            <td class="p-1 align-top">
              <p class="font-medium">Other References</p>
              <p class="mt-1">{invoiceData.invoice.other_ref || ''}</p>
            </td>
          </tr>
          <tr class="h-[52px]">
            <td class="border-r border-gray-300 p-2 align-top">
              <p class="font-medium">Buyer's Order No.</p>
              <p class="mt-1">{invoiceData.invoice.buyer_order_no || ''}</p>
            </td>
            <td class="p-1 align-top">
              <p class="font-medium">Dated</p>
              <p class="mt-1">{invoiceData.invoice.buyer_order_date || ''}</p>
            </td>
          </tr>
          <tr class="h-[52px]">
            <td class="border-r border-gray-300 p-2 align-top">
              <p class="font-medium">Dispatch Doc No.</p>
              <p class="mt-1">{invoiceData.invoice.dispatch_doc_no || ''}</p>
            </td>
            <td class="p-1 align-top">
              <p class="font-medium">Delivery Note Date</p>
              <p class="mt-1">{invoiceData.invoice.delivery_note_date || ''}</p>
            </td>
          </tr>
          <tr class="h-[52px]">
            <td class="border-r border-gray-300 p-2 align-top">
              <p class="font-medium">Dispatched through</p>
              <p class="mt-1">{invoiceData.invoice.dispatched_through || ''}</p>
            </td>
            <td class="p-1 align-top">
              <p class="font-medium">Destination</p>
              <p class="mt-1">{invoiceData.invoice.destination || ''}</p>
            </td>
          </tr>
          <tr>
            <td colspan="2" class="p-1 align-top">
              <p class="font-medium">Terms of Delivery</p>
              <p class="mt-1">
                {invoiceData.invoice.terms_of_delivery || 'Goods once sold will not be taken back'}
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <table class="w-full border border-gray-300 text-xs mb-4">
      <thead>
        <tr class="border-b border-gray-300">
          <th class="border-r border-gray-300 p-2 text-left">SI No.</th>
          <th class="border-r border-gray-300 p-2 text-left">Description of Goods</th>
          <th class="border-r border-gray-300 p-2 text-center">HSN/SAC</th>
          <th class="border-r border-gray-300 p-2 text-center">Quantity</th>
          <th class="border-r border-gray-300 p-2 text-right">Rate</th>
          <th class="border-r border-gray-300 p-2 text-center">per</th>
          <th class="border-r border-gray-300 p-2 text-center">Disc. %</th>
          <th class="p-1 text-right">Amount</th>
        </tr>
      </thead>
      <tbody class="border-gray-300">
        {#each invoiceData.items as item, index (item.id)}
          <tr class="border-b border-gray-300">
            <td class="border-r border-gray-300 p-2">{index + 1}</td>
            <td class="border-r border-gray-300 p-2">{item.description}</td>
            <td class="border-r border-gray-300 p-2 text-center">{item.hsn_code || ''}</td>
            <td class="border-r border-gray-300 p-2 text-center">{item.quantity} No</td>
            <td class="border-r border-gray-300 p-2 text-right">{item.rate.toFixed(2)}</td>
            <td class="border-r border-gray-300 p-2 text-center">No</td>
            <td class="border-r border-gray-300 p-2 text-center">-</td>
            <td class="p-1 text-right">{item.amount.toFixed(2)}</td>
          </tr>
        {/each}
        {#if invoiceData.invoice?.state === sellerDetails.state}
          <tr class="border-b border-gray-300 bg-gray-50">
            <td class="border-r border-gray-300"></td>
            <td class="p-1 border-r border-gray-300 text-right">CGST</td>
            {#each Array.from({ length: 5 }) as _, i (i)}
              <td class="border-r border-gray-300"></td>
            {/each}
            <td class="p-1 border-r border-gray-300 text-right"
              >{invoiceData.items.reduce((sum, item) => sum + item.cgst_amount, 0).toFixed(2)}</td
            >
          </tr>
          <tr class="border-b border-gray-300 bg-gray-50">
            <td class="border-r border-gray-300"></td>
            <td class="p-1 border-r border-gray-300 text-right">SGST</td>
            {#each Array.from({ length: 5 }) as _, i (i)}
              <td class="border-r border-gray-300"></td>
            {/each}

            <td class="p-1 border-r border-gray-300 text-right"
              >{invoiceData.items.reduce((sum, item) => sum + item.sgst_amount, 0).toFixed(2)}</td
            >
          </tr>
        {:else}
          <tr class="border-b border-gray-300 bg-gray-50">
            <td class="border-r border-gray-300"></td>
            <td class="p-1 border-r border-gray-300 text-right">IGST</td>
            {#each Array.from({ length: 5 }) as _, i (i)}
              <td class="border-r border-gray-300"></td>
            {/each}
            <td class="p-1 border-r border-gray-300 text-right"
              >{invoiceData.items.reduce((sum, item) => sum + item.igst_amount, 0).toFixed(2)}</td
            >
          </tr>
        {/if}
        <tr class="border-b border-gray-300">
          <td colspan="7" class="border-r border-gray-300 p-2 text-right font-semibold">Total</td>
          <td class="p-1 text-right font-semibold">
            {formatter.format(
              invoiceData.items.reduce((sum, item) => {
                return sum + item.amount + (item.cgst_amount + item.sgst_amount + item.igst_amount)
              }, 0)
            )}
          </td>
        </tr>
        <tr class="border-b border-gray-300">
          <td colspan="7" class="border-r border-gray-300 p-2 text-left">
            <div class="flex gap-2">
              <p class="font-semibold mb-2">Amount Chargeable (in words):</p>
              <p>
                {toWords.convert(
                  invoiceData.items.reduce((sum, item) => {
                    return (
                      sum + item.amount + (item.cgst_amount + item.sgst_amount + item.igst_amount)
                    )
                  }, 0)
                )}
              </p>
            </div>
          </td>
          <td class="p-1 text-right font-semibold"> E. & O.E </td>
        </tr>
      </tbody>
    </table>

    <div class="grid grid-cols-1 gap-4 mb-4">
      <div class="border border-gray-300">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-gray-300">
              <th class="p-1 border-r border-gray-300">HSN/SAC</th>
              <th class="p-1 border-r border-gray-300">Taxable Value</th>
              {#if invoiceData.invoice?.state === sellerDetails.state}
                <th colspan="2" class="p-1 border-r border-gray-300 text-center">CGST</th>
                <th colspan="2" class="p-1 border-r border-gray-300 text-center">SGST/UTGST</th>
              {:else}
                <th colspan="2" class="p-1 border-r border-gray-300 text-center">IGST</th>
              {/if}
              <th class="p-1">Total Tax Amount</th>
            </tr>
          </thead>
          <tbody>
            {#each invoiceData.items as item (item.id)}
              <tr class="border-b border-gray-300">
                <td class="p-1 border-r border-gray-300 text-center">{item.hsn_code || ''}</td>
                <td class="p-1 border-r border-gray-300 text-right">{item.amount.toFixed(2)}</td>
                {#if invoiceData.invoice?.state === sellerDetails.state}
                  <td class="p-1 border-r border-gray-300 text-center">{item.tax_rate / 2}%</td>
                  <td class="p-1 border-r border-gray-300 text-right"
                    >{item.cgst_amount.toFixed(2)}</td
                  >
                  <td class="p-1 border-r border-gray-300 text-center">{item.tax_rate / 2}%</td>
                  <td class="p-1 border-r border-gray-300 text-right"
                    >{item.sgst_amount.toFixed(2)}</td
                  >
                  <td class="p-1 text-right">{(item.cgst_amount + item.sgst_amount).toFixed(2)}</td>
                {:else}
                  <td class="p-1 border-r border-gray-300 text-center">{item.tax_rate}%</td>
                  <td class="p-1 border-r border-gray-300 text-right"
                    >{item.igst_amount.toFixed(2)}</td
                  >
                  <td class="p-1 text-right">{item.igst_amount.toFixed(2)}</td>
                {/if}
              </tr>
            {/each}
            <tr class="border-b border-gray-300">
              <td class="p-1 border-r border-gray-300 text-right font-semibold"> Total </td>
              <td class="p-1 border-r border-gray-300 text-right font-semibold"
                >{formatter.format(invoiceData.invoice.total_amount)}</td
              >
              {#if invoiceData.invoice?.state === sellerDetails.state}
                <td class="border-r"></td>
                <td class="p-1 border-r border-gray-300 text-right font-semibold"
                  >{formatter.format(totalCgstAmount)}
                </td>
                <td class="border-r"></td>
                <td class="p-1 border-r border-gray-300 text-right font-semibold"
                  >{formatter.format(totalSgstAmount)}
                </td>
              {:else}
                <td class="border-r"></td>
                <td class="p-1 border-r border-gray-300 text-right font-semibold"
                  >{formatter.format(totalIgstAmount)}</td
                >
              {/if}
              <td class="p-1 border-r border-gray-300 text-right font-semibold"
                >{formatter.format(totalTaxAmount)}</td
              >
            </tr>
            <tr>
              <td colspan="5" class="border-r border-gray-300 p-1 text-left">
                <div class="flex gap-2">
                  <p class="font-semibold mb-2">Tax Amount (in words):</p>
                  <p>{toWords.convert(totalTaxAmount)}</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="border border-gray-300 p-3 text-xs">
      <div class="grid grid-cols-2">
        <div>
          <p class="font-semibold mb-2">Declaration</p>
          <p>Goods once sold will not be taken back</p>
          <p>
            I/we hereby certify that my/our Registration Certificate under the GST Act, 2017 is in
            force on the date on which the sale of the goods Sepcified in this Tax Invoice is made
            by me/us and that the transacton of sale Covered by this Tax Invoice has - been effected
            by me/us and it shall be accounted
          </p>
          <p>
            For in the turnover of sale whicle filling of return and the due tax, if any payable on
            the sale has been paid or shall be paid"
          </p>
        </div>
        <div class="flex flex-col justify-between items-end">
          <p class="font-semibold">for {sellerDetails.name}</p>
          <p class="mt-8">Authorised Signatory</p>
        </div>
      </div>
    </div>

    <p class="text-center text-xs mt-2">This is a Computer Generated Invoice</p>
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
