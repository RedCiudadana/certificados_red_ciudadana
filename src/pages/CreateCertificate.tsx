import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, Save, Users, FileSpreadsheet, Share2, Download, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import TemplateCard from '../components/TemplateCard';
import RecipientForm from '../components/RecipientForm';
import CertificatePreview from '../components/CertificatePreview';
import BulkUpload from '../components/BulkUpload';
import { toPng } from 'html-to-image';
import { generateCertificatePDF } from '../utils/certificateGenerator';

export default function CreateCertificate() {
  const {
    templates,
    recipients,
    certificates,
    currentTemplateId,
    setCurrentTemplate,
    addRecipient,
    generateCertificate,
    generateBulkCertificates
  } = useCertificateStore();
  
  const [activeStep, setActiveStep] = useState(1);
  const [currentRecipientId, setCurrentRecipientId] = useState<string | null>(null);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [generatedCertificateIds, setGeneratedCertificateIds] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  useEffect(() => {
    if (!currentTemplateId && templates.length > 0) {
      setCurrentTemplate(templates[0].id);
    }
  }, [templates, currentTemplateId, setCurrentTemplate]);
  
  const currentTemplate = templates.find(t => t.id === currentTemplateId);
  const currentRecipient = recipients.find(r => r.id === currentRecipientId);
  
  const handleRecipientSubmit = (data: Omit<typeof currentRecipient, 'id'>) => {
    setFormData(data);
  };
  
  const handleContinueToPreview = () => {
    if (formData) {
      const id = addRecipient(formData);
      setCurrentRecipientId(id);
      setActiveStep(5);
    }
  };
  
  const handleGenerateCertificate = async () => {
    if (!currentTemplateId || !currentRecipientId) return;
    
    const certificateId = generateCertificate(currentRecipientId, currentTemplateId);
    setGeneratedCertificateIds([certificateId]);
    
    // Generate certificate image for preview
    setTimeout(async () => {
      const certificateElement = document.querySelector('.certificate-preview');
      if (certificateElement) {
        try {
          const dataUrl = await toPng(certificateElement as HTMLElement, { quality: 0.95 });
          setCertificateImage(dataUrl);
        } catch (error) {
          console.error('Error generating certificate image:', error);
        }
      }
    }, 500);
    
    setShowSuccess(true);
  };
  
  const handleBulkGenerate = (recipientIds: string[]) => {
    if (!currentTemplateId) return;
    
    const certificateIds = generateBulkCertificates(recipientIds, currentTemplateId);
    setGeneratedCertificateIds(certificateIds);
    setShowSuccess(true);
  };
  
  const handleDownloadCertificate = async () => {
    if (!currentTemplate || !currentRecipient) return;
    
    const certificateElement = document.querySelector('.certificate-preview');
    if (certificateElement) {
      try {
        await generateCertificatePDF(
          certificateElement as HTMLElement,
          `${currentRecipient.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate`
        );
      } catch (error) {
        console.error('Error downloading certificate:', error);
        alert('Error al descargar el certificado. Por favor, inténtelo de nuevo.');
      }
    }
  };
  
  const handleShareToLinkedIn = async () => {
    setIsSharing(true);
    
    try {
      const recipient = recipients.find(r => r.id === currentRecipientId);
      if (!recipient) return;
      
      const certificate = certificates.find(c => c.id === generatedCertificateIds[0]);
      const verificationUrl = certificate ? certificate.verificationUrl : `${window.location.origin}/verify/${generatedCertificateIds[0]}`;
      
      const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(recipient.course || 'Certificación Profesional')}&organizationName=${encodeURIComponent('Red Ciudadana')}&issueYear=${new Date(recipient.issueDate).getFullYear()}&issueMonth=${new Date(recipient.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(verificationUrl)}&certId=${encodeURIComponent(generatedCertificateIds[0])}`;
      
      window.open(linkedInUrl, '_blank', 'width=600,height=600');
    } catch (error) {
      console.error('Error al compartir en LinkedIn:', error);
    } finally {
      setIsSharing(false);
    }
  };
  
  const getStepStatus = (step: number) => {
    if (step < activeStep) return 'complete';
    if (step === activeStep) return 'current';
    return 'upcoming';
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona el Modo de Certificado</h2>
                <p className="text-gray-600">
                  Elige si deseas crear un certificado individual o generar múltiples certificados desde datos de Excel.
                </p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <button
                    onClick={() => {
                      setIsBulkMode(false);
                      setActiveStep(2);
                    }}
                    className={`group relative p-8 text-center rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      !isBulkMode 
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                        !isBulkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-100 group-hover:bg-blue-100'
                      }`}>
                        <Award className={`h-8 w-8 ${!isBulkMode ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Certificado Individual</h3>
                      <p className="text-gray-600">
                        Crea un certificado para un destinatario específico
                      </p>
                      {!isBulkMode && (
                        <div className="absolute -top-2 -right-2">
                          <CheckCircle className="h-6 w-6 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsBulkMode(true);
                      setActiveStep(2);
                    }}
                    className={`group relative p-8 text-center rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                      isBulkMode 
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-green-300'
                    }`}
                  >
                    <div className="relative">
                      <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${
                        isBulkMode ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-100 group-hover:bg-green-100'
                      }`}>
                        <FileSpreadsheet className={`h-8 w-8 ${isBulkMode ? 'text-white' : 'text-gray-600 group-hover:text-green-600'}`} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Generación Masiva</h3>
                      <p className="text-gray-600">
                        Genera múltiples certificados desde datos de Excel
                      </p>
                      {isBulkMode && (
                        <div className="absolute -top-2 -right-2">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Selecciona una Plantilla</h2>
                  <p className="text-gray-600">
                    Elige una plantilla para tu certificado.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveStep(1)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </button>
                  <button
                    onClick={() => setActiveStep(isBulkMode ? 4 : 3)}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    disabled={!currentTemplateId}
                  >
                    Continuar
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay plantillas disponibles</h3>
                    <p className="text-gray-500 mb-6">
                      Necesitas crear al menos una plantilla antes de continuar.
                    </p>
                    <Link
                      to="/dashboard/templates"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      Crear Plantilla
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Información del Destinatario</h2>
                  <p className="text-gray-600">
                    Ingresa los detalles del destinatario para el certificado.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </button>
                  {formData && (
                    <button
                      onClick={handleContinueToPreview}
                      className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg"
                    >
                      Continuar a Vista Previa
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6">
                <RecipientForm
                  onSubmit={handleRecipientSubmit}
                  onCancel={() => setActiveStep(2)}
                  initialData={currentRecipient}
                />
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Subir Destinatarios</h2>
                  <p className="text-gray-600">
                    Sube un archivo Excel con la información de los destinatarios.
                  </p>
                </div>
                <button
                  onClick={() => setActiveStep(2)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </button>
              </div>
              <div className="p-6">
                <BulkUpload onUploaded={handleBulkGenerate} />
              </div>
            </div>
          </div>
        );
      
      case 5:
        if (!currentTemplate || !currentRecipient) return null;
        
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Vista Previa del Certificado</h2>
                  <p className="text-gray-600">
                    Revisa y descarga tu certificado.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveStep(3)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Atrás
                  </button>
                  <button
                    onClick={handleGenerateCertificate}
                    className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Generar Certificado
                  </button>
                </div>
              </div>
              <div className="p-6">
                <CertificatePreview
                  template={currentTemplate}
                  recipient={currentRecipient}
                  qrCodeUrl={`${window.location.origin}/verify/preview`}
                />
              </div>
            </div>
          </div>
        );
      
      
      default:
        return null;
    }
  };
  
  if (showSuccess) {
    const recipient = recipients.find(r => r.id === currentRecipientId);
    
    return (
      <div className="space-y-6 animate-scaleIn">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="px-6 py-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Certificados Generados!</h2>
              <p className="text-gray-600">
              {generatedCertificateIds.length} certificado(s) han sido generados exitosamente.
            </p>
            </div>
          </div>
          <div className="p-8">
            <div className="text-center">
              
              {!isBulkMode && recipient && (
                <div className="mb-8 flex flex-col items-center space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-md">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificado para:</h3>
                    <p className="text-xl font-bold text-blue-600">{recipient.name}</p>
                    {recipient.course && (
                      <p className="text-gray-600 mt-1">{recipient.course}</p>
                    )}
                    <div className="mt-3 text-sm text-gray-500">
                      <p>ID: {generatedCertificateIds[0]}</p>
                      <p>Fecha: {new Date(recipient.issueDate).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleDownloadCertificate}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Descargar PDF
                    </button>
                    
                    <button
                      onClick={handleShareToLinkedIn}
                      disabled={isSharing}
                      className="inline-flex items-center px-6 py-3 bg-[#0A66C2] text-white text-sm font-medium rounded-xl hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Share2 className="mr-2 h-5 w-5" />
                      {isSharing ? 'Abriendo LinkedIn...' : 'Agregar a LinkedIn'}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    Descarga tu certificado o agrégalo directamente a tu perfil de LinkedIn
                  </p>
                </div>
              )}
              
              {isBulkMode && (
                <div className="mb-8 text-center">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 max-w-md mx-auto">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificados Generados:</h3>
                    <p className="text-3xl font-bold text-green-600">{generatedCertificateIds.length}</p>
                    <p className="text-gray-600 mt-1">certificados creados exitosamente</p>
                  </div>
                  
                  <div className="mt-4">
                    <Link
                      to="/dashboard/certificates"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Ver Todos los Certificados
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Link>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setActiveStep(1);
                    setGeneratedCertificateIds([]);
                    setCertificateImage(null);
                    setCurrentRecipientId(null);
                    setFormData(null);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Crear Otro Certificado
                </button>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Volver al Panel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Enhanced header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Crear Certificado
              <span className="inline-block ml-2 animate-bounce">🎓</span>
            </h1>
            <p className="text-xl text-blue-100">
              Genera un nuevo certificado siguiendo los pasos a continuación
            </p>
          </div>
        </div>
      </div>
      
      {/* Enhanced progress steps */}
      <nav aria-label="Progress">
        <ol className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          {[
            { step: 1, name: 'Seleccionar Modo', description: 'Individual o masivo' },
            { step: 2, name: 'Elegir Plantilla', description: 'Diseño del certificado' },
            { step: 3, name: 'Datos del Destinatario', description: 'Información personal', condition: !isBulkMode },
            { step: 4, name: 'Subir Archivo', description: 'Datos de Excel', condition: isBulkMode },
            { step: 5, name: 'Vista Previa', description: 'Revisar y generar', condition: !isBulkMode }
          ].filter(item => item.condition !== false).map((item, index) => (
            <li key={item.step} className="md:flex-1">
              <div
                className={`flex items-center p-4 rounded-xl transition-all duration-300 cursor-pointer ${
                  getStepStatus(item.step) === 'complete'
                    ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200'
                    : getStepStatus(item.step) === 'current'
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 shadow-lg'
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  if (getStepStatus(item.step) !== 'upcoming') {
                    setActiveStep(item.step);
                  }
                }}
              >
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      getStepStatus(item.step) === 'complete'
                        ? 'bg-green-500 text-white'
                        : getStepStatus(item.step) === 'current'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {getStepStatus(item.step) === 'complete' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      item.step
                    )}
                  </div>
                  <div className="ml-4">
                    <p
                      className={`text-sm font-medium ${
                        getStepStatus(item.step) === 'complete'
                          ? 'text-green-700'
                          : getStepStatus(item.step) === 'current'
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>
      
      {renderStepContent()}
    </div>
  );
}