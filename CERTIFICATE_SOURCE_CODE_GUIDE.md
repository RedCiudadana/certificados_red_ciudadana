# Certificate Source Code Guide

## 📋 Table of Contents
1. [Adding Certificate Background Images](#adding-certificate-background-images)
2. [Certificate Data Storage](#certificate-data-storage)
3. [Template Management](#template-management)
4. [Certificate Validation System](#certificate-validation-system)
5. [File Structure Overview](#file-structure-overview)
6. [Code Examples](#code-examples)

---

## 🖼️ Adding Certificate Background Images

### Method 1: Through Image Upload Component

The application uses the `ImageUpload` component to handle certificate background images:

**Location:** `src/components/ImageUpload.tsx`

```typescript
// The component automatically handles:
// - File validation (PNG, JPG, GIF, WebP, SVG)
// - Size limits (5MB max)
// - Base64 conversion for storage
// - localStorage persistence
```

### Method 2: Direct Source Code Addition

To add certificate backgrounds directly through source code:

#### Step 1: Add Images to Public Directory
```
public/
├── assets/
│   └── certificate-templates/
│       ├── template-1.jpg
│       ├── template-2.png
│       └── template-3.svg
```

#### Step 2: Update Certificate Store
**Location:** `src/store/certificateStore.ts`

```typescript
// Add to the initial templates array
const initialTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Professional Certificate',
    imageUrl: '/assets/certificate-templates/template-1.jpg',
    fields: [
      { id: '1', name: 'recipient', type: 'text', x: 50, y: 40, fontSize: 24, fontFamily: 'serif', color: '#000' },
      { id: '2', name: 'course', type: 'text', x: 50, y: 60, fontSize: 18, fontFamily: 'serif', color: '#333' },
      { id: '3', name: 'date', type: 'date', x: 50, y: 80, fontSize: 14, fontFamily: 'serif', color: '#555' },
      { id: '4', name: 'qrcode', type: 'qrcode', x: 80, y: 90 }
    ]
  },
  // Add more templates here...
];
```

#### Step 3: Image Specifications
```typescript
// Recommended image specifications:
const imageSpecs = {
  dimensions: {
    width: 2000,      // pixels (minimum 1500px)
    height: 1414,     // pixels (minimum 1060px)
    aspectRatio: 1.414 // ISO A-series (A4 landscape)
  },
  resolution: 300,    // DPI for print quality
  formats: ['PNG', 'JPG', 'GIF', 'WebP', 'SVG'],
  maxSize: '5MB'
};
```

### Method 3: Using External URLs

```typescript
// In certificateStore.ts, you can use external URLs:
{
  id: 'external-template',
  name: 'External Template',
  imageUrl: 'https://example.com/certificate-background.jpg',
  fields: [...]
}
```

---

## 💾 Certificate Data Storage

### Storage Architecture

The application uses **Zustand** with **localStorage persistence** for data storage:

**Location:** `src/store/certificateStore.ts`

```typescript
export const useCertificateStore = create<CertificateStore>()(
  persist(
    (set, get) => ({
      // State management logic
    }),
    {
      name: 'certificate-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Data Structure

#### 1. Templates Storage
```typescript
interface Template {
  id: string;
  name: string;
  imageUrl: string;
  fields: TemplateField[];
  width?: number;
  height?: number;
}

// Stored in localStorage key: 'certificate-store'
// Path: templates[]
```

#### 2. Recipients Storage
```typescript
interface Recipient {
  id: string;
  name: string;
  email?: string;
  course?: string;
  issueDate: string;
  customFields?: Record<string, string>;
}

// Stored in localStorage key: 'certificate-store'
// Path: recipients[]
```

#### 3. Certificates Storage
```typescript
interface Certificate {
  id: string;
  recipientId: string;
  templateId: string;
  qrCodeUrl: string;
  issueDate: string;
  verificationUrl: string;
  status: 'draft' | 'published';
}

// Stored in localStorage key: 'certificate-store'
// Path: certificates[]
```

### Adding Certificates Programmatically

#### Method 1: Through Store Actions
```typescript
// In any component:
import { useCertificateStore } from '../store/certificateStore';

const { addRecipient, generateCertificate } = useCertificateStore();

// Add recipient
const recipientId = addRecipient({
  name: 'John Doe',
  email: 'john@example.com',
  course: 'Web Development',
  issueDate: new Date().toISOString()
});

// Generate certificate
const certificateId = generateCertificate(recipientId, 'template-1');
```

#### Method 2: Direct Data Injection
```typescript
// In certificateStore.ts, modify initial state:
const initialState = {
  templates: [...],
  recipients: [
    {
      id: 'recipient-1',
      name: 'Jane Smith',
      email: 'jane@example.com',
      course: 'Data Science',
      issueDate: '2024-01-15T00:00:00.000Z'
    }
    // Add more recipients...
  ],
  certificates: [
    {
      id: 'cert-1',
      recipientId: 'recipient-1',
      templateId: 'template-1',
      qrCodeUrl: 'https://example.com/verify/cert-1',
      issueDate: '2024-01-15T00:00:00.000Z',
      verificationUrl: 'https://example.com/verify/cert-1',
      status: 'published'
    }
    // Add more certificates...
  ]
};
```

---

## 🎨 Template Management

### Template Field Configuration

```typescript
interface TemplateField {
  id: string;
  name: string;
  type: 'text' | 'date' | 'qrcode';
  x: number;        // Percentage (0-100)
  y: number;        // Percentage (0-100)
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  defaultValue?: string;
}
```

### Field Positioning Guide

```typescript
// Positioning guidelines (percentage-based):
const fieldPositions = {
  recipientName: { x: 50, y: 40 },    // Center, upper third
  courseName: { x: 50, y: 60 },       // Center, middle
  issueDate: { x: 50, y: 80 },        // Center, lower third
  qrCode: { x: 80, y: 90 },           // Bottom right corner
  logo: { x: 20, y: 10 },             // Top left corner
  signature: { x: 80, y: 75 }         // Bottom right area
};
```

### Adding Custom Fields

```typescript
// Example: Adding a custom "Institution" field
const customTemplate: Template = {
  id: 'custom-template',
  name: 'Custom Certificate',
  imageUrl: '/assets/templates/custom.jpg',
  fields: [
    // Standard fields
    { id: '1', name: 'recipient', type: 'text', x: 50, y: 35, fontSize: 28, fontFamily: 'serif', color: '#000' },
    { id: '2', name: 'course', type: 'text', x: 50, y: 50, fontSize: 20, fontFamily: 'serif', color: '#333' },
    
    // Custom field
    { 
      id: '3', 
      name: 'institution', 
      type: 'text', 
      x: 50, 
      y: 65, 
      fontSize: 16, 
      fontFamily: 'serif', 
      color: '#666',
      defaultValue: 'Red Ciudadana'
    },
    
    { id: '4', name: 'date', type: 'date', x: 30, y: 85, fontSize: 14, fontFamily: 'serif', color: '#555' },
    { id: '5', name: 'qrcode', type: 'qrcode', x: 85, y: 90 }
  ]
};
```

---

## ✅ Certificate Validation System

### Validation Logic Location
**File:** `src/pages/VerifyCertificate.tsx`

### How Validation Works

```typescript
// Validation process:
const handleVerification = async (id: string) => {
  // 1. Find certificate by ID (exact or partial match)
  const foundCertificate = certificates.find(c => 
    c.id === id || 
    c.id.slice(-4) === id || 
    c.id.includes(id)
  );
  
  // 2. If found, get related data
  if (foundCertificate) {
    const recipient = recipients.find(r => r.id === foundCertificate.recipientId);
    const template = templates.find(t => t.id === foundCertificate.templateId);
    
    // 3. Display certificate details
    setCertificate(foundCertificate);
    setRecipient(recipient);
    setTemplate(template);
    setIsValid(true);
  }
};
```

### Adding Certificates for Validation

#### Method 1: Through Admin Interface
1. Login as admin
2. Go to "Crear Certificado"
3. Add recipient and generate certificate
4. Certificate automatically becomes available for validation

#### Method 2: Direct Code Addition
```typescript
// In certificateStore.ts initial state:
certificates: [
  {
    id: 'CERT-2024-001',  // This ID can be used for validation
    recipientId: 'recipient-1',
    templateId: 'template-1',
    qrCodeUrl: `${window.location.origin}/verify/CERT-2024-001`,
    issueDate: '2024-01-15T00:00:00.000Z',
    verificationUrl: `${window.location.origin}/verify/CERT-2024-001`,
    status: 'published'
  }
]
```

### Validation URL Structure
```
https://your-domain.com/verify/CERT-2024-001
https://your-domain.com/verify/1234  (last 4 digits)
```

---

## 📁 File Structure Overview

```
src/
├── components/
│   ├── ImageUpload.tsx          # Handles image uploads
│   ├── CertificatePreview.tsx   # Shows certificate preview
│   └── TemplateCard.tsx         # Template selection UI
├── pages/
│   ├── CreateCertificate.tsx    # Certificate creation
│   ├── TemplateManager.tsx      # Template management
│   ├── VerifyCertificate.tsx    # Certificate validation
│   └── RecipientManager.tsx     # Recipient management
├── store/
│   └── certificateStore.ts      # Main data store
├── utils/
│   ├── certificateGenerator.ts  # PDF generation
│   └── imageStorage.ts          # Image storage utilities
└── types/
    └── index.ts                 # TypeScript interfaces

public/
├── assets/
│   └── certificate-templates/   # Static template images
└── index.html
```

---

## 💻 Code Examples

### Example 1: Adding Multiple Templates

```typescript
// In certificateStore.ts
const predefinedTemplates: Template[] = [
  {
    id: 'completion-cert',
    name: 'Course Completion Certificate',
    imageUrl: '/assets/templates/completion.jpg',
    fields: [
      { id: '1', name: 'recipient', type: 'text', x: 50, y: 35, fontSize: 32, fontFamily: 'serif', color: '#1a365d' },
      { id: '2', name: 'course', type: 'text', x: 50, y: 55, fontSize: 24, fontFamily: 'serif', color: '#2d3748' },
      { id: '3', name: 'date', type: 'date', x: 25, y: 85, fontSize: 16, fontFamily: 'serif', color: '#4a5568' },
      { id: '4', name: 'qrcode', type: 'qrcode', x: 85, y: 85 }
    ]
  },
  {
    id: 'achievement-cert',
    name: 'Achievement Certificate',
    imageUrl: '/assets/templates/achievement.png',
    fields: [
      { id: '1', name: 'recipient', type: 'text', x: 50, y: 40, fontSize: 28, fontFamily: 'serif', color: '#744210' },
      { id: '2', name: 'achievement', type: 'text', x: 50, y: 60, fontSize: 20, fontFamily: 'serif', color: '#975a16', defaultValue: 'Outstanding Performance' },
      { id: '3', name: 'date', type: 'date', x: 50, y: 80, fontSize: 14, fontFamily: 'serif', color: '#a0aec0' },
      { id: '4', name: 'qrcode', type: 'qrcode', x: 80, y: 90 }
    ]
  }
];
```

### Example 2: Bulk Certificate Creation

```typescript
// Function to create multiple certificates
const createBulkCertificates = () => {
  const recipients = [
    { name: 'Alice Johnson', email: 'alice@example.com', course: 'React Development' },
    { name: 'Bob Smith', email: 'bob@example.com', course: 'Node.js Backend' },
    { name: 'Carol Davis', email: 'carol@example.com', course: 'Full Stack Development' }
  ];

  const { addRecipient, generateCertificate } = useCertificateStore.getState();

  recipients.forEach(recipientData => {
    const recipientId = addRecipient({
      ...recipientData,
      issueDate: new Date().toISOString()
    });
    
    generateCertificate(recipientId, 'completion-cert');
  });
};
```

### Example 3: Custom Validation Logic

```typescript
// In VerifyCertificate.tsx - Custom validation with additional checks
const advancedValidation = (certificateId: string) => {
  const certificate = certificates.find(c => c.id === certificateId);
  
  if (!certificate) {
    return { valid: false, error: 'Certificate not found' };
  }
  
  // Check if certificate is published
  if (certificate.status !== 'published') {
    return { valid: false, error: 'Certificate is not published' };
  }
  
  // Check expiration (if applicable)
  const issueDate = new Date(certificate.issueDate);
  const expirationDate = new Date(issueDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year
  
  if (new Date() > expirationDate) {
    return { valid: false, error: 'Certificate has expired' };
  }
  
  return { valid: true, certificate };
};
```

---

## 🔧 Development Tips

### 1. Image Optimization
```bash
# Optimize images before adding them
# Recommended tools:
- TinyPNG (online)
- ImageOptim (Mac)
- GIMP (cross-platform)
```

### 2. Testing Templates
```typescript
// Test template positioning with sample data
const testRecipient = {
  name: 'Test User Name That Is Very Long',
  course: 'Very Long Course Name That Might Wrap',
  issueDate: new Date().toISOString()
};
```

### 3. Debugging Certificate Generation
```typescript
// Add logging to certificate generation
console.log('Template:', template);
console.log('Recipient:', recipient);
console.log('Generated Certificate ID:', certificateId);
```

### 4. Backup and Restore Data
```typescript
// Export data
const exportData = () => {
  const data = localStorage.getItem('certificate-store');
  const blob = new Blob([data], { type: 'application/json' });
  saveAs(blob, 'certificate-backup.json');
};

// Import data
const importData = (jsonString: string) => {
  localStorage.setItem('certificate-store', jsonString);
  window.location.reload();
};
```

---

## 📞 Support

For additional help with certificate management:

1. **Template Issues**: Check image format and size requirements
2. **Validation Problems**: Verify certificate IDs and status
3. **Storage Issues**: Check localStorage limits and data structure
4. **PDF Generation**: Ensure images are properly loaded before generation

---

*This documentation covers the core aspects of managing certificates through source code. For UI-based management, use the admin interface after logging in.*