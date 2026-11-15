import { revalidatePath as nextRevalidatePath } from 'next/cache'

/**
 * Safe revalidatePath wrapper.
 * Outside a Next.js request (scripts/tests) revalidatePath throws —
 * swallow that so mutations still succeed.
 */
export function revalidatePath(path: string) {
  try {
    nextRevalidatePath(path)
  } catch {
    // no-op when static generation store is missing
  }
}
