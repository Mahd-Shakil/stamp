const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function airdrop() {
    try {
        // Read the keypair
        const keypairPath = path.join(__dirname, '..', 'issuer-keypair.json');

        if (!fs.existsSync(keypairPath)) {
            console.error('issuer-keypair.json not found!');
            process.exit(1);
        }

        const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
        const publicKey = new PublicKey(keypairData.publicKey);

        // Connect to devnet
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

        // Request 2 SOL
        const signature = await connection.requestAirdrop(
            publicKey,
            2 * LAMPORTS_PER_SOL
        );


        // Wait for confirmation
        await connection.confirmTransaction(signature);

        // Check balance
        const balance = await connection.getBalance(publicKey);
    } catch (error) {
        console.error('\nAirdrop failed:', error.message);
        process.exit(1);
    }
}
airdrop();


