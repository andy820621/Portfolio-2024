# BarZ Hsieh ポートフォリオ

> クリエイティブWebデベロッパー / フロントエンドエンジニア / フォトグラファー

[![Deploy Status](https://www.netlify.com/img/deploy/button.svg)](https://www.netlify.com/)

このプロジェクトは BarZ Hsieh の個人ウェブサイト兼ポートフォリオで、Nuxt 3、TypeScript、@nuxt/content、i18n、SEO、PWA などの最新フロントエンド技術を採用し、多言語対応、コンテンツ管理、構造化データ、SEO ベストプラクティスをサポートしています。

[中文](./README.zh.md) | [English](./README.md)

---

## 主な機能

- **Nuxt 3 + TypeScript**: 高速開発体験を提供するモダンなSSR/SPAアーキテクチャ
- **@nuxt/content**: 多言語対応のMarkdownベースコンテンツ管理システム
- **国際化 (i18n)**: 中国語・英語切り替え対応、URL prefix_except_default戦略
- **SEO & Schema.org**: 構造化データ、サイトマップ、Open Graph、Twitter Cardの自動生成
- **画像ライセンススキーマ**: ギャラリー/プロジェクトページで画像ライセンス情報を自動生成、Google画像検索のライセンスリッチスニペット対応
- **自動化スクリプト**: プロジェクト画像メタデータ/マッピングの自動生成
- **Netlifyデプロイ**: 自動デプロイメント

---

## プロジェクト構造

- `pages/`: Nuxtルートページ（ホーム、ブログ、プロジェクト、ギャラリー、ライセンスなど）
- `content/`: Markdownコンテンツ（多言語about、license、posts、projects、demos）
- `data/`: 静的データ（galleryData、navbarData、SEO設定など）
- `components/`: UIコンポーネント（NavBar、Footer、LightBox、TagsFilter...）
- `composables/`: 再利用可能なロジック（SEO、Breadcrumb、コンテンツクエリ...）
- `public/`: 静的アセット（画像、favicon...）
- `scripts/`: 自動化スクリプト（画像メタデータ/マッピング生成）
- `server/api/`: カスタムサイトマップAPI

---

## コンテンツライセンス

- **ソースコード**: MIT License、ルートディレクトリの `LICENSE` を参照
- **ウェブサイトコンテンツ/画像**: 特別な記載がない限り、[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ja) でライセンス、詳細は `/license` ページを参照

---

## クイックスタート

### お勧め前提条件

- Node.js 20.19.0以上
- pnpm（お勧め）

メモ：このプロジェクトは `package.json` の `volta.node` により Volta で Node バージョンを固定しています。ローカルでは Volta の利用を推奨し、pnpm は `packageManager` に従って Corepack が管理します。
	- Volta のインストール（macOS zsh）：`curl https://get.volta.sh | bash`
	- Corepack を有効化：`corepack enable`

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd Portfolio\ 2024

# 依存関係をインストール
pnpm install

# 開発サーバーを起動
pnpm dev
```

### 利用可能なスクリプト

```bash
pnpm dev          # 開発サーバーを起動
pnpm build        # 本番用ビルド
pnpm generate     # 静的サイト生成
pnpm preview      # 本番ビルドをプレビュー
pnpm lint         # ESLintを実行
pnpm lint:fix     # ESLintの問題を修正
pnpm typecheck    # TypeScript型チェックを実行
```

---

## 開発

### コンテンツの追加

1. **ブログ投稿**: `content/en/` または `content/zh/` にMarkdownファイルを追加
2. **プロジェクト**: `content/en/projects/` または `content/zh/projects/` にプロジェクトデータを追加
3. **ギャラリー**: `data/galleryData.ts` に新しいアルバムと画像を追加, 画像は `public/images/gallery/` に配置

### カスタマイズ

- **SEO**: デフォルトメタタグは `data/seoData.ts` で修正
- **ナビゲーション**: メニュー項目は `data/navbarData.ts` で更新
- **スタイリング**: グローバルスタイルでCSS変数をカスタマイズ
- **i18n**: `i18n/` ディレクトリで翻訳を追加

---

## デプロイメント

このプロジェクトはNetlifyデプロイメント用に設定済み:

- gitプッシュでの自動ビルド
- `netlify.toml` でのカスタムリダイレクトルール
- 環境固有の設定
- 静的アセットのCDN最適化

---

## 関連リンク

- [ライブウェブサイト](https://barz.app)
- [Nuxt 3 ドキュメント](https://nuxt.com/docs/getting-started/introduction)
- [ライセンス情報](https://barz.app/license)

---

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

---

## ライセンス

このプロジェクトはデュアルライセンス:

- **ソースコード**: [MIT License](./LICENSE)
- **コンテンツ & 画像**: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

詳細情報は[ライセンスページ](https://barz.app/license)を参照してください。
