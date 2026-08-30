import type { EndpointPath } from './endpoints'
import type { MiQErrorOptions } from './errors'

/** Anything that can stand in for an avatar image. */
export type AvatarSource = string | URL | Buffer | Uint8Array

/** The normalized quote, after validation. */
export interface QuoteData {
  text: string
  avatar: AvatarSource | null
  username: string
  displayName: string
  watermark: string
}

/** A partial quote, as accepted by `setFromObject()`. */
export interface QuoteInput {
  text?: string
  avatar?: AvatarSource | null
  username?: string
  displayName?: string
  watermark?: string
  /** Keeps the avatar in color instead of desaturating it. Sent to the API verbatim. */
  color?: boolean
}

/**
 * The shape of a Discord message that `setFromMessage()` understands.
 *
 * Structural on purpose: discord.js v13, v14 and discord.js-selfbot-v13 all
 * satisfy it, so this package needs no dependency on any of them.
 */
export interface MessageLike {
  content: string
  author: {
    username: string
    globalName?: string | null
    global_name?: string | null
    discriminator?: string | null
    // Method shorthand, not `displayAvatarURL?: (options?: unknown) => string`.
    // TS checks a property's function type contravariantly under strict mode,
    // so a real `(options?: ImageURLOptions) => string` from discord.js would
    // not satisfy a `(options?: unknown) => string` property — only a
    // shorthand method gets the bivariant check that accepts it.
    displayAvatarURL?(options?: unknown): string
  }
  member?: {
    displayName?: string
    nickname?: string | null
    displayAvatarURL?(options?: unknown): string
  } | null
  /**
   * discord.js's per-message mention Collections. Optional, and each
   * Collection independently so — a `Message` always has all four in
   * practice, but nothing here requires it.
   */
  mentions?: {
    /**
     * Backing `<@!?id>`. Guild nickname wins over the account username.
     * `null`, not just absent, in a DM — discord.js has no guild to resolve
     * a member against there.
     */
    members?: {
      get(id: string): { displayName?: string; nickname?: string | null } | undefined
    } | null
    users?: { get(id: string): { username?: string } | undefined }
    /**
     * Backing `<#id>`. `id` is here only so a DM channel — which carries no
     * `name` at all, not even `null` — still structurally overlaps this type;
     * only `name` is actually read.
     */
    channels?: { get(id: string): { id?: string; name?: string | null } | undefined }
    /** Backing `<@&id>`. */
    roles?: { get(id: string): { name?: string } | undefined }
  }
}

/**
 * How `<t:…>` timestamps are rendered when mentions are resolved.
 *
 * A timestamp is the one token whose text depends on who is looking: Discord
 * renders it in the reader's own locale and zone. An image has no reader to
 * ask, so it renders in UTC and `en-GB` unless told otherwise.
 */
export interface MentionOptions {
  /** BCP 47 tag, e.g. `'ja-JP'`. Default `'en-GB'`. */
  locale?: string
  /** IANA zone, e.g. `'Asia/Tokyo'`. Default `'UTC'`. */
  timeZone?: string
  /** What `<t:…:R>` counts from. Defaults to now; mostly a test seam. */
  now?: Date
}

/**
 * Which version of a Discord user's avatar and name to quote.
 *
 * Both default to the server's, since that is what a reader of that server
 * actually saw. Whichever you pick, the other is the fallback.
 */
export interface MessageSourceOptions {
  /** `'guild'` (default) prefers a per-server avatar; `'global'` the account's. */
  avatar?: 'guild' | 'global'
  /** `'nickname'` (default) prefers a per-server nickname; `'global'` the account's. */
  name?: 'nickname' | 'global'
  /**
   * Runs `message.content` through `stripDiscordMarkdown()` before quoting
   * it. Default false — the content is quoted exactly as written unless you
   * opt in.
   */
  stripDiscordMarkdown?: boolean
  /**
   * Expands Discord's raw tokens into the text a reader saw: user, role and
   * channel mentions, slash commands, `<t:…>` timestamps and guild
   * navigation tabs. Default true.
   *
   * Names come from `message.mentions`, so a mention whose target isn't
   * there (someone who has since left) is left exactly as written; the rest
   * carry what they need in the token and resolve regardless. Pass an object
   * to control how timestamps are rendered.
   */
  resolveMentions?: boolean | MentionOptions
}

/** A quote as sent to and received from the Voids API. */
export interface VoidsQuoteData extends QuoteData {
  /** Keeps the avatar in color. Sent verbatim to the API. */
  color: boolean
}

export interface VoidsOptions {
  baseUrl?: string
  /** Request timeout in ms, default 15000. */
  timeout?: number
  /** Retry attempts for transient failures, default 2. */
  retry?: number
  headers?: Record<string, string>
  signal?: AbortSignal
}

/** The wire format the API expects — snake_case, and `avatar` must be a URL. */
export interface VoidsPayload {
  text: string
  avatar: string | null
  username: string
  display_name: string
  color: boolean
  watermark: string
}

export interface VoidsApiErrorOptions extends MiQErrorOptions {
  status?: number
  body?: unknown
  endpoint: EndpointPath
}
