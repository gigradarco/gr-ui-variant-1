export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const q = req.query?.q
  const query = typeof q === 'string' ? q.trim() : ''

  if (!query) {
    res.status(400).json({ error: 'Missing q query parameter' })
    return
  }

  const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN || process.env.VITE_PUBLIC_MAPBOX_TOKEN
  if (!mapboxToken) {
    res.status(500).json({ error: 'Missing MAPBOX_ACCESS_TOKEN' })
    return
  }

  const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&types=place%2Cdistrict%2Clocality%2Cneighborhood&access_token=${encodeURIComponent(mapboxToken)}`

  try {
    const mapboxResponse = await fetch(endpoint)

    if (!mapboxResponse.ok) {
      const details = await mapboxResponse.text()
      res.status(502).json({ error: 'Mapbox request failed', details })
      return
    }

    const payload = (await mapboxResponse.json()) as {
      features?: Array<{ place_name?: string; center?: [number, number] }>
    }

    const feature = payload.features?.[0]
    if (!feature?.place_name) {
      res.status(200).json({ placeName: null, center: null })
      return
    }

    res.status(200).json({
      placeName: feature.place_name,
      center: Array.isArray(feature.center) ? feature.center : null,
    })
  } catch (error) {
    res.status(500).json({
      error: 'Unexpected Mapbox proxy error',
      details: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
