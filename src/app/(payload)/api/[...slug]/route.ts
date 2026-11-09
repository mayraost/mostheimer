// Load-bearing side-effect import — do NOT remove. `file-type` (used by
// Payload's upload MIME detection) reaches `strtok3` only through a *runtime*
// `import(specifier)` call with a non-literal specifier
// (`importAtRuntime('strtok3')`, file-type/source/index.js `fromFile()`), which
// no bundler can trace. Turbopack therefore copied only the subpath that
// `file-type` imports statically (`strtok3/core` → lib/core.js) and left
// `lib/index.js`, `types.js` and `FileTokenizer.js` out of the standalone
// output. Production then threw
// `Cannot find module '/app/node_modules/strtok3/lib/index.js'` on every
// `/api/media/file/*` request → HTTP 500 on every image, while the uploads were
// present and intact on disk.
//
// A static import of the package entry makes Turbopack trace the full package
// tree. `outputFileTracingIncludes` is NOT an alternative: Next 16 skips the
// whole include/exclude pass when the bundler is Turbopack.
import 'strtok3';
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
