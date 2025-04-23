<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const localePath = useLocalePath()

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const { y: scroll } = useWindowScroll()
</script>

<template>
  <header class="header z-40">
    <NuxtLink
      class="w-12 h-12 absolute xl:fixed m-5 select-none outline-none"
      :to="localePath('/')"
      :aria-label="$t('home')"
      :title="$t('home')"
    >
      <Logo />
    </NuxtLink>
    <!-- //TODO: 考慮要不要使用他 -->
    <button
      type="button"
      title="Scroll to top"
      aria-label="Scroll to top"
      fixed right-3 bottom-3 w-10 h-10 hover:op100 rounded-full
      hover-bg-hex-8883 transition duration-300 z-100 print:hidden
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop"
    >
      <span i-ri-arrow-up-line />
    </button>
    <nav class="nav">
      <div class="spacer" />
      <div class="right" print:op0>
        <NuxtLink :to="localePath('/posts')" title="Blog" aria-label="Blog">
          <span class="lt-md:hidden">Blog</span>
          <Icon name="ri:article-line" class="md:hidden" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink :to="localePath('/projects')" title="Projects" aria-label="Projects">
          <span class="lt-md:hidden">Projects</span>
          <Icon name="ri:projector-line" class="md:hidden" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink :to="localePath('/demos')" title="Demos" aria-label="Demos">
          <span class="lt-md:hidden">Demos</span>
          <Icon name="i-mdi-monitor-dashboard" class="md:hidden" aria-hidden="true" />
        </NuxtLink>

        <!-- <NuxtLink :to="localePath('/gallery')" title="Gallery" aria-label="Gallery">
          <Icon name="i-ri-screenshot-line" class="md:hidden" />
        </NuxtLink>

        <NuxtLink :to="localePath('/labs')" title="Labs" aria-label="Labs">
          <Icon name="i-ri-screenshot-line" class="md:hidden" />
        </NuxtLink> -->

        <!-- Social Media -->
        <NuxtLink href="https://www.instagram.com/andy820621" target="_blank" title="Instagram" class="lt-md:hidden" aria-label="Instagram 個人頁面" rel="noopener noreferrer">
          <Icon name="i-simple-icons-instagram" aria-hidden="true" />
          <span class="sr-only">Instagram</span>
        </NuxtLink>
        <NuxtLink href="https://github.com/andy820621" target="_blank" title="GitHub" class="lt-md:hidden" aria-label="GitHub 個人頁面" rel="noopener noreferrer">
          <Icon name="i-ri-github-fill" aria-hidden="true" />
          <span class="sr-only">GitHub</span>
        </NuxtLink>

        <ToggleTheme />

        <ToggleLanguage />
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 2rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
}

.nav > * {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a,
.nav button {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}
</style>
