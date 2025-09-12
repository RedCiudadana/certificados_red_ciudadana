import React, { useState, useEffect } from 'react';
import { ChevronRight, Award, Save, Users, FileSpreadsheet, Share2, Download, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import TemplateCard from '../components/TemplateCard';
import RecipientForm from '../components/RecipientForm';
import CertificatePreview from '../components/CertificatePreview';
import BulkUpload from '../components/BulkUpload';
import { toPng } from 'html-to-image';

const CreateCertificate: React.FC = () => {
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
    
    const certificateElement = document.querySelector('.certificate-preview');
    if (certificateElement) {
      try {
        const dataUrl = await toPng(certificateElement as HTMLElement, { quality: 0.95 });
        setCertificateImage(dataUrl);
      } catch (error) {
        console.error('Error generating certificate image:', error);
      }
    }
    
    setShowSuccess(true);
  };
  
  const handleBulkGenerate = (recipientIds: string[]) => {
    if (!currentTemplateId) return;
    
    const certificateIds = generateBulkCertificates(recipientIds, currentTemplateId);
    setGeneratedCertificateIds(certificateIds);
    setShowSuccess(true);
  };
  
  const handleShareToLinkedIn = async () => {
    setIsSharing(true);
    
    try {
      const recipient = recipients.find(r => r.id === currentRecipientId);
      if (!recipient) return;
      
      const shareText = `¡Me complace compartir que he obtenido un certificado en ${recipient.course || 'mi campo de estudio'}! 🎓\n\nEste logro representa mi compromiso con el aprendizaje continuo y el desarrollo profesional.\n\n#Educación #DesarrolloProfesional #Certificación`;
      
      const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(recipient.course || 'Certificación Profesional')}&organizationName=${encodeURIComponent('Red Ciudadana')}&issueYear=${new Date(recipient.issueDate).getFullYear()}&issueMonth=${new Date(recipient.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(currentRecipientId)}`;
      
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
                      to="/templates"
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
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Select Template</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a template for your certificate.
                  </p>
                </div>
                <button
                  onClick={() => setActiveStep(isBulkMode ? 4 : 3)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!currentTemplateId}
                >
                  Continue
                  <ChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Recipient Information</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter the recipient details for the certificate.
                  </p>
                </div>
                {formData && (
                  <button
                    onClick={handleContinueToPreview}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Continue to Preview
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
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
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Upload Recipients</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Upload an Excel file with recipient information.
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <BulkUpload onUploaded={handleBulkGenerate} />
              </div>
            </div>
          </div>
        );
      
      case 5:
        if (!currentTemplate || !currentRecipient) return null;
        
        return (
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Certificate Preview</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and download your certificate.
                  </p>
                </div>
                <button
                  onClick={handleGenerateCertificate}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="mr-1 h-4 w-4" />
                  Generate Certificate
                </button>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
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
                  </div>
                  
                  <button
                    onClick={handleShareToLinkedIn}
                    disabled={isSharing}
                    className="inline-flex items-center px-6 py-3 bg-[#0A66C2] text-white text-sm font-medium rounded-xl hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Share2 className="mr-2 h-5 w-5" />
                    {isSharing ? 'Abriendo LinkedIn...' : 'Agregar a LinkedIn'}
                  </button>
                  
                  <p className="text-sm text-gray-600">
                    Agrega este logro directamente a tu perfil de LinkedIn
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setActiveStep(1);
                    setGeneratedCertificateIds([]);
                    setCertificateImage(null);
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  Crear Otro Certificado
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="inline-flex items-center px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-xl border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Volver al Panel
                </button>
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
};
            <button
              onClick={() => setActiveStep(1)}
              className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                getStepStatus(1) === 'complete'
                  ? 'border-blue-600'
                  : getStepStatus(1) === 'current'
                  ? 'border-blue-600'
                  : 'border-gray-200'
              }`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  getStepStatus(1) === 'complete'
                    ? 'text-blue-600'
                    : getStepStatus(1) === 'current'
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                Step 1
              </span>
              <span className="text-sm font-medium">Select Mode</span>
            </button>
          </li>
          
          <li className="md:flex-1">
            <button
              onClick={() => activeStep > 1 && setActiveStep(2)}
              className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                getStepStatus(2) === 'complete'
                  ? 'border-blue-600'
                  : getStepStatus(2) === 'current'
                  ? 'border-blue-600'
                  : 'border-gray-200'
              }`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  getStepStatus(2) === 'complete'
                    ? 'text-blue-600'
                    : getStepStatus(2) === 'current'
                    ? 'text-blue-600'
                    : 'text-gray-500'
                }`}
              >
                Step 2
              </span>
              <span className="text-sm font-medium">Select Template</span>
            </button>
          </li>
          
          <li className="md:flex-1">
            <button
              onClick={() => activeStep > 2 && !isBulkMode && setActiveStep(3)}
              className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                !isBulkMode
                  ? getStepStatus(3) === 'complete'
                    ? 'border-blue-600'
                    : getStepStatus(3) === 'current'
                    ? 'border-blue-600'
                    : 'border-gray-200'
                  : 'border-gray-200'
              }`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  !isBulkMode
                    ? getStepStatus(3) === 'complete'
                      ? 'text-blue-600'
                      : getStepStatus(3) === 'current'
                      ? 'text-blue-600'
                      : 'text-gray-500'
                    : 'text-gray-500'
                }`}
              >
                Step 3
              </span>
              <span className="text-sm font-medium">Enter Recipient</span>
            </button>
          </li>
          
          <li className="md:flex-1">
            <button
              onClick={() => isBulkMode && activeStep > 2 && setActiveStep(4)}
              className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                isBulkMode
                  ? getStepStatus(4) === 'complete'
                    ? 'border-blue-600'
                    : getStepStatus(4) === 'current'
                    ? 'border-blue-600'
                    : 'border-gray-200'
                  : 'border-gray-200'
              }`}
            >
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  isBulkMode
                    ? getStepStatus(4) === 'complete'
                      ? 'text-blue-600'
                      : getStepStatus(4) === 'current'
                      ? 'text-blue-600'
                      : 'text-gray-500'
                    : 'text-gray-500'
                }`}
              >
                Step 4
              </span>
              <span className="text-sm font-medium">
                {isBulkMode ? 'Upload Recipients' : 'Preview & Generate'}
              </span>
            </button>
          </li>
          
          {!isBulkMode && (
            <li className="md:flex-1">
              <button
                onClick={() => !isBulkMode && activeStep > 3 && setActiveStep(5)}
                className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                  !isBulkMode
                    ? getStepStatus(5) === 'complete'
                      ? 'border-blue-600'
                      : getStepStatus(5) === 'current'
                      ? 'border-blue-600'
                      : 'border-gray-200'
                    : 'border-gray-200'
                }`}
              >
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    !isBulkMode
                      ? getStepStatus(5) === 'complete'
                        ? 'text-blue-600'
                        : getStepStatus(5) === 'current'
                        ? 'text-blue-600'
                        : 'text-gray-500'
                      : 'text-gray-500'
                  }`}
                >
                  Step 5
                </span>
                <span className="text-sm font-medium">Preview & Generate</span>
              </button>
            </li>
          )}
        </ol>
      </nav>
      
      {renderStepContent()}
    </div>
  );
};

export default CreateCertificate;