import React, { useState } from 'react';
import { Download, Github, FileJson, ExternalLink, Copy, Check, Code } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import { generateStaticSite } from '../utils/certificateGenerator';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const ExportSite: React.FC = () => {
  const { certificates, recipients, templates } = useCertificateStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [exportedFiles, setExportedFiles] = useState<Record<string, string> | null>(null);
  
  const handleGeneratePreview = () => {
    setIsGenerating(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      const files = generateStaticSite(certificates, recipients, templates);
      setExportedFiles(files);
      setIsGenerating(false);
    }, 1500);
  };
  
  const handleExportZip = async () => {
    if (!exportedFiles) return;
    
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      // Add all files to the zip
      Object.entries(exportedFiles).forEach(([path, content]) => {
        // Create directories if they don't exist
        if (path.includes('/')) {
          const dirPath = path.substring(0, path.lastIndexOf('/'));
          zip.folder(dirPath);
        }
        
        zip.file(path, content);
      });
      
      // Add README.md with instructions
      const readmeContent = `# Certificate Verification Site

This folder contains static HTML files for your certificate verification site.

## Deployment Instructions

### GitHub Pages
1. Create a new repository on GitHub
2. Upload these files to the repository
3. Go to the repository settings
4. Scroll down to the GitHub Pages section
5. Select the main branch as the source
6. Your site will be published at https://yourusername.github.io/repository-name/

### Netlify
1. Sign up for a free Netlify account
2. Drag and drop this folder to Netlify's upload area
3. Your site will be deployed immediately

## File Structure
- \`index.html\`: Main verification page where users can enter certificate IDs
- \`verify/\`: Folder containing individual certificate verification pages
`;
      zip.file('README.md', readmeContent);
      
      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'certificate-verification-site.zip');
    } catch (error) {
      console.error('Error generating zip file:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleCopyDeployCommands = () => {
    // Example GitHub Pages deployment commands
    const deployCommands = `# GitHub Pages Deployment
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/certificate-verification.git
git push -u origin main
# Then enable GitHub Pages in your repository settings`;

    navigator.clipboard.writeText(deployCommands).then(() => {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    });
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Export Verification Site</h1>
        <p className="mt-2 text-lg text-gray-600">
          Generate a static website for verifying certificates.
        </p>
      </div>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-gray-900">
            Generate Verification Site
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This will create a static website with verification pages for all of your certificates.
            The site can be hosted on GitHub Pages, Netlify, or any static hosting service.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1 md:flex md:justify-between">
                  <p className="text-sm text-blue-700">
                    You have {certificates.length} certificate(s) that will be included in the export.
                  </p>
                </div>
              </div>
            </div>
            
            {certificates.length === 0 ? (
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No certificates found
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        You need to generate at least one certificate before you can export a verification site.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                {!exportedFiles ? (
                  <button
                    onClick={handleGeneratePreview}
                    disabled={isGenerating || certificates.length === 0}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileJson className="mr-2 h-4 w-4" aria-hidden="true" />
                        Generate Preview
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleExportZip}
                    disabled={isExporting}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {isExporting ? (
                      <>
                        <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Preparing Download...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                        Download as ZIP
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {exportedFiles && (
        <>
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">
                Deployment Instructions
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Follow these steps to deploy your verification site.
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 flex items-center">
                    <Github className="h-5 w-5 mr-2" /> GitHub Pages
                  </h3>
                  <ol className="mt-2 text-sm text-gray-600 list-decimal pl-5 space-y-2">
                    <li>Download the ZIP file using the button above</li>
                    <li>Create a new repository on GitHub</li>
                    <li>Upload the extracted files to the repository</li>
                    <li>Go to the repository settings</li>
                    <li>Scroll down to the GitHub Pages section</li>
                    <li>Select the main branch as the source</li>
                    <li>Your site will be published at <code>https://yourusername.github.io/repository-name/</code></li>
                  </ol>
                  <div className="mt-4">
                    <button
                      onClick={handleCopyDeployCommands}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="mr-1.5 h-3 w-3 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1.5 h-3 w-3" />
                          Copy deployment commands
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-md font-medium text-gray-900 flex items-center">
                    <Code className="h-5 w-5 mr-2" /> Netlify Drop
                  </h3>
                  <ol className="mt-2 text-sm text-gray-600 list-decimal pl-5 space-y-2">
                    <li>Download the ZIP file using the button above</li>
                    <li>Extract the ZIP file to a folder on your computer</li>
                    <li>Go to <a href="https://app.netlify.com/drop" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 inline-flex items-center">Netlify Drop <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                    <li>Drag and drop the folder to the upload area</li>
                    <li>Your site will be deployed immediately with a unique URL</li>
                    <li>You can customize the URL in the Netlify dashboard</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Preview</h2>
              <p className="mt-1 text-sm text-gray-500">
                Preview of the generated site files.
              </p>
            </div>
            
            <div className="border-t border-gray-200">
              <ul className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {Object.keys(exportedFiles).map((path) => (
                  <li key={path} className="px-4 py-3 flex justify-between items-center hover:bg-gray-50">
                    <div className="flex items-center">
                      <FileJson className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-900 font-mono">{path}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {(exportedFiles[path].length / 1024).toFixed(1)} KB
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportSite;