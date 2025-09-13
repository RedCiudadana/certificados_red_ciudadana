import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import LoginForm from './components/LoginForm';
import PublicIndex from './pages/PublicIndex';
import StudentDashboard from './pages/StudentDashboard';
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

function App() {
  const { isAuthenticated, user } = useAuthStore();
  
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={
          isAuthenticated ? (
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          ) : (
            <PublicIndex />
          )
        }>
          {isAuthenticated && (
            <Route index element={
              user?.role === 'admin' ? <Dashboard /> : <StudentDashboard />
            } />
          )}
          
          {/* Admin-only routes */}
          {isAuthenticated && (
            <>
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
            </>
          )}
          
          {!isAuthenticated && <Route path="*" element={<Navigate to="/" replace />} />}
        </Route>
        
        {/* Login route */}
        <Route path="/login" element={<LoginForm />} />
        
        {/* Public verification route */}
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;