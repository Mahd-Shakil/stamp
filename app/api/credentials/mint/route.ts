import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mintCredentialSimplified } from '@/lib/solana';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, userWalletAddress, metadata } = body;

    console.log('[MINT API] Starting credential minting process...');
    console.log('[MINT API] Request ID:', requestId);
    console.log('[MINT API] User Wallet:', userWalletAddress);
    console.log('[MINT API] Metadata:', JSON.stringify(metadata, null, 2));

    // Validate input
    if (!requestId || !userWalletAddress || !metadata) {
      console.error('[MINT API] Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the request exists and is pending
    console.log('[MINT API] Fetching credential request from database...');
    const { data: requestData, error: requestError } = await supabase
      .from('credential_requests')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (requestError || !requestData) {
      console.error('[MINT API] Credential request not found:', requestError);
      return NextResponse.json(
        { error: 'Credential request not found' },
        { status: 404 }
      );
    }

    console.log('[MINT API] Found credential request:', requestData);

    if (requestData.status !== 'pending') {
      console.error('[MINT API] Credential request is not pending, current status:', requestData.status);
      return NextResponse.json(
        { error: 'Credential request is not pending' },
        { status: 400 }
      );
    }

    // Mint the credential token (simplified for MVP)
    console.log('[MINT API] Starting NFT minting on Solana blockchain...');
    const credential = await mintCredentialSimplified(userWalletAddress, metadata);
    console.log('[MINT API] NFT minted successfully!');
    console.log('[MINT API] Token Address:', credential.tokenAddress);

    // Update the credential request with token address and approved status
    console.log('[MINT API] Updating credential request in database...');
    const { error: updateError } = await supabase
      .from('credential_requests')
      .update({
        status: 'approved',
        token_address: credential.tokenAddress,
        updated_at: new Date().toISOString(),
      })
      .eq('request_id', requestId);

    if (updateError) {
      console.error('[MINT API] Failed to update database:', updateError);
      throw updateError;
    }

    console.log('[MINT API] Database updated successfully');
    console.log('[MINT API] Complete! Credential approved and minted');

    return NextResponse.json({
      success: true,
      tokenAddress: credential.tokenAddress,
      message: 'Credential minted and approved successfully',
    });
  } catch (error: any) {
    console.error('[MINT API] Error in minting process:', error);
    console.error('[MINT API] Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to mint credential' },
      { status: 500 }
    );
  }
}

