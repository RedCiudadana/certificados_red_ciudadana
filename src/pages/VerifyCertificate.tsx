import React, { useEffect, useState, useCallback } from 'react';
import { Template } from '../types';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCertificateStore } from '../store/certificateStore';
import { CheckCircle, AlertTriangle, ArrowLeft, Share2, Download, Search, Award, Shield, Clock, User, Calendar, FileText, ExternalLink } from 'lucide-react';
import { generateCertificatePDF } from '../utils/certificateGenerator';
import { supabase } from '../lib/supabase';

interface SupabaseCertificate {
  id: string;
  certificate_code: string;
  recipient_name: string;
  recipient_email: string;
  course_name: string;
  template_id: string;
  issue_date: string;
  completion_date: string | null;
  instructor_name: string | null;
  duration_hours: number | null;
  certificate_pdf_url: string | null;
  qr_code_data: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
}

const VerifyCertificate: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { templates } = useCertificateStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [certificate, setCertificate] = useState<SupabaseCertificate | null>(null);
  const [searchId, setSearchId] = useState('');
  const [showVerificationSteps, setShowVerificationSteps] = useState(!certificateId);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerification = useCallback(async (code: string) => {
    if (!code || code.length < 4) {
      setErrorMessage('Por favor ingresa un código válido de al menos 4 caracteres');
      return;
    }

    setIsLoading(true);
    setIsValid(false);
    setCertificate(null);
    setErrorMessage('');

    try {
      // Query Supabase — exact code match only (no partial matching to prevent enumeration)
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_code', code)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        setErrorMessage('Error al verificar el certificado. Intenta de nuevo.');
        setIsLoading(false);
        setShowVerificationSteps(false);
        return;
      }

      if (data) {
        setCertificate(data as SupabaseCertificate);
        setIsValid(true);
        navigate(`/verify/${data.certificate_code}`, { replace: true });
      } else {
        setIsValid(false);
      }
    } catch {
      setErrorMessage('Error de conexión. Verifica tu conexión a internet.');
      setIsValid(false);
    }

    setIsLoading(false);
    setShowVerificationSteps(false);
  }, [navigate]);

  const handleShareToLinkedIn = () => {
    if (!certificate) return;

    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(certificate.course_name || 'Certificación Profesional')}&organizationName=${encodeURIComponent('Red Ciudadana')}&issueYear=${new Date(certificate.issue_date).getFullYear()}&issueMonth=${new Date(certificate.issue_date).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(certificate.certificate_code)}`;

    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleDownloadCertificate = async () => {
    if (!certificate) return;

    // If a PDF URL exists in storage, download it directly
    if (certificate.certificate_pdf_url) {
      window.open(certificate.certificate_pdf_url, '_blank');
      return;
    }

    // Fallback: generate PDF client-side from template
    const template = templates.find(t => t.id === certificate.template_id);
    if (!template) {
      alert('No se pudo encontrar la plantilla del certificado para generar el PDF.');
      return;
    }

    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1200px';
    container.style.height = '848px';
    document.body.appendChild(container);

    try {
      const certificateDiv = document.createElement('div');
      certificateDiv.className = 'certificate-preview';
      certificateDiv.style.width = '100%';
      certificateDiv.style.height = '100%';
      certificateDiv.style.position = 'relative';
      certificateDiv.style.backgroundColor = 'white';
      certificateDiv.style.overflow = 'hidden';

      const img = document.createElement('img');
      img.src = template.imageUrl;
      img.alt = 'Certificate template';
      img.style.position = 'absolute';
      img.style.top = '0';
      img.style.left = '0';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      certificateDiv.appendChild(img);

      await new Promise((resolve) => {
        if (img.complete) return resolve(void 0);
        img.onload = () => resolve(void 0);
        img.onerror = () => resolve(void 0);
        setTimeout(resolve, 10000);
      });

      template.fields.forEach((field: Template['fields'][0]) => {
        if (field.type === 'qrcode') return;

        const fieldDiv = document.createElement('div');
        fieldDiv.style.position = 'absolute';
        fieldDiv.style.left = `${field.x}%`;
        fieldDiv.style.top = `${field.y}%`;
        fieldDiv.style.transform = 'translate(-50%, -50%)';
        fieldDiv.style.textAlign = 'center';
        fieldDiv.style.width = '100%';
        fieldDiv.style.maxWidth = '80%';
        fieldDiv.style.fontFamily = field.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        fieldDiv.style.fontSize = `${field.fontSize || 16}px`;
        fieldDiv.style.color = field.color || '#000';
        fieldDiv.style.zIndex = '1';
        fieldDiv.style.fontWeight = 'bold';
        fieldDiv.style.textShadow = '1px 1px 2px rgba(255,255,255,0.8)';

        switch (field.type) {
          case 'text':
            if (field.name === 'recipient') {
              fieldDiv.textContent = certificate.recipient_name;
            } else if (field.name === 'course') {
              fieldDiv.textContent = certificate.course_name || field.defaultValue || '';
            } else {
              fieldDiv.textContent = field.defaultValue || '';
            }
            break;
          case 'date':
            fieldDiv.textContent = new Date(certificate.issue_date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            break;
        }

        certificateDiv.appendChild(fieldDiv);
      });

      container.appendChild(certificateDiv);

      const fileName = `${certificate.recipient_name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate`;
      await generateCertificatePDF(certificateDiv, fileName);

    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error al descargar el certificado. Por favor, inténtelo de nuevo.');
    } finally {
      document.body.removeChild(container);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      handleVerification(searchId.trim());
    }
  };

  useEffect(() => {
    if (certificateId && certificateId !== 'preview') {
      handleVerification(certificateId);
    }
  }, [certificateId, handleVerification]);

  // Verification Steps Component
  const VerificationSteps = () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Verificación de Certificados</h1>
                <p className="text-sm text-gray-600">Red Ciudadana - Sistema de Verificación</p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-500 to-gray-500 rounded-full flex items-center justify-center mb-6">
            <Award className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Verifica tu Certificado
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Ingresa el código ID de tu certificado y verifica su autenticidad de manera rápida y segura.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <form onSubmit={handleSearch} className="max-w-md mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Ingresa el código de tu certificado..."
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            {errorMessage && (
              <p className="mt-2 text-sm text-red-600 text-center">{errorMessage}</p>
            )}
            <button
              type="submit"
              disabled={isLoading || !searchId.trim()}
              className="w-full mt-4 bg-gradient-to-r from-gray-600 to-gray-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-gray-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
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
        </div>

        {/* Verification Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Busca el Código</h3>
            <p className="text-gray-600">
              Localiza el código de verificación en tu certificado. Es un código alfanumérico único.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ingresa el Código</h3>
            <p className="text-gray-600">
              Escribe el código en el buscador de arriba y presiona el botón "Verificar Certificado".
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ver Detalles</h3>
            <p className="text-gray-600">
              La página te mostrará todos los detalles del certificado y confirmará su autenticidad.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-50 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sistema de Verificación Seguro
              </h3>
              <p className="text-gray-700 mb-4">
                Nuestro sistema de verificación utiliza tecnología avanzada para garantizar la autenticidad
                de cada certificado emitido por Red Ciudadana. Cada certificado tiene un código único que
                no puede ser falsificado. La verificación por código es exacta — no se permite búsqueda
                parcial para proteger la privacidad de los titulares.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                  Verificación instantánea
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                  Códigos únicos e irrepetibles
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                  Base de datos segura
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                  Sin requerir inicio de sesión
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (showVerificationSteps) {
    return <VerificationSteps />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-500 to-gray-500 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
          </div>
          <h2 className="text-3xl bold text-gray-900 mb-4">
            Verificando Certificado
          </h2>
          <p className="text-gray-600 mb-8">
            Por favor espere mientras verificamos la autenticidad de este certificado...
          </p>
          <div className="bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Consultando base de datos segura</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-gray-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Certificado No Encontrado
          </h2>
          <p className="text-gray-600 mb-8">
            El código ingresado no corresponde a un certificado válido en nuestra base de datos.
            Verifica que hayas ingresado el código correctamente.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setShowVerificationSteps(true);
                setSearchId('');
                setErrorMessage('');
                navigate('/verify', { replace: true });
              }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-gray-700 hover:to-gray-700 transition-all duration-200 shadow-lg"
            >
              Intentar Nuevamente
            </button>
            <Link
              to="/"
              className="block w-full bg-white text-gray-700 py-3 px-6 rounded-xl font-semibold border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="inline-block mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (certificateId === 'preview') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-gray-600" />
              </div>
              <h2 className="ml-4 text-xl font-bold text-gray-800">Vista Previa del Certificado</h2>
            </div>
            <span className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
              Modo Vista Previa
            </span>
          </div>
          <div className="p-8">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Esta es una vista previa de la página de verificación del certificado. En un certificado real,
                esta página mostraría datos auténticos del certificado.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-700 hover:to-gray-700 transition-all duration-200 shadow-lg"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la Aplicación
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const template = templates.find(t => t.id === certificate?.template_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gray-100 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-800">Certificado Verificado</h2>
                <p className="text-gray-600">Este certificado es auténtico y válido</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-4 py-2 bg-gray-100 text-gray-800 text-sm font-semibold rounded-full">
                ✓ Auténtico
              </span>
              <button
                onClick={handleDownloadCertificate}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200 shadow-lg"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </button>
              <button
                onClick={handleShareToLinkedIn}
                className="inline-flex items-center px-4 py-2 bg-[#0A66C2] text-white text-sm font-medium rounded-xl hover:bg-[#004182] transition-colors duration-200 shadow-lg"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Agregar a LinkedIn
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificate Image */}
          <div className="lg:col-span-2">
            {template && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-gray-600" />
                  Certificado Digital
                </h3>
                <div className="relative bg-gray-50 rounded-xl p-4 overflow-hidden">
                  <div
                    className="relative w-full"
                    style={{
                      paddingTop: '70.7%',
                      backgroundImage: `url(${template.imageUrl})`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center'
                    }}
                  >
                    {template.fields.map((field: Template['fields'][0]) => {
                      if (field.type === 'qrcode') return null;

                      const style: React.CSSProperties = {
                        position: 'absolute',
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontFamily: field.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        fontSize: `${(field.fontSize || 16) * 0.8}px`,
                        color: field.color || '#000',
                        textAlign: 'center',
                        width: '100%',
                        maxWidth: '80%',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
                        zIndex: 1
                      };

                      let textValue = '';
                      switch (field.type) {
                        case 'text':
                          if (field.name === 'recipient') {
                            textValue = certificate?.recipient_name || '';
                          } else if (field.name === 'course') {
                            textValue = certificate?.course_name || field.defaultValue || '';
                          } else {
                            textValue = field.defaultValue || '';
                          }
                          break;
                        case 'date':
                          textValue = new Date(certificate?.issue_date || new Date()).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          });
                          break;
                      }

                      return (
                        <div key={field.id} style={style}>
                          {textValue}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certificate Details */}
          <div className="space-y-6">
            {/* Recipient Info — NO email shown for privacy */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-gray-600" />
                Información del Destinatario
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="text-lg font-semibold text-gray-900">{certificate?.recipient_name || 'No disponible'}</p>
                </div>
                {certificate?.course_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Curso/Programa</label>
                    <p className="text-gray-900 font-medium">{certificate.course_name}</p>
                  </div>
                )}
                {certificate?.duration_hours && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duración</label>
                    <p className="text-gray-900">{certificate.duration_hours} horas</p>
                  </div>
                )}
                {certificate?.instructor_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Instructor</label>
                    <p className="text-gray-900">{certificate.instructor_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-gray-600" />
                Detalles del Certificado
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Emisión</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {certificate?.issue_date
                      ? new Date(certificate.issue_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No disponible'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Código del Certificado</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    {certificate?.certificate_code || certificateId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Válido y Verificado
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institución Emisora</label>
                  <p className="text-gray-900">Red Ciudadana</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadCertificate}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:from-gray-700 hover:to-gray-700 transition-all duration-200 shadow-lg"
                >
                  <Download className="inline-block mr-2 h-4 w-4" />
                  Descargar Certificado PDF
                </button>
                <button
                  onClick={() => {
                    setShowVerificationSteps(true);
                    setSearchId('');
                    setErrorMessage('');
                    navigate('/verify', { replace: true });
                  }}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:from-gray-700 hover:to-gray-700 transition-all duration-200 shadow-lg"
                >
                  <Search className="inline-block mr-2 h-4 w-4" />
                  Verificar Otro Certificado
                </button>
                <Link
                  to="/"
                  className="block w-full bg-white text-gray-700 py-3 px-4 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200 text-center"
                >
                  <ArrowLeft className="inline-block mr-2 h-4 w-4" />
                  Volver al Inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;
