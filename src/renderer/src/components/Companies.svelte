<script lang="ts">
  import { onMount } from 'svelte'
  import { toasts } from './Toast'
  import StateSelect from '$lib/state-select.svelte'

  let companies = $state([])
  let editingCompany = $state(null)
  let isEditModalOpen = $state(false)
  let newCompany = $state({
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

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault()
    await window.api.createCompany({ ...newCompany })
    await loadCompanies()
    toasts.success(`Company ${newCompany.name} created successfully`)
    newCompany = {
      name: '',
      gstin: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: ''
    }
  }

  function openEditModal(company) {
    editingCompany = { ...company }
    isEditModalOpen = true
  }

  function closeEditModal() {
    editingCompany = null
    isEditModalOpen = false
  }

  async function handleEdit(e: Event): Promise<void> {
    e.preventDefault()
    await window.api.editCompany(editingCompany.id, $state.snapshot(editingCompany))
    await loadCompanies()
    toasts.success(`Company ${editingCompany.name} updated successfully`)
    closeEditModal()
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

<div class="grid gap-6">
  <div class="card p-6">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
      <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
      Add New Company
    </h2>
    <form onsubmit={handleSubmit} class="space-y-6">
      <div class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="group">
            <label for="name" class="block text-sm font-semibold text-gray-800 mb-1.5"
              >Company Name</label
            >
            <input
              type="text"
              id="name"
              bind:value={newCompany.name}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="group">
            <label for="gstin" class="block text-sm font-semibold text-gray-800 mb-1.5">GSTIN</label
            >
            <input
              type="text"
              id="gstin"
              bind:value={newCompany.gstin}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono uppercase"
              required
            />
          </div>
        </div>

        <div class="group">
          <label for="address_line1" class="block text-sm font-semibold text-gray-800 mb-1.5"
            >Address Line 1</label
          >
          <input
            type="text"
            id="address_line1"
            bind:value={newCompany.address_line1}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            required
          />
        </div>
        <div class="group">
          <label for="address_line2" class="block text-sm font-semibold text-gray-800 mb-1.5"
            >Address Line 2</label
          >
          <input
            type="text"
            id="address_line2"
            bind:value={newCompany.address_line2}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="group">
            <label for="city" class="block text-sm font-semibold text-gray-800 mb-1.5">City</label>
            <input
              type="text"
              id="city"
              bind:value={newCompany.city}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <!-- Replace the state select in the new company form -->
          <div class="group">
            <label for="state" class="block text-sm font-semibold text-gray-800 mb-1.5">State</label
            >
            <StateSelect id="state" bind:value={newCompany.state} required />
          </div>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Add Company</button>
    </form>
  </div>

  <div class="card p-6">
    <h2 class="text-2xl font-semibold mb-4">Companies List</h2>
    <div class="table-container">
      <table class="table">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >Name</th
            >
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >GSTIN</th
            >
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >Address</th
            >
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >Actions</th
            >
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          {#each companies as company (company.id)}
            <tr>
              <td class="px-6 py-4 whitespace-nowrap">{company.name}</td>
              <td class="px-6 py-4 whitespace-nowrap">{company.gstin}</td>
              <td class="px-6 py-4">
                {company.address_line1}
                {#if company.address_line2}
                  <br />{company.address_line2}
                {/if}
                <br />{company.city}, {company.state}
              </td>
              <td class="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  class="btn btn-secondary text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 rounded transition-colors"
                  onclick={() => openEditModal(company)}
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
</div>

{#if isEditModalOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-800">Edit Company</h3>
        <button
          class="text-gray-400 hover:text-gray-500 focus:outline-none"
          onclick={closeEditModal}
        >
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

      <form onsubmit={handleEdit} class="p-6 space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="group">
            <label for="edit-name" class="block text-sm font-medium text-gray-700 mb-1"
              >Company Name</label
            >
            <input
              type="text"
              id="edit-name"
              bind:value={editingCompany.name}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="group">
            <label for="edit-gstin" class="block text-sm font-medium text-gray-700 mb-1"
              >GSTIN</label
            >
            <input
              type="text"
              id="edit-gstin"
              bind:value={editingCompany.gstin}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono uppercase"
              required
            />
          </div>
        </div>

        <div class="space-y-4">
          <div class="group">
            <label for="edit-address1" class="block text-sm font-medium text-gray-700 mb-1"
              >Address Line 1</label
            >
            <input
              type="text"
              id="edit-address1"
              bind:value={editingCompany.address_line1}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="group">
            <label for="edit-address2" class="block text-sm font-medium text-gray-700 mb-1"
              >Address Line 2</label
            >
            <input
              type="text"
              id="edit-address2"
              bind:value={editingCompany.address_line2}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="group">
            <label for="edit-city" class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              id="edit-city"
              bind:value={editingCompany.city}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              required
            />
          </div>
          <div class="group">
            <label for="edit-state" class="block text-sm font-medium text-gray-700 mb-1"
              >State</label
            >
            <StateSelect id="edit-state" bind:value={editingCompany.state} required disabled />
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onclick={closeEditModal}
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
