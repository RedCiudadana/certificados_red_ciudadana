import { useState } from 'react';
import { Search, Award, Download, Share2, CheckCircle, XCircle, Mail } from 'lucide-react';
import { supabase, DatabaseCertificate, DatabaseCertificateClaim } from '../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';

export default function StudentVerification() {
  const [searchType, setSearchType] = useState<'email' | 'code'>('email');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<DatabaseCertificate[]>([]);
  const [claims, setClaims] = useState<DatabaseCertificateClaim[]>([]);
  const [error, setError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError('Please enter a value to search');
      return;
    }

    setLoading(true);
    setError('');
    setCertificates([]);
    setClaims([]);
    setClaimSuccess(null);

    try {
      if (searchType === 'email') {
        const certs = await supabase.getCertificatesByEmail(searchValue);
        setCertificates(certs);
        if (certs.length === 0) {
          setError('No certificates found for this email address');
        } else {
          const claimsData = await supabase.getClaims(searchValue);
          setClaims(claimsData);
        }
      } else {
        const cert = await supabase.getCertificateByCode(searchValue);
        if (cert) {
          setCertificates([cert]);
        } else {
          setError('Certificate not found. Please check the code and try again.');
        }
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (certificate: DatabaseCertificate) => {
    if (!certificate.recipient_email) {
      setError('Cannot claim certificate without an email address');
      return;
    }

    const alreadyClaimed = claims.some(c => c.certificate_id === certificate.id);
    if (alreadyClaimed) {
      setError('You have already claimed this certificate');
      return;
    }

    try {
      await supabase.claimCertificate({
        certificate_id: certificate.id!,
        student_email: certificate.recipient_email,
      });

      const updatedClaims = await supabase.getClaims(certificate.recipient_email);
      setClaims(updatedClaims);
      setClaimSuccess(certificate.id!);
      setTimeout(() => setClaimSuccess(null), 3000);
    } catch (err) {
      setError('Failed to claim certificate. Please try again.');
      console.error(err);
    }
  };

  const handleLinkedInShare = async (certificate: DatabaseCertificate) => {
    if (!certificate.recipient_email) return;

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      certificate.course_name
    )}&organizationName=${encodeURIComponent(
      'Red Ciudadana'
    )}&issueYear=${new Date(certificate.issue_date).getFullYear()}&issueMonth=${
      new Date(certificate.issue_date).getMonth() + 1
    }&certUrl=${encodeURIComponent(certificate.qr_code_data || '')}&certId=${encodeURIComponent(
      certificate.certificate_code
    )}`;

    try {
      await supabase.updateClaimLinkedInStatus(certificate.id!, certificate.recipient_email);

      const updatedClaims = await supabase.getClaims(certificate.recipient_email);
      setClaims(updatedClaims);

      window.open(linkedInUrl, '_blank');
    } catch (err) {
      console.error('Failed to update LinkedIn status:', err);
      window.open(linkedInUrl, '_blank');
    }
  };

  const isClaimed = (certId: string) => {
    return claims.some(c => c.certificate_id === certId);
  };

  const isLinkedInShared = (certId: string) => {
    return claims.find(c => c.certificate_id === certId)?.linkedin_shared || false;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Verify Your Certificate
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enter your email address or certificate code to view and claim your certificates
        </p>
      </div>

      <div className="max-w-2xl mx-auto mb-12">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSearchType('email')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                searchType === 'email'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mail className="w-5 h-5 inline-block mr-2" />
              Search by Email
            </button>
            <button
              onClick={() => setSearchType('code')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                searchType === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-5 h-5 inline-block mr-2" />
              Search by Code
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type={searchType === 'email' ? 'email' : 'text'}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={
                searchType === 'email'
                  ? 'Enter your email address'
                  : 'Enter certificate code'
              }
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {certificates.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {searchType === 'email' ? 'Your Certificates' : 'Certificate Details'}
          </h2>

          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {cert.course_name}
                      </h3>
                      {isClaimed(cert.id!) && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Claimed
                        </span>
                      )}
                      {cert.status === 'revoked' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Revoked
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-gray-700 mb-4">
                      Issued to: <span className="font-semibold">{cert.recipient_name}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium text-gray-900">{cert.recipient_email}</p>
                      </div>
                      {cert.recipient_id && (
                        <div>
                          <span className="text-gray-600">ID:</span>
                          <p className="font-medium text-gray-900">{cert.recipient_id}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Issue Date:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(cert.issue_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Certificate Code:</span>
                        <p className="font-mono text-sm font-medium text-gray-900 break-all">
                          {cert.certificate_code}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex-shrink-0">
                    <QRCodeSVG value={cert.qr_code_data || ''} size={120} />
                    <p className="text-xs text-gray-500 text-center mt-2">Verification QR</p>
                  </div>
                </div>

                {claimSuccess === cert.id && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-green-700">Certificate claimed successfully!</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {!isClaimed(cert.id!) && cert.status === 'active' && (
                    <button
                      onClick={() => handleClaim(cert)}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Award className="w-5 h-5" />
                      Claim Certificate
                    </button>
                  )}

                  {isClaimed(cert.id!) && (
                    <>
                      <button
                        onClick={() => window.open(cert.qr_code_data || '', '_blank')}
                        className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </button>
                      <button
                        onClick={() => handleLinkedInShare(cert)}
                        className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${
                          isLinkedInShared(cert.id!)
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-700 text-white hover:bg-blue-800'
                        }`}
                      >
                        <Share2 className="w-5 h-5" />
                        {isLinkedInShared(cert.id!)
                          ? 'Shared on LinkedIn'
                          : 'Share on LinkedIn'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-16 bg-gray-50 rounded-lg p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">1. Search</h4>
            <p className="text-gray-600 text-sm">
              Enter your email or certificate code to find your certificates
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">2. Claim</h4>
            <p className="text-gray-600 text-sm">
              Validate your certificate ownership by claiming it
            </p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">3. Share</h4>
            <p className="text-gray-600 text-sm">
              Download your certificate and share it on LinkedIn
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
