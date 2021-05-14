import * as React from 'react';

type HTMLType = keyof React.ReactHTML;

type BaseElementDefaultProps<D extends HTMLType> = BaseElementHtmlProps<D>;

export type BaseElementHtmlProps<T extends HTMLType = any> = T extends HTMLType
    ? { as?: T } & React.HTMLProps<React.ReactHTML[T]>
    : never;

export type BaseElementReactComponentProps<
    T extends React.ComponentType = any
> = T extends React.ComponentType<infer P> ? { as?: T } & P : never;

export type BaseElementProps<D extends HTMLType> =
    | BaseElementDefaultProps<D>
    | BaseElementHtmlProps
    | BaseElementReactComponentProps;

export const BaseElement = React.forwardRef<any, BaseElementProps<'div'>>(
    (p, ref) => {
        const { as = 'div', children, ...props } = p;
        return React.createElement(as, { ref, ...props }, children);
    }
);
