<script lang="ts">
  import { onMount } from 'svelte'
  import { toasts } from './Toast'
  import CompanyDialog from '$lib/company-dialog.svelte'

  let companies = $state([])
  let isModalOpen = $state(false)
  let selectedCompany = $state(null)

  onMount(async () => {
    loadCompanies()
  })

  async function loadCompanies(): Promise<void> {
    companies = await window.api.getCompanies()
  }

  function openModal(company = null) {
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
</script>

<div class="card p-6">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-semibold text-gray-800">Companies List</h2>
    <button
      class="btn btn-primary flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      onclick={() => openModal()}
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      Add Company
    </button>
  </div>

  <div class="overflow-hidden rounded-lg border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Name</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >GSTIN</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Address</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Actions</th
          >
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
              {company.address_line1}
              {#if company.address_line2}
                <br />{company.address_line2}
              {/if}
              <br />{company.city}, {company.state}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
              <button
                class="btn btn-secondary text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 rounded transition-colors"
                onclick={() => openModal(company)}
              >
                Edit
              </button>
              <button
                class="btn btn-danger text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                onclick={() => deleteCompany(company.id, company.name)}
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<CompanyDialog
  isOpen={isModalOpen}
  company={selectedCompany}
  onClose={() => (isModalOpen = false)}
  onSuccess={loadCompanies}
/>
