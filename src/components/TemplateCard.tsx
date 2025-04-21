import React from 'react';
import { Template } from '../types';
import { useCertificateStore } from '../store/certificateStore';
import { CheckCircle, Edit, Trash } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete
}) => {
  const { currentTemplateId, setCurrentTemplate } = useCertificateStore();
  const isSelected = currentTemplateId === template.id;
  
  const handleSelect = () => {
    setCurrentTemplate(template.id);
  };
  
  return (
    <div 
      className={`relative group bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="aspect-[3/2] relative overflow-hidden">
        <img
          src={template.imageUrl}
          alt={template.name}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
            <CheckCircle className="h-5 w-5" />
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {template.fields.length} fields
        </p>
        
        <div className="mt-3 flex space-x-2">
          <button
            onClick={handleSelect}
            className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              isSelected
                ? 'text-white bg-blue-600 hover:bg-blue-700'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {isSelected ? 'Selected' : 'Select'}
          </button>
          
          {onEdit && (
            <button
              onClick={() => onEdit(template.id)}
              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={() => onDelete(template.id)}
              className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateCard;