import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Award, Search, CheckCircle, User, Calendar, FileText, ExternalLink, ArrowRight, Sparkles, Users, BookOpen } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';

const PublicIndex: React.FC = () => {
  const { certificates, recipients, templates } = useCertificateStore();
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [email, setEmail] = useState('');
  const [studentCertificates, setStudentCertificates] = useState<any[]>([]);
  const [isLoadingStudentCerts, setIsLoadingStudentCerts] = useState(false);

  const handleCertificateSearch = async (e: React.FormEvent) => {
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
    }, 1500);
  };

  const handleStudentCertificateSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoadingStudentCerts(true);
    setStudentCertificates([]);

    // Simulate search delay
    setTimeout(() => {
      const foundCertificates = certificates.filter(cert => {
        const recipient = recipients.find(r => r.id === cert.recipientId);
        return recipient?.email?.toLowerCase() === email.toLowerCase();
      }).map(cert => {
        const recipient = recipients.find(r => r.id === cert.recipientId);
        const template = templates.find(t => t.id === cert.templateId);
        return { certificate: cert, recipient, template };
      });
      
      setStudentCertificates(foundCertificates);
      setIsLoadingStudentCerts(false);
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
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                <Award className="h-7 w-7 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">CertifyPro</h1>
                <p className="text-sm text-gray-400">Sistema de Certificados - Red Ciudadana</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-black bg-white border border-gray-600 rounded-xl hover:bg-gray-200 transition-colors duration-200"
              >
                <User className="mr-2 h-4 w-4" />
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Verifica tu Certificado Digital
              <span className="inline-block ml-2 animate-bounce">🎓</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Sistema oficial de verificación de certificados de Red Ciudadana. 
              Valida la autenticidad de cualquier certificado o consulta tus certificaciones aprobadas.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <div className="bg-gray-800 rounded-xl px-6 py-4 text-white border border-gray-700">
                <div className="text-2xl font-bold">{certificates.length}</div>
                <div className="text-sm">Certificados Emitidos</div>
              </div>
              <div className="bg-gray-800 rounded-xl px-6 py-4 text-white border border-gray-700">
                <div className="text-2xl font-bold">{recipients.length}</div>
                <div className="text-sm">Estudiantes Certificados</div>
              </div>
              <div className="bg-gray-800 rounded-xl px-6 py-4 text-white border border-gray-700">
                <div className="text-2xl font-bold">{templates.length}</div>
                <div className="text-sm">Programas Disponibles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Certificate Verification */}
          <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800">
            <div className="px-6 py-6 bg-gray-800 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Shield className="mr-3 h-7 w-7 text-white" />
                Verificar Certificado
              </h3>
              <p className="text-gray-400 mt-2">Ingresa el ID de cualquier certificado para verificar su autenticidad</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCertificateSearch} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Ingresa el ID del certificado (4 dígitos o completo)..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-white focus:border-white text-lg placeholder-gray-500"
                    disabled={isSearching}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchId.trim()}
                  className="w-full bg-white text-black py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg"
                >
                  {isSearching ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
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
                    <div className="bg-red-900 border border-red-700 rounded-xl p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-300">{searchResult.error}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-900 border border-green-700 rounded-xl p-4">
                      <div className="flex items-start">
                        <CheckCircle className="h-6 w-6 text-green-300 mt-0.5" />
                        <div className="ml-3 flex-1">
                          <h4 className="text-lg font-semibold text-green-300">Certificado Válido ✓</h4>
                          <div className="mt-2 space-y-1 text-sm text-green-200">
                            <p><strong>Nombre:</strong> {searchResult.recipient?.name}</p>
                            <p><strong>Curso:</strong> {searchResult.recipient?.course}</p>
                            <p><strong>Fecha:</strong> {new Date(searchResult.recipient?.issueDate).toLocaleDateString('es-ES')}</p>
                            <p><strong>ID:</strong> {searchResult.certificate?.id}</p>
                          </div>
                          <Link
                            to={`/verify/${searchResult.certificate?.id}`}
                            className="inline-flex items-center mt-3 text-green-300 hover:text-green-200 text-sm font-medium"
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

          {/* Student Certificates */}
          <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800">
            <div className="px-6 py-6 bg-gray-800 border-b border-gray-700">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Users className="mr-3 h-7 w-7 text-white" />
                Mis Certificados
              </h3>
              <p className="text-gray-400 mt-2">Consulta tus certificados aprobados ingresando tu correo electrónico</p>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleStudentCertificateSearch} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ingresa tu correo electrónico..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-white focus:border-white text-lg placeholder-gray-500"
                    disabled={isLoadingStudentCerts}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoadingStudentCerts || !email.trim()}
                  className="w-full bg-white text-black py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg text-lg"
                >
                  {isLoadingStudentCerts ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent mr-2"></div>
                      Buscando...
                    </div>
                  ) : (
                    <>
                      <Award className="inline-block mr-2 h-5 w-5" />
                      Buscar Mis Certificados
                    </>
                  )}
                </button>
              </form>

              {/* Student Certificates Results */}
              {studentCertificates.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h4 className="text-lg font-semibold text-white">
                    Certificados Encontrados ({studentCertificates.length})
                  </h4>
                  {studentCertificates.map(({ certificate, recipient }) => (
                    <div key={certificate.id} className="border border-gray-700 bg-gray-800 rounded-xl p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-semibold text-white">{recipient?.course || 'Certificación'}</h5>
                          <div className="mt-2 space-y-1 text-sm text-gray-400">
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
                              className="inline-flex items-center px-3 py-1 bg-gray-700 text-white text-xs font-medium rounded-full hover:bg-gray-600 transition-colors duration-200"
                            >
                              <Shield className="mr-1 h-3 w-3" />
                              Ver Certificado
                            </Link>
                            <button
                              onClick={() => handleShareToLinkedIn(certificate.id)}
                              className="inline-flex items-center px-3 py-1 bg-white text-black text-xs font-medium rounded-full hover:bg-gray-200 transition-colors duration-200"
                            >
                              <ExternalLink className="mr-1 h-3 w-3" />
                              LinkedIn
                            </button>
                          </div>
                        </div>
                        <div className="ml-4">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Aprobado
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {email && studentCertificates.length === 0 && !isLoadingStudentCerts && (
                <div className="mt-6 text-center py-8">
                  <Award className="mx-auto h-12 w-12 text-gray-600" />
                  <h4 className="mt-2 text-lg font-medium text-white">No se encontraron certificados</h4>
                  <p className="mt-1 text-sm text-gray-400">
                    No hay certificados asociados a este correo electrónico.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-800">
          <div className="px-6 py-6 bg-gray-800 border-b border-gray-700">
            <h3 className="text-2xl font-bold text-white flex items-center">
              <BookOpen className="mr-3 h-7 w-7 text-white" />
              Pasos para la Verificación de Certificados
            </h3>
            <p className="text-gray-400 mt-2">Sigue estos sencillos pasos para verificar cualquier certificado</p>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-black">1</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Busca el Código</h4>
                <p className="text-gray-400">
                  Busca el número de 4 dígitos en tu certificado. También puedes usar el código completo si lo tienes.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-black">2</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Ingresa el Código</h4>
                <p className="text-gray-400">
                  Ingresa el código en el buscador de arriba y presiona el botón "Verificar Certificado".
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-6">
                  <span className="text-3xl font-bold text-black">3</span>
                </div>
                <h4 className="text-xl font-bold text-white mb-4">Ver Detalles</h4>
                <p className="text-gray-400">
                  La página te mostrará los detalles del certificado de confirmación y su autenticidad.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-gray-800">
          <h3 className="text-2xl font-bold text-white mb-4">
            ¿Eres administrador o necesitas crear certificados?
          </h3>
          <p className="text-gray-400 mb-6">
            Accede al panel administrativo para gestionar certificados, plantillas y destinatarios.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200 shadow-lg"
          >
            <User className="mr-2 h-5 w-5" />
            Iniciar Sesión como Administrador
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">CertifyPro</h3>
                  <p className="text-gray-500 text-sm">Red Ciudadana</p>
                </div>
              </div>
              <p className="text-gray-500">
                Sistema oficial de certificados digitales de Red Ciudadana. 
                Verificación segura y confiable de certificaciones.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Enlaces Útiles</h4>
              <ul className="space-y-2 text-gray-500">
                <li><Link to="/verify" className="hover:text-white transition-colors">Verificar Certificado</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Iniciar Sesión</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contacto</h4>
              <div className="space-y-2 text-gray-500">
                <p>Red Ciudadana</p>
                <p>info@redciudadana.org.gt</p>
                <p>Guatemala, Guatemala</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2025 Red Ciudadana. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicIndex;