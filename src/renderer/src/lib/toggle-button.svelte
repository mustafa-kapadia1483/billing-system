<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface ToggleButtonProps extends HTMLAttributes<HTMLButtonElement> {
    checked?: boolean
    disabled?: boolean
    size?: 'sm' | 'md' | 'lg'
    label?: string
    labelPosition?: 'left' | 'right'
  }

  let {
    checked = $bindable(false),
    disabled = false,
    size = 'md',
    label = '',
    labelPosition = 'right',
    ...rest
  }: ToggleButtonProps = $props()

  const sizeClasses = {
    sm: {
      button: 'w-8 h-4',
      circle: 'w-3 h-3',
      translate: 'translate-x-4',
      text: 'text-sm'
    },
    md: {
      button: 'w-11 h-6',
      circle: 'w-5 h-5',
      translate: 'translate-x-5',
      text: 'text-base'
    },
    lg: {
      button: 'w-14 h-7',
      circle: 'w-6 h-6',
      translate: 'translate-x-7',
      text: 'text-lg'
    }
  }

  let buttonClasses = $derived(
    [
      'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent',
      'transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2',
      'focus:ring-blue-500 focus:ring-offset-2',
      checked ? 'bg-blue-600' : 'bg-gray-200',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      sizeClasses[size].button
    ]
      .filter(Boolean)
      .join(' ')
  )

  let circleClasses = $derived(
    [
      'pointer-events-none inline-block transform rounded-full bg-white shadow',
      'ring-0 transition duration-200 ease-in-out',
      checked ? sizeClasses[size].translate : 'translate-x-0',
      sizeClasses[size].circle
    ]
      .filter(Boolean)
      .join(' ')
  )

  let labelClasses = $derived(
    ['font-medium text-gray-700', disabled ? 'opacity-50' : '', sizeClasses[size].text]
      .filter(Boolean)
      .join(' ')
  )

  function toggle() {
    if (!disabled) {
      checked = !checked
    }
  }
</script>

<div class="flex items-center justify-start gap-2">
  {#if label && labelPosition === 'left'}
    <label class={labelClasses}>{label}</label>
  {/if}

  <button
    type="button"
    class={buttonClasses}
    role="switch"
    aria-checked={checked}
    aria-label={label}
    {disabled}
    onclick={toggle}
    {...rest}
  >
    <span aria-hidden="true" class={circleClasses} />
  </button>

  {#if label && labelPosition === 'right'}
    <label class={labelClasses}>{label}</label>
  {/if}
</div>
