import React from 'react';
import { render } from '#/test/util.js';
import { Klausurenplan } from '#/test/fixtures/index.js';
import { Title } from './Title.js';

const titleContentModule = Klausurenplan.contentModules[0];

describe('shared/article/module/title/Title', () => {
  it('should render the editor mode when editModeEnabled is given', () => {
    const screen = render(
      <Title
        isEditModeEnabled
        contentModule={titleContentModule}
        onUpdateModule={() => {}}
      />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should render the show mode when editModeEnabled is not given', () => {
    const screen = render(
      <Title contentModule={titleContentModule} onUpdateModule={() => {}} />
    );
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
