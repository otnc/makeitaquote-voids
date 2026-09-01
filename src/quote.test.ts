import { describe, expect, it } from 'vitest'
import { ValidationError } from './errors'
import { applyInput, assertRenderable, emptyQuote } from './quote'

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

  it('validates a provided field and throws ValidationError on failure', () => {
    expect(() => applyInput(emptyQuote(), { text: 42 as unknown as string })).toThrow(
      ValidationError,
    )
  })

  it('accepts a string, a URL, a Uint8Array or null avatar', () => {
    const url = new URL('https://example.test/a.png')
    expect(applyInput(emptyQuote(), { avatar: url }).avatar).toBe(url)
    expect(applyInput(emptyQuote(), { avatar: null }).avatar).toBeNull()
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
