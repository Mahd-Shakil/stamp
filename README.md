# Stamp

A blockchain-based resume verification platform that makes credential verification instant, free, and trustworthy. Share your verified work experience via a public link in job applications.

## Details

**What problem does this project solve?**

Traditional resume verification is slow, expensive, and prone to fraud. Background checks can take weeks and cost $50-200 per verification. Resumes can be easily faked, and verification relies on trust-based systems with centralized data silos.

Stamp solves this by providing instant verification through blockchain-backed credentials, eliminating costs through decentralized storage on Solana, and ensuring cryptographic verification that cannot be faked. Recruiters can instantly verify credentials without contacting previous employers.

**Example Flow:**
1. A user worked at Meta from 2022-2024
2. The user requests verification through Stamp
3. Meta's HR approves the request and mints a blockchain token to the user's wallet
4. The user applies to Google and shares their public Stamp profile link
5. Google's recruiter sees the blockchain-verified Meta credential instantly

**Libraries and services we used**

- Solana Blockchain - Using Solana's NFT standard via Metaplex to mint immutable credential tokens on-chain
- OpenRouter AI - Leveraging free AI models (moonshotai/kimi-k2:free) for intelligent PDF resume parsing that automatically extracts work experience
- Supabase - Integrated authentication and PostgreSQL database for user management and credential requests
- Next.js 14 App Router - Modern React framework with server-side rendering and API routes
- Metaplex SDK - Solana NFT creation and management for credential minting
- Auto-generated Wallets - Users don't need browser extensions; wallets are automatically generated and managed in-app

**Extension types we built**

This is a full-stack web application built as a Next.js application with public-facing landing pages, shareable credential profiles, user dashboard for requesting verifications, employer dashboard for approving/rejecting requests, RESTful API endpoints for authentication and blockchain operations, and middleware-based route protection with role-based access control.



## Set Up Instructions

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenRouter account (for PDF parsing)

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd Stamp
npm install
```

### Step 2: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project (takes approximately 2 minutes)
3. Navigate to **SQL Editor** in your Supabase dashboard
4. Run the database schema files in order:
   - First: Copy and paste the contents of `SQL_SCHEMA.sql` and execute
   - Then: Copy and paste the contents of `SQL_UPDATE.sql` and execute
5. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` key (click "Reveal" to see it)

### Step 3: Create Employer Accounts

For testing, create employer accounts:

1. Go to **Supabase Dashboard → Authentication → Users**
2. Click "Add User" and create accounts for test employers:
   - Email: `hr@meta.com`, Password: (choose a password)
   - Email: `hr@google.com`, Password: (choose a password)
3. Copy the `auth_id` (UUID) for each user
4. Go to **SQL Editor** and link them to employers:

```sql
UPDATE employers 
SET auth_id = 'paste-auth-id-here' 
WHERE email = 'hr@meta.com';
```

### Step 4: OpenRouter Setup

1. Go to [openrouter.ai](https://openrouter.ai) and create an account
2. Navigate to the **Keys** section: https://openrouter.ai/keys
3. Create a new API key
4. Note: PDF parsing uses OpenRouter's free model `moonshotai/kimi-k2:free` by default

### Step 5: Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Solana Configuration (REQUIRED for minting tokens)
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Issuer Wallet Private Key (REQUIRED for minting tokens)
ISSUER_PRIVATE_KEY=UZCwNMAViGRdpC/qDSPgKdevKgUBuUs7pc7oCEdp22mzFTJeq3/fh4vEeXaH/cdsF1URZOat3n8sHE1BefOdbQ==

# OpenRouter API (REQUIRED for PDF parsing)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

See `ENV_TEMPLATE.txt` for complete template.

### Step 6: Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Testing the System

**Test as a User:**
1. Navigate to `/signup` and create an account
2. Upload a resume PDF or manually enter work experience
3. Submit a verification request for "Meta" or "Google"
4. Note your username for the public profile

**Test as an Employer:**
1. Log in with an employer email (e.g., `hr@meta.com`)
2. View pending verification requests
3. Approve a request to mint a blockchain token

**Test as a Recruiter:**
1. Visit `/stamp/[username]` (public, no login required)
2. View the approved, blockchain-verified credentials

## Screenshots
<img width="1800" height="1169" alt="Screenshot 2025-11-09 at 11 26 08 AM" src="https://github.com/user-attachments/assets/3d4a564e-bad7-4693-9584-006a97564324" />
<img width="1800" height="1169" alt="Screenshot 2025-11-09 at 11 26 04 AM" src="https://github.com/user-attachments/assets/aa4439e1-1971-4df5-af7b-662cea724544" />
<img width="1800" height="1169" alt="Screenshot 2025-11-09 at 11 27 00 AM" src="https://github.com/user-attachments/assets/f8351a15-be29-42a3-8d42-9ddf8de0d2b7" />
<img width="1800" height="1169" alt="Screenshot 2025-11-09 at 11 33 18 AM" src="https://github.com/user-attachments/assets/8b55d7a2-5847-4449-aaa9-c0585977ba7d" />


## Collaborators

{ GitHub Username 1 }
{ Add more as appropriate }
