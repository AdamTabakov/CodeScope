export function health(_request, response) {
  response.json({ status: 'ok', service: 'codescope-homepage' })
}
