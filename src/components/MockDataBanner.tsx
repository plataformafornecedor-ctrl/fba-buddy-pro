import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export function MockDataBanner() {
  const { t } = useLanguage();
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 text-warning text-sm font-medium">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{t('mock.banner')}</span>
    </div>
  );
}
