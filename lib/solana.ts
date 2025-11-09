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

// Load issuer keypair from file or environment variable for signing transactions
function loadIssuerKeypair(): Keypair {
  // First, try loading from environment variable (for team members)
  if (process.env.ISSUER_PRIVATE_KEY) {
    try {
      const privateKeyBase64 = process.env.ISSUER_PRIVATE_KEY;
      const privateKeyBytes = Buffer.from(privateKeyBase64, 'base64');
      return Keypair.fromSecretKey(privateKeyBytes);
    } catch (error) {
      console.error('Failed to load issuer keypair from environment variable:', error);
    }
  }
  
  // Fallback to file (for local development)
  try {
    const keypairPath = path.join(process.cwd(), 'issuer-keypair.json');
    if (fs.existsSync(keypairPath)) {
      const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
      return Keypair.fromSecretKey(new Uint8Array(keypairData.secretKey));
    }
  } catch (error) {
    console.error('Failed to load issuer keypair from file:', error);
  }
  
  throw new Error('Issuer keypair not found! Please set ISSUER_PRIVATE_KEY in .env.local or create issuer-keypair.json');
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
    console.log('[SOLANA] Starting NFT minting process...');
    console.log('[SOLANA] User Wallet Address:', userWalletAddress);
    console.log('[SOLANA] Issuer Public Key:', issuerKeypair.publicKey.toBase58());
    
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
    console.log('[SOLANA] Prepared NFT metadata:', JSON.stringify(metadataJson, null, 2));

    // Upload metadata (using mockStorage for demo - upgrade to IPFS for production)
    console.log('[SOLANA] Uploading metadata to storage...');
    const { uri } = await metaplex.nfts().uploadMetadata(metadataJson);
    console.log('[SOLANA] ✅ Metadata uploaded successfully!');
    console.log('[SOLANA] Metadata URI:', uri);

    // Create the NFT on Solana blockchain
    console.log('[SOLANA] Creating NFT on Solana blockchain...');
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
    console.log('[SOLANA] ✅ NFT created successfully!');
    console.log('[SOLANA] NFT Mint Address:', nft.address.toBase58());

    // Transfer NFT ownership to the user's wallet
    console.log('[SOLANA] Transferring NFT to user wallet...');
    const userPublicKey = new PublicKey(userWalletAddress);
    await metaplex.nfts().transfer({
      nftOrSft: nft,
      toOwner: userPublicKey,
    });
    console.log('[SOLANA] ✅ NFT transferred successfully to user!');
    console.log('[SOLANA] 🎉 Complete! NFT minted and transferred');

    const result = {
      tokenAddress: nft.address.toBase58(),
      metadata,
      mintedAt: new Date().toISOString(),
    };
    
    console.log('[SOLANA] Final result:', result);
    return result;
  } catch (error: any) {
    console.error('[SOLANA] ❌ Error during minting:', error);
    console.error('[SOLANA] Error message:', error.message);
    console.error('[SOLANA] Error stack:', error.stack);
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

