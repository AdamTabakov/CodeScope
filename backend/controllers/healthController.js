// Controller for handling health check requests
export function health(_request, response) {
  response.json({ status: 'ok', service: 'codescope-homepage' })
}
