import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Award, 
  Users, 
  FileText, 
  Layout as LayoutIcon, 
  Download, 
  Menu, 
  X,
  Book,
  Share2,
  Mail,
  ScrollText,
  Sparkles,
  Shield,
  LogOut,
  User
} from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { certificates, recipients, templates } = useCertificateStore();
  
  // Admin navigation
  const adminNavigation = [
    { name: 'Panel Principal', to: '/', icon: LayoutIcon },
    { name: 'Crear Certificado', to: '/create', icon: Award },
    { name: 'Certificados', to: '/certificates', icon: ScrollText },
    { name: 'Plantillas', to: '/templates', icon: FileText },
    { name: 'Destinatarios', to: '/recipients', icon: Users },
    { name: 'Exportar Sitio', to: '/export', icon: Download },
    { name: 'LinkedIn', to: '/linkedin', icon: Share2 },
    { name: 'Notificaciones', to: '/notifications', icon: Mail },
    { name: 'Documentación', to: '/docs', icon: Book }
  ];

  // Student navigation
  const studentNavigation = [
    { name: 'Mi Panel', to: '/', icon: LayoutIcon },
    { name: 'Verificar Certificado', to: '/verify', icon: Shield }
  ];

  const navigation = user?.role === 'admin' ? adminNavigation : studentNavigation;

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getBadgeCount = (path: string) => {
    switch (path) {
      case '/certificates':
        return certificates.length;
      case '/recipients':
        return recipients.length;
      case '/templates':
        return templates.length;
      default:
        return 0;
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Mobile menu button with improved styling */}
      <div className="lg:hidden fixed top-0 right-0 p-4 z-30">
        <button
          onClick={toggleMobileMenu}
          className="p-3 rounded-xl text-gray-700 bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Desktop sidebar with enhanced design */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col lg:w-72 lg:bg-white lg:shadow-xl lg:border-r lg:border-gray-100">
        <div className="flex items-center justify-center flex-shrink-0 px-6 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Award className="h-10 w-10 text-white" />
              <Sparkles className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">CertifyPro</span>
              <p className="text-blue-100 text-xs">Generador de Certificados</p>
            </div>
          </Link>
        </div>
        
        {/* User info and stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          {user?.role === 'admin' && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-lg font-bold text-blue-600">{certificates.length}</div>
                <div className="text-xs text-gray-500">Certificados</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-lg font-bold text-green-600">{recipients.length}</div>
                <div className="text-xs text-gray-500">Destinatarios</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-lg font-bold text-purple-600">{templates.length}</div>
                <div className="text-xs text-gray-500">Plantillas</div>
              </div>
            </div>
          )}
        </div>
        
        <nav className="flex-1 flex flex-col overflow-y-auto px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            const badgeCount = getBadgeCount(item.to);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={`${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-r-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-sm`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5 flex-shrink-0`}
                    aria-hidden="true"
                  />
                  {item.name}
                </div>
                {badgeCount > 0 && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Quick action and logout */}
        <div className="p-4 border-t border-gray-100">
          {user?.role === 'admin' && (
            <Link
              to="/create"
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl mb-3"
            >
              <Award className="h-4 w-4 mr-2" />
              Crear Certificado
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>
      
      {/* Mobile menu overlay */}
      <div
        className={`${
          isMobileMenuOpen ? 'fixed inset-0 z-20 bg-black bg-opacity-50' : 'hidden'
        } lg:hidden`}
        onClick={toggleMobileMenu}
      />
      
      {/* Mobile menu sidebar */}
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-20 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <Link to="/" className="flex items-center space-x-3" onClick={toggleMobileMenu}>
            <div className="relative">
              <Award className="h-8 w-8 text-white" />
              <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">CertifyPro</span>
              <p className="text-blue-100 text-xs">Generador de Certificados</p>
            </div>
          </Link>
        </div>
        
        {/* Mobile user info and stats */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          
          {user?.role === 'admin' && (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm font-bold text-blue-600">{certificates.length}</div>
                <div className="text-xs text-gray-500">Certificados</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm font-bold text-green-600">{recipients.length}</div>
                <div className="text-xs text-gray-500">Destinatarios</div>
              </div>
              <div className="bg-white rounded-lg p-2 shadow-sm">
                <div className="text-sm font-bold text-purple-600">{templates.length}</div>
                <div className="text-xs text-gray-500">Plantillas</div>
              </div>
            </div>
          )}
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            const badgeCount = getBadgeCount(item.to);
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={toggleMobileMenu}
                className={`${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200`}
              >
                <div className="flex items-center">
                  <item.icon
                    className={`${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    } mr-3 h-5 w-5 flex-shrink-0`}
                    aria-hidden="true"
                  />
                  {item.name}
                </div>
                {badgeCount > 0 && (
                  <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none rounded-full ${
                    isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {badgeCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
        
        {/* Mobile quick action and logout */}
        <div className="p-4 border-t border-gray-100">
          {user?.role === 'admin' && (
            <Link
              to="/create"
              onClick={toggleMobileMenu}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg mb-3"
            >
              <Award className="h-4 w-4 mr-2" />
              Crear Certificado
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </button>
        </div>
      </div>
      
      <div className="lg:pl-72">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;