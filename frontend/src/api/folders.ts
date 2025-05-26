import api from './client';
import { Folder, CreateFolderData } from '../types';

export const foldersApi = {
  // Create folder
  createFolder: async (data: CreateFolderData): Promise<{ success: boolean; folder: Folder; message: string }> => {
    const response = await api.post('/api/folders', data);
    return response.data;
  },

  // Get user folders
  getFolders: async (parentId?: string): Promise<{ success: boolean; folders: Folder[] }> => {
    const response = await api.get('/api/folders', {
      params: parentId ? { parentId } : undefined,
    });
    return response.data;
  },

  // Get single folder
  getFolder: async (id: string): Promise<{ success: boolean; folder: Folder }> => {
    const response = await api.get(`/api/folders/${id}`);
    return response.data;
  },

  // Update folder
  updateFolder: async (id: string, data: {
    name?: string;
    description?: string;
    color?: string;
    parentId?: string;
  }): Promise<{ success: boolean; folder: Folder; message: string }> => {
    const response = await api.patch(`/api/folders/${id}`, data);
    return response.data;
  },

  // Delete folder
  deleteFolder: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/folders/${id}`);
    return response.data;
  },

  // Get folder path
  getFolderPath: async (id: string): Promise<{ success: boolean; path: Array<{ id: string; name: string }> }> => {
    const response = await api.get(`/api/folders/${id}/path`);
    return response.data;
  },
}; 