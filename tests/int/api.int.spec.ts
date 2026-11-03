import { getPayload, Payload } from 'payload';
import config from '@/payload.config';

import { describe, it, beforeAll, expect } from 'vitest';

let payload: Payload;

describe('API', () => {
  beforeAll(async () => {
    const payloadConfig = await config;
    payload = await getPayload({ config: payloadConfig });
  });

  it('fetches users', async () => {
    const users = await payload.find({
      collection: 'users',
      // Payload 4.0.0-beta.6: Local API enforced Access-Control jetzt per
      // Default (local/op Defaults overrideAccess: false). Bewusster
      // Admin-Bypass, damit die Smoke-Assertion ohne Auth-User laeuft.
      overrideAccess: true,
    });
    expect(users).toBeDefined();
  });
});
