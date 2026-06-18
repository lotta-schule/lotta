import React from 'react';
import { propertyIconData } from './propertyIconData';

export type PropertyIconProps = {
  name: keyof typeof propertyIconData;
  value: string;
};

export const PropertyIcon = React.memo(({ name, value }: PropertyIconProps) => {
  const keys = [value, ...value.split(' '), ...value.split('/')].map((v) =>
    v.toLowerCase()
  );

  const path = React.useMemo(() => {
    const key = keys.find(
      (key) =>
        !!(propertyIconData[name] as Record<string, string | undefined>)?.[key]
    );
    if (!key) {
      return;
    }
    return (propertyIconData[name] as Record<string, string | undefined>)?.[
      key
    ];
  }, [name, keys]);

  const icon = React.useMemo(() => {
    if (!path) {
      return null;
    }
    return (
      <img
        src={`/analytics-icon/${path}`}
        role={'presentation'}
        style={{ height: '1em', width: 'auto', verticalAlign: 'middle' }}
      />
    );
  }, [path]);

  return (
    <div
      style={{
        display: 'inline-block',
        marginInlineEnd: 'calc(0.25 * var(--lotta-spacing))',
        width: '2em',
        overflow: 'hidden',
      }}
    >
      {icon}
    </div>
  );
});
PropertyIcon.displayName = 'PropertyIcon';
