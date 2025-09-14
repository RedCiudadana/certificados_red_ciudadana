import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Certificate, Recipient, Template } from '../types';
import JSZip from 'jszip';
import { toPng } from 'html-to-image';

export const generateStaticSite = (
  certificates: Certificate[],
  recipients: Recipient[],
  templates: Template[]
): Record<string, string> => {
  const files: Record<string, string> = {};

  // Partes comunes
  const head = `
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Verification System</title>
  <meta name="description" content="Verify the authenticity of digital certificates">
  <link rel="shortcut icon" type="image/x-icon" href="/assets/img/redciudadana.png">
  <link rel="stylesheet" href="/assets/css/main.css">
  <link rel="stylesheet" href="/assets/css/footer.css">
  <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
</head>`;

  const header = `
<header class="default-header">
  <div class="main-menu-area menu-2 pl-155 pr-115">
    <div class="container-fluid">
      <div class="row d-flex align-items-center padmen" id="menu">
        <div class="col-xl-2 col-lg-3 p0">
          <div class="logo">
            <a href="/index.html"><img src="/assets/img/LOGO-RED_NEGRO.png" alt="Logo Red Ciudadana" style="margin: 0 5%;" /></a>
          </div>
        </div>
        <div class="col-xl-7 col-lg-9">
          <div class="main-menu f-left ml-120">
            <nav id="mobile-menu">
              <ul class="nav-items">
                <li id="inicio"><a href="/index.html">INICIO</a></li>
              </ul>
            </nav>
          </div>
        </div>
        <div class="col-xl-3 col-lg-3 d-none d-xl-block flex-container2">
          <div class="header-02-wrapper">
            <div class="header-lang mr-10 pos-rel f-right">
              <div class="lang-icon traduccion">
                <img width="22%" src="/assets/img/red/BANDERA.png" alt="Red Ciudadan Ingles">
                <a class="notranslate" href="https://redciudadana-org.translate.goog/index.html?_x_tr_sl=es&_x_tr_tl=en&_x_tr_hl=es&_x_tr_pto=wapp">En</a>
                <span>|</span>
                <a class="notranslate" href="https://redciudadana.org/">Es</a>
              </div>
            </div>
            <div class="header-icon header-02-icon f-right">
              <a target="_blank" href="https://www.instagram.com/redxguate/"><i class="fab fa-instagram"></i></a>
              <a target="_blank" href="https://www.tiktok.com/@redxguate"><i class="fa-brands fa-tiktok"></i></a>
              <a target="_blank" href="https://twitter.com/redxguate"><i class="fa-brands fa-x-twitter"></i></a>
              <a target="_blank" href="https://www.facebook.com/Redciudadanagt"><i class="fab fa-facebook-f"></i></a>
              <a target="_blank" href="https://www.youtube.com/channel/UCQwc62j7beStZYFzwPxBEQg"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="mobile-menu"></div>
        </div>
      </div>
    </div>
  </div>
</header>`;

  const footer = `
<footer>
  <div class="py-4" style="background-color: black;">
    <div class="container">
      <div class="row">
        <div class="col-lg-5 my-2">
          <img class="logo_footer" src="/assets/img/footer_2025/WEB_PI-67.png">
          <p class="text_footer">
            En Red Ciudadana trabajamos para fortalecer la transparencia,
            promover la participación ciudadana y construir un futuro más 
            justo e inclusivo para todos los guatemaltecos.
          </p>
          <div class="d-flex">
            <a href="https://www.facebook.com/Redciudadanagt"><img class="red_footer" src="/assets/img/footer_2025/WEB_PI-62.png"></a>
            <a href="https://twitter.com/redxguate"><img class="red_footer" src="/assets/img/footer_2025/WEB_PI-63.png"></a>
            <a href="https://www.instagram.com/redxguate/"><img class="red_footer" src="/assets/img/footer_2025/WEB_PI-64.png"></a>
            <a href="https://www.linkedin.com/company/red-ciudadana"><img class="red_footer" src="/assets/img/footer_2025/WEB_PI-65.png"></a>
            <a href="https://www.youtube.com/channel/UCQwc62j7beStZYFzwPxBEQg"><img class="red_footer" src="/assets/img/footer_2025/WEB_PI-66.png"></a>
          </div>
        </div>
        <div class="col-lg-3 my-2 flex-container">
          <div class="links-footer text-left">
            <a href="/index.html">Inicio</a>
          </div>                          
        </div>
        <div class="col-lg-4 my-2 flex-container2">
          <div>
            <h4 class="title_footer">Dirección</h4>
            <p class="text_footer">Zona 10, Ciudad de Guatemala, Guatemala</p>
            <h4 class="title_footer">Correo Electrónico</h4>
            <p class="text_footer">info@redciudadana.org.gt</p>
            <h4 class="title_footer">Horario de Atención</h4>
            <p class="text_footer">Lunes a Viernes, 8:00am - 5:00pm</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="py-4" style="background-color: white;">
    <div class="container">
      <div class="row">
        <div class="col-lg-12 text-center">
          <p class="text_footer_2">Asociación Civil Red Ciudadana 2025</p>
        </div>
      </div>
    </div>
  </div>
</footer>
<script src="/assets/js/bootstrap.min.js"></script>
<script src="/assets/js/jquery-1.12.4.min.js"></script>`;

  // Generate main index.html
  files['index.html'] = `
<!DOCTYPE html>
<html lang="en">
${head}
<body>
${header}
<div style="background-color: #eff0f4;">
  <div class="container py-5">
    <div class="row justify-content-center mb-5">
      <div class="col-md-12" style="background-color: #fff;">
        <div class="input-group search-box">
          <input id="certificate-id" type="text" class="form-control" placeholder="Ingresa el ID del certificado...">
          <button class="btn btn-dark" type="button" onclick="verifyCertificate()">Verificar →</button>
        </div>
      </div>
    </div>
  </div>
</div>
${footer}
<script>
function verifyCertificate() {
  const id = document.getElementById('certificate-id').value.trim();
  if (id) {
    window.location.href = '/verify/' + id + '.html';
  }
}
</script>
</body>
</html>`;

  // Generate individual verification pages
  certificates.forEach(certificate => {
    const recipient = recipients.find(r => r.id === certificate.recipientId);
    const template = templates.find(t => t.id === certificate.templateId);
    
    if (recipient && template) {
      files[`verify/${certificate.id}.html`] = `
<!DOCTYPE html>
<html lang="en">
${head}
<body>
${header}
<div style="background-color: #eff0f4;">
  <div class="container py-5">
    <div class="text-center">
      <h1 class="mb-4">Certificado Válido</h1>
      <p><strong>Nombre:</strong> ${recipient.name}</p>
      <p><strong>Fecha de Emisión:</strong> ${new Date(recipient.issueDate).toLocaleDateString('es-ES')}</p>
      ${recipient.course ? `<p><strong>Curso:</strong> ${recipient.course}</p>` : ''}
      <p><strong>ID:</strong> ${certificate.id}</p>
      <a href="/index.html" class="btn btn-primary mt-4">Verificar otro certificado</a>
    </div>
  </div>
</div>
${footer}
</body>
</html>`;
    }
  });

  // Generate 404 page
  files['404.html'] = `
<!DOCTYPE html>
<html lang="en">
${head}
<body>
${header}
<div style="background-color: #eff0f4;">
  <div class="container py-5">
    <div class="text-center">
      <h1 class="mb-4 text-danger">Certificado No Encontrado</h1>
      <p>El ID ingresado no corresponde a un certificado válido.</p>
      <a href="/index.html" class="btn btn-primary mt-4">Volver a intentar</a>
    </div>
  </div>
</div>
${footer}
</body>
</html>`;

  return files;
};

