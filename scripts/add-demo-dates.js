import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

/**
 * 從 Git 歷史中取得檔案的創建日期和最後修改日期
 */
function getGitDates(filePath) {
  try {
    // 取得最早的 commit 日期 (創建日期)
    const createdDate = execSync(
      `git log --follow --format=%aI --reverse "${filePath}" | head -1`,
      { encoding: 'utf-8' },
    ).trim()

    // 取得最後的 commit 日期 (修改日期)
    const updatedDate = execSync(
      `git log --follow --format=%aI -1 "${filePath}"`,
      { encoding: 'utf-8' },
    ).trim()

    return {
      date: createdDate || new Date().toISOString(),
      updatedAt: updatedDate || new Date().toISOString(),
    }
  }
  catch {
    console.warn(`無法取得 ${filePath} 的 Git 日期，使用當前日期`)
    const now = new Date().toISOString()
    return {
      date: now,
      updatedAt: now,
    }
  }
}

/**
 * 更新 markdown 檔案的 frontmatter
 */
function updateFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')

  // 檢查是否已有 frontmatter
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/
  const match = content.match(frontmatterRegex)

  if (!match) {
    console.warn(`${filePath} 沒有 frontmatter，跳過`)
    return false
  }

  const frontmatter = match[1]

  // 檢查是否已有 date 或 updatedAt
  if (frontmatter.includes('date:') || frontmatter.includes('updatedAt:')) {
    console.log(`${path.basename(filePath)} 已有日期欄位，跳過`)
    return false
  }

  // 取得 Git 日期
  const { date, updatedAt } = getGitDates(filePath)

  // 格式化日期為 YYYY-MM-DD
  const formatDate = isoString => isoString.split('T')[0]

  // 在 frontmatter 的最後加入 date 和 updatedAt
  const newFrontmatter = `${frontmatter}\ndate: ${formatDate(date)}\nupdatedAt: ${formatDate(updatedAt)}`

  const newContent = content.replace(frontmatterRegex, `---\n${newFrontmatter}\n---`)

  fs.writeFileSync(filePath, newContent, 'utf-8')
  console.log(`✅ 已更新 ${path.basename(filePath)} - date: ${formatDate(date)}, updatedAt: ${formatDate(updatedAt)}`)

  return true
}

/**
 * 主函數
 */
function main() {
  const contentDir = path.join(process.cwd(), 'content')

  // 取得所有 demo 檔案
  const demoFiles = [
    ...findDemoFiles(path.join(contentDir, 'en', 'demos')),
    ...findDemoFiles(path.join(contentDir, 'zh', 'demos')),
  ]

  console.log(`找到 ${demoFiles.length} 個 demo 檔案\n`)

  let updatedCount = 0
  let skippedCount = 0

  demoFiles.forEach((file) => {
    const updated = updateFrontmatter(file)
    if (updated) {
      updatedCount++
    }
    else {
      skippedCount++
    }
  })

  console.log(`\n完成！`)
  console.log(`✅ 已更新: ${updatedCount} 個檔案`)
  console.log(`⏭️  已跳過: ${skippedCount} 個檔案`)
}

/**
 * 尋找指定目錄下的所有 .md 檔案
 */
function findDemoFiles(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(dir, file))
}

main()
