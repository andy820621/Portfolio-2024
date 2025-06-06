---
title: How To Properly Fetch Nuxt Content Data and Render It in Nuxt Pages
date: 2023/5/1
description: Here we will learn How To Properly Fetch Nuxt Content Data and Render It in Nuxt Pages
image: /blog-images/fetch-content-data-render-pages.jpg
alt: How To Properly Fetch Nuxt Content Data and Render It in Nuxt Pages
ogImage: /blog-images/fetch-content-data-render-pages.jpg
tags: ['nuxt', 'nuxt-content', 'content-module', 'vue', 'fetch-data', 'static-site', 'markdown', 'nuxt3']
categories: ['Nuxt', 'Content Management', 'Vue.js', 'Static Site Generation']
published: true
schemaOrg:
  - "@type": "BlogPosting"
    headline: "How To Properly Fetch Nuxt Content Data and Render It in Nuxt Pages"
    description: "Here we will learn How To Properly Fetch Nuxt Content Data and Render It in Nuxt Pages."
    author:
      "@type": "Person"
      name: "BarZ Hsieh"
    datePublished: "2023/5/1"
    dateModified: "2023/5/1"
    image: "/blog-images/fetch-content-data-render-pages.jpg"
    keywords: ["Nuxt", "Nuxt Content"]
    articleSection: "TechArticle"
sitemap:
  lastmod: 2025-04-17
  changefreq: weekly
  priority: 0.8
  images:
    - loc: /blog-images/fetch-content-data-render-pages.jpg
      title: "How To Properly Fetch Nuxt Content Data and Render It in Nuxt Pages"
      caption: "How To Properly Fetch Nuxt Content Data and Render It in Nuxt Pages"
---

## Introduction

Nuxt.js is a popular open-source framework for building Vue.js applications. With the release of Nuxt 3, developers have access to new features and improvements to streamline the development process. One of these features is Nuxt Content v2, which allows you to create and manage content in a simple and efficient way. In this blog post, we will guide you through the steps to connect Nuxt Content v2 with Nuxt 3.

## Step 1: Install the necessary dependencies

The first step is to install the necessary dependencies for Nuxt Content v2. To do this, run the following command:

```bash
npm install @nuxt/content@next

```

## Step 2: Configure Nuxt Content v2

Once the dependencies are installed, you need to configure Nuxt Content v2 in your Nuxt 3 project. To do this, create a new file named nuxt.config.js in the root directory of your project and add the following code:

```js
export default {
  // Enable Nuxt Content module
  modules: [
    '@nuxt/content'
  ],
}
```

In the above code, we have enabled the Nuxt Content module and set the directory where your content will be stored.

## Step 3: Create content files

Once Nuxt Content v2 is configured, you can create content files in the specified directory. By default, Nuxt Content v2 supports Markdown and YAML file formats. You can create a new file in the `content` directory with the following structure:

```md
---
title: 'Hello, world!'
---

# Welcome to Nuxt Content v2

This is an example of a Markdown file created using Nuxt Content v2.
```

In the above code, we have created a Markdown file with a title and a sample content.

## Step 4: Display content on a page

Now that we have created content files, we can display the content on a page. To do this, create a new Vue component in the components directory with the following code:

```vue
<script setup lang="ts">
const { path } = useRoute()
const articles = await queryContent(path).findOne()
</script>

<template>
  <main>
    <div>
      <ContentRenderer :value="articles">
        <template #empty>
          <p>No content found.</p>
        </template>
      </ContentRenderer>
    </div>
  </main>
</template>
```
