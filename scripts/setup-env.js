const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const templatePath = path.join(__dirname, '..', 'ENV_TEMPLATE.txt');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Skipping...');
  process.exit(0);
}

// Read the template
const template = fs.readFileSync(templatePath, 'utf-8');

// Read the issuer keypair to get the private key
const keypairPath = path.join(__dirname, '..', 'issuer-keypair.json');
const keypairData = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const privateKeyBase64 = Buffer.from(keypairData.secretKey).toString('base64');

// Replace the private key in the template
const envContent = template.replace('ISSUER_PRIVATE_KEY=UZCwNMAViGRdpC/qDSPgKdevKgUBuUs7pc7oCEdp22mzFTJeq3/fh4vEeXaH/cdsF1URZOat3n8sHE1BefOdbQ==', `ISSUER_PRIVATE_KEY=${privateKeyBase64}`);

// Write .env.local
fs.writeFileSync(envPath, envContent);

console.log('✅ .env.local created!');
console.log('\n📝 Next steps:');
console.log('1. Sign up at https://supabase.com');
console.log('2. Create a new project');
console.log('3. Add your Supabase credentials to .env.local');
console.log('4. Run the SQL schema from SQL_SCHEMA.sql');
console.log('5. Run: npm run dev\n');

