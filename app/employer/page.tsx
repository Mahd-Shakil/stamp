'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function EmployerDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkConnection();
    fetchRequests();
  }, []);

  async function checkConnection() {
    try {
      const { data, error } = await supabase.from('employers').select('count').limit(1);
      setConnected(!error);
    } catch (e) {
      setConnected(false);
    }
  }

  async function fetchRequests() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('credential_requests')
        .select('*, users(*)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setRequests(data);
      }
    } catch (e) {
      console.error('Error fetching requests:', e);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(requestId: string) {
    try {
      const { error } = await supabase
        .from('credential_requests')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('✅ Credential approved and minted to blockchain!');
        fetchRequests();
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  async function handleReject(requestId: string) {
    try {
      const { error } = await supabase
        .from('credential_requests')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('request_id', requestId);

      if (error) {
        alert('Error: ' + error.message);
      } else {
        alert('❌ Request rejected');
        fetchRequests();
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Employer Dashboard
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">
            Pending Verification Requests
          </h2>

          {!connected && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                ⚠️ Supabase connection issue. Check your credentials in .env.local
              </p>
            </div>
          )}

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
                        Requested by: {request.users?.name || 'Unknown'} ({request.users?.email || 'N/A'})
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
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
                      onClick={() => handleApprove(request.request_id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
                    >
                      ✅ Approve & Mint Token
                    </button>
                    <button
                      onClick={() => handleReject(request.request_id)}
                      className="flex-1 bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700 transition"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">No pending requests</p>
              <p className="text-sm mt-2">When users submit verification requests, they'll appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
