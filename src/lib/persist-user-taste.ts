import { tasteAccentToDb, type TasteIdentityItem } from '../data/profileIdentity'
import { postProfileTastePreferences } from './auth-api'

let persistTimer: ReturnType<typeof setTimeout> | null = null

/** Debounced save after tag edits (signed-in, non-anonymous users only). */
export function schedulePersistUserTasteCategories(
  getItems: () => TasteIdentityItem[],
  isSignedInRealUser: () => boolean,
): void {
  if (!isSignedInRealUser()) return
  if (persistTimer !== null) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    persistTimer = null
    void persistUserTasteCategories(getItems())
  }, 450)
}

/**
 * Cancel pending debounced save and write immediately (e.g. user tapped Done).
 */
export function flushPersistUserTasteCategories(
  getItems: () => TasteIdentityItem[],
  isSignedInRealUser: () => boolean,
): Promise<void> {
  if (persistTimer !== null) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  if (!isSignedInRealUser()) return Promise.resolve()
  return persistUserTasteCategories(getItems())
}

export async function persistUserTasteCategories(items: TasteIdentityItem[]): Promise<void> {
  const userTasteCategories = items.map(({ label, accent }) => ({
    label,
    accent: tasteAccentToDb(accent),
  }))
  try {
    await postProfileTastePreferences(userTasteCategories)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[buzo] Failed to persist user taste categories:', msg, e)
  }
}
