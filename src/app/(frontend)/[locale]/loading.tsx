/**
 * Route-level skeleton: static with no Payload dependency, so it covers
 * navigation while the dynamic shell (LayoutShell/connection) loads.
 */
export default function LocaleLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Lädt …</span>
      <div className="max-w-6xl mx-auto w-full space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-10 w-2/3 rounded-lg bg-surface" />
        <div className="h-40 rounded-2xl bg-surface/60" />
        <div className="h-6 w-1/2 rounded-lg bg-surface/60" />
      </div>
    </div>
  );
}
