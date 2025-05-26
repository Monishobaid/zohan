import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import tagService from '../services/tagService.js';

export class TagController {
  async createTag(req: AuthenticatedRequest, res: Response) {
    try {
      const { name, color } = req.body;
      const userId = req.user!.id;

      if (!name || name.trim() === '') {
        return res.status(400).json({
          error: 'Name required',
          message: 'Please provide a name for the tag',
        });
      }

      const tag = await tagService.createTag({
        name: name.trim(),
        color,
        userId,
      });

      res.status(201).json({
        success: true,
        message: 'Tag created successfully',
        tag,
      });
    } catch (error) {
      console.error('Create tag error:', error);
      res.status(500).json({
        error: 'Failed to create tag',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getTags(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const tags = await tagService.getUserTags(userId);

      res.json({
        success: true,
        tags,
      });
    } catch (error) {
      console.error('Get tags error:', error);
      res.status(500).json({
        error: 'Failed to fetch tags',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getTag(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const tag = await tagService.getTagById(id, userId);

      res.json({
        success: true,
        tag,
      });
    } catch (error) {
      console.error('Get tag error:', error);
      const statusCode = error instanceof Error && error.message === 'Tag not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to fetch tag',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async updateTag(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, color } = req.body;
      const userId = req.user!.id;

      const tag = await tagService.updateTag(id, userId, {
        name: name?.trim(),
        color,
      });

      res.json({
        success: true,
        message: 'Tag updated successfully',
        tag,
      });
    } catch (error) {
      console.error('Update tag error:', error);
      const statusCode = error instanceof Error && error.message === 'Tag not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to update tag',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async deleteTag(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await tagService.deleteTag(id, userId);

      res.json({
        success: true,
        message: 'Tag deleted successfully',
      });
    } catch (error) {
      console.error('Delete tag error:', error);
      const statusCode = error instanceof Error && error.message === 'Tag not found' ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to delete tag',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }

  async getPopularTags(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { limit = '10' } = req.query;

      const tags = await tagService.getPopularTags(userId, parseInt(limit as string, 10));

      res.json({
        success: true,
        tags,
      });
    } catch (error) {
      console.error('Get popular tags error:', error);
      res.status(500).json({
        error: 'Failed to fetch popular tags',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  }
}

export default new TagController(); 