import React, { useState } from 'react';
import { KeyRound, Code, Shield, Copy, CheckCircle, AlertCircle, BookOpen, Server, Lock } from 'lucide-react';

const ApiIntegration: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
        {code}
      </pre>
      <button
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-3 right-3 p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
      >
        {copiedCode === id ? (
          <CheckCircle className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-300" />
        )}
      </button>
    </div>
  );

  const endpoints = [
    {
      method: 'GET',
      path: '/escuela-api/student/{email}/certificates',
      description: 'Consulta los certificados asociados a un estudiante por su correo.',
      auth: 'API Key',
    },
    {
      method: 'POST',
      path: '/escuela-api/issue',
      description: 'Solicita la emisión de un certificado después de confirmar aprobación.',
      auth: 'API Key',
    },
    {
      method: 'GET',
      path: '/escuela-api/issue/{request_id}/status',
      description: 'Consulta el estado de una solicitud de emisión.',
      auth: 'API Key',
    },
    {
      method: 'GET',
      path: '/escuela-api/certificate/{code}/download',
      description: 'Obtiene un enlace seguro para descargar el PDF del certificado.',
      auth: 'API Key',
    },
    {
      method: 'GET',
      path: '/escuela-api/certificate/{code}/verify',
      description: 'Recupera el código y enlace público de verificación.',
      auth: 'API Key',
    },
    {
      method: 'GET',
      path: '/escuela-api/student/{email}/history',
      description: 'Consulta el historial completo de certificados de un estudiante.',
      auth: 'API Key',
    },
    {
      method: 'GET',
      path: '/escuela-api/public/verify/{code}',
      description: 'Verificación pública por código QR — no requiere autenticación.',
      auth: 'Público',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integración con Escuela Conecta Futuro</h1>
        <p className="mt-2 text-lg text-gray-600">
          Documentación de la API segura para integrar la emisión y verificación de certificados.
        </p>
      </div>

      {/* Security Overview */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Seguridad de la API</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Autenticación por API Key</h3>
              <p className="text-sm text-gray-600">Cada servicio externo tiene una clave única que se valida en cada solicitud.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Control de duplicación</h3>
              <p className="text-sm text-gray-600">Las llaves de idempotencia evitan emisiones duplicadas al reintentar solicitudes.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Auditoría completa</h3>
              <p className="text-sm text-gray-600">Cada operación queda registrada con cliente, endpoint, parámetros y resultado.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Sin enumeración pública</h3>
              <p className="text-sm text-gray-600">La verificación pública solo acepta el código exacto — no permite buscar por email o nombre.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Lock className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Datos personales protegidos</h3>
              <p className="text-sm text-gray-600">La verificación pública nunca expone el email del estudiante.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <KeyRound className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">LlaveRedCiudadana OIDC</h3>
              <p className="text-sm text-gray-600">Los administradores se autentican mediante OIDC con LlaveRedCiudadana.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
            <KeyRound className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Autenticación</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Todas las solicitudes (excepto verificación pública) requieren un API key en el header <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono">Authorization</code> con el formato:
        </p>
        <CodeBlock
          id="auth"
          code={`Authorization: Bearer escuela-conecta-futuro:tu-secreto-aqui`}
        />
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> El API key debe solicitarse al equipo de Red Ciudadana.
                Nunca compartas tu secreto públicamente ni lo incluyas en código del lado del cliente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoints */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
            <Server className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Endpoints</h2>
        </div>
        <div className="space-y-3">
          {endpoints.map((ep, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  ep.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                  ep.method === 'POST' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-gray-900">{ep.path}</code>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500 hidden md:inline">{ep.description}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  ep.auth === 'Público' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {ep.auth}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Example: Issue Certificate */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
            <Code className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Ejemplo: Solicitar Emisión</h2>
        </div>
        <p className="text-gray-600 mb-4">Solicitud para emitir un certificado después de que Escuela confirma la aprobación:</p>
        <CodeBlock
          id="issue-request"
          code={`POST /escuela-api/issue
Authorization: Bearer escuela-conecta-futuro:tu-secreto
Content-Type: application/json

{
  "student_email": "estudiante@correo.com",
  "student_name": "Ana García López",
  "course_name": "Excel Avanzado",
  "template_id": "excel-avanzado",
  "completion_date": "2026-01-15",
  "instructor_name": "Mario Pérez",
  "duration_hours": 40,
  "idempotency_key": "escuela-batch-2026-001-student-42"
}`}
        />
        <p className="text-gray-600 mt-4 mb-2">Respuesta exitosa (201 Created):</p>
        <CodeBlock
          id="issue-response"
          code={`{
  "request_id": "5a6af89c-de9b-4613-a84c-8e26551ee2d8",
  "status": "issued",
  "certificate_code": "vndYiAM37IdASBSwX43O",
  "verification_url": "https://certificados.redciudadana.org/verify/vndYiAM37IdASBSwX43O",
  "pdf_url": null,
  "issued_at": "2026-10-30T03:42:14.963Z"
}`}
        />
        <p className="text-gray-600 mt-4 mb-2">Respuesta de duplicado (200 OK):</p>
        <CodeBlock
          id="duplicate-response"
          code={`{
  "request_id": "9339c40d-...",
  "status": "duplicate",
  "certificate_code": "vndYiAM37IdASBSwX43O",
  "verification_url": "https://certificados.redciudadana.org/verify/vndYiAM37IdASBSwX43O",
  "message": "Certificate already exists for this student and course"
}`}
        />
      </div>

      {/* Example: Public Verification */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
            <BookOpen className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Verificación Pública (QR)</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Este endpoint no requiere autenticación. Es el que usa la página de verificación pública cuando alguien escanea el código QR:
        </p>
        <CodeBlock
          id="public-verify"
          code={`GET /escuela-api/public/verify/{codigo}

# Respuesta exitosa:
{
  "valid": true,
  "certificate_code": "K-R3pKnpYTqucV0BWSlgZ",
  "recipient_name": "Julio Herrera",
  "course_name": "Ciberseguridad2",
  "issue_date": "2025-11-19",
  "institution": "Red Ciudadana",
  "verification_url": "https://certificados.redciudadana.org/verify/K-R3pKnpYTqucV0BWSlgZ"
}

# Certificado no encontrado:
{
  "valid": false,
  "message": "Certificate not found or not active"
}`}
        />
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Privacidad:</strong> La verificación pública nunca expone el email del estudiante.
              Solo muestra nombre, curso, fecha de emisión, institución y código.
              No permite búsqueda parcial — solo coincidencia exacta del código.
            </p>
          </div>
        </div>
      </div>

      {/* LlaveRedCiudadana */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center mr-3">
            <Lock className="h-6 w-6 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Autenticación con LlaveRedCiudadana</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Los administradores del sistema pueden iniciar sesión usando su cuenta de LlaveRedCiudadana mediante OIDC (OpenID Connect).
          La verificación pública por QR funciona sin iniciar sesión.
        </p>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
            <p className="text-gray-600">El administrador hace clic en "Iniciar sesión con LlaveRedCiudadana" en la pantalla de login.</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
            <p className="text-gray-600">Es redirigido a LlaveRedCiudadana para autenticarse con sus credenciales.</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
            <p className="text-gray-600">Tras autenticarse, regresa al panel de administración con su sesión activa.</p>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
            <p className="text-gray-600">Solo los correos autorizados en la configuración pueden acceder como administradores.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiIntegration;
