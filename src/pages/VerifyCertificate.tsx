import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCertificateStore } from '../store/certificateStore';
import { CheckCircle, AlertTriangle, ArrowLeft, Share2, Download, Search, Award, Shield, Clock, User, Calendar, FileText, ExternalLink } from 'lucide-react';
import { generateCertificatePDF } from '../utils/certificateGenerator';

const VerifyCertificate: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const { certificates, recipients, templates } = useCertificateStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [recipient, setRecipient] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);
  const [searchId, setSearchId] = useState('');
  const [showVerificationSteps, setShowVerificationSteps] = useState(!certificateId);

  const handleVerification = async (id: string) => {
    if (!id || id.length < 4) {
      alert('Por favor ingresa un código válido de al menos 4 dígitos');
      return;
    }

    setIsLoading(true);
    setIsValid(false);
    setCertificate(null);
    setRecipient(null);
    setTemplate(null);

    // Simulate verification delay
    setTimeout(() => {
      // Find certificate by ID (exact match or partial match for 4-digit codes)
      const foundCertificate = certificates.find(c => 
        c.id === id || c.id.slice(-4) === id || c.id.includes(id)
      );
      
      if (foundCertificate) {
        setCertificate(foundCertificate);
        setIsValid(true);
        
        const foundRecipient = recipients.find(r => r.id === foundCertificate.recipientId);
        if (foundRecipient) {
          setRecipient(foundRecipient);
        }
        
        const foundTemplate = templates.find(t => t.id === foundCertificate.templateId);
        if (foundTemplate) {
          setTemplate(foundTemplate);
        }
        
        // Update URL without page reload
        navigate(`/verify/${foundCertificate.id}`, { replace: true });
      } else {
        setIsValid(false);
      }
      
      setIsLoading(false);
      setShowVerificationSteps(false);
    }, 1500);
  };

  const handleShareToLinkedIn = async () => {
    if (!recipient || !certificate) return;
    
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(recipient.course || 'Certificación Profesional')}&organizationName=${encodeURIComponent('Red Ciudadana')}&issueYear=${new Date(recipient.issueDate).getFullYear()}&issueMonth=${new Date(recipient.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(certificate.id)}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  const handleDownloadCertificate = async () => {
    if (!recipient || !template || !certificate) return;
    
    // Create a temporary container for rendering the certificate
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.height = '566px';
    document.body.appendChild(container);

    try {
      // Create certificate preview
      const certificateDiv = document.createElement('div');
      certificateDiv.className = 'certificate-preview';
      certificateDiv.style.width = '100%';
      certificateDiv.style.height = '100%';
      certificateDiv.style.position = 'relative';
      certificateDiv.style.backgroundColor = 'white';
      certificateDiv.style.overflow = 'hidden';

      // Add template background
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

      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        setTimeout(resolve, 5000); // Fallback timeout
      });

      // Add text fields
      template.fields.forEach(field => {
        if (field.type === 'qrcode') return; // Skip QR code for now
        
        const fieldDiv = document.createElement('div');
        fieldDiv.style.position = 'absolute';
        fieldDiv.style.left = `${field.x}%`;
        fieldDiv.style.top = `${field.y}%`;
        fieldDiv.style.transform = 'translate(-50%, -50%)';
        fieldDiv.style.textAlign = 'center';
        fieldDiv.style.width = '100%';
        fieldDiv.style.maxWidth = '80%';
        fieldDiv.style.fontFamily = field.fontFamily || 'serif';
        fieldDiv.style.fontSize = `${field.fontSize || 16}px`;
        fieldDiv.style.color = field.color || '#000';
        fieldDiv.style.zIndex = '1';
        fieldDiv.style.fontWeight = 'bold';
        fieldDiv.style.textShadow = '1px 1px 2px rgba(255,255,255,0.8)';

        switch (field.type) {
          case 'text':
            let textValue = '';
            if (field.name === 'recipient') {
              textValue = recipient.name;
            } else if (field.name === 'course') {
              textValue = recipient.course || field.defaultValue || '';
            } else if (recipient.customFields && recipient.customFields[field.name]) {
              textValue = recipient.customFields[field.name];
            } else {
              textValue = field.defaultValue || '';
            }
            fieldDiv.textContent = textValue;
            break;

          case 'date':
            fieldDiv.textContent = new Date(recipient.issueDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            break;
        }

        certificateDiv.appendChild(fieldDiv);
      });

      container.appendChild(certificateDiv);

      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate PDF
      const fileName = `${recipient.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate`;
      await generateCertificatePDF(certificateDiv, fileName);

    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error al descargar el certificado. Por favor, inténtelo de nuevo.');
    } finally {
      // Clean up
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
  }, [certificateId]);

  // Verification Steps Component
  const VerificationSteps = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
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
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
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
                className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchId.trim()}
              className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Busca el Código</h3>
            <p className="text-gray-600">
              Localiza el número de identificación en tu certificado. Puede ser de 4 dígitos o el código completo.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ingresa el Código</h3>
            <p className="text-gray-600">
              Escribe el código en el buscador de arriba y presiona el botón "Verificar Certificado".
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ver Detalles</h3>
            <p className="text-gray-600">
              La página te mostrará todos los detalles del certificado y confirmará su autenticidad.
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sistema de Verificación Seguro
              </h3>
              <p className="text-gray-700 mb-4">
                Nuestro sistema de verificación utiliza tecnología avanzada para garantizar la autenticidad 
                de cada certificado emitido por Red Ciudadana. Cada certificado tiene un código único que 
                no puede ser falsificado.
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Verificación instantánea
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Códigos únicos e irrepetibles
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Base de datos segura
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
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
                navigate('/verify', { replace: true });
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-3">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="ml-4 text-xl font-bold text-blue-800">Vista Previa del Certificado</h2>
            </div>
            <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
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
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
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
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="px-6 py-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-green-800">Certificado Verificado</h2>
                <p className="text-green-600">Este certificado es auténtico y válido</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-4 py-2 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                ✓ Auténtico
              </span>
              <button
                onClick={handleDownloadCertificate}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg"
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
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Certificado Digital
                </h3>
                <div className="relative bg-gray-50 rounded-xl p-4">
                  <img
                    src={template.imageUrl}
                    alt="Certificate"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Certificate Details */}
          <div className="space-y-6">
            {/* Recipient Info */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="mr-2 h-5 w-5 text-blue-600" />
                Información del Destinatario
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                  <p className="text-lg font-semibold text-gray-900">{recipient?.name || 'No disponible'}</p>
                </div>
                {recipient?.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                    <p className="text-gray-900">{recipient.email}</p>
                  </div>
                )}
                {recipient?.course && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Curso/Programa</label>
                    <p className="text-gray-900 font-medium">{recipient.course}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="mr-2 h-5 w-5 text-purple-600" />
                Detalles del Certificado
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Emisión</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {certificate?.issueDate
                      ? new Date(certificate.issueDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : new Date(recipient?.issueDate).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">ID del Certificado</label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg">
                    {certificate?.id || certificateId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Válido y Verificado
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Fields */}
            {recipient?.customFields && Object.keys(recipient.customFields).length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
                <div className="space-y-3">
                  {Object.entries(recipient.customFields).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-500 capitalize">{key}:</span>
                      <span className="text-gray-900 font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="space-y-3">
                <button
                  onClick={handleDownloadCertificate}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <Download className="inline-block mr-2 h-4 w-4" />
                  Descargar Certificado PDF
                </button>
                <button
                  onClick={() => {
                    setShowVerificationSteps(true);
                    setSearchId('');
                    navigate('/verify', { replace: true });
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
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