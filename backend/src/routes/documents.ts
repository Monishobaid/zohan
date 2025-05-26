import { Router } from 'express';
import documentController from '../controllers/documentController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Document routes
router.post('/', uploadSingle, documentController.uploadDocument);
router.get('/', documentController.getDocuments);
router.get('/:id', documentController.getDocument);
router.patch('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

export default router;