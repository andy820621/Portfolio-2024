## 🔧 技術債務與臨時修正

### ⚠️ VueUse v14 SSR Workaround（優先處理）

**問題描述：**

- VueUse v14.0.0 使用新的 `tsdown` 構建系統，在 Nuxt 4 + Nitro 的 SSR 環境下會產生語法錯誤
- 錯誤訊息：`Expected ',', got '$1'` in `useMediaQuery`

**臨時解決方案：**
在 `nuxt.config.ts` 中添加了以下臨時修正：

1. **Nitro Rollup 插件**（約 365-385 行）

```typescript
rollupConfig: {
  plugins: [
    {
      name: 'vueuse-ssr-fix',
      transform(code, id) {
        if (id.includes('node_modules/@vueuse/core')) {
          // other code
        }
      }
    }
  ]
}
```

2. **Vite 配置**（約 280-285 行）

```typescript
define: {
  __VUEUSE_OPTIONS__: JSON.stringify({ ssr: true })
}
```

**待辦事項：**

- [ ] 定期檢查 VueUse 更新（建議每月一次）
- [ ] 當 VueUse 發布修正版本後（預計 v14.1.x 或 v14.2.x），移除上述 workaround
- [ ] 測試移除後的 build 流程是否正常
- [ ] 相關 issue 追蹤：https://github.com/vueuse/vueuse/issues

**檢查方式：**

```bash
# 嘗試移除 workaround 並測試
pnpm run build

# 如果成功，表示可以移除臨時修正
```

**相關檔案：**

- `nuxt.config.ts` - 包含 Nitro 和 Vite workaround
- `package.json` - VueUse 版本鎖定在 v14.0.0

**預計移除時間：** 2025 Q1 或當 VueUse v14.1+ 發布時

---

## 優化：

- @nuxtjs/pwa
- nuxt-lazy-load
- gsap (cdn?)
- nuxt-compress
- [tags filter](https://www.google.com/imgres?q=clear%20filter%20button%20design&imgurl=https%3A%2F%2Fcdn.dribbble.com%2Fusers%2F66200%2Fscreenshots%2F7223806%2Fmedia%2F23a85584c4b1e5632854d33b50089d6b.gif&imgrefurl=https%3A%2F%2Fdribbble.com%2Fshots%2F7223806-Filter-button&docid=J3_PRUNobtHEgM&tbnid=eRNbnWO1RoQGvM&vet=12ahUKEwj98JqW_PCIAxXKia8BHazcOKsQM3oECG0QAA..i&w=1600&h=1200&hcb=2&ved=2ahUKEwj98JqW_PCIAxXKia8BHazcOKsQM3oECG0QAA)
