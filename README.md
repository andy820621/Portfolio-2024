# BarZ Hsieh Portfolio

> Creative Web Developer / Frontend Engineer / Photographer

[![Deploy Status](https://www.netlify.com/img/deploy/button.svg)](https://www.netlify.com/)

This is the personal website and portfolio of BarZ Hsieh, built with modern frontend technologies including Nuxt 3, TypeScript, @nuxt/content, i18n, SEO, PWA, supporting multilingual content management, structured data, and SEO best practices.

[中文](./README.zh.md) | [日本語](./README.ja.md)

---

## Features

- **Nuxt 3 + TypeScript**: Modern SSR/SPA architecture with lightning-fast development experience
- **@nuxt/content**: Markdown-driven content management with multilingual support
- **Internationalization (i18n)**: Support for Chinese/English switching with URL prefix_except_default strategy
- **SEO & Schema.org**: Auto-generated structured data, Sitemap, Open Graph, Twitter Card
- **Image License Schema**: Gallery/Projects pages auto-generate image licensing information, supporting Google Images licensing rich snippets
- **Automation Scripts**: Auto-generation of project image metadata/mapping
- **Netlify Deployment**: Automated deployment

---

## Project Structure

- `pages/`: Nuxt route pages (home, blog, projects, gallery, license, etc.)
- `content/`: Markdown content (multilingual about, license, posts, projects, demos)
- `data/`: Static data (galleryData, navbarData, SEO configurations, etc.)
- `components/`: UI components (NavBar, Footer, LightBox, TagsFilter...)
- `composables/`: Reusable logic (SEO, Breadcrumb, content queries...)
- `public/`: Static assets (images, favicon...)
- `scripts/`: Automation scripts (image metadata/mapping generation)
- `server/api/`: Custom sitemap API

---

## Content Licensing

- **Source Code**: MIT License, see `LICENSE` in the root directory
- **Website Content/Images**: Unless otherwise noted, licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en), see `/license` page for details

---

## Quick Start

### Prerequisites（recommended）

- Node.js 20.19.0+
- pnpm (recommended package manager)

Tip: This project uses Volta to pin the Node version via `package.json` (see the `volta.node` field). We recommend installing Volta locally and letting Corepack manage pnpm via the `packageManager` field.
	- Install Volta (macOS zsh): `curl https://get.volta.sh | bash`
	- Activate Corepack and respect packageManager: `corepack enable`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Portfolio\ 2024

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm generate     # Generate static site
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm typecheck    # Run TypeScript type checking
```

---

## Development

### Adding Content

1. **Blog Posts**: Add markdown files to `content/en/` or `content/zh/`.
2. **Projects**: Add project data to `content/en/projects/` or `content/zh/projects/`.
3. **Gallery**: Update `data/galleryData.ts` with new albums and images, ensure images are placed in `public/images/gallery/`.

### Customization

- **SEO**: Modify `data/seoData.ts` for default meta tags
- **Navigation**: Update `data/navbarData.ts` for menu items
- **Styling**: Customize CSS variables in global styles
- **i18n**: Add translations in `i18n/` directory

---

## Deployment

This project is configured for Netlify deployment with:

- Automatic builds on git push
- Custom redirect rules in `netlify.toml`
- Environment-specific configurations
- CDN optimization for static assets

---

## Related Links

- [Live Website](https://barz.app)
- [Nuxt 3 Documentation](https://nuxt.com/docs/getting-started/introduction)
- [License Information](https://barz.app/license)

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is dual-licensed:

- **Source Code**: [MIT License](./LICENSE)
- **Content & Images**: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

See the [license page](https://barz.app/license) for detailed information.
