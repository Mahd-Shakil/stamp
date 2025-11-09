'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function EmployerDashboard() {
  const router = useRouter();
  const [employer, setEmployer] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployerData();
  }, []);

  async function fetchEmployerData() {
    try {
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch employer data from database
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (employerError || !employerData) {
        // Not an employer, redirect to user dashboard
        router.push('/dashboard');
        return;
      }

      setEmployer(employerData);

      // Fetch pending requests for this employer's company
      const { data: requestData, error: requestError } = await supabase
        .from('credential_requests')
        .select('*, users(*)')
        .eq('company_name', employerData.organization_name)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (!requestError && requestData) {
        setRequests(requestData);
      }
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string, userWalletAddress: string, metadata: any) {
    setProcessing(requestId);
    try {
      // Call API to mint token and update status
      const response = await fetch('/api/credentials/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          userWalletAddress,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve credential');
      }

      alert('✅ Credential approved and minted to blockchain!');
      fetchEmployerData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(requestId: string) {
    setProcessing(requestId);
    try {
      const { error } = await supabase
        .from('credential_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId);

      if (error) {
        throw error;
      }

      alert('❌ Request rejected');
      fetchEmployerData();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl mb-2">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!employer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with logout */}
        <div className="mb-8 flex justify-between items-center">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
          <button
            onClick={handleLogout}
            className="text-red-600 hover:underline font-medium"
          >
            Log Out
          </button>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {employer.organization_name} Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Employer Portal - Review and approve verification requests
        </p>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Pending Verification Requests
          </h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <p>Loading requests...</p>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request: any) => (
                <div
                  key={request.request_id}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {request.role_title}
                      </h3>
                      <p className="text-gray-600">{request.company_name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Requested by: <span className="font-medium">{request.users?.name || 'Unknown'}</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Email: {request.users?.email || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400">
                        Wallet: {request.users?.wallet_address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {request.start_date} - {request.end_date || 'Present'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {request.proof_link && (
                    <div className="mb-4">
                      <a
                        href={request.proof_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        🔗 View Proof →
                      </a>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(
                        request.request_id,
                        request.users?.wallet_address,
                        {
                          company: request.company_name,
                          role: request.role_title,
                          start_date: request.start_date,
                          end_date: request.end_date || 'Present',
                          verified_by: employer.organization_name,
                        }
                      )}
                      disabled={processing === request.request_id}
                      className="flex-1 bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {processing === request.request_id ? '⏳ Processing...' : '✅ Approve & Mint Token'}
                    </button>
                    <button
                      onClick={() => handleReject(request.request_id)}
                      disabled={processing === request.request_id}
                      className="flex-1 bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No pending requests for {employer.organization_name}</p>
              <p className="text-sm mt-2">When users submit verification requests for your company, they'll appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
