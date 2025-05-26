import { supabaseAdmin, STORAGE_BUCKET } from '../config/supabase.js';
import prisma from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface UploadDocumentData {
  file: Express.Multer.File;
  title: string;
  userId: string;
  folderId?: string;
  tagIds?: string[];
}

export interface UpdateDocumentData {
  title?: string;
  folderId?: string;
  tagIds?: string[];
}

export class DocumentService {
  async uploadDocument(data: UploadDocumentData) {
    const { file, title, userId, folderId, tagIds = [] } = data;
    
    try {
      // Generate unique filename
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const storagePath = `${userId}/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(storagePath);

      // Save document metadata to database
      const document = await prisma.document.create({
        data: {
          title,
          fileName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          storagePath,
          publicUrl: publicUrlData.publicUrl,
          userId,
          folderId: folderId || null,
        },
        include: {
          folder: true,
          documentTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      // Add tags if provided
      if (tagIds.length > 0) {
        await prisma.documentTag.createMany({
          data: tagIds.map(tagId => ({
            documentId: document.id,
            tagId,
          })),
        });
      }

      // Fetch the complete document with relations
      const completeDocument = await prisma.document.findUnique({
        where: { id: document.id },
        include: {
          folder: true,
          documentTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      return completeDocument;
    } catch (error) {
      throw new Error(`Document upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserDocuments(userId: string, page = 1, limit = 20, search?: string, folderId?: string, tagIds?: string[]) {
    const skip = (page - 1) * limit;
    
    const where: any = {
      userId,
      ...(folderId && { folderId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { fileName: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(tagIds && tagIds.length > 0 && {
        documentTags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      }),
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          folder: true,
          documentTags: {
            include: {
              tag: true,
            },
          },
        },
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ]);

    return {
      documents,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDocumentById(documentId: string, userId: string) {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId,
      },
      include: {
        folder: true,
        documentTags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }

  async updateDocument(documentId: string, userId: string, data: UpdateDocumentData) {
    const { title, folderId, tagIds } = data;

    // Verify document ownership
    const existingDocument = await this.getDocumentById(documentId, userId);

    // Update document
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        ...(title && { title }),
        ...(folderId !== undefined && { folderId: folderId || null }),
      },
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await prisma.documentTag.deleteMany({
        where: { documentId },
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.documentTag.createMany({
          data: tagIds.map(tagId => ({
            documentId,
            tagId,
          })),
        });
      }
    }

    // Return updated document with relations
    return this.getDocumentById(documentId, userId);
  }

  async deleteDocument(documentId: string, userId: string) {
    // Verify document ownership
    const document = await this.getDocumentById(documentId, userId);

    // Delete from Supabase Storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .remove([document.storagePath]);

    if (deleteError) {
      console.error('Failed to delete file from storage:', deleteError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database (cascade will handle tags)
    await prisma.document.delete({
      where: { id: documentId },
    });

    return { success: true };
  }
}

export default new DocumentService(); 