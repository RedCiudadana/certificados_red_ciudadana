import React, { useState } from 'react';
import { Recipient } from '../types';

interface RecipientFormProps {
  initialData?: Partial<Recipient>;
  onSubmit: (data: Omit<Recipient, 'id'>) => void;
  onCancel: () => void;
}

const RecipientForm: React.FC<RecipientFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Omit<Recipient, 'id'>>({
    name: initialData.name || '',
    email: initialData.email || '',
    course: initialData.course || '',
    issueDate: initialData.issueDate || new Date().toISOString().split('T')[0],
    customFields: initialData.customFields || {}
  });
  
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddCustomField = () => {
    if (customFieldKey.trim() && customFieldValue.trim()) {
      setFormData(prev => ({
        ...prev,
        customFields: {
          ...prev.customFields,
          [customFieldKey]: customFieldValue
        }
      }));
      setCustomFieldKey('');
      setCustomFieldValue('');
    }
  };
  
  const handleRemoveCustomField = (key: string) => {
    setFormData(prev => {
      const updatedCustomFields = { ...prev.customFields };
      delete updatedCustomFields[key];
      return {
        ...prev,
        customFields: updatedCustomFields
      };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('El nombre del destinatario es requerido');
      return;
    }
    
    // Format the data properly
    const submissionData = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email?.trim() || '',
      course: formData.course?.trim() || '',
      issueDate: formData.issueDate || new Date().toISOString(),
      customFields: formData.customFields || {}
    };
    
    onSubmit(submissionData);
  };
  
  const handleFormSubmit = () => {
    // Trigger form submission
    const form = document.querySelector('form');
    if (form) {
      form.requestSubmit();
    }
  };
  
  // Auto-submit when form data changes and is valid
  React.useEffect(() => {
    if (formData.name.trim()) {
    onSubmit(formData);
    }
  }, [formData.name, formData.email, formData.course, formData.issueDate]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Recipient Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="course" className="block text-sm font-medium text-gray-700">
          Course/Achievement
        </label>
        <input
          type="text"
          id="course"
          name="course"
          value={formData.course}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      <div>
        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
          Issue Date
        </label>
        <input
          type="date"
          id="issueDate"
          name="issueDate"
          value={formData.issueDate.toString().split('T')[0]}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700">Custom Fields</h3>
        
        <div className="mt-2 space-y-4">
          {Object.entries(formData.customFields || {}).map(([key, value]) => (
            <div key={key} className="flex items-center space-x-2">
              <div className="flex-grow flex space-x-2">
                <input
                  type="text"
                  value={key}
                  disabled
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                />
                <input
                  type="text"
                  value={value}
                  disabled
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveCustomField(key)}
                className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          
          <div className="flex items-center space-x-2">
            <div className="flex-grow flex space-x-2">
              <input
                type="text"
                placeholder="Field Name"
                value={customFieldKey}
                onChange={(e) => setCustomFieldKey(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="text"
                placeholder="Field Value"
                value={customFieldValue}
                onChange={(e) => setCustomFieldValue(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustomField}
              className="inline-flex items-center p-1.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default RecipientForm;