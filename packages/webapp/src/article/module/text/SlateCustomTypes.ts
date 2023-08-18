import { BaseEditor } from 'slate';
import { ReactEditor } from 'slate-react';

export type FormattedText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  small?: boolean;
  text: string;
};

export type ParagraphElement = {
  type: 'paragraph';
  children: FormattedText[];
};

export type UnorderedListElement = {
  type: 'unordered-list';
  children: ListItem[];
};

export type OrderedListElement = {
  type: 'ordered-list';
  children: ListItem[];
};

export type ListItem = {
  type: 'list-item';
};

export type Image = {
  type: 'image';
  fileId?: string;
  /** @deprecated
   * use fileId instead
   **/
  src?: string;
  alignment?: string;
  size?: string;
  children: FormattedText[];
};

export type Link = {
  type: 'link';
  href: string;
  children: FormattedText[];
};

export type CustomText = FormattedText;

export type BlockElement =
  | ParagraphElement
  | UnorderedListElement
  | OrderedListElement;

export type InlineElement = ListItem | Image | Link;

export type CustomElement = BlockElement | InlineElement;

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Text: CustomText;
    Element: CustomElement;
  }
}

export { Node } from 'slate';
