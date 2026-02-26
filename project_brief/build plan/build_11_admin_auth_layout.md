# Build 11 — Admin: Auth & Layout

> **Type:** Frontend
> **Estimated Time:** 1–2 hrs
> **Dependencies:** Build 07 (RLS + admin user)
> **Context Files:** YOROS_UNIVERSAL_PROJECT_BRIEF.md §7 (Admin Panel)
> **Reuse from Blindly:** ✅ 85% — same admin shell, different sidebar items

---

## Objective

Build the admin authentication flow and dashboard shell — login page, sidebar navigation, top bar, and the base layout that all admin pages share. Plus the settings page, media library, and activity log viewer. Admin panel is English only (no i18n). Dark mode toggle IS included.

---

## Tasks

### 1. Login Page

**`src/app/(admin)/login/page.tsx`**

- Email + password form
- Supabase Auth `signInWithPassword`
- Error display (invalid credentials, network error)
- On success → redirect to `/admin`
- Brand placeholder styling (accent colour on CTA)
- If already authenticated → redirect to `/admin`

### 2. Admin Layout

**`src/app/(admin)/admin/layout.tsx`**

Desktop layout:
```
+--------------------------------------------------+
|  [Logo]    The Deck Lab Admin    [Theme] [User]  |  <- Top bar
+------------+-------------------------------------+
|            |                                     |
|  Dashboard |   Main Content Area                 |
|  Materials |                                     |
|  Products  |   (children rendered here)          |
|  Kits      |                                     |
|  Config    |                                     |
|  Pricing   |                                     |
|  Import    |                                     |
|  Orders    |                                     |
|  Quotes    |                                     |
|  Leads     |                                     |
|  Calculator|                                     |
|  Settings  |                                     |
|  --------  |                                     |
|  Media     |                                     |
|  Activity  |                                     |
|            |                                     |
+------------+-------------------------------------+
```

Mobile: sidebar collapses into a hamburger menu (shadcn Sheet).

**Sidebar navigation items:**

| Label | Icon | Route | Description |
|-------|------|-------|-------------|
| Dashboard | LayoutDashboard | /admin | Stats overview |
| Materials | TreePine | /admin/materials | Material types CRUD |
| Products | Package | /admin/products | Shop products + variants |
| Kits & Bundles | Gift | /admin/kits | Bundle builder |
| Configurator | Ruler | /admin/configurator | Deck types, rates, extras, directions, profiles, finishes |
| Pricing | DollarSign | /admin/pricing | Markup cascade config |
| Price Import | Upload | /admin/import | CSV/XLS import |
| Orders | ShoppingCart | /admin/orders | Order management pipeline |
| Quotes | FileText | /admin/quotes | Saved quotes / abandoned carts |
| Leads | Users | /admin/leads | Consultations, samples, contacts |
| Calculator | Calculator | /admin/calculator | Calculator constants config |
| Settings | Settings | /admin/settings | Site settings (contact, social, SEO) |
| — separator — | | | |
| Media Library | Image | /admin/media | File/image uploads |
| Activity Log | Activity | /admin/activity | Audit trail |

Active state: accent left border + muted background on current route.

### 3. Top Bar

- Left: Logo (placeholder) + "Admin" text
- Right: Dark mode toggle (ThemeToggle) + User avatar/initial + name + role badge + logout button
- Fetch current user from Supabase Auth + user_profiles

### 4. Dashboard Page

**`src/app/(admin)/admin/page.tsx`**

Stats cards (wire up real count queries):

```
+----------------+  +----------------+  +----------------+  +----------------+
|  Orders Today  |  |  Revenue MTD   |  |  Pending       |  |  Open Leads    |
|  0             |  |  R 0           |  |  Quotes: 0     |  |  Consults: 0   |
|                |  |                |  |                |  |  Samples: 0    |
+----------------+  +----------------+  +----------------+  +----------------+
```

Second row (Deck Lab specific):
```
+----------------+  +----------------+  +----------------+  +----------------+
|  Shop Orders   |  |  Install Orders|  |  Build Plans   |  |  Products      |
|  0             |  |  0             |  |  Generated: 0  |  |  Active: 0     |
+----------------+  +----------------+  +----------------+  +----------------+
```

Use skeleton loaders while data loads. Real data from count queries on orders, saved_quotes, consultation_requests, sample_requests, products.

### 5. Settings Page

**`src/app/(admin)/admin/settings/page.tsx`**

Tabbed interface grouped by site_settings category:

| Tab | Settings |
|-----|----------|
| General | site_name, site_tagline, site_description, logo_url, logo_dark_url, favicon_url |
| Contact | contact_email, contact_phone, contact_whatsapp, contact_address |
| Social | social_facebook, social_instagram, social_linkedin, social_tiktok, social_youtube |
| SEO | seo_default_title, seo_default_description, seo_og_image, google_analytics_id, google_search_console |

**Note:** Pricing and calculator settings are managed in their dedicated admin pages (Builds 15 and Calculator admin), not in the general settings page.

Each setting renders as appropriate input by `value_type`. Save button per tab. Toast on success.

### 6. Media Library

**`src/app/(admin)/admin/media/page.tsx`**

Same pattern as Blindly:
- Grid view of uploaded images
- Upload → Supabase Storage → create media record
- Click → detail with editable alt text
- Copy URL button
- Delete with confirmation
- Filter by folder, search by filename

### 7. Activity Log

**`src/app/(admin)/admin/activity/page.tsx`**

Same pattern as Blindly:
- Table view, newest first
- Columns: Date, User, Action, Entity, Details
- Filter by action type, entity type, date range
- Paginated (20 per page)

### 8. Auth Guard + Logout

- Middleware handles route protection (Build 01)
- Layout verifies user on mount
- Session expiry → redirect to login with toast
- Logout → `signOut()` → redirect to `/login`
- User profile in React context for top bar

---

## Acceptance Criteria

```
✅ Login page authenticates via Supabase Auth
✅ Invalid credentials show error message
✅ Successful login redirects to /admin
✅ Admin layout renders with sidebar + top bar + content area
✅ Sidebar highlights active route
✅ Mobile: sidebar collapses to hamburger menu
✅ Dark mode toggle works in admin
✅ Dashboard shows stat cards with real count queries
✅ Settings page loads/saves all settings grouped by category
✅ Media library uploads to Supabase Storage and displays files
✅ Activity log displays entries with pagination
✅ Logout clears session and redirects to /login
✅ Non-admin users cannot access /admin routes
✅ Admin panel is English only (no language switcher)
```

---

## Notes for Claude Code

- Copy the Blindly admin layout structure and adapt sidebar items
- Dark mode toggle in the admin top bar (both admin and public support dark mode)
- No i18n in admin — all labels are hardcoded English strings
- The sidebar has more items than Blindly because Deck Lab has more distinct modules (materials, products, kits, configurator, calculator are all separate)
- Keep it functional, not decorative. Clean shadcn/ui components, consistent spacing.
