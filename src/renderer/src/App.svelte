<script lang="ts">
  import { RouterContext, RouterView, link, active } from '@dvcol/svelte-simple-router'
  import type { Route, RouterOptions } from '@dvcol/svelte-simple-router'
  import Companies from './components/Companies.svelte'
  import CreateInvoice from './components/CreateInvoice.svelte'
  import InvoiceList from './components/InvoiceList.svelte'
  import InvoiceView from './components/InvoiceView.svelte'
  import { Toast } from '$lib/Toast'
  import Inventory from './components/Inventory.svelte'
  import '@fontsource-variable/montserrat'
  import { fade } from 'svelte/transition'

  const RouteName = {
    Home: 'home',
    Invoices: 'invoices',
    CreateInvoice: 'create-invoice',
    Companies: 'companies',
    Inventory: 'inventory',
    InvoiceView: 'invoice-view'
  } as const

  type RouteNames = (typeof RouteName)[keyof typeof RouteName]

  const routes: Readonly<Route<RouteNames>[]> = [
    { name: RouteName.Home, path: '/', redirect: { name: RouteName.Invoices } },
    { name: RouteName.Invoices, path: `/${RouteName.Invoices}`, component: InvoiceList },
    {
      name: RouteName.CreateInvoice,
      path: `/${RouteName.CreateInvoice}`,
      component: CreateInvoice
    },
    { name: RouteName.Companies, path: '/companies', component: Companies },
    { name: RouteName.Inventory, path: '/inventory', component: Inventory },
    { name: RouteName.InvoiceView, path: '/invoice/:id', component: InvoiceView }
  ]

  const options: RouterOptions<RouteNames> = {
    routes,
    active: {
      class: ['active', 'font-medium', 'shadow-sm']
    }
  }
</script>

<svelte:head>
  <title>Billing System</title>
</svelte:head>

<RouterContext {options}>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow-lg print:hidden">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <div class="flex space-x-6 items-center">
            <a href="/" class="text-xl font-bold text-brand py-2" use:link>Billing System</a>
            <a
              href={`/${RouteName.Invoices}`}
              class="transition-all duration-200 ease-in-out px-3 py-2 data-[active]:font-bold"
              use:link
              use:active
            >
              Invoices
            </a>
            <a
              href={`/${RouteName.CreateInvoice}?id=null&edit=false`}
              class="transition-all duration-200 ease-in-out px-3 py-2 data-[active]:font-bold"
              use:link
              use:active={{ name: RouteName.CreateInvoice }}
            >
              Create Invoice
            </a>
            <a
              href={`/${RouteName.Companies}`}
              class="transition-all duration-200 ease-in-out px-3 py-2 data-[active]:font-bold"
              use:link
              use:active
            >
              Companies
            </a>
            <a
              href={`/${RouteName.Inventory}`}
              class="transition-all duration-200 ease-in-out px-3 py-2 data-[active]:font-bold"
              use:link
              use:active
            >
              Inventory
            </a>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 px-4">
      <RouterView transition={{ in: fade }} />
    </main>
    <Toast />
  </div>
</RouterContext>
