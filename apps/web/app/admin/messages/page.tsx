'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input } from '@shop/ui';
import { apiClient } from '../../../lib/api-client';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import { AdminShell } from '../components/AdminShell';
import { ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
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
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<ContactMessagesResponse['meta'] | null>(null);

  const title = getText(t('admin.menu.messages'), 'admin.menu.messages', 'Messages');
  const searchPlaceholder = getText(
    t('admin.messages.searchPlaceholder'),
    'admin.messages.searchPlaceholder',
    'Search by name, email or message...'
  );
  const senderLabel = getText(t('admin.messages.sender'), 'admin.messages.sender', 'Sender');
  const phoneLabel = getText(t('admin.messages.phone'), 'admin.messages.phone', 'Phone');
  const messageLabel = getText(t('admin.messages.message'), 'admin.messages.message', 'Message');
  const dateLabel = getText(t('admin.messages.date'), 'admin.messages.date', 'Date');
  const noMessagesLabel = getText(t('admin.messages.empty'), 'admin.messages.empty', 'No messages found');
  const showingPageLabel = getText(
    t('admin.messages.showingPage'),
    'admin.messages.showingPage',
    'Page {page} of {totalPages} ({total} total)'
  );
  const previousLabel = getText(t('admin.common.previous'), 'admin.common.previous', 'Previous');
  const nextLabel = getText(t('admin.common.next'), 'admin.common.next', 'Next');
  const loadingLabel = getText(t('admin.common.loading'), 'admin.common.loading', 'Loading...');
  const searchLabel = getText(t('admin.users.search'), 'admin.users.search', 'Search');

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || !isAdmin)) {
      router.push('/supersudo');
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<ContactMessagesResponse>('/api/v1/admin/messages', {
        params: {
          page: page.toString(),
          limit: '20',
          search,
        },
      });
      setMessages(response.data ?? []);
      setMeta(response.meta ?? null);
    } catch {
      setMessages([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      void fetchMessages();
    }
  }, [isLoggedIn, isAdmin, fetchMessages]);

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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {senderLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {phoneLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {messageLabel}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[#dcc090]">
                        {dateLabel}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#dcc090]/20 bg-white">
                    {messages.map((contactMessage) => (
                      <tr key={contactMessage.id} className="align-top hover:bg-[#dcc090]/10">
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-[#122a26]">{contactMessage.name}</div>
                          <div className="text-sm text-[#414141]/70">{contactMessage.email}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-[#122a26]">{contactMessage.subject}</td>
                        <td className="max-w-[420px] px-4 py-4 text-sm text-[#122a26]">
                          <p className="whitespace-pre-wrap break-words">{contactMessage.message}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-[#414141]/70">
                          {new Date(contactMessage.createdAt).toLocaleString()}
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
        </AdminShell>
      </div>
    </div>
  );
}
