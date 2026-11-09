# Runbook — Project-Coding Showcase rollout (PR #92)

Branch `feat/projects` @ `5041add` · PR <https://github.com/mayraost/mostheimer/pull/92>
Written by the deploy-and-content preparation agent. **Nothing below has been executed**
except the read-only probes marked _(measured)_.

> ⚠️ **BLOCKER READ FIRST:** Prod `https://mostheimer.de/api/mcp` currently answers MCP
> `initialize` + `ping` but **every** `tools/list` / `tools/call` returns
> `-32601 Method not found` _(measured 09.11.2026, unauthenticated and with the MCP key)_.
> The Payload-MCP connector also exposes only `users, media, pages`. Two consequences:
> (a) **§4 cannot run via the Payload-MCP** until that endpoint is repaired;
> (b) **there are no preview images**, so `projects.coverImage` (required) has nothing to point at.

---

## 0. Facts measured in this session

| Check                                     | Result                                                                                                                                                                                         |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `gh pr checks 92`                         | `pending`, **total_count 0** — the repo has no CI checks; "pending" means "no checks configured"                                                                                               |
| `mergeable_state`                         | **`dirty`** — `origin/main` is `39f5b75`; the branch is 1 commit on `5041add` and **behind** `main` and/or conflicting. Must be resolved before merge                                          |
| Prod running commit                       | `39f5b75` (container `app-vcfotnzye7fklxrh10i81npl-20261109T174230`, image tag `…_app:39f5b75…`) → **= current `main`, the PR is not deployed**                                                |
| `/de/projects` on prod                 | **404**, `cf-cache-status: BYPASS`, `no-store` (Traefik catch-all → `placeholder-404`)                                                                                                         |
| `/api/purge-manifest` on prod             | **404** (route lands with the PR)                                                                                                                                                              |
| Cloudflare edge                           | healthy: `/de` → `HIT 200`, `cache-control: public, s-maxage=86400, …`                                                                                                                         |
| Coolify CF envs (key names only)          | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_PURGE_ZONES` present, **none** has `CLOUDFLARE_PURGE_ON_START` / `CF_WARM*`. `APP_PORT=3300`, published `0.0.0.0:3300→3000`          |
| Coolify rollback images                   | `list_rollback_images` → `images: []` (undocumented Coolify → empty; do not rely on it)                                                                                                        |
| **Payload `upload-instructions` on prod** | **broken/unrouted**: `POST /api/upload-instructions` → `403`, `PUT` (the signed URL the MCP hands out) → **`405`** _(measured)_. Payload's file transport for MCP uploads cannot be used as-is |
| Prod `media` collection                   | **0 documents**, and `media.create` has no `access.create` → API-key users are forbidden even server-side                                                                                      |
| Local dev DB                              | all 3 migrations applied; `translations_copy` seeded **48** `blocks.projectShowcase.*` + **26** `routes.project.*`; `commandItems.projects.*` = **0** rows                                 |
| `/tmp/opencode/project-copy-final.md`        | **does not exist** (nor `mostheimer-copy.md`); `/tmp/opencode/project-previews/` is **empty**                                                                                                     |

---

## 1. Pre-merge checks

### 1.1 Gate list (all must be green)

```bash
cd ~/.local/share/opencode/worktree/f0fd50/projects
gh pr view 92 --json mergeable,mergeStateStatus,statusCheckRollup
git fetch origin && git log --oneline -1 origin/main && git merge-base --is-ancestor origin/main HEAD; echo "up-to-date=$?"
```

1. `mergeable: MERGEABLE` (today: `dirty` → rebase/merge `origin/main`, resolve, re-push).
2. `statusCheckRollup` empty = nothing to wait for (no CI on this repo).
3. Local verify-chain (already green per PR body, re-run after the rebase):
   `npm run lint:fix && node node_modules/typescript/bin/tsc --noEmit && npm run typecheck && npx vitest run tests/int && npm run build`.
4. §1.2 migration audit passes.

### 1.2 Migration audit — additive only (all three files read line-by-line)

| File                                      | UP statements                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Touches pre-existing prod objects?                                                                                                                                                                    |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `20261109_171931_add_projects`       | 14 × `CREATE TABLE` (**all new**: `project_tags{,_locales,_rels}`, `_project_tags_v*`, `projects{,_locales,_texts,_rels}`, `_projects_v*`)<br>5 × `CREATE TYPE` (**all new**: `enum_projects_kind`, `enum_projects_status`, `enum__projects_v_version_kind`, `enum__projects_v_published_locale`, `enum__projects_v_version_status`)<br>50 × `ALTER TABLE … ADD COLUMN` — 24 on `media`, 24 on `_media_v` (`version_variants_*`), 2 on `payload_locked_documents_rels` (`project_tags_id`, `projects_id`)<br>~62 × `CREATE [UNIQUE] INDEX`, N × `ADD CONSTRAINT` (FKs), 14 × `DISABLE ROW LEVEL SECURITY` (new tables only) | **No.** `media`, `_media_v`, `payload_locked_documents_rels`, `pages`, `translations` are only **added to** (nullable columns / new FK columns / new RLS-off on brand-new tables). `users` untouched. |
| `20261109_175000_add_project_showcase_block` | 2 × `CREATE TABLE` (`pages_blocks_project_showcase`, `_pages_v_blocks_project_showcase`), 2 × `ADD CONSTRAINT … FOREIGN KEY` on those **new** tables, 8 × `CREATE INDEX` on them                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | **No.** `pages` / `_pages_v` are _referenced_ by FKs, never altered.                                                                                                                                  |
| `20261109_180000_seed_project_showcase_copy` | 1 × `INSERT INTO translations_copy … SELECT … WHERE NOT EXISTS` (idempotent)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | **No.** Only `translations_copy` (pre-existing, localized **array** table).                                                                                                                           |

- No `DROP` / `RENAME` / `SET NOT NULL` / `ALTER COLUMN` / `DROP TYPE` in any `up()` — all `DROP`s live in `down()`.
- **No enum churn**: the 5 `CREATE TYPE`s are new types; the prod `*_icon_name` enums (~2020 values, `Braces`) are untouched. Verify after the fact: `pg_enum` count unchanged.
- **Media variant columns are safe:** 24 per table, every one `varchar`/`numeric`, **zero `NOT NULL`**, no default → existing rows stay valid (`NULL` = "no variant yet"; `pickProjectImage` falls back to `original.url`). Count check: `grep 'ALTER TABLE "media" ADD COLUMN' … | wc -l` → 24, `_media_v` → 24.
- **Ordering:** Payload sorts by migration **name**. `171931` < `175000` < `180000` → the block table exists before the copy seed, `projects` before the block FK. `180000` depends **only** on `translations_copy`, which is years old → it would pass even alone. `175000` depends on `pages`/`_pages_v` (old) and `171931`'s tables are independent of it. **No inter-migration dependency beyond name order.**
- Prod-parity sanity (local DB already migrated): row counts after `up` = 0 projects, 0 tags, 3 `payload_migrations` rows for the project migrations.

---

## 2. Media / preview images — **NOT READY**

`ls -la /tmp/opencode/project-previews/` → **empty** _(measured)_. The earlier session's
copy/evidence files (`project-copy-final.md`, `mostheimer-copy.md`) are also gone.

### 2.1 What the images must be

| Variant        | Size         | Where it renders                                                                         |
| -------------- | ------------ | ---------------------------------------------------------------------------------------- |
| `tile`     | 768 × 432    | grid tile (`showcaseView.toShowcaseItem`, `projectView.cover`)                           |
| `tileWide` | 1280 × 720   | tile when `featured: true` (`ProjectShowcaseBlock` `slot = featured ? 'tileWide' : 'tile'`) |
| `hero`     | 1920 × 800   | detail hero (`projectView.hero`)                                                         |
| original       | ≥ 1920 × 800 | fallback for all three                                                                   |

All three are generated by `sharpTransformer` **from one original upload** — you upload one
16:9-ish source (≥ 1920 × 900, PNG/JPEG/WebP, ≤ 10 MB) per project and Payload derives the
crops. **Crop matters:** `position: 'centre'` → keep the meaningful content centred, avoid
UI text in the outer 10 % (the 12:5 hero cuts top/bottom).

Suggested filenames (one per project, source assets):
`project-audit-scanner.png`, `project-halloween-counter.png`, `project-home-assistant.png`, `project-site-architecture.png`.

### 2.2 Cross-checks before asking for the assets

1. `coverImage` is **required: true** on `projects` → a project cannot be created without it.
2. The **WebP transformer** needs the source _and_ payload has it in the image… fine.
3. **Media is unreadable for anonymous users only via `access.read: () => true`** — OK.
4. **Blocker:** `POST /api/upload-instructions` → 403 (no `access.create` on `media`);
   the signed `PUT` answers **405**. So even a full-access caller cannot push bytes.
   → Either (a) upload through the **Admin UI** (browser, logged-in editor), or
   (b) after the deploy, let the assistant upload via the **Payload-MCP** _if_ the
   `upload-instructions` route is fixed — it is not today.

### 2.3 Exact MCP steps (to run once bytes exist and MCP works)

```jsonc
// 1) instructions
{ "slug": "media", "filename": "project-audit-scanner.webp", "filesize": 184320,
  "mimeType": "image/webp" }                       // → getUploadInstructions
