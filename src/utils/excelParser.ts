import * as XLSX from 'xlsx';
import { Recipient } from '../types';

interface ParseOptions {
  nameField?: string;
  emailField?: string;
  courseField?: string;
  dateField?: string;
}

/**
 * Parse Excel file and convert to recipient data
 */
export const parseExcelFile = (file: File, options: ParseOptions = {}): Promise<Omit<Recipient, 'id'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        if (!event.target?.result) {
          reject(new Error('Failed to read file'));
          return;
        }
        
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map to Recipient format
        const {
          nameField = 'name',
          emailField = 'email',
          courseField = 'course',
          dateField = 'date'
        } = options;
        
        const recipients = jsonData.map((row: any) => {
          const customFields: Record<string, string> = {};
          
          // Extract known fields
          const name = row[nameField] || '';
          const email = row[emailField] || '';
          const course = row[courseField] || '';
          const date = row[dateField] ? new Date(row[dateField]).toISOString() : new Date().toISOString();
          
          // Extract other fields as custom fields
          Object.keys(row).forEach(key => {
            if (![nameField, emailField, courseField, dateField].includes(key)) {
              customFields[key] = String(row[key]);
            }
          });
          
          return {
            name,
            email,
            course,
            issueDate: date,
            customFields: Object.keys(customFields).length > 0 ? customFields : undefined
          };
        });
        
        resolve(recipients);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generate Excel template with sample data
 */
export const generateExcelTemplate = (): Uint8Array => {
  const worksheet = XLSX.utils.json_to_sheet([
    { name: 'John Doe', email: 'john@example.com', course: 'Web Development', date: '2023-01-15' },
    { name: 'Jane Smith', email: 'jane@example.com', course: 'Data Science', date: '2023-02-20' }
  ]);
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients');
  
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
};