# 🎓 Vouch - Blockchain Resume Verification

A proof-of-concept platform for issuing and verifying work experience credentials using Solana blockchain.

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Wallet Setup (✅ ALREADY DONE)
Your Solana issuer wallet has been generated:
- **Public Key**: `D44j1wmmiDyJw9Vs8nWQTqwFTRWuY4wjEwHTj3ZoQHPz`
- **Balance**: 2 SOL (Devnet)
- **Private Key**: Stored in `.env.local`

### 3. Supabase Setup (⚠️ YOU NEED TO DO THIS)

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (takes ~2 minutes)
3. Go to **SQL Editor** and run the contents of `SQL_SCHEMA.sql`
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (click Reveal)
5. Add these to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Run the App
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
├── app/
│   ├── page.tsx              # Home page
│   ├── dashboard/            # User dashboard
│   └── employer/             # Employer portal
├── lib/
│   └── solana.ts             # Blockchain utilities
├── scripts/
│   ├── generate-wallet.js    # Generate Solana wallet
│   ├── airdrop-sol.js        # Airdrop devnet SOL
│   └── setup-env.js          # Setup environment
├── SQL_SCHEMA.sql            # Database schema
└── issuer-keypair.json       # Your wallet (KEEP SECRET!)
```

## 🔑 What's Already Set Up

✅ Next.js project with TypeScript & Tailwind  
✅ Solana Web3.js dependencies  
✅ Issuer wallet generated  
✅ 2 SOL airdropped to devnet wallet  
✅ `.env.local` created with wallet key  
✅ Basic UI pages  
✅ Database schema ready  

## ⏭️ Next Steps

1. **Add Supabase credentials** to `.env.local`
2. **Run SQL schema** in Supabase dashboard
3. **Test the app** - visit `/dashboard` and `/employer`
4. **(Optional)** Sign up for [Web3.Storage](https://web3.storage) for IPFS

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Generate a new wallet
node scripts/generate-wallet.js

# Airdrop devnet SOL
node scripts/airdrop-sol.js

# Build for production
npm run build
```

## 🎯 How It Works

1. **Users** submit verification requests via the dashboard
2. **Employers** approve/reject requests in the employer portal
3. **On approval**, a credential token is minted to the user's wallet
4. **Recruiters** can verify credentials by checking the user's public profile

## 📝 Environment Variables

See `ENV_TEMPLATE.txt` for all required environment variables.

## 🔐 Security Notes

- `issuer-keypair.json` contains your private key - **NEVER commit this!**
- It's already in `.gitignore`
- This is a DEVNET project - not for production use

## 🎨 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Blockchain**: Solana Devnet
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth

## 📚 Resources

- [Solana Docs](https://docs.solana.com/)
- [Supabase Docs](https://supabase.com/docs)
- [Solana Devnet Faucet](https://faucet.solana.com/)

---

**Built for a 24-hour hackathon** 🚀

