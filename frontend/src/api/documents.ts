import { apiClient } from './client'
import { Document, UploadDocumentData } from '../types'

export const documentsApi = {
  uploadDocument: async (data: UploadDocumentData): Promise<Document> => {
    const formData = new FormData()
    formData.append('document', data.document)
    formData.append('title', data.title)
    if (data.folderId) formData.append('folderId', data.folderId)
    if (data.tags) formData.append('tags', JSON.stringify(data.tags))

    const response = await apiClient.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  getDocuments: async (): Promise<Document[]> => {
    const response = await apiClient.get('/documents')
    return response.data
  },

  deleteDocument: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`)
  },
} 