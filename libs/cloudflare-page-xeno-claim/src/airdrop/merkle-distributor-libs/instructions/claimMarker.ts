/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category ClaimMarker
 * @category generated
 */
export const claimMarkerStruct = new beet.BeetArgsStruct<{
  instructionDiscriminator: number[] /* size: 8 */
}>(
  [['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)]],
  'ClaimMarkerInstructionArgs'
)
/**
 * Accounts required by the _claimMarker_ instruction
 *
 * @property [_writable_, **signer**] signer
 * @property [_writable_] signerTokenAccount
 * @property [] airDropper
 * @property [_writable_] claimMarker
 * @property [_writable_] claimMarkerTokenAccount
 * @property [] mint
 * @property [] associatedTokenProgram
 * @category Instructions
 * @category ClaimMarker
 * @category generated
 */
export type ClaimMarkerInstructionAccounts = {
  signer: web3.PublicKey
  signerTokenAccount: web3.PublicKey
  airDropper: web3.PublicKey
  claimMarker: web3.PublicKey
  claimMarkerTokenAccount: web3.PublicKey
  mint: web3.PublicKey
  systemProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  associatedTokenProgram: web3.PublicKey
  rent?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const claimMarkerInstructionDiscriminator = [
  79, 211, 67, 104, 157, 64, 232, 173,
]

/**
 * Creates a _ClaimMarker_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @category Instructions
 * @category ClaimMarker
 * @category generated
 */
export function createClaimMarkerInstruction(
  accounts: ClaimMarkerInstructionAccounts,
  programId = new web3.PublicKey('AZMc26abaSP7si1wtLaV5yPxTxpWd895M8YpJFFdQ8Qw')
) {
  const [data] = claimMarkerStruct.serialize({
    instructionDiscriminator: claimMarkerInstructionDiscriminator,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.signer,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.signerTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.airDropper,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.claimMarker,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.claimMarkerTokenAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.mint,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.associatedTokenProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
