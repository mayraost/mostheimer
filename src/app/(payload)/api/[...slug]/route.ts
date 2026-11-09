import configPromise from '@payload-config';
import {
  REST_OPTIONS,
  REST_GET,
  REST_POST,
  REST_PATCH,
  REST_PUT,
  REST_DELETE,
} from '@payloadcms/next/routes';

export const GET = REST_GET(configPromise);
export const POST = REST_POST(configPromise);
export const DELETE = REST_DELETE(configPromise);
export const PATCH = REST_PATCH(configPromise);
// Required for Payload's client-upload flow: `/api/upload-instructions` hands out
// a signed `PUT` URL, and a missing handler makes Next answer 405 for every PUT
// under `/api/*` (measured in production). `OPTIONS` advertises PUT either way,
// because Payload hardcodes that list — the gap was invisible until the MCP
// upload tool started using the signed-URL path.
export const PUT = REST_PUT(configPromise);
export const OPTIONS = REST_OPTIONS(configPromise);
