import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useCertificateStore } from '../store/certificateStore';
import { Award, Search, CheckCircle, Calendar, User, FileText, Shield, Download, Share2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { certificates, recipients, templates } = useCertificateStore();
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Get certificates for the current student (by email match)
  const studentCertificates = certificates.filter(cert => {
    const recipient = recipients.find(r => r.id === cert.recipientId);
    return recipient?.email === user?.email;
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    // Simulate search delay
    setTimeout(() => {
      const foundCertificate = certificates.find(c => 
        c.id === searchId || c.id.slice(-4) === searchId || c.id.includes(searchId)
      );
      
      if (foundCertificate) {
        const recipient = recipients.find(r => r.id === foundCertificate.recipientId);
        const template = templates.find(t => t.id === foundCertificate.templateId);
        setSearchResult({ certificate: foundCertificate, recipient, template });
      } else {
        setSearchResult({ error: 'Certificado no encontrado' });
      }
      
      setIsSearching(false);
    }, 1000);
  };

  const handleShareToLinkedIn = (certificateId: string) => {
    const certificate = certificates.find(c => c.id === certificateId);
    const recipient = recipients.find(r => r.id === certificate?.recipientId);
    
    if (!certificate || !recipient) return;
    
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(recipient.course || 'Certificación Profesional')}&organizationName=${encodeURIComponent('Red Ciudadana')}&issueYear=${new Date(recipient.issueDate).getFullYear()}&issueMonth=${new Date(recipient.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.origin + '/verify/' + certificate.id)}&certId=${encodeURIComponent(certificate.id)}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-600 rounded-xl flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Estudiante</h1>
                <p className="text-sm text-gray-600">Bienvenido, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-r from-gray-500 to-gray-500 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-gray-600 via-gray-600 to-gray-800 rounded-2xl shadow-xl mb-8">
          <div className="px-8 py-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¡Bienvenido a tu Panel de Certificados! 🎓
            </h2>
            <p className="text-xl text-gray-100 mb-6">
              Aquí puedes ver tus certificados aprobados y verificar cualquier certificado por su ID
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-xl px-6 py-3 text-white">
                <div className="text-2xl font-bold">{studentCertificates.length}</div>
                <div className="text-sm">Certificados Obtenidos</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Certificate Verification */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Shield className="mr-3 h-6 w-6 text-gray-600" />
                Verificar Certificado
              </h3>
              <p className="text-gray-600 mt-1">Ingresa el ID de cualquier certificado para verificar su autenticidad</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Ingresa el ID del certificado (4 dígitos o completo)..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchId.trim()}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Verificando...
                    </div>
                  ) : (
                    <>
                      <Shield className="inline-block mr-2 h-5 w-5" />
                      Verificar Certificado
                    </>
                  )}
                </button>
              </form>

              {/* Search Results */}
              {searchResult && (
                <div className="mt-6">
                  {searchResult.error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-600">{searchResult.error}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-gray-500 mt-0.5" />
                        <div className="ml-3 flex-1">
                          <h4 className="text-lg font-semibold text-gray-800">Certificado Válido</h4>
                          <div className="mt-2 space-y-1 text-sm text-gray-700">
                            <p><strong>Nombre:</strong> {searchResult.recipient?.name}</p>
                            <p><strong>Curso:</strong> {searchResult.recipient?.course}</p>
                            <p><strong>Fecha:</strong> {new Date(searchResult.recipient?.issueDate).toLocaleDateString('es-ES')}</p>
                            <p><strong>ID:</strong> {searchResult.certificate?.id}</p>
                          </div>
                          <Link
                            to={`/verify/${searchResult.certificate?.id}`}
                            className="inline-flex items-center mt-3 text-gray-600 hover:text-gray-500 text-sm font-medium"
                          >
                            Ver detalles completos
                            <ExternalLink className="ml-1 h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* My Certificates */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Award className="mr-3 h-6 w-6 text-gray-600" />
                Mis Certificados
              </h3>
              <p className="text-gray-600 mt-1">Certificados aprobados asociados a tu cuenta</p>
            </div>
            
            <div className="p-6">
              {studentCertificates.length > 0 ? (
                <div className="space-y-4">
                  {studentCertificates.map((certificate) => {
                    const recipient = recipients.find(r => r.id === certificate.recipientId);
                    return (
                      <div key={certificate.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{recipient?.course || 'Certificación'}</h4>
                            <div className="mt-2 space-y-1 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(recipient?.issueDate || certificate.issueDate).toLocaleDateString('es-ES')}
                              </div>
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2" />
                                ID: {certificate.id.slice(-8)}...
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <Link
                                to={`/verify/${certificate.id}`}
                                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors duration-200"
                              >
                                <Shield className="mr-1 h-3 w-3" />
                                Ver Certificado
                              </Link>
                              <button
                                onClick={() => handleShareToLinkedIn(certificate.id)}
                                className="inline-flex items-center px-3 py-1 bg-[#0A66C2] text-white text-xs font-medium rounded-full hover:bg-[#004182] transition-colors duration-200"
                              >
                                <Share2 className="mr-1 h-3 w-3" />
                                LinkedIn
                              </button>
                            </div>
                          </div>
                          <div className="ml-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Aprobado
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-300" />
                  <h4 className="mt-2 text-lg font-medium text-gray-900">No tienes certificados aún</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Los certificados aprobados aparecerán aquí cuando estén disponibles.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">Cómo Verificar un Certificado</h3>
            <p className="text-gray-600 mt-1">Sigue estos pasos para verificar cualquier certificado</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Busca el Código</h4>
                <p className="text-gray-600 text-sm">
                  Localiza el número de 4 dígitos en tu certificado o usa el ID completo.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ingresa el Código</h4>
                <p className="text-gray-600 text-sm">
                  Escribe el código en el buscador de arriba y presiona "Verificar".
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Ver Detalles</h4>
                <p className="text-gray-600 text-sm">
                  La página te mostrará todos los detalles del certificado de confirmación.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;