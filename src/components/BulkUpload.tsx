import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useCertificateStore } from '../store/certificateStore';

interface BulkUploadProps {
  onUploaded: (recipientIds: string[]) => void;
}

interface PreviewData {
  name: string;
  email?: string;
  course?: string;
  issueDate: string;
  [key: string]: any;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onUploaded }) => {
  const { addRecipients, templates, currentTemplateId } = useCertificateStore();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<PreviewData[]>([]);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);

  const processExcelFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setPreview([]);
    setUploadComplete(false);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      if (!workbook.SheetNames.length) {
        throw new Error('The Excel file is empty');
      }
      
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as PreviewData[];
      
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error('No data found in the uploaded file');
      }
      
      setTotalRecords(jsonData.length);
      
      // Validate required fields - only check for name
      const missingFields: string[] = [];
      jsonData.forEach((row, index) => {
        if (!row.name && !row.Name && !row.NAME) {
          missingFields.push(`Name missing in row ${index + 1}`);
        }
      });
      
      if (missingFields.length > 0) {
        throw new Error(`Validation errors:\n${missingFields.join('\n')}`);
      }
      
      // Process and format data
      const formattedData = jsonData.map(row => ({
        name: String(row.name || row.Name || row.NAME || '').trim(),
        email: String(row.email || row.Email || row.EMAIL || '').trim(),
        course: String(row.course || row.Course || row.COURSE || row.curso || row.Curso || '').trim(),
        issueDate: row.issueDate || row.IssueDate || row.date || row.Date || row.fecha || row.Fecha 
          ? new Date(row.issueDate || row.IssueDate || row.date || row.Date || row.fecha || row.Fecha).toISOString() 
          : new Date().toISOString(),
        customFields: Object.entries(row)
          .filter(([key]) => !['name', 'Name', 'NAME', 'email', 'Email', 'EMAIL', 'course', 'Course', 'COURSE', 'curso', 'Curso', 'issueDate', 'IssueDate', 'date', 'Date', 'fecha', 'Fecha'].includes(key))
          .reduce((acc, [key, value]) => ({
            ...acc,
            [key]: String(value)
          }), {})
      }));
      
      // Update preview with first 5 entries
      setPreview(formattedData.slice(0, 5));
      
      // Add recipients and get their IDs
      const recipientIds = addRecipients(formattedData);
      
      // Call onUploaded with the recipient IDs
      onUploaded(recipientIds);
      
      // Only set upload complete after recipients are added
      setUploadComplete(true);
      
    } catch (err) {
      console.error('Error processing file:', err);
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [addRecipients, onUploaded]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processExcelFile(file);
    }
  }, [processExcelFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    multiple: false
  });

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        name: 'Juan Pérez',
        email: 'juan@ejemplo.com',
        course: 'Desarrollo Web',
        issueDate: new Date().toISOString().split('T')[0]
      },
      {
        name: 'María García',
        email: 'maria@ejemplo.com',
        course: 'Ciencia de Datos',
        issueDate: new Date().toISOString().split('T')[0]
      }
    ]);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Recipients');
    XLSX.writeFile(wb, 'plantilla-destinatarios-certificados.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        {!uploadComplete ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <Upload
                className={`mx-auto h-12 w-12 ${
                  isDragActive ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
              <div className="space-y-1">
                <p className="text-base font-medium text-gray-900">
                  {isDragActive
                    ? 'Drop the Excel file here'
                    : 'Upload your Excel file'}
                </p>
                <p className="text-sm text-gray-500">
                  Drag and drop your Excel file here, or click to select a file
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadTemplate();
                }}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download Template
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-6 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-lg font-medium text-green-900">Upload Complete!</h3>
            <p className="mt-1 text-sm text-green-700">
              Successfully processed {totalRecords} recipient{totalRecords !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
              <span className="text-blue-600">Processing file...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error processing file
                </h3>
                <div className="text-sm text-red-700 mt-1 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {preview.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Preview (first 5 entries)
            </h4>
            <div className="bg-white shadow overflow-hidden rounded-md">
              <ul className="divide-y divide-gray-200">
                {preview.map((row, index) => (
                  <li key={index} className="px-4 py-3">
                    <div className="flex items-center space-x-4">
                      <FileSpreadsheet className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {row.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {row.email || 'No email'} • {row.course || 'No course'}
                        </p>
                      </div>
                <li>Columnas requeridas: name (o Name, NAME)</li>
                <li>Columnas opcionales: email, course (o curso), issueDate (o date, fecha)</li>
                <li>Cualquier columna adicional se guardará como campo personalizado</li>
                <li>El sistema detecta automáticamente variaciones en mayúsculas/minúsculas</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 -mx-6 -mb-6 px-6 py-4">
        <div className="text-sm">
          <h4 className="font-medium text-gray-900">File requirements:</h4>
          <ul className="mt-2 text-gray-600 list-disc list-inside space-y-1">
            <li>Excel file format (.xlsx or .xls)</li>
            <li>Required columns: name</li>
            <li>Optional columns: email, course, issueDate</li>
            <li>Any additional columns will be stored as custom fields</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;