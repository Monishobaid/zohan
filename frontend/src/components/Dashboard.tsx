import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './ui/Button';
import { documentsApi } from '../api/documents';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus('Please select a PDF file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('');

    try {
      const fileName = file.name.replace('.pdf', '');
      await documentsApi.uploadDocument({
        document: file,
        title: fileName,
      });
      setUploadStatus('Document uploaded successfully!');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Zohane</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.name}</span>
              <Button variant="secondary" onClick={logout}>
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to your Dashboard</h2>
            <p className="text-gray-600">
              This is where you'll manage your documents and folders.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 