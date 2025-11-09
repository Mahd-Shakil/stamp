import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    username: string;
  };
}

export default async function PublicVouchProfile({ params }: PageProps) {
  const { username } = params;

  // Fetch user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (userError || !user) {
    notFound();
  }

  // Fetch approved credentials for this user
  const { data: credentials, error: credError } = await supabase
    .from('credential_requests')
    .select('*')
    .eq('user_id', user.user_id)
    .eq('status', 'approved')
    .order('start_date', { ascending: false });

  const approvedCredentials = credentials || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Vouch</h1>
          </div>
          <a 
            href="/" 
            className="text-blue-600 hover:underline text-sm font-medium"
          >
            Create Your Profile →
          </a>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-gray-500">@{user.username}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Blockchain Verified
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-500 mb-1">Solana Wallet Address</p>
            <p className="font-mono text-sm bg-gray-50 px-3 py-2 rounded border">
              {user.wallet_address}
            </p>
          </div>
        </div>

        {/* Verified Credentials */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Verified Experience
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {approvedCredentials.length} {approvedCredentials.length === 1 ? 'Credential' : 'Credentials'}
            </span>
          </div>

          {approvedCredentials.length > 0 ? (
            <div className="space-y-6">
              {approvedCredentials.map((cred: any) => (
                <div
                  key={cred.request_id}
                  className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-white rounded-r-lg p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {cred.role_title}
                        </h3>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                          Verified
                        </span>
                      </div>
                      <p className="text-lg text-gray-700 font-medium mb-2">
                        {cred.company_name}
                      </p>
                      <p className="text-sm text-gray-600 mb-3">
                        {new Date(cred.start_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })} - {cred.end_date 
                          ? new Date(cred.end_date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              year: 'numeric' 
                            })
                          : 'Present'}
                      </p>
                      {cred.token_address && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">On-Chain Token:</p>
                          <p className="font-mono text-xs bg-gray-50 px-2 py-1 rounded border inline-block">
                            {cred.token_address}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-5xl ml-4">
                      
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4"></div>
              <p className="text-gray-500 text-lg">
                No verified credentials yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                This user hasn't received any verified credentials
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-3">
              All credentials on this profile are verified on the Solana blockchain
            </p>
            <a 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Create Your Own Vouch Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for better performance (optional)
export async function generateStaticParams() {
  // This can be left empty or fetch popular usernames
  return [];
}

