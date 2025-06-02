<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements'

  interface ButtonProps extends HTMLAttributes<HTMLButtonElement | HTMLAnchorElement> {
    variant: 'primary' | 'secondary' | 'danger'
    type: 'button' | 'submit' | 'reset'
    disabled: boolean
    fullWidth: boolean
    size: 'sm' | 'md' | 'lg'
    asAnchorTag: boolean
  }

  let {
    variant = 'primary',
    type = 'button',
    disabled = false,
    fullWidth = false,
    class: className,
    size = 'md',
    asAnchorTag = false,
    children,
    ...restProps
  }: ButtonProps = $props()

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-5 py-3 text-lg'
  }

  const buttonStyles = {
    primary: 'bg-brand text-white hover:bg-brand-700 focus:ring-brand-500',
    secondary:
      'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-brand-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }

  let classes = $derived(
    [
      'px-4 py-2.5 font-medium rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
      buttonStyles[variant],
      sizeClasses[size],
      fullWidth ? 'w-full' : '',
      className
    ]
      .filter(Boolean)
      .join(' ')
  )
</script>

{#if asAnchorTag}
  <a {type} class={classes} {...restProps}>
    {@render children()}
  </a>
{:else}
  <button {type} {disabled} class={classes} {...restProps}>
    {@render children()}
  </button>
{/if}
