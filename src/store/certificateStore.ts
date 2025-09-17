import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Template, Recipient, Certificate, CertificateCollection } from '../types';
import { nanoid } from 'nanoid';

interface CertificateStore {
  // State
  templates: Template[];
  recipients: Recipient[];
  certificates: Certificate[];
  collections: CertificateCollection[];
  currentTemplateId: string | null;
  
  // Template actions
  addTemplate: (template: Omit<Template, 'id'>) => string;
  updateTemplate: (id: string, template: Omit<Template, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  setCurrentTemplate: (id: string) => void;
  
  // Recipient actions
  addRecipient: (recipient: Omit<Recipient, 'id'>) => string;
  addRecipients: (recipients: Omit<Recipient, 'id'>[]) => string[];
  updateRecipient: (id: string, recipient: Omit<Recipient, 'id'>) => void;
  deleteRecipient: (id: string) => void;
  
  // Certificate actions
  generateCertificate: (recipientId: string, templateId: string) => string;
  generateBulkCertificates: (recipientIds: string[], templateId: string) => string[];
  updateCertificate: (id: string, certificate: Partial<Certificate>) => void;
  deleteCertificate: (id: string) => void;
  
  // Collection actions
  createCollection: (name: string, description?: string, templateId?: string) => string;
  updateCollection: (id: string, updates: Partial<CertificateCollection>) => void;
  deleteCollection: (id: string) => void;
  addCertificatesToCollection: (collectionId: string, certificateIds: string[]) => void;
  removeCertificatesFromCollection: (collectionId: string, certificateIds: string[]) => void;
  
  // Utility actions
  loadDefaultData: () => void;
  clearAllData: () => void;
  exportData: () => string;
  importData: (jsonData: string) => void;
}

export const useCertificateStore = create<CertificateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: [],
      recipients: [],
      certificates: [],
      collections: [],
      currentTemplateId: null,
      
      // Template actions
      addTemplate: (template) => {
        const id = nanoid();
        const newTemplate = { ...template, id };
        set(state => ({
          templates: [...state.templates, newTemplate]
        }));
        return id;
      },
      
      updateTemplate: (id, template) => {
        set(state => ({
          templates: state.templates.map(t => 
            t.id === id ? { ...template, id } : t
          )
        }));
      },
      
      deleteTemplate: (id) => {
        set(state => ({
          templates: state.templates.filter(t => t.id !== id),
          currentTemplateId: state.currentTemplateId === id ? 
            (state.templates.find(t => t.id !== id)?.id || null) : 
            state.currentTemplateId
        }));
      },
      
      setCurrentTemplate: (id) => {
        set({ currentTemplateId: id });
      },
      
      // Recipient actions
      addRecipient: (recipient) => {
        const id = nanoid();
        const newRecipient = { ...recipient, id };
        set(state => ({
          recipients: [...state.recipients, newRecipient]
        }));
        return id;
      },
      
      addRecipients: (recipients) => {
        const newRecipients = recipients.map(recipient => ({
          ...recipient,
          id: nanoid()
        }));
        set(state => ({
          recipients: [...state.recipients, ...newRecipients]
        }));
        return newRecipients.map(r => r.id);
      },
      
      updateRecipient: (id, recipient) => {
        set(state => ({
          recipients: state.recipients.map(r => 
            r.id === id ? { ...recipient, id } : r
          )
        }));
      },
      
      deleteRecipient: (id) => {
        set(state => ({
          recipients: state.recipients.filter(r => r.id !== id),
          certificates: state.certificates.filter(c => c.recipientId !== id)
        }));
      },
      
      // Certificate actions
      generateCertificate: (recipientId, templateId) => {
        const id = nanoid();
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
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
        
        set(state => ({
          certificates: [...state.certificates, certificate]
        }));
        
        return id;
      },
      
      generateBulkCertificates: (recipientIds, templateId) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const newCertificates = recipientIds.map(recipientId => {
          const id = nanoid();
          const verificationUrl = `${baseUrl}/verify/${id}`;
          
          return {
            id,
            recipientId,
            templateId,
            qrCodeUrl: verificationUrl,
            issueDate: new Date().toISOString(),
            verificationUrl,
            status: 'published' as const
          };
        });
        
        set(state => ({
          certificates: [...state.certificates, ...newCertificates]
        }));
        
        return newCertificates.map(c => c.id);
      },
      
      updateCertificate: (id, updates) => {
        set(state => ({
          certificates: state.certificates.map(c => 
            c.id === id ? { ...c, ...updates } : c
          )
        }));
      },
      
      deleteCertificate: (id) => {
        set(state => ({
          certificates: state.certificates.filter(c => c.id !== id)
        }));
      },
      
      // Collection actions
      createCollection: (name, description, templateId) => {
        const id = nanoid();
        const collection: CertificateCollection = {
          id,
          name,
          description,
          templateId,
          certificates: [],
          createdAt: new Date().toISOString()
        };
        
        set(state => ({
          collections: [...state.collections, collection]
        }));
        
        return id;
      },
      
      updateCollection: (id, updates) => {
        set(state => ({
          collections: state.collections.map(c => 
            c.id === id ? { ...c, ...updates } : c
          )
        }));
      },
      
      deleteCollection: (id) => {
        set(state => ({
          collections: state.collections.filter(c => c.id !== id)
        }));
      },
      
      addCertificatesToCollection: (collectionId, certificateIds) => {
        const { certificates: allCertificates } = get();
        const certificatesToAdd = allCertificates.filter(cert => 
          certificateIds.includes(cert.id)
        );
        
        set(state => ({
          collections: state.collections.map(collection => 
            collection.id === collectionId 
              ? {
                  ...collection,
                  certificates: [
                    ...collection.certificates,
                    ...certificatesToAdd.filter(cert => 
                      !collection.certificates.some(existing => existing.id === cert.id)
                    )
                  ]
                }
              : collection
          )
        }));
      },
      
      removeCertificatesFromCollection: (collectionId, certificateIds) => {
        set(state => ({
          collections: state.collections.map(collection => 
            collection.id === collectionId 
              ? {
                  ...collection,
                  certificates: collection.certificates.filter(cert => 
                    !certificateIds.includes(cert.id)
                  )
                }
              : collection
          )
        }));
      },
      
      // Utility actions
      loadDefaultData: () => {
        set({
          templates: [],
          recipients: [],
          certificates: [],
          collections: [],
          currentTemplateId: null
        });
      },
      
      clearAllData: () => {
        set({
          templates: [],
          recipients: [],
          certificates: [],
          collections: [],
          currentTemplateId: null
        });
      },
      
      exportData: () => {
        const state = get();
        return JSON.stringify({
          templates: state.templates,
          recipients: state.recipients,
          certificates: state.certificates,
          collections: state.collections
        }, null, 2);
      },
      
      importData: (jsonData) => {
        try {
          const data = JSON.parse(jsonData);
          set({
            templates: data.templates || [],
            recipients: data.recipients || [],
            certificates: data.certificates || [],
            collections: data.collections || [],
            currentTemplateId: data.templates?.[0]?.id || null
          });
        } catch (error) {
          console.error('Error importing data:', error);
        }
      }
    }),
    {
      name: 'certificate-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);