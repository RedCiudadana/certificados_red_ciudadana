import React, { useState, useEffect } from 'react';
import { ChevronRight, Award, Save, Users, FileSpreadsheet, Share2, Download } from 'lucide-react';
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
          <div className="space-y-6">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">Select Certificate Mode</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose whether to create a single certificate or bulk generate from Excel data.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="bg-gray-50 grid grid-cols-1 divide-y divide-gray-200 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                  <button
                    onClick={() => {
                      setIsBulkMode(false);
                      setActiveStep(2);
                    }}
                    className={`group px-6 py-8 text-sm font-medium text-center hover:bg-gray-100 transition-colors duration-150 ${
                      !isBulkMode ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Award className="h-10 w-10 mx-auto text-blue-600" />
                    <div className="mt-3 text-lg">Single Certificate</div>
                    <p className="mt-2 text-sm text-gray-500">
                      Create a certificate for an individual recipient
                    </p>
                  </button>
                  <button
                    onClick={() => {
                      setIsBulkMode(true);
                      setActiveStep(2);
                    }}
                    className={`group px-6 py-8 text-sm font-medium text-center hover:bg-gray-100 transition-colors duration-150 ${
                      isBulkMode ? 'bg-blue-50' : ''
                    }`}
                  >
                    <FileSpreadsheet className="h-10 w-10 mx-auto text-green-600" />
                    <div className="mt-3 text-lg">Bulk Generation</div>
                    <p className="mt-2 text-sm text-gray-500">
                      Generate multiple certificates from Excel data
                    </p>
                  </button>
                </div>
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
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Certificados Generados</h2>
            <p className="mt-1 text-sm text-gray-500">
              {generatedCertificateIds.length} certificado(s) han sido generados exitosamente.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="text-center py-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Award className="h-6 w-6 text-green-600" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">¡Éxito!</h3>
              <p className="mt-2 text-sm text-gray-500">
                Tu certificado ha sido generado y está listo para ser compartido.
              </p>
              
              {!isBulkMode && recipient && (
                <div className="mt-6 flex flex-col items-center space-y-4">
                  <button
                    onClick={handleShareToLinkedIn}
                    disabled={isSharing}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0A66C2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2] disabled:opacity-50"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {isSharing ? 'Abriendo LinkedIn...' : 'Agregar a LinkedIn'}
                  </button>
                  
                  <p className="text-sm text-gray-500">
                    Agrega este logro directamente a tu perfil de LinkedIn
                  </p>
                </div>
              )}
              
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowSuccess(false);
                    setActiveStep(1);
                    setGeneratedCertificateIds([]);
                    setCertificateImage(null);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Crear Otro Certificado
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/";
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Certificate</h1>
        <p className="mt-2 text-lg text-gray-600">
          Generate a new certificate by following the steps below.
        </p>
      </div>
      
      <nav aria-label="Progress">
        <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
          <li className="md:flex-1">
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