// 2) PUT the bytes to instructions.request.url (host = https://mostheimer.de, Content-Length exact)
// 3) createDocuments
{ "slug": "media",
  "documents": [{
    "data": { "alt": "Audit-Scanner – Dashboard mit CVE-Befunden / Audit scanner dashboard showing CVE findings" },
    "file": { "source": "uploadReference", "file": <instructions.file> }
  }],
  "returning": true }                                // → ids
```

`alt` is a **single, non-localized** field (`Media.ts`) → write **one** string that reads in both
languages. Tags can only be attached after step 3 (the ids do not exist before).

---

## 3. Content payload

> **There is no `project-copy-final.md`.** The four project documents below are therefore a
> **draft with factual placeholders** (`<…>` markers) — they must be replaced with verified
> text before publishing. Facts that _are_ verified: the PR body, `docs/design/projects-showcase.md`
> § 8 (names `audit-scanner`, `halloween-counter`, `home-assistant`), and prod anchors
> `/de/settings`, `/de/career` (`BORA`, `Allianz`, `hoerzu.de`).

### 3.0 Universal MCP write pattern (AGENTS.md § „MCP-Write-Muster")

`findDocuments`/`findGlobal` → merge in memory → `createDocuments`/`updateDocument`/`updateGlobal`
with the **complete** document → **re-read and diff**. Localized fields are `required: true`;
a partial write answers 200 and writes nothing. Projects/pages: always `draft: false` **and**
`_status: 'published'` (their `versions.drafts` will otherwise demote the doc). Never write
`id`/`createdBy`/`updatedBy`/`createdAt`/`updatedAt`/`globalType`.
**Wording guard** (`beforeValidate`): `staff`, `principal`, `mosthi`/`mostheimer` as a visible
label will reject the save.

### 3.1 Step A — tags first (`projectTags`, ids `"<tagId:slug>"` below)

| slug                | de               | en                |
| ------------------- | ---------------- | ----------------- |
| `developer-tooling` | Entwickler-Tools | Developer tooling |
| `party-app`         | Party-App        | Party app         |
| `smart-home`        | Smart Home       | Smart Home        |
| `portfolio`         | Portfolio        | Portfolio         |
| `automation`        | Automatisierung  | Automation        |

`projectTags` has **no drafts** and no `_status`; `slug` derives from `label` when empty → set it explicitly.

```jsonc
// A) create (EN)   → <tagId:developer-tooling>
{ "slug": "projectTags", "locale": "en", "returning": true, "documents": [
  { "data": { "label": "Developer tooling", "slug": "developer-tooling" } } ] }
