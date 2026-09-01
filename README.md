# @makeitaquote/voids

Generate "Make it a Quote" images through the Voids API.

[![npm](https://img.shields.io/npm/v/@makeitaquote/voids)](https://www.npmjs.com/package/@makeitaquote/voids) [![CI](https://img.shields.io/github/actions/workflow/status/otnc/makeitaquote-voids/ci.yml?branch=main&label=ci)](https://github.com/otnc/makeitaquote-voids/actions) [![License](https://img.shields.io/github/license/otnc/makeitaquote-voids)](LICENSE) [![Node](https://img.shields.io/node/v/@makeitaquote/voids)](https://www.npmjs.com/package/@makeitaquote/voids) [![技術者倫理|遵守済み](https://gijutsusharin.li/badge.svg)](https://gijutsusharin.li)

Calls the Voids API instead of rendering locally — no native binaries, no fonts, works anywhere Node.js runs.

| Default (`dark`) | `color` |
| --- | --- |
| ![Sample quote image, default dark theme](assets/readme/mono.png) | ![Sample quote image, color theme](assets/readme/color.png) |

> [!Note]
>   
> The Voids API (`https://api.voids.top`) is not operated by this package's developer. Please don't open issues here about it being down.

> [!Important]
>   
> This package only calls the Voids API — it does not render images locally. If you want local rendering instead (no network dependency, more control over the theme), use `makeitaquote`: https://github.com/otnc/makeitaquote
>
> ```sh
> npm install makeitaquote
> ```
>   
> Prefer a different upstream API instead? [`@makeitaquote/miqx`](https://github.com/otnc/makeitaquote-miqx) does the same thing this package does, through the MiqX API:
>
> ```sh
> npm install @makeitaquote/miqx
> ```

```sh
npm install @makeitaquote/voids
```

```ts
import { writeFile } from 'node:fs/promises'
import { VoidsMiQ } from '@makeitaquote/voids'

const png = await new VoidsMiQ()
  .setText('吾輩は猫である。名前はまだ無い。')
  .setAvatar('https://example.com/avatar.png')
  .setUsername('otoneko.')
  .setDisplayName('音猫｡')
  .toBuffer()

await writeFile('quote.png', png)
```

CommonJS works too — every entry point ships both `require` and `import`:

```js
const { writeFile } = require('node:fs/promises')
const { VoidsMiQ } = require('@makeitaquote/voids')

new VoidsMiQ()
  .setText('吾輩は猫である。名前はまだ無い。')
  .setAvatar('https://example.com/avatar.png')
  .setUsername('otoneko.')
  .setDisplayName('音猫｡')
  .toBuffer()
  .then((png) => writeFile('quote.png', png))
```

Requires Node.js 18 or newer. On 18 and 20, Node prints an `ExperimentalWarning` about the Fetch API the first time this package runs — harmless, and gone as of Node 21.

---

## Contents

- [Discord bots](#discord-bots) — the one thing most people are here for
- [Misskey notes](#misskey-notes) — quoting a note, and MFM
- [X (Twitter)](#x-twitter) — quoting a tweet, via FxTwitter or the official API
- [Markdown](#markdown) — plain CommonMark, for anything else
- [Endpoints](#endpoints) — `toURL()` vs `toBuffer()`
- [Errors](#errors)
- [Migrating from `makeitaquote/api`](#migrating-from-makeitaquoteapi)
- [Author](#author) · [Licence](#licence)

---

## Discord bots

```ts
import { AttachmentBuilder } from 'discord.js'
import { VoidsMiQ } from '@makeitaquote/voids'

const png = await new VoidsMiQ().setFromMessage(message).toBuffer()

await message.reply({
  files: [new AttachmentBuilder(png, { name: 'quote.png' })],
})
```

`setFromMessage()` takes the content, the name and the avatar off the message. It accepts anything shaped like a Discord message, so discord.js v13, v14 and discord.js-selfbot-v13 all work without this package depending on any of them.

By default it uses what a reader of that server saw — the per-server avatar and nickname. Either can be switched to the account-wide version:

```ts
new VoidsMiQ().setFromMessage(message, { avatar: 'global', name: 'global' })
```

| Option | Default | Alternative |
| --- | --- | --- |
| `avatar` | `'guild'` — per-server avatar | `'global'` — account avatar |
| `name` | `'nickname'` — server nickname | `'global'` — account name |
| `stripDiscordMarkdown` | `false` — quoted exactly as written | `true` — `**bold**` becomes bold |
| `resolveMentions` | `true` — `<@id>` becomes `@name` | `false` — quoted as the raw token |

Whichever avatar or name you choose, the other is still the fallback, so a message with only one of them always renders.

`message.content` normally comes through untouched — `**bold**` is quoted with its asterisks and all, since that is what was actually typed. Opt into plain text with `stripDiscordMarkdown: true`, or call the exported `stripDiscordMarkdown()` yourself on any text.

---

## Misskey notes

`setFromNote()` reads a note the way `setFromMessage()` reads a message. It takes what the API returns, unchanged:

```ts
const note = await fetch('https://misskey.example/api/notes/show', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ noteId }),
}).then((r) => r.json())

const png = await new VoidsMiQ().setFromNote(note).toBuffer()
```

The display name goes over the handle, which is written `@user` locally and `@user@host` for a remote author — exactly as Misskey writes it.

| Option | Default | Alternative |
| --- | --- | --- |
| `stripMfm` | `true` — `$[jelly x]` becomes `x` | `false` — quoted exactly as written |
| `preferCw` | `false` — quotes the note, not the content warning | `true` — quotes the content warning instead |

MFM is stripped by default, unlike Discord's markdown, because the markup differs: `**bold**` still reads as its own text with the asterisks left in, while `$[jelly ぷりん]` does not — the function name and brackets are scaffolding that was never meant to be read. `stripMfm()` is exported on its own too.

---

## X (Twitter)

`setFromTweet()` reads a tweet the way `setFromMessage()` reads a message — but unlike Discord or Misskey, neither of X's two practical APIs hands back something `TweetLike` accepts as-is, so an adapter comes with each:

```ts
import { fromFxTwitterStatus } from '@makeitaquote/voids'
import { FxTwitterV2 } from 'fxtwitter/v2'

const { status } = await new FxTwitterV2().getStatus(tweetId)

const png = await new VoidsMiQ().setFromTweet(fromFxTwitterStatus(status)).toBuffer()
```

[`fxtwitter`](https://www.npmjs.com/package/fxtwitter) needs no API key and returns the author inline, which is the easier path. For the official API, `fromTwitterApiV2Tweet()` combines a tweet with the separate `includes.users` entry [`twitter-api-v2`](https://www.npmjs.com/package/twitter-api-v2) (or any client with the same response shape) returns it in:

```ts
import { fromTwitterApiV2Tweet } from '@makeitaquote/voids'
import { TwitterApi } from 'twitter-api-v2'

const { data: tweet, includes } = await client.v2.singleTweet(tweetId, {
  expansions: ['author_id'],
  'user.fields': ['profile_image_url'],
})

const png = await new VoidsMiQ()
  .setFromTweet(fromTwitterApiV2Tweet(tweet, includes))
  .toBuffer()
```

Neither library is a dependency of this package — both adapters take a structural subset of the real response shape, the same as `MessageLike`, so any object with those fields works, whether or not the library that produced it is actually installed.

X does not expand a tweet's `t.co` links or `@handle` mentions into anything else in its own timeline, so the text goes through exactly as written by default. The one thing worth opting into is `stripTwitterText`, which normalizes "Twitter bold/italic" (Unicode Mathematical Alphanumeric Symbols) back to plain ASCII:

```ts
new VoidsMiQ().setFromTweet(tweet, { stripTwitterText: true })
```

---

## Markdown

For a source that is neither Discord, Misskey nor X — a blog post, a GitHub comment, a Mastodon toot — `stripMarkdown()` strips plain CommonMark (plus the common GFM extras: strikethrough, tables, task lists). There is no `setFromXxx()` for it, since it takes a bare string with no source to opt out of stripping *from*:

```ts
import { stripMarkdown } from '@makeitaquote/voids'

new VoidsMiQ().setText(stripMarkdown(text))

stripMarkdown('**bold**, *italic*, ~~strike~~, [a link](url)')
// → 'bold, italic, strike, a link'
```

A link or image keeps its label/alt text and drops the URL — that is what a reader saw, not the address behind it.

---

## Endpoints

The two Voids endpoints are not "stable" and "beta" — they return different things, so the method you call decides the endpoint, not the other way round:

| | `toURL()` | `toBuffer()` | `toBuffer({ hosted: true })` |
| --- | --- | --- | --- |
| Endpoint | `/fakequote` | `/fakequotebeta` | `/fakequote` → GET |
| Returns | a hosted image URL | the image bytes | the image bytes |
| Round trips | 1 | 1 | 2 |
| Stored on their server | **yes** | no | **yes** |

`toBuffer({ hosted: true })` uploads and then downloads it back — two round trips, only useful if you specifically want the bytes of the hosted image.

---

## Errors

Everything thrown extends `MiQError`:

```
MiQError
├─ ValidationError    bad input (carries .field)
└─ VoidsApiError      the API refused or failed (.status, .body, .endpoint)
```

`MiQError`/`ValidationError` come from [`@makeitaquote/utils`](https://github.com/otnc/makeitaquote-utils) and are shared with `makeitaquote` and `@makeitaquote/miqx` — the same classes, not just the same names:

```ts
import { MiQError } from 'makeitaquote'
import { MiQError as VoidsMiQError } from '@makeitaquote/voids'
// Same class. instanceof is true across packages.
console.log(MiQError === VoidsMiQError) // true
```

`VoidsApiError` stays specific to this package.

---

## Migrating from `makeitaquote/api`

`makeitaquote` v12 removed the `makeitaquote/api` subpath. Everything it exported now lives here, unchanged:

```diff
-import { VoidsMiQ } from 'makeitaquote/api'
+import { VoidsMiQ } from '@makeitaquote/voids'
```

Class name, method names, error types and defaults are all identical — the only change is the import.

---

## Author

otoneko. https://github.com/otnc

---

## Licence

MIT — see [LICENSE](LICENSE).

This package makes no local use of fonts or emoji assets; every image is generated by the Voids API, which is not operated by this project's author.
