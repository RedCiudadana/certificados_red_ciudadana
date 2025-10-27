import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Template, Recipient } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const BUCKET_NAME = 'certificates';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function uploadCertificatePDF(
  certificateCode: string,
  pdfBlob: Blob
): Promise<string> {
  const fileName = `${certificateCode}.pdf`;
  const filePath = `${fileName}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const formData = new FormData();
      formData.append('file', pdfBlob, fileName);

      const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${filePath}`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        if (response.status === 409) {
          console.log(`File ${fileName} already exists, updating...`);
          const updateResponse = await fetch(
            `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${filePath}`,
            {
              method: 'PUT',
              headers: {
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
              },
              body: formData,
            }
          );

          if (!updateResponse.ok) {
            throw new Error(`Failed to update file: ${await updateResponse.text()}`);
          }
        } else {
          throw new Error(`Upload failed: ${errorText}`);
        }
      }

      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
      console.log(`Certificate PDF uploaded successfully: ${publicUrl}`);
      return publicUrl;

    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error);

      if (attempt === MAX_RETRIES) {
        throw new Error(`Failed to upload certificate after ${MAX_RETRIES} attempts: ${error}`);
      }

      await sleep(RETRY_DELAY * attempt);
    }
  }

  throw new Error('Unexpected error in uploadCertificatePDF');
}

export function getCertificatePDFUrl(certificateCode: string): string {
  const fileName = `${certificateCode}.pdf`;
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;
}

export async function downloadCertificatePDF(certificateCode: string, recipientName?: string): Promise<void> {
  const url = getCertificatePDFUrl(certificateCode);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download certificate: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;

    const fileName = recipientName
      ? `${recipientName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate.pdf`
      : `${certificateCode}.pdf`;

    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    console.log(`Certificate ${certificateCode} downloaded successfully`);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    throw error;
  }
}

export async function deleteCertificatePDF(certificateCode: string): Promise<void> {
  const fileName = `${certificateCode}.pdf`;
  const filePath = `${fileName}`;

  try {
    const response = await fetch(
      `${supabaseUrl}/storage/v1/object/${BUCKET_NAME}/${filePath}`,
      {
        method: 'DELETE',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
      }
    );

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete certificate: ${await response.text()}`);
    }

    console.log(`Certificate ${certificateCode} deleted successfully`);
  } catch (error) {
    console.error('Error deleting certificate:', error);
    throw error;
  }
}

export async function generateAndUploadCertificatePDF(
  certificateCode: string,
  template: Template,
  recipient: Recipient
): Promise<string> {
  try {
    const certificateDiv = document.createElement('div');
    certificateDiv.style.width = '1200px';
    certificateDiv.style.height = '848px';
    certificateDiv.style.position = 'relative';
    certificateDiv.style.backgroundColor = 'white';

    const backgroundImg = document.createElement('img');
    backgroundImg.src = template.imageUrl;
    backgroundImg.crossOrigin = 'anonymous';
    backgroundImg.style.position = 'absolute';
    backgroundImg.style.top = '0';
    backgroundImg.style.left = '0';
    backgroundImg.style.width = '100%';
    backgroundImg.style.height = '100%';
    backgroundImg.style.objectFit = 'cover';
    backgroundImg.style.zIndex = '0';
    certificateDiv.appendChild(backgroundImg);

    await new Promise((resolve, reject) => {
      if (backgroundImg.complete) return resolve(void 0);
      backgroundImg.onload = () => resolve(void 0);
      backgroundImg.onerror = () => reject(new Error('Failed to load template image'));
      setTimeout(() => reject(new Error('Template image load timeout')), 10000);
    });

    template.fields.forEach(field => {
      if (field.type === 'qrcode') return;

      const fieldDiv = document.createElement('div');
      fieldDiv.style.position = 'absolute';
      fieldDiv.style.left = `${field.x}%`;
      fieldDiv.style.top = `${field.y}%`;
      fieldDiv.style.transform = 'translate(-50%, -50%)';
      fieldDiv.style.textAlign = 'center';
      fieldDiv.style.width = '100%';
      fieldDiv.style.maxWidth = '80%';
      fieldDiv.style.fontFamily = field.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      fieldDiv.style.fontSize = `${(field.fontSize || 16)}px`;
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

    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'fixed';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '1200px';
    tempContainer.style.height = '848px';
    tempContainer.style.backgroundColor = 'white';
    document.body.appendChild(tempContainer);
    tempContainer.appendChild(certificateDiv);

    await new Promise(resolve => setTimeout(resolve, 500));

    const canvas = await html2canvas(certificateDiv, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: 1200,
      height: 848,
      foreignObjectRendering: false,
      imageTimeout: 15000
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const scale = Math.max(pageW / imgProps.width, pageH / imgProps.height);
    const drawW = imgProps.width * scale;
    const drawH = imgProps.height * scale;
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);

    const pdfBlob = pdf.output('blob');

    document.body.removeChild(tempContainer);

    const publicUrl = await uploadCertificatePDF(certificateCode, pdfBlob);

    return publicUrl;

  } catch (error) {
    console.error('Error generating and uploading certificate:', error);
    throw error;
  }
}

export async function checkCertificatePDFExists(certificateCode: string): Promise<boolean> {
  const url = getCertificatePDFUrl(certificateCode);

  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}
