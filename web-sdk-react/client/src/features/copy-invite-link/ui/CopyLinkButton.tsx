import { Link } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, IconButton, showToast } from '@/shared/ui';

interface CopyLinkButtonProps {
  compact?: boolean;
}

const copyLink = async () => {
  await navigator.clipboard.writeText(window.location.href);
  showToast('room.linkCopied');
};

export function CopyLinkButton({ compact }: CopyLinkButtonProps) {
  const { t } = useTranslation();

  return compact
    ? <IconButton size="small" label={t('room.copyLink')} onClick={() => void copyLink()}><Link size={16} /></IconButton>
    : <Button variant="primary" onClick={() => void copyLink()}>{t('room.copyLink')}</Button>;
}
