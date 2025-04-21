import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
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
  ScrollText
} from 'lucide-react';

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  const navigation = [
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 right-0 p-4 z-30">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:flex-col lg:w-64 lg:border-r lg:border-gray-200 lg:bg-white lg:pt-5 lg:pb-4">
        <div className="flex items-center justify-center flex-shrink-0 px-6">
          <div className="h-12 w-auto flex items-center space-x-2">
            <Award className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">CertifyPro</span>
          </div>
        </div>
        
        <nav className="mt-8 flex-1 flex flex-col overflow-y-auto px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                className={`${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-150`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5 flex-shrink-0`}
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div
        className={`${
          isMobileMenuOpen ? 'fixed inset-0 z-20 bg-black bg-opacity-50' : 'hidden'
        } lg:hidden`}
        onClick={toggleMobileMenu}
      />
      
      <div
        className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-20 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Award className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold text-gray-900">CertifyPro</span>
          </div>
        </div>
        
        <nav className="mt-4 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                onClick={toggleMobileMenu}
                className={`${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-3 py-3 text-sm font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 h-5 w-5 flex-shrink-0`}
                  aria-hidden="true"
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
      
      <div className="lg:pl-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;