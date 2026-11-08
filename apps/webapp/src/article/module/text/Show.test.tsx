import * as React from 'react';
import { createEditor, Descendant } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import { render, waitFor } from '#/test/util';
import {
  ComputerExperten,
  VivaLaRevolucion,
  Weihnachtsmarkt,
} from '#/test/fixtures';
import { ContentModuleModel, ContentModuleType } from '#/model';
import {
  getNormalizedSlateState,
  renderElement,
  renderLeaf,
  withImages,
  withLinks,
} from './SlateUtils';
import { Show } from './Show';

// The previous reader view: Slate's read-only <Editable>. The new Show must
// look the same without using Slate.
const SlateReadOnly = ({ nodes }: { nodes: Descendant[] }) => {
  const editor = React.useMemo(
    () => withImages(withLinks(withReact(createEditor()))),
    []
  );
  return (
    <Slate editor={editor} value={nodes} onChange={() => {}}>
      <Editable
        renderElement={renderElement({ editing: false })}
        renderLeaf={renderLeaf}
        readOnly
      />
    </Slate>
  );
};

const textModule = (nodes: any): ContentModuleModel<any> =>
  ({
    id: 'text',
    type: ContentModuleType.TEXT,
    content: { nodes },
    sortKey: 0,
    files: [],
  }) as any;

// Everything the editor can produce, including Slate's whitespace edge cases.
const editorDocument = [
  {
    type: 'paragraph',
    children: [
      { text: 'Plain, ' },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', ' },
      { text: 'underlined', underline: true },
      { text: ' and ' },
      { text: 'small', small: true },
      { text: ' text.' },
    ],
  },
  { type: 'paragraph', children: [{ text: '' }] },
  {
    type: 'paragraph',
    children: [{ text: 'Line one\nline two (shift+enter)\n' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: '' },
      {
        type: 'link',
        href: 'https://example.com/a',
        children: [{ text: 'A link' }],
      },
      { text: ' in the middle.' },
    ],
  },
  {
    type: 'unordered-list',
    children: [
      { type: 'list-item', children: [{ text: 'First' }] },
      { type: 'list-item', children: [{ text: 'Second', bold: true }] },
    ],
  },
  {
    type: 'ordered-list',
    children: [{ type: 'list-item', children: [{ text: 'Numbered' }] }],
  },
  { type: 'paragraph', children: [{ text: 'Last paragraph' }] },
];

const fixtureTextModules = [ComputerExperten, VivaLaRevolucion, Weihnachtsmarkt]
  .flatMap((article) => article.contentModules)
  .filter((cm) => cm.type === ContentModuleType.TEXT);

const visibleText = (el: HTMLElement) => el.innerText.replace(/﻿/g, '');

const tagStructure = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('*'))
    .map((node) => node.tagName)
    .filter((tag) => tag !== 'SPAN');

const renderBoth = (contentModule: ContentModuleModel<any>) => {
  const reference = render(
    <SlateReadOnly
      nodes={getNormalizedSlateState(contentModule.content.nodes) as any}
    />
  );
  const show = render(<Show contentModule={contentModule} />);
  const expected = reference.container.querySelector(
    '[data-slate-editor]'
  ) as HTMLElement;
  // Void elements (images) contain an invisible, zero-height spacer that only
  // exists so the editor can place a cursor. Readers don't see it.
  expected
    .querySelectorAll('[data-slate-spacer]')
    .forEach((spacer) => spacer.remove());
  return { expected, actual: show.getByTestId('TextShow') };
};

describe('article/module/text/Show', () => {
  it('renders formatted text, links and lists', () => {
    const screen = render(<Show contentModule={textModule(editorDocument)} />);

    expect(screen.getByText('bold')).toHaveStyle({ fontWeight: '700' });
    expect(screen.getByText('italic')).toHaveStyle({ fontStyle: 'italic' });
    expect(screen.getByRole('link', { name: 'A link' })).toHaveAttribute(
      'href',
      'https://example.com/a'
    );
    expect(screen.getByRole('link', { name: 'A link' })).toHaveAttribute(
      'target',
      '_blank'
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('looks like the Slate read-only editor for editor content', async () => {
    const { expected, actual } = renderBoth(textModule(editorDocument));

    await waitFor(() => expect(visibleText(expected)).not.toBe(''));
    expect(visibleText(actual)).toBe(visibleText(expected));
    expect(tagStructure(actual)).toEqual(tagStructure(expected));
  });

  it.each(fixtureTextModules.map((cm, i) => [i, cm] as const))(
    'looks like the Slate read-only editor for saved article text #%i',
    async (_i, contentModule) => {
      const { expected, actual } = renderBoth(contentModule);

      await waitFor(() => expect(visibleText(expected)).not.toBe(''));
      expect(visibleText(actual)).toBe(visibleText(expected));
      expect(tagStructure(actual)).toEqual(tagStructure(expected));
    }
  );

  it('does not import slate', async () => {
    const source = await import('./Show.tsx?raw');
    // Type-only imports are erased at build time.
    expect(source.default).not.toMatch(
      /^import (?!type )[^;]*'slate(-react)?'/m
    );
  });
});
