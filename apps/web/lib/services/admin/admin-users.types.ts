export type AdminUserListRoleFilter = 'all' | 'customer' | 'admin';

export interface AdminUserListFilters {
  search?: string;
  role?: AdminUserListRoleFilter;
  page?: number;
  limit?: number;
  /** Legacy flat cap, still used by pickers that need one large page. */
  take?: number;
}
