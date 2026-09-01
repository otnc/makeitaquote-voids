import { describe, expect, it } from 'vitest'
import { ValidationError } from './errors'
import { fromFxTwitterStatus, fromTwitterApiV2Tweet } from './tweetAdapters'

describe('fromTwitterApiV2Tweet', () => {
  it('matches the tweet to its author in includes.users', () => {
    const tweet = fromTwitterApiV2Tweet(
      { text: 'Hello World!', author_id: '1' },
      {
        users: [
          {
            id: '1',
            username: 'otoneko',
            name: '音猫｡',
            profile_image_url: 'https://x.test/a.png',
          },
        ],
      },
    )

    expect(tweet).toEqual({
      text: 'Hello World!',
      author: { username: 'otoneko', name: '音猫｡', avatarUrl: 'https://x.test/a.png' },
    })
  })

  it('throws when includes.users has no matching author', () => {
    expect(() => fromTwitterApiV2Tweet({ text: 'hi', author_id: '1' }, { users: [] })).toThrow(
      ValidationError,
    )
  })

  it('throws when includes is missing entirely', () => {
    expect(() => fromTwitterApiV2Tweet({ text: 'hi', author_id: '1' })).toThrow(ValidationError)
  })
})

describe('fromFxTwitterStatus', () => {
  it('maps FxTwitter field names onto TweetLike', () => {
    const tweet = fromFxTwitterStatus({
      text: 'Hello World!',
      author: { screen_name: 'otoneko', name: '音猫｡', avatar_url: 'https://x.test/a.png' },
    })

    expect(tweet).toEqual({
      text: 'Hello World!',
      author: { username: 'otoneko', name: '音猫｡', avatarUrl: 'https://x.test/a.png' },
    })
  })
})
