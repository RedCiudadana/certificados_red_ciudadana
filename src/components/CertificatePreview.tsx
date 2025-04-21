import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Template, Recipient } from '../types';
import { generateCertificatePDF, generateCertificateImage } from '../utils/certificateGenerator';
import { Download, FileImage } from 'lucide-react';

interface CertificatePreviewProps {
  template: Template;
  recipient: Recipient;
  qrCodeUrl: string;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  template,
  recipient,
  qrCodeUrl
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadPDF = async () => {
    if (certificateRef.current) {
      await generateCertificatePDF(
        certificateRef.current, 
        `${recipient.name.replace(/\s+/g, '-')}-certificate`
      );
    }
  };
  
  const handleDownloadImage = async () => {
    if (certificateRef.current) {
      await generateCertificateImage(
        certificateRef.current, 
        `${recipient.name.replace(/\s+/g, '-')}-certificate`
      );
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const renderField = (field: Template['fields'][0]) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${field.x}%`,
      top: `${field.y}%`,
      transform: 'translate(-50%, -50%)',
      fontFamily: field.fontFamily || 'serif',
      fontSize: `${field.fontSize || 16}px`,
      color: field.color || '#000',
      textAlign: 'center',
      width: '100%',
      maxWidth: '80%',
      wordWrap: 'break-word'
    };

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
        
        return (
          <div
            key={field.id}
            style={style}
          >
            {textValue}
          </div>
        );
        
      case 'date':
        return (
          <div
            key={field.id}
            style={style}
          >
            {formatDate(recipient.issueDate)}
          </div>
        );
        
      case 'qrcode':
        return (
          <div
            key={field.id}
            style={{
              ...style,
              width: 'auto',
              maxWidth: 'none',
              backgroundColor: '#fff',
              padding: '5px',
              borderRadius: '4px'
            }}
          >
            <QRCodeSVG
              value={qrCodeUrl}
              size={100}
              bgColor="#ffffff"
              fgColor="#000000"
              level="L"
              includeMargin={false}
            />
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Certificate Preview</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleDownloadPDF}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </button>
            <button
              onClick={handleDownloadImage}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileImage className="h-4 w-4 mr-1" />
              PNG
            </button>
          </div>
        </div>
        
        <div 
          ref={certificateRef}
          className="relative w-full rounded overflow-hidden certificate-preview bg-white"
          style={{ 
            height: '500px',
            margin: '0 auto'
          }}
        >
          <img
            src={template.imageUrl}
            alt="Certificate template"
            className="w-full h-full object-contain"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
          {template.fields.map(renderField)}
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;