import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

export interface CredentialMetadata {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  verified_by: string;
}

// Initialize Solana connection
export const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
  'confirmed'
);

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
    console.error('Error fetching balance:', error);
    return 0;
  }
}

// Simplified credential storage (for MVP)
// In production, this would mint actual SPL tokens on-chain
export interface StoredCredential {
  tokenAddress: string;
  metadata: CredentialMetadata;
  mintedAt: string;
}

// For hackathon MVP: Store credentials in memory/database
// Real implementation would use Metaplex or Token-2022
export async function mintCredentialSimplified(
  userWalletAddress: string,
  metadata: CredentialMetadata
): Promise<StoredCredential> {
  // Generate a mock token address
  const tokenAddress = Keypair.generate().publicKey.toBase58();
  
  return {
    tokenAddress,
    metadata,
    mintedAt: new Date().toISOString(),
  };
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

