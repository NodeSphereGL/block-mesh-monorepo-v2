/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

type ErrorWithCode = Error & { code: number }
type MaybeErrorWithCode = ErrorWithCode | null | undefined

const createErrorFromCodeLookup: Map<number, () => ErrorWithCode> = new Map()
const createErrorFromNameLookup: Map<string, () => ErrorWithCode> = new Map()

/**
 * CannotValidateProof: 'Cannot Validate Proof.'
 *
 * @category Errors
 * @category generated
 */
export class CannotValidateProofError extends Error {
  readonly code: number = 0x1770
  readonly name: string = 'CannotValidateProof'
  constructor() {
    super('Cannot Validate Proof.')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, CannotValidateProofError)
    }
  }
}

createErrorFromCodeLookup.set(0x1770, () => new CannotValidateProofError())
createErrorFromNameLookup.set(
  'CannotValidateProof',
  () => new CannotValidateProofError()
)

/**
 * InvalidProof: 'Invalid Merkle proof.'
 *
 * @category Errors
 * @category generated
 */
export class InvalidProofError extends Error {
  readonly code: number = 0x1771
  readonly name: string = 'InvalidProof'
  constructor() {
    super('Invalid Merkle proof.')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidProofError)
    }
  }
}

createErrorFromCodeLookup.set(0x1771, () => new InvalidProofError())
createErrorFromNameLookup.set('InvalidProof', () => new InvalidProofError())

/**
 * InvalidProofLength: 'Invalid Proof Length.'
 *
 * @category Errors
 * @category generated
 */
export class InvalidProofLengthError extends Error {
  readonly code: number = 0x1772
  readonly name: string = 'InvalidProofLength'
  constructor() {
    super('Invalid Proof Length.')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, InvalidProofLengthError)
    }
  }
}

createErrorFromCodeLookup.set(0x1772, () => new InvalidProofLengthError())
createErrorFromNameLookup.set(
  'InvalidProofLength',
  () => new InvalidProofLengthError()
)

/**
 * DropAlreadyClaimed: 'Drop already claimed.'
 *
 * @category Errors
 * @category generated
 */
export class DropAlreadyClaimedError extends Error {
  readonly code: number = 0x1773
  readonly name: string = 'DropAlreadyClaimed'
  constructor() {
    super('Drop already claimed.')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, DropAlreadyClaimedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1773, () => new DropAlreadyClaimedError())
createErrorFromNameLookup.set(
  'DropAlreadyClaimed',
  () => new DropAlreadyClaimedError()
)

/**
 * ExceededMaxClaim: 'Exceeded maximum claim amount.'
 *
 * @category Errors
 * @category generated
 */
export class ExceededMaxClaimError extends Error {
  readonly code: number = 0x1774
  readonly name: string = 'ExceededMaxClaim'
  constructor() {
    super('Exceeded maximum claim amount.')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ExceededMaxClaimError)
    }
  }
}

createErrorFromCodeLookup.set(0x1774, () => new ExceededMaxClaimError())
createErrorFromNameLookup.set(
  'ExceededMaxClaim',
  () => new ExceededMaxClaimError()
)

/**
 * ExceededMaxNumNodes: 'Exceeded maximum number of claimed nodes.'
 *
 * @category Errors
 * @category generated
 */
export class ExceededMaxNumNodesError extends Error {
  readonly code: number = 0x1775
  readonly name: string = 'ExceededMaxNumNodes'
  constructor() {
    super('Exceeded maximum number of claimed nodes.')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ExceededMaxNumNodesError)
    }
  }
}

createErrorFromCodeLookup.set(0x1775, () => new ExceededMaxNumNodesError())
createErrorFromNameLookup.set(
  'ExceededMaxNumNodes',
  () => new ExceededMaxNumNodesError()
)

/**
 * Unauthorized: 'Account is not authorized to execute this instruction'
 *
 * @category Errors
 * @category generated
 */
export class UnauthorizedError extends Error {
  readonly code: number = 0x1776
  readonly name: string = 'Unauthorized'
  constructor() {
    super('Account is not authorized to execute this instruction')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, UnauthorizedError)
    }
  }
}

createErrorFromCodeLookup.set(0x1776, () => new UnauthorizedError())
createErrorFromNameLookup.set('Unauthorized', () => new UnauthorizedError())

/**
 * OwnerMismatch: 'Token account owner did not match intended owner'
 *
 * @category Errors
 * @category generated
 */
export class OwnerMismatchError extends Error {
  readonly code: number = 0x1777
  readonly name: string = 'OwnerMismatch'
  constructor() {
    super('Token account owner did not match intended owner')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, OwnerMismatchError)
    }
  }
}

createErrorFromCodeLookup.set(0x1777, () => new OwnerMismatchError())
createErrorFromNameLookup.set('OwnerMismatch', () => new OwnerMismatchError())

/**
 * BadMath: 'Bad math'
 *
 * @category Errors
 * @category generated
 */
export class BadMathError extends Error {
  readonly code: number = 0x1778
  readonly name: string = 'BadMath'
  constructor() {
    super('Bad math')
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, BadMathError)
    }
  }
}

createErrorFromCodeLookup.set(0x1778, () => new BadMathError())
createErrorFromNameLookup.set('BadMath', () => new BadMathError())

/**
 * Attempts to resolve a custom program error from the provided error code.
 * @category Errors
 * @category generated
 */
export function errorFromCode(code: number): MaybeErrorWithCode {
  const createError = createErrorFromCodeLookup.get(code)
  return createError != null ? createError() : null
}

/**
 * Attempts to resolve a custom program error from the provided error name, i.e. 'Unauthorized'.
 * @category Errors
 * @category generated
 */
export function errorFromName(name: string): MaybeErrorWithCode {
  const createError = createErrorFromNameLookup.get(name)
  return createError != null ? createError() : null
}
