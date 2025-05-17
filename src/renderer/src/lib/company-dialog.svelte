<script lang="ts">
  import StateSelect from './state-select.svelte'
  import { toasts } from '../components/Toast'

  interface Props {
    isOpen: boolean
    company: null | object
    onClose: () => void
    onSuccess: () => void
  }

  let { isOpen, company, onClose, onSuccess }: Props = $props()

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

  $effect(() => {
    if (isOpen) {
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
    }
  })

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
      onSuccess()
      closeModal()
    } catch (error) {
      toasts.error(error.message)
    }
  }

  function closeModal() {
    formData = {
      id: null,
      name: '',
      gstin: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: ''
    }
    onClose()
  }
</script>

{#if isOpen}
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

        <div class="group">
          <label for="address_line1" class="block text-sm font-medium text-gray-700 mb-1"
            >Address Line 1</label
          >
          <input
            type="text"
            id="address_line1"
            bind:value={formData.address_line1}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div class="group">
          <label for="address_line2" class="block text-sm font-medium text-gray-700 mb-1"
            >Address Line 2 (Optional)</label
          >
          <input
            type="text"
            id="address_line2"
            bind:value={formData.address_line2}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
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
            <StateSelect bind:value={formData.state} required id="state" disabled={isEditMode} />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onclick={closeModal}
            class="btn btn-secondary px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {isEditMode ? 'Save Changes' : 'Create Company'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
