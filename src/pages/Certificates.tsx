import React, { useState, useMemo } from 'react';
import { Download, ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import { generateCertificatePDF, downloadAllCertificatesAsPDF } from '../utils/certificateGenerator';

const Certificates: React.FC = () => {
  const { certificates, recipients, templates } = useCertificateStore();
  const [sortField, setSortField] = useState<'course' | 'name' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [groupByCourse, setGroupByCourse] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const filteredCertificates = useMemo(() => {
    return certificates.filter(certificate => {
      const recipient = recipients.find(r => r.id === certificate.recipientId);
      if (!recipient) return false;

      const searchLower = searchQuery.toLowerCase();
      return (
        recipient.name.toLowerCase().includes(searchLower) ||
        certificate.id.toLowerCase().includes(searchLower) ||
        (recipient.course || '').toLowerCase().includes(searchLower)
      );
    }).filter(cert => {
      const recipient = recipients.find(r => r.id === cert.recipientId);
      return recipient?.course === selectedCourse || selectedCourse === '';
    });
  }, [certificates, recipients, searchQuery, selectedCourse]);

  const sortedCertificates = useMemo(() => {
    return [...filteredCertificates].sort((a, b) => {
      const recipientA = recipients.find(r => r.id === a.recipientId);
      const recipientB = recipients.find(r => r.id === b.recipientId);

      if (!recipientA || !recipientB) return 0;

      let comparison = 0;
      switch (sortField) {
        case 'course':
          comparison = (recipientA.course || '').localeCompare(recipientB.course || '');
          break;
        case 'name':
          comparison = recipientA.name.localeCompare(recipientB.name);
          break;
        case 'date':
          comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime();
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredCertificates, recipients, sortField, sortDirection]);

  const groupedCertificates = useMemo(() => {
    if (!groupByCourse) return { 'All Certificates': sortedCertificates };

    return sortedCertificates.reduce((groups, certificate) => {
      const recipient = recipients.find(r => r.id === certificate.recipientId);
      const course = recipient?.course || 'Uncategorized';

      if (!groups[course]) {
        groups[course] = [];
      }
      groups[course].push(certificate);
      return groups;
    }, {} as Record<string, typeof certificates>);
  }, [sortedCertificates, recipients, groupByCourse]);

  const totalPages = Math.ceil(sortedCertificates.length / itemsPerPage);

  const paginatedCertificates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    if (!groupByCourse) {
      return {
        'All Certificates': sortedCertificates.slice(start, end)
      };
    }

    return Object.entries(groupedCertificates).reduce((acc, [group, certs]) => {
      acc[group] = certs.slice(start, end);
      return acc;
    }, {} as Record<string, typeof certificates>);
  }, [groupedCertificates, currentPage, itemsPerPage, groupByCourse, sortedCertificates]);

  const handleDownloadPDF = async (certificateId: string) => {
    const certificate = certificates.find(c => c.id === certificateId);
    const recipient = recipients.find(r => r.id === certificate?.recipientId);
    const template = templates.find(t => t.id === certificate?.templateId);

    if (!certificate || !recipient || !template) return;

    let tempContainer: HTMLDivElement | null = null;

    try {
      // Create certificate element
      const certificateDiv = document.createElement('div');
      certificateDiv.style.position = 'relative';
      certificateDiv.style.width = '1200px';
      certificateDiv.style.height = '848px';
      certificateDiv.style.backgroundColor = 'white';
      certificateDiv.style.backgroundImage = `url(${template.imageUrl})`;
      certificateDiv.style.backgroundSize = 'cover';
      certificateDiv.style.backgroundPosition = 'center';
      certificateDiv.style.backgroundRepeat = 'no-repeat';

      // Add text fields
      template.fields.forEach(field => {
        if (field.type === 'qrcode') return; // Skip QR code for PDF
        
        const fieldDiv = document.createElement('div');
        fieldDiv.style.position = 'absolute';
        fieldDiv.style.left = `${field.x}%`;
        fieldDiv.style.top = `${field.y}%`;
        fieldDiv.style.transform = 'translate(-50%, -50%)';
        fieldDiv.style.textAlign = 'center';
        fieldDiv.style.fontFamily = field.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        fieldDiv.style.fontSize = `${(field.fontSize || 16) * 2}px`; // Scale up for better quality
        // Color alineado al masivo
        fieldDiv.style.color = field.color || '#000';
        fieldDiv.style.fontWeight = 'bold';
        fieldDiv.style.textShadow = '2px 2px 4px rgba(255,255,255,0.8)';
        fieldDiv.style.whiteSpace = 'nowrap';
        fieldDiv.style.zIndex = '10';

        let textValue = '';
        switch (field.type) {
          case 'text':
            if (field.name === 'recipient') {
              textValue = recipient.name;
            } else if (field.name === 'course') {
              textValue = recipient.course || field.defaultValue || '';
            } else if (recipient.customFields && recipient.customFields[field.name]) {
              textValue = recipient.customFields[field.name];
            } else {
              textValue = field.defaultValue || '';
            }
            break;

          case 'date':
            textValue = new Date(recipient.issueDate).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            break;
        }

        fieldDiv.textContent = textValue;
        certificateDiv.appendChild(fieldDiv);
      });

      // Create temporary container and attach to DOM
      tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '1200px';
      tempContainer.style.height = '848px';
      document.body.appendChild(tempContainer);
      tempContainer.appendChild(certificateDiv);

      // Generate PDF
      const fileName = `${recipient.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate`;
      await generateCertificatePDF(certificateDiv, fileName);

    } catch (error) {
      console.error('Error downloading certificate:', error);
      alert('Error al descargar el certificado. Por favor, inténtelo de nuevo.');
    } finally {
      // Clean up temporary container
      if (tempContainer && tempContainer.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer);
      }
    }
  };

  const toggleCertificateSelection = (certificateId: string) => {
    setSelectedCertificates(prev =>
      prev.includes(certificateId)
        ? prev.filter(id => id !== certificateId)
        : [...prev, certificateId]
    );
  };

  const handleDownloadSelected = async () => {
    setIsDownloading(true);
    const certsToDownload = certificates.filter(cert =>
      selectedCertificates.includes(cert.id)
    );  
    if (certsToDownload.length === 0) return;
    await downloadAllCertificatesAsPDF(certsToDownload, recipients, templates);
    setIsDownloading(false);
  };

  const areAllVisibleSelected = () => {
    return Object.values(paginatedCertificates).flat().every(cert => selectedCertificates.includes(cert.id));
  };
  
  const toggleSelectAllVisible = () => {
    const allVisible = Object.values(paginatedCertificates).flat();
    if (areAllVisibleSelected()) {
      // Deselecciona todos
      setSelectedCertificates(prev =>
        prev.filter(id => !allVisible.some(cert => cert.id === id))
      );
    } else {
      // Agrega todos los visibles
      setSelectedCertificates(prev => {
        const idsToAdd = allVisible.map(cert => cert.id).filter(id => !prev.includes(id));
        return [...prev, ...idsToAdd];
      });
    }
  };
  
  const areAllCertificatesSelected = () => {
    const allIds = sortedCertificates.map(cert => cert.id);
    return allIds.every(id => selectedCertificates.includes(id));
  };

  const toggleSelectAllAcrossAllPages = () => {
    if (selectedCertificates.length === sortedCertificates.length) {
      setSelectedCertificates([]);
    } else {
      const allIds = sortedCertificates.map(cert => cert.id);
      setSelectedCertificates(allIds);
    }
  };  

  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificados</h1>
          <p className="mt-2 text-lg text-gray-600">
            Gestiona todos los certificados generados
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            />
          </div>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={groupByCourse}
              onChange={(e) => setGroupByCourse(e.target.checked)}
              className="rounded border-gray-300 text-gray-600 shadow-sm focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50"
            />
            <span className="ml-2 text-sm text-gray-600">Agrupar por curso</span>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <button
          onClick={toggleSelectAllVisible}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          {areAllVisibleSelected() ? 'Deseleccionar todos de la página actual' : 'Seleccionar todos de la página actual'}
        </button>
        <button
          onClick={toggleSelectAllAcrossAllPages}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          {areAllCertificatesSelected() ? 'Deseleccionar todos' : 'Seleccionar todos'}
        </button>
        <button
          onClick={handleDownloadSelected}
          disabled={selectedCertificates.length === 0 || isDownloading}
          className={`px-4 py-2 rounded text-white
                      ${isDownloading ? 'bg-gray-300 cursor-wait' : 'bg-gray-600'}
                      disabled:opacity-50`}
        >
          {isDownloading ? 'Generando…' : 'Descargar certificados seleccionados'}
        </button>
      </div>

      {Object.entries(paginatedCertificates).map(([group, groupCertificates]) => (
        <div key={group} className="bg-white shadow-sm rounded-lg overflow-hidden">
          {groupByCourse && (
            <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{group}</h2>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('course')}
                  >
                    <div className="flex items-center">
                      Curso
                      {sortField === 'course' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Nombre
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupCertificates.map((certificate, index) => {
                  const recipient = recipients.find(r => r.id === certificate.recipientId);
                  if (!recipient) return null;

                  const absoluteIndex = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {absoluteIndex}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {recipient.course || '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {certificate.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {recipient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={selectedCertificates.includes(certificate.id)}
                          onChange={() => toggleCertificateSelection(certificate.id)}
                          className="mr-2"
                        />
                        <button
                          onClick={() => handleDownloadPDF(certificate.id)}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, sortedCertificates.length)}
                </span> de{' '}
                <span className="font-medium">{sortedCertificates.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-gray-50 border-gray-500 text-gray-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;