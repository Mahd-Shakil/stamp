# 🎓 Vouch - Blockchain Resume Verification

A complete platform for issuing and verifying work experience credentials using Solana blockchain. Share your verified resume via a public link in job applications!

## ✨ Key Features

- 🔐 **User Authentication** - Sign up with email/password, auto-generate Solana wallet
- 📝 **Request Verification** - Submit work experience for employer approval
- 🤖 **AI-Powered PDF Parsing** - Upload your resume PDF, AI auto-fills the form (powered by OpenRouter free models)
- ✅ **Employer Dashboard** - Approve/reject requests, mint blockchain tokens
- 🔗 **Public Vouch Profile** - Share `/vouch/username` in job applications
- ⛓️ **Blockchain Verified** - All credentials stored on Solana
- 🚀 **No Wallet Extension** - Everything handled in-app

## 🎯 Use Case

> **Problem**: Resumes can be faked, verification is slow and expensive  
> **Solution**: Employers issue blockchain tokens to verify credentials  
> **Result**: Instant, trustworthy verification via shareable public links

**Example Flow:**
1. Otis worked at Meta 2022-2024
2. Otis requests verification through Vouch
3. Meta's HR approves → mints token to Otis's wallet
4. Otis applies to Google, shares `/vouch/otis`
5. Google recruiter sees blockchain-verified Meta credential instantly

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (takes ~2 minutes)
3. Go to **SQL Editor** and run these files **in order**:
   - First: `SQL_SCHEMA.sql` (creates tables)
   - Then: `SQL_UPDATE.sql` (adds auth fields)
4. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (click "Reveal")
5. Update `.env.local` with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Create Employer Accounts

For testing, you'll need to create employer accounts in Supabase Auth:

1. Go to **Supabase Dashboard → Authentication → Users**
2. Click "Add User" and create accounts for test employers:
   - Email: `hr@meta.com`, Password: (your choice)
   - Email: `hr@google.com`, Password: (your choice)
3. Copy the `auth_id` for each user
4. Go to **SQL Editor** and link them to employers:

```sql
UPDATE employers 
SET auth_id = 'paste-auth-id-here' 
WHERE email = 'hr@meta.com';
```

### 4. OpenRouter Setup (For PDF Resume Parsing)

