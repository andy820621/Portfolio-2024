# GA4 Outbound Click Events

本文件定義專案的 GA4 外連點擊事件規格與設定方式。

## Event Contract

- Event name: `outbound_click`
- Trigger: 使用者點擊站外連結

### Event Parameters

- `destination_type`: `github` | `npm` | `demo` | `social` | `tool` | `other`
- `destination_url`: 外連完整 URL
- `destination_domain`: 外連網域（例如 `github.com`、`figma.com`）
- `link_group`: 外連群組（例如 `tech_stack`、`design_tools`）
- `source_component`: 觸發來源元件名稱（例如 `navbar`, `demo_card`, `markdown_content`）
- `source_page`: 目前頁面路徑
- `item_id`: 可選，內容識別（例如 demo baseName、文章 slug）

## Phase 1 Coverage

- `app/components/NavBar.vue`
  - GitHub、Instagram 外連
  - `destination_type = github`（GitHub）或 `social`（Instagram）
  - `source_component = navbar`

- `app/components/LinkWithTooltip.global.vue`
  - LinkWithTooltip 外連（例如 Tech Stack / Design Tools）
  - 依網域判斷 `destination_type`（`github` / `npm` / `tool`）
  - `link_group` 由呼叫端標記（例如 `tech_stack`、`design_tools`）
  - `source_component = link_with_tooltip`

- `app/components/demo/item.vue`
  - Demo 卡片外連（link/github/codepen）
  - `destination_type = demo`
  - `source_component = demo_card`

- `app/components/WrapperPost.vue`
  - Markdown 內容區塊外連（事件委派）
  - 僅追蹤 `github.com` / `npmjs.com`
  - `destination_type` 依網域判斷（`github` / `npm`）
  - `source_component = markdown_content`

## GA4 Custom Dimensions

在 GA4 後台建立以下 `Event-scoped` custom dimensions：

1. `destination_type`
1. `destination_domain`
1. `link_group`
1. `source_component`
1. `source_page`
1. `item_id`

`destination_url` 不建議建立 custom dimension（高基數）。

## Verification

1. 確認 `NUXT_PUBLIC_GTAG_ID` 正確，且 production 啟用。

1. 部署到可送資料的環境後，開啟 GA4 DebugView。

1. 分別點擊以下入口：

- NavBar GitHub、Instagram
- LinkWithTooltip 外連（Tech Stack 或 Design Tools 任一）
- Demo 卡片外連
- 文章/專案內容中的 npm 或 github 連結

1. 驗證每筆事件都包含上述參數。
