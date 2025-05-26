import prisma from '../config/database.js';

export interface CreateFolderData {
  name: string;
  description?: string;
  color?: string;
  parentId?: string;
  userId: string;
}

export interface UpdateFolderData {
  name?: string;
  description?: string;
  color?: string;
  parentId?: string;
}

export class FolderService {
  async createFolder(data: CreateFolderData) {
    const { name, description, color, parentId, userId } = data;

    // Validate parent folder exists and belongs to user
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId,
        },
      });

      if (!parentFolder) {
        throw new Error('Parent folder not found');
      }
    }

    // Check for duplicate folder names in the same parent
    const existingFolder = await prisma.folder.findFirst({
      where: {
        name,
        userId,
        parentId: parentId || null,
      },
    });

    if (existingFolder) {
      throw new Error('A folder with this name already exists in this location');
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        description,
        color: color || '#3B82F6',
        parentId: parentId || null,
        userId,
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    return folder;
  }

  async getUserFolders(userId: string, parentId?: string) {
    const folders = await prisma.folder.findMany({
      where: {
        userId,
        parentId: parentId || null,
      },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                documents: true,
                children: true,
              },
            },
          },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return folders;
  }

  async getFolderById(folderId: string, userId: string) {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: {
                documents: true,
                children: true,
              },
            },
          },
        },
        documents: {
          include: {
            documentTags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: { uploadedAt: 'desc' },
        },
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    return folder;
  }

  async updateFolder(folderId: string, userId: string, data: UpdateFolderData) {
    const { name, description, color, parentId } = data;

    // Verify folder ownership
    const existingFolder = await this.getFolderById(folderId, userId);

    // Validate parent folder if provided
    if (parentId) {
      // Prevent circular references
      if (parentId === folderId) {
        throw new Error('A folder cannot be its own parent');
      }

      // Check if the new parent is a descendant of this folder
      const isDescendant = await this.isDescendant(folderId, parentId, userId);
      if (isDescendant) {
        throw new Error('Cannot move folder to its own descendant');
      }

      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId,
        },
      });

      if (!parentFolder) {
        throw new Error('Parent folder not found');
      }
    }

    // Check for duplicate names if name is being changed
    if (name && name !== existingFolder.name) {
      const duplicateFolder = await prisma.folder.findFirst({
        where: {
          name,
          userId,
          parentId: parentId !== undefined ? parentId || null : existingFolder.parentId,
          id: { not: folderId },
        },
      });

      if (duplicateFolder) {
        throw new Error('A folder with this name already exists in this location');
      }
    }

    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color }),
        ...(parentId !== undefined && { parentId: parentId || null }),
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            documents: true,
            children: true,
          },
        },
      },
    });

    return updatedFolder;
  }

  async deleteFolder(folderId: string, userId: string) {
    // Verify folder ownership
    const folder = await this.getFolderById(folderId, userId);

    // Check if folder has children
    if (folder._count.children > 0) {
      throw new Error('Cannot delete folder that contains subfolders');
    }

    // Check if folder has documents
    if (folder._count.documents > 0) {
      throw new Error('Cannot delete folder that contains documents');
    }

    await prisma.folder.delete({
      where: { id: folderId },
    });

    return { success: true };
  }

  async getFolderPath(folderId: string, userId: string): Promise<Array<{ id: string; name: string }>> {
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId,
      },
      include: {
        parent: true,
      },
    });

    if (!folder) {
      throw new Error('Folder not found');
    }

    const path = [{ id: folder.id, name: folder.name }];

    if (folder.parent) {
      const parentPath = await this.getFolderPath(folder.parent.id, userId);
      return [...parentPath, ...path];
    }

    return path;
  }

  private async isDescendant(ancestorId: string, descendantId: string, userId: string): Promise<boolean> {
    const descendant = await prisma.folder.findFirst({
      where: {
        id: descendantId,
        userId,
      },
      include: {
        parent: true,
      },
    });

    if (!descendant || !descendant.parent) {
      return false;
    }

    if (descendant.parent.id === ancestorId) {
      return true;
    }

    return this.isDescendant(ancestorId, descendant.parent.id, userId);
  }
}

export default new FolderService(); 