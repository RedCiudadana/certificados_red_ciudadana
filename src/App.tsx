import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import LoginModal from './components/LoginModal';
import PublicIndex from './pages/PublicIndex';
import StudentDashboard from './pages/StudentDashboard';
import Dashboard from './pages/Dashboard';
import CreateCertificate from './pages/CreateCertificate';
import TemplateManager from './pages/TemplateManager';
import RecipientManager from './pages/RecipientManager';
import VerifyCertificate from './pages/VerifyCertificate';
import ExportSite from './pages/ExportSite';
import Documentation from './pages/Documentation';
import SourceCodeManager from './pages/SourceCodeManager';
import LinkedInIntegration from './pages/LinkedInIntegration';
import EmailNotifications from './pages/EmailNotifications';
import Certificates from './pages/Certificates';
import Layout from './components/Layout';

function AppContent() {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  return (
    <>
      <Routes>
        {/* Public index route */}
        <Route path="/" element={
          !isAuthenticated ? <PublicIndex /> : <Navigate to="/dashboard" replace />
        } />
        
        {/* Public verification route */}
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
        
        {/* Protected routes with Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          {/* Admin routes */}
          <Route path="create" element={
            <ProtectedRoute requiredRole="admin">
              <CreateCertificate />
            </ProtectedRoute>
          } />
          <Route path="certificates" element={
            <ProtectedRoute requiredRole="admin">
              <Certificates />
            </ProtectedRoute>
          } />
          <Route path="templates" element={
            <ProtectedRoute requiredRole="admin">
              <TemplateManager />
            </ProtectedRoute>
          } />
          <Route path="recipients" element={
            <ProtectedRoute requiredRole="admin">
              <RecipientManager />
            </ProtectedRoute>
          } />
          <Route path="export" element={
            <ProtectedRoute requiredRole="admin">
              <ExportSite />
            </ProtectedRoute>
          } />
          <Route path="linkedin" element={
            <ProtectedRoute requiredRole="admin">
              <LinkedInIntegration />
            </ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute requiredRole="admin">
              <EmailNotifications />
            </ProtectedRoute>
          } />
          <Route path="docs" element={
            <ProtectedRoute requiredRole="admin">
              <Documentation />
            </ProtectedRoute>
          } />
          <Route path="source-code" element={
            <ProtectedRoute requiredRole="admin">
              <SourceCodeManager />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Login Modal - always rendered */}
      <LoginModal />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;