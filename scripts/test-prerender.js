#!/usr/bin/env node

/**
 * 此腳本用於測試預渲染的輸出
 * 在 build 後執行，檢查是否所有動態路由都被正確預渲染
 */

import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const outputDir = join(__dirname, '..', '.output', 'public')

async function findHtmlFiles(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findHtmlFiles(fullPath, baseDir))
    }
    else if (entry.name.endsWith('.html')) {
      files.push(fullPath.replace(baseDir, '').replace(/\\/g, '/'))
    }
  }

  return files
}

async function findPayloadFiles(dir, baseDir = dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await findPayloadFiles(fullPath, baseDir))
    }
    else if (entry.name === '_payload.json') {
      files.push(fullPath.replace(baseDir, '').replace(/\\/g, '/'))
    }
  }

  return files
}

async function checkPrerenderedPages() {
  try {
    console.log('🔍 檢查預渲染的頁面...\n')
    console.log(`輸出目錄: ${outputDir}\n`)

    const htmlFiles = await findHtmlFiles(outputDir)

    // 分類統計
    const stats = {
      posts: htmlFiles.filter(f => f.includes('/posts/') && !f.includes('/posts/index.html')),
      projects: htmlFiles.filter(f => f.includes('/projects/') && !f.includes('/projects/index.html')),
      zhPosts: htmlFiles.filter(f => f.includes('/zh/posts/') && !f.includes('/zh/posts/index.html')),
      zhProjects: htmlFiles.filter(f => f.includes('/zh/projects/') && !f.includes('/zh/projects/index.html')),
      other: htmlFiles.filter(f =>
        !f.includes('/posts/')
        && !f.includes('/projects/')
        && !f.includes('/zh/posts/')
        && !f.includes('/zh/projects/'),
      ),
    }

    console.log('📊 預渲染統計:\n')
    console.log(`  英文 Posts:     ${stats.posts.length} 個`)
    console.log(`  英文 Projects:  ${stats.projects.length} 個`)
    console.log(`  中文 Posts:     ${stats.zhPosts.length} 個`)
    console.log(`  中文 Projects:  ${stats.zhProjects.length} 個`)
    console.log(`  其他頁面:       ${stats.other.length} 個`)
    console.log(`  總計:           ${htmlFiles.length} 個頁面\n`)

    // 檢查是否有 payload.json 檔案
    const payloadFiles = await findPayloadFiles(outputDir)
    console.log(`📦 Payload 檔案: ${payloadFiles.length} 個\n`)

    // 顯示前 10 個 posts 和 projects
    if (stats.posts.length > 0) {
      console.log('📝 英文 Posts 範例 (前 5 個):')
      stats.posts.slice(0, 5).forEach(f => console.log(`  ${f}`))
      console.log()
    }

    if (stats.zhPosts.length > 0) {
      console.log('📝 中文 Posts 範例 (前 5 個):')
      stats.zhPosts.slice(0, 5).forEach(f => console.log(`  ${f}`))
      console.log()
    }

    if (stats.posts.length === 0 && stats.zhPosts.length === 0) {
      console.error('❌ 錯誤: 沒有找到任何預渲染的 post 頁面!')
      console.error('   請檢查 __prerender.get.ts 是否正確返回路由\n')
      process.exit(1)
    }

    if (payloadFiles.length === 0) {
      console.warn('⚠️  警告: 沒有找到 _payload.json 檔案')
      console.warn('   請檢查 nuxt.config.ts 中的 payloadExtraction 設定\n')
    }

    console.log('✅ 預渲染檢查完成!')
  }
  catch (error) {
    console.error('❌ 錯誤:', error.message)
    console.error('\n提示: 請先執行 `pnpm run build` 生成預渲染檔案')
    process.exit(1)
  }
}

checkPrerenderedPages()
