<script lang="ts">
  import { Router, type RouteConfig } from '@mateothegreat/svelte5-router'
  import Companies from './components/Companies.svelte'
  import CreateInvoice from './components/CreateInvoice.svelte'
  import InvoiceList from './components/InvoiceList.svelte'
  import InvoiceView from './components/InvoiceView.svelte'
  import { Toast } from './components/Toast'

  // Define routes
  const routes: RouteConfig = [
    { path: '/', component: InvoiceList },
    { path: '/companies', component: Companies },
    { path: '/create-invoice', component: CreateInvoice },
    { path: '/invoices', component: InvoiceList },
    { path: '/invoice/(?<id>.*)', component: InvoiceView }
  ]
</script>

<div class="min-h-screen bg-gray-100">
  <nav class="bg-white shadow-lg print:hidden">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex space-x-4 items-center">
          <a href="/" class="text-xl font-bold text-gray-800">Billing System</a>
          <a href="/companies" class="text-gray-600 hover:text-gray-800">Companies</a>
          <a href="/create-invoice" class="text-gray-600 hover:text-gray-800">Create Invoice</a>
          <a href="/invoices" class="text-gray-600 hover:text-gray-800">Invoices</a>
        </div>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto py-6 px-4">
    <Router {routes} />
  </main>
  <Toast />
</div>
