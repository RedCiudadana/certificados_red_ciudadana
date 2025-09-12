import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CreateCertificate from './pages/CreateCertificate';
import TemplateManager from './pages/TemplateManager';
import RecipientManager from './pages/RecipientManager';
import VerifyCertificate from './pages/VerifyCertificate';
import ExportSite from './pages/ExportSite';
import Documentation from './pages/Documentation';
import LinkedInIntegration from './pages/LinkedInIntegration';
import EmailNotifications from './pages/EmailNotifications';
import Certificates from './pages/Certificates';
import Layout from './components/Layout';
import { useCertificateStore } from './store/certificateStore';

function App() {
  const { templates } = useCertificateStore();
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<CreateCertificate />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="templates" element={<TemplateManager />} />
          <Route path="recipients" element={<RecipientManager />} />
          <Route path="export" element={<ExportSite />} />
          <Route path="linkedin" element={<LinkedInIntegration />} />
          <Route path="notifications" element={<EmailNotifications />} />
          <Route path="docs" element={<Documentation />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;