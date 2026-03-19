export interface VotingItem {
  id: string;
  title: string;
  imageUrl: string;
  likeCount: number;
  topLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VotingItemsResponse {
  data: VotingItem[];
  meta?: {
    totalItems: number;
    totalLikes: number;
    topLikedId: string | null;
  };
}

export interface VotingFormData {
  title: string;
  imageUrl: string;
}
