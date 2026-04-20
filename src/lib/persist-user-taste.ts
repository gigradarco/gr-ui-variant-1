import {
  tasteAccentToDb,
  tasteIdentityItemsEqual,
  type TasteIdentityItem,
} from '../data/profileIdentity'
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

export type FlushPersistTasteOptions = {
  /** If set and current items match, skips the API call (e.g. user opened edit then tapped Done unchanged). */
  baseline?: TasteIdentityItem[] | null
}

/**
 * Cancel pending debounced save and write immediately (e.g. user tapped Done).
 */
export function flushPersistUserTasteCategories(
  getItems: () => TasteIdentityItem[],
  isSignedInRealUser: () => boolean,
  options?: FlushPersistTasteOptions,
): Promise<void> {
  if (persistTimer !== null) {
    clearTimeout(persistTimer)
    persistTimer = null
  }
  if (!isSignedInRealUser()) return Promise.resolve()
  const items = getItems()
  const baseline = options?.baseline
  if (baseline != null && tasteIdentityItemsEqual(baseline, items)) {
    return Promise.resolve()
  }
  return persistUserTasteCategories(items)
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
