import { Router } from 'express';
import tagController from '../controllers/tagController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Tag routes
router.post('/', tagController.createTag);
router.get('/', tagController.getTags);
router.get('/popular', tagController.getPopularTags);
router.get('/:id', tagController.getTag);
router.patch('/:id', tagController.updateTag);
router.delete('/:id', tagController.deleteTag);

export default router; 