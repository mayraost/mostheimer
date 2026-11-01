'use client';

/**
 * Custom-Admin-View /admin/cache-clear — triggert den manuellen Cache-Flush
 * ueber die Server Action clearAllFrontendCaches (Admin-gated). Kein
 * API-Route-Umweg: interne Admin-Session reicht (AGENTS-Regel "Server
 * Actions vor API-Routen").
 */
import { useState } from 'react';
import { Button } from '@payloadcms/ui';
import { clearAllFrontendCaches } from '@/cms/cache/frontend/clearCaches';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function CacheClearView() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleFlush() {
    setStatus('loading');
    setMessage('');
    const result = await clearAllFrontendCaches();
    if (result.ok) {
      setStatus('success');
      setMessage(`Alle Caches invalidiert (${result.tags.join(', ')}).`);
    } else {
      setStatus('error');
      setMessage(result.error);
    }
  }

  return (
    <div className="custom-view-wrap" style={{ maxWidth: '48rem', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Frontend-Cache leeren</h1>
        <p className="text-muted" style={{ marginBottom: 0 }}>
          Invalidiert alle Tag-basierten Cache-Eintraege dieses Frontends (Pages, Navigation,
          Site-Settings, Translations, Not-Found, Sitemap). Publishes invalidieren normalerweise
          automatisch — dieser Flush ist die harte Option ohne Publish.
        </p>
      </div>

      <Button
        buttonStyle="destructive"
        onClick={handleFlush}
        disabled={status === 'loading'}
        size="large"
      >
        {status === 'loading' ? 'Invalidiere …' : 'Alle Caches loeschen'}
      </Button>

      {message && (
        <p
          role="status"
          aria-live="polite"
          style={{
            marginTop: '1rem',
            color: status === 'error' ? 'var(--theme-error)' : 'var(--theme-success)',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default CacheClearView;
