# @makeitaquote/voids

Generate "Make it a Quote" images through the Voids API.

[![npm](https://img.shields.io/npm/v/@makeitaquote/voids)](https://www.npmjs.com/package/@makeitaquote/voids) [![CI](https://img.shields.io/github/actions/workflow/status/otnc/makeitaquote-voids/ci.yml?branch=main&label=ci)](https://github.com/otnc/makeitaquote-voids/actions) [![License](https://img.shields.io/github/license/otnc/makeitaquote-voids)](LICENSE) [![Node](https://img.shields.io/node/v/@makeitaquote/voids)](https://www.npmjs.com/package/@makeitaquote/voids) [![技術者倫理|遵守済み](https://gijutsusharin.li/badge.svg)](https://gijutsusharin.li)

Calls the Voids API instead of rendering locally — no native binaries, no fonts, works anywhere Node.js runs.

> The Voids API (`https://api.voids.top`) is not operated by this package's developer. Please don't open issues here about it being down.

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
- [Endpoints](#endpoints) — `toURL()` vs `toBuffer()`
- [Errors](#errors)
- [Migrating from `makeitaquote/api`](#migrating-from-makeitaquoteapi)
- [Local rendering instead](#local-rendering-instead)
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

`@makeitaquote/voids` has its own `MiQError`/`ValidationError`, separate from `makeitaquote`'s:

```ts
import { MiQError } from 'makeitaquote'
import { MiQError as VoidsMiQError } from '@makeitaquote/voids'
// These are two different classes. instanceof is always false across them.
```

If you use both packages, check `error.name` instead, or catch each package's error class individually.

---

## Migrating from `makeitaquote/api`

`makeitaquote` v12 removed the `makeitaquote/api` subpath. Everything it exported now lives here, unchanged:

```diff
-import { VoidsMiQ } from 'makeitaquote/api'
+import { VoidsMiQ } from '@makeitaquote/voids'
```

Class name, method names, error types and defaults are all identical — the only change is the import.

---

## Local rendering instead

This package only calls a third-party API. For rendering images locally — no network dependency, more control over the theme — see [`makeitaquote`](https://github.com/otnc/makeitaquote).

---

## Author

otoneko. https://github.com/otnc

---

## Licence

MIT — see [LICENSE](LICENSE).

This package makes no local use of fonts or emoji assets; every image is generated by the Voids API, which is not operated by this project's author.
