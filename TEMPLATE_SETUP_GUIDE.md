# Certificate Template Setup Guide

This guide explains how to add certificate background images and data directly through source code.

## 📁 Directory Structure Created

```
public/
├── assets/
│   └── certificate-templates/
│       ├── README.md
│       ├── professional-certificate.jpg    (add your images here)
│       ├── completion-certificate.png      (add your images here)
│       └── achievement-award.jpg           (add your images here)

src/
├── store/
│   └── certificateStore.ts                 (updated with default data)
├── utils/
│   ├── templateHelpers.ts                  (new - template creation helpers)
│   └── certificateHelpers.ts               (new - certificate creation helpers)
```

## 🖼️ Adding Certificate Background Images

### Step 1: Add Images to Directory
1. Place your certificate background images in `public/assets/certificate-templates/`
2. Use recommended specifications:
   - **Dimensions**: 2000x1414 pixels (A4 landscape)
   - **Resolution**: 300 DPI
   - **Formats**: PNG, JPG, GIF, WebP, SVG
   - **Size**: Under 5MB

### Step 2: Update Templates in Source Code

#### Method 1: Direct Addition to Store
Edit `src/store/certificateStore.ts` and add to the `defaultTemplates` array:

```typescript
{
  id: 'your-template-id',
  name: 'Your Template Name',
  imageUrl: '/assets/certificate-templates/your-image.jpg',
  fields: [
    { 
      id: nanoid(), 
      name: 'recipient', 
      type: 'text', 
      x: 50, 
      y: 40, 
      fontSize: 28, 
      fontFamily: 'serif', 
      color: '#1a365d'
    },
    // Add more fields...
  ]
}
```

#### Method 2: Using Template Helpers
Use the helper functions in `src/utils/templateHelpers.ts`:

```typescript
import { quickTemplates } from '../utils/templateHelpers';

// Create a professional template
const myTemplate = quickTemplates.createProfessional(
  '/assets/certificate-templates/my-certificate.jpg',
  'My Custom Certificate'
);
```

## 📋 Adding Recipients and Certificates for Validation

### Method 1: Direct Addition to Store
Edit `src/store/certificateStore.ts`:

#### Add Recipients:
```typescript
// Add to defaultRecipients array
{
  id: 'recipient-001',
  name: 'John Doe',
  email: 'john@example.com',
  course: 'Web Development',
  issueDate: '2024-01-15T00:00:00.000Z',
  customFields: {
    institution: 'Red Ciudadana',
    duration: '40 hours'
  }
}
```

#### Add Certificates:
```typescript
// Add to defaultCertificates array
{
  id: 'CERT-2024-001',  // This ID can be used for validation
  recipientId: 'recipient-001',
  templateId: 'your-template-id',
  qrCodeUrl: 'https://your-domain.com/verify/CERT-2024-001',
  issueDate: '2024-01-15T00:00:00.000Z',
  verificationUrl: 'https://your-domain.com/verify/CERT-2024-001',
  status: 'published'
}
```

### Method 2: Using Certificate Helpers
Use the helper functions in `src/utils/certificateHelpers.ts`:

```typescript
import { createRecipient, generateBatchCertificates } from '../utils/certificateHelpers';

// Create a single recipient
const recipient = createRecipient(
  'Jane Smith',
  'jane@example.com',
  'Data Science Course',
  { institution: 'Red Ciudadana', level: 'advanced' }
);

// Create batch certificates
const batch = generateBatchCertificates([
  { name: 'User 1', email: 'user1@example.com', course: 'Course 1' },
  { name: 'User 2', email: 'user2@example.com', course: 'Course 2' }
], 'template-id', 'BATCH-2024');
```

## 🔧 Quick Setup Examples

### Example 1: Add a New Template with Image
```typescript
// 1. Add image to: public/assets/certificate-templates/my-cert.jpg
// 2. Add to defaultTemplates in certificateStore.ts:

{
  id: 'my-custom-cert',
  name: 'My Custom Certificate',
  imageUrl: '/assets/certificate-templates/my-cert.jpg',
  fields: [
    { id: nanoid(), name: 'recipient', type: 'text', x: 50, y: 40, fontSize: 28, fontFamily: 'serif', color: '#000' },
    { id: nanoid(), name: 'course', type: 'text', x: 50, y: 60, fontSize: 20, fontFamily: 'serif', color: '#333' },
    { id: nanoid(), name: 'date', type: 'date', x: 30, y: 85, fontSize: 16, fontFamily: 'serif', color: '#666' },
    { id: nanoid(), name: 'qrcode', type: 'qrcode', x: 85, y: 90 }
  ]
}
```

### Example 2: Add Test Certificates for Validation
```typescript
// Add to defaultRecipients:
{
  id: 'test-recipient',
  name: 'Test User',
  email: 'test@example.com',
  course: 'Test Course',
  issueDate: '2024-01-01T00:00:00.000Z'
}

// Add to defaultCertificates:
{
  id: '1234',  // Easy to remember for testing
  recipientId: 'test-recipient',
  templateId: 'my-custom-cert',
  qrCodeUrl: 'https://your-domain.com/verify/1234',
  issueDate: '2024-01-01T00:00:00.000Z',
  verificationUrl: 'https://your-domain.com/verify/1234',
  status: 'published'
}
```

## 🎯 Field Positioning Guide

Use percentage-based coordinates (0-100):

```typescript
// Common positions:
const positions = {
  recipientName: { x: 50, y: 40 },    // Center, upper area
  courseName: { x: 50, y: 60 },       // Center, middle
  institution: { x: 50, y: 70 },      // Center, below course
  date: { x: 30, y: 85 },             // Left side, bottom
  signature: { x: 70, y: 85 },        // Right side, bottom
  qrCode: { x: 85, y: 90 }            // Bottom right corner
};
```

## 🚀 Testing Your Setup

1. **Add your images** to `public/assets/certificate-templates/`
2. **Update the store** with your templates and test data
3. **Restart the development server**: `npm run dev`
4. **Test validation** by going to `/verify/1234` (or your test ID)
5. **Check templates** in the admin panel under "Plantillas"

## 📝 Data Management Utilities

The store now includes utility functions:

```typescript
const { loadDefaultData, clearAllData, exportData, importData } = useCertificateStore();

// Reset to default data
loadDefaultData();

// Clear everything
clearAllData();

// Export current data
const backup = exportData();

// Import data from JSON
importData(jsonString);
```

## 🔍 Validation Testing

Test certificate validation with these default IDs:
- `1234` - Short test ID
- `CERT-2024-001` - Full format ID
- `CERT-2024-002` - Another full format ID
- `CERT-2024-003` - Achievement certificate

Visit `/verify/1234` to test the validation system.

---

Your certificate system is now ready with direct source code management capabilities!