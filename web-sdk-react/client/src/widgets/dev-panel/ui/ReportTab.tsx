import { useTranslation } from 'react-i18next';
import { selectLevelCounts, useSdkLogStore } from '@/features/sdk-log';
import { Button, showToast } from '@/shared/ui';
import { buildDiagnosticsReport, downloadReport } from '../model/report';

const SECTIONS = ['session', 'network', 'transports', 'peers', 'events', 'logs'] as const;

export function ReportTab() {
  const { t } = useTranslation();
  const logs = useSdkLogStore((state) => state.entries);
  const counts = selectLevelCounts(logs);

  const copy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(await buildDiagnosticsReport(), null, 2));
    showToast('dev.copied');
  };

  return (
    <div className="stats">
      <p className="hint">{t('dev.report.hint')}</p>
      <ul className="report-sections">
        {SECTIONS.map((section) => <li key={section}>{t(`dev.report.sections.${section}`)}</li>)}
      </ul>
      <p className="hint">
        {t('dev.report.logsSummary', { total: logs.length, errors: counts.error, warnings: counts.warn })}
      </p>
      <div className="report-actions">
        <Button variant="primary" onClick={() => void copy()}>{t('dev.report.copy')}</Button>
        <Button onClick={() => void buildDiagnosticsReport().then(downloadReport)}>{t('dev.report.download')}</Button>
      </div>
    </div>
  );
}
