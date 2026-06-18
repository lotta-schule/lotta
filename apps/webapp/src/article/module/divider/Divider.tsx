import * as React from 'react';
import { Divider as LottaDivider } from '@lotta-schule/hubert';
import { ContentModuleComponentProps } from '../ContentModule';

export const Divider = React.memo<ContentModuleComponentProps>(() => (
  <div data-testid="DividerContentModule">
    <LottaDivider />
  </div>
));
Divider.displayName = 'Divider';
