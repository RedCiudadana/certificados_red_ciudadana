import React, { useState } from 'react';
import { UsersRound, PlusCircle, User, Edit, Trash, Download, Upload } from 'lucide-react';
import { useCertificateStore } from '../store/certificateStore';
import RecipientForm from '../components/RecipientForm';
import BulkUpload from '../components/BulkUpload';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const RecipientManager: React.FC = () => {
  const { recipients, addRecipient, updateRecipient, deleteRecipient } = useCertificateStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleCreateRecipient = () => {
    setIsCreating(true);
    setIsEditing(false);
    setIsBulkUploadOpen(false);
  };
  
  const handleEditRecipient = (id: string) => {
    setEditingRecipientId(id);
    setIsEditing(true);
    setIsCreating(false);
    setIsBulkUploadOpen(false);
  };
  
  const handleDeleteRecipient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipient?')) {
      deleteRecipient(id);
    }
  };
  
  const handleSubmit = (data: Omit<typeof recipients[0], 'id'>) => {
    if (isEditing && editingRecipientId) {
      updateRecipient(editingRecipientId, data);
    } else if (isCreating) {
      addRecipient(data);
    }
    
    setIsCreating(false);
    setIsEditing(false);
    setEditingRecipientId(null);
  };
  
  const handleBulkUploadComplete = () => {
    setIsBulkUploadOpen(false);
  };
  
  const exportRecipients = () => {
    if (recipients.length === 0) return;
    
    const exportData = recipients.map(recipient => ({
      name: recipient.name,
      email: recipient.email || '',
      course: recipient.course || '',
      issueDate: recipient.issueDate,
      ...recipient.customFields
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recipients');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(blob, 'certificate_recipients.xlsx');
  };
  
  const filteredRecipients = recipients.filter(recipient => 
    recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipient.email && recipient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (recipient.course && recipient.course.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  return (
    <div className="space-y-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipients</h1>
          <p className="mt-2 text-lg text-gray-600">
            Manage recipients for your certificates.
          </p>
        </div>
        
        {!isCreating && !isEditing && !isBulkUploadOpen && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => setIsBulkUploadOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
              Bulk Upload
            </button>
            
            <button
              onClick={exportRecipients}
              disabled={recipients.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Export
            </button>
            
            <button
              onClick={handleCreateRecipient}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Add Recipient
            </button>
          </div>
        )}
      </div>
      
      {isCreating || isEditing ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">
              {isEditing ? 'Edit Recipient' : 'Add New Recipient'}
            </h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <RecipientForm
              initialData={isEditing && editingRecipientId ? recipients.find(r => r.id === editingRecipientId) : undefined}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsCreating(false);
                setIsEditing(false);
                setEditingRecipientId(null);
              }}
            />
          </div>
        </div>
      ) : isBulkUploadOpen ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Bulk Upload Recipients</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <BulkUpload
              onUploaded={handleBulkUploadComplete}
            />
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsBulkUploadOpen(false)}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-medium text-gray-900">Recipient List</h2>
              <div className="mt-3 sm:mt-0">
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search recipients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            {filteredRecipients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Course/Achievement
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Issue Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Custom Fields
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecipients.map((recipient) => (
                      <tr key={recipient.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {recipient.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipient.email || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {recipient.course || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(recipient.issueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {recipient.customFields && Object.keys(recipient.customFields).length > 0 ? (
                            <div className="max-w-xs overflow-hidden truncate">
                              {Object.entries(recipient.customFields).map(([key, value]) => (
                                <span key={key} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mr-1 mb-1">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEditRecipient(recipient.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteRecipient(recipient.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UsersRound className="mx-auto h-12 w-12 text-gray-300" />
                {searchTerm ? (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matching recipients</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try adjusting your search to find what you're looking for.
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Clear search
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No recipients</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by adding a new recipient.
                    </p>
                    <div className="mt-6 flex justify-center space-x-3">
                      <button
                        onClick={() => setIsBulkUploadOpen(true)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                        Bulk Upload
                      </button>
                      <button
                        onClick={handleCreateRecipient}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" aria-hidden="true" />
                        Add Recipient
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipientManager;