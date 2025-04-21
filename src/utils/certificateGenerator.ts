import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Certificate, Recipient, Template } from '../types';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';

export const generateStaticSite = (
  certificates: Certificate[],
  recipients: Recipient[],
  templates: Template[]
): Record<string, string> => {
  const files: Record<string, string> = {};
  
  // Generate main index.html
  files['index.html'] = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-3xl mx-auto">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                    <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">
                        Certificate Verification
                    </h1>
                    <div class="mt-5">
                        <form id="verifyForm" class="space-y-4">
                            <div>
                                <label for="certificateId" class="block text-sm font-medium text-gray-700">
                                    Enter Certificate ID
                                </label>
                                <div class="mt-1">
                                    <input type="text" name="certificateId" id="certificateId"
                                        class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Enter the certificate ID">
                                </div>
                            </div>
                            <button type="submit"
                                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Verify Certificate
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.getElementById('verifyForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const certificateId = document.getElementById('certificateId').value;
            window.location.href = '/verify/' + certificateId + '.html';
        });
    </script>
</body>
</html>`;

  // Generate individual verification pages
  certificates.forEach(certificate => {
    const recipient = recipients.find(r => r.id === certificate.recipientId);
    const template = templates.find(t => t.id === certificate.templateId);
    
    if (recipient && template) {
      files[`verify/${certificate.id}.html`] = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification - ${recipient.name}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-3xl mx-auto">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                    <div class="sm:flex sm:items-center sm:justify-between">
                        <h1 class="text-3xl font-bold text-gray-900">
                            Certificate Verification
                        </h1>
                        <div class="mt-3 sm:mt-0 sm:ml-4">
                            <a href="/"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Verify Another
                            </a>
                        </div>
                    </div>
                    <div class="mt-8">
                        <div class="rounded-md bg-green-50 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-green-800">
                                        Valid Certificate
                                    </h3>
                                    <div class="mt-2 text-sm text-green-700">
                                        <p>This is a valid certificate issued to ${recipient.name}.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-6 border-t border-gray-200 pt-6">
                            <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div class="sm:col-span-1">
                                    <dt class="text-sm font-medium text-gray-500">Recipient Name</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${recipient.name}</dd>
                                </div>
                                <div class="sm:col-span-1">
                                    <dt class="text-sm font-medium text-gray-500">Issue Date</dt>
                                    <dd class="mt-1 text-sm text-gray-900">
                                        ${new Date(recipient.issueDate).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                    </dd>
                                </div>
                                ${recipient.course ? `
                                <div class="sm:col-span-2">
                                    <dt class="text-sm font-medium text-gray-500">Course</dt>
                                    <dd class="mt-1 text-sm text-gray-900">${recipient.course}</dd>
                                </div>
                                ` : ''}
                                <div class="sm:col-span-2">
                                    <dt class="text-sm font-medium text-gray-500">Certificate ID</dt>
                                    <dd class="mt-1 text-sm text-gray-900 font-mono">${certificate.id}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }
  });
  
  // Generate 404 page for invalid certificate IDs
  files['404.html'] = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Not Found</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="max-w-3xl mx-auto">
            <div class="bg-white shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:p-6">
                    <div class="sm:flex sm:items-center sm:justify-between">
                        <h1 class="text-3xl font-bold text-gray-900">
                            Certificate Not Found
                        </h1>
                        <div class="mt-3 sm:mt-0 sm:ml-4">
                            <a href="/"
                                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Try Again
                            </a>
                        </div>
                    </div>
                    <div class="mt-8">
                        <div class="rounded-md bg-red-50 p-4">
                            <div class="flex">
                                <div class="flex-shrink-0">
                                    <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                                    </svg>
                                </div>
                                <div class="ml-3">
                                    <h3 class="text-sm font-medium text-red-800">
                                        Invalid Certificate
                                    </h3>
                                    <div class="mt-2 text-sm text-red-700">
                                        <p>The certificate ID you provided is not valid or does not exist.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

  return files;
};

export const generateCertificatePDF = async (
  certificateRef: HTMLElement,
  filename: string = 'certificate'
): Promise<void> => {
  try {
    const canvas = await html2canvas(certificateRef, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Hubo un error al generar el PDF. Por favor, inténtelo de nuevo.');
  }
};

export const downloadAllCertificatesAsPDF = async (
  certificates: Certificate[],
  recipients: Recipient[],
  templates: Template[]
): Promise<void> => {
  try {
    const zip = new JSZip();
    
    // Create a temporary container for rendering certificates
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    for (const certificate of certificates) {
      const recipient = recipients.find(r => r.id === certificate.recipientId);
      const template = templates.find(t => t.id === certificate.templateId);
      
      if (recipient && template) {
        // Clear previous certificate
        container.innerHTML = '';
        
        // Create certificate preview
        const certificateDiv = document.createElement('div');
        certificateDiv.className = 'certificate-preview';
        certificateDiv.style.width = '800px';
        certificateDiv.style.height = '566px';
        certificateDiv.style.position = 'relative';
        certificateDiv.style.backgroundColor = 'white';
        
        // Add template image
        const img = document.createElement('img');
        img.src = template.imageUrl;
        img.alt = 'Certificate template';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        certificateDiv.appendChild(img);
        
        // Wait for image to load
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          setTimeout(resolve, 5000);
        });
        
        // Add fields
        template.fields.forEach(field => {
          const fieldDiv = document.createElement('div');
          fieldDiv.style.position = 'absolute';
          fieldDiv.style.left = `${field.x}%`;
          fieldDiv.style.top = `${field.y}%`;
          fieldDiv.style.transform = 'translate(-50%, -50%)';
          fieldDiv.style.textAlign = 'center';
          fieldDiv.style.width = '100%';
          fieldDiv.style.maxWidth = '80%';
          fieldDiv.style.fontFamily = field.fontFamily || 'serif';
          fieldDiv.style.fontSize = `${field.fontSize || 16}px`;
          fieldDiv.style.color = field.color || '#000';
          
          switch (field.type) {
            case 'text':
              let textValue = '';
              if (field.name === 'recipient') {
                textValue = recipient.name;
              } else if (field.name === 'course') {
                textValue = recipient.course || field.defaultValue || '';
              } else if (recipient.customFields && recipient.customFields[field.name]) {
                textValue = recipient.customFields[field.name];
              } else {
                textValue = field.defaultValue || '';
              }
              fieldDiv.textContent = textValue;
              break;
              
            case 'date':
              fieldDiv.textContent = new Date(recipient.issueDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              break;
          }
          
          certificateDiv.appendChild(fieldDiv);
        });
        
        container.appendChild(certificateDiv);
        
        try {
          // Generate PDF for this certificate
          const canvas = await html2canvas(certificateDiv, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
          });

          const imgData = canvas.toDataURL('image/png');
          
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
          });
          
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          
          const pdfBlob = pdf.output('blob');
          const fileName = `${recipient.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate.pdf`;
          zip.file(fileName, pdfBlob);
        } catch (error) {
          console.error(`Error generating PDF for ${recipient.name}:`, error);
        }
      }
    }
    
    // Remove temporary container
    document.body.removeChild(container);
    
    // Generate and download zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'certificates.zip');
    
  } catch (error) {
    console.error('Error generating certificates:', error);
    throw new Error('Hubo un error al generar los certificados. Por favor, inténtelo de nuevo.');
  }
};

export const generateCertificateImage = async (
  certificateRef: HTMLElement,
  filename: string = 'certificate'
): Promise<void> => {
  try {
    const dataUrl = await toPng(certificateRef, { quality: 0.95 });
    
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    saveAs(blob, `${filename}.png`);
  } catch (error) {
    console.error('Error generating certificate image:', error);
    throw error;
  }
};