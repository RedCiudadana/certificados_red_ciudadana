import React, { useState } from 'react';
import { Download, Github, FileJson, FileText, ExternalLink, Copy, Check, Code, Globe, Zap, Shield, Search, BarChart3 } from 'lucide-react';
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleGeneratePreview = () => {
    setIsGenerating(true);
  
    setTimeout(() => {
      const files = generateStaticSite(certificates, recipients, templates);
  
      if (!files || !files['index.html'] || files['index.html'].trim().length === 0) {
        console.error("❌ Error: generateStaticSite no devolvió un index.html válido");
        setIsGenerating(false);
        return;
      }
  
      setExportedFiles(files);
  
      try {
        // Aseguramos que index.html tenga contenido
        const blob = new Blob([files['index.html']], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      } catch (err) {
        console.error("❌ Error creando vista previa:", err);
      }
  
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

This folder contains a complete static website for certificate verification.

## 🌟 Features

- **Modern Design**: Responsive design with Red Ciudadana branding
- **Real-time Search**: JavaScript-powered certificate verification
- **SEO Optimized**: Includes sitemap.xml and meta tags
- **Mobile Friendly**: Works perfectly on all devices
- **Fast Loading**: Optimized CSS and minimal dependencies
- **Security Headers**: Includes .htaccess with security configurations

## 📊 Statistics

- ${certificates.length} certificates available for verification
- ${recipients.length} certified recipients
- ${templates.length} certificate templates

## 🚀 Quick Deploy Options

### Option 1: Netlify (Recommended)
1. Go to [Netlify](https://netlify.com)
2. Drag and drop this entire folder to Netlify
3. Your site will be live instantly with HTTPS
4. Custom domain available

### Option 2: GitHub Pages
1. Create a new repository on GitHub
2. Upload these files to the repository
3. Go to the repository settings
4. Scroll down to the GitHub Pages section
5. Select the main branch as the source
6. Your site will be published at \`https://yourusername.github.io/repository-name/\`

### Option 3: Vercel
1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository or upload files
3. Deploy with one click
4. Automatic HTTPS and global CDN

### Option 4: Traditional Web Hosting
1. Upload all files to your web hosting via FTP
2. Point your domain to the folder
3. The .htaccess file will handle Apache configurations

## File Structure

\`\`\`
certificate-verification-site/
├── index.html              # Main verification page
├── verify/                 # Individual certificate pages
│   ├── CERT-001.html      # Certificate verification pages
│   └── ...
├── 404.html               # Custom error page
├── sitemap.xml            # SEO sitemap
├── robots.txt             # Search engine instructions
├── .htaccess              # Apache server configuration
└── README.md              # This file
\`\`\`

## 🔧 Customization

- Edit the CSS in the \`<style>\` section of index.html to match your branding
- Update contact information in the footer
- Modify the hero section text and statistics
- Add your own domain name in sitemap.xml

## 📱 Testing

1. Open index.html in a web browser
2. Test certificate verification with existing IDs
3. Check mobile responsiveness
4. Verify all links work correctly

## 🔒 Security Features

- XSS protection headers
- Content type validation
- Frame options security
- Compressed file delivery
- Cache optimization

## 📞 Support

For technical support or questions about the verification system:
- Email: info@redciudadana.org.gt
- Website: https://redciudadana.org

---

Generated on ${new Date().toLocaleDateString('es-ES')} by Red Ciudadana Certificate System
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
        <h1 className="text-3xl font-bold text-gray-900">Exportar Sitio de Verificación</h1>
        <p className="mt-2 text-lg text-gray-600">
          Genera un sitio web estático completo para verificar certificados con diseño profesional.
        </p>
      </div>
      
      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
          <div className="flex items-center">
            <Globe className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sitio Completo</p>
              <p className="text-2xl font-bold text-gray-900">Listo</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Despliegue</p>
              <p className="text-2xl font-bold text-gray-900">Rápido</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Seguridad</p>
              <p className="text-2xl font-bold text-gray-900">Incluida</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-gray-500">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-gray-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SEO</p>
              <p className="text-2xl font-bold text-gray-900">Optimizado</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
        <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Globe className="mr-3 h-7 w-7 text-gray-600" />
            Generar Sitio de Verificación
          </h2>
          <p className="text-gray-600 mt-2">
            Crea un sitio web estático completo con páginas de verificación para todos tus certificados.
            Compatible con GitHub Pages, Netlify, Vercel y cualquier servicio de hosting estático.
          </p>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-50 to-gray-50 rounded-xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-gray-600" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Estadísticas del Sitio</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-700">{certificates.length}</div>
                      <div className="text-sm text-gray-600">Certificados</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-700">{recipients.length}</div>
                      <div className="text-sm text-gray-600">Destinatarios</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-700">{templates.length}</div>
                      <div className="text-sm text-gray-600">Plantillas</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {certificates.length === 0 ? (
              <div className="bg-yellow-50 rounded-xl p-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No se encontraron certificados
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        Necesitas generar al menos un certificado antes de poder exportar un sitio de verificación.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
                {!exportedFiles ? (
                  <button
                    onClick={handleGeneratePreview}
                    disabled={isGenerating || certificates.length === 0}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white text-sm font-medium rounded-xl hover:from-gray-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    {isGenerating ? (
                      <>
                        <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                        Generando Sitio...
                      </>
                    ) : (
                      <>
                        <Globe className="mr-2 h-5 w-5" aria-hidden="true" />
                        Generar Sitio Web
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={handleExportZip}
                      disabled={isExporting}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white text-sm font-medium rounded-xl hover:from-gray-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-lg"
                    >
                      {isExporting ? (
                        <>
                          <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          Preparando Descarga...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-5 w-5" aria-hidden="true" />
                          Descargar Sitio ZIP
                        </>
                      )}
                    </button>
                    
                    {previewUrl && (
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-600 text-white text-sm font-medium rounded-xl hover:from-gray-700 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-lg"
                      >
                        <ExternalLink className="mr-2 h-5 w-5" />
                        Vista Previa
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {exportedFiles && (
        <>
          {/* Site Features */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Zap className="mr-3 h-7 w-7 text-gray-600" />
                Características del Sitio Generado
              </h2>
              <p className="text-gray-600 mt-2">
                Tu sitio incluye todas estas características profesionales
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Globe className="h-8 w-8 text-gray-600" />
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">Diseño Moderno</h3>
                  </div>
                  <ul className="text-sm text-gray-800 space-y-2">
                    <li>• Diseño responsive para móviles</li>
                    <li>• Branding de Red Ciudadana</li>
                    <li>• Interfaz intuitiva y profesional</li>
                    <li>• Animaciones y transiciones suaves</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Search className="h-8 w-8 text-gray-600" />
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">Búsqueda Avanzada</h3>
                  </div>
                  <ul className="text-sm text-gray-800 space-y-2">
                    <li>• Búsqueda en tiempo real</li>
                    <li>• Soporte para IDs parciales</li>
                    <li>• Validación instantánea</li>
                    <li>• Mensajes de error claros</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Shield className="h-8 w-8 text-gray-600" />
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">Seguridad</h3>
                  </div>
                  <ul className="text-sm text-gray-800 space-y-2">
                    <li>• Headers de seguridad incluidos</li>
                    <li>• Protección XSS</li>
                    <li>• Configuración Apache (.htaccess)</li>
                    <li>• Validación de contenido</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-600" />
                    <h3 className="ml-3 text-lg font-semibold text-gray-900">SEO Optimizado</h3>
                  </div>
                  <ul className="text-sm text-gray-800 space-y-2">
                    <li>• Sitemap.xml incluido</li>
                    <li>• Meta tags optimizados</li>
                    <li>• Robots.txt configurado</li>
                    <li>• URLs amigables</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <Zap className="h-8 w-8 text-red-600" />
                    <h3 className="ml-3 text-lg font-semibold text-red-900">Rendimiento</h3>
                  </div>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>• CSS optimizado y minificado</li>
                    <li>• Carga rápida sin dependencias</li>
                    <li>• Compresión habilitada</li>
                    <li>• Cache optimizado</li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <FileJson className="h-8 w-8 text-indigo-600" />
                    <h3 className="ml-3 text-lg font-semibold text-indigo-900">Archivos Incluidos</h3>
                  </div>
                  <ul className="text-sm text-indigo-800 space-y-2">
                    <li>• Página principal (index.html)</li>
                    <li>• Páginas de verificación individuales</li>
                    <li>• Página 404 personalizada</li>
                    <li>• Documentación completa</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Code className="mr-3 h-7 w-7 text-gray-600" />
                Instrucciones de Despliegue
              </h2>
              <p className="text-gray-600 mt-2">
                Sigue estos pasos para publicar tu sitio de verificación
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Zap className="h-6 w-6 mr-2" /> Netlify (Recomendado)
                  </h3>
                  <ol className="text-sm text-gray-800 list-decimal pl-5 space-y-2">
                    <li>Descarga el archivo ZIP usando el botón de arriba</li>
                    <li>Ve a <a href="https://netlify.com" target="_blank" className="text-gray-600 underline">Netlify.com</a> y crea una cuenta gratuita</li>
                    <li>Arrastra y suelta la carpeta extraída en Netlify</li>
                    <li>Tu sitio estará en línea instantáneamente con HTTPS</li>
                    <li>Opcionalmente configura un dominio personalizado</li>
                  </ol>
                  <div className="mt-4 p-3 bg-gray-200 rounded-lg">
                    <p className="text-sm text-gray-800">
                      <strong>✨ Ventajas:</strong> Despliegue instantáneo, HTTPS automático, CDN global, dominio personalizado gratuito
                    </p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Github className="h-6 w-6 mr-2" /> GitHub Pages
                  </h3>
                  <ol className="text-sm text-gray-700 list-decimal pl-5 space-y-2">
                    <li>Descarga el archivo ZIP usando el botón de arriba</li>
                    <li>Crea un nuevo repositorio en GitHub</li>
                    <li>Sube los archivos extraídos al repositorio</li>
                    <li>Ve a la configuración del repositorio</li>
                    <li>Busca la sección GitHub Pages</li>
                    <li>Selecciona la rama principal como fuente</li>
                    <li>Tu sitio estará en <code className="bg-gray-200 px-2 py-1 rounded">https://tuusuario.github.io/nombre-repositorio/</code></li>
                  </ol>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={handleCopyDeployCommands}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                      {hasCopied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copiar comandos Git
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Code className="h-6 w-6 mr-2" /> Vercel
                  </h3>
                  <ol className="text-sm text-gray-800 list-decimal pl-5 space-y-2">
                    <li>Ve a <a href="https://vercel.com" target="_blank" className="text-gray-600 underline">Vercel.com</a></li>
                    <li>Importa tu repositorio de GitHub o sube archivos</li>
                    <li>Despliega con un clic</li>
                    <li>HTTPS automático y CDN global incluidos</li>
                  </ol>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                    <Globe className="h-6 w-6 mr-2" /> Hosting Tradicional
                  </h3>
                  <ol className="text-sm text-gray-800 list-decimal pl-5 space-y-2">
                    <li>Sube todos los archivos a tu hosting web vía FTP</li>
                    <li>Apunta tu dominio a la carpeta</li>
                    <li>El archivo .htaccess manejará las configuraciones de Apache</li>
                    <li>Verifica que el sitio funcione correctamente</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="px-6 py-6 bg-gradient-to-r from-gray-50 to-gray-50 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileJson className="mr-3 h-7 w-7 text-gray-600" />
                Archivos Generados
              </h2>
              <p className="text-gray-600 mt-2">
                Vista previa de todos los archivos incluidos en tu sitio web
              </p>
            </div>
            
            <div>
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {Object.keys(exportedFiles).map((path) => (
                  <li key={path} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center">
                      {path.endsWith('.html') ? (
                        <Globe className="h-5 w-5 text-gray-500 mr-3" />
                      ) : path.endsWith('.xml') ? (
                        <Code className="h-5 w-5 text-gray-500 mr-3" />
                      ) : path.endsWith('.txt') ? (
                        <FileText className="h-5 w-5 text-gray-500 mr-3" />
                      ) : (
                        <FileJson className="h-5 w-5 text-gray-400 mr-3" />
                      )}
                      <div>
                        <span className="text-sm text-gray-900 font-mono">{path}</span>
                        {path === 'index.html' && <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Página Principal</span>}
                        {path === '404.html' && <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Error 404</span>}
                        {path === 'sitemap.xml' && <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">SEO</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>{(exportedFiles[path].length / 1024).toFixed(1)} KB</div>
                      {path.startsWith('verify/') && <div className="text-xs text-gray-600">Verificación</div>}
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