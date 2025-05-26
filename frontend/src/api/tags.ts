import api from './client';
import { Tag, CreateTagData } from '../types';

export const tagsApi = {
  // Create tag
  createTag: async (data: CreateTagData): Promise<{ success: boolean; tag: Tag; message: string }> => {
    const response = await api.post('/api/tags', data);
    return response.data;
  },

  // Get user tags
  getTags: async (): Promise<{ success: boolean; tags: Tag[] }> => {
    const response = await api.get('/api/tags');
    return response.data;
  },

  // Get single tag
  getTag: async (id: string): Promise<{ success: boolean; tag: Tag }> => {
    const response = await api.get(`/api/tags/${id}`);
    return response.data;
  },

  // Update tag
  updateTag: async (id: string, data: {
    name?: string;
    color?: string;
  }): Promise<{ success: boolean; tag: Tag; message: string }> => {
    const response = await api.patch(`/api/tags/${id}`, data);
    return response.data;
  },

  // Delete tag
  deleteTag: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/api/tags/${id}`);
    return response.data;
  },

  // Get popular tags
  getPopularTags: async (limit?: number): Promise<{ success: boolean; tags: Tag[] }> => {
    const response = await api.get('/api/tags/popular', {
      params: limit ? { limit } : undefined,
    });
    return response.data;
  },
};