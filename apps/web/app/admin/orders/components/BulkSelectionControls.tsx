'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card, Button } from '@shop/ui';

interface BulkSelectionControlsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  bulkDeleting: boolean;
  selectedLabel?: string;
  deleteLabel?: string;
  deletingLabel?: string;
}

export function BulkSelectionControls({
  selectedCount,
  onBulkDelete,
  bulkDeleting,
  selectedLabel,
  deleteLabel,
  deletingLabel,
}: BulkSelectionControlsProps) {
  const { t } = useTranslation();

  if (selectedCount === 0) {
    return null;
  }

  const selected = selectedLabel ?? t('admin.orders.selectedOrders').replace('{count}', selectedCount.toString());
  const deleteText = deleteLabel ?? t('admin.orders.deleteSelected');
  const deletingText = deletingLabel ?? t('admin.orders.deleting');

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {selected}
        </div>
        <Button
          variant="outline"
          onClick={onBulkDelete}
          disabled={bulkDeleting}
        >
          {bulkDeleting ? deletingText : deleteText}
        </Button>
      </div>
    </Card>
  );
}
