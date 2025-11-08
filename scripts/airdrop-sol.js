const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function airdrop() {
  try {
    // Read the keypair
    const keypairPath = path.join(__dirname, '..', 'issuer-keypair.json');
    
    if (!fs.existsSync(keypairPath)) {
      console.error('❌ issuer-keypair.json not found!');
      console.log('Please run: node scripts/generate-wallet.js first\n');
      process.exit(1);
    }

    const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
    const publicKey = new PublicKey(keypairData.publicKey);

    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    console.log('\n🪂 Requesting airdrop for:', publicKey.toBase58());
    console.log('⏳ This may take 30-60 seconds...\n');
    
    // Request 2 SOL
    const signature = await connection.requestAirdrop(
      publicKey,
      2 * LAMPORTS_PER_SOL
    );
    
    console.log('📝 Transaction signature:', signature);
    
    // Wait for confirmation
    await connection.confirmTransaction(signature);
    
    // Check balance
    const balance = await connection.getBalance(publicKey);
    console.log('\n✅ Airdrop successful!');
    console.log('💰 New balance:', balance / LAMPORTS_PER_SOL, 'SOL');
    console.log('\n🎉 Your wallet is ready to mint credential tokens!\n');
  } catch (error) {
    console.error('\n❌ Airdrop failed:', error.message);
    console.log('\n💡 Try these alternatives:');
    console.log('1. Wait a minute and try again (rate limited)');
    console.log('2. Use the web faucet: https://faucet.solana.com/');
    console.log('3. Use: https://solfaucet.com/\n');
    process.exit(1);
  }
}

airdrop();

