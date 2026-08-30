import { describe, expect, it } from 'vitest'
import { ValidationError } from './errors'
import {
  applyInput,
  assertRenderable,
  emptyQuote,
  MAX_NAME_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_WATERMARK_LENGTH,
  normalizeAvatar,
  normalizeDisplayName,
  normalizeText,
  normalizeUsername,
  normalizeWatermark,
} from './quote'

describe('emptyQuote', () => {
  it('returns a blank quote', () => {
    expect(emptyQuote()).toEqual({
      text: '',
      avatar: null,
      username: '',
      displayName: '',
      watermark: '',
    })
  })
})

describe('normalizeText', () => {
  it('accepts a string within the limit', () => {
    expect(normalizeText('hi')).toBe('hi')
  })

  it('rejects a non-string', () => {
    expect(() => normalizeText(42)).toThrow(ValidationError)
  })

  it('rejects text over the limit', () => {
    expect(() => normalizeText('a'.repeat(MAX_TEXT_LENGTH + 1))).toThrow(ValidationError)
  })
})

describe('normalizeUsername / normalizeDisplayName / normalizeWatermark', () => {
  it('reject a value over their respective limits', () => {
    expect(() => normalizeUsername('a'.repeat(MAX_NAME_LENGTH + 1))).toThrow(ValidationError)
    expect(() => normalizeDisplayName('a'.repeat(MAX_NAME_LENGTH + 1))).toThrow(ValidationError)
    expect(() => normalizeWatermark('a'.repeat(MAX_WATERMARK_LENGTH + 1))).toThrow(ValidationError)
  })

  it('accept a value at the limit', () => {
    expect(normalizeUsername('a'.repeat(MAX_NAME_LENGTH))).toHaveLength(MAX_NAME_LENGTH)
  })
})

describe('normalizeAvatar', () => {
  it('accepts a string, a URL, a Uint8Array or null', () => {
    expect(normalizeAvatar('https://example.test/a.png')).toBe('https://example.test/a.png')
    const url = new URL('https://example.test/a.png')
    expect(normalizeAvatar(url)).toBe(url)
    const bytes = new Uint8Array([1, 2, 3])
    expect(normalizeAvatar(bytes)).toBe(bytes)
    expect(normalizeAvatar(null)).toBeNull()
  })

  it('treats undefined as null', () => {
    expect(normalizeAvatar(undefined)).toBeNull()
  })

  it('rejects anything else', () => {
    expect(() => normalizeAvatar(42)).toThrow(ValidationError)
  })
})

describe('applyInput', () => {
  it('validates and merges only the provided fields', () => {
    const base = emptyQuote()
    const merged = applyInput(base, { text: 'hi', username: 'otoneko.' })

    expect(merged).toMatchObject({ text: 'hi', username: 'otoneko.' })
    expect(merged.displayName).toBe(base.displayName)
  })

  it('rejects a non-object input', () => {
    expect(() => applyInput(emptyQuote(), null as never)).toThrow(ValidationError)
  })
})

describe('assertRenderable', () => {
  it('throws when text is empty or whitespace-only', () => {
    expect(() => assertRenderable(emptyQuote())).toThrow(ValidationError)
    expect(() => assertRenderable({ ...emptyQuote(), text: '   ' })).toThrow(ValidationError)
  })

  it('passes when text has content', () => {
    expect(() => assertRenderable({ ...emptyQuote(), text: 'hi' })).not.toThrow()
  })
})
