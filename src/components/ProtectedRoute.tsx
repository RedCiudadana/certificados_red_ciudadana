import React from 'react';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, openLoginModal } = useAuthStore();

  if (!isAuthenticated || !user) {
    // Open login modal and show a loading/redirect message
    React.useEffect(() => {
      openLoginModal();
    }, [openLoginModal]);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-gray-500 to-gray-500 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Acceso Requerido
          </h2>
          <p className="text-gray-600 mb-8">
            Por favor inicia sesión para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-gray-500 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Acceso Denegado
          </h2>
          <p className="text-gray-600 mb-8">
            No tienes permisos para acceder a esta sección. Se requiere rol de Administrador.
          </p>
          <p className="text-sm text-gray-500">
            Tu rol actual: <span className="font-semibold capitalize">{user.role}</span>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;