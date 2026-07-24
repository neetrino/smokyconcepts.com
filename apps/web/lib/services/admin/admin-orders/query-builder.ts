import { Prisma } from "@prisma/client";
import type { OrderFilters } from "./types";
import { CUSTOM_SIZE_ORDER_NOTE_MARKER } from "../../custom-size-order.service";

/**
 * Build where clause for order queries
 */
export function buildOrderWhereClause(filters: OrderFilters): Prisma.OrderWhereInput {
  const andConditions: Prisma.OrderWhereInput[] = [];

  // Apply status filter
  if (filters.status) {
    andConditions.push({ status: filters.status });
  }

  // Apply payment status filter
  if (filters.paymentStatus) {
    andConditions.push({ paymentStatus: filters.paymentStatus });
  }

  // Apply search filter
  if (filters.search && filters.search.trim()) {
    const searchTerm = filters.search.trim();
    andConditions.push({
      OR: [
        { number: { contains: searchTerm, mode: 'insensitive' } },
        { customerEmail: { contains: searchTerm, mode: 'insensitive' } },
        { customerPhone: { contains: searchTerm, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { firstName: { contains: searchTerm, mode: 'insensitive' } },
              { lastName: { contains: searchTerm, mode: 'insensitive' } },
              { email: { contains: searchTerm, mode: 'insensitive' } },
              { phone: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        },
      ],
    });
  }

  if (filters.orderType === 'custom') {
    andConditions.push({
      items: {
        some: {
          OR: [
            { customizePlain: { not: null } },
            { customizeHtml: { not: null } },
          ],
        },
      },
    });
  }

  if (filters.orderType === 'new') {
    andConditions.push({
      AND: [
        {
          items: {
            some: {
              sizeCatalogImageUrl: { not: null },
            },
          },
        },
        {
          notes: {
            contains: CUSTOM_SIZE_ORDER_NOTE_MARKER,
            mode: 'insensitive',
          },
        },
        { customerEmail: { not: null } },
        { customerEmail: { not: '' } },
        { customerPhone: { not: null } },
        { customerPhone: { not: '' } },
      ],
    });
  }

  if (filters.orderType === 'orders') {
    andConditions.push({
      NOT: {
        OR: [
          {
            items: {
              some: {
                OR: [
                  { customizePlain: { not: null } },
                  { customizeHtml: { not: null } },
                ],
              },
            },
          },
          {
            AND: [
              {
                items: {
                  some: {
                    sizeCatalogImageUrl: { not: null },
                  },
                },
              },
              {
                notes: {
                  contains: CUSTOM_SIZE_ORDER_NOTE_MARKER,
                  mode: 'insensitive',
                },
              },
            ],
          },
        ],
      },
    });
  }

  if (filters.orderType === 'early') {
    andConditions.push({
      items: {
        some: {
          earlyAccess: true,
        },
      },
    });
  }

  // Return where clause
  if (andConditions.length > 0) {
    return { AND: andConditions };
  }

  return {};
}

/**
 * Build orderBy clause for order queries
 */
export function buildOrderByClause(filters: OrderFilters): Prisma.OrderOrderByWithRelationInput {
  const sortBy = filters.sortBy || 'createdAt';
  const sortOrder = filters.sortOrder || 'desc';
  
  // Map frontend sort fields to database fields
  const sortFieldMap: Record<string, string> = {
    'total': 'total',
    'createdAt': 'createdAt',
  };
  
  const dbSortField = sortFieldMap[sortBy] || 'createdAt';
  return { [dbSortField]: sortOrder };
}




