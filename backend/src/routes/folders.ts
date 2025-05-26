import { Router } from 'express';
import folderController from '../controllers/folderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Folder routes
router.post('/', folderController.createFolder);
router.get('/', folderController.getFolders);
router.get('/:id', folderController.getFolder);
router.patch('/:id', folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);
router.get('/:id/path', folderController.getFolderPath);

export default router; 