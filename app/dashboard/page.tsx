'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const [walletAddress] = useState('D44j1wmmiDyJw9Vs8nWQTqwFTRWuY4wjEwHTj3ZoQHPz');
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    start_date: '',
    end_date: '',
    proof_link: '',
  });

  useEffect(() => {
    checkConnection();
    fetchCredentials();
  }, []);

  async function checkConnection() {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      setConnected(!error);
    } catch (e) {
      setConnected(false);
    }
  }

  async function fetchCredentials() {
    try {
      // For demo, we'll just fetch all pending/approved requests
      // In production, you'd filter by user_id
      const { data, error } = await supabase
        .from('credential_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setCredentials(data);
      }
    } catch (e) {
      console.error('Error fetching credentials:', e);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // First, ensure we have a user in the database
      // For demo purposes, we'll use a dummy user_id
      // In production, you'd use actual auth
      
      const { data, error } = await supabase
        .from('credential_requests')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Demo user
          company_name: formData.company_name,
          role_title: formData.role_title,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          proof_link: formData.proof_link || null,
          status: 'pending',
        })
        .select();

      if (error) {
        console.error('Error submitting request:', error);
        alert('Error: ' + error.message);
      } else {
        alert('✅ Verification request submitted successfully!');
        setFormData({
          company_name: '',
          role_title: '',
          start_date: '',
          end_date: '',
          proof_link: '',
        });
        fetchCredentials();
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:underline">← Back to Home</a>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          My Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Your Wallet: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{walletAddress}</span>
        </p>

        {/* Request Verification Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Request Experience Verification
          </h2>
          
          {!connected && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800">
                ⚠️ Supabase connection issue. Check your credentials in .env.local
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company/Institution Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Meta, Google, University of Waterloo"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role/Degree Title
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Engineer, BSc Computer Science"
                value={formData.role_title}
                onChange={(e) => setFormData({ ...formData, role_title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proof Link (LinkedIn, screenshot, etc.)
              </label>
              <input
                type="url"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/..."
                value={formData.proof_link}
                onChange={(e) => setFormData({ ...formData, proof_link: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !connected}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Verification Request'}
            </button>
          </form>
        </div>

        {/* Credentials List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">My Credentials</h2>
          <div className="space-y-4">
            {credentials.length > 0 ? (
              credentials.map((cred: any) => (
                <div
                  key={cred.request_id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-semibold text-lg">{cred.role_title}</h3>
                    <p className="text-gray-600">{cred.company_name}</p>
                    <p className="text-sm text-gray-500">
                      {cred.start_date} - {cred.end_date || 'Present'}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cred.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : cred.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {cred.status === 'approved' && '✅'} {cred.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No credentials yet. Submit a verification request above!</p>
                <p className="text-sm mt-2">Once approved, your credentials will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
