<script setup lang="ts">
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'

const { locale, locales, setLocale } = useI18n()

function handleLocaleChange(newLocale: string) {
  setLocale(newLocale)
}
</script>

<template>
  <Listbox v-slot="{ open }" v-model="locale" @update:model-value="handleLocaleChange">
    <div class="relative mt-1">
      <ListboxButton
        border="~ [var(--clr-text)]"
        flex="~ items-center gap-1"
        class="text-sm rounded-full py-[0.2rem] px-[.3rem]"
      >
        <Icon name="material-symbols-light:language" />
        <p class="pb-[.1rem]">
          {{ locales.find(loc => loc.code === locale)?.code }}
        </p>
        <Icon name="ri:arrow-down-s-line" class="transition-transform duration-300" :class="[open && 'rotate-180']" />
      </ListboxButton>
      <Transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-out"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <ListboxOptions
          border="~ [var(--clr-text)]"
          class="absolute mt-1 max-h-60 rounded-md left-1/2 -translate-x-1/2 py-[.24rem]"
        >
          <ListboxOption v-for="loc in locales" :key="loc.code" v-slot="{ active, selected }" :value="loc.code">
            <li
              flex="~ justify-end items-center gap-1"
              text="sm [var(--clr-text)]"
              class="relative select-none py-[.3rem] px-[.4rem]"
              :class="[active && 'bg-[var(--clr-bg-green)] text-[var(--clr-text)]']"
            >
              <Icon v-if="selected" name="ri:check-fill" />
              <span class="block" :class="[selected ? 'font-bold' : 'font-normal']">
                {{ loc.name }}
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </Transition>
    </div>
  </Listbox>
</template>
