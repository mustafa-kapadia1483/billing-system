<script lang="ts">
  import { onMount } from 'svelte'
  import { formatter, toWords } from './../utils/formatting'
  import { ToWords } from 'to-words'
  import sellerDetails from '../config/seller.json'
  import upiqr from 'upiqr'
  import { toasts } from './Toast'

  let { route } = $props()
  let invoiceData = $state(null)

  onMount(async () => {
    if (route.result.path.params.id) {
      invoiceData = await window.api.getInvoiceDetails(parseInt(route.result.path.params.id))
    }
  })

  function printInvoice(): void {
    window.print()
  }

  async function downloadPDF(): void {
    const date = new Date(invoiceData.invoice.date).toISOString().split('T')[0]
    const downloadPath = await window.api.downloadPdf(
      `${invoiceData.invoice.name}-${invoiceData.invoice.invoice_number}-${date}.pdf`
    )
    toasts.success(`Invoice downloaded: ${downloadPath}`, 0)
  }

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

  let upiQrCode = $derived(
    upiqr({
      payeeVPA: sellerDetails.upiDetails.upi_id,
      payeeName: sellerDetails.upiDetails.payee_name,
      transactionNote: invoiceData && `Payment for Invoice No ${invoiceData.invoice.invoice_number}`
    })
  )
</script>

