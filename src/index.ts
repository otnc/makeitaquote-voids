export { stripDiscordMarkdown } from '@makeitaquote/utils/discord'
export { stripMarkdown } from '@makeitaquote/utils/markdown'
export { resolveNoteText, stripMfm } from '@makeitaquote/utils/mfm'
export { stripTwitterText } from '@makeitaquote/utils/twitter'
export { MiQ, VoidsMiQ } from './client'
export { DEFAULT_BASE_URL, endpoints } from './endpoints'
export { MiQError, ValidationError, VoidsApiError } from './errors'
export { fromNote } from './note'
export { fromMessage } from './source'
export { fromTweet } from './tweet'
export {
  type FxTwitterStatusLike,
  fromFxTwitterStatus,
  fromTwitterApiV2Tweet,
  type TweetV2Like,
  type UserV2Like,
} from './tweetAdapters'
export type {
  AvatarSource,
  MentionOptions,
  MessageLike,
  MessageSourceOptions,
  NoteLike,
  NoteSourceOptions,
  QuoteData,
  QuoteInput,
  TweetLike,
  TweetSourceOptions,
  VoidsOptions,
  VoidsPayload,
  VoidsQuoteData,
} from './types'
