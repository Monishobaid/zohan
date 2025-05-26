export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  folderId?: string;
  tags: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  userId: string;
  color?: string;
}

export interface PaginatedResponse<T> {
  documents?: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  authenticated?: boolean;
}

export interface UploadDocumentData {
  title: string;
  folderId?: string;
  tags?: string[];
  document: File;
}

export interface CreateFolderData {
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export interface CreateTagData {
  name: string;
  color?: string;
} 