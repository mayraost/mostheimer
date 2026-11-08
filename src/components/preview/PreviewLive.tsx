'use client';

/**
 * Live preview (client side) — official `useLivePreview` hook.
 *
 * WHAT THIS DOES
 *
 * The Payload admin posts `payload-live-preview` into this iframe on every form
 * change, carrying the raw form values. The hook forwards them to
 * `POST /api/pages/<id>` with `X-Payload-HTTP-Method-Override: GET` (so the
 * result is populated + localized exactly like a normal find), then renders the
 * merged document. Typing in the admin therefore shows up here live, and a
 * save (`payload-document-event`) needs no navigation at all.
 *
 * WHY THE EARLIER RELOAD WAS NECESSARY, AND WHY IT IS NOT ANYMORE
 *
 * The previous implementation listened for `payload-document-event` and called
 * `location.reload()`: the only reliable way to show a save was a fresh server
 * render. `router.refresh()` (what `RefreshRouteOnSave` does) did NOT work here,
 * because the `[locale]` shell streams behind `connection()` with
 * `cacheComponents` — the RSC refresh re-used the already-rendered tree.
 *
 * The reload is now superseded: this component re-renders from DATA, not from a
 * server render. The block components are plain prop renderers (see
 * `PreviewBlocks.tsx`), so a new data object is enough — no RSC request, no
 * cache tag, no document navigation.
 *
 * SECURITY / CORRECTNESS NOTES
 *
 * - `serverURL` is BOTH the `postMessage` origin filter (`event.origin ===
 *   serverURL` inside `@payloadcms/live-preview`) and the base of the merge
 *   request. It is derived from request headers on the server (behind the
 *   tunnel the admin origin is not `envConfig.serverUrl`) and passed in as a
 *   prop — never read from the message itself.
 * - The merge request goes through Payload's REST API with
 *   `credentials: 'include'`, i.e. it is authorized by the admin's own
 *   `payload-token` cookie. Access control stays server-side: an anonymous
 *   visitor gets no document (and `/preview` itself answers "Kein Zugang"
 *   before this component is rendered at all — the auth gate lives in
 *   `preview/page.tsx`).
 * - `depth` is the SAME constant the server fetch uses (`PREVIEW_DEPTH`);
 *   mixing depths would populate relationships differently (ids vs. objects)
 *   and make the merged tree differ from the server-rendered one.
 * - `initialData` is the ONLY data path into the client: no Payload config,
 *   no `payload.auth()` result and no secret is imported here.
 */
import { useLivePreview } from '@payloadcms/live-preview-react';
import type { Page } from '@/payload-types';
import { PREVIEW_DEPTH } from '@/cms/preview/constants';
import { PreviewBlockRenderer } from './PreviewBlocks';
import type { PreviewCopy } from './PreviewBlocks';

/**
 * A page without a layout has nothing to preview (fresh draft, all blocks
 * removed). The guard covers the merged document too: it is form data, not a
 * fetched `Page`, so a block that is still being added may arrive without
 * `blockType`. The cast is local to the filter predicate; everything that
 * reaches the renderer is a `Page['layout'][number]` again.
 */
function isRenderableBlock(block: unknown): boolean {
  return typeof block === 'object' && block !== null && 'blockType' in block;
}

export function PreviewLive({
  initialPage,
  serverURL,
  copy,
  /** Cosmetic only (deadlines, count chips): the preview mimics the public route. */
  variant = 'compact',
}: {
  initialPage: Page;
  serverURL: string;
  /** Shell copy for every block type, resolved server-side from the cache. */
  copy: PreviewCopy;
  variant?: 'home' | 'compact';
}) {
  const { data } = useLivePreview<Page>({
    initialData: initialPage,
    serverURL,
    depth: PREVIEW_DEPTH,
  });

  return (
    <article className="max-w-6xl mx-auto w-full">
      {data.layout?.map((block, index) => {
        // Merged documents are form data: a block that is still being added can
        // arrive without `blockType`. Skip it instead of crashing the frame.
        if (!isRenderableBlock(block)) return null;
        return (
          <PreviewBlockRenderer
            key={block.id ?? index}
            block={block}
            locale={variant}
            copy={copy}
          />
        );
      })}
    </article>
  );
}
