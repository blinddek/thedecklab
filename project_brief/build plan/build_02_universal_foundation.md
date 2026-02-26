# Build 02 — Universal Database Foundation

> **Type:** Migration
> **Estimated Time:** 45 min
> **Dependencies:** Build 01
> **Context Files:** TECHNICAL_DESIGN.md §2 (Migration 001), YOROS_UNIVERSAL_PROJECT_BRIEF.md
> **Reuse from Blindly:** ✅ 100% — identical SQL

---

## Objective

Create the universal Yoros foundation tables that every project shares. This migration is copied directly from Blindly — zero changes needed.

---

## Tasks

### 1. Create Migration File

Create `supabase/migrations/001_foundation.sql` with the exact SQL from Blindly's Migration 001.

### 2. Tables to Create

| Table | Purpose |
|-------|---------|
| site_settings | Key-value config store (site name, contact info, social links, SEO, pricing) |
| navigation_items | Admin-manageable nav (header, footer, mobile) |
| pages | Dynamic pages with SEO fields + JSONB content |
| user_profiles | Auto-created on signup, role-based (user/admin/super_admin) |
| contact_submissions | Lead capture from contact forms |
| newsletter_subscribers | Email signup tracking |
| media | File/image library (Supabase Storage paths) |
| activity_log | Audit trail for admin actions |

### 3. Functions & Triggers

- `update_updated_at()` — reusable trigger function for all tables with `updated_at`
- `handle_new_user()` — auto-creates user_profiles row when auth.users row is inserted
- Apply `set_updated_at` trigger to: site_settings, navigation_items, pages, user_profiles

### 4. Seed Essential Settings

The migration should INSERT the standard Yoros settings keys (all with empty values — populated via admin panel later):

- General: site_name, site_tagline, site_description, logo_url, logo_dark_url, favicon_url
- Contact: contact_email, contact_phone, contact_whatsapp, contact_address
- Social: social_facebook, social_instagram, social_linkedin, social_tiktok, social_youtube
- SEO: seo_default_title, seo_default_description, seo_og_image, google_analytics_id, google_search_console

### 5. Generate TypeScript Types

Run `supabase gen types typescript` or manually create `src/types/database.ts` with types for all foundation tables.

### 6. Server Actions

Create `src/lib/actions/settings.ts`:
- `getPublicSettings()` — fetches all site_settings where is_public = true
- `getSettingsByCategory(category)` — fetches settings for a category
- `updateSetting(key, value)` — admin only, updates a setting
- `getAllSettings()` — admin only, fetches ALL settings including private

---

## SQL

Copy the full Migration 001 SQL from the TECHNICAL_DESIGN.md or from Blindly's `001_foundation.sql`. The SQL is identical and includes:

```sql
-- 1. SITE SETTINGS (key-value store with type, category, public flag)
-- 2. NAVIGATION (location-based, parent-child, display_order)
-- 3. PAGES (slug, title, SEO fields, JSONB content, published flag)
-- 4. USER PROFILES (references auth.users, role-based, auto-created trigger)
-- 5. CONTACT SUBMISSIONS (name, email, phone, message, source, metadata)
-- 6. NEWSLETTER SUBSCRIBERS (email, status, source)
-- 7. MEDIA LIBRARY (filename, storage_path, url, mime_type, alt_text, folder)
-- 8. ACTIVITY LOG (user_id, action, entity_type, entity_id, details JSONB)
-- 9. update_updated_at() trigger function
```

---

## Acceptance Criteria

```
✅ Migration runs without errors
✅ All 8 tables exist with correct columns
✅ site_settings seeded with standard Yoros keys
✅ New Supabase Auth user automatically creates user_profiles row
✅ update_updated_at trigger fires on row update
✅ TypeScript types generated and importable
✅ getPublicSettings() returns settings where is_public = true
✅ Activity log indexes created (user_id, entity_type+entity_id, created_at DESC)
```

---

## Notes for Claude Code

- This is an **exact copy** from Blindly — do not modify the SQL
- The Deck Lab-specific settings (pricing, calculator constants) are added in Migration 003
- Don't seed any Deck Lab-specific content yet — that's Build 08
- Verify the auth trigger works by creating a test user in Supabase dashboard
