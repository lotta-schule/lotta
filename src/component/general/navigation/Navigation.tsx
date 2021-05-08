import { Menu } from '@material-ui/icons';
import React from 'react';
import './navigation.scss';

export interface NavigationProps {
  primaryButtons: any[];
  secondaryButtons?: any[];
}

export const Navigation: React.FC<NavigationProps> = ({
   primaryButtons,
   secondaryButtons
}) => {
  return (
    <nav className="lotta-navbar">
      <ul>
        {primaryButtons.map(button => (<li>{button}</li>))}
        <div className={'mobile-menu'}>
          <Menu />
        </div>
      </ul>
      {secondaryButtons?.length && (
        <ul className="secondary">
          {secondaryButtons.map(button => (<li>{button}</li>))}
        </ul>
      )}
    </nav>
  );
};
