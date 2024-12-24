/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as web3 from '@solana/web3.js'
import * as beet from '@metaplex-foundation/beet'
import * as beetSolana from '@metaplex-foundation/beet-solana'

/**
 * Arguments used to create {@link ClaimStatus}
 * @category Accounts
 * @category generated
 */
export type ClaimStatusArgs = {
  isClaimed: boolean
  claimant: web3.PublicKey
  claimedAt: beet.bignum
  amount: beet.bignum
}

export const claimStatusDiscriminator = [22, 183, 249, 157, 247, 95, 150, 96]
/**
 * Holds the data for the {@link ClaimStatus} Account and provides de/serialization
 * functionality for that data
 *
 * @category Accounts
 * @category generated
 */
export class ClaimStatus implements ClaimStatusArgs {
  private constructor(
    readonly isClaimed: boolean,
    readonly claimant: web3.PublicKey,
    readonly claimedAt: beet.bignum,
    readonly amount: beet.bignum
  ) {}

  /**
   * Creates a {@link ClaimStatus} instance from the provided args.
   */
  static fromArgs(args: ClaimStatusArgs) {
    return new ClaimStatus(
      args.isClaimed,
      args.claimant,
      args.claimedAt,
      args.amount
    )
  }

  /**
   * Deserializes the {@link ClaimStatus} from the data of the provided {@link web3.AccountInfo}.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static fromAccountInfo(
    accountInfo: web3.AccountInfo<Buffer>,
    offset = 0
  ): [ClaimStatus, number] {
    return ClaimStatus.deserialize(accountInfo.data, offset)
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link ClaimStatus} from its data.
   *
   * @throws Error if no account info is found at the address or if deserialization fails
   */
  static async fromAccountAddress(
    connection: web3.Connection,
    address: web3.PublicKey,
    commitmentOrConfig?: web3.Commitment | web3.GetAccountInfoConfig
  ): Promise<ClaimStatus> {
    const accountInfo = await connection.getAccountInfo(
      address,
      commitmentOrConfig
    )
    if (accountInfo == null) {
      throw new Error(`Unable to find ClaimStatus account at ${address}`)
    }
    return ClaimStatus.fromAccountInfo(accountInfo, 0)[0]
  }

  /**
   * Provides a {@link web3.Connection.getProgramAccounts} config builder,
   * to fetch accounts matching filters that can be specified via that builder.
   *
   * @param programId - the program that owns the accounts we are filtering
   */
  static gpaBuilder(
    programId: web3.PublicKey = new web3.PublicKey(
      'AZMc26abaSP7si1wtLaV5yPxTxpWd895M8YpJFFdQ8Qw'
    )
  ) {
    return beetSolana.GpaBuilder.fromStruct(programId, claimStatusBeet)
  }

  /**
   * Deserializes the {@link ClaimStatus} from the provided data Buffer.
   * @returns a tuple of the account data and the offset up to which the buffer was read to obtain it.
   */
  static deserialize(buf: Buffer, offset = 0): [ClaimStatus, number] {
    return claimStatusBeet.deserialize(buf, offset)
  }

  /**
   * Serializes the {@link ClaimStatus} into a Buffer.
   * @returns a tuple of the created Buffer and the offset up to which the buffer was written to store it.
   */
  serialize(): [Buffer, number] {
    return claimStatusBeet.serialize({
      accountDiscriminator: claimStatusDiscriminator,
      ...this,
    })
  }

  /**
   * Returns the byteSize of a {@link Buffer} holding the serialized data of
   * {@link ClaimStatus}
   */
  static get byteSize() {
    return claimStatusBeet.byteSize
  }

  /**
   * Fetches the minimum balance needed to exempt an account holding
   * {@link ClaimStatus} data from rent
   *
   * @param connection used to retrieve the rent exemption information
   */
  static async getMinimumBalanceForRentExemption(
    connection: web3.Connection,
    commitment?: web3.Commitment
  ): Promise<number> {
    return connection.getMinimumBalanceForRentExemption(
      ClaimStatus.byteSize,
      commitment
    )
  }

  /**
   * Determines if the provided {@link Buffer} has the correct byte size to
   * hold {@link ClaimStatus} data.
   */
  static hasCorrectByteSize(buf: Buffer, offset = 0) {
    return buf.byteLength - offset === ClaimStatus.byteSize
  }

  /**
   * Returns a readable version of {@link ClaimStatus} properties
   * and can be used to convert to JSON and/or logging
   */
  pretty() {
    return {
      isClaimed: this.isClaimed,
      claimant: this.claimant.toBase58(),
      claimedAt: (() => {
        const x = <{ toNumber: () => number }>this.claimedAt
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
      amount: (() => {
        const x = <{ toNumber: () => number }>this.amount
        if (typeof x.toNumber === 'function') {
          try {
            return x.toNumber()
          } catch (_) {
            return x
          }
        }
        return x
      })(),
    }
  }
}

/**
 * @category Accounts
 * @category generated
 */
export const claimStatusBeet = new beet.BeetStruct<
  ClaimStatus,
  ClaimStatusArgs & {
    accountDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['accountDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['isClaimed', beet.bool],
    ['claimant', beetSolana.publicKey],
    ['claimedAt', beet.i64],
    ['amount', beet.u64],
  ],
  ClaimStatus.fromArgs,
  'ClaimStatus'
)
