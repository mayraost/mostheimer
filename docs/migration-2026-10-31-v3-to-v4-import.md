# Data migration note — old Vercel/Neon DB → new Coolify Postgres (2026-10-31)

Old Payload CMS v3 (Drizzle/Neon) prod content was imported into the new Payload v4 beta
schema (migration `20261031_221848_init`) via SQL script (`/tmp/opencode/import.sql`).

## Imported (direct, same schema)

- **pages / pages_locales** — 9 pages + 18 locales, old ids kept (home=4), `pages_id_seq`/`pages_locales_id_seq` setval'ed.
- **pages_blocks_hero** — 18 rows (`_locales`-localized blocks). Columns dropped by v4 schema:
  `show_stack_badge`, `cta_label2`, `cta_link2` (home hero had a second CTA "Check Track Record" → lost).
- **pages_blocks_call_to_action** — 12 original rows, columns identical.
- **pages_blocks_feature_grid(\_features)** — 2 grids + 8 features (off-screen page), identical; icon
  names validated against the new `enum_pages_blocks_feature_grid_features_icon_name` (all Lucide).

## Remapped (rename/featurize your prior schema)

1. **bento_grid → feature_grid**: `_pages-blocks/bento-grid` does not exist in the v4 code (only
   CallToAction, FeatureGrid, Hero, ImageText, RichText). Bento grids were imported as featureGrid
   blocks (heading preserved, "What actually matters." / "Was wirklich zählt."), the 5 tiles as
   features array. **Data lost in the featurize step:** per-tile `highlight` subtitle,
   `cta_label`/`cta_link` (tile links to subsection pages), `featured` flag.
2. **status_block → call_to_action**: heading = title, text = badge label + description + network
   topics folded in as "Topics: a · b · c", `style=primary`, no button. Data folded, no per-field loss
   except the _visual_ badge chip and topic-list rendering; no `button_label/button_link` (renders an
   empty link pill in CallToActionBlock — cosmetic follow-up below).
3. **tech_section + key_facts → rich_text** (Lexical jsonb): 38 sections (8 languages × pages) as
   `richText` blocks — `heading` → h2, `section_label` → italic paragraph, `body` → one paragraph per
   line, `key_facts` → bullet list `Label: Value`. Content preserved structurally; **the shipped
   `RichTextBlock.tsx` is a stub that renders the raw JSON** (dangerouslySetInnerHTML with
   `JSON.stringify`) — implement a real Lexical renderer (e.g. `@payloadcms/richtext-lexical/react`)
   in a follow-up component step. `block_name` came out `NULL` for all old rows.
4. **navigation** — v4 global is _not_ localized (no `_locale` on header/footer link arrays): only the
   7 EN header links + 2 EN footer links were imported; the 9 DE rows were dropped.
5. **translations** — v4 global is flat (single row, no `translations_locales`): the EN row was
   imported; the DE strings (settings/common labels) are lost; UI shows EN strings on `/de` for now.

## Skipped (data gaps → later component/feature work)

- **not_found global** (1 doc + 2 locales of 404 texts) — no table/global in the v4 code; 404 texts lost.
- **site_settings** — old DB had 0 rows; nothing imported, v4 defaults (`site_name`, etc.) apply.
- **users_sessions** — skipped per plan (1 expired session in old DB).
- Per-hero `show_stack_badge` (home hero stack badge) and second hero CTA lost (columns absent in v4).
- Bento/status/tech-section rich block presets described above are structural stand-ins; if the next
  step reintroduces native `bentoGrid`/`statusBlock`/`techSection` blocks, data was carried faithfully
  in the re-mapped tables but is no longer field-for-field.

## Not imported

- `neon_auth.*` (Better-Auth infra, not Payload data).
- `payload_migrations` (contains only old `dev` row; untouched in prod — prod keeps `dev,20261031_221848_init`).
- `media` — old DB had 0 rows.
- `users_sessions` — skipped per plan.

## Follow-up candidates

- Replace `RichTextBlock.tsx` stub with a real Lexical renderer (content already present).
- CallToActionBlock renders an empty link when `buttonLabel`/`buttonLink` are NULL (status block on home) — add a guard.
- Consider localized `navigation`/`translations` arrays in v4 to restore DE strings from this note's source data (`/tmp/opencode/old-content.json`).
- Home hero: re-add second CTA / stack badge to Hero block if desired.
- Tech-stack page: craft a dedicated techSection block (key facts currently only as bullet list).
