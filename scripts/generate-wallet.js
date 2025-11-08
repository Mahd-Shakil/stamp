const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Generate a new keypair
const keypair = Keypair.generate();

console.log('\n🎉 ISSUER WALLET GENERATED!\n');
console.log('Public Key (Wallet Address):');
console.log(keypair.publicKey.toBase58());
console.log('\n----------------------------------------');
console.log('Private Key (base64) - ADD THIS TO .env.local:');
console.log('----------------------------------------');
console.log(Buffer.from(keypair.secretKey).toString('base64'));
console.log('----------------------------------------\n');

// Save keypair to file (backup)
const keypairData = {
  publicKey: keypair.publicKey.toBase58(),
  secretKey: Array.from(keypair.secretKey)
};

const outputPath = path.join(__dirname, '..', 'issuer-keypair.json');
fs.writeFileSync(
  outputPath,
  JSON.stringify(keypairData, null, 2)
);

console.log('✅ Keypair saved to issuer-keypair.json (KEEP THIS SECURE!)');
console.log('✅ This file is in .gitignore and will not be committed\n');
console.log('📝 Next step: Copy the base64 private key above to your .env.local file');
console.log('📝 Then run: node scripts/airdrop-sol.js\n');

