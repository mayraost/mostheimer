// cacheComponents: Route Segment Config `dynamic` is not allowed here. The
// response is constant ({status:'ok'}) and accesses no data, so it is
// prerenderable; uptime monitoring still works because the Docker HEALTHCHECK
// only fails on a process/Traefik crash.
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
