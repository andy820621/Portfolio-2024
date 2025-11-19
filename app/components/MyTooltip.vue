<script setup lang="ts">
import type { TooltipContentProps } from 'reka-ui'
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from 'reka-ui'

const props = withDefaults(defineProps<{
  text?: string
  kbds?: HotkeyInput[]
  delayDuration?: number
  skipDelayDuration?: number
  side?: TooltipContentProps['side']
  align?: TooltipContentProps['align']
  sideOffset?: number
  collisionPadding?: number
  contentClass?: string
}>(), {
  kbds: () => [],
  delayDuration: 80,
  skipDelayDuration: 200,
  side: 'bottom',
  align: 'center',
  sideOffset: 8,
  collisionPadding: 10,
})

defineSlots<{
  default?: (props: { open: boolean }) => any
  content?: (props: { kbds: string[] }) => any
}>()

const normalizedKbds = computed(() => props.kbds
  .map(kbd => getHotkeyDisplayValue(kbd))
  .filter((value): value is string => Boolean(value)))
</script>

<template>
  <TooltipProvider :delay-duration="props.delayDuration" :skip-delay-duration="props.skipDelayDuration">
    <TooltipRoot v-slot="{ open }">
      <TooltipTrigger as-child>
        <slot :open="open" />
      </TooltipTrigger>

      <TooltipPortal>
        <TooltipContent
          :side="props.side"
          :align="props.align"
          :side-offset="props.sideOffset"
          :collision-padding="props.collisionPadding"
          class="my-tooltip"
          :class="props.contentClass"
        >
          <slot name="content" :kbds="normalizedKbds">
            <span v-if="props.text" class="my-tooltip__label">
              {{ props.text }}
            </span>
            <span v-if="normalizedKbds.length" class="my-tooltip__kbds" aria-hidden="true">
              <kbd
                v-for="(key, index) in normalizedKbds"
                :key="index"
                class="my-tooltip__kbd"
              >
                {{ key }}
              </kbd>
            </span>
          </slot>
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style>
.my-tooltip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 1.5rem;
  padding: 0.25rem 0.6rem;
  border-radius: 0.35rem;
  border: 1px solid rgba(15, 23, 42, 0.14);
  background: rgba(248, 250, 252, 0.95);
  color: #0f172a;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.1;
  box-shadow: 0 10px 35px rgba(15, 15, 30, 0.25);
  pointer-events: auto;
  opacity: 0;
  transform: scale(0.94);
  transform-origin: var(--reka-tooltip-content-transform-origin, center);
}

.dark .my-tooltip {
  background: rgba(15, 23, 42, 0.95);
  color: #f8fafc;
  border-color: rgba(148, 163, 184, 0.35);
  box-shadow: 0 15px 35px rgba(2, 6, 23, 0.55);
}

.my-tooltip__label {
  display: inline-flex;
  max-width: 11rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.my-tooltip__kbds {
  display: none;
  align-items: center;
  gap: 0.2rem;
}

@media (min-width: 1024px) {
  .my-tooltip__kbds {
    display: inline-flex;
  }

  .my-tooltip__kbds::before {
    content: '·';
    margin-right: 0.3rem;
    opacity: 0.6;
  }
}

.my-tooltip__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1rem;
  height: 1.1rem;
  padding: 0 0.35rem;
  padding-top: 0.03rem;
  border-radius: 0.2rem;
  border: 1px solid rgba(15, 23, 42, 0.2);
  background: rgba(255, 255, 255, 0.85);
  color: #0f172a;
  font-size: 0.65rem;
  font-weight: 600;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.dark .my-tooltip__kbd {
  border-color: rgba(248, 250, 252, 0.25);
  background: rgba(15, 23, 42, 0.65);
  color: #f8fafc;
}

.my-tooltip[data-state='delayed-open'],
.my-tooltip[data-state='instant-open'] {
  animation: my-tooltip-enter 0.13s ease-out forwards;
}

.my-tooltip[data-state='open'] {
  opacity: 1;
  transform: scale(1);
}

.my-tooltip[data-state='closed'] {
  animation: my-tooltip-leave 0.12s ease-in forwards;
}

@keyframes my-tooltip-enter {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes my-tooltip-leave {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.92);
  }
}
</style>
