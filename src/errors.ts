import type { EndpointPath } from './endpoints'
import type { VoidsApiErrorOptions } from './types'

export interface MiQErrorOptions {
  cause?: unknown
}

/** Base class for everything this package throws. */
export class MiQError extends Error {
  constructor(message: string, options?: MiQErrorOptions) {
    super(message, options)
    this.name = 'MiQError'
  }
}

export interface ValidationErrorOptions extends MiQErrorOptions {
  /** Which input field was rejected, e.g. `'text'`. */
  field?: string
}

/** An input failed a type, range or presence check. */
export class ValidationError extends MiQError {
  readonly field: string | undefined

  constructor(message: string, options?: ValidationErrorOptions) {
    super(message, options)
    this.name = 'ValidationError'
    this.field = options?.field
  }
}

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
