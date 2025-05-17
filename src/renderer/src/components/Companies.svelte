<script lang="ts">
  import { onMount } from 'svelte'
  import { toasts } from './Toast'
  import StateSelect from '$lib/state-select.svelte'

  let companies = $state([])
  let isModalOpen = $state(false)
  let isEditMode = $state(false)
  let formData = $state({
    id: null,
    name: '',
    gstin: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: ''
  })

  onMount(async () => {
    loadCompanies()
  })

  async function loadCompanies(): Promise<void> {
    companies = await window.api.getCompanies()
  }

  function openModal(company = null) {
    isEditMode = !!company
    formData = company
      ? { ...company }
      : {
          id: null,
          name: '',
          gstin: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: ''
        }
    isModalOpen = true
  }

  function closeModal() {
    isModalOpen = false
    formData = {
      id: null,
      name: '',
      gstin: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: ''
    }
  }

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault()
    try {
      const jsonData = JSON.stringify(formData)
      if (isEditMode) {
        await window.api.editCompany(formData.id, JSON.parse(jsonData))
        toasts.success(`Company ${formData.name} updated successfully`)
      } else {
        await window.api.createCompany(JSON.parse(jsonData))
        toasts.success(`Company ${formData.name} created successfully`)
      }
      await loadCompanies()
      closeModal()
    } catch (error) {
      toasts.error(error.message)
    }
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

{#if isModalOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-800">
          {isEditMode ? 'Edit' : 'Add New'} Company
        </h3>
        <button class="text-gray-400 hover:text-gray-500 focus:outline-none" onclick={closeModal}>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onsubmit={handleSubmit} class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="group">
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1"
              >Company Name</label
            >
            <input
              type="text"
              id="name"
              bind:value={formData.name}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="group">
            <label for="gstin" class="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
            <input
              type="text"
              id="gstin"
              bind:value={formData.gstin}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono uppercase"
              required
            />
          </div>
        </div>

        <div class="space-y-4">
          <div class="group">
            <label for="address1" class="block text-sm font-medium text-gray-700 mb-1"
              >Address Line 1</label
            >
            <input
              type="text"
              id="address1"
              bind:value={formData.address_line1}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="group">
            <label for="address2" class="block text-sm font-medium text-gray-700 mb-1"
              >Address Line 2</label
            >
            <input
              type="text"
              id="address2"
              bind:value={formData.address_line2}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="group">
            <label for="city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="city"
              bind:value={formData.city}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="group">
            <label for="state" class="block text-sm font-medium text-gray-700 mb-1">State</label>
            <StateSelect id="state" bind:value={formData.state} required />
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onclick={closeModal}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {isEditMode ? 'Save Changes' : 'Add Company'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
