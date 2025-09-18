import React from 'react';
import { Share2, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';

const LinkedInIntegration: React.FC = () => {
  const { certificates, recipients } = useCertificateStore();
  
  const recentCertificates = certificates
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  const handleAddToLinkedIn = (certificateId: string) => {
    const certificate = certificates.find(c => c.id === certificateId);
    const recipient = recipients.find(r => r.id === certificate?.recipientId);
    
    if (!certificate || !recipient) return;
    
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(recipient.course || 'Certificación Profesional')}&organizationName=${encodeURIComponent('Red Ciudadana')}&issueYear=${new Date(recipient.issueDate).getFullYear()}&issueMonth=${new Date(recipient.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(window.location.href)}&certId=${encodeURIComponent(certificate.id)}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integración con LinkedIn</h1>
        <p className="mt-2 text-lg text-gray-600">
          Gestiona y comparte tus certificados de Red Ciudadana en LinkedIn
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Certificados Recientes</h2>
          <p className="mt-1 text-sm text-gray-500">
            Agrega tus certificados de Red Ciudadana a tu perfil de LinkedIn
          </p>
        </div>

        <div className="border-t border-gray-200">
          {recentCertificates.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {recentCertificates.map((certificate) => {
                const recipient = recipients.find(r => r.id === certificate.recipientId);
                return (
                  <li key={certificate.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-gray-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {recipient?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {recipient?.course || 'Certificación'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToLinkedIn(certificate.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-[#004182] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A66C2]"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Agregar a LinkedIn
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-6">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay certificados</h3>
              <p className="mt-1 text-sm text-gray-500">
                Genera certificados para compartirlos en LinkedIn
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Beneficios de la Integración</h2>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-gray-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Verificación Automática</h3>
              <p className="mt-2 text-sm text-gray-600">
                Los certificados incluyen un enlace de verificación que valida su autenticidad
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Share2 className="h-8 w-8 text-gray-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Compartir con Un Clic</h3>
              <p className="mt-2 text-sm text-gray-600">
                Agrega certificados a tu perfil de LinkedIn instantáneamente
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Award className="h-8 w-8 text-gray-600 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">Destacar Logros</h3>
              <p className="mt-2 text-sm text-gray-600">
                Muestra tus certificaciones de manera profesional en tu perfil
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInIntegration;