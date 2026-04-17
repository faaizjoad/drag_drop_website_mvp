# WebBuilder MVP — Claude Context

## Project Overview

A drag-and-drop website builder (Puck editor) where users create sites, add pages, edit with a visual editor, and publish. Supports custom domains via Vercel Domains API.

**Live URL**: Deployed on Vercel. Slug-based: `yourapp.vercel.app/sites/[slug]`

---

## Tech Stack

- **Framework**: Next.js 14 App Router (TypeScript)
- **Editor**: `@puckeditor/core` (Puck)
- **Auth**: NextAuth v5 (`@auth/prisma-adapter`) — credentials provider
- **DB**: PostgreSQL via Prisma (hosted on Supabase/Neon)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel
- **Email**: Resend (not yet wired up)
- **Validation**: Zod

---

## Route Groups

| Group | Path prefix | Purpose |
|-------|------------|---------|
| `(auth)` | `/login`, `/register` | Auth pages, no sidebar |
| `(dashboard)` | `/dashboard/...` | Authenticated app with sidebar |
| `(published)` | `/sites/[slug]/...` | Public published pages, no auth |

Route groups don't affect URLs — they only affect which layout wraps pages.

---

## Key Files

### Published Pages
- `src/app/(published)/sites/[slug]/[[...path]]/page.tsx` — ISR (60s), requires `isPublished: true`
  - `getSite()` tries `customDomain` lookup first, then `slug`
  - `getPage()` finds page by `siteId + path + isPublished: true`
  - 404s if site doesn't exist OR no published page at the requested path

### Editor
- `src/components/editor/editor-client.tsx` — Main Puck editor wrapper
  - `EditorControls` component defined at module level (NOT inside `EditorClient`) so it can call `usePuck()` inside Puck's React tree via `renderHeaderActions`
  - Keyboard shortcuts: Ctrl+S (save), Ctrl+Z (undo), Ctrl+Y/Ctrl+Shift+Z (redo), Delete/Backspace (remove selected component)
  - `previewUrl = /preview/${pageId}` (not slug-based)
- `src/app/preview/[pageId]/page.tsx` — Authenticated preview outside dashboard group (no sidebar)
- `src/app/(dashboard)/dashboard/sites/[siteId]/pages/[pageId]/edit/layout.tsx` — z-index: 60 (above sidebar's z-50)

### Dashboard Shell
- `src/app/(dashboard)/layout.tsx` — Server component, renders `DashboardShell` + `ToastContainer`
- `src/components/dashboard/dashboard-shell.tsx` — Client component, manages mobile sidebar open/close
- `src/components/dashboard/sidebar.tsx` — Has `onClose` prop + mobile close button

### Site Settings Page
- `src/app/(dashboard)/dashboard/sites/[siteId]/page.tsx`
  - "View live" button: links to first published page (prefers `/`, falls back to first published path)
  - Disabled/greyed when no pages are published
  - Includes `CustomDomainForm` section

### Custom Domains
- `src/lib/vercel-domains.ts` — Vercel Domains API wrapper (graceful degradation when env vars missing)
- `src/app/api/sites/[siteId]/domain/route.ts` — POST/GET/DELETE for domain management
- `src/components/dashboard/custom-domain-form.tsx` — UI with DNS instructions + status badge
- `src/middleware.ts` — Rewrites `custom-domain.com/path` → `/sites/custom-domain.com/path`

### Toast System
- `src/lib/toast.ts` — `toast(message, type)` fires custom DOM event `__app_toast__`
- `src/components/ui/toast.tsx` — `ToastContainer` listens for events, auto-removes after 3500ms

### Templates
- `src/components/dashboard/template-picker.tsx`
  - `selectUserTemplate()` must NOT call `onClose()` after `onSelect()` — doing so resets parent step to null

---

## Prisma Schema Notes

Uses `prisma db push` (no migration files). Schema lives at `prisma/schema.prisma`.

Key models:
- `Site`: `id, userId, name, slug (unique), customDomain (unique?), globalStyles, favicon`
- `Page`: `id, siteId, title, path, puckData (Json), isPublished (default: false), publishedAt, seoTitle, seoDesc`

**Important**: New pages always start as `isPublished: false`. Users must click "Publish" in the editor for a page to appear on the live site.

---

## Environment Variables

### Required (all environments)
```
DATABASE_URL=          # PostgreSQL connection string (pooled)
DIRECT_URL=            # PostgreSQL direct connection (for Prisma migrations)
NEXTAUTH_SECRET=       # Random secret for NextAuth
NEXTAUTH_URL=          # Full URL (e.g. https://yourapp.vercel.app)
```

### Optional (custom domain feature)
```
VERCEL_ACCESS_TOKEN=   # Vercel API token
VERCEL_PROJECT_ID=     # Vercel project ID
VERCEL_TEAM_ID=        # Vercel team ID (if applicable)
NEXT_PUBLIC_APP_DOMAIN= # e.g. yourapp.vercel.app
```

Without Vercel env vars, the custom domain form shows a "not configured" notice and skips Vercel API calls gracefully.

---

## Deployment (Vercel)

- `vercel.json`: `{ "buildCommand": "prisma generate && next build", "framework": "nextjs" }`
- `package.json` `postinstall`: `"prisma generate"` — runs on every Vercel install
- Build fails if ESLint errors exist — `no-empty-object-type` rule requires `type X = ...` not `interface X extends Y {}`

---

## Known Architectural Decisions

1. **`usePuck()` must be inside Puck's React tree** — that's why `EditorControls` is a top-level component rendered via `renderHeaderActions`, not rendered directly inside `EditorClient`

2. **Custom domain routing**: Middleware handles the rewrite; the published page `getSite()` tries `customDomain` first so both `yourapp.com/sites/slug` and `customdomain.com` resolve to the same content

3. **Preview route is outside `(dashboard)`**: `/preview/[pageId]` has its own layout (no sidebar) with auth check — prevents sidebar from showing in the preview iframe

4. **ISR on published pages**: `revalidate = 60` — live pages may be up to 60s stale after publishing

5. **"View live" links to first published page**, preferring path `/` if it exists — avoids 404 when the home page hasn't been created yet but other pages are published

---

## Common Gotchas

- Visiting `/sites/[slug]` 404s if no page with `path: "/"` is published for that site. The home page path must literally be `/`.
- `customDomain` field was added later — run `prisma db push` if column missing errors appear.
- Editor layout z-index must be > 50 (sidebar is z-50). Currently set to 60 in edit layout.
- The `selectedItem` from `usePuck()` needs `as unknown as { id: string }` cast to access `.id`.
