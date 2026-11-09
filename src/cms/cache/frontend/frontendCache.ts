/**
 * Data-cache layer barrel.
 *
 * `./routes` and `./revalidate` used to export `vibeProjectPath` twice (the
 * route builder and a purge helper) — a `TS2308` ambiguous star export that
 * silently resolved to whichever module came last. The route builder in
 * `./routes` is now the single definition and `./revalidate` imports it.
 *
 * Keep the list exhaustively re-exported via stars only while no symbol exists
 * in more than one module; anything shared belongs in exactly one place.
 */
export * from './cloudflare';
export * from './constants';
export * from './purges';
export * from './queries';
export * from './revalidate';
export * from './routes';
export * from './translations';
export * from './utils';

/**
 * Route registry views for the operational read side (`/api/purge-manifest`,
 * diagnostics). A named re-export, NOT a star: `./revalidate` already
 * re-exports `vibeProjectPath` from `./routes`, and a second star would be
 * ambiguous (`TS2308`).
 */
export { registeredVibeDetailPaths, registeredVibeProjectSlugs } from './revalidate';