// B) DE half
{ "slug": "projectTags", "id": "<tagId:developer-tooling>", "locale": "de",
  "data": { "label": "Entwickler-Tools", "slug": "developer-tooling" } }
// C) verify both halves
{ "slug": "projectTags", "locale": "de", "limit": 20 }   // and the same with "en"
```

### 3.2 Step B — the four projects (`projects`)

`<mediaId:…>` = ids from §2.3. `approach` is Lexical: `{ "root": { "type": "root", "format": "",
"indent": 0, "version": 1, "direction": "ltr", "children": [ { "type": "paragraph", "version": 1,
"children": [ { "type": "text", "text": "…", "version": 1 } ] } ] } }`.

**B1 `audit-scanner`** — `kind: "tool"`, `featured: true`, `order: 10`, tags `["developer-tooling","automation","portfolio"]`

```jsonc
{
  "slug": "audit-scanner",
  "title": { "de": "Audit-Scanner", "en": "Audit Scanner" },
  "teaser": {
    "de": "CVE- und Pin-Audit über alle Repos, mit Fix-PRs, Telegram-Report und täglichem Cron.",
    "en": "CVE and pin audit across every repo, with fix PRs, Telegram reports and a daily cron.",
  },
  "kind": "tool",
  "featured": true,
  "order": 10,
  "coverImage": "<mediaId:project-audit-scanner.webp>",
  "stack": {
    "de": [
      "Next.js 16",
      "Payload 4",
      "TypeScript 6",
      "PostgreSQL 17",
      "Coolify",
      "Trivy",
      "GitHub API",
    ],
    "en": [
      "Next.js 16",
      "Payload 4",
      "TypeScript 6",
      "PostgreSQL 17",
      "Coolify",
      "Trivy",
      "GitHub API",
    ],
  },
  "tags": ["<tagId:developer-tooling>", "<tagId:automation>", "<tagId:portfolio>"],
  "githubUrl": "https://github.com/mayraost/audit-scanner",
  "liveUrl": null,
  "context": {
    "de": "<Ausgangslage: 8+ Repos, floating Pins, CVE-Drifts — 2 Sätze>",
    "en": "<starting situation — 2 sentences>",
  },
  "approach": {
    "de": "<Lexical: wie gebaut, welche Prompts/Schleifen>",
    "en": "<Lexical: how it was built>",
  },
  "learnings": {
    "de": "<was schiefging, was ich anders mache>",
    "en": "<what went wrong, what I'd change>",
  },
  "outcome": {
    "de": "<Wirkung: z. B. 43 Fix-PRs über 8 Repos — Zahl nur mit Quelle!>",
    "en": "<outcome>",
  },
  "_status": "published",
}
```

**B2 `halloween-counter`** — `kind: "product"`, `featured: false`, `order: 20`, tags `["party-app","portfolio"]`
· `githubUrl: https://github.com/mayraost/halloween-counter` · live demo `<liveUrl or null>` ·
Image 385 → 299 MB is a **verified** figure (AGENTS.md) — safe to state.