1. Go to [openrouter.ai](https://openrouter.ai) and create an account
2. Navigate to **Keys** section: https://openrouter.ai/keys
3. Create a new API key
4. Add the key to your `.env.local`:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

**Note:** 
- PDF parsing uses OpenRouter's free model: `moonshotai/kimi-k2:free`
- Free models may require an account with credits (check OpenRouter docs)
- You can override the model with `OPENROUTER_MODEL` env variable

### 5. Run the App

```bash
npm run dev
```

Visit `http://localhost:3000`

## 📖 How to Use

### As a User:

1. Click "Get Started" on homepage
2. Sign up with email, password, and choose a username
3. Solana wallet is automatically generated for you
4. **Upload your resume PDF** - AI will extract work experience automatically, or enter manually
5. Review and edit extracted data, then submit verification requests
6. Copy your public vouch link: `/vouch/your-username`
7. Share this link in job applications!

### As an Employer:

1. Log in with employer email (e.g., `hr@meta.com`)
2. See pending verification requests for your company
3. Review proof links (LinkedIn, etc.)
4. Approve → Blockchain token minted to user's wallet
5. User's credential now appears on their public profile

### As a Recruiter:

1. Receive vouch link from job applicant
2. Visit `/vouch/[username]` (no login needed)
3. See all blockchain-verified credentials
4. Make informed hiring decisions

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── signup/page.tsx             # User registration
│   ├── login/page.tsx              # Login (role-based routing)
│   ├── dashboard/page.tsx          # User dashboard
│   ├── employer/page.tsx           # Employer dashboard
│   ├── vouch/[username]/page.tsx   # Public profile (shareable)
│   └── api/
│       ├── auth/signup/route.ts    # Signup API
│       └── credentials/mint/route.ts # Mint tokens API
├── lib/
│   ├── solana.ts                   # Blockchain utilities
│   └── supabase.ts                 # Database client
├── middleware.ts                   # Route protection
├── SQL_SCHEMA.sql                  # Initial database schema
├── SQL_UPDATE.sql                  # Auth & username updates
└── FEATURES_AND_API.md             # Complete API docs
```

## 🔌 API Endpoints

### POST `/api/auth/signup`
Create new user account with auto wallet generation.

**Request:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

### POST `/api/credentials/mint`
Mint blockchain token when employer approves credential.

**Request:**
```json
{
  "requestId": "uuid",
  "userWalletAddress": "D44j1...",
  "metadata": {
    "company": "Meta",
    "role": "Software Engineer",
    "start_date": "2022-01-15",
    "end_date": "2024-03-20",
    "verified_by": "Meta"
  }
}
```

📚 **Full API documentation**: See `FEATURES_AND_API.md`

## 🗄️ Database Schema

### Main Tables:

- **users** - User accounts with wallet addresses and usernames
- **employers** - Hard-coded employer/institution accounts
- **credential_requests** - Verification requests (pending/approved/rejected)
- **job_postings** - (Future) Job board with credential requirements

All tables include `auth_id` linking to Supabase Auth for authentication.

## 🔐 Security Features

- ✅ Password authentication via Supabase Auth
- ✅ Protected routes with middleware
- ✅ Role-based access control (user vs employer)
- ✅ Session management with auto-refresh
- ✅ Public profiles only show approved credentials
- ✅ Blockchain-backed credential verification

## 🛠️ Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Generate a new Solana wallet
node scripts/generate-wallet.js

# Airdrop devnet SOL to wallet
node scripts/airdrop-sol.js
```

## 🧪 Testing the System

### Test as User:
1. Sign up at `/signup`
2. Submit a verification request for "Meta" or "Google"
3. Note your username

### Test as Employer:
1. Log in with employer email (e.g., `hr@meta.com`)
2. Approve the pending request
3. Token minted to user's wallet

### Test as Recruiter:
1. Visit `/vouch/[username]` (public, no login)
2. See the approved, blockchain-verified credential

## 📝 Environment Variables

Your `.env.local` should contain:

```bash
# Supabase (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Solana (REQUIRED for minting tokens)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
# Get this from your team lead - required for minting tokens!
ISSUER_PRIVATE_KEY=UZCwNMAViGRdpC/qDSPgKdevKgUBuUs7pc7oCEdp22mzFTJeq3/fh4vEeXaH/cdsF1URZOat3n8sHE1BefOdbQ==

# OpenRouter (REQUIRED for PDF parsing)
# Free model: moonshotai/kimi-k2:free
OPENROUTER_API_KEY=
```

**Important for Team Members:**
- The `ISSUER_PRIVATE_KEY` is required to mint tokens. Without it, minting will fail.
- The issuer wallet address is: `D44j1wmmiDyJw9Vs8nWQTqwFTRWuY4wjEwHTj3ZoQHPz`
- If the issuer wallet runs out of SOL, request an airdrop: `node scripts/airdrop-sol.js`

See `ENV_TEMPLATE.txt` for complete template.

## 🎨 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Blockchain**: Solana (Devnet → ready for Mainnet)
- **Wallet**: Auto-generated, no browser extension needed

## 🚧 Future Enhancements

See `FEATURES_AND_API.md` for complete roadmap.

**High Priority:**
- Email verification for signups
- Password reset flow
- Real SPL token minting with Metaplex
- Profile search functionality
- PDF export of credentials

**Medium Priority:**
- Profile pictures
- Notification system
- Employer analytics dashboard
- Bulk approval for employers

## 📚 Resources

- [Solana Documentation](https://docs.solana.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Devnet Faucet](https://faucet.solana.com/)

## 🔒 Security Notes

- `issuer-keypair.json` contains private key - **NEVER commit!** (already in `.gitignore`)
- This is a DEVNET project - requires additional security for production
- Employer accounts are manually verified for security
- All credentials are immutable once minted

## 🎯 Pages & Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/signup` | Public | User registration |
| `/login` | Public | Login with role detection |
| `/dashboard` | Protected (User) | User dashboard |
| `/employer` | Protected (Employer) | Employer dashboard |
| `/vouch/[username]` | Public | Shareable credential profile |

## 💡 Why Vouch?

Traditional resume verification:
- ❌ Slow (weeks for background checks)
- ❌ Expensive ($50-200 per check)
- ❌ Trust-based (can be faked)
- ❌ Centralized (data silos)

Vouch verification:
- ✅ Instant (view public profile)
- ✅ Free (blockchain storage)
- ✅ Cryptographically verified
- ✅ Decentralized (user owns credentials)

## 🤝 Contributing

This is a hackathon project. Feel free to fork and extend!

## 📄 License

MIT

---

**Built with ❤️ in 24 hours** | Powered by Solana & Supabase 🚀
