import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { StampCard } from '@/components/stamp-card';

interface PageProps {
  params: {
    username: string;
  };
}

export default async function PublicStampProfile({ params }: PageProps) {
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

  // Convert credentials to stamp format
  const stamps = approvedCredentials.map((cred: any, index: number) => ({
    id: cred.request_id,
    company: cred.company_name,
    role: cred.role_title,
    period: `${new Date(cred.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${cred.end_date ? new Date(cred.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}`,
    status: 'verified' as const,
    color: ['from-yellow-400 to-amber-500', 'from-sky-300 to-blue-400', 'from-emerald-400 to-green-500'][index % 3],
    tokenAddress: cred.token_address,
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow-sm border-b-2 border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground font-mono">Stamp</h1>
          </div>
          <a 
            href="/" 
            className="text-foreground hover:underline text-sm font-medium font-mono transition-colors"
          >
            Create Your Profile →
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Profile Header */}
        <div className="bg-card rounded-lg border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground font-mono">{user.name}</h1>
                  <p className="text-muted-foreground font-mono">@{user.username}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded border-2 border-border text-sm font-medium font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                Blockchain Verified
              </div>
            </div>
          </div>

          <div className="border-t-2 border-border pt-4">
            <p className="text-sm text-muted-foreground mb-2 font-mono font-semibold">Solana Wallet Address</p>
            <p className="font-mono text-sm bg-muted px-3 py-2 rounded border-2 border-border">
              {user.wallet_address}
            </p>
          </div>
        </div>

        {/* Verified Credentials */}
        <div className="bg-card rounded-lg border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground font-mono">
              Verified Experience
            </h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded border-2 border-border text-sm font-medium font-mono shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {stamps.length} {stamps.length === 1 ? 'Stamp' : 'Stamps'}
            </span>
          </div>

          {stamps.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stamps.map((stamp) => (
                <StampCard key={stamp.id} {...stamp} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <p className="text-muted-foreground text-lg font-mono">
                No verified stamps yet
              </p>
              <p className="text-muted-foreground text-sm mt-2 font-mono">
                This user hasn't received any verified stamps
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="bg-card rounded-lg border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
            <p className="text-muted-foreground mb-4 font-mono">
              All stamps on this profile are verified on the Solana blockchain
            </p>
            <a 
              href="/" 
              className="inline-block bg-foreground text-background px-6 py-3 rounded-lg font-semibold font-mono border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
            >
              Create Your Own Stamp Profile
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