<div class="flex justify-center gap-4 mb-4 print:hidden">
  <button
    class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 action-button"
    onclick={downloadPDF}
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
    onclick={printInvoice}
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
    class="bg-white p-8 print:p-0 print:shadow-none w-[210mm] mx-auto text-sm"
  >
    <h1 class="text-xl font-bold mb-4">Tax Invoice</h1>

    <div class="grid grid-cols-[max-content_max-content] gap-2 text-xs mb-4">
      <p>Invoice No #</p>
      <p class="font-semibold">{invoiceData.invoice.invoice_number}</p>
      <p>Invoice Date</p>
      <p class="font-semibold">{new Date(invoiceData.invoice.date).toLocaleDateString('en-IN')}</p>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-4 w-full">
      <div class="border border-gray-300 p-3">
        <p class="font-semibold mb-2">Billed by</p>
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
      <div class="border border-gray-300 p-3 mb-6 h-full">
        <p class="font-semibold mb-2">Bill to</p>
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

    <div class="w-full mb-4">
      <table
        class="w-full border border-gray-300 border-collapse text-xs [&_*]:border [&_*]:border-gray-300"
      >
        <thead>
          <tr>
            <th class="p-2 text-left">Sr No.</th>
            <th class="p-2 text-left">Description of Goods</th>
            <th class="p-2 text-center">HSN/SAC</th>
            <th class="p-2 text-center">Quantity</th>
            <th class="p-2 text-right">Rate</th>
            <th class="p-2 text-center">per</th>
            <th class="p-2 text-center">Disc. %</th>
            <th class="p-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {#each invoiceData.items as item, index (item.id)}
            <tr>
              <td class="p-2">{index + 1}</td>
              <td class="p-2">{item.description}</td>
              <td class="p-2 text-center">{item.hsn_code || ''}</td>
              <td class="p-2 text-center">{item.quantity} No</td>
              <td class="p-2 text-right">{item.rate.toFixed(2)}</td>
              <td class="p-2 text-center">No</td>
              <td class="p-2 text-center">-</td>
              <td class="p-1 text-right">{item.amount.toFixed(2)}</td>
            </tr>
          {/each}
          {#if invoiceData.invoice?.state === sellerDetails.state}
            <tr class="bg-gray-50">
              <td></td>
              <td class="p-1 text-right">CGST</td>
              {#each Array.from({ length: 5 }) as _, i (i)}
                <td></td>
              {/each}
              <td class="p-1 text-right"
                >{invoiceData.items.reduce((sum, item) => sum + item.cgst_amount, 0).toFixed(2)}</td
              >
            </tr>
            <tr class="bg-gray-50">
              <td></td>
              <td class="p-1 border-r text-right">SGST</td>
              {#each Array.from({ length: 5 }) as _, i (i)}
                <td></td>
              {/each}

              <td class="p-1 text-right"
                >{invoiceData.items.reduce((sum, item) => sum + item.sgst_amount, 0).toFixed(2)}</td
              >
            </tr>
          {:else}
            <tr class="bg-gray-50">
              <td></td>
              <td class="p-1 text-right">IGST</td>
              {#each Array.from({ length: 5 }) as _, i (i)}
                <td></td>
              {/each}
              <td class="p-1 text-right"
                >{invoiceData.items.reduce((sum, item) => sum + item.igst_amount, 0).toFixed(2)}</td
              >
            </tr>
          {/if}
          <tr>
            <td colspan="7" class="p-2 text-right font-semibold">Total</td>
            <td class="p-1 text-right font-semibold">
              {formatter.format(
                invoiceData.items.reduce((sum, item) => {
                  return (
                    sum + item.amount + (item.cgst_amount + item.sgst_amount + item.igst_amount)
                  )
                }, 0)
              )}
            </td>
          </tr>
          <tr>
            <td colspan="7" class="p-2 text-left">
              <div class="flex gap-2 border-none">
                <p class="font-semibold mb-2 border-none">Amount Chargeable (in words):</p>
                <p class="border-none">
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
    </div>

    <div class="w-full mb-4">
      <table class="border w-full border-gray-300 text-xs [&_*]:border [&_*]:border-gray-300">
        <thead>
          <tr>
            <th class="p-1">HSN/SAC</th>
            <th class="p-1">Taxable Value</th>
            {#if invoiceData.invoice?.state === sellerDetails.state}
              <th colspan="2" class="p-1 text-center">CGST</th>
              <th colspan="2" class="p-1 text-center">SGST/UTGST</th>
            {:else}
              <th colspan="2" class="p-1 text-center">IGST</th>
            {/if}
            <th class="p-1">Total Tax Amount</th>
          </tr>
        </thead>
        <tbody>
          {#each invoiceData.items as item (item.id)}
            <tr>
              <td class="p-1 text-center">{item.hsn_code || ''}</td>
              <td class="p-1 text-right">{item.amount.toFixed(2)}</td>
              {#if invoiceData.invoice?.state === sellerDetails.state}
                <td class="p-1 text-center">{item.tax_rate / 2}%</td>
                <td class="p-1 text-right">{item.cgst_amount.toFixed(2)}</td>
                <td class="p-1 text-center">{item.tax_rate / 2}%</td>
                <td class="p-1 text-right">{item.sgst_amount.toFixed(2)}</td>
                <td class="p-1 text-right">{(item.cgst_amount + item.sgst_amount).toFixed(2)}</td>
              {:else}
                <td class="p-1 text-center">{item.tax_rate}%</td>
                <td class="p-1 text-right">{item.igst_amount.toFixed(2)}</td>
                <td class="p-1 text-right">{item.igst_amount.toFixed(2)}</td>
              {/if}
            </tr>
          {/each}
          <tr>
            <td class="p-1 text-right font-semibold"> Total </td>
            <td class="p-1 text-right font-semibold"
              >{formatter.format(invoiceData.invoice.total_amount)}</td
            >
            {#if invoiceData.invoice?.state === sellerDetails.state}
              <td class="border-r"></td>
              <td class="p-1 text-right font-semibold">{formatter.format(totalCgstAmount)} </td>
              <td class="border-r"></td>
              <td class="p-1 text-right font-semibold">{formatter.format(totalSgstAmount)} </td>
            {:else}
              <td class="border-r"></td>
              <td class="p-1 text-right font-semibold">{formatter.format(totalIgstAmount)}</td>
            {/if}
            <td class="p-1 text-right font-semibold">{formatter.format(totalTaxAmount)}</td>
          </tr>
          <tr>
            <td colspan="7" class="p-1 text-left">
              <div class="flex gap-2 border-none">
                <p class="font-semibold mb-2 border-none">Tax Amount (in words):</p>
                <p class="border-none">{toWords.convert(totalTaxAmount)}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="border border-gray-300 text-xs">
      <div class="grid grid-cols-3 gap-3">
        <div class="p-3 border-r border-gray-300">
          <p class="font-semibold mb-2">Declaration</p>
          <p class="text-[0.6rem]">
            Goods once sold will not be taken back
            <br />
            I/we hereby certify that my/our Registration Certificate under the GST Act, 2017 is in force
            on the date on which the sale of the goods Sepcified in this Tax Invoice is made by me/us
            and that the transacton of sale Covered by this Tax Invoice has - been effected by me/us
            and it shall be accounted
            <br />
            For in the turnover of sale whicle filling of return and the due tax, if any payable on the
            sale has been paid or shall be paid"
          </p>
        </div>
        <div class="p-3">
          <p class="font-semibold mb-2">Bank Details:</p>
          <ol class="appearance-none space-y-3">
            <li class="flex gap-1">
              <p class="font-semibold">Account Name:</p>
              <p>{sellerDetails.bankDetails.account_name}</p>
            </li>
            <li class="flex gap-1">
              <p class="font-semibold">Account Number:</p>
              <p>{sellerDetails.bankDetails.account_number}</p>
            </li>
            <li class="flex gap-1">
              <p class="font-semibold">IFSC:</p>
              <p>{sellerDetails.bankDetails.ifsc_code}</p>
            </li>
            <li class="flex gap-1">
              <p class="font-semibold">Account Type:</p>
              <p>{sellerDetails.bankDetails.type}</p>
            </li>
            <li class="flex gap-1">
              <p class="font-semibold">Bank:</p>
              <p>{sellerDetails.bankDetails.name}</p>
            </li>
          </ol>
        </div>
        <div>
          <div class="p-3 flex flex-col items-center">
            <p class="font-semibold text-center">Scan to Pay via UPI</p>
            {#await upiQrCode}
              <p>Generating QR Code</p>
            {:then upiQrCode}
              <img src={upiQrCode.qr} class="max-w-40" alt="upi qr code scanner" />
            {/await}
          </div>
          <div class="border border-r-0 border-gray-300 max-w-72 ml-auto p-2">
            <p class="font-semibold">for {sellerDetails.name}</p>
            <p class="mt-8">Authorised Signatory</p>
          </div>
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
