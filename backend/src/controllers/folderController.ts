import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import folderService from '../services/folderService.js';

export class FolderController {
  async createFolder(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, description, color, parentId } = req.body;
      const userId = req.user!.id;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          error: 'Name required',
          message: 'Please provide a name for the folder',
        });
      }

      const folder = await folderService.createFolder({
        name: name.trim(),
        description,
        color,
        parentId,
        userId,
      });

      res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        folder,
      });
    } catch (error) {
      console.error('Create folder error:', error);
      res.status(500).json({
        error: 'Failed to create folder',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getFolders(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { parentId } = req.query;

      const folders = await folderService.getUserFolders(userId, parentId as string);

      res.json({
        success: true,
        folders,
      });
    } catch (error) {
      console.error('Get folders error:', error);
      res.status(500).json({
        error: 'Failed to fetch folders',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getFolder(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const folder = await folderService.getFolderById(id, userId);

      res.json({
        success: true,
        folder,
      });
    } catch (error) {
      console.error('Get folder error:', error);
      const statusCode = error instanceof Error && error.message === 'Folder not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to fetch folder',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async updateFolder(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, color, parentId } = req.body;
      const userId = req.user!.id;

      const folder = await folderService.updateFolder(id, userId, {
        name: name?.trim(),
        description,
        color,
        parentId,
      });

      res.json({
        success: true,
        message: 'Folder updated successfully',
        folder,
      });
    } catch (error) {
      console.error('Update folder error:', error);
      const statusCode = error instanceof Error && error.message === 'Folder not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to update folder',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async deleteFolder(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await folderService.deleteFolder(id, userId);

      res.json({
        success: true,
        message: 'Folder deleted successfully',
      });
    } catch (error) {
      console.error('Delete folder error:', error);
      const statusCode = error instanceof Error && error.message === 'Folder not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to delete folder',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getFolderPath(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const path = await folderService.getFolderPath(id, userId);

      res.json({
        success: true,
        path,
      });
    } catch (error) {
      console.error('Get folder path error:', error);
      const statusCode = error instanceof Error && error.message === 'Folder not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to get folder path',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }
}

export default new FolderController();