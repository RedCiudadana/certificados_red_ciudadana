import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';

const EmailNotifications: React.FC = () => {
  const { certificates, recipients } = useCertificateStore();
  const [sending, setSending] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [sentStatus, setSentStatus] = useState<{[key: string]: boolean}>({});

  const handleSendEmail = async (certificateId: string) => {
    const certificate = certificates.find(c => c.id === certificateId);
    const recipient = recipients.find(r => r.id === certificate?.recipientId);
    
    if (!certificate || !recipient || !recipient.email) return;
    
    setSending(true);
    
    try {
      const response = await fetch('/api/send-certificate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          certificateId: certificate.id,
          courseName: recipient.course,
          verificationUrl: certificate.verificationUrl
        }),
      });

      if (response.ok) {
        setSentStatus(prev => ({ ...prev, [certificateId]: true }));
      }
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBulkSend = async () => {
    setSending(true);
    
    for (const certificateId of selectedCertificates) {
      await handleSendEmail(certificateId);
    }
    
    setSelectedCertificates([]);
    setSending(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notificaciones por Email</h1>
        <p className="mt-2 text-lg text-gray-600">
          Envía notificaciones por correo electrónico a los destinatarios de los certificados
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Certificados Pendientes</h2>
            <p className="mt-1 text-sm text-gray-500">
              Selecciona los certificados para enviar notificaciones
            </p>
          </div>
          {selectedCertificates.length > 0 && (
            <button
              onClick={handleBulkSend}
              disabled={sending}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Enviando...' : `Enviar ${selectedCertificates.length} emails`}
            </button>
          )}
        </div>

        <div className="border-t border-gray-200">
          {certificates.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {certificates.map((certificate) => {
                const recipient = recipients.find(r => r.id === certificate.recipientId);
                const isSelected = selectedCertificates.includes(certificate.id);
                const isSent = sentStatus[certificate.id];
                
                if (!recipient?.email) return null;

                return (
                  <li key={certificate.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCertificates(prev => [...prev, certificate.id]);
                            } else {
                              setSelectedCertificates(prev => prev.filter(id => id !== certificate.id));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{recipient.name}</p>
                          <p className="text-sm text-gray-500">{recipient.email}</p>
                          <p className="text-xs text-gray-400">{recipient.course || 'Certificación'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {isSent ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-4 w-4" />
                            Enviado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSendEmail(certificate.id)}
                            disabled={sending}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar Email
                          </button>
                        )}
                      </div>
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
                Genera certificados para enviar notificaciones por email
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">Plantilla de Email</h2>
          <p className="mt-1 text-sm text-gray-500">
            Vista previa del email que recibirán los destinatarios
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900">¡Felicitaciones!</h3>
            <p className="mt-2 text-gray-600">
              Aquí está tu certificado digital de Red Ciudadana.
            </p>
            <div className="mt-4 space-y-2 text-gray-600">
              <p>Para aprovechar al máximo tu certificado digital, sigue estos pasos:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Ver tu certificado</li>
                <li>Compartirlo en tu feed de LinkedIn</li>
                <li>Actualizar tu perfil de LinkedIn</li>
              </ol>
            </div>
            <p className="mt-4 text-gray-600">
              Tu certificado está disponible en formato digital para que puedas acceder a él en cualquier momento y compartir fácilmente los detalles de tu logro.
            </p>
            <div className="mt-6 bg-white rounded-md p-4 border border-gray-200">
              <p className="text-sm text-gray-500">
                ¿Problemas para acceder a tu certificado? Copia y pega esta URL:
                <br />
                <code className="mt-1 block text-xs bg-gray-100 p-2 rounded">
                  https://certificados.redciudadana.org/verify/[ID]
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotifications;