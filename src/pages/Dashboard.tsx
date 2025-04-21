import React from 'react';
import { Link } from 'react-router-dom';
import { Award, FileSpreadsheet, FileText, Users, Download, ChevronRight } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import { downloadAllCertificatesAsPDF } from '../utils/certificateGenerator';

const Dashboard: React.FC = () => {
  const { templates, recipients, certificates } = useCertificateStore();
  
  const stats = [
    { name: 'Plantillas', count: templates.length, icon: FileText, color: 'bg-blue-500', to: '/templates' },
    { name: 'Destinatarios', count: recipients.length, icon: Users, color: 'bg-green-500', to: '/recipients' },
    { name: 'Certificados', count: certificates.length, icon: Award, color: 'bg-purple-500', to: '/create' }
  ];
  
  const latestCertificates = certificates
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);
  
  const handleDownloadAll = async () => {
    try {
      await downloadAllCertificatesAsPDF(certificates, recipients, templates);
    } catch (error) {
      console.error('Error al descargar los certificados:', error);
      alert('Hubo un error al descargar los certificados. Por favor, inténtelo de nuevo.');
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel Principal</h1>
          <p className="mt-2 text-lg text-gray-600">
            Gestiona tus certificados y genera nuevos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {certificates.length > 0 && (
            <button
              onClick={handleDownloadAll}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar todos los PDF
            </button>
          )}
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Award className="mr-2 h-4 w-4" aria-hidden="true" />
            Crear Certificado
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Link 
            key={stat.name}
            to={stat.to}
            className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{stat.count}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <div className="font-medium text-blue-600 hover:text-blue-500 inline-flex items-center">
                  Ver todos
                  <ChevronRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Certificados Recientes</h2>
          <Link
            to="/create"
            className="text-sm font-medium text-blue-600 hover:text-blue-500 inline-flex items-center"
          >
            Ver todos
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="border-t border-gray-200">
          {latestCertificates.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {latestCertificates.map((certificate) => {
                const recipient = recipients.find(r => r.id === certificate.recipientId);
                const template = templates.find(t => t.id === certificate.templateId);
                
                return (
                  <li key={certificate.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <Award className="h-5 w-5 text-blue-500 mr-3" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {recipient?.name || 'Destinatario Desconocido'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              ID: {certificate.id}
                            </p>
                          </div>
                        </div>
                        <div className="ml-2 flex items-center space-x-4">
                          <button
                            onClick={() => handleDownloadAll()}
                            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </button>
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {certificate.status === 'published' ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <FileText className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            {template?.name || 'Plantilla Desconocida'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            {new Date(certificate.issueDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-6">
              <Award className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay certificados aún</h3>
              <p className="mt-1 text-sm text-gray-500">
                Comienza creando un nuevo certificado.
              </p>
              <div className="mt-6">
                <Link
                  to="/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Award className="mr-2 h-4 w-4" aria-hidden="true" />
                  Crear Certificado
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;