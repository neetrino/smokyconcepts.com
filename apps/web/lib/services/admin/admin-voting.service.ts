import { db } from "@white-shop/db";

import { isR2Configured, uploadVotingImageToR2 } from "@/lib/services/r2.service";
import { parseDataImageUrl } from "@/lib/services/utils/data-url-image";

interface VotingProblem {
  status: number;
  type: string;
  title: string;
  detail: string;
}

interface VotingItemRecord {
  id: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    likes: number;
  };
}

interface VotingItemInput {
  title?: string;
  imageUrl?: string;
}

function buildProblem(status: number, title: string, detail: string): VotingProblem {
  return {
    status,
    type: `https://api.shop.am/problems/${status === 404 ? "not-found" : "bad-request"}`,
    title,
    detail,
  };
}

function requireTrimmedValue(value: string | undefined, fieldName: string): string {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw buildProblem(400, `${fieldName} is required`, `Please provide a valid ${fieldName.toLowerCase()}.`);
  }

  return trimmedValue;
}

/**
 * Inline data URLs are uploaded to R2 (voting/…); HTTPS URLs are stored as-is.
 */
async function resolveVotingImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith("data:image/")) {
    return imageUrl;
  }

  if (!isR2Configured()) {
    throw buildProblem(
      503,
      "Image storage unavailable",
      "R2 is not configured; cannot save inline images. Upload a file or configure R2.",
    );
  }

  const parsed = parseDataImageUrl(imageUrl);
  if (!parsed) {
    throw buildProblem(
      400,
      "Invalid image",
      "Image must be a valid data URL or a public image URL.",
    );
  }

  return uploadVotingImageToR2(parsed.buffer, parsed.contentType);
}

function getTopLikedId(items: VotingItemRecord[]): string | null {
  let topLikedId: string | null = null;
  let maxLikes = 0;

  for (const item of items) {
    if (item._count.likes > maxLikes) {
      maxLikes = item._count.likes;
      topLikedId = item.id;
    }
  }

  return maxLikes > 0 ? topLikedId : null;
}

function mapVotingItem(item: VotingItemRecord, topLikedId: string | null) {
  return {
    id: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    likeCount: item._count.likes,
    topLiked: item.id === topLikedId,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

class AdminVotingService {
  async getVotingItems() {
    const rawItems = await db.votingItem.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const items: VotingItemRecord[] = rawItems as VotingItemRecord[];

    const topLikedId = getTopLikedId(items);
    const totalLikes = items.reduce(
      (sum: number, item: VotingItemRecord) => sum + item._count.likes,
      0
    );

    return {
      data: items.map((item) => mapVotingItem(item, topLikedId)),
      meta: {
        totalItems: items.length,
        totalLikes,
        topLikedId,
      },
    };
  }

  async getVotingItemById(itemId: string) {
    const item = await db.votingItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    return mapVotingItem(item, null);
  }

  async createVotingItem(data: VotingItemInput) {
    const title = requireTrimmedValue(data.title, "Title");
    const rawImageUrl = requireTrimmedValue(data.imageUrl, "Image");
    const imageUrl = await resolveVotingImageUrl(rawImageUrl);

    const item = await db.votingItem.create({
      data: {
        title,
        imageUrl,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      data: mapVotingItem(item, null),
    };
  }

  async updateVotingItem(itemId: string, data: VotingItemInput) {
    const existingItem = await db.votingItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingItem) {
      throw buildProblem(404, "Voting item not found", `Voting item with id '${itemId}' does not exist.`);
    }

    const title = requireTrimmedValue(data.title, "Title");
    const rawImageUrl = requireTrimmedValue(data.imageUrl, "Image");
    const imageUrl = await resolveVotingImageUrl(rawImageUrl);

    const item = await db.votingItem.update({
      where: {
        id: itemId,
      },
      data: {
        title,
        imageUrl,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      data: mapVotingItem(item, null),
    };
  }

  async deleteVotingItem(itemId: string) {
    const existingItem = await db.votingItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingItem) {
      throw buildProblem(404, "Voting item not found", `Voting item with id '${itemId}' does not exist.`);
    }

    await db.votingItem.update({
      where: {
        id: itemId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }
}

export const adminVotingService = new AdminVotingService();
