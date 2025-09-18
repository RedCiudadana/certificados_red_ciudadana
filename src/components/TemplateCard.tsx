import React from 'react';
import { Template } from '../types';
import { useCertificateStore } from '../store/certificateStore';
import { CheckCircle, Edit, Trash, Eye, Sparkles } from 'lucide-react';

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
      className={`relative group bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
        isSelected ? 'ring-4 ring-gray-500 ring-opacity-50 shadow-2xl' : ''
      }`}
    >
      <div className="aspect-[3/2] relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <img
          src={template.imageUrl}
          alt={template.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-gray-500 to-gray-500 text-white rounded-full p-2 shadow-lg animate-pulse">
            <CheckCircle className="h-5 w-5" />
          </div>
        )}
        
        {/* Action buttons overlay */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(template.id);
              }}
              className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-gray-600 transition-all duration-200 shadow-lg"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template.id);
              }}
              className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-red-600 transition-all duration-200 shadow-lg"
            >
              <Trash className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Preview button */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="p-2 bg-white bg-opacity-90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white hover:text-gray-600 transition-all duration-200 shadow-lg">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-gray-600 transition-colors duration-200">
              {template.name}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {template.fields.length} campos
              </span>
              {isSelected && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Seleccionado
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleSelect}
            className={`flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
              isSelected
                ? 'text-white bg-gradient-to-r from-gray-600 to-gray-600 hover:from-gray-700 hover:to-gray-700 shadow-lg'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 hover:shadow-md'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 btn-hover-lift`}
          >
            {isSelected ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Seleccionado
              </>
            ) : (
              'Seleccionar'
            )}
          </button>
        </div>
      </div>
      
      {/* Subtle glow effect for selected template */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-500 opacity-20 pointer-events-none animate-pulse"></div>
      )}
    </div>
  );
};

export default TemplateCard;