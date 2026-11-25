import type { KeyboardEvent } from 'react';

interface TabsProps<Id extends string> {
  label: string;
  value: Id;
  tabs: { id: Id; label: string; isMarked?: boolean }[];
  onChange: (id: Id) => void;
}

export function Tabs<Id extends string>({ label, value, tabs, onChange }: TabsProps<Id>) {
  const selectSibling = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];

    if (!step) {
      return;
    }

    const index = tabs.findIndex(({ id }) => id === value);
    const next = tabs[(index + step + tabs.length) % tabs.length];

    onChange(next.id);
    event.currentTarget.querySelector<HTMLElement>(`[data-tab="${next.id}"]`)?.focus();
  };

  return (
    <div className="tabs" role="tablist" aria-label={label} onKeyDown={selectSibling}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          data-tab={tab.id}
          aria-selected={tab.id === value}
          tabIndex={tab.id === value ? 0 : -1}
          className="tabs__item"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {tab.isMarked && <span className="tabs__mark" />}
        </button>
      ))}
    </div>
  );
}
