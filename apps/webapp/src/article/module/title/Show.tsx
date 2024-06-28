import * as React from 'react';
import { ContentModuleModel } from 'model';
import get from 'lodash/get';

interface ShowProps {
  contentModule: ContentModuleModel<{ title: string }>;
}

export const Show = React.memo<ShowProps>(({ contentModule }) => {
  const variant = `h${get(contentModule.configuration, 'level', 4)}` as
    | 'h4'
    | 'h5'
    | 'h6';

  return React.createElement(variant, {}, contentModule.content?.title);
});
Show.displayName = 'TitleShow';
