import * as React from 'react';
import { render } from 'test/util';
import { Klausurenplan } from 'test/fixtures';
import { Show } from './Show';

const titleContentModule = Klausurenplan.contentModules[0];

describe('shared/article/module/table/Show', () => {
  it('should display the correct title', () => {
    const screen = render(<Show contentModule={titleContentModule} />);
    expect(
      screen.getByRole('heading', { name: /wie war dein erster tag/i })
    ).toBeInTheDocument();
  });

  it('should default to a h4 shared when no header level is given', () => {
    const screen = render(<Show contentModule={titleContentModule} />);
    expect(
      screen.getByRole('heading', { name: /wie war dein erster tag/i })
    ).toHaveProperty('nodeName', 'H4');
  });

  it('should show the correct variant when given in the configuration', () => {
    const contentModule = {
      ...titleContentModule,
      configuration: {
        level: 1,
      },
    };
    const screen = render(<Show contentModule={contentModule} />);
    expect(
      screen.getByRole('heading', { name: /wie war dein erster tag/i })
    ).toHaveProperty('nodeName', 'H1');
  });
});
