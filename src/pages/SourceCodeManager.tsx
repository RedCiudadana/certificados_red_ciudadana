import React, { useState } from 'react';
import { Code2, FileText, Users, Award, Download, Upload, Copy, Check, AlertCircle, Info, ExternalLink, Folder, File } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';

const SourceCodeManager: React.FC = () => {
  const { templates, recipients, certificates, exportData, importData, loadDefaultData, clearAllData } = useCertificateStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'data' | 'guide'>('templates');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [importJson, setImportJson] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleCopyCode = (code: string, type: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleImportData = () => {
    try {
      importData(importJson);
      setImportJson('');
      setShowImportModal(false);
      alert('Datos importados exitosamente');
    } catch (error) {
      alert('Error al importar datos. Verifica el formato JSON.');
    }
  };

  const handleExportData = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const templateCode = `// En src/store/certificateStore.ts, agrega a la función loadDefaultData:

const defaultTemplates: Template[] = [
  {
    id: 'professional-cert',
    name: 'Certificado Profesional',
    imageUrl: '/assets/certificate-templates/professional.jpg',
    fields: [
      { 
        id: nanoid(), 
        name: 'recipient', 
        type: 'text', 
        x: 50, 
        y: 40, 
        fontSize: 28, 
        fontFamily: 'serif', 
        color: '#1a365d' 
      },
      { 
        id: nanoid(), 
        name: 'course', 
        type: 'text', 
        x: 50, 
        y: 60, 
        fontSize: 20, 
        fontFamily: 'serif', 
        color: '#2d3748' 
      },
      { 
        id: nanoid(), 
        name: 'date', 
        type: 'date', 
        x: 30, 
        y: 85, 
        fontSize: 16, 
        fontFamily: 'serif', 
        color: '#6b7280' 
      },
      { 
        id: nanoid(), 
        name: 'qrcode', 
        type: 'qrcode', 
        x: 85, 
        y: 90 
      }
    ]
  }
];

// Luego actualiza el estado:
set({
  templates: defaultTemplates,
  currentTemplateId: defaultTemplates[0]?.id || null
});`;

  const recipientCode = `// En src/store/certificateStore.ts, agrega a la función loadDefaultData:

const defaultRecipients: Recipient[] = [
  {
    id: 'recipient-001',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    course: 'Desarrollo Web',
    issueDate: '2024-01-15T00:00:00.000Z',
    customFields: {
      institution: 'Red Ciudadana',
      duration: '40 horas'
    }
  },
  {
    id: 'recipient-002',
    name: 'María García',
    email: 'maria@example.com',
    course: 'Ciencia de Datos',
    issueDate: '2024-02-20T00:00:00.000Z',
    customFields: {
      institution: 'Red Ciudadana',
      level: 'Avanzado'
    }
  }
];

// Luego actualiza el estado:
set({
  recipients: defaultRecipients
});`;

  const certificateCode = `// En src/store/certificateStore.ts, agrega a la función loadDefaultData:

const defaultCertificates: Certificate[] = [
  {
    id: '1234',  // ID fácil para pruebas
    recipientId: 'recipient-001',
    templateId: 'professional-cert',
    qrCodeUrl: 'https://tu-dominio.com/verify/1234',
    issueDate: '2024-01-15T00:00:00.000Z',
    verificationUrl: 'https://tu-dominio.com/verify/1234',
    status: 'published'
  },
  {
    id: 'CERT-2024-001',  // ID formato completo
    recipientId: 'recipient-002',
    templateId: 'professional-cert',
    qrCodeUrl: 'https://tu-dominio.com/verify/CERT-2024-001',
    issueDate: '2024-02-20T00:00:00.000Z',
    verificationUrl: 'https://tu-dominio.com/verify/CERT-2024-001',
    status: 'published'
  }
];

// Luego actualiza el estado:
set({
  certificates: defaultCertificates
});`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Código Fuente</h1>
        <p className="mt-2 text-lg text-gray-600">
          Administra plantillas, destinatarios y certificados directamente desde el código fuente
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'templates'
                ? 'border-gray-500 text-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="inline-block mr-2 h-4 w-4" />
            Plantillas
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-gray-500 text-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline-block mr-2 h-4 w-4" />
            Datos
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'guide'
                ? 'border-gray-500 text-gray-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Info className="inline-block mr-2 h-4 w-4" />
            Guía
          </button>
        </nav>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* Directory Structure */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Folder className="mr-3 h-6 w-6 text-gray-600" />
                Estructura de Directorios
              </h2>
              <p className="text-gray-600 mt-1">Ubicación de archivos para imágenes de certificados</p>
            </div>
            <div className="p-6">
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-400">
                <div className="space-y-1">
                  <div>📁 public/</div>
                  <div className="ml-4">📁 assets/</div>
                  <div className="ml-8">📁 certificate-templates/</div>
                  <div className="ml-12">📄 professional-certificate.jpg</div>
                  <div className="ml-12">📄 completion-certificate.png</div>
                  <div className="ml-12">📄 achievement-award.svg</div>
                  <div className="ml-12">📄 README.md</div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Especificaciones de Imagen</h3>
                <ul className="text-sm text-gray-800 space-y-1">
                  <li>• <strong>Dimensiones:</strong> 2000x1414 píxeles (proporción A4)</li>
                  <li>• <strong>Resolución:</strong> 300 DPI para calidad de impresión</li>
                  <li>• <strong>Formatos:</strong> PNG, JPG, GIF, WebP, SVG</li>
                  <li>• <strong>Tamaño máximo:</strong> 5MB recomendado</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Code */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Code2 className="mr-3 h-6 w-6 text-gray-600" />
                  Código para Plantillas
                </h2>
                <p className="text-gray-600 mt-1">Agrega plantillas directamente en el código fuente</p>
              </div>
              <button
                onClick={() => handleCopyCode(templateCode, 'template')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200"
              >
                {copiedCode === 'template' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Código
                  </>
                )}
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{templateCode}</code>
              </pre>
            </div>
          </div>

          {/* Recipients Code */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Users className="mr-3 h-6 w-6 text-gray-600" />
                  Código para Destinatarios
                </h2>
                <p className="text-gray-600 mt-1">Agrega destinatarios para los certificados</p>
              </div>
              <button
                onClick={() => handleCopyCode(recipientCode, 'recipient')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200"
              >
                {copiedCode === 'recipient' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Código
                  </>
                )}
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{recipientCode}</code>
              </pre>
            </div>
          </div>

          {/* Certificates Code */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-red-50 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Award className="mr-3 h-6 w-6 text-gray-600" />
                  Código para Certificados
                </h2>
                <p className="text-gray-600 mt-1">Agrega certificados para validación</p>
              </div>
              <button
                onClick={() => handleCopyCode(certificateCode, 'certificate')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-colors duration-200"
              >
                {copiedCode === 'certificate' ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar Código
                  </>
                )}
              </button>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{certificateCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          {/* Current Data Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Plantillas</p>
                  <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Destinatarios</p>
                  <p className="text-2xl font-bold text-gray-900">{recipients.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center">
                <Award className="h-8 w-8 text-gray-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Certificados</p>
                  <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Gestión de Datos</h2>
              <p className="text-gray-600 mt-1">Exportar, importar y gestionar datos del sistema</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Exportar Datos</h3>
                  <p className="text-sm text-gray-600">
                    Descarga todos los datos actuales en formato JSON para respaldo o migración.
                  </p>
                  <button
                    onClick={handleExportData}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:from-gray-700 hover:to-gray-700 transition-all duration-200 shadow-lg"
                  >
                    <Download className="inline-block mr-2 h-4 w-4" />
                    Exportar Datos JSON
                  </button>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Importar Datos</h3>
                  <p className="text-sm text-gray-600">
                    Carga datos desde un archivo JSON exportado previamente.
                  </p>
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-600 text-white py-3 px-4 rounded-xl font-medium hover:from-gray-700 hover:to-gray-700 transition-all duration-200 shadow-lg"
                  >
                    <Upload className="inline-block mr-2 h-4 w-4" />
                    Importar Datos JSON
                  </button>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Zona de Peligro</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>Esta acción eliminará todos los datos actuales y no se puede deshacer.</p>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
                              clearAllData();
                            }
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200"
                        >
                          Eliminar Todos los Datos
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guide Tab */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Guía de Implementación</h2>
              <p className="text-gray-600 mt-1">Pasos para agregar certificados mediante código fuente</p>
            </div>
            <div className="p-6">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Agregar Imágenes de Fondo</h3>
                    <p className="text-gray-600 mt-1">
                      Coloca tus imágenes de certificado en <code className="bg-gray-100 px-2 py-1 rounded">public/assets/certificate-templates/</code>
                    </p>
                    <div className="mt-2 text-sm text-gray-500">
                      Ejemplo: <code>professional-certificate.jpg</code>, <code>completion-award.png</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Editar el Código Fuente</h3>
                    <p className="text-gray-600 mt-1">
                      Abre <code className="bg-gray-100 px-2 py-1 rounded">src/store/certificateStore.ts</code> y agrega tus datos en la función <code className="bg-gray-100 px-2 py-1 rounded">loadDefaultData</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Reiniciar el Servidor</h3>
                    <p className="text-gray-600 mt-1">
                      Ejecuta <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code> para aplicar los cambios
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Probar la Validación</h3>
                    <p className="text-gray-600 mt-1">
                      Visita <code className="bg-gray-100 px-2 py-1 rounded">/verify/1234</code> para probar un certificado con ID simple
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Info className="mr-2 h-5 w-5" />
                  Enlaces Útiles
                </h3>
                <div className="space-y-2 text-sm">
                  <a
                    href="/CERTIFICATE_SOURCE_CODE_GUIDE.md"
                    target="_blank"
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Guía Completa de Código Fuente
                  </a>
                  <a
                    href="/TEMPLATE_SETUP_GUIDE.md"
                    target="_blank"
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    Guía de Configuración de Plantillas
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowImportModal(false)} />
            <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Importar Datos JSON</h3>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder="Pega aquí el JSON exportado..."
                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleImportData}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-600 border border-transparent rounded-md hover:bg-gray-700"
                >
                  Importar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceCodeManager;