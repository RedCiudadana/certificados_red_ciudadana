import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Certificate, Recipient, Template } from '../types';
import JSZip from 'jszip';
import { toPng, toJpeg } from 'html-to-image';

// Helper function to wait for all images to load
const waitForImagesToLoad = async (element: HTMLElement): Promise<void> => {
  const images = element.querySelectorAll('img');
  const imagePromises = Array.from(images).map(img => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails to load
      // Fallback timeout
      setTimeout(() => resolve(), 10000);
    });
  });
  
  // Also wait for background images
  const elementsWithBgImages = element.querySelectorAll('*');
  const bgImagePromises = Array.from(elementsWithBgImages).map(el => {
    const bgImage = window.getComputedStyle(el).backgroundImage;
    if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
      const imageUrl = bgImage.match(/url\(["']?([^"']*)["']?\)/)?.[1];
      if (imageUrl) {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Continue even if image fails to load
          img.src = imageUrl;
          // Fallback timeout
          setTimeout(() => resolve(), 10000);
        });
      }
    }
    return Promise.resolve();
  });
  
  await Promise.all([...imagePromises, ...bgImagePromises]);
  
  // Additional wait for rendering
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const generateStaticSite = (
  certificates: Certificate[],
  recipients: Recipient[],
  templates: Template[]
): Record<string, string> => {
  const files: Record<string, string> = {};

  // Common HTML components with Red Ciudadana branding
  const head = `
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Verificación de Certificados - Red Ciudadana</title>
  <meta name="description" content="Verify the authenticity of digital certificates">
  <link rel="shortcut icon" type="image/x-icon" href="https://www.redciudadana.org/assets/img/redciudadana.png">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8fafc; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .header { background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 1rem 0; }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .logo img { height: 50px; }
    .nav-links { display: flex; gap: 2rem; }
    .nav-links a { text-decoration: none; color: #4a5568; font-weight: 500; }
    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 0; text-align: center; }
    .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
    .hero p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
    .search-container { background: white; padding: 3rem 0; }
    .search-box { max-width: 600px; margin: 0 auto; display: flex; gap: 1rem; }
    .search-input { flex: 1; padding: 1rem; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1.1rem; }
    .search-btn { padding: 1rem 2rem; background: #4299e1; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .search-btn:hover { background: #3182ce; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin: 3rem 0; }
    .stat-card { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
    .stat-number { font-size: 2.5rem; font-weight: bold; color: #4299e1; }
    .stat-label { color: #718096; margin-top: 0.5rem; }
    .certificate-valid { background: #f0fff4; border: 2px solid #68d391; border-radius: 12px; padding: 2rem; margin: 2rem 0; }
    .certificate-invalid { background: #fff5f5; border: 2px solid #fc8181; border-radius: 12px; padding: 2rem; margin: 2rem 0; }
    .certificate-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin: 1rem 0; }
    .detail-item { background: white; padding: 1rem; border-radius: 8px; }
    .detail-label { font-weight: 600; color: #4a5568; font-size: 0.9rem; }
    .detail-value { color: #2d3748; margin-top: 0.25rem; }
    .footer { background: #2d3748; color: white; padding: 3rem 0 1rem; margin-top: 4rem; }
    .footer-content { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
    .footer-section h3 { margin-bottom: 1rem; }
    .footer-section a { color: #a0aec0; text-decoration: none; }
    .footer-section a:hover { color: white; }
    .footer-bottom { text-align: center; padding-top: 2rem; border-top: 1px solid #4a5568; margin-top: 2rem; color: #a0aec0; }
    .btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 8px; text-decoration: none; font-weight: 600; transition: all 0.2s; }
    .btn-primary { background: #4299e1; color: white; }
    .btn-primary:hover { background: #3182ce; }
    .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin: 3rem 0; }
    .step { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
    .step-number { width: 60px; height: 60px; background: #4299e1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: bold; margin: 0 auto 1rem; }
    .step h3 { margin-bottom: 1rem; color: #2d3748; }
    .step p { color: #718096; }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2rem; }
      .search-box { flex-direction: column; }
      .header-content { flex-direction: column; gap: 1rem; }
    }
  </style>
</head>`;

  const header = `
<header class="header">
  <div class="container">
    <div class="header-content">
      <div class="logo">
        <a href="index.html">
          <img src="https://www.redciudadana.org/assets/img/red/LOGO-RED_NEGRO.png" alt="Red Ciudadana" />
        </a>
      </div>
      <nav class="nav-links">
        <a href="index.html">Inicio</a>
        <a href="https://redciudadana.org" target="_blank">Red Ciudadana</a>
      </nav>
    </div>
  </div>
</header>`;

  const footer = `
<footer class="footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-section">
        <img src="https://www.redciudadana.org/assets/img/footer_2025/WEB_PI-67.png" alt="Red Ciudadana" style="height: 60px; margin-bottom: 1rem;">
        <p>En Red Ciudadana trabajamos para fortalecer la transparencia, promover la participación ciudadana y construir un futuro más justo e inclusivo para todos los guatemaltecos.</p>
      </div>
      <div class="footer-section">
        <h3>Enlaces</h3>
        <p><a href="index.html">Verificar Certificado</a></p>
        <p><a href="https://redciudadana.org" target="_blank">Red Ciudadana</a></p>
      </div>
      <div class="footer-section">
        <h3>Contacto</h3>
        <p>Zona 10, Ciudad de Guatemala, Guatemala</p>
        <p>info@redciudadana.org.gt</p>
        <p>Lunes a Viernes, 8:00am - 5:00pm</p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>© 2025 Asociación Civil Red Ciudadana. Todos los derechos reservados.</p>
    </div>
  </div>
</footer>`;

  // Generate main index.html with enhanced design
  files['index.html'] = `
<!DOCTYPE html>
<html lang="es">
${head}
<body>
${header}

<section class="hero">
  <div class="container">
    <h1>Verificación de Certificados</h1>
    <p>Sistema oficial de verificación de certificados digitales de Red Ciudadana</p>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number">${certificates.length}</div>
        <div class="stat-label">Certificados Emitidos</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${recipients.length}</div>
        <div class="stat-label">Estudiantes Certificados</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${templates.length}</div>
        <div class="stat-label">Programas Disponibles</div>
      </div>
    </div>
  </div>
</section>

<section class="search-container">
  <div class="container">
    <div class="search-box">
      <input type="text" id="certificate-id" class="search-input" placeholder="Ingresa el ID del certificado (ej: 1234 o CERT-2024-001)">
      <button class="search-btn" onclick="verifyCertificate()">Verificar Certificado</button>
    </div>
    <div id="search-result"></div>
  </div>
</section>

<section class="container">
  <h2 style="text-align: center; margin: 3rem 0 2rem; color: #2d3748; font-size: 2.5rem;">Cómo Verificar un Certificado</h2>
  <div class="steps">
    <div class="step">
      <div class="step-number">1</div>
      <h3>Busca el Código</h3>
      <p>Localiza el número de identificación en tu certificado. Puede ser de 4 dígitos o el código completo.</p>
    </div>
    <div class="step">
      <div class="step-number">2</div>
      <h3>Ingresa el Código</h3>
      <p>Escribe el código en el buscador de arriba y presiona "Verificar Certificado".</p>
    </div>
    <div class="step">
      <div class="step-number">3</div>
      <h3>Ver Detalles</h3>
      <p>La página te mostrará todos los detalles del certificado y confirmará su autenticidad.</p>
    </div>
  </div>
</section>

${footer}

<script>
const certificates = ${JSON.stringify(certificates.map(cert => {
    const recipient = recipients.find(r => r.id === cert.recipientId);
    return {
      id: cert.id,
      recipientName: recipient?.name || 'Unknown',
      course: recipient?.course || 'Unknown Course',
      issueDate: recipient?.issueDate || cert.issueDate,
      status: cert.status
    };
  }))};

function verifyCertificate() {
  const id = document.getElementById('certificate-id').value.trim();
  const resultDiv = document.getElementById('search-result');
  
  if (!id) {
    showResult('Por favor ingresa un ID de certificado.', 'error');
    return;
  }
  
  // Show loading
  resultDiv.innerHTML = '<div style="text-align: center; padding: 2rem;"><div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top: 4px solid #4299e1; border-radius: 50%; animation: spin 1s linear infinite;"></div><p style="margin-top: 1rem; color: #718096;">Verificando certificado...</p></div>';
  
  setTimeout(() => {
    const certificate = certificates.find(c => 
      c.id === id || 
      c.id.slice(-4) === id || 
      c.id.toLowerCase().includes(id.toLowerCase())
    );
    
    if (certificate) {
      window.location.href = 'verify/' + certificate.id + '.html';
    } else {
      showResult('Certificado no encontrado. Verifica que el ID sea correcto.', 'error');
    }
  }, 1500);
}

function showResult(message, type) {
  const resultDiv = document.getElementById('search-result');
  const className = type === 'error' ? 'certificate-invalid' : 'certificate-valid';
  resultDiv.innerHTML = '<div class="' + className + '"><p>' + message + '</p></div>';
}

// Allow Enter key to trigger search
document.getElementById('certificate-id').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    verifyCertificate();
  }
});
</script>

<style>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

</body>
</html>`;

  // Generate individual verification pages
  certificates.forEach(certificate => {
    const recipient = recipients.find(r => r.id === certificate.recipientId);
    const template = templates.find(t => t.id === certificate.templateId);
    
    if (recipient && template) {
      files[`verify/${certificate.id}.html`] = `
<!DOCTYPE html>
<html lang="es">
${head}
<body>
${header}

<section class="hero" style="padding: 2rem 0;">
  <div class="container">
    <h1 style="color: #22c55e; font-size: 2.5rem;">✓ Certificado Válido</h1>
    <p>Este certificado es auténtico y ha sido verificado exitosamente</p>
  </div>
</section>

<section class="container" style="margin: 3rem auto;">
  <div class="certificate-valid">
    <h2 style="color: #16a34a; margin-bottom: 2rem; text-align: center;">Detalles del Certificado</h2>
    <div class="certificate-details">
      <div class="detail-item">
        <div class="detail-label">Nombre del Destinatario</div>
        <div class="detail-value" style="font-size: 1.2rem; font-weight: 600;">${recipient.name}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Fecha de Emisión</div>
        <div class="detail-value">${new Date(recipient.issueDate).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</div>
      </div>
      ${recipient.course ? `
      <div class="detail-item">
        <div class="detail-label">Curso/Programa</div>
        <div class="detail-value">${recipient.course}</div>
      </div>` : ''}
      <div class="detail-item">
        <div class="detail-label">ID del Certificado</div>
        <div class="detail-value" style="font-family: monospace; background: #f7fafc; padding: 0.5rem; border-radius: 4px;">${certificate.id}</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Estado</div>
        <div class="detail-value" style="color: #16a34a; font-weight: 600;">✓ Verificado y Válido</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Institución Emisora</div>
        <div class="detail-value">Red Ciudadana</div>
      </div>
    </div>
    
    ${recipient.customFields && Object.keys(recipient.customFields).length > 0 ? `
    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
      <h3 style="color: #4a5568; margin-bottom: 1rem;">Información Adicional</h3>
      <div class="certificate-details">
        ${Object.entries(recipient.customFields).map(([key, value]) => `
        <div class="detail-item">
          <div class="detail-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
          <div class="detail-value">${value}</div>
        </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0;">
      <a href="index.html" class="btn btn-primary" style="margin-right: 1rem;">Verificar Otro Certificado</a>
      <a href="https://redciudadana.org" target="_blank" class="btn" style="background: #6b7280; color: white;">Visitar Red Ciudadana</a>
    </div>
  </div>
</section>

${footer}
</body>
</html>`;
    }
  });

  // Generate 404 page
  files['404.html'] = `
<!DOCTYPE html>
<html lang="es">
${head}
<body>
${header}

<section class="hero" style="padding: 2rem 0;">
  <div class="container">
    <h1 style="color: #ef4444; font-size: 2.5rem;">❌ Certificado No Encontrado</h1>
    <p>El ID ingresado no corresponde a un certificado válido en nuestra base de datos</p>
  </div>
</section>

<section class="container" style="margin: 3rem auto;">
  <div class="certificate-invalid">
    <h2 style="color: #dc2626; margin-bottom: 2rem; text-align: center;">Certificado No Válido</h2>
    <div style="text-align: center;">
      <p style="font-size: 1.1rem; margin-bottom: 2rem; color: #7f1d1d;">
        El código de certificado que ingresaste no existe en nuestro sistema de verificación.
      </p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1.5rem; margin: 2rem 0;">
        <h3 style="color: #991b1b; margin-bottom: 1rem;">Posibles causas:</h3>
        <ul style="text-align: left; color: #7f1d1d; max-width: 400px; margin: 0 auto;">
          <li>El ID del certificado fue ingresado incorrectamente</li>
          <li>El certificado aún no ha sido publicado</li>
          <li>El certificado ha sido revocado o cancelado</li>
          <li>El ID no pertenece a un certificado de Red Ciudadana</li>
        </ul>
      </div>
      <div style="margin-top: 2rem;">
        <a href="index.html" class="btn btn-primary" style="margin-right: 1rem;">Intentar Nuevamente</a>
        <a href="https://redciudadana.org/contacto" target="_blank" class="btn" style="background: #6b7280; color: white;">Contactar Soporte</a>
      </div>
    </div>
  </div>
</section>

${footer}
</body>
</html>`;

  // Generate sitemap.xml for SEO
  files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://certificados.redciudadana.org/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  ${certificates.map(cert => `
  <url>
    <loc>https://certificados.redciudadana.org/verify/${cert.id}.html</loc>
    <lastmod>${cert.issueDate.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

  // Generate robots.txt
  files['robots.txt'] = `User-agent: *
Allow: /

Sitemap: https://certificados.redciudadana.org/sitemap.xml`;

  // Generate .htaccess for Apache servers
  files['.htaccess'] = `# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>

# Custom 404 page
ErrorDocument 404 /404.html

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
</IfModule>`;
  return files;
};

export const generateCertificatePDF = async (
  certificateRef: HTMLElement,
  filename: string = 'certificate'
): Promise<void> => {
  try {
    // Generate canvas with better settings
    const canvas = await html2canvas(certificateRef, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: 1200,
      height: 848,
      foreignObjectRendering: false,
      imageTimeout: 15000
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    
    // Check if canvas is blank
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering failed - empty canvas');
    }
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const imgProps = pdf.getImageProperties(imgData);
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // cover = escalar para que cubra toda la hoja
    const scale = Math.max(pageW / imgProps.width, pageH / imgProps.height);
    const drawW = imgProps.width * scale;
    const drawH = imgProps.height * scale;

    // centrar (puede recortar arriba/abajo o izquierda/derecha)
    const x = (pageW - drawW) / 2;
    const y = (pageH - drawH) / 2;

    pdf.addImage(imgData, 'PNG', x, y, drawW, drawH);


    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
};

export const downloadAllCertificatesAsPDF = async (
  certificates: Certificate[],
  recipients: Recipient[],
  templates: Template[]
): Promise<void> => {
  if (certificates.length === 0) {
    alert('No hay certificados para descargar.');
    return;
  }

  let globalContainer: HTMLDivElement | null = null;
  try {
    const zip = new JSZip();
    let successCount = 0;
    let errorCount = 0;

    // Ensure fonts are loaded
    try {
      // @ts-ignore
      if (document.fonts && document.fonts.ready) {
        // @ts-ignore
        await document.fonts.ready;
      }
    } catch {}

    // Create one reusable offscreen container for faster rendering
    globalContainer = document.createElement('div');
    globalContainer.style.position = 'fixed';
    globalContainer.style.left = '-9999px';
    globalContainer.style.top = '0';
    globalContainer.style.width = '1200px';
    globalContainer.style.height = '848px';
    globalContainer.style.zIndex = '0';
    globalContainer.style.backgroundColor = 'white';
    document.body.appendChild(globalContainer);

    const renderCertificateToBlob = async (
      recipient: Recipient,
      template: Template
    ): Promise<Blob | null> => {
      try {
        const certificateDiv = document.createElement('div');
        certificateDiv.className = 'certificate-preview';
        certificateDiv.style.width = '100%';
        certificateDiv.style.height = '100%';
        certificateDiv.style.position = 'relative';
        certificateDiv.style.backgroundColor = 'white';
        certificateDiv.style.overflow = 'hidden';

        const backgroundImg = document.createElement('img');
        backgroundImg.src = template.imageUrl;
        backgroundImg.alt = 'Certificate template';
        backgroundImg.crossOrigin = 'anonymous';
        backgroundImg.style.position = 'absolute';
        backgroundImg.style.top = '0';
        backgroundImg.style.left = '0';
        backgroundImg.style.width = '100%';
        backgroundImg.style.height = '100%';
        backgroundImg.style.objectFit = 'cover';
        backgroundImg.style.zIndex = '0';
        certificateDiv.appendChild(backgroundImg);

        await new Promise(resolve => {
          if (backgroundImg.complete) return resolve(void 0);
          backgroundImg.onload = () => resolve(void 0);
          backgroundImg.onerror = () => resolve(void 0);
          setTimeout(() => resolve(void 0), 10000);
        });

        template.fields.forEach(field => {
          if (field.type === 'qrcode') return;
          const fieldDiv = document.createElement('div');
          fieldDiv.style.position = 'absolute';
          fieldDiv.style.left = `${field.x}%`;
          fieldDiv.style.top = `${field.y}%`;
          fieldDiv.style.transform = 'translate(-50%, -50%)';
          fieldDiv.style.textAlign = 'center';
          fieldDiv.style.width = '100%';
          fieldDiv.style.maxWidth = '80%';
          fieldDiv.style.fontFamily = field.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
          fieldDiv.style.fontSize = `${(field.fontSize || 16)}px`;
          // Unificar color de fuente según masivo en ambos flujos
          fieldDiv.style.color = field.color || '#000';
          // Forzar bold como en masivo
          fieldDiv.style.fontWeight = 'bold';
          fieldDiv.style.textShadow = '2px 2px 4px rgba(255,255,255,0.8)';
          fieldDiv.style.whiteSpace = 'nowrap';
          fieldDiv.style.zIndex = '10';
          fieldDiv.style.overflow = 'visible';

          let textValue = '';
          switch (field.type) {
            case 'text':
              if (field.name === 'recipient') {
                // Usar la misma lógica del singular para el nombre
                textValue = recipient.name;
              } else if (field.name === 'course') {
                textValue = recipient.course || field.defaultValue || '';
              } else if (recipient.customFields && recipient.customFields[field.name]) {
                textValue = recipient.customFields[field.name];
              } else {
                textValue = field.defaultValue || '';
              }
              break;
            case 'date':
              textValue = new Date(recipient.issueDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              break;
          }
          fieldDiv.textContent = textValue;
          certificateDiv.appendChild(fieldDiv);
        });

        if (!globalContainer) return null;
        globalContainer.appendChild(certificateDiv);

        await waitForImagesToLoad(certificateDiv);

        // Render to JPEG for faster encoding and smaller files
        const dataUrl = await toJpeg(certificateDiv, {
          quality: 0.92,
          pixelRatio: 1.5,
          backgroundColor: '#ffffff',
          cacheBust: false
        });

        if (!dataUrl || dataUrl.length < 1000) return null;

        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
        const imgProps = pdf.getImageProperties(dataUrl);
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const scale = Math.max(pageW / imgProps.width, pageH / imgProps.height);
        const drawW = imgProps.width * scale;
        const drawH = imgProps.height * scale;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;
        pdf.addImage(dataUrl, 'PNG', x, y, drawW, drawH);
        return pdf.output('blob');
      } catch {
        return null;
      } finally {
        // Clean per-certificate nodes
        while (globalContainer && globalContainer.firstChild) {
          globalContainer.removeChild(globalContainer.firstChild);
        }
      }
    };

    // Concurrency tuned to CPU cores for speed without freezing the UI
    const cores = (navigator as any).hardwareConcurrency || 4;
    const concurrency = Math.min(8, cores * 2);
    let pointer = 0;
    while (pointer < certificates.length) {
      const slice = certificates.slice(pointer, pointer + concurrency);
      await Promise.all(
        slice.map(async cert => {
          const recipient = recipients.find(r => r.id === cert.recipientId);
          const template = templates.find(t => t.id === cert.templateId);
          if (!recipient || !template) {
            errorCount++;
            return;
          }
          const blob = await renderCertificateToBlob(recipient, template);
          if (blob) {
            const fileName = `${recipient.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate.pdf`;
            zip.file(fileName, blob);
            successCount++;
          } else {
            errorCount++;
          }
        })
      );
      pointer += concurrency;
    }

    if (successCount > 0) {
      // Use STORE (no compression) to significantly speed up zipping
      const content = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
      saveAs(content, `certificados-${new Date().toISOString().split('T')[0]}.zip`);
      if (errorCount > 0) {
        alert(`Se descargaron ${successCount} certificados exitosamente. ${errorCount} certificados fallaron.`);
      }
    } else {
      throw new Error('No se pudo generar ningún certificado PDF.');
    }

  } catch (error) {
    console.error('Error generating certificates:', error);
    alert('Hubo un error al generar los certificados. Por favor, inténtelo de nuevo.');
  } finally {
    // Remove reusable container
    if (globalContainer && document.body.contains(globalContainer)) {
      document.body.removeChild(globalContainer);
    }
  }
};

export const generateCertificateImage = async (
  certificateRef: HTMLElement,
  filename: string = 'certificate'
): Promise<void> => {
  try {
    // Wait for all images to load completely
    await waitForImagesToLoad(certificateRef);
    
    const dataUrl = await toPng(certificateRef, { 
      quality: 1.0,
      pixelRatio: 3,
      backgroundColor: '#ffffff'
    });
    
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    saveAs(blob, `${filename}.png`);
  } catch (error) {
    console.error('Error generating certificate image:', error);
    throw error;
  }
};