'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    role_title: '',
    start_date: '',
    end_date: '',
    proof_link: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [extractedExperiences, setExtractedExperiences] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showExtracted, setShowExtracted] = useState(false);
  const [lastUploadTime, setLastUploadTime] = useState<number>(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  async function fetchUserData() {
    try {
      // Get current authenticated user
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch user data from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', session.user.id)
        .single();

      if (userError || !userData) {
        router.push('/login');
        return;
      }

      setUser(userData);

      // Fetch user's credentials
      const { data: credData, error: credError } = await supabase
        .from('credential_requests')
        .select('*')
        .eq('user_id', userData.user_id)
        .order('created_at', { ascending: false });

      if (!credError && credData) {
        setCredentials(credData);
      }

      // Fetch list of verified employers/companies
      const { data: employerData, error: employerError } = await supabase
        .from('employers')
        .select('organization_name')
        .order('organization_name');

      if (!employerError && employerData) {
        setEmployers(employerData);
      }
    } catch (error) {
      // Silently handle errors
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('credential_requests')
        .insert({
          user_id: user.user_id,
          company_name: formData.company_name,
          role_title: formData.role_title,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          proof_link: formData.proof_link || null,
          status: 'pending',
        })
        .select();

      if (error) {
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
        fetchUserData();
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setParseError('Please upload a PDF file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setParseError('File size must be less than 10MB');
      return;
    }

    // Rate limiting: prevent rapid requests (5 second cooldown)
    const now = Date.now();
    const timeSinceLastUpload = now - lastUploadTime;
    if (timeSinceLastUpload < 5000) {
      const waitTime = Math.ceil((5000 - timeSinceLastUpload) / 1000);
      setParseError(`Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before trying again. Free models have rate limits.`);
      e.target.value = '';
      return;
    }

    setParsingPdf(true);
    setParseError(null);
    setExtractedExperiences([]);
    setShowExtracted(false);
    setLastUploadTime(now);

    // Retry logic with exponential backoff
    const maxRetries = 2;
    let retryCount = 0;

    const attemptParse = async (): Promise<void> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/resume/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for rate limiting errors
        const errorMsg = data.error || 'Failed to parse PDF';
        if (errorMsg.includes('rate limit') || errorMsg.includes('429') || errorMsg.includes('Provider returned error')) {
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s
            setParseError(`Rate limited. Retrying in ${delay / 1000} seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return attemptParse();
          } else {
            throw new Error('Rate limit exceeded. Please wait a minute and try again, or enter the information manually.');
          }
        }
        throw new Error(errorMsg);
      }

      if (data.work_experiences && data.work_experiences.length > 0) {
        setExtractedExperiences(data.work_experiences);
        setShowExtracted(true);
      } else {
        setParseError('No work experience found in the resume. Please enter manually.');
      }
    };

    try {
      await attemptParse();
    } catch (error: any) {
      setParseError(error.message || 'Failed to parse PDF. Please try again or enter manually.');
    } finally {
      setParsingPdf(false);
      // Reset file input
      e.target.value = '';
    }
  }

  function handleSelectExperience(experience: any) {
    // Try to match company name with existing employers (case-insensitive)
    let matchedCompany = experience.company_name || '';
    const employerNames = employers.map(e => e.organization_name);
    const matched = employerNames.find(
      name => name.toLowerCase() === matchedCompany.toLowerCase()
    );
    if (matched) {
      matchedCompany = matched;
    }

    // Auto-fill form with selected experience
    setFormData({
      company_name: matchedCompany,
      role_title: experience.role_title || '',
      start_date: experience.start_date || '',
      end_date: experience.end_date || '',
      proof_link: formData.proof_link, // Keep existing proof link
    });
    setShowExtracted(false);
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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
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
          Welcome, {user.name}!
        </h1>
        <p className="text-gray-600 mb-2">
          Your Username: <span className="font-semibold">@{user.username}</span>
        </p>
        <p className="text-gray-600 mb-8">
          Your Wallet: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{user.wallet_address}</span>
        </p>

        {/* Public Profile Link */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-sm font-medium text-blue-900 mb-2">🔗 Your Public Vouch Profile:</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}/vouch/${user.username}`}
              className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded text-sm"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/vouch/${user.username}`);
                alert('✅ Link copied to clipboard!');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
            >
              Copy Link
            </button>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            Share this link in your job applications!
          </p>
        </div>

        {/* Request Verification Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">
              Request Experience Verification
            </h2>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  disabled={parsingPdf}
                  className="hidden"
                  id="pdf-upload"
                />
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md font-medium hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">
                  {parsingPdf ? (
                    <>
                      <span className="animate-spin">⏳</span> Parsing...
                    </>
                  ) : (
                    <>
                      📄 Upload Resume PDF
                    </>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* PDF Parse Error */}
          {parseError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{parseError}</p>
            </div>
          )}

          {/* Extracted Experiences */}
          {showExtracted && extractedExperiences.length > 0 && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-3">
                ✨ Found {extractedExperiences.length} work experience{extractedExperiences.length > 1 ? 's' : ''} in your resume:
              </p>
              <div className="space-y-2">
                {extractedExperiences.map((exp, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white rounded border border-purple-200 hover:border-purple-400 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{exp.role_title}</p>
                        <p className="text-sm text-gray-600">{exp.company_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleSelectExperience(exp)}
                        className="ml-3 px-3 py-1 bg-purple-600 text-white rounded text-sm font-medium hover:bg-purple-700 transition"
                      >
                        Use This
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowExtracted(false)}
                className="mt-3 text-sm text-purple-600 hover:text-purple-800 underline"
              >
                Or enter manually
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company/Institution Name
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              >
                <option value="">Select a verified company...</option>
                {employers.map((employer) => (
                  <option key={employer.organization_name} value={employer.organization_name}>
                    {employer.organization_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                ✅ Only verified companies are listed
              </p>
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
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Verification Request'}
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
