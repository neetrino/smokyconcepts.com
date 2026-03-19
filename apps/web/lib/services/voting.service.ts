import { db } from "@white-shop/db";

interface VotingProblem {
  status: number;
  type: string;
  title: string;
  detail: string;
}

function buildProblem(status: number, title: string, detail: string): VotingProblem {
  return {
    status,
    type: `https://api.shop.am/problems/${status === 404 ? "not-found" : status === 401 ? "unauthorized" : "bad-request"}`,
    title,
    detail,
  };
}

class VotingService {
  async getVotingItems(userId?: string) {
    const items = await db.votingItem.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
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

    const likedItemIds = new Set<string>();

    if (userId && items.length > 0) {
      const likes = await db.votingLike.findMany({
        where: {
          userId,
          itemId: {
            in: items.map((item) => item.id),
          },
        },
        select: {
          itemId: true,
        },
      });

      for (const like of likes) {
        likedItemIds.add(like.itemId);
      }
    }

    return {
      data: items.map((item) => ({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl,
        likeCount: item._count.likes,
        likedByCurrentUser: likedItemIds.has(item.id),
      })),
    };
  }

  async likeItem(itemId: string, userId: string) {
    await this.ensureActiveVotingItem(itemId);

    await db.votingLike.upsert({
      where: {
        itemId_userId: {
          itemId,
          userId,
        },
      },
      update: {},
      create: {
        itemId,
        userId,
      },
    });

    return this.getLikeState(itemId, userId);
  }

  async unlikeItem(itemId: string, userId: string) {
    await this.ensureActiveVotingItem(itemId);

    await db.votingLike.deleteMany({
      where: {
        itemId,
        userId,
      },
    });

    return this.getLikeState(itemId, userId);
  }

  private async ensureActiveVotingItem(itemId: string) {
    const item = await db.votingItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!item) {
      throw buildProblem(404, "Voting item not found", `Voting item with id '${itemId}' does not exist.`);
    }
  }

  private async getLikeState(itemId: string, userId: string) {
    const [likeCount, likeRecord] = await db.$transaction([
      db.votingLike.count({
        where: {
          itemId,
        },
      }),
      db.votingLike.findUnique({
        where: {
          itemId_userId: {
            itemId,
            userId,
          },
        },
        select: {
          id: true,
        },
      }),
    ]);

    return {
      data: {
        itemId,
        likeCount,
        likedByCurrentUser: Boolean(likeRecord),
      },
    };
  }
}

export const votingService = new VotingService();
