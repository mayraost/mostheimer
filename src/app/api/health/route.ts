// cacheComponents: Route Segment Config `dynamic` ist ungueltig. Health-
// Response ist konstant ({status:'ok'}) — kein Datenzugriff, deshalb
// prerenderbar.uptime-Monitoring greift trotzdem live (Docker HEALTHCHECK
// schlaegt nur bei Prozess-/Traefik-Crash).
export async function GET() {
  return Response.json({ status: 'ok' }, { status: 200 });
}
