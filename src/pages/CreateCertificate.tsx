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
            </div>
          </div>
        );
    }
  };
}
                