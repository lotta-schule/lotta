import * as React from 'react';

export const DragHandle: React.FC<React.HTMLProps<'svg'>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        width="1.5em"
        {...(props as any)}
    >
        <title>draggable</title>
        <path d="M2 11h16v2H2zm0-4h16v2H2zm8 11l3-3H7l3 3zm0-16L7 5h6l-3-3z" />
    </svg>
);
