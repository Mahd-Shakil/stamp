import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mintCredentialSimplified } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, userWalletAddress, metadata } = body;

    // Validate input
    if (!requestId || !userWalletAddress || !metadata) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the request exists and is pending
    const { data: requestData, error: requestError } = await supabase
      .from('credential_requests')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (requestError || !requestData) {
      return NextResponse.json(
        { error: 'Credential request not found' },
        { status: 404 }
      );
    }

    if (requestData.status !== 'pending') {
      return NextResponse.json(
        { error: 'Credential request is not pending' },
        { status: 400 }
      );
    }

    // Mint the credential token (simplified for MVP)
    const credential = await mintCredentialSimplified(userWalletAddress, metadata);

    // Update the credential request with token address and approved status
    const { error: updateError } = await supabase
      .from('credential_requests')
      .update({
        status: 'approved',
        token_address: credential.tokenAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('request_id', requestId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      tokenAddress: credential.tokenAddress,
      message: 'Credential minted and approved successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to mint credential' },
      { status: 500 }
    );
  }
}