**B3 `home-assistant`** — `kind: "experiment"`, `featured: false`, `order: 30`, tags `["smart-home","automation"]`
· repo not public → `githubUrl: null`, `liveUrl: null`.

**B4 `site-architecture`** (this site) — `kind: "product"`, `featured: false`, `order: 40`, tags `["portfolio","developer-tooling"]`
· `liveUrl: "https://mostheimer.de"` · `githubUrl: "https://github.com/mayraost/mostheimer"`.
Verified facts usable in `outcome`: edge cache 1 d fresh / 30 d stale, 404 never cached,
proxy slug-cache p50 9.5 ms vs 13.5 ms uncached, PageSpeed/CI gates.

Write procedure per project (repeat ×4):

1. `createDocuments { slug: "projects", locale: "en", draft: false, returning: true,
  documents: [{ data: { …EN half of every localized field…, slug, kind, featured, order,
  coverImage, tags, githubUrl, liveUrl, _status: "published" } }] }` → `<projectId>`
2. `updateDocument { slug: "projects", id: "<projectId>", locale: "de", draft: false,
  data: { …DE half…, _status: "published" } }`
3. **verify:** `findDocuments { slug: "projects", locale: "de", depth: 1 }` and the same with `"en"`;
   every localized field non-empty, `_status === "published"`, `tags` and `coverImage` populated.

### 3.3 Step C — the listing page (`pages`, slug `projects`)

`pages.slug` is **not localized** (`projects` once); `title` and `layout` are localized.
Naming caveat: prod currently serves the imprint at `/de/imprint` + `/de/impressum` while the page slug is `imprint` — the sibling segment `projects` of `[[...slug]]` is resolved by the proxy, but **verify `/de/projects` before `/en/projects`**.

