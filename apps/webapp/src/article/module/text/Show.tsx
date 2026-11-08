import * as React from 'react';
import type { Descendant } from 'slate';
import type {
  CustomElement,
  FormattedText,
  Image,
  Link,
} from './SlateCustomTypes';
import { getNormalizedSlateState, isSameHostLink } from './slateDocument';
import { StaticImage } from './elements/StaticImage';
import { ContentModuleModel } from '../../../model';

interface ShowProps {
  contentModule: ContentModuleModel<{ nodes: Descendant[] }>;
}

// Renders a saved Slate document as plain React elements. It produces the same
// markup and whitespace handling as Slate's read-only <Editable>, without
// shipping `slate` / `slate-react` to readers (the editor is lazy-loaded in Edit).
export const Show = React.memo<ShowProps>(({ contentModule }) => {
  const nodes = React.useMemo(
    () => getNormalizedSlateState(contentModule.content?.nodes ?? []) ?? [],
    [contentModule.content]
  );

  return (
    <div
      data-testid="TextShow"
      style={{
        position: 'relative',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
      }}
    >
      {nodes.map((node, index) => (
        <StaticNode key={index} node={node} parent={null} isLast={false} />
      ))}
    </div>
  );
});
Show.displayName = 'TextShow';

type StaticNodeProps = {
  node: Descendant;
  parent: CustomElement | null;
  isLast: boolean;
};

const isText = (node: Descendant): node is FormattedText =>
  typeof (node as FormattedText).text === 'string';

// Inline elements, as configured by withLinks / withImages in the editor.
const isInline = (element: CustomElement) =>
  element.type === 'link' || element.type === 'image';

const nodeString = (node: Descendant): string =>
  isText(node)
    ? node.text
    : ((node as { children?: Descendant[] }).children ?? [])
        .map(nodeString)
        .join('');

const StaticNode = ({ node, parent, isLast }: StaticNodeProps) => {
  if (isText(node)) {
    return <StaticLeaf leaf={node} parent={parent} isLast={isLast} />;
  }

  const element = node as CustomElement;
  const children = ((element as { children?: Descendant[] }).children ??
    []) as Descendant[];
  const content = children.map((child, index) => (
    <StaticNode
      key={index}
      node={child}
      parent={element}
      isLast={index === children.length - 1}
    />
  ));

  switch (element.type) {
    case 'unordered-list':
      return (
        <ul style={{ listStyle: 'disc', paddingLeft: '1em' }}>{content}</ul>
      );
    case 'ordered-list':
      return (
        <ol style={{ listStyle: 'decimal', paddingLeft: '1em' }}>{content}</ol>
      );
    case 'list-item':
      return <li style={{ paddingLeft: '.5em' }}>{content}</li>;
    case 'image':
      return <StaticImage element={element as Image} />;
    case 'paragraph':
      return <p style={{ overflow: 'auto' }}>{content}</p>;
    case 'link': {
      const { href } = element as Link;
      return (
        <a
          href={href}
          title={href}
          target={isSameHostLink(href) ? '_self' : '_blank'}
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }
    default:
      return <div>{content}</div>;
  }
};

const StaticLeaf = ({
  leaf,
  parent,
  isLast,
}: {
  leaf: FormattedText;
  parent: CustomElement | null;
  isLast: boolean;
}) => {
  const style: React.CSSProperties = {
    fontWeight: leaf.bold ? 'bold' : 'normal',
    fontStyle: leaf.italic ? 'italic' : 'normal',
    textDecoration: leaf.underline ? 'underline' : 'none',
    fontSize: leaf.small ? '.85em' : 'inherit',
  };

  // Same rules as slate-react's <String>:
  // - an empty block keeps its height through a line break,
  // - empty text next to an inline element renders as a zero-width space,
  // - a trailing new line gets doubled, as browsers collapse the last one.
  let text: React.ReactNode = leaf.text;
  if (leaf.text === '') {
    const isEmptyBlock =
      isLast && parent && !isInline(parent) && nodeString(parent) === '';
    text = isEmptyBlock ? (
      <>
        {'﻿'}
        <br />
      </>
    ) : (
      '﻿'
    );
  } else if (isLast && leaf.text.endsWith('\n')) {
    text = `${leaf.text}\n`;
  }

  return <span style={style}>{text}</span>;
};
