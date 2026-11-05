/**
 * Live-preview constants shared by the server route and the client hook.
 *
 * Deliberately a separate, dependency-free module (no client/server imports, no
 * `payload`, no `next/*`): the preview page (server) and `PreviewLive` (client)
 * must read the SAME value. Two copies drifted apart is exactly the failure mode
 * that breaks relationship resolution — the server would populate
 * `backgroundImage` as an object while merges replace it with a bare id.
 */
export const PREVIEW_DEPTH = 2;
