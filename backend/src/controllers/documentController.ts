import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import documentService from '../services/documentService.js';
import tagService from '../services/tagService.js';

export class DocumentController {
  async uploadDocument(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file provided',
          message: 'Please select a PDF file to upload',
        });
      }

      const { title, folderId, tags } = req.body;
      const userId = req.user!.id;

      if (!title || title.trim() === '') {
        return res.status(400).json({
          error: 'Title required',
          message: 'Please provide a title for the document',
        });
      }

      // Process tags if provided
      let tagIds: string[] = [];
      if (tags) {
        const tagNames = Array.isArray(tags) ? tags : [tags];
        const createdTags = await tagService.getOrCreateTags(tagNames, userId);
        tagIds = createdTags.map(tag => tag.id);
      }

      const document = await documentService.uploadDocument({
        file: req.file,
        title: title.trim(),
        userId,
        folderId: folderId || undefined,
        tagIds,
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        document,
      });
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getDocuments(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        page = '1',
        limit = '20',
        search,
        folderId,
        tags,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const tagIds = tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined;

      const result = await documentService.getUserDocuments(
        userId,
        pageNum,
        limitNum,
        search as string,
        folderId as string,
        tagIds
      );

      res.json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('Get documents error:', error);
      res.status(500).json({
        error: 'Failed to fetch documents',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const document = await documentService.getDocumentById(id, userId);

      res.json({
        success: true,
        document,
      });
    } catch (error) {
      console.error('Get document error:', error);
      const statusCode = error instanceof Error && error.message === 'Document not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to fetch document',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async updateDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { title, folderId, tags } = req.body;
      const userId = req.user!.id;

      // Process tags if provided
      let tagIds: string[] | undefined;
      if (tags !== undefined) {
        if (Array.isArray(tags) && tags.length === 0) {
          tagIds = [];
        } else {
          const tagNames = Array.isArray(tags) ? tags : [tags];
          const createdTags = await tagService.getOrCreateTags(tagNames, userId);
          tagIds = createdTags.map(tag => tag.id);
        }
      }

      const document = await documentService.updateDocument(id, userId, {
        title: title?.trim(),
        folderId,
        tagIds,
      });

      res.json({
        success: true,
        message: 'Document updated successfully',
        document,
      });
    } catch (error) {
      console.error('Update document error:', error);
      const statusCode = error instanceof Error && error.message === 'Document not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to update document',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await documentService.deleteDocument(id, userId);

      res.json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error('Delete document error:', error);
      const statusCode = error instanceof Error && error.message === 'Document not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to delete document',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }
}

export default new DocumentController(); 