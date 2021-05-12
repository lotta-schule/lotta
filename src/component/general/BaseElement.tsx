import * as React from 'react';

type HTMLType = keyof React.ReactHTML;

export type BaseElementProps<T extends HTMLType = any> = T extends HTMLType
    ? { as?: T } & React.HTMLProps<React.ReactHTML[T]>
    : never;

export const BaseElement = React.forwardRef<any, BaseElementProps<'div'>>(
    (p, ref) => {
        const { as = 'div', children, ...props } = p;
        return React.createElement(as, { ref, ...props }, children);
    }
);
