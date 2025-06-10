<script lang="ts">
  import { onMount } from 'svelte'
  import { formatter, toWords } from '$lib/utils/formatting'
  import sellerDetails from '../config/seller.json'
  import upiqr from 'upiqr'
  import { toasts } from '$lib/Toast'
  import Button from '$lib/Button.svelte'
  import ToggleButton from '$lib/toggle-button.svelte'
  import CompanyLogo from '$lib/company-logo.svelte'
  import { Printer, Download } from '$lib/icons'
  import { useRoute } from '@dvcol/svelte-simple-router'

  let invoiceData = $state(null)
  let performaInvoice = $state(false)

  const { route, location, routing } = $derived(useRoute())

  const reactiveRoute = $derived(route)
  const reactiveLocation = $derived(location)
  const reactiveRoutingState = $derived(routing)

  const pathParams = $derived(location.params)

  onMount(async () => {
    invoiceData = await window.api.getInvoiceDetails(parseInt(pathParams.id))
  })

  function printInvoice(): void {
    window.print()
  }

  async function downloadPDF(): Promise<void> {
    const downloadPath = await window.api.downloadPdf(pageTitle)
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

  let discountPresent = $derived(
    invoiceData.items?.reduce((acc, item) => acc + item.discount, 0) > 0
  )

  let upiQrCode = $derived(
    upiqr({
      payeeVPA: sellerDetails.upiDetails.upi_id,
      payeeName: sellerDetails.upiDetails.payee_name,
      transactionNote: invoiceData && `Payment for Invoice No ${invoiceData.invoice.invoice_number}`
    })
  )

  let invoiceTitle = $derived(performaInvoice ? 'Performa Invoice' : 'Tax Invoice')
  let pageTitle = $derived.by(() => {
    if (invoiceData) {
      const date = new Date(invoiceData.invoice.date).toISOString().split('T')[0]
      return `${invoiceTitle.toLowerCase().split(' ').join('_')}-${invoiceData.invoice.name}-${invoiceData.invoice.invoice_number}-${date}.pdf`
    }
  })
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="flex justify-between gap-4 mb-4 print:hidden max-w-[210mm] mx-auto">
  <ToggleButton
    bind:checked={performaInvoice}
    disabled={!invoiceData}
    label="Performa Invoice"
    labelPosition="right"
  />

  <div class="flex items-center gap-4">
    <Button size="sm" class="flex items-center gap-1" onclick={downloadPDF}>
      <Download />
      Download PDF
    </Button>
    <Button class="flex items-center gap-1" variant="secondary" onclick={printInvoice}>
      <Printer />
      Print
    </Button>
  </div>
</div>
{#if invoiceData}
  <div
    id="invoice-content"
    class="bg-white p-8 print:p-0 print:shadow-none max-w-[210mm] mx-auto text-sm"
  >
    <div class="bg-white p-2 mb-4 relative">
      <div class="w-[100px] p-3 absolute left-0 top-1/2 -translate-y-1/2">
        <CompanyLogo />
      </div>
      <div class="w-[100px] p-3 absolute right-0 top-1/2 -translate-y-1/2">
        <CompanyLogo />
      </div>
      <p class="text-sm text-gray-600 leading-relaxed space-y-1 text-center">
        <span class="font-bold text-brand block text-3xl">{sellerDetails.name}</span>
        <span class=" text-gray-800 block text-xs">{sellerDetails.address}</span>
        <span class=" text-gray-800 block text-xs">
          {sellerDetails.address2}
        </span>
        <span class="text-gray-700 inline-flex items-center justify-end gap-2 mt-2 text-xs">
          <span class="text-gray-500">GSTIN/UIN:</span>
          <span class="font-medium text-gray-800">{sellerDetails.gstin}</span>
        </span>
        <span class="inline-block ml-2 pl-2 border-l border-gray-200 text-xs">
          <span class="text-gray-500">State:</span>
          <span class="font-medium text-gray-800 ml-1">{sellerDetails.state}</span>
        </span>
      </p>
    </div>
    <div class="flex justify-between items-center mb-4 p-2 border border-gray-300">
      <h1 class="text-2xl font-bold text-gray-800">{invoiceTitle}</h1>
      <div class="flex gap-6 text-gray-600">
        <div class="flex items-center gap-2">
          <p class="text-sm">Invoice No</p>
          <p class="font-semibold text-gray-800">#{invoiceData.invoice.invoice_number}</p>
        </div>
        <div class="flex items-center gap-2">
          <p class="text-sm">Invoice Date</p>
          <p class="font-semibold text-gray-800">
            {new Date(invoiceData.invoice.date).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 w-full mb-4">
      <div class="border border-gray-300 p-3 h-full">
        <p class="font-semibold mb-2">Bill to</p>
        <p class="font-bold mb-1">{invoiceData.invoice.name}</p>
        <p class="text-xs leading-relaxed">
          {invoiceData.invoice.address}<br />
          {invoiceData.invoice.city} - {invoiceData.invoice.postal_code}<br />
          GSTIN/UIN: {invoiceData.invoice.gstin}<br />
          State Name: {invoiceData.invoice.state}
        </p>
      </div>
      <div class="border border-gray-300 p-3">
        <p class="font-semibold mb-2">Ship To</p>
        <p class="font-bold mb-1">{invoiceData.invoice.ship_to_name}</p>
        <p class="text-xs leading-relaxed">
          {invoiceData.invoice.ship_to_address}<br />
          {invoiceData.invoice.ship_to_city} - {invoiceData.invoice.ship_to_postal_code}<br />
          GSTIN/UIN: {invoiceData.invoice.gstin}<br />
          State Name: {invoiceData.invoice.ship_to_state}
        </p>
      </div>
    </div>

    <div class="w-full mb-4">
      <table
        class="w-full border border-gray-300 border-collapse text-xs [&_*]:border [&_*]:border-gray-300"
      >
        <thead>
          <tr>
            <th class="p-1 text-left">Sr No.</th>
            <th class="p-1 text-left">Description of Goods</th>
            <th class="p-1 text-center">HSN/SAC</th>
            <th class="p-1 text-center">Quantity</th>
            <th class="p-1 text-right">Rate</th>
            <th class="p-1 text-center">per</th>
            {#if discountPresent}
              <th class="p-1 text-center">Disc. %</th>
            {/if}
            <th class="p-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {#each invoiceData.items as item, index (item.id)}
            <tr>
              <td class="p-1">{index + 1}</td>
              <td class="p-1">{item.description}</td>
              <td class="p-1 text-center">{item.hsn_code || ''}</td>
              <td class="p-1 text-center">{item.quantity} {item.per}</td>
              <td class="p-1 text-right">{item.rate.toFixed(2)}</td>
              <td class="p-1 text-center">{item.per}</td>
              {#if discountPresent}
                <td class="p-1 text-center">{item.discount} %</td>
              {/if}
              <td class="p-1 text-right">{item.amount.toFixed(2)}</td>
            </tr>
          {/each}
          {#if invoiceData.invoice?.state === sellerDetails.state}
            <tr class="bg-gray-50">
              <td></td>
              <td class="p-1 text-right">CGST</td>
              {#each Array.from({ length: discountPresent ? 5 : 4 }) as _, i (i)}
                <td></td>
              {/each}
              <td class="p-1 text-right"
                >{invoiceData.items.reduce((sum, item) => sum + item.cgst_amount, 0).toFixed(2)}</td
              >
            </tr>
            <tr class="bg-gray-50">
              <td></td>
              <td class="p-1 border-r text-right">SGST</td>
              {#each Array.from({ length: discountPresent ? 5 : 4 }) as _, i (i)}
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
              {#each Array.from({ length: { length: discountPresent ? 5 : 4 } }) as _, i (i)}
                <td></td>
              {/each}
              <td class="p-1 text-right"
                >{invoiceData.items.reduce((sum, item) => sum + item.igst_amount, 0).toFixed(2)}</td
              >
            </tr>
          {/if}
          <tr>
            <td colspan={discountPresent ? 7 : 6} class="p-1 text-right font-semibold">Total</td>
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
            <td colspan={discountPresent ? 7 : 6} class="p-1 text-left">
              <p class="border-none">
                <span class="font-semibold border-none">Amount Chargeable (in words):</span>
                {toWords.convert(
                  invoiceData.items.reduce((sum, item) => {
                    return (
                      sum + item.amount + (item.cgst_amount + item.sgst_amount + item.igst_amount)
                    )
                  }, 0)
                )}
              </p>
            </td>
            <td class="p-1 text-right font-semibold">E. & O.E</td>
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
              <p class="border-none">
                <span class="font-semibold border-none">Tax Amount (in words):</span>
                {toWords.convert(totalTaxAmount)}
              </p>
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
          <div class="border border-r-0 border-gray-300 max-w-72 ml-auto p-1">
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
      margin: 0cm;
      size: A4;
    }
  }
</style>
