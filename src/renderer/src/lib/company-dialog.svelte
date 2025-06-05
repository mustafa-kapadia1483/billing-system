<script lang="ts">
  import StateSelect from './state-select.svelte'
  import { toasts } from '$lib/Toast'
  import Button from '$lib/Button.svelte'
  import { MagnifyGlass, Cross } from '$lib/icons'

  interface Props {
    isOpen: boolean
    company: null | object
    onClose: () => void
    onSuccess: (companyId: null | number) => void
  }

  let { isOpen, company, onClose, onSuccess }: Props = $props()

  let isEditMode = $state(false)
  let showCaptchaModal = $state(false)
  let captchaImage = $state('')
  let captchaCookie = $state('')
  let captchaInput = $state('')

  let formData = $state({
    id: null,
    name: '',
    gstin: '',
    address: '',
    postal_code: '',
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
            address: '',
            postal_code: '',
            city: '',
            state: ''
          }
    }
  })

  async function handleSubmit(e: Event): Promise<void> {
    e.preventDefault()
    let companyId = null
    try {
      const jsonData = JSON.stringify(formData)
      if (isEditMode) {
        await window.api.editCompany(formData.id, JSON.parse(jsonData))
        toasts.success(`Company ${formData.name} updated successfully`)
      } else {
        companyId = await window.api.createCompany(JSON.parse(jsonData))
        toasts.success(`Company ${formData.name} created successfully`)
      }
      onSuccess(companyId)
      closeModal()
    } catch (error) {
      toasts.error(error.message)
    }
  }

  function closeModal(): void {
    formData = {
      id: null,
      name: '',
      gstin: '',
      address: '',
      postal_code: '',
      city: '',
      state: ''
    }
    onClose()
  }

  async function handleFetchGst(): Promise<void> {
    try {
      const captchaResponse = await window.api.getGstCaptcha()
      if (captchaResponse.code === 200) {
        captchaImage = captchaResponse.data.captcha_image
        captchaCookie = captchaResponse.data.captcha_cookie
        showCaptchaModal = true
      }
    } catch (error) {
      toasts.error('Failed to fetch captcha')
    }
  }

  async function handleCaptchaSubmit(): Promise<void> {
    try {
      const response = await window.api.fetchGstDetails(formData.gstin, captchaInput, captchaCookie)
      console.log(response)
      if (response.code === 200 && response.data) {
        formData = {
          ...formData,
          name: response.data.tradeName,
          address: response.data.address,
          city: response.data.address.split(',').at(-3).trim(),
          postal_code: response.data.address.split(',').at(-1).trim(),
          state: response.data.address.split(',').at(-2).trim()
        }
        showCaptchaModal = false
        captchaInput = ''
      } else {
        toasts.error(response.error_description || 'Failed to fetch GST details')
        if (response.code === 400) {
          handleFetchGst()
        }
      }
    } catch (error) {
      toasts.error('Failed to fetch GST details')
    }
  }

  function closeCaptchaModal(): void {
    showCaptchaModal = false
    captchaInput = ''
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
          <Cross />
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
          <div class="group relative">
            <label for="gstin" class="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
            <div class="relative">
              <input
                type="text"
                id="gstin"
                bind:value={formData.gstin}
                onchange={() => (formData.gstin = formData.gstin.toUpperCase())}
                class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors font-mono uppercase pr-10"
                required
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onclick={handleFetchGst}
              >
                <MagnifyGlass />
              </button>
            </div>
          </div>
        </div>

        <div class="group">
          <label for="address" class="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            id="address"
            bind:value={formData.address}
            class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        <div class="group">
          <label for="postal_code" class="block text-sm font-medium text-gray-700 mb-1"
            >Postal Code</label
          >
          <input
            type="text"
            id="postal_code"
            bind:value={formData.postal_code}
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
          <Button variant="secondary" onclick={closeModal}>Cancel</Button>
          <Button type="submit">
            {isEditMode ? 'Save Changes' : 'Create Company'}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

{#if showCaptchaModal}
  <div
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60]"
  >
    <div class="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Enter Captcha</h3>
        <button class="text-gray-400 hover:text-gray-500" onclick={closeCaptchaModal}>
          <Cross />
        </button>
      </div>
      <div class="space-y-4">
        <div class="flex justify-center">
          <img src={`data:image/png;base64,${captchaImage}`} alt="Captcha" class="border rounded" />
        </div>
        <input
          type="text"
          bind:value={captchaInput}
          placeholder="Enter captcha"
          class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <div class="flex justify-end gap-3">
          <Button variant="secondary" onclick={closeCaptchaModal}>Cancel</Button>
          <Button onclick={handleCaptchaSubmit}>Submit</Button>
        </div>
      </div>
    </div>
  </div>
{/if}
