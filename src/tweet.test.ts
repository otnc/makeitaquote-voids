import { describe, expect, it } from 'vitest'
import { ValidationError } from './errors'
import { fromTweet } from './tweet'

function tweet(overrides: Partial<{ text: string; author: Record<string, unknown> }> = {}) {
  return {
    text: 'Hello World!',
    author: { username: 'otoneko', name: '音猫｡', avatarUrl: 'https://example.test/a.png' },
    ...overrides,
  }
}

describe('fromTweet', () => {
  it('reads text, display name and avatar', () => {
    const quote = fromTweet(tweet())

    expect(quote.text).toBe('Hello World!')
    expect(quote.username).toBe('otoneko')
    expect(quote.displayName).toBe('音猫｡')
    expect(quote.avatar).toBe('https://example.test/a.png')
  })

  it('quotes the text exactly as written by default', () => {
    // 𝗕𝗼𝗹𝗱 — sans-serif bold, per @makeitaquote/utils' stripTwitterText()
    const quote = fromTweet(tweet({ text: '𝗕𝗼𝗹𝗱' }))

    expect(quote.text).toBe('𝗕𝗼𝗹𝗱')
  })

  it('normalizes styled text when opted in', () => {
    const quote = fromTweet(tweet({ text: '𝗕𝗼𝗹𝗱' }), { stripTwitterText: true })

    expect(quote.text).toBe('Bold')
  })

  it('falls back to the username when there is no display name', () => {
    const quote = fromTweet(tweet({ author: { username: 'otoneko' } }))

    expect(quote.displayName).toBe('otoneko')
  })

  it('is null when there is no avatar', () => {
    const quote = fromTweet(tweet({ author: { username: 'otoneko' } }))

    expect(quote.avatar).toBeNull()
  })

  it('rejects objects that are not tweets', () => {
    expect(() => fromTweet(null)).toThrow(ValidationError)
    expect(() => fromTweet({})).toThrow(ValidationError)
    expect(() => fromTweet({ text: 'hi' })).toThrow(ValidationError)
  })
})
