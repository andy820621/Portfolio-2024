<script setup lang="ts">
interface Props {
  href: string
  icon?: string
  label: string
}

const { href, icon, label } = defineProps<Props>()
</script>

<template>
  <div class="not-prose support-button-container">
    <a
      class="support-button"
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Icon v-if="icon" :name="icon" aria-hidden="true" />
      <span>{{ label }}</span>
    </a>
  </div>
</template>

<style scoped>
.support-button-container {
  margin-block: 1.25rem 2rem;
}

.support-button {
  min-height: 2.75rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 1rem;
  border: 1px solid color-mix(in oklab, var(--clr-primary-green) 48%, transparent);
  border-radius: 0.7rem;
  background: color-mix(in oklab, var(--clr-primary-green) 12%, transparent);
  color: var(--clr-text-accent);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    transform 160ms ease;
}

.support-button > :first-child {
  color: var(--clr-text-accent);
  font-size: 1.15rem;
}

.support-button:hover {
  border-color: color-mix(in oklab, var(--clr-primary-green) 72%, transparent);
  background: color-mix(in oklab, var(--clr-primary-green) 18%, transparent);
  transform: translateY(-1px);
}

.support-button:focus-visible {
  outline: 2px solid var(--clr-primary-green);
  outline-offset: 3px;
}

.support-button:active {
  transform: scale(0.96);
}

@media (prefers-reduced-motion: reduce) {
  .support-button {
    transition: none;
  }

  .support-button:active,
  .support-button:hover {
    transform: none;
  }
}
</style>