export const generateCertificatePDF = async (
  certificateRef: HTMLElement,
  filename: string = 'certificate'
): Promise<void> => {
  try {
    // Wait longer for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const canvas = await html2canvas(certificateRef, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: certificateRef.offsetWidth,
      height: certificateRef.offsetHeight,
      foreignObjectRendering: false,
      imageTimeout: 15000,
      removeContainer: true
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
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    // Center the image if it's smaller than the page
    const yOffset = pdfHeight < pdf.internal.pageSize.getHeight() 
      ? (pdf.internal.pageSize.getHeight() - pdfHeight) / 2 
      : 0;
    
    pdf.addImage(imgData, 'PNG', 0, yOffset, pdfWidth, pdfHeight);
    
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw new Error('Hubo un error al generar el PDF. Por favor, inténtelo de nuevo.');
  }
};

export const downloadAllCertificatesAsPDF = async (
  certificates: Certificate[],
  recipients: Recipient[],
  templates: Template[]
): Promise<void> => {
  try {
    const zip = new JSZip();
    
    // Create a temporary container for rendering certificates
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);

    for (const certificate of certificates) {
      const recipient = recipients.find(r => r.id === certificate.recipientId);
      const template = templates.find(t => t.id === certificate.templateId);
      
      if (recipient && template) {
        // Clear previous certificate
        container.innerHTML = '';
        
        // Create certificate preview
        const certificateDiv = document.createElement('div');
        certificateDiv.className = 'certificate-preview';
        certificateDiv.style.width = '800px';
        certificateDiv.style.height = '566px';
        certificateDiv.style.position = 'relative';
        certificateDiv.style.backgroundColor = 'white';
        
        // Add template image
        certificateDiv.style.backgroundImage = `url('${template.imageUrl}')`;
        certificateDiv.style.backgroundSize = 'contain';
        certificateDiv.style.backgroundRepeat = 'no-repeat';
        certificateDiv.style.backgroundPosition = 'center';

        // Pre-load the image to avoid blank captures
        await new Promise((resolve, reject) => {
          const testImg = new Image();
          testImg.crossOrigin = 'anonymous';
          testImg.src = template.imageUrl;
          testImg.onload = () => resolve(true);
          testImg.onerror = reject;
          // fallback
          setTimeout(resolve, 5000);
        });
        
        // Add fields
        template.fields.forEach(field => {
          const fieldDiv = document.createElement('div');
          fieldDiv.style.position = 'absolute';
          fieldDiv.style.left = `${field.x}%`;
          fieldDiv.style.top  = `${field.y}%`;
          fieldDiv.style.transform = 'translate(-50%, -50%)';
          fieldDiv.style.textAlign = 'center';
          fieldDiv.style.width = '100%';
          fieldDiv.style.maxWidth = '80%';
          fieldDiv.style.fontFamily = field.fontFamily || 'serif';
          fieldDiv.style.fontSize = `${field.fontSize || 16}px`;
          fieldDiv.style.color = field.color || '#000';
          
          switch (field.type) {
            case 'text':
              let textValue = '';
              if (field.name === 'recipient') {
                textValue = recipient.name;
              } else if (field.name === 'course') {
                textValue = recipient.course || field.defaultValue || '';
              } else if (recipient.customFields && recipient.customFields[field.name]) {
                textValue = recipient.customFields[field.name];
              } else {
                textValue = field.defaultValue || '';
              }
              fieldDiv.textContent = textValue;
              break;
              
            case 'date':
              fieldDiv.textContent = new Date(recipient.issueDate).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              break;
          }
          
          certificateDiv.appendChild(fieldDiv);
        });
        
        container.appendChild(certificateDiv);
        
        try {
          // Generate PDF for this certificate
          const canvas = await html2canvas(certificateDiv, {
            scale: 3,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            dpi: 300,
            foreignObjectRendering: true
          });

          const imgData = canvas.toDataURL('image/png', 1.0);
          
          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            compress: false
          });
          
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
          
          const pdfBlob = pdf.output('blob');
          const fileName = `${recipient.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-certificate.pdf`;
          zip.file(fileName, pdfBlob);
        } catch (error) {
          console.error(`Error generating PDF for ${recipient.name}:`, error);
        }
      }
    }
    
    // Remove temporary container
    document.body.removeChild(container);
    
    // Generate and download zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'certificates.zip');
    
  } catch (error) {
    console.error('Error generating certificates:', error);
    throw new Error('Hubo un error al generar los certificados. Por favor, inténtelo de nuevo.');
  }
};

export const generateCertificateImage = async (
  certificateRef: HTMLElement,
  filename: string = 'certificate'
): Promise<void> => {
  try {
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