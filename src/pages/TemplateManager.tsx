import React, { useState } from 'react';
import { PlusCircle, FileText, X, Upload, Link as LinkIcon } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import TemplateCard from '../components/TemplateCard';
import ImageUpload from '../components/ImageUpload';
import { Template, TemplateField } from '../types';
import { nanoid } from 'nanoid';

const TemplateManager: React.FC = () => {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useCertificateStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'upload'>('upload');
  
  const [formData, setFormData] = useState<Omit<Template, 'id'>>({
    name: '',
    imageUrl: '',
    fields: [
      { id: nanoid(), name: 'recipient', type: 'text', x: 50, y: 40, fontSize: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#000' },
      { id: nanoid(), name: 'course', type: 'text', x: 50, y: 60, fontSize: 18, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#333' },
      { id: nanoid(), name: 'date', type: 'date', x: 50, y: 80, fontSize: 14, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#555' },
      { id: nanoid(), name: 'qrcode', type: 'qrcode', x: 80, y: 90 }
    ]
  });
  
  const handleCreateTemplate = () => {
    setFormData({
      name: '',
      imageUrl: '',
      fields: [
        { id: nanoid(), name: 'recipient', type: 'text', x: 50, y: 40, fontSize: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#000' },
        { id: nanoid(), name: 'course', type: 'text', x: 50, y: 60, fontSize: 18, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#333' },
        { id: nanoid(), name: 'date', type: 'date', x: 50, y: 80, fontSize: 14, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", color: '#555' },
        { id: nanoid(), name: 'qrcode', type: 'qrcode', x: 80, y: 90 }
      ]
    });
    setUploadMethod('upload');
    setIsCreating(true);
    setIsEditing(false);
  };
  
  const handleEditTemplate = (id: string) => {
    const template = templates.find(t => t.id === id);
    if (template) {
      setFormData({
        name: template.name,
        imageUrl: template.imageUrl,
        fields: [...template.fields]
      });
      setUploadMethod(template.imageUrl.startsWith('data:') ? 'upload' : 'url');
      setEditingTemplateId(id);
      setIsEditing(true);
      setIsCreating(false);
    }
  };
  
  const handleDeleteTemplate = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFieldChange = (id: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === id ? { ...f, [field]: value } : f
      )
    }));
  };
  
  const handleAddField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [
        ...prev.fields,
        { id: nanoid(), name: `field-${prev.fields.length + 1}`, type: 'text', x: 50, y: 50 }
      ]
    }));
  };
  
  const handleRemoveField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== id)
    }));
  };
  
  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && editingTemplateId) {
      updateTemplate(editingTemplateId, formData);
    } else if (isCreating) {
      addTemplate(formData);
    }
    
    setIsCreating(false);
    setIsEditing(false);
    setEditingTemplateId(null);
  };
  
  const renderForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Template Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
          />
        </div>
        
        <div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Imagen de Fondo del Certificado
              </label>
              
              {/* Upload Method Toggle */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    uploadMethod === 'upload'
                      ? 'bg-gray-50 border-gray-200 text-gray-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Imagen
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('url')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors duration-200 ${
                    uploadMethod === 'url'
                      ? 'bg-gray-50 border-gray-200 text-gray-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LinkIcon className="mr-2 h-4 w-4" />
                  URL de Imagen
                </button>
              </div>
            </div>
            
            {uploadMethod === 'upload' ? (
              <ImageUpload
                onImageUploaded={handleImageUploaded}
                currentImageUrl={formData.imageUrl}
              />
            ) : (
              <div>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="https://ejemplo.com/imagen-certificado.jpg"
                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Ingresa la URL de la imagen de fondo para el certificado
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Template Fields
            </label>
            <button
              type="button"
              onClick={handleAddField}
              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              Add Field
            </button>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-md overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wide grid grid-cols-12 gap-4">
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Name</div>
              <div className="col-span-1">X (%)</div>
              <div className="col-span-1">Y (%)</div>
              <div className="col-span-2">Font Size</div>
              <div className="col-span-2">Font Family</div>
              <div className="col-span-1">Color</div>
              <div className="col-span-1">Actions</div>
            </div>
            
            <div className="divide-y divide-gray-200">
              {formData.fields.map((field) => (
                <div key={field.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center text-sm">
                  <div className="col-span-2">
                    <select
                      value={field.type}
                      onChange={(e) => handleFieldChange(field.id, 'type', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    >
                      <option value="text">Text</option>
                      <option value="date">Date</option>
                      <option value="qrcode">QR Code</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => handleFieldChange(field.id, 'name', e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={field.x}
                      onChange={(e) => handleFieldChange(field.id, 'x', parseInt(e.target.value, 10))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={field.y}
                      onChange={(e) => handleFieldChange(field.id, 'y', parseInt(e.target.value, 10))}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    {field.type !== 'qrcode' && (
                      <input
                        type="number"
                        min="8"
                        max="72"
                        value={field.fontSize || 16}
                        onChange={(e) => handleFieldChange(field.id, 'fontSize', parseInt(e.target.value, 10))}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                      />
                    )}
                  </div>
                  
                  <div className="col-span-2">
                    {field.type !== 'qrcode' && (
                      <select
                        value={field.fontFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}
                        onChange={(e) => handleFieldChange(field.id, 'fontFamily', e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                      >
                        <option value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">System UI</option>
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans-serif</option>
                        <option value="monospace">Monospace</option>
                        <option value="cursive">Cursive</option>
                      </select>
                    )}
                  </div>
                  
                  <div className="col-span-1">
                    {field.type !== 'qrcode' && (
                      <input
                        type="color"
                        value={field.color || '#000000'}
                        onChange={(e) => handleFieldChange(field.id, 'color', e.target.value)}
                        className="block w-full h-7 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                      />
                    )}
                  </div>
                  
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveField(field.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setIsEditing(false);
              setEditingTemplateId(null);
            }}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {isEditing ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </form>
    );
  };
  
  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Template Manager</h1>
          <p className="mt-2 text-lg text-gray-600">
            Create and manage your certificate templates.
          </p>
        </div>
        {!isCreating && !isEditing && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleCreateTemplate}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              New Template
            </button>
          </div>
        )}
      </div>
      
      {(isCreating || isEditing) ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Template' : 'Create New Template'}
            </h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {renderForm()}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Your Templates</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {templates.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onEdit={handleEditTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <FileText className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No templates</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new template.
                </p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateTemplate}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                    New Template
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;