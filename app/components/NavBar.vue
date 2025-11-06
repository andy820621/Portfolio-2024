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
      class="absolute m-5 h-12 w-12 select-none outline-none xl:fixed"
      :to="localePath('/')"
      :aria-label="$t('home')"
      :title="$t('home')"
    >
      <Logo />
    </NuxtLink>
    <!-- 僅在客戶端渲染，避免 SSR/CSR 滾動位置差異造成 hydration mismatch -->
    <ClientOnly>
      <button
        type="button"
        title="Scroll to top"
        aria-label="Scroll to top"

        fixed bottom-3 right-3 z-100 h-10 w-10 rounded-full transition duration-300 print:hidden hover-bg-hex-8883 hover:op100
        :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
        @click="toTop"
      >
        <span i-ri-arrow-up-line />
      </button>
      <template #fallback>
        <!-- 保持 SSR 標記穩定的空節點 -->
        <span aria-hidden="true" />
      </template>
    </ClientOnly>
    <nav class="nav" aria-label="Main navigation">
      <div class="spacer" />
      <div class="right" print:op0>
        <NuxtLink :to="localePath('/posts')" title="Blog" aria-label="Blog" lt-md:inline-flex>
          <span class="lt-md:hidden">Blog</span>
          <Icon name="ri:article-line" class="md:hidden" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink :to="localePath('/projects')" title="Projects" aria-label="Projects" lt-md:inline-flex>
          <span class="lt-md:hidden">Projects</span>
          <Icon name="ri:projector-line" class="md:hidden" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink :to="localePath('/demos')" title="Demos" aria-label="Demos" lt-md:inline-flex>
          <span class="lt-md:hidden">Demos</span>
          <Icon name="i-mdi-monitor-dashboard" class="md:hidden" aria-hidden="true" />
        </NuxtLink>

        <NuxtLink :to="localePath('/gallery')" title="Gallery" aria-label="Gallery" inline-flex>
          <Icon name="i-ri-camera-3-line" />
        </NuxtLink>

        <!-- <NuxtLink :to="localePath('/labs')" title="Labs" aria-label="Labs">
          <Icon name="i-ri-screenshot-line" class="md:hidden" />
        </NuxtLink>  -->

        <!-- Social Media -->
        <NuxtLink href="https://www.instagram.com/andy820621" target="_blank" title="Instagram" class="lt-md:hidden" aria-label="Instagram 個人頁面" rel="noopener noreferrer" md:inline-flex>
          <Icon name="i-ri-instagram-line" aria-hidden="true" />
          <span class="sr-only">Instagram</span>
        </NuxtLink>
        <NuxtLink href="https://github.com/andy820621" target="_blank" title="GitHub" class="lt-md:hidden" aria-label="GitHub 個人頁面" rel="noopener noreferrer" md:inline-flex>
          <Icon name="i-ri-github-fill" aria-hidden="true" />
          <span class="sr-only">GitHub</span>
        </NuxtLink>

        <ToggleTheme />

        <ToggleLanguage />
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
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

  @media (max-width: 750px) {
    padding-inline: 1.5rem;
  }

  @media (max-width: 640px) {
    padding-inline: 1.2rem;
  }

  @media (max-width: 500px) {
    padding-inline: 1rem;
  }

  & > * {
    margin: auto;
  }
  & > .img {
    margin-bottom: 0;
  }

  a,
  button {
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    transition: opacity 0.2s ease;
    opacity: 0.6;
    outline: none;

    span.iconify {
      font-size: 1.3rem;
    }
  }

  a:hover {
    opacity: 1;
    text-decoration-color: inherit;
  }

  .right {
    display: grid;
    grid-gap: 1.15rem;
    grid-auto-flow: column;

    & > * {
      margin: auto;
    }
  }
}
</style>
