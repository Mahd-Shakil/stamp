
import { NextRequest, NextResponse } from 'next/server';
import { supabase, getServiceSupabase } from '@/lib/supabase';
import { generateWallet } from '@/lib/solana';

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password } = await req.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, and underscores' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    // 1. Sign up the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
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
    const { publicKey } = generateWallet();

    // 3. Create a new user in the `users` table
    // Use service role client for admin operations
    const serviceSupabase = getServiceSupabase();
    const { data: userData, error: userError } = await serviceSupabase
      .from('users')
      .insert({
        auth_id: authData.user.id,
        user_id: authData.user.id,
        name: name,
        username: username,
        email: email,
        wallet_address: publicKey,
      })
      .select()
      .single();

    if (userError) {
      // If user creation fails, delete the auth user to avoid orphaned auth users
      try {
        await serviceSupabase.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error('Failed to delete auth user:', deleteError);
      }
      return NextResponse.json({ 
        error: userError.message || 'Failed to create user profile' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      user: authData.user, 
      userData 
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
