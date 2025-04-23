import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { minify } from 'html-minifier-terser'

const distDir = path.resolve('./dist')
if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist')
  process.exit(1)
}
const htmlFiles = []

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, file)
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath)
    }
    else if (file.endsWith('.html')) {
      htmlFiles.push(fullPath)
    }
  }
}

walk(distDir)

const minifyOptions = {
  collapseWhitespace: true,
  removeComments: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  minifyCSS: true,
  minifyJS: true,
  sortAttributes: true,
  sortClassName: true,
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  minify(html, minifyOptions).then((minified) => {
    fs.writeFileSync(file, minified, 'utf8')
    console.log(`Minified: ${file}`)
  })
}
