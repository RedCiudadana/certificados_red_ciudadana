import React from 'react';
import { Link } from 'react-router-dom';
import { Award, FileSpreadsheet, FileText, Users, Download, ChevronRight, TrendingUp, Clock, CheckCircle, Plus, Shield, Search } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import { downloadAllCertificatesAsPDF } from '../utils/certificateGenerator';

const Dashboard: React.FC = () => {
  const { templates, recipients, certificates } = useCertificateStore();
  
  const stats = [
    { 
      name: 'Plantillas', 
      count: templates.length, 
      icon: FileText, 
      color: 'from-blue-500 to-blue-600', 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      to: '/templates',
      description: 'Diseños disponibles'
    },
    { 
      name: 'Destinatarios', 
      count: recipients.length, 
      icon: Users, 
      color: 'from-green-500 to-green-600', 
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      to: '/recipients',
      description: 'Personas registradas'
    },
    { 
      name: 'Certificados', 
      count: certificates.length, 
      icon: Award, 
      color: 'from-purple-500 to-purple-600', 
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      to: '/certificates',
      description: 'Certificados generados'
    }
  ];
  
  const latestCertificates = certificates
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

  const recentActivity = certificates.length > 0 ? certificates.length : 0;
  const completionRate = recipients.length > 0 ? Math.round((certificates.length / recipients.length) * 100) : 0;
  
  const handleDownloadAll = async () => {
    try {
      await downloadAllCertificatesAsPDF(certificates, recipients, templates);
    } catch (error) {
      console.error('Error al descargar los certificados:', error);
      alert('Hubo un error al descargar los certificados. Por favor, inténtelo de nuevo.');
    }
  };
  
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header with improved styling */}
      <div className="relative overflow-hidden bg-gray-900 rounded-2xl shadow-xl border border-gray-800">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-8 py-12">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ¡Bienvenido a CertifyPro! 
                <span className="inline-block ml-2 animate-bounce">🎓</span>
              </h1>
              <p className="text-xl text-blue-100">
                Gestiona tus certificados y genera nuevos de manera profesional
              </p>
            </div>
            <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {certificates.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="inline-flex items-center px-6 py-3 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 border border-gray-600"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar todos los PDF
                </button>
              )}
              <Link
                to="/verify"
                className="inline-flex items-center px-6 py-3 bg-gray-800 text-white text-sm font-medium rounded-xl hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-600"
              >
                <Shield className="mr-2 h-5 w-5" />
                Verificar Certificado
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center px-6 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                Crear Certificado
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced stats cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Link 
            key={stat.name}
            to={stat.to}
            className="group relative overflow-hidden bg-gray-900 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-800"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0 rounded-xl p-3 bg-white shadow-lg">
                  <stat.icon className="h-8 w-8 text-black" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">{stat.count}</div>
                  <div className="text-sm text-gray-400">{stat.description}</div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-white">{stat.name}</h3>
                <div className="mt-2 flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span className="text-sm font-medium text-gray-300 group-hover:text-white">Ver todos</span>
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Link>
        ))}
      </div>

      {/* Quick insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-white border border-gray-800">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Actividad Reciente</p>
              <p className="text-2xl font-bold text-white">{recentActivity}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-white border border-gray-800">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-white">{completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-white border border-gray-800">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-white" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Último Certificado</p>
              <p className="text-sm font-bold text-white">
                {latestCertificates.length > 0 
                  ? new Date(latestCertificates[0].issueDate).toLocaleDateString('es-ES')
                  : 'Ninguno'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced recent certificates section */}
      <div className="bg-gray-900 shadow-lg rounded-2xl overflow-hidden border border-gray-800">
        <div className="px-6 py-6 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Certificados Recientes</h2>
            <p className="text-gray-400 mt-1">Últimos certificados generados</p>
          </div>
          <Link
            to="/certificates"
            className="inline-flex items-center px-4 py-2 bg-white text-black text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Ver todos
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div>
          {latestCertificates.length > 0 ? (
            <ul className="divide-y divide-gray-800">
              {latestCertificates.map((certificate) => {
                const recipient = recipients.find(r => r.id === certificate.recipientId);
                const template = templates.find(t => t.id === certificate.templateId);
                
                return (
                  <li key={certificate.id} className="hover:bg-gray-800 transition-colors duration-200">
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                            <Award className="h-6 w-6 text-black" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-white truncate">
                              {recipient?.name || 'Destinatario Desconocido'}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {recipient?.course || 'Sin curso especificado'}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-400">
                              {new Date(certificate.issueDate).toLocaleDateString('es-ES')}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-300">
                              {certificate.status === 'published' ? 'Publicado' : 'Borrador'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownloadAll()}
                            className="inline-flex items-center px-3 py-2 text-sm text-white hover:text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-200 border border-gray-600"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Descargar
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Award className="h-12 w-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No hay certificados aún</h3>
              <p className="text-gray-400 mb-6">
                Comienza creando un nuevo certificado.
              </p>
              <Link
                to="/create"
                className="inline-flex items-center px-6 py-3 bg-white text-black text-sm font-medium rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                Crear Primer Certificado
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;