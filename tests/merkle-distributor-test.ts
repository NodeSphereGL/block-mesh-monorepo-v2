import * as anchor from '@coral-xyz/anchor'
import { MerkleDistributor } from '../target/types/merkle_distributor'
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import assert from 'assert'
import {
  airdrop,
  generateHashInput,
  getOrCreateTokenAccountInstruction, getWalletBalance,
  processTransaction, sleep
} from './helpers'
import {
  createMint,
  getAssociatedTokenAddress,
  mintTo
} from '@solana/spl-token'
import { Program } from '@coral-xyz/anchor'
import { claimMarker, createAirDropperInstruction, createMarker } from './merkle-distributor-helpers/wrapper'
import { min } from 'bn.js'

export const admin = Keypair.generate()
export const users = [
  Keypair.generate(),
  Keypair.generate(),
  Keypair.generate()
]
export const tokenMintAuthority = Keypair.generate()
export let mint: PublicKey
export let token9Decimals: PublicKey

describe('0-prep', () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.MerkleDistributor as Program<MerkleDistributor>

  it('Program ID', async () => {
    console.log(`program.id: ${program.programId.toBase58()}`)
  })

  it('Airdrops', async () => {
    for (const key of [...users, admin]) {
      await airdrop(program, key.publicKey, LAMPORTS_PER_SOL * 50_000)
    }
  })

  it('Create main mint', async () => {
    mint = await createMint(
      program.provider.connection,
      admin,
      tokenMintAuthority.publicKey,
      tokenMintAuthority.publicKey,
      9
    )
  })

  it('Mint tokens', async () => {
    for (const key of [admin]) {
      const instructions = await getOrCreateTokenAccountInstruction(
        mint,
        key.publicKey,
        program.provider.connection
      )
      if (instructions === null) {
        continue
      }
      const sig = await processTransaction(
        [instructions],
        program.provider.connection,
        key
      )
      const txn = await program.provider.connection.getParsedTransaction(
        sig.Signature,
        'confirmed'
      )
      assert.equal(
        sig.SignatureResult.err,
        null,
        `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
      )

      await mintTo(
        program.provider.connection,
        admin,
        mint,
        await getAssociatedTokenAddress(mint, key.publicKey),
        tokenMintAuthority,
        LAMPORTS_PER_SOL * 50_000
      )
    }
  })


  it('Create air dropper', async () => {
    const instruction = createAirDropperInstruction(admin.publicKey, mint)
    const sig = await processTransaction(
      [instruction],
      program.provider.connection,
      admin
    )
    const txn = await program.provider.connection.getParsedTransaction(
      sig.Signature,
      'confirmed'
    )
    assert.equal(
      sig.SignatureResult.err,
      null,
      `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
    )
  })


  it('create claims', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const amount = LAMPORTS_PER_SOL * (i + 1)
      const instruction = createMarker(admin.publicKey, mint, user.publicKey, amount)
      const sig = await processTransaction(
        [instruction],
        program.provider.connection,
        admin
      )
      const txn = await program.provider.connection.getParsedTransaction(
        sig.Signature,
        'confirmed'
      )
      assert.equal(
        sig.SignatureResult.err,
        null,
        `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
      )
    }
  })


  it('claim marker', async () => {
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const instruction = claimMarker(user.publicKey, mint)
      const sig = await processTransaction(
        [instruction],
        program.provider.connection,
        user
      )
      const txn = await program.provider.connection.getParsedTransaction(
        sig.Signature,
        'confirmed'
      )
      assert.equal(
        sig.SignatureResult.err,
        null,
        `${mint.toBase58()}\n${txn?.meta?.logMessages.join('\n')}`
      )
      const balance = await getWalletBalance(program.provider.connection, user.publicKey, mint)
      console.log('collect claims user', user.publicKey.toBase58(), ' balance', balance)
    }
  })
})
