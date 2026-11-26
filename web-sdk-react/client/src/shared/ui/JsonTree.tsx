import { collapseAllNested, JsonView } from 'react-json-view-lite';
import { useTranslation } from 'react-i18next';

const CLASS_NAMES = {
  container: 'json-tree',
  basicChildStyle: 'json-tree__child',
  childFieldsContainer: 'json-tree__children',
  label: 'json-tree__label',
  clickableLabel: 'json-tree__label json-tree__label--clickable',
  nullValue: 'json-tree__value json-tree__value--empty',
  undefinedValue: 'json-tree__value json-tree__value--empty',
  numberValue: 'json-tree__value json-tree__value--number',
  stringValue: 'json-tree__value json-tree__value--string',
  booleanValue: 'json-tree__value json-tree__value--boolean',
  otherValue: 'json-tree__value',
  punctuation: 'json-tree__punctuation',
  expandIcon: 'json-tree__toggle json-tree__toggle--collapsed',
  collapseIcon: 'json-tree__toggle',
  collapsedContent: 'json-tree__collapsed',
  noQuotesForStringValues: false,
  quotesForFieldNames: false,
  stringifyStringValues: false,
};

interface JsonTreeProps {
  data: unknown;
}

export function JsonTree({ data }: JsonTreeProps) {
  const { t } = useTranslation();

  if (typeof data !== 'object' || data === null) {
    return <pre className="json-tree">{JSON.stringify(data) ?? t('jsonTree.empty')}</pre>;
  }

  return (
    <JsonView
      data={data}
      shouldExpandNode={collapseAllNested}
      clickToExpandNode
      style={{
        ...CLASS_NAMES,
        ariaLables: { collapseJson: t('jsonTree.collapse'), expandJson: t('jsonTree.expand') },
      }}
    />
  );
}
