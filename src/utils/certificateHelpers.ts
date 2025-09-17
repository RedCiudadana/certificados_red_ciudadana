import { Certificate, Recipient } from '../types';
import { nanoid } from 'nanoid';

/**
 * Helper functions for creating certificates and recipients programmatically
 */

/**
 * Create a recipient with default values
 */
export const createRecipient = (
  name: string,
  email?: string,
  course?: string,
  customFields?: Record<string, string>
): Omit<Recipient, 'id'> => ({
  name,
  email: email || '',
  course: course || '',
  issueDate: new Date().toISOString(),
  customFields: customFields || {}
});

/**
 * Create multiple recipients from an array of data
 */
export const createMultipleRecipients = (
  recipientsData: Array<{
    name: string;
    email?: string;
    course?: string;
    customFields?: Record<string, string>;
    issueDate?: string;
  }>
): Omit<Recipient, 'id'>[] => {
  return recipientsData.map(data => ({
    name: data.name,
    email: data.email || '',
    course: data.course || '',
    issueDate: data.issueDate || new Date().toISOString(),
    customFields: data.customFields || {}
  }));
};

/**
 * Generate a certificate ID with custom format
 */
export const generateCertificateId = (
  prefix = 'CERT',
  year?: number,
  sequence?: number
): string => {
  const currentYear = year || new Date().getFullYear();
  const seq = sequence || Math.floor(Math.random() * 9999) + 1;
  return `${prefix}-${currentYear}-${seq.toString().padStart(3, '0')}`;
};

/**
 * Create a certificate with custom ID format
 */
export const createCertificate = (
  recipientId: string,
  templateId: string,
  customId?: string
): Omit<Certificate, 'id'> => {
  const id = customId || generateCertificateId();
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const verificationUrl = `${baseUrl}/verify/${id}`;

  return {
    recipientId,
    templateId,
    qrCodeUrl: verificationUrl,
    issueDate: new Date().toISOString(),
    verificationUrl,
    status: 'published'
  };
};

/**
 * Predefined recipient templates for common use cases
 */
export const recipientTemplates = {
  student: (name: string, email: string, course: string) => createRecipient(
    name,
    email,
    course,
    {
      type: 'student',
      institution: 'Red Ciudadana',
      level: 'beginner'
    }
  ),

  professional: (name: string, email: string, certification: string) => createRecipient(
    name,
    email,
    certification,
    {
      type: 'professional',
      institution: 'Red Ciudadana',
      level: 'advanced',
      category: 'professional-development'
    }
  ),

  volunteer: (name: string, email: string, program: string, hours: string) => createRecipient(
    name,
    email,
    program,
    {
      type: 'volunteer',
      institution: 'Red Ciudadana',
      hours: hours,
      category: 'community-service'
    }
  ),

  workshop: (name: string, email: string, workshop: string, duration: string) => createRecipient(
    name,
    email,
    workshop,
    {
      type: 'workshop',
      institution: 'Red Ciudadana',
      duration: duration,
      category: 'workshop'
    }
  )
};

/**
 * Batch certificate generation
 */
export const generateBatchCertificates = (
  recipients: Array<{ name: string; email?: string; course?: string; customFields?: Record<string, string> }>,
  templateId: string,
  idPrefix?: string
): Array<{ recipient: Omit<Recipient, 'id'>; certificate: Omit<Certificate, 'id'> }> => {
  return recipients.map((recipientData, index) => {
    const recipient = createRecipient(
      recipientData.name,
      recipientData.email,
      recipientData.course,
      recipientData.customFields
    );

    const customId = idPrefix 
      ? `${idPrefix}-${(index + 1).toString().padStart(3, '0')}`
      : undefined;

    const certificate = createCertificate('', templateId, customId);

    return { recipient, certificate };
  });
};

/**
 * Common recipient datasets for testing
 */
export const sampleRecipients = {
  webDevelopment: [
    { name: 'Ana García', email: 'ana@example.com', course: 'Desarrollo Web Frontend' },
    { name: 'Carlos López', email: 'carlos@example.com', course: 'Desarrollo Web Frontend' },
    { name: 'María Rodríguez', email: 'maria@example.com', course: 'Desarrollo Web Frontend' }
  ],

  dataScience: [
    { name: 'Juan Pérez', email: 'juan@example.com', course: 'Ciencia de Datos' },
    { name: 'Laura Martínez', email: 'laura@example.com', course: 'Ciencia de Datos' },
    { name: 'Roberto Silva', email: 'roberto@example.com', course: 'Ciencia de Datos' }
  ],

  digitalCitizenship: [
    { name: 'Sofia Hernández', email: 'sofia@example.com', course: 'Ciudadanía Digital' },
    { name: 'Diego Morales', email: 'diego@example.com', course: 'Ciudadanía Digital' },
    { name: 'Valeria Castro', email: 'valeria@example.com', course: 'Ciudadanía Digital' }
  ]
};

/**
 * Validation helpers
 */
export const validationHelpers = {
  /**
   * Create certificates with easy-to-remember IDs for testing
   */
  createTestCertificates: () => [
    { id: '1234', name: 'Test User 1', course: 'Test Course 1' },
    { id: '5678', name: 'Test User 2', course: 'Test Course 2' },
    { id: 'DEMO', name: 'Demo User', course: 'Demo Course' },
    { id: 'TEST', name: 'Test Certificate', course: 'Test Validation' }
  ],

  /**
   * Generate certificates with sequential IDs
   */
  createSequentialCertificates: (count: number, prefix = 'SEQ') => {
    return Array.from({ length: count }, (_, i) => ({
      id: `${prefix}-${(i + 1).toString().padStart(4, '0')}`,
      name: `User ${i + 1}`,
      course: `Course ${i + 1}`
    }));
  }
};