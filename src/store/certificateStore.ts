import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Template, Recipient, Certificate, CertificateCollection } from '../types';
import { nanoid } from 'nanoid';
import { supabase, DatabaseCertificate } from '../lib/supabase';
import { generateAndUploadCertificatePDF } from '../utils/certificateStorage';

// Default data for certificates that can be validated
const defaultTemplates: Template[] = [
  {
    id: 'proteccion-datos-personales',
    name: 'Certificado de Protección de Datos Personales',
    imageUrl: '/assets/certificate-templates/proteccion-datos-personales.jpg',
    fields: [
      { 
        id: nanoid(), 
        name: 'recipient', 
        type: 'text', 
        x: 30, 
        y: 40, 
        fontSize: 28, 
        fontFamily: "Sora, sans-serif", 
        color: '#1a365d' 
      }
    ]
  },
  {
    id: 'power-bi-avanzado',
    name: 'Certificado de Power BI Avanzado',
    imageUrl: '/assets/certificate-templates/power-bi-avanzado.jpg',
    fields: [
      { 
        id: nanoid(), 
        name: 'recipient', 
        type: 'text', 
        x: 30, 
        y: 40, 
        fontSize: 28, 
        fontFamily: "Sora, sans-serif", 
        color: '#1a365d' 
      }
    ]
  },
  {
    id: 'excel-avanzado',
    name: 'Certificado de Excel Avanzado',
    imageUrl: '/assets/certificate-templates/excel-avanzado.jpg',
    fields: [
      { 
        id: nanoid(), 
        name: 'recipient', 
        type: 'text', 
        x: 30, 
        y: 40, 
        fontSize: 28, 
        fontFamily: "Sora, sans-serif", 
        color: '#1a365d' 
      }
    ]
  },
  {
    id: 'datos-abiertos',
    name: 'Certificado de Datos Abiertos',
    imageUrl: '/assets/certificate-templates/datos-abiertos.jpg',
    fields: [
      { 
        id: nanoid(), 
        name: 'recipient', 
        type: 'text', 
        x: 30, 
        y: 40, 
        fontSize: 28, 
        fontFamily: "Sora, sans-serif", 
        color: '#1a365d' 
      }
    ]
  },
];

const defaultRecipients: Recipient[] = [
];

const defaultCertificates: Certificate[] = [
];

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
      templates: defaultTemplates,
      recipients: defaultRecipients,
      certificates: defaultCertificates,
      collections: [],
      currentTemplateId: defaultTemplates[0]?.id || null,
      
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

        const { recipients, templates } = get();
        const recipient = recipients.find(r => r.id === recipientId);
        const template = templates.find(t => t.id === templateId);

        if (recipient && template) {
          const dbCertificate: DatabaseCertificate = {
            certificate_code: id,
            recipient_name: recipient.name,
            recipient_email: recipient.email || '',
            recipient_id: recipient.customFields?.studentId || null,
            course_name: recipient.course || template.name,
            template_id: templateId,
            issue_date: new Date().toISOString().split('T')[0],
            qr_code_data: verificationUrl,
            status: 'active'
          };

          console.log('Attempting to save certificate to database:', dbCertificate);
          supabase.insertCertificate(dbCertificate)
            .then(async result => {
              console.log('Certificate successfully saved to database:', result);

              try {
                console.log('Generating and uploading PDF to storage...');
                const pdfUrl = await generateAndUploadCertificatePDF(id, template, recipient);
                console.log('PDF uploaded successfully:', pdfUrl);

                await supabase.updateCertificatePDFUrl(id, pdfUrl);
                console.log('Certificate PDF URL updated in database');
              } catch (pdfError) {
                console.error('Error generating/uploading PDF:', pdfError);
              }
            })
            .catch(error => {
              console.error('Error saving certificate to database:', error);
              alert('Warning: Certificate was created but could not be saved to database. Please check console for details.');
            });
        } else {
          console.error('Missing recipient or template data:', { recipient, template });
        }

        return id;
      },
      
      generateBulkCertificates: (recipientIds, templateId) => {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const { recipients, templates } = get();
        const template = templates.find(t => t.id === templateId);

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

        console.log(`Saving ${newCertificates.length} certificates to database...`);
        let savedCount = 0;
        let errorCount = 0;

        const processCertificate = async (cert: typeof newCertificates[0]) => {
          const recipient = recipients.find(r => r.id === cert.recipientId);

          if (recipient && template) {
            const dbCertificate: DatabaseCertificate = {
              certificate_code: cert.id,
              recipient_name: recipient.name,
              recipient_email: recipient.email || '',
              recipient_id: recipient.customFields?.studentId || null,
              course_name: recipient.course || template.name,
              template_id: templateId,
              issue_date: new Date().toISOString().split('T')[0],
              qr_code_data: cert.verificationUrl,
              status: 'active'
            };

            try {
              console.log('Saving bulk certificate:', dbCertificate);
              await supabase.insertCertificate(dbCertificate);
              savedCount++;
              console.log(`Certificate ${savedCount}/${newCertificates.length} saved successfully`);

              try {
                console.log(`Generating and uploading PDF ${savedCount}/${newCertificates.length}...`);
                const pdfUrl = await generateAndUploadCertificatePDF(cert.id, template, recipient);
                await supabase.updateCertificatePDFUrl(cert.id, pdfUrl);
                console.log(`PDF ${savedCount}/${newCertificates.length} uploaded successfully`);
              } catch (pdfError) {
                console.error(`Error uploading PDF for certificate ${cert.id}:`, pdfError);
              }
            } catch (error) {
              errorCount++;
              console.error(`Error saving certificate ${cert.id}:`, error);
            }
          } else {
            console.error('Missing recipient or template for certificate:', cert.id);
          }
        };

        const batchSize = 3;
        const processBatch = async (batch: typeof newCertificates) => {
          await Promise.all(batch.map(cert => processCertificate(cert)));
        };

        (async () => {
          for (let i = 0; i < newCertificates.length; i += batchSize) {
            const batch = newCertificates.slice(i, i + batchSize);
            await processBatch(batch);
          }

          if (errorCount > 0) {
            alert(`Se procesaron ${savedCount} certificados exitosamente. ${errorCount} fallaron.`);
          } else {
            console.log(`All ${savedCount} certificates processed successfully!`);
          }
        })();

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
          templateId: templateId || '',
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
          templates: defaultTemplates,
          recipients: defaultRecipients,
          certificates: defaultCertificates,
          collections: [],
          currentTemplateId: defaultTemplates[0]?.id || null
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