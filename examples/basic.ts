import { VoidsMiQ } from '@makeitaquote/voids'

const miq = new VoidsMiQ()
  .setText('Hello World!')
  .setUsername('otoneko.')
  .setDisplayName('音猫｡')
  .setAvatar('https://example.test/avatar.png')

// One round trip, image bytes only — nothing is stored on the API's server.
const buffer = await miq.toBuffer()
console.log(buffer.byteLength)

// Two round trips, but the API hands back a URL it will keep hosting.
const url = await miq.toURL()
console.log(url)
