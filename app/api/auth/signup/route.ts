import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWallet } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth_id, name, username, email } = body;

    // Validate input
    if (!auth_id || !name || !username || !email) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Generate Solana wallet for the user
    const wallet = generateWallet();

    // Create user record in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        auth_id,
        email,
        name,
        username,
        wallet_address: wallet.publicKey,
      })
      .select()
      .single();

    if (userError) {
      throw userError;
    }

    return NextResponse.json({
      success: true,
      user: userData,
      walletAddress: wallet.publicKey,
      message: 'User profile created successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create user profile' },
      { status: 500 }
    );
  }
}

