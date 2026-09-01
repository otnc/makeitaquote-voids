import { MiQError } from '@makeitaquote/utils/errors'
import type { EndpointPath } from './endpoints'
import type { VoidsApiErrorOptions } from './types'

export type { MiQErrorOptions, ValidationErrorOptions } from '@makeitaquote/utils/errors'
export { MiQError, ValidationError } from '@makeitaquote/utils/errors'

/** The Voids API refused or failed a request. */
export class VoidsApiError extends MiQError {
  readonly status: number | undefined
  readonly body: unknown
  readonly endpoint: EndpointPath

  constructor(message: string, options: VoidsApiErrorOptions) {
    super(message, options)
    this.name = 'VoidsApiError'
    this.status = options.status
    this.body = options.body
    this.endpoint = options.endpoint
  }
}
