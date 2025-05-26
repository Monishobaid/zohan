import prisma from '../config/database.js';

export interface CreateTagData {
  name: string;
  color?: string;
  userId: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}

export class TagService {
  async createTag(data: CreateTagData) {
    const { name, color, userId } = data;

    // Check for duplicate tag names for this user
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: name.toLowerCase(),
        userId,
      },
    });

    if (existingTag) {
      throw new Error('A tag with this name already exists');
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.toLowerCase(),
        color: color || '#10B981',
        userId,
      },
      include: {
        _count: {
          select: {
            documentTags: true,
          },
        },
      },
    });

    return tag;
  }

  async getUserTags(userId: string) {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            documentTags: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return tags;
  }

  async getTagById(tagId: string, userId: string) {
    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
      include: {
        documentTags: {
          include: {
            document: {
              include: {
                folder: true,
              },
            },
          },
        },
        _count: {
          select: {
            documentTags: true,
          },
        },
      },
    });

    if (!tag) {
      throw new Error('Tag not found');
    }

    return tag;
  }

  async updateTag(tagId: string, userId: string, data: UpdateTagData) {
    const { name, color } = data;

    // Verify tag ownership
    const existingTag = await this.getTagById(tagId, userId);

    // Check for duplicate names if name is being changed
    if (name && name.toLowerCase() !== existingTag.name) {
      const duplicateTag = await prisma.tag.findFirst({
        where: {
          name: name.toLowerCase(),
          userId,
          id: { not: tagId },
        },
      });

      if (duplicateTag) {
        throw new Error('A tag with this name already exists');
      }
    }

    const updatedTag = await prisma.tag.update({
      where: { id: tagId },
      data: {
        ...(name && { name: name.toLowerCase() }),
        ...(color && { color }),
      },
      include: {
        _count: {
          select: {
            documentTags: true,
          },
        },
      },
    });

    return updatedTag;
  }

  async deleteTag(tagId: string, userId: string) {
    // Verify tag ownership
    await this.getTagById(tagId, userId);

    // Delete tag (cascade will handle document_tags)
    await prisma.tag.delete({
      where: { id: tagId },
    });

    return { success: true };
  }

  async getOrCreateTags(tagNames: string[], userId: string) {
    const tags = [];

    for (const tagName of tagNames) {
      const normalizedName = tagName.toLowerCase().trim();
      
      if (!normalizedName) continue;

      let tag = await prisma.tag.findFirst({
        where: {
          name: normalizedName,
          userId,
        },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: normalizedName,
            userId,
          },
        });
      }

      tags.push(tag);
    }

    return tags;
  }

  async getPopularTags(userId: string, limit = 10) {
    const tags = await prisma.tag.findMany({
      where: {
        userId,
      },
      include: {
        _count: {
          select: {
            documentTags: true,
          },
        },
      },
      orderBy: {
        documentTags: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return tags.filter(tag => tag._count.documentTags > 0);
  }
}

export default new TagService(); 