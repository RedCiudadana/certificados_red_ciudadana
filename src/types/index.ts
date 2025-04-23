export interface Recipient {
  id: string;
  name: string;
  email?: string;
  course?: string;
  issueDate: string;
  customFields?: Record<string, string>;
}

export interface Certificate {
  id: string;
  recipientId: string;
  templateId: string;
  qrCodeUrl: string;
  issueDate: string;
  verificationUrl: string;
  status: 'draft' | 'published';
}

export interface Template {
  id: string;
  name: string;
  imageUrl: string;
  fields: TemplateField[];
  width?: number; // Width of the template in pixels
  height?: number; // Height of the template in pixels
}

export interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'qrcode';
  x: number;
  y: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  defaultValue?: string;
}

export interface CertificateCollection {
  id: string;
  name: string;
  description?: string;
  templateId: string;
  certificates: Certificate[];
  createdAt: string;
}