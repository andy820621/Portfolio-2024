# Sentry Monitoring

本專案使用 `@sentry/nuxt` 監控 production 的 client/server 錯誤與基本 tracing，不包含 Replay、Feedback、Logs。

## Environment Variables

- `NUXT_PUBLIC_SENTRY_DSN`
  - Sentry DSN。只應設定在 Netlify production context。
- `SENTRY_AUTH_TOKEN`
  - 給 source map upload 用的 auth token。只應設定在 Netlify production context。
- `SENTRY_ORG`
  - Sentry organization slug。
- `SENTRY_PROJECT`
  - 單一 Sentry project slug，browser/server 共用。
- `SENTRY_RELEASE`
  - build 時自動由 `COMMIT_REF` 衍生。Netlify build command 已處理。

## Production-Only Gating

- `client/public runtime` 只有在以下條件都成立時才會送 Sentry 事件：
  - `NODE_ENV=production`
  - `CONTEXT=production`
  - `NUXT_PUBLIC_SENTRY_DSN` 存在
- `server runtime` 只看：
  - `NODE_ENV=production`
  - `NUXT_PUBLIC_SENTRY_DSN` 存在
- 這代表：
  - Netlify deploy preview 不會送事件，前提是 `NUXT_PUBLIC_SENTRY_DSN` 只設在 production scope
  - 本地 dev 不會送事件
  - 若要本地模擬完整的 Netlify production 行為，需手動提供上述 env，並帶 `CONTEXT=production`

## Source Maps

- production build 會開：
  - client hidden sourcemap
  - server sourcemap
- `@sentry/nuxt/module` 會在 build 階段上傳 source maps。
- 上傳後會刪除 `.map` 檔，避免 source maps 跟著部署出去。
- Nitro build 會把 `SENTRY_RELEASE` 固化進 server bundle，避免 Netlify function runtime 取不到 build-time 的 `COMMIT_REF`。
- `pnpm-workspace.yaml` 已允許 `@sentry/cli` build script，否則 source map upload 無法運作。

## ConfigureSentry.md 的關係

- `docs/ConfigureSentry.md` 裡的 `npx @sentry/wizard...` 是 Sentry 官方推薦的自動化流程。
- 本專案已改走手動整合，對應檔案與設定已存在，因此現在不建議再跑 wizard。
- 仍然需要的只有：
  - project 的 DSN
  - `SENTRY_AUTH_TOKEN`
  - `SENTRY_ORG`
  - `SENTRY_PROJECT`
  - 驗證用的 client/server 測試錯誤流程

## 404 Noise Filter

- 既有內容頁與 catch-all route 會刻意 `throw createError({ statusCode: 404 })`，再交給 `app/error.vue` 呈現。
- 這類 404 屬於預期行為，不應進 Sentry issue 列表。
- 因此 Sentry `beforeSend` 會過濾：
  - `statusCode === 404`
  - 或訊息明確對應 `Page Not Found`

## Verification

1. 設定上述 Sentry env vars 到 Netlify production。
2. 部署 production。
3. 人工觸發一個 client error，確認 Sentry 收到且 stack trace 可讀。
4. 人工觸發一個 server error，確認 Sentry 收到且 stack trace 可讀。
5. 造訪不存在頁面，確認不會新增 noisy 404 issue。
6. 檢查 transaction，確認 page load / navigation tracing 有進 Sentry。
7. 確認 release 名稱與 deploy commit 一致。

## Troubleshooting

- source maps 沒上傳：
  - 確認 `SENTRY_AUTH_TOKEN`、`SENTRY_ORG`、`SENTRY_PROJECT` 都存在
  - 確認 Netlify install/build 沒有擋掉 `@sentry/cli`
- stack trace 仍是 minified：
  - 確認 release 值一致
  - 確認 build 時真的有產生 hidden/client 與 server sourcemaps
- preview 也送事件：
  - 確認 `NUXT_PUBLIC_SENTRY_DSN` 沒有誤設到 preview scope
  - 確認 preview context 沒有被手動帶成 `CONTEXT=production`
