# 🎯 Setup Instructions for Vouch

## ✅ What's Already Done

I've set up everything for you! Here's what's ready:

1. ✅ Next.js project with TypeScript & Tailwind
2. ✅ Solana Web3.js installed
3. ✅ Wallet generated with 2 SOL on devnet
4. ✅ `.env.local` created with your wallet key
5. ✅ Project compiles successfully
6. ✅ Basic UI pages created

**Your Wallet:**
- Public Key: `D44j1wmmiDyJw9Vs8nWQTqwFTRWuY4wjEwHTj3ZoQHPz`
- Balance: 2 SOL (Devnet)
- Private Key: Already in `.env.local`

---

## 🚦 Next Steps (You Need to Do This)

### Step 1: Set Up Supabase (5 minutes)

1. **Go to [supabase.com](https://supabase.com)** and sign up

2. **Create a new project:**
   - Click "New Project"
   - Name: "Vouch"
   - Password: (choose any password)
   - Region: (choose closest to you)
   - Wait ~2 minutes for setup

3. **Run the SQL Schema:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy and paste the entire contents of `SQL_SCHEMA.sql`
   - Click "Run" (bottom right corner)
   - You should see: "Database schema created successfully!"

4. **Get your API keys:**
   - Click "Project Settings" (gear icon at bottom of sidebar)
   - Click "API" tab
   - Copy these three values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (long string starting with `eyJ`)
     - **service_role** key (click "Reveal" to see it)

5. **Add keys to .env.local:**
   - Open `.env.local` in your editor
   - Paste the three values:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

6. **Enable Email Auth:**
   - In Supabase, click "Authentication" in the left sidebar
   - Click "Providers"
   - Make sure "Email" is toggled ON

### Step 2: Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎨 Test the App

1. **Visit the home page** - Should see a nice landing page
2. **Go to /dashboard** - User dashboard (form disabled until Supabase is connected)
3. **Go to /employer** - Employer portal (shows setup instructions)

Once Supabase is connected, the forms will work!

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `SQL_SCHEMA.sql` | Database schema to run in Supabase |
| `.env.local` | Environment variables (add Supabase keys here) |
| `issuer-keypair.json` | Your wallet private key (NEVER commit!) |
| `README.md` | Full documentation |

---

## 🔧 Troubleshooting

**"Module not found" errors?**
```bash
npm install
```

**Need more devnet SOL?**
```bash
node scripts/airdrop-sol.js
```

**Lost your wallet keys?**
- Check `issuer-keypair.json` and `.env.local`

**App not connecting to Supabase?**
- Make sure you added all 3 keys to `.env.local`
- Restart the dev server: `npm run dev`

---

## 🚀 Ready to Build More?

The basic wiring is done. Now you can:

1. **Connect Supabase** (5 min)
2. **Build the full user dashboard** with form submission
3. **Build the employer approval flow**
4. **Add the public profile page**
5. **Create the job board**

All the core utilities are in `lib/solana.ts` - ready to use!

---

**Need help?** Check the README.md for more details.

