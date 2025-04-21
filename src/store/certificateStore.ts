import { create } from 'zustand';
import { nanoid } from 'nanoid';
import { Template, Recipient, Certificate, CertificateCollection } from '../types';

interface CertificateState {
  templates: Template[];
  recipients: Recipient[];
  certificates: Certificate[];
  collections: CertificateCollection[];
  currentTemplateId: string | null;
  
  // Template actions
  addTemplate: (template: Omit<Template, 'id'>) => string;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  setCurrentTemplate: (id: string | null) => void;
  
  // Recipient actions
  addRecipient: (recipient: Omit<Recipient, 'id'>) => string;
  addRecipients: (recipients: Omit<Recipient, 'id'>[]) => string[];
  updateRecipient: (id: string, recipient: Partial<Recipient>) => void;
  deleteRecipient: (id: string) => void;
  
  // Certificate actions
  generateCertificate: (recipientId: string, templateId: string) => string;
  generateBulkCertificates: (recipientIds: string[], templateId: string) => string[];
  updateCertificate: (id: string, certificate: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  
  // Collection actions
  createCollection: (name: string, templateId: string, description?: string) => string;
  updateCollection: (id: string, collection: Partial<CertificateCollection>) => void;
  deleteCollection: (id: string) => void;
  addCertificatesToCollection: (collectionId: string, certificateIds: string[]) => void;
}

// Default templates
const defaultTemplates: Template[] = [
  {
    id: '1',
    name: 'Certificate of Completion',
    imageUrl: 'https://images.pexels.com/photos/7233354/pexels-photo-7233354.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    fields: [
      { id: '1', name: 'recipient', type: 'text', x: 50, y: 50, fontSize: 24, fontFamily: 'serif', color: '#000' },
      { id: '2', name: 'course', type: 'text', x: 50, y: 70, fontSize: 18, fontFamily: 'serif', color: '#333' },
      { id: '3', name: 'date', type: 'date', x: 50, y: 90, fontSize: 14, fontFamily: 'serif', color: '#555' },
      { id: '4', name: 'qrcode', type: 'qrcode', x: 80, y: 90 }
    ]
  },
  {
    id: '2',
    name: 'Award Certificate',
    imageUrl: 'https://images.pexels.com/photos/6256102/pexels-photo-6256102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    fields: [
      { id: '1', name: 'recipient', type: 'text', x: 50, y: 40, fontSize: 28, fontFamily: 'serif', color: '#000' },
      { id: '2', name: 'achievement', type: 'text', x: 50, y: 60, fontSize: 20, fontFamily: 'serif', color: '#333' },
      { id: '3', name: 'date', type: 'date', x: 50, y: 80, fontSize: 16, fontFamily: 'serif', color: '#555' },
      { id: '4', name: 'qrcode', type: 'qrcode', x: 75, y: 90 }
    ]
  },
  {
    id: '3',
    name: 'Red Ciudadana Certificate',
    imageUrl: 'https://images.pexels.com/photos/7130465/pexels-photo-7130465.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    fields: [
      { id: '1', name: 'recipient', type: 'text', x: 50, y: 45, fontSize: 32, fontFamily: 'serif', color: '#1a365d' },
      { id: '2', name: 'course', type: 'text', x: 50, y: 60, fontSize: 24, fontFamily: 'serif', color: '#2d4a7c' },
      { id: '3', name: 'date', type: 'date', x: 50, y: 75, fontSize: 18, fontFamily: 'serif', color: '#4a5568' },
      { id: '4', name: 'qrcode', type: 'qrcode', x: 85, y: 85 }
    ]
  }
];

