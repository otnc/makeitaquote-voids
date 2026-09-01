import { normalizeAvatarSource, normalizeString } from '@makeitaquote/utils/validation'
import { ValidationError } from './errors'
import type { AvatarSource, QuoteData, QuoteInput } from './types'

export const MAX_TEXT_LENGTH = 4000
export const MAX_NAME_LENGTH = 128
export const MAX_WATERMARK_LENGTH = 64

export function emptyQuote(): QuoteData {
  return { text: '', avatar: null, username: '', displayName: '', watermark: '' }
}

/**
 * Applies a partial input onto a quote, validating each provided field.
 *
 * Absent keys are left untouched; `undefined` is treated as absent so that
 * spreading a partially-filled object behaves the way it reads.
 */
export function applyInput(target: QuoteData, input: QuoteInput): QuoteData {
  if (input === null || typeof input !== 'object') {
    throw new ValidationError('setFromObject expects an object', { field: 'input' })
  }

  const next: QuoteData = { ...target }

  if (input.text !== undefined) next.text = normalizeString(input.text, 'text', MAX_TEXT_LENGTH)
  if (input.avatar !== undefined) {
    next.avatar = normalizeAvatarSource(input.avatar, 'avatar') as AvatarSource | null
  }
  if (input.username !== undefined) {
    next.username = normalizeString(input.username, 'username', MAX_NAME_LENGTH)
  }
  if (input.displayName !== undefined) {
    next.displayName = normalizeString(input.displayName, 'displayName', MAX_NAME_LENGTH)
  }
  if (input.watermark !== undefined) {
    next.watermark = normalizeString(input.watermark, 'watermark', MAX_WATERMARK_LENGTH)
  }

  return next
}

/**
 * Final check before sending.
 *
 * `text` is the only truly required field — a quote with no words is not a
 * quote, while a missing avatar or name just renders as less.
 */
export function assertRenderable(data: QuoteData): void {
  if (data.text.trim().length === 0) {
    throw new ValidationError('text is required', { field: 'text' })
  }
}
