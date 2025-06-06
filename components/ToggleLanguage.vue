<script setup lang="ts">
import type { Locale } from 'vue-i18n'
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/vue'

const { locale, locales, setLocale } = useI18n()

function handleLocaleChange(newLocale: Locale) {
  setLocale(newLocale)
}
</script>

<template>
  <Listbox v-slot="{ open }" v-model="locale" @update:model-value="handleLocaleChange">
    <div class="relative mt-1">
      <ListboxButton
        border="~ base"
        flex="~ items-center gap-1"
        class="rounded-full px-[.3rem] py-[0.2rem] text-sm"
      >
        <Icon name="material-symbols-light:language" />
        <span class="pb-[.1rem]">
          {{ locales.find(loc => loc.code === locale)?.code }}
        </span>
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
          border="~ base"
          class="absolute left-1/2 mt-1 max-h-60 rounded-md py-[.24rem] -translate-x-1/2"
        >
          <ListboxOption v-for="loc in locales" :key="loc.code" v-slot="{ active, selected }" :value="loc.code">
            <li
              flex="~ justify-end items-center gap-1"
              text="sm base"
              class="relative select-none px-[.4rem] py-[.3rem]"
              :class="[active && 'bg-primary']"
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
