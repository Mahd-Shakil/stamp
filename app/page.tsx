export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">
          🎓 Vouch
        </h1>
        <p className="text-2xl text-gray-700 mb-8">
          Blockchain-Based Resume Verification
        </p>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Employers issue verifiable credential tokens to your Solana wallet.
          Recruiters verify your experience instantly. No lies, no delays.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">👤</div>
            <h3 className="font-semibold text-lg mb-2">For Employees</h3>
            <p className="text-gray-600 text-sm">Request verification and share your verified experience</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="font-semibold text-lg mb-2">For Employers</h3>
            <p className="text-gray-600 text-sm">Approve requests and issue credential tokens</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-semibold text-lg mb-2">For Recruiters</h3>
            <p className="text-gray-600 text-sm">Instantly verify candidate experience on-chain</p>
          </div>
        </div>

        <div className="space-x-4">
          <a 
            href="/dashboard" 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            User Dashboard
          </a>
          <a 
            href="/employer" 
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Employer Portal
          </a>
        </div>
      </div>
    </div>
  );
}

