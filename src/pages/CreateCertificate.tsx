import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Award, Save, Users, FileSpreadsheet, Share2, Download, CheckCircle, ArrowLeft, Sparkles, FileText, Plus } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import TemplateCard from '../components/TemplateCard';
import RecipientForm from '../components/RecipientForm';
import CertificatePreview from '../components/CertificatePreview';
import BulkUpload from '../components/BulkUpload';
import { toPng } from 'html-to-image';
import { generateCertificatePDF, downloadAllCertificatesAsPDF } from '../utils/certificateGenerator';

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
  const [isDownloadingBulk, setIsDownloadingBulk] = useState(false);
  
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
    
    try {
      // Create a temporary certificate element for PDF generation
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '800px';
      container.style.height = '566px';
      container.style.backgroundColor = 'white';
      container.style.zIndex = '-1000';
      document.body.appendChild(container);

      // Create certificate preview
      const certificateDiv = document.createElement('div');
      certificateDiv.className = 'certificate-preview';
      certificateDiv.style.width = '100%';
      certificateDiv.style.height = '100%';
      certificateDiv.style.position = 'relative';
      certificateDiv.style.backgroundColor = 'white';
      certificateDiv.style.backgroundImage = `url(${currentTemplate.imageUrl})`;
      certificateDiv.style.backgroundSize = 'cover';
      certificateDiv.style.backgroundPosition = 'center';
      certificateDiv.style.backgroundRepeat = 'no-repeat';

      // Add text fields
      currentTemplate.fields.forEach(field => {
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
        fieldDiv.style.fontSize = `${(field.fontSize || 16) * 1.5}px`;
        fieldDiv.style.color = field.color || '#000';
        fieldDiv.style.fontWeight = 'bold';
        fieldDiv.style.textShadow = '1px 1px 2px rgba(255,255,255,0.8)';
        fieldDiv.style.zIndex = '10';

        let textValue = '';
        switch (field.type) {
          case 'text':
            if (field.name === 'recipient') {
              textValue = currentRecipient.name;
            } else if (field.name === 'course') {
              textValue = currentRecipient.course || field.defaultValue || '';
            } else if (currentRecipient.customFields && currentRecipient.customFields[field.name]) {
              textValue = currentRecipient.customFields[field.name];
            } else {
              textValue = field.defaultValue || '';
            }
            break;
          case 'date':
            textValue = new Date(currentRecipient.issueDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            break;
        }

        fieldDiv.textContent = textValue;
        certificateDiv.appendChild(fieldDiv);
      });

      container.appendChild(certificateDiv);
      
      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const fileName = `${currentRecipient.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate`;
      await generateCertificatePDF(certificateDiv, fileName);
      
      // Clean up
      document.body.removeChild(container);
      
    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error al descargar el certificado. Por favor, inténtelo de nuevo.');
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
  
  const handleBulkDownload = async () => {
    if (generatedCertificateIds.length === 0) return;
    
    setIsDownloadingBulk(true);
    try {
      // Get certificates that were just generated
      const generatedCertificates = certificates.filter(cert => 
        generatedCertificateIds.includes(cert.id)
      );
      
      await downloadAllCertificatesAsPDF(generatedCertificates, recipients, templates);
    } catch (error) {
      console.error('Error downloading bulk certificates:', error);
      alert('Error al descargar los certificados. Por favor, inténtelo de nuevo.');
    } finally {
      setIsDownloadingBulk(false);
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
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </button>
                </div>
              </div>
              <div className="p-6">
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay plantillas disponibles</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Necesitas crear una plantilla antes de generar certificados.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/dashboard/templates"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Crear Plantilla
                      </Link>
                    </div>
                  </div>
                )}
                
                {templates.length > 0 && currentTemplateId && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setActiveStep(3)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg"
                    >
                      Continuar
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
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
              <div className="px-6 py-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isBulkMode ? 'Cargar Destinatarios' : 'Agregar Destinatario'}
                  </h2>
                  <p className="text-gray-600">
                    {isBulkMode 
                      ? 'Sube un archivo Excel con los datos de los destinatarios.'
                      : 'Ingresa los datos del destinatario del certificado.'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </button>
                </div>
              </div>
              <div className="p-6">
                {isBulkMode ? (
                  <BulkUpload onUploaded={handleBulkGenerate} />
                ) : (
                  <RecipientForm
                    onSubmit={handleRecipientSubmit}
                    onCancel={() => setActiveStep(2)}
                  />
                )}
                
                {!isBulkMode && formData && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleContinueToPreview}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg"
                    >
                      Ver Vista Previa
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
              <div className="px-6 py-6 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Vista Previa del Certificado</h2>
                  <p className="text-gray-600">
                    Revisa el certificado antes de generarlo.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                  </button>
                </div>
              </div>
              <div className="p-6">
                {currentTemplate && currentRecipient && (
                  <CertificatePreview
                    template={currentTemplate}
                    recipient={currentRecipient}
                    qrCodeUrl={`${window.location.origin}/verify/preview`}
                  />
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={handleGenerateCertificate}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-lg"
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Generar Certificado
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Show success message if certificates were generated
  if (showSuccess) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
          <div className="px-6 py-6 bg-gradient-to-r from-green-50 to-blue-50 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-green-900 mb-2 flex items-center">
              <CheckCircle className="mr-3 h-8 w-8 text-green-600" />
              ¡Certificado{generatedCertificateIds.length > 1 ? 's' : ''} Generado{generatedCertificateIds.length > 1 ? 's' : ''}!
            </h2>
            <p className="text-green-700">
              {generatedCertificateIds.length > 1 
                ? `Se generaron ${generatedCertificateIds.length} certificados exitosamente.`
                : 'El certificado se generó exitosamente.'
              }
            </p>
          </div>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {generatedCertificateIds.length === 1 ? (
                <>
                  <button
                    onClick={handleDownloadCertificate}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </button>
                  <button
                    onClick={handleShareToLinkedIn}
                    disabled={isSharing}
                    className="inline-flex items-center px-6 py-3 bg-[#0A66C2] text-white text-sm font-medium rounded-xl hover:bg-[#004182] transition-all duration-200 shadow-lg"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {isSharing ? 'Compartiendo...' : 'Compartir en LinkedIn'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleBulkDownload}
                  disabled={isDownloadingBulk}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
                >
                  <Download className="mr-2 h-4 w-4" />
                  {isDownloadingBulk ? 'Descargando...' : 'Descargar Todos los PDFs'}
                </button>
              )}
              <Link
                to="/dashboard/certificates"
                className="inline-flex items-center px-6 py-3 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg"
              >
                Ver Todos los Certificados
              </Link>
              <button
                onClick={() => {
                  setActiveStep(1);
                  setShowSuccess(false);
                  setGeneratedCertificateIds([]);
                  setCurrentRecipientId(null);
                  setFormData(null);
                  setCertificateImage(null);
                }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Crear Otro Certificado
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crear Certificado</h1>
          <p className="mt-2 text-lg text-gray-600">
            Genera certificados profesionales paso a paso
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="px-6 py-4">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {[
                { id: 1, name: 'Modo', status: getStepStatus(1) },
                { id: 2, name: 'Plantilla', status: getStepStatus(2) },
                { id: 3, name: 'Destinatario', status: getStepStatus(3) },
                { id: 5, name: 'Vista Previa', status: getStepStatus(5) }
              ].map((step, stepIdx) => (
                <li key={step.name} className={stepIdx !== 3 ? 'flex-1' : ''}>
                  <div className="flex items-center">
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.status === 'complete'
                            ? 'bg-green-600 text-white'
                            : step.status === 'current'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {step.status === 'complete' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          step.id
                        )}
                      </div>
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          step.status === 'current' ? 'text-blue-600' : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                    {stepIdx !== 3 && (
                      <div className="flex-1 ml-4">
                        <div
                          className={`h-0.5 ${
                            step.status === 'complete' ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}
    </div>
  );
}