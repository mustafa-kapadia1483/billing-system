<script lang="ts">
  import { onMount } from 'svelte'
  import { toasts } from '$lib/Toast'
  import CompanyDialog from '$lib/company-dialog.svelte'
  import Button from '$lib/Button.svelte'
  import StateSelect from '$lib/state-select.svelte'
  import { Edit, Trashcan, Plus } from '$lib/icons'

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | undefined

    return function (...args: Parameters<T>): void {
      const later = () => {
        timeoutId = undefined
        func.apply(this, args)
      }

      clearTimeout(timeoutId)
      timeoutId = setTimeout(later, wait)
    }
  }

  let companies = $state([])
  let isModalOpen = $state(false)
  let selectedCompany = $state(null)
  let isFilterOpen = $state(false)

  // Filter states
  let filters = $state({
    name: '',
    gstin: '',
    state: '',
    city: '',
    sortBy: 'name',
    sortOrder: 'asc',
    limit: 10,
    offset: 0
  })

  onMount(async () => {
    await loadCompanies()
  })

  const debouncedLoadCompanies = debounce(loadCompanies, 300)

  async function loadCompanies(): Promise<void> {
    try {
      companies = await window.api.getCompanies($state.snapshot(filters))
    } catch (error) {
      console.log(error)
      toasts.error('Failed to load companies')
    }
  }

  function openModal(company = null): void {
    selectedCompany = company
    isModalOpen = true
  }

  async function deleteCompany(id: number, name: string): Promise<void> {
    try {
      await window.api.deleteCompany(id)
      toasts.info(`Company ${name} deleted successfully`)
      await loadCompanies()
    } catch (error) {
      toasts.error(error.message)
    }
  }

  function resetFilters(): void {
    filters = {
      name: '',
      gstin: '',
      state: '',
      city: '',
      sortBy: 'name',
      sortOrder: 'asc',
      limit: 10,
      offset: 0
    }
    loadCompanies()
  }

  function handleFilterChange(): void {
    filters.offset = 0 // Reset pagination when filters change
    debouncedLoadCompanies()
  }

  function loadMore(): void {
    filters.offset += filters.limit
    loadCompanies()
  }
</script>

<svelte:head>
  <title>Companies</title>
</svelte:head>

<div class="space-y-6">
  <div class="card p-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-semibold text-gray-800">Companies List</h2>
        <button
          class="text-brand-600 hover:text-brand-700 flex items-center gap-1 text-sm font-medium"
          onclick={() => (isFilterOpen = !isFilterOpen)}
        >
          <svg
            class="w-5 h-5 transition-transform duration-200 {isFilterOpen ? 'rotate-180' : ''}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          Filters
        </button>
      </div>
      <Button variant="primary" onclick={() => openModal()} class="flex items-center gap-2">
        <Plus />
        Add Company
      </Button>
    </div>

    {#if isFilterOpen}
      <div
        class="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700" for="name">Company Name</label>
            <input
              type="text"
              id="name"
              bind:value={filters.name}
              oninput={handleFilterChange}
              class="input w-full rounded-md border-gray-300 shadow-xs focus:border-brand-500 focus:ring-brand-500"
              placeholder="Search by name"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700" for="gstin">GSTIN</label>
            <input
              type="text"
              id="gstin"
              bind:value={filters.gstin}
              oninput={handleFilterChange}
              class="input w-full rounded-md border-gray-300 shadow-xs focus:border-brand-500 focus:ring-brand-500"
              placeholder="Search by GSTIN"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700" for="state">State</label>
            <StateSelect
              class="bg-white"
              bind:value={filters.state}
              onchange={handleFilterChange}
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700" for="city">City</label>
            <input
              type="text"
              id="city"
              bind:value={filters.city}
              oninput={handleFilterChange}
              class="input w-full rounded-md border-gray-300 shadow-xs focus:border-brand-500 focus:ring-brand-500"
              placeholder="Filter by city"
            />
          </div>
        </div>

        <div class="flex justify-between mt-4">
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700" for="sortBy">Sort by</label>
              <select
                id="sortBy"
                bind:value={filters.sortBy}
                onchange={handleFilterChange}
                class="input w-max rounded-md border-gray-300 shadow-xs focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="name">Name</option>
                <option value="gstin">GSTIN</option>
                <option value="state">State</option>
                <option value="city">City</option>
              </select>
            </div>

            <div class="flex items-center gap-2">
              <label class="text-sm font-medium text-gray-700" for="sortOrder">Order</label>
              <select
                id="sortOrder"
                bind:value={filters.sortOrder}
                onchange={handleFilterChange}
                class="input rounded-md border-gray-300 shadow-xs focus:border-brand-500 focus:ring-brand-500"
              >
                <option value="asc">ASC</option>
                <option value="desc">DES</option>
              </select>
            </div>
          </div>

          <Button variant="secondary" onclick={resetFilters} class="text-sm">Reset Filters</Button>
        </div>
      </div>
    {/if}

    <div class="overflow-hidden rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Name
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              GSTIN
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >Address
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each companies as company (company.id)}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{company.name}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900"
                >{company.gstin}</td
              >
              <td class="px-6 py-4 text-sm text-gray-900">
                {company.address}
                <br />{company.city} - {company.postal_code}, {company.state}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onclick={() => openModal(company)}
                  title="Edit"
                >
                  <Edit />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onclick={() => deleteCompany(company.id, company.name)}
                  title="Delete"
                >
                  <Trashcan />
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    {#if companies.length >= filters.limit}
      <div class="mt-4 flex justify-center">
        <Button variant="secondary" onclick={loadMore} class="text-sm">Load More</Button>
      </div>
    {/if}
  </div>
</div>

<CompanyDialog
  isOpen={isModalOpen}
  company={selectedCompany}
  onClose={() => (isModalOpen = false)}
  onSuccess={loadCompanies}
/>
