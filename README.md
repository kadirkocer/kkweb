# Kadir's Personal Website

A modern, accessible, and performant personal website built with Next.js 14, featuring a dark-only theme, internationalization, and privacy-friendly embeds.

## ✨ Features

- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Dark-Only Design**: Beautiful dark theme with subtle gradients and shadows
- **Internationalization**: Turkish (default) and English support with next-intl
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **Performance**: Optimized for Core Web Vitals and Lighthouse scores ≥95
- **SEO Optimized**: Dynamic OG images, JSON-LD schema, and meta tags
- **Print-Friendly**: Clean resume page with optimized print styles
- **Privacy-First**: Lightweight embeds that only load heavy content on interaction

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm (or npm)
- Git

### One-Command Setup & Start

The easiest way to get started is with the KKWeb development manager:

```bash
git clone <repository-url>
cd kkweb
./kkweb
```

**That's it!** The script automatically:
- ✅ Installs all dependencies
- ✅ Sets up environment variables
- ✅ Runs health checks  
- ✅ Starts the development server
- ✅ Opens all access points

**Access Points:**
- 🌐 **Website**: http://localhost:3000
- 🔧 **Admin Panel**: http://localhost:3000/admin (admin/kkweb2024)
- 🎮 **Interactive**: http://localhost:3000/interactive

### Manual Setup (Alternative)

If you prefer manual setup:

1. **Install dependencies**: `pnpm install`
2. **Copy environment**: `cp .env.example .env.local`
3. **Start server**: `pnpm dev`

**📖 For detailed script usage, see [KKWEB_SCRIPT.md](./KKWEB_SCRIPT.md)**

## 🛠️ Development Scripts

### KKWeb Manager (Recommended)
- `./kkweb` or `npm run dev` - Start complete development environment
- `./kkweb stop` or `npm run stop` - Stop all services  
- `./kkweb status` or `npm run status` - Check if running
- `./kkweb health` or `npm run health` - Run health checks

### Traditional Commands
- `npm run build` - Build for production
- `npm run prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript checks  
- `npm run format` - Format code with Prettier

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (contact, OG image)
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── resume/           # Resume page
│   └── now/              # Current focus page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Site header
│   ├── footer.tsx        # Site footer
│   ├── hero.tsx          # Hero section
│   └── ...               # Other components
├── content/              # MDX content
│   ├── tr/               # Turkish content
│   └── en/               # English content
├── data/                 # JSON data files
│   ├── social.json       # Social media links
│   ├── projects.json     # Project information
│   ├── experience.json   # Work experience
│   └── embeds.json       # Social media embeds
├── lib/                  # Utilities and configurations
├── messages/             # i18n message files
├── styles/               # Global styles
└── site.config.ts        # Site configuration
```

## 🎨 Customization

### Content Management

1. **Personal Information**: Edit `site.config.ts`
2. **About Sections**: Update `content/tr/about.mdx` and `content/en/about.mdx`
3. **Projects**: Modify `data/projects.json`
4. **Experience**: Update `data/experience.json`
5. **Social Links**: Edit `data/social.json`
6. **Embeds**: Configure `data/embeds.json`

### Styling

- **Colors**: Modify `tailwind.config.ts` and `styles/globals.css`
- **Fonts**: Update `app/layout.tsx` font imports
- **Components**: Customize in `components/` directory

### Internationalization

The site uses **cookie-based locale detection** (no URL prefixes):

- **Messages**: Edit `messages/tr.json` and `messages/en.json`
- **Content**: Add MDX files in `content/[locale]/`
- **Default Locale**: Turkish (`tr`) - change in `i18n.ts`
- **Locale Storage**: Stored in `locale` cookie, persists across visits
- **Switching**: Use the language switcher component (no page reload needed)

## 🧩 shadcn/ui Setup

This project uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

**Included Components**:
- button, card, avatar, badge, tabs
- accordion, tooltip, dialog, separator, sheet

## 📱 Embeds

The site supports privacy-friendly embeds for:

- **YouTube**: Lite embeds with click-to-load
- **Spotify**: Direct embed integration
- **X/Twitter**: Lightweight link cards
- **Instagram**: Static preview cards
- **Threads**: Link preview cards

Embeds are configured in `data/embeds.json` and only load heavy content when users interact with them.

## 📊 Analytics

Optional Plausible Analytics integration:

1. Set `PLAUSIBLE_DOMAIN` in your environment variables
2. Script loads automatically in production
3. Privacy-friendly, no cookies, GDPR compliant

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import project in Vercel**
3. **Set environment variables**:
   - `NEXT_PUBLIC_SITE_URL`
   - `PLAUSIBLE_DOMAIN` (optional)
   - `GOOGLE_SITE_VERIFICATION` (optional)
4. **Deploy**

### Other Platforms

The site can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with PM2

## ✅ Local Build Checklist

Before deploying, verify locally:

```bash
# 1. Install dependencies
pnpm install

# 2. Type check
pnpm typecheck

# 3. Lint
pnpm lint

# 4. Build
pnpm build

# 5. Start production server
pnpm start

# 6. Test at http://localhost:3000
# 7. Run Lighthouse audit (aim for ≥95 on mobile and desktop)
```

## 🔧 Environment Variables

### Required for Production
- `NEXT_PUBLIC_SITE_URL` - Your site's URL (required for OG images)
- `ADMIN_USERNAME` - Admin panel username (required for /admin access)
- `ADMIN_PASSWORD` - Admin panel password (required for /admin access)

### Optional
- `PLAUSIBLE_DOMAIN` - Your Plausible analytics domain
- `GOOGLE_SITE_VERIFICATION` - Google Search Console verification
- `CONTENT_STORAGE` - Set to `FILE` for development to enable admin file writing
- `NODE_ENV` - development/production

### Security & Admin Panel

The admin panel (`/admin`) is protected by HTTP Basic Authentication. You **must** set `ADMIN_USERNAME` and `ADMIN_PASSWORD` environment variables. 

**Development setup:**
```bash
# .env.local
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_secure_password
CONTENT_STORAGE=FILE
```

**Production considerations:**
- Admin storage operations return 501 (Not Implemented) by default for security
- Build/restart endpoints are disabled in production
- Use strong credentials and HTTPS in production

## 🎯 Performance Features

- **Image Optimization**: next/image with responsive sizes
- **Font Optimization**: next/font with display swap
- **Code Splitting**: Dynamic imports for heavy components
- **Tree Shaking**: Optimized icon imports from lucide-react
- **Edge Functions**: OG image generation at the edge
- **Static Generation**: Pre-rendered pages where possible

## ♿ Accessibility Features

- **Semantic HTML**: Proper landmarks and heading hierarchy
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Visible focus indicators
- **Screen Reader Support**: ARIA labels and descriptions
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Reduced Motion**: Respects prefers-reduced-motion
- **Skip Links**: Skip to main content functionality

## 🛡️ Security & Privacy

- **Content Security Policy**: Configured in next.config.mjs
- **External Links**: noopener noreferrer attributes
- **Privacy-First Embeds**: No tracking until user interaction
- **No Tracking Cookies**: Plausible analytics is cookie-free
- **Input Validation**: Zod schemas for API routes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 💬 Support

For questions or issues:
1. Check the [GitHub Issues](https://github.com/kadir/personal-site/issues)
2. Create a new issue if needed
3. Email: hello@kadir.dev

---

Built with ❤️ by Kadir using Next.js 14, TypeScript, and Tailwind CSS.