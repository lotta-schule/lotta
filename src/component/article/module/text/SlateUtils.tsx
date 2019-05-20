import React from 'react';
import { RenderMarkProps } from "slate-react";
import { Editor } from 'slate';

export const renderMark = (props: RenderMarkProps, editor: Editor, next: () => any): any => {
    switch (props.mark.type) {
        case 'bold':
            return (
                <strong>{props.children}</strong>
            );
        case 'italic':
            return (
                <span style={{ fontStyle: 'italic' }}>{props.children}</span>
            );
        case 'underline':
            return (
                <span style={{ textDecoration: 'underline' }}>{props.children}</span>
            );
        default:
            return next();
    }
}