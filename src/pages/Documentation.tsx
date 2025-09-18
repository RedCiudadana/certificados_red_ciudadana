import React, { useState } from 'react';
import { Search, Book, ChevronRight, ExternalLink } from 'lucide-react';

const Documentation: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpTopics = [
    {
      category: 'Getting Started',
      items: [
        { 
          title: 'Quick Start Guide',
          description: 'Learn how to create your first certificate in minutes',
          content: `
            1. Select a template from the Templates page
            2. Enter recipient information or upload a spreadsheet
            3. Preview and generate your certificate
            4. Download or share the certificate
          `
        },
        {
          title: 'Template Dimensions & Layout',
          description: 'Recommended dimensions and text placement for certificate templates',
          content: `
            Recommended Image Dimensions:
            - Width: 2000px (minimum 1500px)
            - Height: 1414px (minimum 1060px)
            - Aspect Ratio: 1.414:1 (ISO A-series)
            - Resolution: 300 DPI
            - Format: PNG or JPG
            
            Text Placement Guidelines:
            - Recipient Name: Center horizontally (x: 50%), upper third (y: 40-45%)
            - Course/Achievement: Center horizontally (x: 50%), middle (y: 55-60%)
            - Date: Center horizontally (x: 50%), lower third (y: 75-80%)
            - QR Code: Bottom right corner (x: 80-85%, y: 85-90%)
            
            Important Notes:
            - Leave ample space around text placement areas
            - Use high contrast between background and text areas
            - Consider decorative elements when placing text
            - Test template with different name lengths
          `
        },
        {
          title: 'Understanding Templates',
          description: 'Learn about certificate templates and how to customize them',
          content: `
            Templates allow you to:
            - Define the certificate layout
            - Add custom fields
            - Position text and QR codes
            - Set fonts and colors
          `
        },
        {
          title: 'Managing Recipients',
          description: 'How to add and manage certificate recipients',
          content: `
            You can:
            - Add individual recipients
            - Bulk import from Excel
            - Edit recipient details
            - Track issued certificates
          `
        }
      ]
    },
    {
      category: 'Features',
      items: [
        {
          title: 'Bulk Certificate Generation',
          description: 'Generate multiple certificates using Excel data',
          content: `
            Bulk generation steps:
            1. Prepare your Excel file with recipient data
            2. Choose a template
            3. Upload your spreadsheet
            4. Review and generate certificates
          `
        },
        {
          title: 'QR Code Verification',
          description: 'How certificate verification works',
          content: `
            Each certificate includes:
            - Unique QR code
            - Verification URL
            - Digital signature
            - Tamper-proof design
          `
        },
        {
          title: 'Export & Sharing',
          description: 'Share certificates and export verification sites',
          content: `
            Available formats:
            - PDF download
            - PNG image
            - HTML verification page
            - Static verification site
          `
        }
      ]
    },
    {
      category: 'Design Guidelines',
      items: [
        {
          title: 'Certificate Design Best Practices',
          description: 'Tips for creating professional certificate designs',
          content: `
            Design Recommendations:
            - Use professional fonts (serif for names, sans-serif for details)
            - Maintain consistent spacing between elements
            - Include organization logo and branding
            - Use appropriate color schemes
            - Ensure text is legible at all sizes
            
            Common Font Sizes:
            - Recipient Name: 24-32px
            - Course/Achievement: 18-24px
            - Date and Details: 14-18px
            
            Color Guidelines:
            - Use dark text on light backgrounds
            - Maintain minimum contrast ratio of 4.5:1
            - Avoid overly bright or neon colors
            - Consider color-blind accessibility
          `
        },
        {
          title: 'Template Customization',
          description: 'How to customize certificate templates',
          content: `
            Customization Options:
            - Adjust text position (X/Y coordinates)
            - Change font styles and sizes
            - Modify text colors
            - Add custom fields
            - Position QR code
            
            Testing Guidelines:
            - Preview with different name lengths
            - Check alignment on all devices
            - Verify PDF output quality
            - Test QR code scannability
          `
        }
      ]
    },
    {
      category: 'Troubleshooting',
      items: [
        {
          title: 'Common Issues',
          description: 'Solutions to frequently encountered problems',
          content: `
            Common solutions:
            - Clear browser cache
            - Check file formats
            - Verify data formatting
            - Update browser
          `
        },
        {
          title: 'File Requirements',
          description: 'Supported file formats and size limits',
          content: `
            Supported formats:
            - Excel: .xlsx, .xls
            - Images: .jpg, .png
            - Maximum file size: 10MB
          `
        },
        {
          title: 'Best Practices',
          description: 'Tips for optimal certificate management',
          content: `
            Recommendations:
            - Use high-resolution images
            - Test templates before bulk generation
            - Regular data backups
            - Organize recipients by groups
          `
        }
      ]
    }
  ];

  const filteredTopics = searchQuery
    ? helpTopics.map(category => ({
        ...category,
        items: category.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.items.length > 0)
    : helpTopics;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        <p className="mt-2 text-lg text-gray-600">
          Learn how to use CertifyPro effectively
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-12">
        {filteredTopics.map((category) => (
          <div key={category.category} className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">{category.category}</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {category.items.map((item) => (
                <div key={item.title} className="px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Book className="h-5 w-5 text-gray-500 mr-2" />
                      {item.title}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  <div className="mt-4 bg-gray-50 rounded-md p-4">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {item.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExternalLink className="h-5 w-5 text-gray-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">Need more help?</h3>
            <div className="mt-2 text-sm text-gray-700">
              <p>Our support team is here to help you with any questions or issues.</p>
            </div>
            <div className="mt-3">
              <a
                href="mailto:support@certifypro.com"
                className="text-sm font-medium text-gray-600 hover:text-gray-500"
              >
                Contact Support <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;