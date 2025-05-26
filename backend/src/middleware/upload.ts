import multer from 'multer';
import { Request } from 'express';

// Configure multer for memory storage (we'll upload to Supabase)
const storage = multer.memoryStorage();

// File filter to only allow PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const uploadSingle = upload.single('document');
export const uploadMultiple = upload.array('documents', 10); // Max 10 files

export default upload; 