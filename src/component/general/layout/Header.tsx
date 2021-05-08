import React from 'react';
import './header.scss';

export const Header: React.FC = ({ children }) => {
    return <div className={'header'}>{children}</div>;
};
