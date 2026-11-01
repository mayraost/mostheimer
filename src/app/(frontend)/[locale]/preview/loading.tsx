/**
 * Preview-Route-Skeleton: statisch, kein auth-/Payload-Bezug.
 */
export default function PreviewLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Lädt Vorschau …</span>
      <div className="max-w-6xl mx-auto w-full space-y-4 animate-pulse" aria-hidden="true">
        <div className="h-6 w-1/3 mx-auto rounded-lg bg-surface" />
        <div className="h-40 rounded-2xl bg-surface/60" />
      </div>
    </div>
  );
}