```jsonc
// 1) create (EN)
{ "slug": "pages", "locale": "en", "draft": false, "returning": true, "documents": [{ "data": {
  "title": "Projects",
  "slug": "projects",
  "layout": [
    { "blockType": "hero", "variantHint": "compact",           // HeroBlock renders `compact` for non-home slugs
      "heading": "Projects",
      "subheading": "Projects I built with AI in the loop — and the guardrails that keep them shippable." },
    { "blockType": "projectShowcase",
      "eyebrow": "project coding",                                 // empty = copy fallback
      "heading": "Selected experiments",
      "intro": "<optional lead>",
      "emptyState": "No projects published yet.",
      "pageSize": 6, "showFilter": true, "featureFirst": true }
  ],
  "_status": "published"
} }] }
// 2) DE half
{ "slug": "pages", "id": "<pageId>", "locale": "de", "draft": false, "data": {
  "title": "Projects",
  "layout": [
    { "blockType": "hero", "heading": "Projects",
      "subheading": "Projekte, die ich mit KI im Loop gebaut habe — und die Guardrails, die sie shippbar halten." },
    { "blockType": "projectShowcase", "eyebrow": "project coding", "heading": "Ausgewählte Experimente",
      "emptyState": "Noch keine Projekte veröffentlicht.",
      "pageSize": 6, "showFilter": true, "featureFirst": true }
  ], "_status": "published" } }
```

`pageSize: 6` — with 4 projects **there is exactly one page**. Therefore `?page=2` is a
**clamped, non-canonical duplicate** → the page still answers **200** (it renders page 1) with
`robots: noindex, follow` and canonical → the bare listing (`isCanonicalPage: false`).
A `?page=2` **404** would be wrong here. With ≥ 7 projects `?page=2` becomes real (200, indexable,
self-canonical).

### 3.4 Step D — navigation (`navigation` global, localised arrays → rewrite the FULL array per locale)

Read first (verified state, prod): DE header `Home, Fallstudien, Tech-Radar, Leadership, Werdegang, Kontakt`;
EN header `Home, Case Studies, Tech Radar, Leadership, Career, Contact`.

```jsonc
// updateGlobal { slug: "navigation", locale: "de", data: {
//   "headerLinks": [ …6 existing entries…, { "label": "Projects", "link": "/de/projects" } ] }
// updateGlobal { slug: "navigation", locale: "en", data: {
//   "headerLinks": [ …6 existing entries…, { "label": "Projects", "link": "/en/projects" } ] }
```

Array item `id`s may be omitted on rewrite (Payload regenerates them). `isActiveNavLink` already
keeps the entry highlighted on `/de/projects/<slug>`.

### 3.5 Step E — command palette — **NOT DONE, and not possible via content**

- `src/components/ui/commandItems.ts` has **no** `projects` entry (only `home`, `architektur`,
  `schaubild`, `case-studies`, `tech-radar`, `leadership`, `career`, `contact`, `impressum`, `settings`).
- The design doc (§7) promises `{ id: 'projects', href: '/projects', group: 'pages' }` + the two
  `commandItems.projects.*` copy rows — **neither exists**; the seed migration contains 0 such rows.
- Palette labels live in CMS (`translations.copy` → `commandItems.<id>.label|keywords`), but the
  **structure** (id/href/group) is code and must not be CMS-editable.
- **Decision needed:** either accept "nav only" for this release, or a follow-up PR adds the one
  `ITEMS` line + the two copy rows (a data migration with `INSERT … WHERE NOT EXISTS`, following
  `20261108_150000_seed_ui_copy_translations.ts`). Do **not** fake the rows now: without the code
  entry they are unreachable, and a code entry without copy is dropped silently (`getCommandItems`).

### 3.6 Copy already in the DB (no content write needed)

`blocks.projectShowcase.*` (48 rows) and `routes.project.*` (26 rows) ship via migration `180000`
in both locales. The block's `eyebrow`/`emptyState` fall back to them when the CMS field is empty.

### 3.7 After the content writes

1. Re-read **all four** projects + the page + the global, diff against the payload.
2. Confirm the purge actually ran: `docker logs … | grep -E '\[cf-cache\]|\[cf-purge\]'`
   (`revalidateProjectCache` → tag flush → enqueued edge purge; prefix for the listing).
3. `curl -sI https://mostheimer.de/de/projects | grep -i cf-cache-status` → `MISS` then `HIT`.

---

## 4. Verification script — run AFTER the deploy (and after §3)

Runs from any machine; all checks are read-only. `set -e` is deliberately absent (collect, then judge).

