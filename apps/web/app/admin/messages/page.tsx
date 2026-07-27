'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@shop/ui';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import { AdminShell } from '../components/AdminShell';
import { AdminNewBadge } from '../components/AdminNewBadge';
import { BulkSelectionControls } from '../orders/components/BulkSelectionControls';
import { ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';
import {
  useAdminLastSeen,
  useMarkAdminSectionSeenOnLeave,
  useSeedAdminLastSeenBaseline,
} from '../hooks/useAdminLastSeen';
import { getAdminNewBadgeLabel } from '../utils/adminNewBadgeLabel';
import { formatAdminDateTime } from '../utils/formatAdminDate';
import { MessageDetailsDrawer } from './components/MessageDetailsDrawer';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  source: 'CONTACT' | 'PERSONALIZE';
  createdAt: string;
}

interface ContactMessagesResponse {
  data: ContactMessage[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

function getText(value: string, key: string, fallback: string): string {
  return value === key ? fallback : value;
}

export default function AdminMessagesPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'new'>('all');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ContactMessagesResponse['meta'] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [openedMessage, setOpenedMessage] = useState<ContactMessage | null>(null);

  const title = getText(t('admin.menu.messages'), 'admin.menu.messages', 'Messages');
  const searchPlaceholder = getText(
    t('admin.messages.searchPlaceholder'),
    'admin.messages.searchPlaceholder',
    'Search by name, email or message...'
  );
  const senderLabel = getText(t('admin.messages.sender'), 'admin.messages.sender', 'Sender');
  const phoneLabel = getText(t('admin.messages.phone'), 'admin.messages.phone', 'Phone');
  const sourceLabel = getText(t('admin.messages.source'), 'admin.messages.source', 'Source');
  const sourceContactLabel = getText(
    t('admin.messages.sourceContact'),
    'admin.messages.sourceContact',
    'Contact',
  );
  const sourcePersonalizeLabel = getText(
    t('admin.messages.sourcePersonalize'),
    'admin.messages.sourcePersonalize',
    'Personalize',
  );
  const messageLabel = getText(t('admin.messages.message'), 'admin.messages.message', 'Message');
  const messageDetailsTitle = getText(
    t('admin.messages.detailsTitle'),
    'admin.messages.detailsTitle',
    'Message details'
  );
  const emailLabel = getText(t('admin.messages.email'), 'admin.messages.email', 'Email');
  const dateLabel = getText(t('admin.messages.date'), 'admin.messages.date', 'Date');
  const closeLabel = getText(t('admin.common.close'), 'admin.common.close', 'Close');
  const noMessagesLabel = getText(t('admin.messages.empty'), 'admin.messages.empty', 'No messages found');
  const allMessagesLabel = getText(t('admin.messages.allMessages'), 'admin.messages.allMessages', 'All');
  const newMessagesLabel = getText(t('admin.messages.newMessages'), 'admin.messages.newMessages', 'New');
  const showingPageLabel = getText(
    t('admin.messages.showingPage'),
    'admin.messages.showingPage',
    'Page {page} of {totalPages} ({total} total)'
  );
  const previousLabel = getText(t('admin.common.previous'), 'admin.common.previous', 'Previous');
  const nextLabel = getText(t('admin.common.next'), 'admin.common.next', 'Next');
  const loadingLabel = getText(t('admin.common.loading'), 'admin.common.loading', 'Loading...');
  const searchLabel = getText(t('admin.users.search'), 'admin.users.search', 'Search');
  const selectAllLabel = getText(
    t('admin.messages.selectAll'),
    'admin.messages.selectAll',
    'Select all messages'
  );
  const newBadgeLabel = getAdminNewBadgeLabel(t);

  const { isNew: isMessageNew, lastSeenAt } = useAdminLastSeen('messages');
  useMarkAdminSectionSeenOnLeave('messages');

  useSeedAdminLastSeenBaseline(
    'messages',
    messages.map((contactMessage) => contactMessage.createdAt),
    !loading && messages.length > 0 && typeFilter === 'all'
  );

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/supersudo');
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: page.toString(),
        limit: '20',
        search,
      };
      if (typeFilter === 'new') {
        params.createdAfter = lastSeenAt ?? new Date().toISOString();
      }
      const response = await apiClient.get<ContactMessagesResponse>('/api/v1/admin/messages', {
        params,
      });
      setMessages(response.data ?? []);
      setMeta(response.meta ?? null);
      setSelectedIds(new Set());
    } catch {
      setMessages([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter, lastSeenAt]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      void fetchMessages();
    }
  }, [isLoggedIn, isAdmin, fetchMessages]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (messages.length === 0) return;
    setSelectedIds((prev) => {
      const allIds = messages.map((message) => message.id);
      const hasAll = allIds.every((id) => prev.has(id));
      return hasAll ? new Set() : new Set(allIds);
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const deleteConfirm = getText(
      t('admin.messages.deleteConfirm'),
      'admin.messages.deleteConfirm',
      'Delete {count} selected messages?'
    );
    if (!confirm(deleteConfirm.replace('{count}', selectedIds.size.toString()))) return;

    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      const results = await Promise.allSettled(
        ids.map(async (id) => {
          await apiClient.delete(`/api/v1/admin/messages/${id}`);
          return id;
        })
      );

      const failedIds = results
        .map((result, index) => (result.status === 'rejected' ? ids[index] : null))
        .filter((id): id is string => id !== null);

      const bulkDeleteFinished = getText(
        t('admin.messages.bulkDeleteFinished'),
        'admin.messages.bulkDeleteFinished',
        'Bulk delete finished. Success: {success}/{total}'
      );
      const bulkDeleteFailed = getText(
        t('admin.messages.bulkDeleteFailed'),
        'admin.messages.bulkDeleteFailed',
        'Bulk delete finished. Success: {success}/{total}\n\nFailed messages: {failed}'
      );

      if (failedIds.length > 0) {
        alert(
          bulkDeleteFailed
            .replace('{success}', (ids.length - failedIds.length).toString())
            .replace('{total}', ids.length.toString())
            .replace('{failed}', failedIds.join(', '))
        );
      } else {
        alert(
          bulkDeleteFinished
            .replace('{success}', ids.length.toString())
            .replace('{total}', ids.length.toString())
        );
      }

      setSelectedIds(new Set());
      await fetchMessages();
    } catch {
      alert(
        getText(
          t('admin.messages.failedToDelete'),
          'admin.messages.failedToDelete',
          'Failed to delete selected messages. Please try again.'
        )
      );
    } finally {
      setBulkDeleting(false);
    }
  };

  if (isLoading || (!isLoggedIn && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-[#414141]/70">{loadingLabel}</div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <Card className="mb-6 border-[#dcc090]/30 bg-white/90 p-4 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
            <div className="mb-4 inline-flex rounded-full bg-[#dcc090]/20 p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('all');
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 transition-all ${
                  typeFilter === 'all'
                    ? 'bg-[#122a26] text-[#dcc090] shadow-sm'
                    : 'text-[#414141]/70 hover:text-[#122a26]'
                }`}
              >
                {allMessagesLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTypeFilter('new');
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 transition-all ${
                  typeFilter === 'new'
                    ? 'bg-[#122a26] text-[#dcc090] shadow-sm'
                    : 'text-[#414141]/70 hover:text-[#122a26]'
                }`}
              >
                {newMessagesLabel}
              </button>
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPage(1);
                void fetchMessages();
              }}
              className="flex gap-3"
            >
              <Input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1"
              />
              <Button type="submit" variant="primary">
                {searchLabel}
              </Button>
            </form>
          </Card>

          <BulkSelectionControls
            selectedCount={selectedIds.size}
            onBulkDelete={handleBulkDelete}
            bulkDeleting={bulkDeleting}
            selectedLabel={getText(
              t('admin.messages.selectedMessages'),
              'admin.messages.selectedMessages',
              'Selected {count} messages'
            ).replace('{count}', selectedIds.size.toString())}
            deleteLabel={getText(
              t('admin.messages.deleteSelected'),
              'admin.messages.deleteSelected',
              'Delete Selected'
            )}
            deletingLabel={getText(t('admin.messages.deleting'), 'admin.messages.deleting', 'Deleting...')}
          />

          <Card className="border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
            <h1 className="mb-4 text-2xl font-extrabold text-[#122a26]">{title}</h1>

            {loading ? (
              <div className="py-8 text-center text-[#414141]/70">{loadingLabel}</div>
            ) : messages.length === 0 ? (
              <div className="py-8 text-center text-[#414141]/70">{noMessagesLabel}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#dcc090]/25">
                  <thead className="bg-[#122a26]">
                    <tr>
                      <th className="w-12 px-3 py-3 text-left">
                        <input
                          type="checkbox"
                          aria-label={selectAllLabel}
                          checked={messages.length > 0 && messages.every((message) => selectedIds.has(message.id))}
                          onChange={toggleSelectAll}
                          className="h-4 w-4 rounded border-[#dcc090]/60 bg-white text-[#122a26] focus:ring-[#dcc090]"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {senderLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {sourceLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {phoneLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {dateLabel}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dcc090]/20 bg-white">
                    {messages.map((contactMessage) => (
                      <tr
                        key={contactMessage.id}
                        className="cursor-pointer align-top hover:bg-[#dcc090]/10"
                        onClick={() => setOpenedMessage(contactMessage)}
                      >
                        <td className="px-3 py-4" onClick={(event) => event.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label={getText(
                              t('admin.messages.selectMessage'),
                              'admin.messages.selectMessage',
                              'Select message from {name}'
                            ).replace('{name}', contactMessage.name)}
                            checked={selectedIds.has(contactMessage.id)}
                            onChange={() => toggleSelect(contactMessage.id)}
                            className="h-4 w-4 rounded border-[#dcc090]/60 bg-white text-[#122a26] focus:ring-[#dcc090]"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <div className="text-sm font-semibold text-[#122a26]">{contactMessage.name}</div>
                            {isMessageNew(contactMessage.createdAt) ? (
                              <AdminNewBadge label={newBadgeLabel} />
                            ) : null}
                          </div>
                          <div className="text-sm text-[#414141]/70">{contactMessage.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                              contactMessage.source === 'PERSONALIZE'
                                ? 'bg-[#dcc090]/25 text-[#122a26]'
                                : 'bg-[#122a26]/10 text-[#122a26]'
                            }`}
                          >
                            {contactMessage.source === 'PERSONALIZE'
                              ? sourcePersonalizeLabel
                              : sourceContactLabel}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#122a26]">{contactMessage.subject}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#414141]/70">
                          {formatAdminDateTime(contactMessage.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {meta && meta.totalPages > 1 ? (
              <div className="mt-6 flex items-center justify-between gap-4">
                <p className="text-sm text-[#414141]/75">
                  {showingPageLabel
                    .replace('{page}', meta.page.toString())
                    .replace('{totalPages}', meta.totalPages.toString())
                    .replace('{total}', meta.total.toString())}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={page <= 1}
                    onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  >
                    {previousLabel}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={page >= meta.totalPages}
                    onClick={() => setPage((currentPage) => Math.min(meta.totalPages, currentPage + 1))}
                  >
                    {nextLabel}
                  </Button>
                </div>
              </div>
            ) : null}
          </Card>

          <MessageDetailsDrawer
            message={openedMessage}
            labels={{
              title: messageDetailsTitle,
              sender: senderLabel,
              email: emailLabel,
              phone: phoneLabel,
              source: sourceLabel,
              sourceContact: sourceContactLabel,
              sourcePersonalize: sourcePersonalizeLabel,
              message: messageLabel,
              date: dateLabel,
              close: closeLabel,
            }}
            onClose={() => setOpenedMessage(null)}
          />
        </AdminShell>
      </div>
    </div>
  );
}
