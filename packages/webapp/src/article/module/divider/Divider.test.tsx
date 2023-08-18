import * as React from 'react';
import { ContentModuleModel, ContentModuleType } from 'model';
import { render } from 'test/util';
import { Divider } from './Divider';

describe('shared/article/module/divider/Divider', () => {
  const dividerContentModule: ContentModuleModel = {
    id: '101100',
    sortKey: 10,
    type: ContentModuleType.DIVIDER,
    files: [],
    updatedAt: new Date().toString(),
    insertedAt: new Date().toString(),
    content: {},
    configuration: {},
  };

  it('should render a hr element', () => {
    const screen = render(
      <Divider
        contentModule={dividerContentModule}
        onUpdateModule={jest.fn()}
      />
    );
    expect(screen.getByRole('separator')).toBeVisible();
  });
});
