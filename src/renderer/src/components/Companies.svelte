<script lang="ts">
  import { onMount } from 'svelte'
  import { toasts } from './Toast'

  let companies = $state([])
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
          <div class="group">
            <label for="state" class="block text-sm font-semibold text-gray-800 mb-1.5">State</label
            >
            <select
              id="state"
              bind:value={newCompany.state}
              class="input w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
              required
            >
              <option value="" class="text-gray-500">Select a state</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Dadra and Nagar Haveli and Daman and Diu"
                >Dadra and Nagar Haveli and Daman and Diu</option
              >
              <option value="Delhi">Delhi</option>
              <option value="Jammu and Kashmir">Jammu and Kashmir</option>
              <option value="Ladakh">Ladakh</option>
              <option value="Lakshadweep">Lakshadweep</option>
              <option value="Puducherry">Puducherry</option>
            </select>
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Add Company</button>
      </div>
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
              <td class="px-6 py-4 whitespace-nowrap">
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
