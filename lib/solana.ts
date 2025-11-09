import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { Metaplex, keypairIdentity, mockStorage } from '@metaplex-foundation/js';
import fs from 'fs';
import path from 'path';

export interface CredentialMetadata {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  verified_by: string;
}

// Initialize Solana connection to devnet
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

// Load issuer keypair from file for signing transactions
function loadIssuerKeypair(): Keypair {
  const keypairPath = path.join(process.cwd(), 'issuer-keypair.json');
  const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  return Keypair.fromSecretKey(new Uint8Array(keypairData.secretKey));
}

// Initialize Metaplex SDK for NFT operations
// Using mockStorage() for fast metadata handling (suitable for demos/hackathons)
const issuerKeypair = loadIssuerKeypair();
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(issuerKeypair))
  .use(mockStorage());

// Helper: Generate wallet for new user
export function generateWallet(): { publicKey: string; privateKey: string } {
  const keypair = Keypair.generate();
  return {
    publicKey: keypair.publicKey.toBase58(),
    privateKey: Buffer.from(keypair.secretKey).toString('base64'),
  };
}

// Helper: Get wallet balance
export async function getWalletBalance(walletAddress: string): Promise<number> {
  try {
    const publicKey = new PublicKey(walletAddress);
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (error) {
    return 0;
  }
}

export interface StoredCredential {
  tokenAddress: string;
  metadata: CredentialMetadata;
  mintedAt: string;
}

/**
 * Mints a real NFT credential on Solana blockchain
 * 
 * Creates an immutable NFT with employment credential metadata that is:
 * - Minted on Solana devnet (free for testing)
 * - Transferred to user's wallet address
 * - Verifiable on Solana Explorer
 * - Contains all employment details as on-chain attributes
 * 
 * @param userWalletAddress - The Solana wallet address to receive the NFT
 * @param metadata - Employment credential details (company, role, dates, verifier)
 * @returns StoredCredential with the on-chain token address
 */
export async function mintCredentialSimplified(
  userWalletAddress: string,
  metadata: CredentialMetadata
): Promise<StoredCredential> {
  try {
    // Prepare NFT metadata according to Metaplex standard
    const metadataJson = {
      name: `${metadata.company} - ${metadata.role}`,
      description: `Verified by ${metadata.verified_by}`,
      image: 'https://via.placeholder.com/400x400.png?text=Vouch',
      attributes: [
        { trait_type: 'Company', value: metadata.company },
        { trait_type: 'Role', value: metadata.role },
        { trait_type: 'Start', value: metadata.start_date },
        { trait_type: 'End', value: metadata.end_date },
        { trait_type: 'Verified By', value: metadata.verified_by },
      ],
    };

    // Upload metadata (using mockStorage for demo - upgrade to IPFS for production)
    const { uri } = await metaplex.nfts().uploadMetadata(metadataJson);

    // Create the NFT on Solana blockchain
    const { nft } = await metaplex.nfts().create({
      uri,
      name: `Vouch: ${metadata.company}`,
      sellerFeeBasisPoints: 0, // No royalties
      symbol: 'VOUCH',
      creators: [
        {
          address: issuerKeypair.publicKey,
          share: 100,
        },
      ],
      isMutable: false, // Credential cannot be modified
    });

    // Transfer NFT ownership to the user's wallet
    const userPublicKey = new PublicKey(userWalletAddress);
    await metaplex.nfts().transfer({
      nftOrSft: nft,
      toOwner: userPublicKey,
    });

    return {
      tokenAddress: nft.address.toBase58(),
      metadata,
      mintedAt: new Date().toISOString(),
    };
  } catch (error: any) {
    throw new Error(`Failed to mint credential NFT: ${error.message}`);
  }
}

// Validate wallet address format
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

