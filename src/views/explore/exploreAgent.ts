import { events } from '../../data/demoData'

export type ExploreAgentResult = {
  reply: string
  suggestedEventId: string | null
  locationQuery: string | null
}

export function normalizePrompt(prompt: string) {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*\?/g, ' ?')
}

export function getHardcodedAgentFallback(prompt: string): ExploreAgentResult {
  const normalizedPrompt = normalizePrompt(prompt)

  if (normalizedPrompt.includes('jazz')) {
    return {
      reply: 'I am running in demo fallback mode. Jazz looks strongest around Tiong Bahru tonight.',
      suggestedEventId: 'bluenote',
      locationQuery: 'Tiong Bahru Singapore',
    }
  }

  if (normalizedPrompt.includes('techno')) {
    return {
      reply: 'I am running in demo fallback mode. Techno momentum is highest around Clarke Quay tonight.',
      suggestedEventId: 'marquee',
      locationQuery: 'Clarke Quay Singapore',
    }
  }

  return {
    reply: 'I am running in demo fallback mode. Neon Pulse is a strong all-round pick for tonight.',
    suggestedEventId: 'neonpulse',
    locationQuery: 'Downtown Core Singapore',
  }
}

export async function fetchOpenAIExploreResult(prompt: string): Promise<ExploreAgentResult | null> {
  try {
    const response = await fetch(import.meta.env.VITE_OPENAI_PROXY_URL ?? '/api/openai-recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        events: events.map((event) => ({
          id: event.id,
          title: event.title,
          venue: event.venue,
          district: event.district,
          genre: event.genre,
          time: event.time,
          verified: event.verified,
          vibeTags: event.vibeTags,
        })),
      }),
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as Partial<ExploreAgentResult>
    if (typeof payload.reply !== 'string' || !payload.reply.trim()) {
      return null
    }

    return {
      reply: payload.reply.trim(),
      suggestedEventId: typeof payload.suggestedEventId === 'string' ? payload.suggestedEventId : null,
      locationQuery: typeof payload.locationQuery === 'string' ? payload.locationQuery : null,
    }
  } catch {
    return null
  }
}

export async function fetchMapboxPlaceName(locationQuery: string): Promise<string | null> {
  try {
    const endpoint = import.meta.env.VITE_MAPBOX_PROXY_URL ?? '/api/mapbox-geocode'
    const separator = endpoint.includes('?') ? '&' : '?'
    const response = await fetch(`${endpoint}${separator}q=${encodeURIComponent(locationQuery)}`)

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as { placeName?: unknown }
    return typeof payload.placeName === 'string' && payload.placeName.trim()
      ? payload.placeName.trim()
      : null
  } catch {
    return null
  }
}
