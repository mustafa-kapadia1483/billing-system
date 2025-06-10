<script lang="ts">
  const units = [
    { value: 'BAG', label: 'BAGS' },
    { value: 'BAL', label: 'BALE' },
    { value: 'BDL', label: 'BUNDLES' },
    { value: 'BKL', label: 'BUCKLES' },
    { value: 'BOU', label: 'BILLIONS OF UNITS' },
    { value: 'BOX', label: 'BOX' },
    { value: 'BTL', label: 'BOTTLES' },
    { value: 'BUN', label: 'BUNCHES' },
    { value: 'CAN', label: 'CANS' },
    { value: 'CBM', label: 'CUBIC METER' },
    { value: 'CCM', label: 'CUBIC CENTIMETER' },
    { value: 'CMS', label: 'CENTIMETER' },
    { value: 'CTN', label: 'CARTONS' },
    { value: 'DOZ', label: 'DOZEN' },
    { value: 'DRM', label: 'DRUM' },
    { value: 'GGR', label: 'GREAT GROSS' },
    { value: 'GMS', label: 'GRAMS' },
    { value: 'GRS', label: 'GROSS' },
    { value: 'GYD', label: 'GROSS YARDS' },
    { value: 'KGS', label: 'KILOGRAMS' },
    { value: 'KLR', label: 'KILOLITER' },
    { value: 'KME', label: 'KILOMETRE' },
    { value: 'MLT', label: 'MILLILITRE' },
    { value: 'MTR', label: 'METERS' },
    { value: 'MTS', label: 'METRIC TONS' },
    { value: 'NOS', label: 'NUMBERS' },
    { value: 'PAC', label: 'PACKS' },
    { value: 'PCS', label: 'PIECES' },
    { value: 'PRS', label: 'PAIRS' },
    { value: 'QTL', label: 'QUINTAL' },
    { value: 'ROL', label: 'ROLLS' },
    { value: 'SET', label: 'SETS' },
    { value: 'SQF', label: 'SQUARE FEET' },
    { value: 'SQM', label: 'SQUARE METERS' },
    { value: 'SQY', label: 'SQUARE YARDS' },
    { value: 'TBS', label: 'TABLETS' },
    { value: 'TGM', label: 'TEN GROSS' },
    { value: 'THD', label: 'THOUSANDS' },
    { value: 'TON', label: 'TONNES' },
    { value: 'TUB', label: 'TUBES' },
    { value: 'UGS', label: 'US GALLONS' },
    { value: 'UNT', label: 'UNITS' },
    { value: 'YDS', label: 'YARDS' },
    { value: 'OTH', label: 'OTHERS' }
  ]

  let { value = $bindable('PCS'), required = false, id = '', disabled = false } = $props()
</script>

<select
  {id}
  bind:value
  {required}
  {disabled}
  class="input w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors appearance-none"
>
  {#each units as unit (unit.value)}
    <option value={unit.value}>{unit.label}</option>
  {/each}
</select>
