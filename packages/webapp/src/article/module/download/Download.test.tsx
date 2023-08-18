import React from 'react';
import { render } from 'test/util';
import {
  Klausurenplan,
  imageFile,
  otherImageFile,
  documentFile,
} from 'test/fixtures';
import { Download } from './Download';

const downloadContentModule = {
  ...Klausurenplan.contentModules[1],
  files: [imageFile as any, otherImageFile as any, documentFile as any],
  configuration: {
    hidePreviews: true,
    files: {
      [imageFile.id]: {
        sortKey: 0,
        description: 'An Image File',
      },
      [otherImageFile.id]: {
        sortKey: 10,
        description: 'Another Image File',
      },
      [documentFile.id]: {
        sortKey: 20,
        description: 'A Document File',
      },
    },
  },
};

describe('shared/article/module/download/Download', () => {
  it('should render the editor mode when editModeEnabled is given', async () => {
    const screen = render(
      <Download
        isEditModeEnabled
        contentModule={downloadContentModule}
        onUpdateModule={() => {}}
      />
    );
    expect(
      await screen.findByRole('button', { name: /datei hinzufügen/i })
    ).toBeInTheDocument();
  });

  it('should render the show mode when editModeEnabled is not given', async () => {
    const screen = render(
      <Download
        contentModule={downloadContentModule}
        onUpdateModule={() => {}}
      />
    );
    expect(
      await screen.findAllByRole('link', { name: /download/i })
    ).toHaveLength(3);
  });
});
