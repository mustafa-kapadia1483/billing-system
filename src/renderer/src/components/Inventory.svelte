<script lang="ts">
  import { onMount } from 'svelte'
  import { toasts } from '$lib/Toast'
  import { formatter } from '$lib/utils/formatting'
  import Button from '$lib/Button.svelte'
  import { Edit, Trashcan, Plus } from '$lib/icons'

  let inventory = $state([])
  let isModalOpen = $state(false)
  let selectedItem = $state(null)
  let filters = $state({
    name: '',
    hsn_code: '',
    minRate: undefined,
    maxRate: undefined,
    tax_rate: undefined,
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 50
  })

  onMount(async () => {
    loadInventory()
  })

  async function loadInventory(): Promise<void> {
    try {
      inventory = await window.api.getInventory($state.snapshot(filters))
    } catch (error) {
      toasts.error(error.message)
    }
  }

  function openModal(item = null): void {
    selectedItem = item
    isModalOpen = true
  }

  async function deleteItem(id: number, name: string): Promise<void> {
    try {
      await window.api.deleteInventoryItem(id)
      toasts.info(`Item ${name} deleted successfully`)
      await loadInventory()
    } catch (error) {
      toasts.error(error.message)
    }
  }

  function resetFilters(): void {
    filters = {
      name: '',
      hsn_code: '',
      minRate: undefined,
      maxRate: undefined,
      tax_rate: undefined,
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 50
    }
    loadInventory()
  }
</script>

<svelte:head>
  <title>Inventory</title>
</svelte:head>

<div class="card bg-white shadow-lg rounded-lg p-8 border border-gray-100">
  <div class="flex justify-between items-center mb-6">
    <h2 class="text-2xl font-semibold text-gray-800">Inventory Management</h2>

    <Button class="flex items-center gap-2" onclick={() => openModal()}>
      <Plus />
      Add Item
    </Button>
  </div>

  <div class="mb-6 bg-gray-50 p-4 rounded-lg space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Name Filter -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          id="name"
          type="text"
          bind:value={filters.name}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search by name"
          oninput={() => loadInventory()}
        />
      </div>

      <!-- HSN Code Filter -->
      <div>
        <label for="hsn" class="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
        <input
          id="hsn"
          type="text"
          bind:value={filters.hsn_code}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Search by HSN code"
          oninput={() => loadInventory()}
        />
      </div>

      <!-- Rate Range Filters -->
      <div>
        <label for="minRate" class="block text-sm font-medium text-gray-700 mb-1">Min Rate</label>
        <input
          id="minRate"
          type="number"
          bind:value={filters.minRate}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Min rate"
          onchange={() => loadInventory()}
        />
      </div>
      <div>
        <label for="maxRate" class="block text-sm font-medium text-gray-700 mb-1">Max Rate</label>
        <input
          id="maxRate"
          type="number"
          bind:value={filters.maxRate}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Max rate"
          onchange={() => loadInventory()}
        />
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Tax Rate Filter -->
      <div>
        <label for="tax_rate" class="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label>
        <select
          id="tax_rate"
          bind:value={filters.tax_rate}
          class="input rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          onchange={() => loadInventory()}
        >
          <option value={undefined}>All</option>
          <option value={5}>5%</option>
          <option value={12}>12%</option>
          <option value={18}>18%</option>
          <option value={28}>28%</option>
        </select>
      </div>

      <!-- Sort Options -->
      <div>
        <label for="sortBy" class="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
        <div class="flex gap-2">
          <select
            id="sortBy"
            bind:value={filters.sortBy}
            class="input w-2/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onchange={() => loadInventory()}
          >
            <option value="name">Name</option>
            <option value="hsn_code">HSN Code</option>
            <option value="rate">Rate</option>
            <option value="tax_rate">Tax Rate</option>
          </select>
          <select
            bind:value={filters.sortOrder}
            class="input w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            onchange={() => loadInventory()}
          >
            <option value="asc">ASC</option>
            <option value="desc">DESC</option>
          </select>
        </div>
      </div>

      <div class="md:col-span-2 flex justify-end items-end">
        <Button variant="secondary" size="sm" onclick={resetFilters}>Reset Filters</Button>
      </div>
    </div>
  </div>

  <div class="overflow-hidden rounded-lg border border-gray-200">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Name</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Description</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >HSN Code</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Rate</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Tax Rate</th
          >
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >Actions</th
          >
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        {#each inventory as item (item.id)}
          <tr>
            <td class="px-6 py-4 whitespace-nowrap">{item.name}</td>
            <td class="px-6 py-4 whitespace-nowrap">{item.description || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">{item.hsn_code}</td>
            <td class="px-6 py-4 whitespace-nowrap">{formatter.format(item.rate)}</td>
            <td class="px-6 py-4 whitespace-nowrap">{item.tax_rate}%</td>
            <td class="px-6 py-4 whitespace-nowrap space-x-2">
              <Button variant="secondary" size="sm" onclick={() => openModal(item)}><Edit /></Button
              >
              <Button variant="danger" size="sm" onclick={() => deleteItem(item.id, item.name)}>
                <Trashcan />
              </Button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

{#if isModalOpen}
  <div
    aria-label="Close modal"
    class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
    onclick={(e) => {
      if (e.target === e.currentTarget) isModalOpen = false
    }}
  >
    <div
      class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg m-4"
      onclick={(e) => e.stopPropagation()}
    >
      <h3 class="text-lg font-semibold text-gray-800 mb-4">
        {selectedItem ? 'Edit Item' : 'Add New Item'}
      </h3>
      <form
        onsubmit={async (e) => {
          e.preventDefault()
          const formData = new FormData(e.target)
          const itemData = {
            name: formData.get('name'),
            description: formData.get('description'),
            hsn_code: formData.get('hsn_code'),
            rate: parseFloat(formData.get('rate')),
            tax_rate: parseInt(formData.get('tax_rate'))
          }

          try {
            if (selectedItem) {
              await window.api.updateInventoryItem(selectedItem.id, itemData)
              toasts.success(`Item ${itemData.name} updated successfully`)
            } else {
              await window.api.createInventoryItem(itemData)
              toasts.success(`Item ${itemData.name} created successfully`)
            }
            isModalOpen = false
            loadInventory()
          } catch (error) {
            toasts.error(error.message)
          }
        }}
        class="space-y-4"
      >
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={selectedItem?.name || ''}
            class="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1"
            >Description</label
          >
          <textarea
            id="description"
            name="description"
            value={selectedItem?.description || ''}
            class="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            rows="3"
          />
        </div>

        <div>
          <label for="hsn_code" class="block text-sm font-medium text-gray-700 mb-1">HSN Code</label
          >
          <input
            type="text"
            id="hsn_code"
            name="hsn_code"
            required
            value={selectedItem?.hsn_code || ''}
            class="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="rate" class="block text-sm font-medium text-gray-700 mb-1">Rate</label>
          <input
            type="number"
            id="rate"
            name="rate"
            required
            step="0.01"
            min="0"
            value={selectedItem?.rate || ''}
            class="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div>
          <label for="tax_rate" class="block text-sm font-medium text-gray-700 mb-1">Tax Rate</label
          >
          <select
            id="tax_rate"
            name="tax_rate"
            required
            value={selectedItem?.tax_rate || 18}
            class="input w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value={5}>5%</option>
            <option value={12}>12%</option>
            <option value={18}>18%</option>
            <option value={28}>28%</option>
          </select>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onclick={() => (isModalOpen = false)}>
            Cancel
          </Button>

          <Button type="submit">
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}
