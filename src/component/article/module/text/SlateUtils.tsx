import React, { CSSProperties } from 'react';
import { Typography } from '@material-ui/core';
import { ReactEditor, RenderElementProps, RenderLeafProps } from 'slate-react';
import { Editor, Element, Range, Text, Transforms, Node } from 'slate';
import { SlatePre050Document, SlatePre050Node } from './interface/SlatePre050Document';
import { SlateImage } from './elements/SlateImage';
import isUrl from 'is-url';

export type Mark = 'bold' | 'italic' | 'underline' | 'link' | 'small';

export type Block = 'paragraph' | 'unordered-list' | 'ordered-list' | 'list-item' | 'image';

export const renderElement = ({ attributes, children, element }: RenderElementProps) => {
    switch (element.type) {
        case 'unordered-list':
            return (
                <ul {...attributes} style={{ listStyle: 'disc', paddingLeft: '1em' }}>{children}</ul>
            );
        case 'ordered-list':
            return (
                <ol {...attributes} style={{ listStyle: 'decimal', paddingLeft: '1em' }}>{children}</ol>
            );
        case 'list-item':
            return (
                <li {...attributes} style={{ paddingLeft: '.5em' }}>{children}</li>
            );
        case 'image': {
            return (
                <SlateImage element={element} attributes={attributes}>{children}</SlateImage>
            );
        }
        case 'paragraph':
            return (
                <Typography variant={'body1'} component={'p'} {...attributes}>{children}</Typography>
            );
        case 'link':
            const href = element.href;
            let isSameHost = false;
            try {
                const url = new URL(href);
                isSameHost = window.location.host === url.host;
            } catch { }
            return (
                <a {...attributes} href={href} title={href} target={isSameHost ? '_self' : '_blank'} rel="noopener noreferrer">{children}</a>
            );
        default:
            return (
                <div {...attributes}>{children}</div>
            );
    }
};

export const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
    const customStyles: CSSProperties = {
        fontWeight: leaf.bold ? 'bold' : 'normal',
        fontStyle: leaf.italic ? 'italic' : 'normal',
        textDecoration: leaf.underline ? 'underline' : 'none',
        fontSize: leaf.small ? '.85em' : 'inherit'
    };
    return (
        <span {...attributes} style={customStyles}>
            {children}
        </span>
    );
};

export const isMarkActive = (editor: Editor, mark: Mark): boolean => {
    return Editor.marks(editor)?.[mark] ?? false;
};

export const toggleMark = (editor: Editor, mark: Mark) => {
    const isActive = isMarkActive(editor, mark);
    Transforms.setNodes(
        editor,
        { [mark]: isActive ? null : true },
        { match: Text.isText, split: true }
    )
};

export const isBlockActive = (editor: Editor, block: Block): boolean => {
    const [match] = Editor.nodes(editor, { match: n => n.type === block });
    return !!match;
};

export const toggleBlock = (editor: Editor, block: Block) => {
    const isActive = isBlockActive(editor, block);
    const listTypes = ['unordered-list', 'ordered-list'];
    const isList = listTypes.includes(block);

    Transforms.unwrapNodes(editor, {
        match: n => listTypes.includes(n.type),
        split: true
    });

    Transforms.setNodes(editor, {
        type: isActive ? 'paragraph' : isList ? 'list-item' : block
    });

    if (!isActive && isList) {
        const blockEl = { type: block, children: [] };
        Transforms.wrapNodes(editor, blockEl);
    }
};

export const deserialize = (encoded: string) => {
    const decoded = JSON.parse(decodeURIComponent(Buffer.from(encoded, 'base64').toString('utf8')));
    return decoded.document ? migrateFromPreSlate050(decoded.document) : decoded;
};

export const serialize = (decoded: any) => Buffer.from(JSON.stringify(decoded), 'utf8').toString('base64');

export const migrateFromPreSlate050 = (document: SlatePre050Document): Node[] => {
    const convertNode = (oldNode: SlatePre050Node): Node => ({
        ...(oldNode.text !== undefined ? { text: oldNode.text } : {}),
        ...(oldNode.type !== undefined ? { type: oldNode.type } : {}),
        ...(oldNode.nodes?.length ? { children: oldNode.nodes.map(convertNode) } : {}),
        ...oldNode.data,
        ...oldNode.marks?.reduce((acc, mark) => ({
            ...acc,
            [mark.type]: true
        }), {})
    } as Node);
    return document.nodes.map(convertNode);
};

//
//  LINKS
//

export const insertLink = (editor: Editor, url: string, text: string = url) => {
    if (editor.selection) {
        wrapLink(editor, url, text);
    }
}

export const isLinkActive = (editor: Editor) => {
    const [link] = Editor.nodes(editor, { match: n => n.type === 'link' });
    return !!link;
}

export const unwrapLink = (editor: Editor) => {
    Transforms.unwrapNodes(editor, { match: n => n.type === 'link' });
}

export const wrapLink = (editor: Editor, url: string, text: string = url) => {
    if (isLinkActive(editor)) {
        unwrapLink(editor);
    }

    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);
    const link = {
        type: 'link',
        href: url,
        children: isCollapsed ? [{ text }] : [],
    }

    if (isCollapsed) {
        Transforms.insertNodes(editor, link);
    } else {
        Transforms.wrapNodes(editor, link, { split: true });
        Transforms.collapse(editor, { edge: 'end' });
    }
}

export const withLinks = (editor: ReactEditor) => {
    const { insertData, insertText, isInline } = editor;

    editor.isInline = (element: Element) => {
        return element.type === 'link' ? true : isInline(element)
    }

    editor.insertText = (text: string) => {
        if (text && isUrl(text)) {
            wrapLink(editor, text);
        } else {
            insertText(text);
        }
    }

    editor.insertData = (data: DataTransfer) => {
        const text = data.getData('text/plain')

        if (text && isUrl(text)) {
            wrapLink(editor, text);
        } else {
            insertData(data);
        }
    }

    return editor
}

//
//  IMAGES
//

export const insertImage = (editor: Editor, url: string) => {
    const image = { type: 'image', src: url, children: [{ text: '' }] };
    Transforms.insertNodes(editor, image);
}

export const withImages = (editor: ReactEditor) => {
    const { isVoid, isInline } = editor;

    editor.isInline = (element: Element) => {
        return element.type === 'image' ? true : isInline(element)
    }

    editor.isVoid = (element: Element) => {
        return element.type === 'image' ? true : isVoid(element);
    }

    return editor;
}
