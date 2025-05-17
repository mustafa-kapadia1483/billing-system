<script lang="ts">
  import { route, RouteOptions, Router, type RouteConfig } from '@mateothegreat/svelte5-router'
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

  // Define route options with consistent sizing and padding
  const options = new RouteOptions()
  if (!options.active) {
    options.active = {
      class: ['active', 'font-medium']
    }
  }
  if (!options.default) {
    options.default = {
      class: [
        'inactive',
        'text-gray-600',
        'hover:text-gray-900',
        'border-transparent',
        'hover:border-gray-300'
      ]
    }
  }
  if (!options.loading) {
    options.loading = {
      class: ['loading', 'bg-blue-100', 'text-blue-600', 'animate-pulse']
    }
  }
  if (!options.disabled) {
    options.disabled = {
      class: ['disabled', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed']
    }
  }

  if (!options.active.class) {
    options.active.class = ['active', 'font-medium', 'shadow-sm']
  }

  if (!options.default.class) {
    options.default.class = [
      'inactive',
      'text-gray-600',
      'hover:text-gray-900',
      'border-transparent',
      'hover:border-gray-300'
    ]
  }
  if (!options.loading.class) {
    options.loading.class = ['loading', 'bg-blue-100', 'text-blue-600', 'animate-pulse']
  }
  if (!options.disabled.class) {
    options.disabled.class = ['disabled', 'bg-gray-100', 'text-gray-400', 'cursor-not-allowed']
  }
</script>

<div class="min-h-screen bg-gray-100">
  <nav class="bg-white shadow-lg print:hidden">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex justify-between h-16">
        <div class="flex space-x-6 items-center">
          <a href="/" class="text-xl font-bold text-gray-800 py-2">Billing System</a>
          <a
            use:route={options}
            href="/companies"
            class="transition-all duration-200 ease-in-out px-3 py-2">Companies</a
          >
          <a
            use:route={options}
            href="/create-invoice"
            class="transition-all duration-200 ease-in-out px-3 py-2">Create Invoice</a
          >
          <a
            use:route={options}
            href="/invoices"
            class="transition-all duration-200 ease-in-out px-3 py-2">Invoices</a
          >
        </div>
      </div>
    </div>
  </nav>

  <main class="max-w-7xl mx-auto py-6 px-4">
    <Router {routes} />
  </main>
  <Toast />
</div>