```bash
B=https://mostheimer.de
P=("audit-scanner" "halloween-counter" "home-assistant" "site-architecture")   # = real published slugs
FAIL=0; chk(){ [ "$2" = "$3" ] || { echo "FAIL $1: got $2 want $3"; FAIL=1; }; }

# --- listing + details
for L in de en; do
  chk "/$L/projects"          "$(curl -s -o /tmp/vbc.html -w '%{http_code}' $B/$L/projects)" 200
  for s in "${P[@]}"; do chk "/$L/projects/$s" "$(curl -s -o /dev/null -w '%{http_code}' $B/$L/projects/$s)" 200; done
done
# ≥1 project title on the listing (the first detail <h1> must also appear on the listing)
TITLE=$(curl -s "$B/de/projects/${P[0]}" | grep -oP '(?<=<h1[^>]{0,200}>)[^<]{3,}' | head -1)
curl -s "$B/de/projects" | grep -qF "$TITLE" && echo "listing shows title: $TITLE" || { echo "FAIL no title"; FAIL=1; }

# --- unknown project → 404 (must come from the proxy, not a streamed 200)
chk "unknown project" "$(curl -s -o /dev/null -w '%{http_code}' $B/de/projects/nope)" 404

# --- query variants: with 4 projects => page 2 is a CLAMPED duplicate => 200 + noindex
chk "?page=2"     "$(curl -s -o /tmp/p2.html -w '%{http_code}' "$B/de/projects?page=2")" 200
grep -qi 'name="robots"[^>]*noindex' /tmp/p2.html && echo "page2 noindex ok" || { echo "FAIL page2 not noindex"; FAIL=1; }
chk "?page=abc"   "$(curl -s -o /tmp/pa.html -w '%{http_code}' "$B/de/projects?page=abc")" 200
grep -qi 'name="robots"[^>]*noindex' /tmp/pa.html && echo "pageabc noindex ok" || { echo "FAIL page=abc not noindex"; FAIL=1; }
  chk "?tag=portfolio" "$(curl -s -o /tmp/tag.html -w '%{http_code}' "$B/de/projects?tag=portfolio")" 200
grep -qi 'name="robots"[^>]*noindex' /tmp/tag.html && echo "tag noindex ok" || { echo "FAIL tag not noindex"; FAIL=1; }

# --- canonical contract
curl -s $B/de/projects | grep -qi '<link rel="canonical" href="https://mostheimer.de/de/projects"' \
  && echo "bare listing self-canonical ok" || { echo "FAIL bare canonical"; FAIL=1; }
grep -qi '<link rel="canonical" href="https://mostheimer.de/de/projects"' /tmp/tag.html \
  && echo "?tag canonical → bare ok" || { echo "FAIL tag canonical"; FAIL=1; }
grep -qi '<link rel="canonical" href="https://mostheimer.de/de/projects"' /tmp/p2.html \
  && echo "?page=2 canonical → bare ok (clamped)" || { echo "FAIL page2 canonical"; FAIL=1; }

# --- sitemap: listing + details, never query variants
S=$(curl -s $B/sitemap.xml)
echo "$S" | grep -q '<loc>https://mostheimer.de/de/projects</loc>' && echo "sitemap listing ok" || { echo "FAIL sitemap listing"; FAIL=1; }
for s in "${P[@]}"; do echo "$S" | grep -q "/projects/$s<" || { echo "FAIL sitemap $s"; FAIL=1; }; done
echo "$S" | grep -qE 'projects\?(page|tag)=' && { echo "FAIL sitemap has query variant"; FAIL=1; } || echo "sitemap has no query variants"

# --- purge manifest (route lands with the PR)
curl -s $B/api/purge-manifest | grep -q '"paginatedRoutes":\["/projects"\]' \
  && echo "manifest ok" || { echo "FAIL manifest"; FAIL=1; }

# --- a11y smoke via curl (active chip state is markup, not JS)
grep -q 'aria-current' /tmp/tag.html && echo "aria-current present" || { echo "FAIL aria-current"; FAIL=1; }
grep -q 'aria-label="Nach Tag filtern"' /tmp/tag.html && echo "filter landmark ok" || echo "WARN filter aria-label"

# --- edge cache + prefix purge proof  (run this pair AROUND a publish)
# BEFORE: note Age; publish one project (MCP update, draft:false,_status:published);
curl -sI $B/de/projects          | grep -iE '^(HTTP|cf-cache-status|age|cache-control)'
curl -sI "$B/de/projects?page=2" | grep -iE '^(HTTP|cf-cache-status|age|content-type)'
# AFTER publish: listing + ALL query variants must be MISS/EXPIRED (prefix purge), then HIT again
curl -s "$B/de/projects?page=2&cb=$RANDOM" -o /dev/null -w 'variant %{http_code}\n'   # origin truth
echo "FAIL=$FAIL"; [ "$FAIL" = 0 ] && echo "ALL CHECKS PASSED"
```

