
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWallet } from '@/lib/solana';

export async function POST(req: NextRequest) {
  try {
    const { fullName, username, email, password } = await req.json();

    if (!fullName || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 1. Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username,
        },
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
        return NextResponse.json({ error: "User not created" }, { status: 500 });
    }

    // 2. Generate a new Solana wallet
    const { publicKey, privateKey } = generateWallet();

    // 3. Create a new user in the `users` table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        user_id: authData.user.id,
        name: fullName,
        email: email,
        wallet_address: publicKey,
      })
      .select();

    if (userError) {
      // If user creation fails, we should probably delete the auth user as well
      // to avoid orphaned auth users.
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json({ user: authData.user, userData });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
