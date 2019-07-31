import React from 'react';
import { RenderMarkProps, Plugins, RenderBlockProps } from "slate-react";
import { Editor } from 'slate';
import Lists from '@convertkit/slate-lists';

export const plugins: Plugins = [Lists({
    blocks: {
        ordered_list: 'ordered-list',
        unordered_list: 'unordered-list',
        list_item: 'list-item',
    },
    classNames: {
        ordered_list: 'ordered-list',
        unordered_list: 'unordered-list',
        list_item: 'list-item'
    }
})]

export const renderMark = (props: RenderMarkProps, editor: Editor, next: () => any): any => {
    switch (props.mark.type) {
        case 'bold':
            return (
                <strong {...props.attributes}>{props.children}</strong>
            );
        case 'italic':
            return (
                <span {...props.attributes} style={{ fontStyle: 'italic' }}>{props.children}</span>
            );
        case 'underline':
            return (
                <span {...props.attributes} style={{ textDecoration: 'underline' }}>{props.children}</span>
            );
        default:
            return next();
    }
}

export const renderBlock = (props: RenderBlockProps, editor: Editor, next: () => any): any => {
    switch (props.node.type) {
        case 'unordered-list':
            return (
                <ul {...props.attributes} style={{ listStyle: 'disc', paddingLeft: '1em' }}>{props.children}</ul>
            );
        case 'ordered-list':
            return (
                <ol {...props.attributes} style={{ listStyle: 'decimal', paddingLeft: '1em' }}>{props.children}</ol>
            );
        case 'list-item':
            return (
                <li {...props.attributes} style={{ paddingLeft: '.5em' }}>{props.children}</li>
            );
        default:
            return next();
    }
}