Notes: `?page=2` **200 + noindex** is correct _for 4 projects_; re-check the expectation after the
5th/7th project. `cf-cache-status` proof: a bare-URL purge would leave `?page=2` stale — after a
publish the variant must show `MISS`/`EXPIRED` with a **fresh** `Age`, not the old one.
Keyboard/a11y beyond curl (only if a Playwright MCP is available): tab order into the chip row,
`Enter` on a chip navigates without JS, visible focus ring in `.light` **and** `.dark`.

---

## 5. Risks & rollback

### 5.1 If migrations fail on boot (Payload-init 500)

Symptom: every CMS read 500s → the whole **frontend goes dark** and `/de` is served from the edge
cache (`HIT`, `Age` grows) until `stale-if-error` (30 d) — the site does not 404, it freezes.
New routes (`/de/projects`) will 500/404 with `BYPASS`.

Order of checks:

1. `ssh coolify "docker ps --format '{{.Names}} {{.Status}}' | grep mostheimer"` → is there a **new** container?
2. `ssh coolify "docker logs --tail 200 <new-container> 2>&1 | grep -iE 'error|migration|enum|relation'"` —
   look for `invalid input value for enum`, `relation … does not exist`, `cannot pass more than 100 arguments`.
3. Fallback to the old container: `docker ps` still lists `app-vcfotnzye7fklxrh10i81npl-20261109T174230`
   (the `39f5b75` image) until Coolify removes it. If it is gone: redeploy `39f5b75` (revert merge, push,
   webhook deploy) — see 5.3.
4. Only after the app is up, confirm `curl -s http://127.0.0.1:3300/api/health` (`200`, `release`).
5. If a migration is half-applied, the `payload_migrations` row is missing → `up()` re-runs. All three
   are re-runnable in principle **except** 171931's `CREATE TABLE/TYPE` (no `IF NOT EXISTS`) → a partially
   applied run needs the created objects dropped by hand, or `down()` of the missing ones. Never `migrate:reset`.

### 5.2 Blast radius if you must roll back the _content_ only

Deleting projects/tags is fine (no FKs into pages). Deleting the `projects` page turns the listing into a
404 on a **published** nav link → purge the nav too (nav is a global → `cms:global:navigation` flush).
The copy rows (`blocks.projectShowcase.*`, `routes.project.*`) are harmless when unused.

### 5.3 Rollback path (code)

Migrations are **additive**, so a code rollback keeps `projects*`, `project_tags*`,
`pages_blocks_project_showcase*` and the 50 new columns. Old code simply ignores them → no data loss,
no `down()` needed.

```bash
gh pr revert 92 --repo mayraost/mostheimer      # or: git revert -m 1 <merge> && git push
# Coolify deploys the push automatically (manual GitHub webhook). If not:
#   Coolify UI → application vcfotnzye7fklxrh10i81npl → Deploy (or POST /api/v1/deploy {"uuid":"…","force":true})
ssh coolify "docker ps --format '{{.Names}}' | grep vcfotnzye7fklxrh10i81npl"   # new container present?
curl -s https://mostheimer.de/api/health                                        # release changed?
```

**Do not** expect `list_rollback_images` to help (`images: []` today). The deploy purge will re-warm;
the listing simply 404s again (the nav link 404s → remove the nav entry too if the rollback stays long).

### 5.4 Rollout order that avoids the known traps

1. Fix the `dirty` mergeable state (§1.1), then merge → webhook deploy.
2. Wait for `release` to change at `/api/health` **and** `/api/purge-manifest` to return 200 (§4).
3. Content (§3) — tags → project ≤1 first, verify `/de/projects/<slug>` renders, then the rest;
   the page **before** the nav entry (so the nav never points at a 404).
4. Final `cf-cache-status` proof (§4), then `?: tag`/page variants.
5. Do **not** run a parallel `force` deploy after the merge (AGENTS.md: port-bind race).
