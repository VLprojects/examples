import { Copy, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { IconButton } from './IconButton';
import { showToast } from './toast/store';

export interface ApiNoteProps {
  text: string;
  code?: string;
  docsUrl?: string;
}

export function ApiNote({ text, code, docsUrl }: ApiNoteProps) {
  const { t } = useTranslation();

  const copy = async (snippet: string) => {
    await navigator.clipboard.writeText(snippet);
    showToast('apiNote.copied');
  };

  return (
    <div className="api-note">
      <p>{text}</p>
      {code && (
        <div className="api-note__code">
          <pre><code>{code}</code></pre>
          <IconButton size="small" label={t('apiNote.copy')} onClick={() => void copy(code)}>
            <Copy size={12} />
          </IconButton>
        </div>
      )}
      {docsUrl && (
        <a href={docsUrl} target="_blank" rel="noreferrer">
          {t('apiNote.docs')}
          <ExternalLink size={12} aria-hidden />
        </a>
      )}
    </div>
  );
}
