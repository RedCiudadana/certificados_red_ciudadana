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
      color: 'from-gray-500 to-gray-600', 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      to: '/dashboard/templates',
      description: 'Diseños disponibles'
    },
    { 
      name: 'Destinatarios', 
      count: recipients.length, 
      icon: Users, 
      color: 'from-gray-500 to-gray-600', 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      to: '/dashboard/recipients',
      description: 'Personas registradas'
    },
    { 
      name: 'Certificados', 
      count: certificates.length, 
      icon: Award, 
      color: 'from-gray-500 to-gray-600', 
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      to: '/dashboard/certificates',
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
      <div className="relative overflow-hidden rounded-2xl shadow-xl" style={{ backgroundColor: '#232831' }}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative px-8 py-12">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                ¡Bienvenido a CertifyPro! 
              </h1>
              <p className="text-xl text-gray-100">
                Gestiona tus certificados y genera nuevos de manera profesional
              </p>
            </div>
            <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              {certificates.length > 0 && (
                <button
                  onClick={handleDownloadAll}
                  className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Descargar todos los PDF
                </button>
              )}
              <Link
                to="/verify"
                className="inline-flex items-center px-6 py-3 bg-white bg-opacity-20 backdrop-blur-sm text-white text-sm font-medium rounded-xl hover:bg-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield className="mr-2 h-5 w-5" />
                Verificar Certificado
              </Link>
              <Link
                to="/dashboard/create"
                className="inline-flex items-center px-6 py-3 bg-white text-sm font-medium rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                style={{ color: '#232831' }}
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
            className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex-shrink-0 rounded-xl p-3 shadow-lg`} style={{ backgroundColor: "#232831" }}>
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900">{stat.count}</div>
                  <div className="text-sm text-gray-500">{stat.description}</div>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900">{stat.name}</h3>
                <div className="mt-2 flex items-center group-hover:text-gray-700 transition-colors" style={{ color: "#232831" }}>
                  <span className="text-sm font-medium">Ver todos</span>
                  <ChevronRight className="ml-1 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} style={{ backgroundColor: "#232831" }}></div>
          </Link>
        ))}
      </div>

      {/* Quick insights */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: "#232831" }}>
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8" style={{ color: "#232831" }} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Actividad Reciente</p>
              <p className="text-2xl font-bold text-gray-900">{recentActivity}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: "#232831" }}>
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8" style={{ color: "#232831" }} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4" style={{ borderColor: "#232831" }}>
          <div className="flex items-center">
            <Clock className="h-8 w-8" style={{ color: "#232831" }} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Último Certificado</p>
              <p className="text-sm font-bold text-gray-900">
                {latestCertificates.length > 0 
                  ? new Date(latestCertificates[0].issueDate).toLocaleDateString('es-ES')
                  : 'Ninguno'
                }
              </p>
            </div>
          </div>
        </div>
      </div> */}
      
      {/* Enhanced recent certificates section */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Certificados Recientes</h2>
            <p className="text-gray-600 mt-1">Últimos certificados generados</p>
          </div>
          <Link
            to="/dashboard/certificates"
            className="inline-flex items-center text-white px-4 py-2 text-sm font-medium rounded-xl hover:opacity-90 transition-colors duration-200 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: "#232831" }}
          >
            Ver todos
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div>
          {latestCertificates.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {latestCertificates.map((certificate) => {
                const recipient = recipients.find(r => r.id === certificate.recipientId);
                const template = templates.find(t => t.id === certificate.templateId);
                
                return (
                  <li key={certificate.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="px-6 py-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: "#232831" }}>
                            <Award className="h-6 w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-gray-900 truncate">
                              {recipient?.name || 'Destinatario Desconocido'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {recipient?.course || 'Sin curso especificado'}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">
                              {new Date(certificate.issueDate).toLocaleDateString('es-ES')}
                            </p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {certificate.status === 'published' ? 'Publicado' : 'Borrador'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownloadAll()}
                            className="inline-flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200"
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
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Award className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay certificados aún</h3>
              <p className="text-gray-500 mb-6">
                Comienza creando un nuevo certificado.
              </p>
              <Link
                to="/dashboard/create"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white text-sm font-medium rounded-xl hover:from-gray-700 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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