import React, { CSSProperties, useCallback } from 'react';
import { Typography } from '@material-ui/core';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import Lists from '@convertkit/slate-lists';

export const plugins = [Lists({
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
})];

export const renderElement = useCallback(({ attributes, children, element }: RenderElementProps) => {
    switch (element.mark.type) {
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
            const src = attributes.ref.current.data.get('src');
            const imageUrl = `https://afdptjdxen.cloudimg.io/width/400/foil1/${src}`;
            return (
                <img
                    {...attributes}
                    src={imageUrl}
                    style={{ float: 'right', maxWidth: '30%' }}
                    alt={src}
                />
            );
        }
        case 'paragraph':
            return (
                <Typography variant={'body1'} component={'p'} {...attributes}>{children}</Typography>
            );
        case 'link':
            const href = attributes.ref.current.data.get('href');
            return (
                <a {...attributes} href={href} title={href} target={'_blank'} rel="noopener noreferrer">{children}</a>
            );
    }
}, []);

export const renderLeafe = useCallback(({ attributes, children, leaf }: RenderLeafProps) => {
    const customStyles: CSSProperties = {
        fontWeight: leaf.bold ? 'bold' : 'normal',
        fontStyle: leaf.italic ? 'italic' : 'normal',
        textDecoration: leaf.underline ? 'underline' : 'none',
    };
    return (
        <span {...attributes} style={customStyles}>
            {children}
        </span>
    );
}, []);