export const useCertificateStore = create<CertificateState>((set, get) => ({
  templates: defaultTemplates,
  recipients: [],
  certificates: [],
  collections: [],
  currentTemplateId: null,
  
  // Template actions
  addTemplate: (template) => {
    const id = nanoid();
    set((state) => ({
      templates: [...state.templates, { ...template, id }]
    }));
    return id;
  },
  
  updateTemplate: (id, template) => {
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? { ...t, ...template } : t))
    }));
  },
  
  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id)
    }));
  },
  
  setCurrentTemplate: (id) => {
    set({ currentTemplateId: id });
  },
  
  // Recipient actions
  addRecipient: (recipient) => {
    const id = nanoid();
    set((state) => ({
      recipients: [...state.recipients, { ...recipient, id }]
    }));
    return id;
  },
  
  addRecipients: (recipients) => {
    const recipientsWithIds = recipients.map(recipient => ({
      ...recipient,
      id: nanoid()
    }));
    
    set((state) => ({
      recipients: [...state.recipients, ...recipientsWithIds]
    }));
    
    return recipientsWithIds.map(r => r.id);
  },
  
  updateRecipient: (id, recipient) => {
    set((state) => ({
      recipients: state.recipients.map((r) => (r.id === id ? { ...r, ...recipient } : r))
    }));
  },
  
  deleteRecipient: (id) => {
    set((state) => ({
      recipients: state.recipients.filter((r) => r.id !== id),
      certificates: state.certificates.filter((c) => c.recipientId !== id)
    }));
  },
  
  // Certificate actions
  generateCertificate: (recipientId, templateId) => {
    const id = nanoid();
    const baseUrl = window.location.origin;
    const verificationUrl = `${baseUrl}/verify/${id}`;
    
    const certificate: Certificate = {
      id,
      recipientId,
      templateId,
      qrCodeUrl: verificationUrl,
      issueDate: new Date().toISOString(),
      verificationUrl,
      status: 'published'
    };
    
    set((state) => ({
      certificates: [...state.certificates, certificate]
    }));
    
    return id;
  },
  
  generateBulkCertificates: (recipientIds, templateId) => {
    const baseUrl = window.location.origin;
    const certificates = recipientIds.map(recipientId => {
      const id = nanoid();
      const verificationUrl = `${baseUrl}/verify/${id}`;
      
      return {
        id,
        recipientId,
        templateId,
        qrCodeUrl: verificationUrl,
        issueDate: new Date().toISOString(),
        verificationUrl,
        status: 'published'
      };
    });
    
    set((state) => ({
      certificates: [...state.certificates, ...certificates]
    }));
    
    return certificates.map(c => c.id);
  },
  
  updateCertificate: (id, certificate) => {
    set((state) => ({
      certificates: state.certificates.map((c) => (c.id === id ? { ...c, ...certificate } : c))
    }));
  },
  
  deleteCertificate: (id) => {
    set((state) => ({
      certificates: state.certificates.filter((c) => c.id !== id),
      collections: state.collections.map(collection => ({
        ...collection,
        certificates: collection.certificates.filter(cert => cert.id !== id)
      }))
    }));
  },
  
  // Collection actions
  createCollection: (name, templateId, description) => {
    const id = nanoid();
    const collection: CertificateCollection = {
      id,
      name,
      description,
      templateId,
      certificates: [],
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      collections: [...state.collections, collection]
    }));
    
    return id;
  },
  
  updateCollection: (id, collection) => {
    set((state) => ({
      collections: state.collections.map((c) => (c.id === id ? { ...c, ...collection } : c))
    }));
  },
  
  deleteCollection: (id) => {
    set((state) => ({
      collections: state.collections.filter((c) => c.id !== id)
    }));
  },
  
  addCertificatesToCollection: (collectionId, certificateIds) => {
    const { certificates: allCertificates } = get();
    
    set((state) => ({
      collections: state.collections.map((collection) => {
        if (collection.id === collectionId) {
          const newCertificates = allCertificates.filter((cert) => 
            certificateIds.includes(cert.id) && 
            !collection.certificates.some(c => c.id === cert.id)
          );
          
          return {
            ...collection,
            certificates: [...collection.certificates, ...newCertificates]
          };
        }
        return collection;
      })
    }));
  }
}));