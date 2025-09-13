import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogIn, User, Lock, Eye, EyeOff, UserPlus, Shield, GraduationCap } from 'lucide-react';

const LoginForm: React.FC = () => {
  const { login, register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'student' as 'admin' | 'student'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      let success = false;
      
      if (isLoginMode) {
        success = await login(formData.email, formData.password);
        if (!success) {
          setError('Credenciales incorrectas. Intenta de nuevo.');
        } else {
          navigate('/dashboard');
        }
      } else {
        success = await register({
          email: formData.email,
          name: formData.name,
          role: formData.role,
          password: formData.password
        });
        if (!success) {
          setError('El usuario ya existe o hubo un error en el registro.');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError('Ocurrió un error. Por favor, intenta de nuevo.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const demoCredentials = [
    { email: 'admin@redciudadana.org', password: 'admin123', role: 'Administrador' },
    { email: 'estudiante@example.com', password: 'student123', role: 'Estudiante' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-gray-600">
            {isLoginMode 
              ? 'Accede a tu cuenta de CertifyPro' 
              : 'Únete a la plataforma de certificados'
            }
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Credenciales de Demostración:</h3>
          <div className="space-y-2 text-xs">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="bg-white rounded-lg p-2 border border-blue-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-blue-700">{cred.role}:</span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, email: cred.email, password: cred.password }))}
                    className="text-blue-600 hover:text-blue-800 text-xs underline"
                  >
                    Usar estas credenciales
                  </button>
                </div>
                <div className="text-gray-600 mt-1">
                  <div>Email: {cred.email}</div>
                  <div>Password: {cred.password}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLoginMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required={!isLoginMode}
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Usuario
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">Estudiante</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  {isLoginMode ? 'Iniciando sesión...' : 'Creando cuenta...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {isLoginMode ? (
                    <LogIn className="h-5 w-5 mr-2" />
                  ) : (
                    <UserPlus className="h-5 w-5 mr-2" />
                  )}
                  {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </div>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
                setFormData({ email: '', password: '', name: '', role: 'student' });
              }}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              {isLoginMode 
                ? '¿No tienes cuenta? Crear una nueva' 
                : '¿Ya tienes cuenta? Iniciar sesión'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;