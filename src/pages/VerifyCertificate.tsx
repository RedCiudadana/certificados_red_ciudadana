import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCertificateStore } from '../store/certificateStore';
import { CheckCircle, AlertTriangle, ArrowLeft, Share2, Download } from 'lucide-react';

const VerifyCertificate: React.FC = () => {
  const { certificateId } = useParams<{ certificateId: string }>();
  const { certificates, recipients, templates } = useCertificateStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [recipient, setRecipient] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);

  const handleShareToLinkedIn = async () => {
    if (!recipient || !certificate) return;
    
    const shareText = `¡Me complace compartir que he obtenido un certificado en ${recipient.course || 'mi campo de estudio'}! 🎓\n\nEste logro representa mi compromiso con el aprendizaje continuo y el desarrollo profesional.\n\n#Educación #DesarrolloProfesional #Certificación`;
    
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(recipient.course || 'Certificación Profesional')}&organizationName=${encodeURIComponent(window.location.hostname)}&issueYear=${new Date(recipient.issueDate).getFullYear()}&issueMonth=${new Date(recipient.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(certificate.id)}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };
  
  useEffect(() => {
    // Simulate API call/verification delay
    const timer = setTimeout(() => {
      if (certificateId === 'preview') {
        // Special case for preview
        setIsValid(true);
        setIsLoading(false);
        return;
      }
      
      const foundCertificate = certificates.find(c => c.id === certificateId);
      
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
      } else {
        setIsValid(false);
      }
      
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [certificateId, certificates, recipients, templates]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verificando Certificado
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Por favor espere mientras verificamos la autenticidad de este certificado...
          </p>
        </div>
      </div>
    );
  }
  
  if (!isValid) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Certificado Inválido
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Este certificado no pudo ser verificado. Puede haber sido revocado, expirado, o el ID puede ser incorrecto.
          </p>
          <div className="mt-5">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (certificateId === 'preview') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-blue-50">
            <div className="flex items-center">
              <div className="bg-blue-100 rounded-full p-2">
                <CheckCircle className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
              <h2 className="ml-3 text-lg font-medium text-blue-800">Vista Previa del Certificado</h2>
            </div>
            <div className="flex-shrink-0 flex">
              <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                Modo Vista Previa
              </span>
            </div>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="text-center sm:text-left">
              <p className="mt-1 text-sm text-gray-600">
                Esta es una vista previa de la página de verificación del certificado. En un certificado real, esta página mostraría datos auténticos del certificado.
              </p>
            </div>
          </div>
          <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la Aplicación
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center bg-green-50">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2">
              <CheckCircle className="h-6 w-6 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="ml-3 text-lg font-medium text-green-800">Certificado Verificado</h2>
          </div>
          <div className="flex-shrink-0 flex space-x-3">
            <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
              Auténtico
            </span>
            <button
              onClick={handleShareToLinkedIn}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2]"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Agregar a LinkedIn
            </button>
          </div>
        </div>
        
        {template && (
          <div className="p-4 border-b border-gray-200">
            <div className="mx-auto max-w-2xl h-64 sm:h-96 relative">
              <img
                src={template.imageUrl}
                alt="Certificate"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Detalles del Certificado</h3>
          
          <div className="mt-5 border-t border-gray-200">
            <dl className="divide-y divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Nombre del Destinatario</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {recipient?.name || 'No disponible'}
                </dd>
              </div>
              
              {recipient?.email && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Correo Electrónico</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {recipient.email}
                  </dd>
                </div>
              )}
              
              {recipient?.course && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Curso/Logro</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {recipient.course}
                  </dd>
                </div>
              )}
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Fecha de Emisión</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
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
                </dd>
              </div>
              
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">ID del Certificado</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {certificate?.id || certificateId}
                </dd>
              </div>
              
              {recipient?.customFields && Object.keys(recipient.customFields).length > 0 && (
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
                  <dt className="text-sm font-medium text-gray-500">Información Adicional</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {Object.entries(recipient.customFields).map(([key, value]) => (
                        <li key={key} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div className="w-0 flex-1 flex items-center">
                            <span className="ml-2 flex-1 w-0 truncate font-medium">{key}:</span>
                          </div>
                          <div className="ml-4 flex-shrink-0">
                            <span className="text-gray-900">{value as string}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
        
        <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Aplicación
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;